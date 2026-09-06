# NOCTA 運用チートシート

CLAUDE.md から分離した参照情報。常時ロードされないので、必要になったときだけ読む。
最終更新: 2026-08-05

---

## スラッシュコマンド

### 定型（状態確認・軽量・数秒〜数分）

| コマンド | 動作 |
|---|---|
| `/music-status` | プロジェクト状況確認 |
| `/design-status` | デザイン・ビジュアル制作の進捗確認 |
| `/music-reset-context` | コンテキスト節約再開 |
| `/song-list` | 全曲フェーズ一覧 |
| `/song-switch [曲名]` | ブランチ切替 |
| `/simplify` | フェーズ完了後のリファクタリング・文書整理 |
| `/skill-list` | 自作スキル・エージェント一覧 |

### 複雑ワークフロー（多段階・エージェント起動・数十分）

| コマンド | 動作 |
|---|---|
| `/music-init [曲名]` | プロジェクト初期化 |
| `/phase1-trend` | トレンド分析 |
| `/phase1-suno` | Suno 用プロンプトを差別化案A/B/Cで作成 |
| `/phase2-music` | 楽曲仕様書・歌詞を並列生成（Agent Teams） |
| `/phase2-svp [A/B/C]` | SVPファイル生成 |
| `/phase2-demo` | デモ評価 |
| `/phase3-pv` | PVコンセプト・プロンプト生成 |
| `/phase4-release` | リリース準備（4エージェント並列） |
| `/phase5-golive` | リリース当日チェック |
| `/song-finish [曲名]` | 楽曲完成処理 |

### HP・ビジュアル・デザイン

| コマンド | 動作 |
|---|---|
| `/hp-add-work [曲名] [YouTubeID]` | HP Works 追加 |
| `/blog-publish` | ブログ記事投稿 |
| `/visual-add [作品名]` | visual-data.js に作品追加（IPFSハッシュ自動バリデーション） |
| `/visual-prompt [作品名]` | GPT Image 2 / Kling プロンプト生成 |
| `/lp-create [対象名]` | 楽曲LP・説明LPを構築 |
| `/design-team` | デザイナー3人（凛・華・紡）に競作させる |
| `/design-review-public` | 一般人視点の評価者3人にレビューさせる |
| `/design-search` / `/design-extract` / `/design-scout` / `/design-promote` | デザインパターンの検索・蓄積・偵察・昇格 |
| `/concept-video` | コンセプト動画のプリプロ（監督3人が競作） |
| `/image-gen` | ターミナルから画像生成 |

### レビュー・分析・定期確認

| コマンド | 動作 |
|---|---|
| `/codex-review [計画書]` / `/codex-diff` | Codex CLI で第三者レビュー |
| `/persona-review` | 観点別ペルソナ6視点でレビュー |
| `/ultrareview [PR#]` | クラウドマルチエージェントコードレビュー |
| `/weekly-check` | 収集・レビュースキルの実行ガイド（3日/週1ペース） |
| `/best-practices-review` | インボックスの一括レビュー（5件以上で実行） |
| `/claude-docs-review` / `/x-practices-search` / `/web-practices-review` | 公式ドキュメント・X・Web からの収集 |
| `/model-review` | 新モデルリリース時にモデル棲み分けを再議論 |
| `/version-audit` | ツールのバージョン追随を点検（月1ペース・Claude Code / Codex CLI / npm / Homebrew / Actions） |
| `/interaction-review` | 依頼パターン分析・改善提案 |
| `/insights` | セッション利用パターン分析 |
| `/research` | X と Web の並列リサーチ（話題の探索・記事ノート化） |
| `/facts [論点]` | デスクリサーチ部隊。角度別3体＋検証1体で二次情報を集め、ファクト集・比較・相場・制度を返す。正本は `~/facts/`、呼び出し元にコピー。規約は `~/.claude/references/fact-discipline.md` |
| `/factbook [議題/修正指示]` | 経営向けファクトブック三点セット（詳細版・要点版・説明版）の作成・改訂。`~/consulting/_firm/playbooks/executive-factbook.md` のルール（説明版は迷ったら削る・表2つは2軸グラフへ・イメージ図はClaude Design不使用）を自動適用 |

### コンサル・壁打ち

| コマンド | 動作 |
|---|---|
| `/consult` | 仮想コンサルチームへの統合エントリ |
| `/consult-analyze` / `-deck` / `-check` / `-decide` / `-sparring` / `-steerco` | 分析・資料化・検査・意思決定・壁打ち・定例レビュー |
| `/kabeuchi` | CEO 自身の判断軸で壁打ち |
| `/persona-sync` | inner-brain のインジェストを手動実行 |

---

## セッション運用

| 操作 | 方法 |
|---|---|
| タスク切替時 | `/clear` でコンテキストリセット |
| コンパクション | `/compact Focus on [作業内容]` |
| サイド質問 | `/btw [質問]` — 会話履歴に入らない |
| チェックポイント復元 | `Esc × 2` または `/rewind` |
| セッション再開 | `claude --continue`（最新）/ `claude --resume`（選択） |
| Web/iOS→CLI転送 | `/teleport` |
| CLI→Desktop転送 | `/desktop`（視覚的差分確認に） |
| モバイル→デスクトップ | Dispatch |
| 外部イベント受信 | Channels（Telegram / Discord / iMessage / webhook） |
| コスト確認 | `/usage`（スキル・サブエージェント・MCP 別内訳） |
| モデル切替 | `/model`（`s` キーで現セッションのみ） |
| effort 設定 | `/effort [level]`（選択レベルが次回起動も保持） |
| ゴール設定 | `/goal [完了条件]`（複数ターン自動継続） |
| 全エージェント監視 | Agent View（デスクトップ・Web） |
| 定期タスク（クラウド） | Routines: `/schedule` — マシンOFFでも継続 |
| 定期タスク（ローカル） | デスクトップスケジュール済みタスク — ローカルファイルに直接アクセス可 |
| セッション内の繰り返し | `/loop`（`Esc` / `Ctrl+C` でキャンセル） |
| 状態一括削除 | `claude project purge [path]` |
| 起動不具合の切り分け | `claude --safe-mode` |
| Agent Teams デバッグ | `claude agents --json` の `waitingFor` フィールド |

**プロンプト運用**: 後続メッセージを追加せず元メッセージを Edit → 再生成（msg30 は msg1 の31倍のコスト）。
会話が長くなったら15〜20メッセージを目安に `/compact` し、新セッションで要約を最初のメッセージとして引き継ぐ。
コンパクション時は変更ファイル一覧と次のアクションを必ず保持する。

---

## 承認ゲートとフェーズの対応

フェーズ1（トレンド）→ ① / フェーズ2-A（仕様書・歌詞）→ ②③ / フェーズ2-C（SVP）→ ④⑤ /
フェーズ3（PV）→ ⑥⑦ / フェーズ4（リリース準備）→ ⑧ / フェーズ5（当日）→ ⑨

---

## 6ヶ月ごとのゼロベース見直し

Claude Code 開発者（Boris Cherny）の推奨に従い、6ヶ月ごとに CLAUDE.md・スキル・hooks を
ゼロベースで見直す（削除してモデルの素の挙動を確認し、必要なものだけ戻す）。

- 前回実施: 2026-08-05（973行 → 413行。目標400行以下は未達だが、文字数は34,507→13,259で62%削減されているためCEOが受け入れ済み。監査表は drafts/claude-md-audit-2026-08-05.md）
- 次回目安: 2027-02
- 判定基準: 各行に「これを削除すると Claude が間違いを犯すか」を問い、否なら削除する
