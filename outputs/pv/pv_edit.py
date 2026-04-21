"""
pv_edit.py — NOCTA PV FFmpeg 結合スクリプト
Codex レビュー指摘（2026-04-19）を修正済み

使い方:
  python3 pv_edit.py <clips_dir> <output_path> [--bgm <bgm_path>] [--fade <秒数>]

例:
  python3 pv_edit.py outputs/pv/clips outputs/pv/nocta_promo.mp4 --bgm outputs/midi/bgm.mp3 --fade 1.0
"""

import subprocess, json, os, sys, argparse, glob, shlex

TARGET_W   = 1280
TARGET_H   = 720
TARGET_FPS = 30
TARGET_FMT = "yuv420p"


def ffprobe(path):
    """クリップの実尺（秒）と音声ストリームの有無を返す"""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_streams", "-show_format", path
    ]
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.DEVNULL)
        info = json.loads(out)
        duration = float(info["format"]["duration"])
        has_audio = any(
            s.get("codec_type") == "audio" for s in info.get("streams", [])
        )
        return duration, has_audio
    except Exception as e:
        raise RuntimeError(f"ffprobe 失敗: {path}\n{e}")


def build_ffmpeg_command(clip_paths, bgm_path, output_path, fade_duration=1.0):
    """
    Codex 指摘 修正版:
      [1] n==1 エッジケース対応
      [2] 無音クリップに anullsrc を差し込む
      [3] xfade offset は ffprobe 実尺から計算
      [4] 音声も acrossfade でタイミングを揃える
      [5] 入力ごとに scale/fps/settb/format で正規化
    """
    if not clip_paths:
        raise ValueError("clip_paths が空です")

    # --- 実尺・音声有無を取得 ---
    clips = []
    for path in clip_paths:
        dur, has_audio = ffprobe(path)
        clips.append({"path": path, "dur": dur, "has_audio": has_audio})
        print(f"  [{os.path.basename(path)}] {dur:.2f}s  audio={'yes' if has_audio else 'NO'}")

    n = len(clips)
    bgm_idx = n  # BGM は映像クリップの直後のインデックス

    # --- -i 入力リスト ---
    inputs = []
    for c in clips:
        inputs += ["-i", c["path"]]
    if bgm_path:
        inputs += ["-i", bgm_path]

    filter_parts = []

    # --- [1] 映像正規化（scale / fps / settb / format）---
    # xfade は入力の解像度・fps・timebase が一致していないと失敗する
    for i, c in enumerate(clips):
        norm = (
            f"[{i}:v]"
            f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=decrease,"
            f"pad={TARGET_W}:{TARGET_H}:(ow-iw)/2:(oh-ih)/2,"
            f"fps={TARGET_FPS},"
            f"settb=AVTB,"
            f"format={TARGET_FMT}"
            f"[nv{i}]"
        )
        filter_parts.append(norm)

    # --- [2] 音声正規化（無音クリップは anullsrc で補完）---
    for i, c in enumerate(clips):
        if c["has_audio"]:
            filter_parts.append(
                f"[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo[na{i}]"
            )
        else:
            # Runway 出力は無音が多い → ダミーサイレンスを挿入
            filter_parts.append(
                f"anullsrc=channel_layout=stereo:sample_rate=44100"
                f",atrim=duration={c['dur']:.4f}[na{i}]"
            )

    # --- [3][5] 映像 xfade チェーン（offset は ffprobe 実尺から計算）---
    if n == 1:
        video_out = "[nv0]"
    else:
        prev_v = "[nv0]"
        cumulative = 0.0
        for i in range(1, n):
            cumulative += clips[i - 1]["dur"]
            # offset: 前クリップ終端より fade_duration 手前で開始
            offset = max(0.0, cumulative - fade_duration * i)
            tag = f"[xv{i}]"
            filter_parts.append(
                f"{prev_v}[nv{i}]"
                f"xfade=transition=fade:duration={fade_duration:.4f}:offset={offset:.4f}"
                f"{tag}"
            )
            prev_v = tag
        video_out = prev_v

    # --- [4] 音声 acrossfade チェーン（映像と同タイミングで重ねる）---
    if n == 1:
        audio_out = "[na0]"
    else:
        prev_a = "[na0]"
        for i in range(1, n):
            tag = f"[xa{i}]"
            filter_parts.append(
                f"{prev_a}[na{i}]acrossfade=d={fade_duration:.4f}{tag}"
            )
            prev_a = tag
        audio_out = prev_a

    # --- BGM ミックス ---
    if bgm_path:
        filter_parts.append(
            f"{audio_out}volume=1.0[va];"
            f"[{bgm_idx}:a]volume=0.3[ba];"
            f"[va][ba]amix=inputs=2:duration=first[outa]"
        )
        final_audio = "[outa]"
    else:
        final_audio = audio_out

    cmd = (
        ["ffmpeg", "-y"]
        + inputs
        + [
            "-filter_complex", ";".join(filter_parts),
            "-map", video_out,
            "-map", final_audio,
            "-c:v", "libx264", "-crf", "18", "-preset", "slow",
            "-c:a", "aac", "-b:a", "192k",
            output_path,
        ]
    )
    return cmd


def main():
    parser = argparse.ArgumentParser(description="NOCTA PV FFmpeg 結合")
    parser.add_argument("clips_dir",   help="クリップフォルダ (outputs/pv/clips/)")
    parser.add_argument("output_path", help="出力ファイル (outputs/pv/nocta_promo.mp4)")
    parser.add_argument("--bgm",  default=None, help="BGM ファイルパス")
    parser.add_argument("--fade", type=float, default=1.0, help="クロスフェード秒数 (default: 1.0)")
    args = parser.parse_args()

    # scene*.mp4 をソート順で取得
    pattern = os.path.join(args.clips_dir, "scene*.mp4")
    clip_paths = sorted(glob.glob(pattern))
    if not clip_paths:
        print(f"ERROR: {pattern} にクリップが見つかりません", file=sys.stderr)
        sys.exit(1)

    print(f"クリップ数: {len(clip_paths)}")
    print(f"BGM: {args.bgm or 'なし'}")
    print(f"フェード: {args.fade}s")
    print(f"出力: {args.output_path}")
    print()

    cmd = build_ffmpeg_command(clip_paths, args.bgm, args.output_path, args.fade)

    # 実行前に確認
    print("--- FFmpeg コマンド ---")
    print(" ".join(shlex.quote(c) for c in cmd))
    print()
    answer = input("実行しますか？ [y/N]: ").strip().lower()
    if answer != "y":
        print("キャンセルしました")
        sys.exit(0)

    result = subprocess.run(cmd)
    if result.returncode == 0:
        print(f"\n完成: {args.output_path}")
    else:
        print(f"\nERROR: FFmpeg が終了コード {result.returncode} で失敗しました", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
