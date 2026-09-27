# ベストプラクティスレビュー（インボックス一括）
日付: 2026-09-27
次回レビュー推奨: 2026-10-27 以降（インボックスに5件貯まったら）
ソース: manual 18件（CHANGELOG v2.1.262〜283・platform.claude.com モデル一覧・code.claude.com 概要 / ベストプラクティス / 動的ワークフロー）+ xmcp 11件（X 検索6クエリ・60件取得から選定）
除外URL: なし（インジェクション検出0件。X 検索では低エンゲージ38件・広告キャンペーン3件（Pollo MCP 同文）・個人的つぶやき5件・汎用リスト3件を選定段階で除外）

## 収集の取りこぼし

| 項目 | 収集回数 | CLAUDE.md 反映 | 扱い |
|---|---|---|---|
| `/doctor prompt-audit`（CLAUDE.md・スキル・エージェントの記法監査） | 2回目（2026-08-05 に `claude-api` スキル版） | 未反映・未実行 | 優先度を中→高に上げた |
| Suno の条件変更（09-06 ダウンロード上限課金 → 09-27 V6 以前の全モデル廃止） | 2週連続 | R-13 未反映 | 優先度を中→高に上げた |
| auto mode（09-06 は `-p` 時の中止条件、今回は既定モード化） | 2回目 | 未反映 | 中のまま。試験前提 |
| 動的ワークフローの規模目安（08-05 は unrestricted / 15、今回は medium / 10） | 2回目 | COST POLICY に数値なし | 中。値が変わったので再収集は妥当 |
| プロンプトキャッシュ読取率（09-06「他は10%」→ Opus 5.5 は5%） | 訂正 | model-lineup.md に反映対象 | /model-review で扱う |
| Claude 公式18コース（09-06 別ツイート） | 2回目 | 反映不要（学習リソース） | チートシートに1行リンクを置いて再収集を止める |

## 要約（3行以内）

Claude Opus 5.5（$4/$20・1M・カットオフ2026年6月・既定 effort medium）が登場し Opus 5 が Legacy に移った。R-09 の批評既定と model-lineup.md の更新が今回の最大論点で、同時に「effort をモデル別に保存する」変更により G-01 の「標準は high」が自動では効かなくなった。
Claude Code 側は deny 迂回修正3件（symlink / tee / eval）で R-02 の防御が強化され、`omitClaudeMd`・`syncClaudeAiSkills` でサブエージェントと同期スキルの常時ロードを削る手段が揃った。
X 側は Suno の V6 以前モデル廃止（Warner 和解）が R-13 の前提を2週連続で動かしており、画像生成は「GPT Image → Midjourney リファレンス」「gpt-image 2.5 + nanobanana」「Qwen-Image 細粒度」の組み合わせ型が主流になっている。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | R-09・AGENTS 節・`model-lineup.md`・`claude-config/agents/*` | 批評・SVP 生成・承認ゲート直前レビューは Opus 5（$5/$25・既定 effort high） | Opus 5.5（$4/$20・カットオフ2026年6月）へ切替を検討。既定 effort が medium のため、切替時は批評系3エージェント（lyric-critic / concept-critic / svp-generator）の定義に `effort: high` を明記する。判断は `/model-review`（本日実行・CEO 回答待ち） | changelog-2-1-280-opus-5-5-added / models-opus-5-5-spec-recommendation / models-opus-5-5-default-effort-medium |
| 高 | G-01・スキル frontmatter | `/effort` の手動切替を前提に「標準は high」 | `/effort` がモデル別保存になり新モデルは既定値で始まる。批評・レビュー系スキル（`/codex-review` 以外の Claude 側レビュー）に `effort:` frontmatter を書き、手動切替への依存を減らす | changelog-2-1-280-default-model-per-model-effort |
| 高 | R-13・copyright-agent | 「Suno の mp3 を LALAL.AI で分離して素材に使う」 | Suno が V6 以前の全モデルを廃止し、ライセンス済みモデルへ移行した。旧モデルで生成済み素材の扱いと V6 以降の利用規約を一次情報で確認する項目を copyright-agent のチェックリストに追加する。**2週連続の収集で未反映のため優先度を上げた** | x-suno-retires-pre-v6-models |
| 高 | スキル設計節（6ヶ月見直し・次回 2027-02） | 剪定判断は主観。`/skill-doctor` は前回提案・未実行 | `/doctor prompt-audit` と `/skill-doctor` を一度実行して結果を `drafts/` に保存し、2027-02 見直しの入力にする。**2回目の収集で未実行のため優先度を上げた** | changelog-2-1-283-doctor-prompt-audit |
| 中 | `claude-config/agents/`（reviewer 6体・designer 3体・director 3体） | 全エージェントが CLAUDE.md 3層を読む | 役割が閉じた12体に `omitClaudeMd: true` を付け、必要な禁止事項（R-02 / R-03 / R-04）は各定義に明記する。1体あたり数千トークンの削減 | changelog-2-1-271-omitclaudemd |
| 中 | `~/.claude/settings.json`・G-07 | claude.ai 同期スキル（docx / pptx / xlsx / pdf 等）が全セッションに載る | `syncClaudeAiSkills: false` を置くか、claude.ai 側で不要スキルを無効にする。決定は CEO（設定変更は `/update-config`） | changelog-2-1-275-claude-ai-skill-sync |
| 中 | COST POLICY「動的ワークフロー」 | 規模・実行条件の記載なし | 「規模は10エージェント未満で見積もる」「使用制限で止まらないよう対話セッションで回す（`-p` / バックグラウンドは失敗扱い）」を2行追加する | workflows-size-guideline-change / workflows-usage-limit-pause |
| 中 | R-14 `/brainstorm` | 合意は handoff.md に1〜3行 | 大きなフェーズ（②楽曲仕様書・⑥PV コンセプト）では合意を `docs/superpowers/specs/` に SPEC 形式（関連ファイル・スコープ外・E2E 検証手順）で残し、新セッションで実装する公式パターンに揃える | best-practices-interview-spec |
| 低 | visual-prompter・`nocta-tools.md` | GPT Image 2 / Kling 向けの単一プロンプト | (1) GPT Image → Midjourney 画像リファレンスの2段型、(2) 軽量モデルで下絵 → 高品質モデルで仕上げ（gpt-image 2.5 + nanobanana2 lite）、(3) Qwen-Image-2.1 向け細粒度版を選択肢として併記する | x-midjourney-gpt-image-reference-workflow / x-gpt-image-2-5-nanobanana-combo-tips / x-qwen-image-2-1-vs-gpt-image-2 |
| 低 | HP Works・press-release-writer | 人間向け SNS / PR 文のみ | AI 生成検索（GEO）とエージェント型プレイリスト向けに、楽曲メタデータ（BPM・キー・ジャンル・制作ツール）を機械可読で Works ページに置く | x-music-industry-2026-2027-trends |
| 低 | permissions（bypassPermissions） | user settings で bypass 固定 | auto mode（分類器が危険操作だけ止める）へ下げる試験。xmcp / FFmpeg / `git commit` が分類器に止められないかを1セッション試してから判断 | best-practices-auto-mode-default |
| 低 | COST POLICY | Plan Mode / Subagent / Agent Teams / 動的ワークフローの4択 | 「同じ編集を多数ファイルに」は `/batch`（5〜30サブエージェント・worktree）を第5の選択肢として記載する。project_NOCTA/ 内限定 | best-practices-batch-command |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| github.com/.../changelog-2-1-280-opus-5-5-added | Opus 5.5 追加・既定 Opus・$4/$20 |
| github.com/.../changelog-2-1-280-default-model-per-model-effort | 既定 Opus 化・effort はモデル別保存 |
| github.com/.../changelog-2-1-283-doctor-prompt-audit | 設定全体の記法監査コマンド |
| github.com/.../changelog-2-1-280-deny-bypass-fixes | symlink / tee / eval の deny 迂回修正 |
| github.com/.../changelog-2-1-271-omitclaudemd | サブエージェントを CLAUDE.md なしで起動 |
| github.com/.../changelog-2-1-275-claude-ai-skill-sync | claude.ai スキル同期・opt-out 可 |
| platform.claude.com/.../models-opus-5-5-spec-recommendation | 1M・128k・カットオフ6月・公式推奨 |
| platform.claude.com/.../models-opus-5-legacy-lineup | Opus 5 が Legacy・現行4本 |
| platform.claude.com/.../models-opus-5-5-default-effort-medium | Opus 5.5 だけ既定 effort medium |
| platform.claude.com/.../models-cache-read-tiers | キャッシュ読取 2.5% / 5% / 10% |
| code.claude.com/.../overview-desktop-teleport-dispatch | /desktop・teleport・Dispatch |
| code.claude.com/.../overview-claude-agents-view | エージェントビュー・Agent Teams は実験的 |
| code.claude.com/.../best-practices-auto-mode-default | auto mode が有料プランの既定 |
| code.claude.com/.../best-practices-interview-spec | インタビュー → SPEC.md → 新セッション |
| code.claude.com/.../best-practices-batch-command | /batch で5〜30分割・worktree |
| code.claude.com/.../workflows-size-guideline-change | medium 10未満・Pro は small |
| code.claude.com/.../workflows-usage-limit-pause | 使用制限で一時停止・自動再開 |
| code.claude.com/.../workflows-fanout-prompt-cache | 同構成エージェントでキャッシュ共有 |
| x.com/claudecode84 | Obsidian で第2の脳（宣伝色強） |
| x.com/abir35627 | 公式18コース無料（2回目） |
| x.com/peesamac | Claude Code Templates カタログ |
| x.com/TaoRInne | GPT Image → Midjourney 参照の2段 |
| x.com/r0ck3t23 | Suno V6 以前廃止・Warner 和解 |
| x.com/BusyWorksBeats | Suno vs Spotify・GEO・予測PL |
| x.com/tea_story_hoshi | gpt-image 2.5 + nanobanana 併用 |
| x.com/shiba_program | 21st.dev の動く UI 部品 |
| x.com/DanKornas | ソロゲーム開発テンプレ |
| x.com/hAru_mAki_ch | FreeCAD MCP で画像→CAD→動画 |
| x.com/mu_sette | Qwen-Image は細粒度指示が通る |

## インスピレーションメモ

- Dispatch — Studio One 操作中に電話から「歌詞 B 案の音節数を再計算」のような短い依頼を投げ、あとでデスクトップで受け取れそう（参照: code.claude.com/docs/ja/overview）
- FreeCAD MCP × Claude Code — コンセプト画像 → 構造化データ → 映像の多段パイプラインは PV 制作と相似形。メイキング過程をそのまま SNS ネタにできそう（参照: x.com/hAru_mAki_ch）
- 21st.dev — HP の Works カードや Visual ギャラリーの演出参照元。`/design-scout` → `/design-extract` の流れに乗せると楽しくなりそう（参照: x.com/shiba_program）
- Claude Code Game Studios — 「1人 + エージェント群」のフェーズ構造テンプレ。Tools 領域（アプリ開発）のフェーズ設計を作るときの比較対象（参照: x.com/DanKornas）
- Obsidian 第2の脳 — article-notes に `related:` リンクと R-xx への逆リンクを足せば、蓄積が「引ける知識」になりそう（参照: x.com/claudecode84）
- エージェント型プレイリスト / GEO — 楽曲のメタデータを機械可読にするだけで、人手の SNS 運用と別の到達経路が開きそう（参照: x.com/BusyWorksBeats）
- `claude agents` エージェントビュー — Agent Teams（実験的・既定オフ）の代わりに、フェーズ2 / 4 の並列作業を1画面で見る運用が楽になりそう（参照: code.claude.com/docs/ja/overview）

## セキュリティ・安全性への影響

- deny ルール迂回の修正3件（v2.1.268 / 269 / 280）で R-02 の deny 側防御が強化された。approved-guard hook との二重防御は維持。
- 本日、記事ノート生成の Bash 実行が approved-guard hook に止められた。ノート本文に保護対象フォルダのパス文字列が含まれていたためで、書き込み先は `drafts/` だった。hook はコマンド文字列全体を見るため、本文中の言及にも反応する。誤検知の頻度は低いが、ノートやレポートで保護対象を書くときは言い換える運用にした。hook のマッチ条件を「書き込み系コマンド + パス」に絞る変更は CEO 確認事項。
- 同期スキル（`anthropic-skills:*`）は claude.ai 側の有効化で勝手に増える。G-07 の観点で棚卸し対象。
- Claude Code Templates の「1行インストール」は collection-common のシェル破壊系パターンに該当しうる。導入するならスクリプト本文を読んでから。

## 適用しない理由がある項目

- `/desktop` / `claude --teleport`: NOCTA の承認ゲートは対話セッションで CEO が判断する前提のため、サーフェス移動は補助用途に限る。
- Pollo MCP（画像・動画・音声を Claude 内で生成する MCP）: 同文の広告3件のため除外。R-04「外部生成ツールはプロンプト文書として出力する」とも方針が異なる。ツールの存在は `nocta-tools.md` の候補として記録するに留める。
- 音楽業界トレンドの「Suno vs Spotify 競争」部分: 配信戦略はフェーズ4以降・リリース実績後に扱う。
- Claude 公式18コース: 学習リソースであり CLAUDE.md 反映対象外。再収集防止のためチートシートに1行リンクのみ。
- `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` / `CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS`: 現状の運用で問題が出ていないため既定値のまま。

## CEOが確認すべき事項

1. Opus 5 → Opus 5.5 の切替（R-09・AGENTS・model-lineup.md）。`/model-review` の議論サマリに回答してください。effort: high の明記を伴う。
2. `/doctor prompt-audit` と `/skill-doctor` の実行可否。2回目の収集で未実行のため、実行しないなら理由をチートシートに残して再収集を止めたい。
3. Suno の V6 以前モデル廃止について、一次情報（Suno 公式アナウンス・利用規約）の確認を copyright-agent に任せるか CEO が直接確認するか。
4. `omitClaudeMd` を付けるエージェントの範囲（reviewer / designer / director の12体案）。
5. `syncClaudeAiSkills: false` を置くか（設定変更は `/update-config` 経由）。
6. approved-guard hook の誤検知（本文中のパス文字列に反応）を許容するか、マッチ条件を絞るか。hooks の変更になる。
7. 本日のコミット（Web レビュー・本レビュー）は push していない。main への push は本番デプロイを起動するため、CEO の明示指示で行う。
