# ベストプラクティスレビュー（インボックス一括）
日付: 2026-05-18
次回レビュー推奨: 2026-06-18 以降（インボックスに5件貯まったら）
ソース: manual 7件（docs/changelog）+ xmcp 4件（X/Twitter）
除外URL: なし（インジェクション検出0件・取得失敗0件）

---

## 要約

Anthropic 公式が大規模コードベース向け Claude Code ベストプラクティスを公式化（5層ハーネス構成）し、日本語 X でも広く注目された。Claude Code v2.1.139〜143 では Hook の拡張（terminalSequence 通知・exec form 安全実行）と /loop 操作性向上が進んでいる。音楽生成領域では ACE-Step に続き Khala 1.0 がオープンソースリリースされ、NOCTAの音楽制作選択肢が拡大している。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | R-09 Haiku 4.5 価格 | 「最安・200k」のみ | $1/$5 MTok を R-09 に追記（意思決定の定量根拠） | haiku-45-price-1-5-mtok |
| 高 | R-12 音楽生成選択肢 | ACE-Step 1.5 XL のみ | Khala 1.0 を追記（RTX 3090 動作確認後） | junmingong-khala-10-ace-step |
| 中 | Hook 完了通知 | denyリストのみ | terminalSequence で SVP/MIDI 生成完了のmacOS通知フックを追加候補 | v2141-hook-terminalsequence-field |
| 中 | Hook 安全性 | command 文字列形式 | 新規hook追加時は args exec form（配列形式）を推奨形式として採用 | v2139-hook-args-exec-form |
| 低 | スキルパス設計 | ~/.claude/commands/ のみ | root-level SKILL.md でプロジェクトローカルスキル分離を2曲目以降で検討 | v2142-root-skillmd-plugin-detection |
| 低 | /loop 操作 | CLAUDE.md記載なし | 「Esc/Ctrl+Cで pending wakeup キャンセル可能」をセッション運用セクションに追記 | v2143-loop-cancel-esc-ctrl-c |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| haiku-45-price-1-5-mtok | Haiku 4.5 $1/$5 MTok・R-09補完 |
| sonnet4-opus4-deprecated-2026-06-15 | 廃止 2026-06-15・NOCTA未使用 |
| v2142-fast-mode-opus47-default | /fast デフォルト Opus 4.6→4.7 |
| v2142-root-skillmd-plugin-detection | SKILL.md でローカルスキル検出 |
| v2141-hook-terminalsequence-field | Hookで通知・タイトル変更可能 |
| v2139-hook-args-exec-form | Hook args exec form セキュア化 |
| v2143-loop-cancel-esc-ctrl-c | /loop を Esc/Ctrl+C で停止可 |
| tak-narita-large-codebase-claude-code | 5層ハーネス構成が公式化 |
| claudecodeozi-free-claude-code-course | 4時間無料コース・学習順序参考 |
| junmingong-khala-10-ace-step | Khala 1.0 OSSリリース高エンゲ |
| aidailygems-mcp-unified-gateway | MCP先テスト→広域導入パターン |

---

## インスピレーションメモ

- **Hook terminalSequence** — SVP生成・MIDI出力完了を macOS 通知で受け取れる → 処理中に他作業ができ体験が快適になる（参照: v2141-hook-terminalsequence-field）
- **Khala 1.0** — ACE-Step と組み合わせてNOCTAサウンドのスタイルLoRA学習候補に → 音楽制作の自動化がさらに深まる（参照: junmingong-khala-10-ace-step）
- **root-level SKILL.md** — 楽曲プロジェクトごとに専用スキルセットを持つ設計が可能 → 楽曲単位のカスタマイズがスマートになる（参照: v2142-root-skillmd-plugin-detection）
- **MCP unified gateway** — GitHub のすべての MCP サーバーを1か所から探せる → 新しいMCPを試す際の調査コストが下がる（参照: aidailygems-mcp-unified-gateway）

---

## セキュリティ・安全性への影響

- Hook args exec form（v2.1.139）: 新規フック追加時にシェルインジェクションを防ぐ exec form が使える。現在の denyリスト中心のhook設計に直接影響なし。将来フックを追加する場合の推奨形式として記録する。

---

## 適用しない項目と理由

- **Sonnet 4 / Opus 4 廃止 2026-06-15**: NOCTA 未使用・2026-04-28 処理済みエントリの重複。
- **Anthropic 5層ハーネス構成**: CLAUDE.md の現行設計（CLAUDE.md→hooks→skills→plugins→MCP）がすでに対応済み。
- **MCP unified gateway の具体的ツール**: NOCTAのMCP管理方針（ツール総数80以下）と合致した考え方として記録するのみ。具体ツールの導入は要調査。
- **4時間無料コース**: NOCTA の設計はすでに上級者向けのため、直接的な学習用途としては不要。

---

## CEOが確認すべき事項

1. **R-09 Haiku 4.5 価格追記**: CLAUDE.md R-09 の「Haiku 4.5」の説明に `$1/$5 MTok` を追記するか確認（analytics-agent等のコスト判断根拠として有用）。
2. **R-12 Khala 1.0 追記**: RTX 3090 環境で Khala 1.0 の動作確認後、ACE-Step の代替選択肢として R-12 に追記するか確認。
3. **Fast mode の現状確認**: v2.1.142 で /fast デフォルトが Opus 4.7 に変更済み。/fast を使う場合は Opus 4.7 で動作することを認識する（CLAUDE.md 変更不要）。

---

*インジェクション検査: 実施済み（0件）| CLAUDE.md 自動変更なし | 全提案は CEO 確認後に適用*
