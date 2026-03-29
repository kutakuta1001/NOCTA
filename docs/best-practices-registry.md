# Claude Code ベストプラクティス・ドキュメントレジストリ

## 運用ルール
- 毎週月曜 9:00 JST に `/best-practices-review` が `pending` の先頭1件を処理する
- 処理後: `status` を `done` に変更し、`reviewed` と `findings` を記入してコミット
- CEO が手動で処理したい場合は `status` を `in-progress` にしてから実行
- `skip` は NOCTAの音楽制作ワークフローに無関係なもの（クラウドプロバイダー等）

---

## 優先度 高（Week 1〜10）

| # | ドキュメント | URL | status | reviewed | findings |
|---|---|---|---|---|---|
| 1 | Best Practices | https://code.claude.com/docs/en/best-practices.md | pending | - | - |
| 2 | Memory & CLAUDE.md | https://code.claude.com/docs/en/memory.md | pending | - | - |
| 3 | Hooks Guide | https://code.claude.com/docs/en/hooks-guide.md | pending | - | - |
| 4 | Hooks Reference | https://code.claude.com/docs/en/hooks.md | pending | - | - |
| 5 | Skills | https://code.claude.com/docs/en/skills.md | pending | - | - |
| 6 | Security | https://code.claude.com/docs/en/security.md | pending | - | - |
| 7 | Costs | https://code.claude.com/docs/en/costs.md | pending | - | - |
| 8 | Permissions | https://code.claude.com/docs/en/permissions.md | pending | - | - |
| 9 | Common Workflows | https://code.claude.com/docs/en/common-workflows.md | pending | - | - |
| 10 | Sub-agents | https://code.claude.com/docs/en/sub-agents.md | pending | - | - |

## 優先度 中（Week 11〜20）

| # | ドキュメント | URL | status | reviewed | findings |
|---|---|---|---|---|---|
| 11 | Agent Teams | https://code.claude.com/docs/en/agent-teams.md | pending | - | - |
| 12 | MCP Integration | https://code.claude.com/docs/en/mcp.md | pending | - | - |
| 13 | Settings Reference | https://code.claude.com/docs/en/settings.md | pending | - | - |
| 14 | Scheduled Tasks | https://code.claude.com/docs/en/scheduled-tasks.md | pending | - | - |
| 15 | Web Scheduled Tasks | https://code.claude.com/docs/en/web-scheduled-tasks.md | pending | - | - |
| 16 | Headless / SDK | https://code.claude.com/docs/en/headless.md | pending | - | - |
| 17 | Permission Modes | https://code.claude.com/docs/en/permission-modes.md | pending | - | - |
| 18 | Context Window | https://code.claude.com/docs/en/context-window.md | pending | - | - |
| 19 | How Claude Code Works | https://code.claude.com/docs/en/how-claude-code-works.md | pending | - | - |
| 20 | Checkpointing | https://code.claude.com/docs/en/checkpointing.md | pending | - | - |

## 優先度 中（Week 21〜30）

| # | ドキュメント | URL | status | reviewed | findings |
|---|---|---|---|---|---|
| 21 | GitHub Actions | https://code.claude.com/docs/en/github-actions.md | pending | - | - |
| 22 | Code Review | https://code.claude.com/docs/en/code-review.md | pending | - | - |
| 23 | Plugins | https://code.claude.com/docs/en/plugins.md | pending | - | - |
| 24 | Plugins Reference | https://code.claude.com/docs/en/plugins-reference.md | pending | - | - |
| 25 | Features Overview | https://code.claude.com/docs/en/features-overview.md | pending | - | - |
| 26 | CLI Reference | https://code.claude.com/docs/en/cli-reference.md | pending | - | - |
| 27 | Output Styles | https://code.claude.com/docs/en/output-styles.md | pending | - | - |
| 28 | Terminal Config | https://code.claude.com/docs/en/terminal-config.md | pending | - | - |
| 29 | Environment Variables | https://code.claude.com/docs/en/env-vars.md | pending | - | - |
| 30 | Fast Mode | https://code.claude.com/docs/en/fast-mode.md | pending | - | - |

## 優先度 低（Week 31〜）

| # | ドキュメント | URL | status | reviewed | findings |
|---|---|---|---|---|---|
| 31 | Changelog | https://code.claude.com/docs/en/changelog.md | pending | - | - |
| 32 | Slack Integration | https://code.claude.com/docs/en/slack.md | pending | - | - |
| 33 | VS Code | https://code.claude.com/docs/en/vs-code.md | pending | - | - |
| 34 | Desktop App | https://code.claude.com/docs/en/desktop.md | pending | - | - |
| 35 | Sandboxing | https://code.claude.com/docs/en/sandboxing.md | pending | - | - |
| 36 | Monitoring / OpenTelemetry | https://code.claude.com/docs/en/monitoring-usage.md | pending | - | - |
| 37 | Analytics | https://code.claude.com/docs/en/analytics.md | pending | - | - |
| 38 | Troubleshooting | https://code.claude.com/docs/en/troubleshooting.md | pending | - | - |

## PDFガイド（pdftotext または手動抽出が必要）

| # | ドキュメント | URL | status | reviewed | findings |
|---|---|---|---|---|---|
| P1 | The Complete Guide to Building Skills for Claude | https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf | pending | - | - |
| P2 | How Anthropic Teams Use Claude Code | https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf | pending | - | - |
| P3 | Claude Code Best Practices (Anthropic Engineering Blog) | https://www.anthropic.com/engineering/claude-code-best-practices | pending | - | - |

## スキップ（NOCTAワークフローに無関係）

| # | ドキュメント | 理由 |
|---|---|---|
| S1 | Amazon Bedrock | クラウドプロバイダー固有 |
| S2 | Google Vertex AI | クラウドプロバイダー固有 |
| S3 | Microsoft Foundry | クラウドプロバイダー固有 |
| S4 | LLM Gateway | エンタープライズ向け |
| S5 | Zero Data Retention | エンタープライズ向け |
| S6 | Server-managed Settings | エンタープライズ向け |
| S7 | Legal and Compliance | 法務担当向け |
