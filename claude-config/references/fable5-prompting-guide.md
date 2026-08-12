# Fable 5 プロンプティングガイド（要点まとめ）

最終更新: 2026-07-04
出典: platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
提供状況: 輸出管理により断続提供。2026-07-07 まで選択可（詳細: model-lineup.md rev.4）

---

## 1. Fable 5 に依頼すべきタスク（得意領域）

**原則: 難易度レンジの最上位から始める。** 従来モデルに任せるより難しいタスクを渡し、スコープ定義・質問・実行までさせるのが最も効果的。簡単なタスクだけで試すと実力を過小評価する。

| 得意領域 | 具体例 |
|---|---|
| 長時間自律実行 | 数時間〜数日規模のゴール指向タスク。長い複雑タスクでも指示保持が強い |
| 複雑・良仕様問題の一発正答 | 従来数日の反復を要したシステムをシングルパスで実装 |
| コードレビュー・デバッグ | バグ発見の再現率が Opus 4.8 より顕著に高い。コードベース・リポジトリ履歴の横断検索も |
| 曖昧さのナビゲーション | マルチスレッドの複雑な依頼を渡して次の一手を決めさせる |
| 並列サブエージェント統率 | サブエージェントの派遣・維持・軌道修正が大幅に信頼性向上 |
| ビジョン | 高密度な技術画像・スクリーンショットの解釈精度が大幅向上 |
| エンタープライズ文書 | 財務分析・スプレッドシート・スライド・ドキュメントでスコープ遵守 |

**不向き・注意:** 攻撃的サイバーセキュリティ・生物/ライフサイエンスは safety classifier により `refusal` になりうる（良性の作業でも誤発動あり）。フォールバック先は Opus 4.8。

## 2. effort 設定

- effort が知能・レイテンシ・コストの主制御。デフォルト `high`、最重要のみ `xhigh`、定型は `medium`/`low`
- **Fable 5 の低 effort でも旧モデルの xhigh を超えることが多い** — 定型作業で無駄に xhigh にしない
- 高 effort ではタスクに不要な文脈収集・熟考をしがち。完了が遅すぎると感じたら effort を下げる

## 3. プロンプトパターン（コピペ用・英語のまま有効）

### 過剰計画の抑制
> When you have enough information to act, act. Do not re-derive facts already established, re-litigate a decision the user has already made, or narrate options you will not pursue. If weighing a choice, give a recommendation, not an exhaustive survey.

### 頼んでいないリファクタ・整理の抑制（高 effort 時）
> Don't add features, refactor, or introduce abstractions beyond what the task requires. Do the simplest thing that works well. Only validate at system boundaries.

### 簡潔な報告（結論ファースト）
> Lead with the outcome. Your first sentence should answer "what happened". Drop details that don't change what the reader would do next — but don't compress into fragments or arrow chains.

### 長時間実行での進捗の事実性担保（捏造ステータス防止）
> Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for; if something is not yet verified, say so explicitly.

### 境界の明示（頼んでいない行動の抑制）
> When the user is describing a problem or thinking out loud, the deliverable is your assessment. Report findings and stop. Don't apply a fix until they ask.

### チェックポイント（止まるべき時だけ止まる）
> Pause for the user only when the work genuinely requires them: a destructive or irreversible action, a real scope change, or input only they can provide.

### 自律パイプライン用（早期停止防止）
> You are operating autonomously. For reversible actions that follow from the original request, proceed without asking. Before ending your turn, check your last paragraph — if it is a plan or a promise about work not done, do that work now with tool calls.

### 意図の共有（性能向上）
> I'm working on [the larger task] for [who it's for]. They need [what the output enables]. With that in mind: [request].
（依頼には「なぜ」を添える。意図が分かると関連情報への接続が良くなる）

## 4. Opus 4.8 との運用上の違い

- **1ターンが長い**: 高 effort では1リクエストが数分〜、自律実行は数時間に及ぶ。タイムアウト・進捗表示の前提を調整
- **適応的思考のみ**（常時ON）。extended thinking budget なし。thinking 出力は要約のみ
- **推論の再現を指示しない**: 「思考を書き出せ」「reasoning を説明せよ」系の指示は `reasoning_extraction` refusal を誘発 → 既存スキル・プロンプトの見直し対象
- **旧モデル向けスキルは過剰指示になりがち**: 細かすぎる手順書はかえって品質を下げる場合がある。デフォルト性能が上なら古い指示の削除を検討
- **コンテキスト残量表示に反応**: 残トークンカウントを見せると自らセッション分割を提案しがち。「You have ample context remaining. Continue the work.」で抑制

## 5. スキャフォールディング推奨

- **検証の明示**: 長時間タスクでは「[X]間隔で fresh-context のサブエージェントに仕様と照合させて自己検証せよ」と指示。自己批判より別コンテキスト検証者が優る
- **サブエージェント積極活用**: 「独立サブタスクはサブエージェントに委譲し、走らせたまま自分も作業を続けよ」。ブロッキング待ちより非同期通信
- **メモリシステム**: 1教訓=1ファイル+冒頭1行要約。過去セッションの振り返りでブートストラップ可能
- **send_to_user 型ツール**: 長時間非同期エージェントには、ターンを終えずユーザーに逐語メッセージを届けるツールを定義+呼び出し指示をセットで

## 6. NOCTA での適用上の注意

- **提供ウィンドウ限定（〜2026-07-07）**: CLAUDE.md・スキルを Fable 5 前提に恒久改変しない。7/8 以降は Opus 4.8/Sonnet 5 に戻るため、旧モデルでも機能する記述を維持する
- 適用好機: 重要設計のクリティーク（CLAUDE.md 分岐統合等）・大型レビュー（/best-practices-review）・コードベース横断のバグ探索・長時間の多段タスク
- R-09 の「Opus 4.8 切替通知」場面は、ウィンドウ中は Fable 5 がそのまま上位互換として機能する
