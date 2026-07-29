# ベストプラクティスレビュー（インボックス一括）
日付: 2026-07-29
次回レビュー推奨: 2026-08-28 以降（インボックスに5件貯まったら）
ソース: 37件（manual 13件 / xmcp 24件・全件本文付きのため WebFetch なし。一覧は「記事ごとの主要ポイント」参照）
除外URL: なし（インジェクション検査 全37件パス・取得失敗 0件）

## 要約（3行以内）

今回の最大テーマは「Opus 5 リリースに伴うモデル世代交代」（manual 6件が関連・/model-review で対応済み）。次いで「Claude Code 運用のバックグラウンド化・安全ガード強化」（/code-review・context:fork・サブエージェント上限）と、Visual/Music 領域の制作系知見（ACE-Step UI 成長・Suno 著作権動向・カラー厳密指定・キャラ一貫性ワークフロー）。学習リソース系（認定資格・無料コース・学習パス）は運用への影響なしで記録のみ。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | CLAUDE.md G-01 / R-09 | Opus 4.8 が Critic 表記のまま | Opus 5 交代を反映（`/model claude-opus-5`・Fable 5 は GA 継続+深い推論第一候補）。model-lineup.md rev.6 反映済み・CLAUDE.md は CEO 承認待ち | claude-opus-5-release / cc-v2-1-219 |
| 中 | CLAUDE.md（スキル設計原則・Agent Teams 周辺） | 「サブエージェント最大5階層（v2.1.172）」の古い記載 | 「同時実行上限20・ネスト深さ3（v2.1.219）」に更新。あわせて context:fork スキルのデフォルトバックグラウンド化（同期実行には background: false）を一行追記 | cc-subagent-limits / cc-v2-1-218 |
| 中 | website 検証フロー | Playwright スクリプト主体 | 単発の表示確認・デバッグに Chrome 統合を試験導入（Playwright は回帰テスト用に維持） | chrome-integration-debug |
| 低 | copyright-agent / legal_check | Suno 規約確認は一般的記載のみ | Suno リーク・学習データ著作権動向の確認項目を legal_check テンプレに明記。ACE-Step ローカル生成への比重移行はリスクヘッジを兼ねる | suno-leak-copyright / ace-step-ui |
| 低 | /visual-prompt スキル | GPT Image 2 / Kling 前提 | Reve 2.1（生成前カラーピッカー）をブランドカラー厳密指定用途の生成先候補としてウォッチ | reve-2-1-color-selection |
| 低 | ~/designer パイプライン | uiverse 未登録 | /design-scout の偵察対象に uiverse を追加（エディトリアル路線に合う技法のみ抽出） | uiverse-ui-parts |

## 記事ごとの主要ポイント

| 記事（article-notes/2026-07-29-*） | 要点（30文字以内） |
|------|-----------------|
| cc-v2-1-215-verify-code-review-manual | /verify・/code-review が明示呼び出し制に |
| cc-v2-1-214-powershell-fix-endconversation | Windows 権限バイパス修正（mac影響なし） |
| cc-v2-1-212-fork-background-guards | /fork 分岐・検索/エージェント暴走ガード |
| opus-4-1-deprecation | Opus 4.1 は 8/5 廃止（NOCTA未使用） |
| sonnet5-effort-default-high | Sonnet 5 effort 既定 high（API/CC） |
| auto-memory-official | auto-memory が公式機能に |
| chrome-integration-debug | Chrome 統合でライブWebデバッグ |
| claude-opus-5-release | Opus 5 GA・同価格で 4.8 超え |
| fable5-ga-continues | Fable 5 GA 継続・終了想定は乖離 |
| cc-v2-1-219-opus5-default | CC の既定 Opus が 5 に切替 |
| cc-subagent-limits-nesting | サブエージェント上限20・ネスト3 |
| cc-v2-1-218-background-reviews | code-review/fork スキルが背景実行に |
| remote-control-slack-gitlab | Remote Control 等サーフェス拡充 |
| claude-code-study-deck-light940 | 全8パートの社内勉強会資料 |
| claude-howto-learning-path | 40K星・10モジュール学習パス |
| anthropic-13-free-courses | 公式無料13コース・修了証付き |
| claude-architect-certification | 60問・5領域の公式認定資格 |
| project-athena-knowledge-mgmt | ローカルMarkdownの永続メモリOSS |
| coding-ai-comparison-202607 | 主要コーディングAI 5種比較 |
| claude-code-router-k3 | ハーネス資産のモデル可搬性 |
| firefly-kling-gptimage-tutorial | Firefly+Kling3.0+GPT Image 2 制作例 |
| multi-model-creative-workflow | モデル役割分担のマルチAI制作 |
| ai-video-monetization-guide | AI動画の収益化入門（長編） |
| anime-short-workflow-curiousrefuge | キャラ一貫性先行のアニメ制作 |
| uiverse-ui-parts | コピペ可の無料UIパーツ集 |
| claude-code-style-sdk-any-llm | CC風ツール群を任意LLMで使うSDK |
| 26-claude-code-commands | 26コマンドの棚卸しリスト |
| claude-cheat-sheet | Claude用途マップの1枚画像 |
| tool-calling-vs-mcp | Tool CallingとMCPのレイヤー差 |
| techfeed-zenn-roundup | 安全装置を構造で作る等Zenn3本 |
| cinematic-lp-50min-workflow | シネマティックLPを50分$27で |
| higgsfield-mcp-agency-workflow | 映像MCPで制作を1チャット集約 |
| ace-step-ui-local-music | ACE-Step UI 4.4k星・ローカル生成 |
| ai-music-monetization-reality | AI音楽収益化の厳しい実態証言 |
| suno-leak-copyright | Sunoリークと学習データ著作権 |
| reve-2-1-color-selection | 生成前カラーピッカーで色厳密化 |
| frontend-design-process-first | 改善レバーはプロセス>プロンプト |

## インスピレーションメモ

- Chrome 統合 — HP・図鑑の表示崩れ調査を Claude が実ブラウザで直接できて楽になりそう（参照: code.claude.com/docs/ja/chrome）
- Reve 2.1 カラーピッカー — シルバー #B8B4AE × オフホワイト #E8E0D0 を正確に指定したブランドビジュアルが作れそう（参照: x.com/CuriousRefuge/...2080729）
- シネマティック LP 50分ワークフロー — 楽曲 LP・HiNa ページのスクロール演出を高速に試作できそう（参照: x.com/stellarprtcol/...2079869）
- キャラ一貫性先行ワークフロー — 銀猫のアニメーション展開（PV・HiNa 演出）が創造的になりそう（参照: x.com/CuriousRefuge/...2077936）
- Seedance 2.0 マルチショットモード — PV のシーン間一貫性を1パスで確保できるかも（参照: x.com/CaptainHaHaa/...2078059 関連）
- uiverse — 図鑑アプリのマイクロインタラクション探しが楽しくなりそう（参照: x.com/shiba_program/...2078042）
- チートシート1枚画像フォーマット — HiNa / NuWord の SNS 紹介画像に流用できそう（参照: x.com/hrswatigupta/...2081717）

## セキュリティ・安全性への影響

- v2.1.214 の Windows PowerShell 権限バイパス修正は macOS 運用の NOCTA に影響なし（ネイティブインストールは自動更新）
- v2.1.212 の Web検索200回・サブエージェント200個ガード、v2.1.217 の同時実行20上限は暴走対策の公式強化。NOCTA 側の設定変更は不要

## 適用しない理由がある項目

- claude-code-router（K3）・Claude Code 風 SDK: モデル乗り換え予定なし。「資産はハーネス側」という示唆のみ回収
- Project Athena: auto-memory + MEMORY.md + article-notes（Obsidian）で同等構成を運用済み
- Slack 連携・GitLab CI/CD: ソロ運用のため不要
- Claude Architect Certification・無料コース: 運用設定に影響なし（CEO の学習リソースとして任意）
- Higgsfield MCP 直接接続: R-04（外部生成ツールはプロンプト文書出力）と整合を取る必要があり、現状は見送り

## CEOが確認すべき事項

1. CLAUDE.md への Opus 5 反映（本日の /model-review 提案）を実施するか — 「CLAUDE.md を更新して」の指示で対応します
2. 次回 HP 作業時に Chrome 統合を試すか（Playwright との使い分け検証）
3. Suno 著作権動向を受けて、ACE-Step 1.5 XL の RTX 3090 動作確認（R-12 記載の保留タスク）の優先度を上げるか
