# NOCTA ロードマップ

作成日: 2026-06-16（multi-domain 体制へ改訂）
更新方針: 各領域ストリームごとにタスクを管理。完了タスクは各領域内で末尾へ。フェーズ進行・承認ゲート通過時に更新。

---

## アイデンティティ（現状）

NOCTA は「楽曲制作会社」から **Music × Visual × Words × Code の複数領域クリエイティブスタジオ**へ発展した。
HP のタグラインとリブランド（多領域・遊び哲学「遊ぶことで人生を彩ろう」）がこの実態を表している。

**重要な前提**: 楽曲制作は「停滞」ではなく「CEO ペースで進む1ストリーム」。
他の領域（Apps・Visual・Words・Code）は楽曲の進捗に依存せず、独立して出力を続ける。
したがって本ロードマップは単一のボトルネックではなく、**並行する領域ストリーム**として管理する。

現在の出力規模:
- Music（Works）: 6件（NuWord=現行オリジナル / 他はポートフォリオ）
- Apps: 4本ライブ（NuWord still / Seed / Verse / inner canvas）
- Visual: 14作品（Works/Art/Music・NFT連動）
- Words: ブログ3記事 + HP/LP

---

## ストリーム別ロードマップ

### Code / Web（HP・基盤）— 最も活発

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| brand_assets.html / brandkit.html を現行パレットで再生成 | AI | 完了(2026-06-16) | 2ページを brandkit.html へ統合・multi-domain/単一シルバーで再生成。brand_assets.html 削除。要ブラウザ確認→push |
| デッドCSS（`.vocaloid-*` 等）除去 | AI | 完了(2026-06-16) | index.html から vocaloid/cute-underline/shimmer/star-float/dot-divider/vgreen-glow を除去。要push |
| `~/research/` を Obsidian Vault に追加 | CEO | 任意 | リサーチ蓄積の閲覧性向上 |
| 完了: NOCTA LP（猫モチーフ）・デザイン正本化・HP 英語対応 | — | 済 | 2026-06 |

### Apps（プロダクト）— 4本ライブ・収益化フェーズへ

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| NuWord still: Gumroad 商品作成・ライセンスキー発行設定 | CEO | 未実施 | SHA-256認証・keygen.html 同梱済み。最初の収益化ステップ |
| 瞑想BGM素材集（5トラック）→ 各アプリへの BGM 組み込み設計・実装（別Mac） | CEO/AI | 設計待ち | MP3 は `outputs/audio/meditation/`（gitignore対象） |
| 4アプリ（still/Seed/Verse/inner canvas）の継続改善・新機能 | CEO/AI | 随時 | 稼働中。利用フィードバックを起点に |

### Visual（AIアート・PV・NFT）

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| NOCTA Visual 01 PV | CEO/AI | ペンディング(2026-06-16) | Kling/Runway は品質不足で停止。代替の HTMLストーリーボード試作も「今は意味が薄い」と判断しペンディング。試作は drafts/pv-storyboard-html/ に保管（本番未反映）。設計: docs/superpowers/specs/2026-06-16-nocta-visual-01-storyboard-design.md |
| 新規ビジュアル作品の継続制作 → `/visual-add` で HP 反映 | CEO/AI | 随時 | 現在14作品 |

### Words（ブログ・文章）

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| ブログ記事の継続執筆 → `/blog-publish` | CEO/AI | 随時 | 現在3記事。多領域スタジオの発信チャネル |

### Music（楽曲）— CEO ペースの1ストリーム

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| NuWord ゲート⑤: SynthV で `vocal_draft.svp` を Render → 声の質感確認 | CEO | 一時停止（CEOペース） | 498ノート生成済み。`ニューワールド` Phoneme 要確認 |
| 通過後 → ゲート④ MIDIデモ → Studio One アレンジ確定 → フェーズ3（PV）以降 | CEO | 待ち | 楽曲は急がず、CEO の手が空いたときに進める |

---

## 横断的な意思決定（CEO 判断待ち）

| 論点 | メモ |
|---|---|
| Claude Design System 設定（個人 claude.ai か DOCOMO R&D 企業アカウントか） | 共有範囲の確認が必要 |
| 各領域の重み付け（次にどの領域に注力するか） | multi-domain ゆえ定期的に見直す。このロードマップで明示する |

---

## 継続運用（ルーティン）

| タスク | 頻度 | メモ |
|---|---|---|
| 週次ベストプラクティスルーティン（`/weekly-check`） | 3日/週1 | 直近 2026-06-15 完了 |
| 新モデルリリース時 `/model-review` | 随時 | 現状 Opus 4.8 が最上位 |

---

## バックログ（将来）

- 2曲目の着手判断（song/ ブランチ運用を開始する方針。NuWord に依存しない）
- ACE-Step 1.5 XL / Khala 1.0 / Mureka V9 のローカル・代替音源生成の品質比較（RTX 3090 環境）
- アプリの新規プロダクト企画（NuWord シリーズの拡張 or 新ライン）
- フィーチャーリスト構造化の導入（harness エンジニアリング知見より）

---

## 完了済み（直近）

- 2026-06-16: NOCTA LP 完成（猫ストーリーモチーフ）・footer/Contact コピー刷新（push済）
- 2026-06-15: DESIGN.md ライブ実態へ正本化・廃止カラー全クリーン・引き継ぎ書整備（push済）
- 2026-06-04: HP 全面リデザイン（EB Garamond・シルバー×オフホワイト）・frontend-design 統合
- 2026-04-30: HP 英語対応・NuWord still PWA 化・Gumroad ライセンスゲート実装・4アプリ HP 反映
- 2026-02〜03: NuWord フェーズ1〜2-C（トレンド分析・楽曲仕様書・歌詞A選択・SVP生成）
