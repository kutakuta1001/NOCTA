---
description: "ベストプラクティス収集・レビューの週次ルーティンを確認して次のアクションをガイドするとき"
---

# Weekly Practice Check

ベストプラクティス収集・レビューの定期ルーティンを確認し、次にやるべきことをガイドしてください。

---

## Step 1: インボックスの現状を確認する

以下の2ファイルの「## 未処理」件数を確認する:
- `project_NOCTA/drafts/best-practices-inbox.md`
- `project_NOCTA/drafts/best-practices-inbox-xmcp.md`

---

## Step 2: 直近レポートの日付と model-lineup の更新日を確認する

以下を**並列で**確認する:
- `project_NOCTA/drafts/` 内の `best-practices-report-*.md` の最新ファイル名 → 前回ベストプラクティスレビュー日
- `~/.claude/references/model-lineup.md` の冒頭「最終更新」日付 → 前回モデルレビュー日
- `~/.claude/scripts/codex-review.sh version-check` を実行 → Codex CLI が npm 最新版に追随しているか
  （新モデルは新版の CLI を要求するため、古いままだと `/codex-review` の既定モデルが 400 で止まる）

---

## Step 3: 状況に応じてガイドする

以下の表に従って次のアクションを提示する:

| 状況 | 推奨アクション |
|------|--------------|
| 前回レビューから **7日以上** 経過 | フルルーティン（下記）をすべて実行 |
| 前回レビューから **3〜6日** 経過 | 収集のみ（Step A → B） |
| 前回レビューから **3日未満** | 「まだ早いです（X日前）」と表示して終了 |
| インボックス合計 **5件以上** | 日数に関わらず `/best-practices-review` を推奨 |
| model-lineup 最終更新から **30日以上** 経過 | 日数に関わらず Step E（/model-review）を推奨 |
| Codex CLI が npm 最新より **古い** | 日数に関わらず `npm install -g @openai/codex@latest` を推奨。更新後に Step E（/model-review）で新モデルの有無を確認する |

---

## フルルーティン（7日ごと・月曜推奨）

```
Step A: /x-practices-search
  → X からベストプラクティスツイートを収集（xmcp インボックスへ）

Step B: /claude-docs-review
  → Anthropic 公式ドキュメントの新情報をインボックスへ追加
  → 新モデル検出時は Step E を必ず実行する

Step C: /web-practices-review
  → Gemini Web検索でトレンドを収集・レポート生成

Step D: インボックスが5件以上なら /best-practices-review
  → 全エントリを一括レビュー・記事ノート作成・CLAUDE.md改善提案

Step E: /model-review（以下のいずれかに該当する場合に実行）
  → Step B で新モデル（Claude / GPT / Codex）が検出された
  → model-lineup.md の最終更新から30日以上経過
  → 変更なしの場合は即終了（追加コストなし）
  Claude と OpenAI（Codex）両方の最新情報を収集し model-lineup.md を更新する
```

## 収集のみ（3日ごと・火・金推奨）

```
Step A: /x-practices-search
Step B: /claude-docs-review
  → 新モデル検出時は /model-review も実行する（収集のみの場合も例外）
```

---

## Step 4: 結果を表示する

```
📋 Weekly Check
前回レビュー: YYYY-MM-DD（X日前）
モデルレビュー: YYYY-MM-DD（Y日前）
インボックス: manual X件 / xmcp Y件（合計 Z件）
Codex CLI: X.Y.Z（npm 最新 A.B.C）

▶ 推奨アクション:
  1. [次にやるべきスキル]
  2. [その次]
  ...

次回フルレビュー推奨日: YYYY-MM-DD（月曜）
次回モデルレビュー推奨日: YYYY-MM-DD（model-lineup 最終更新から30日後）
```

---

## IMPORTANT

- スキルを自動実行しない。推奨を表示してCEOに判断を委ねる
- CLAUDE.md・スキルファイルを自動変更しない
