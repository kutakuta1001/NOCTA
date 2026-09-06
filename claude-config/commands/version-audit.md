---
description: "月次でツール群のバージョン追随を点検するとき（Claude Code / Codex CLI / npm グローバル / Homebrew / GitHub Actions）"
---

# Version Audit — 月次バージョン追随チェック

手元のツールが最新に追随できているかを5系統まとめて点検し、更新の推奨を出す。
**更新は実行しない。** 判断は CEO に委ねる（破壊的変更が入りうるため）。

## なぜ独立スキルなのか

2026-09-06 に取りこぼしが2件同時に発覚した。

- Codex CLI が 0.144.6 のまま9バージョン遅れ、`gpt-6-astra` が 400 で拒否されていた
- GitHub Actions の4つの action が Node.js 20 非推奨のまま Node.js 24 で強制実行されていた

どちらも検知手段が「CEO が気づく」だけだった。個別に検知機構を足すより1本にまとめる方が漏れにくい。
`/weekly-check` に足さないのは、ツールのバージョンは週単位では動かず、週次では警告が形骸化するため。

---

## Step 0: 前回実行日を確認する

`~/.claude/references/version-audit-log.md` を Read し、最終行の日付を見る。

| 経過 | 動作 |
|---|---|
| **30日未満** | 「まだ早いです（前回 YYYY-MM-DD・X日前）」と表示して終了 |
| **30日以上** | Step 1 へ進む |
| ログが空 | Step 1 へ進む |

CEO が「今すぐ見たい」と明示した場合は経過日数を無視して実行する。

---

## Step 1: 5系統を確認する

**並列で**実行する。Homebrew は auto-update が走ると数分かかるため、タイムアウトを長めに取る。

### A. Claude Code

```bash
claude --version
type -a claude
curl -sL -m 20 https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md | sed -n '3p'
```

- native install（`~/.local/bin/claude` → `~/.local/share/claude/versions/`）は**バックグラウンドで自動更新される**ため、通常は最新
- ただし `/Applications/cmux.app/Contents/Resources/bin/claude` が PATH 上で先に来ている。
  両者のバージョンが乖離したら cmux 側が古い可能性を疑う（2026-09-06 時点では両方 2.1.261 で一致）
- CHANGELOG の3行目が最新バージョン見出し（`## 2.1.261` 形式）

### B. Codex CLI

```bash
~/.claude/scripts/codex-review.sh version-check
```

既存のバージョン検知機構をそのまま使う（キャッシュを無視して npm へ照会する）。
**自動更新されない。** 新モデルは新しい CLI を要求するため、遅れると `/codex-review` の既定モデルが 400 で止まる。

### C. npm グローバル

```bash
npm outdated -g --depth=0
```

Codex CLI（`@openai/codex`）もここに出る。B と重複するが、他のグローバルパッケージを拾うために両方見る。

### D. Homebrew

```bash
brew outdated ffmpeg
brew list --versions ffmpeg
brew outdated --quiet | wc -l
```

**`ffmpeg` は特別扱いする。** `outputs/pv/pv_edit.py` が FFmpeg の CLI に依存しているため、
メジャーバージョンが上がるとオプションの互換性が壊れる可能性がある。
brew は `ffmpeg@8` のようなバージョン固定 formula も提供しているため、
メジャー更新を避けたい場合はそちらへ切り替える選択肢がある。

### E. GitHub Actions

```bash
gh pr list --author "app/dependabot" --state open --limit 10
gh run list --limit 1
```

Dependabot（`.github/dependabot.yml`・月次）が action の新バージョンで PR を立てる。
あわせて直近 run の警告も見る:

```bash
gh run view <run-id> 2>&1 | grep -iA3 "ANNOTATION"
```

Dependabot が拾えない警告（Node.js 非推奨など）はここに出る。

---

## Step 2: 判定して推奨を出す

| 状況 | 推奨アクション |
|---|---|
| Claude Code が CHANGELOG より古い | 自動更新の失敗を疑う。`claude --version` と `type -a claude` の乖離を確認 |
| Codex CLI が npm 最新より古い | `npm install -g @openai/codex@latest` を推奨。更新後は `/model-review` で新モデルの有無を確認 |
| npm グローバルに outdated あり | パッケージごとに更新可否を提示（用途不明のものは放置を推奨） |
| **ffmpeg のメジャーが上がっている** | **更新前に `pv_edit.py` の動作確認を推奨。** 現行メジャーを維持するなら `ffmpeg@<N>` への切り替えを提案 |
| ffmpeg のマイナー/パッチのみ | `brew upgrade ffmpeg` を推奨 |
| brew outdated が20件以上 | 一括更新は勧めない。NOCTA が実際に使うもの（ffmpeg・node・python 等）に絞って提示 |
| Dependabot PR が開いている | 各 PR の破壊的変更をリリースノートで確認してからマージすることを推奨（自動マージしない方針） |
| Actions run に警告がある | 警告内容を要約し、該当 action の更新を提案 |

---

## Step 3: 結果を表示する

```
バージョン追随チェック（YYYY-MM-DD）
前回: YYYY-MM-DD（X日前）

| 対象 | 現在 | 最新 | 判定 |
|---|---|---|---|
| Claude Code | 2.1.xxx | 2.1.xxx | 追随済み（自動更新） |
| Codex CLI | 0.xxx.x | 0.xxx.x | 要更新 / 追随済み |
| npm グローバル | — | — | outdated N件 |
| Homebrew | — | — | outdated N件（うち ffmpeg: 状況） |
| GitHub Actions | — | — | Dependabot PR N件 / 警告 N件 |

推奨アクション:
  1. [優先度の高いもの]
  2. ...

次回推奨日: YYYY-MM-DD（30日後）
```

---

## Step 4: ログに追記する

`~/.claude/references/version-audit-log.md` の末尾に1行追記する。

```
- YYYY-MM-DD: [要更新だったもの / なければ「全系統追随済み」] （対応: [実施したもの / 未対応]）
```

CEO が更新を実行した場合は、その旨も同じ行に含める。

---

## IMPORTANT（制約）

- **更新コマンドを自動実行しない。** 推奨を表示して CEO の判断を待つ
- CEO が「更新して」と指示した場合のみ実行する。その際も **ffmpeg のメジャー更新は `pv_edit.py` の確認を先に提案する**
- `brew upgrade`（引数なしの全件更新）は提案しない。対象を個別指定する
- CLAUDE.md・スキルファイルを自動変更しない
- `git push` を行わない

## Gotchas

- `brew outdated` は auto-update が走ると portable-ruby のダウンロードまで発生して数分かかる。
  急ぐときは `HOMEBREW_NO_AUTO_UPDATE=1` を付けるが、その場合はリポジトリ情報が古いままなので月次点検では付けない
- `npm outdated -g` は終了コード1を返すことがある（outdated があるとき）。エラーではない
- Claude Code の native install は自動更新されるため、ここが古い場合は更新機構自体の異常を意味する
- **Dependabot は `dependabot.yml` を追加した時点で初回スキャンを走らせる**（2026-09-06 実測: push 後5秒以内に
  `Dependabot Updates` が起動し33秒で完了）。以降は設定した月次スケジュールで動く。
  **PR が0件なのは「更新対象なし」という正常な結果**であり、動いていないことを意味しない。
  実際に動いたかは `gh run list` の `Dependabot Updates` で確認する（`gh pr list` だけでは判別できない）
- Dependabot の脆弱性アラート（`dependabot/alerts` API）はこのリポジトリでは無効。
  version updates とは別機能で、NOCTA は npm/pip の依存を持たない静的サイトのため有効化の必要はない
