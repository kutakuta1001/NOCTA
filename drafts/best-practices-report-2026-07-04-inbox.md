# ベストプラクティスレビュー（インボックス一括）
日付: 2026-07-04
次回レビュー推奨: 2026-08-03以降（インボックスに5件貯まったら）
ソース: 本文インライン形式20件（manual: changelog由来8件・xmcp: Xツイート12件。WebFetch不要のため取得成功/失敗の区別なし）
除外URL: なし（インジェクション検査を全20件で実施し危険パターン検出なし）

## 要約（3行以内）

Hooksの「決定論的実行」を活かせていない点（R-02/R-03が助言的ルールのみ）が今回最大の発見。
GPT Image 2 × Seedance 2.0の段階的ワークフロー（キャラ一貫性確保）はvisual-prompterスキルにそのまま転用できる。
Suno indie incubatorの契約条項（宣伝義務・批判禁止）はR-13運用上のリスクとして認識しておく必要がある。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | R-02（approved/保護）・R-03（SNS自動投稿禁止） | CLAUDE.md記述による助言的ルールのみ（モデルの自覚に依存） | PreToolUseフックでapproved/への書き込み・SNS投稿系コマンドを技術的にブロックする決定論的ガードレールの追加を検討 | sitinme, kento_720 |
| 中 | visual-prompterスキル | GPT Image 2/Runway/Kling向けプロンプト生成（現状汎用） | MJ→GPT Image2→Seedance2.0の段階的ワークフロー（キャラ一貫性確保）とプロンプト構成要素（アスペクト比・キャラ数・シチュエーション明示）を参考パターンとして追加 | Mayz1169, Gdgtify |
| 低 | analytics-agent / HP KPIダッシュボード | KPI設計はテキストベース（drafts/kpi.md） | 公式 `/dataviz` スキル（カラーパレット検証付きチャート生成）をKPIダッシュボード・ブランドカラー検証に活用検討 | changelog v2.1.198 |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| changelog/v2.1.200-permission-manual-mode | デフォルト権限がManualに変更 |
| changelog/v2.1.198-subagents-background | サブエージェントが標準で非ブロッキング化 |
| changelog/v2.1.199-skill-stacking | スキル連結呼び出しで先頭5つロード可 |
| changelog/v2.1.196-mcp-untrusted-workspace | 自己承認MCPがuntrusted環境で起動せず |
| changelog/v2.1.196-subagent-thinking-inherit | サブエージェントが思考設定を継承 |
| changelog/v2.1.198-dataviz-skill | /dataviz スキル追加 |
| changelog/v2.1.198-explore-agent-model-inherit | Exploreがメインモデルを継承(opus上限) |
| changelog/v2.1.200-askuserquestion-autocontinue | auto-continueがデフォルト無効に |
| x.com/0xwhrrari-claude-code-settings-workflows | 見落とし設定30選（bookmark218） |
| x.com/ai-caffeine-claude-md-layered-config | CLAUDE.md/settings/rulesの層分け |
| x.com/sitinme-claude-code-hooks-discipline | Hooks=規律、CLAUDE.md=助言 |
| x.com/itsalexvacca-gtm-stack-claude-code | 営業がGTM全体をClaude Codeで運用 |
| x.com/anandbutani-claude-code-power-features | Git worktreesで4-8並列エージェント |
| x.com/chroniki-ai-claude-code-untapped-potential | 素のインストールは実力の一部のみ |
| x.com/kento720-claude-code-terminology-map | 用語習得順序マップ(5層) |
| x.com/shu10038-claude-code-claudemd-skills-mcp | Headroom圧縮ツール・ハーネス比較 |
| x.com/stereogum-suno-indie-incubator | Suno契約に批判禁止条項 |
| x.com/thetripathi58-seedance2-cost-comparison | Seedance2.0実行ルートのコスト比較 |
| x.com/mayz1169-mj-gptimage-seedance-workflow | MJ→GPT Image2→Seedance2.0手順 |
| x.com/gdgtify-gptimage2-action-still-workflow | GPT Image2アクション静止画プロンプト |

## インスピレーションメモ

- Git worktrees並列エージェント — 将来Visual/Words/Codeの複数ストリームを本当に同時並列で進めたくなった時の実行パターン（参照: x.com/AnandButani/...）
- Headroom（コンテキスト圧縮ツール） — /compact運用を補完し、長時間セッションでの手動圧縮頻度を減らせるかもしれない（参照: x.com/SHU10038/...)
- GTMスタック統合の発想 — 複数外部SaaS連携をskills+hooksで束ねる設計は、phase4-releaseの著作権/SNS/PR/KPI並列処理の設計思想と共通する（参照: x.com/itsalexvacca/...）

## セキュリティ・安全性への影響

- v2.1.196: 自己承認MCPサーバがuntrusted workspaceで起動しなくなるセキュリティ強化。NOCTAは信頼済みワークスペース運用のため直接影響は小さいが、認識事項として記録。
- v2.1.200: デフォルト権限モードがManualに変更。NOCTAのbypassPermissions運用（[[feedback_dontask_mode]]）が上書きされないか確認が必要。

## 適用しない理由がある項目

- **CLAUDE.mdの行数削減（60行目安論）**: 一部の海外記事・ツイートで言及されがちな一般論だが、NOCTAは意図的に詳細なルール群（R-01〜R-15・AGENTS・APPROVAL GATES）を保持する方針。段階的開示（スキル分離）は既に実践済みのため不採用。
- **Git worktreesの本格導入**: CEOは1人で複数タスクを同時監視する必要が薄く、現行の「1曲=1ブランチ」切替運用（song-switch）で十分。インスピレーションメモに留める。

## CEOが確認すべき事項

1. **[要注意]** Suno「indie incubator」の契約条項（宣伝義務・批判禁止）— R-13でSuno素材を活用する運用に将来的なリスクがないか認識しておく（現状インキュベーター参加はしていない前提）
2. **[要確認]** v2.1.200でデフォルト権限モードが"Manual"に変更 — NOCTAのbypassPermissions設定が上書きされていないか、次回起動時に`/config`で確認
3. **[要確認]** v2.1.198でサブエージェントがデフォルトでバックグラウンド実行に — 次回`/phase2-music`または`/phase4-release`実行時にAgent Teamsの完了検知・進捗表示の挙動が変わっていないか確認
4. **[提案・判断待ち]** R-02/R-03をhooks化するか（PreToolUseで`approved/`書き込み・SNS投稿系コマンドを技術的にブロック）— 実装にはhooks設計・テストの追加作業が発生するため、優先度と実施タイミングをCEOが判断
