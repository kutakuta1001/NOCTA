# ベストプラクティスレビュー（インボックス一括）

日付: 2026-09-06
次回レビュー推奨: 2026-10-06 以降（インボックスに5件貯まったら）
対象: 30件（manual 18件 / xmcp 12件）
ソース: CHANGELOG v2.1.239〜261・platform.claude.com モデル概要・code.claude.com（概要／ベストプラクティス／動的ワークフロー）・X 12投稿
除外URL: なし（インジェクション検出0件・取得失敗0件。全30件が形式2/3のため WebFetch 不要）

## 収集の取りこぼし

過去に収集したが CLAUDE.md に未反映のまま再収集された項目。再収集のコストが実際に発生しているため優先度を1段上げて提案する。

| 項目 | 回数 | 収集日 | 反映状況 |
|---|---|---|---|
| Stop hook による決定論的ゲート・`/goal` 条件 | 2回目 | 2026-08-05 / 2026-09-06 | 未反映 |
| バンドル `/code-review` スキル | 2回目 | 2026-07-29 / 2026-09-06 | 未反映（`/codex-diff` との使い分けが未整理） |
| `/deep-research` の挙動 | 2回目 | 2026-07-29 / 2026-09-06 | 未反映（`/facts` への応用が未検討） |

なお Step B（`/claude-docs-review`）の段階でアーカイブ照合を行い、Routines（3回目相当）と
Large workflow 警告（2回目）は収集前に除外した。前回30件中4件が再収集だった状況からは改善している。

## 要約

Claude Fable 5.1 の登場により R-09 のモデル使い分けの根拠が1つ崩れた（カットオフが Opus 5 を追い越した）。
セキュリティ面では zsh 権限迂回の修正が4件目に達し、CLI 更新自体が施策であることが確認できた（ローカルは最新 2.1.261）。
X 由来12件のうち NOCTA の運用に直結するのは Suno のダウンロード課金1件のみで、残りは領域知識・示唆にとどまる。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | R-09 | 「深い推論が必要な超重要案件は Fable 5」「Fable 5 はカットオフが2026年1月で Opus 5 より古く、最新の仕様情報を扱う判断では Opus 5 を選ぶ」 | Fable 5.1（`claude-fable-5-1`）へ更新。カットオフが逆転（Fable 5.1 = 2026年6月 > Opus 5 = 2026年5月）したため、Opus 5 優位の根拠を価格（$5/$25 対 $10/$50）とトークン消費量に限定して書き直す | models-fable-5-1-knowledge-cutoff / changelog-2-1-257-fable-5-1-added |
| 高 | R-09・AGENTS（analytics-agent） | 調査系は Haiku 4.5 | Haiku 4.5 の廃止コミット下限が2026-10-15（約1ヶ月半後）。後継モデル登場時に速やかに差し替える前提で運用し、`/weekly-check` の新モデル検出を継続する | models-retirement-dates |
| 中 | 承認ゲート⑨（リリース最終承認） | go_live_checklist.md の要確認項目ゼロを CEO が目視確認 | `/goal` 条件を設定すると別の評価者が毎ターン後に再チェックし、条件が満たされるまで作業が続く。機械判定可能な項目に限って自動化できる。**2回目の収集で未反映のため優先度を上げた** | best-practices-deterministic-gates |
| 中 | スキル設計（G-07）・6ヶ月ごとの見直し | 60件超のスキルの剪定判断が主観に依存 | `/skill-doctor`（v2.1.261）で未使用スキルとコンテキストコストを数値化し、次回ゼロベース見直し（2027-02目安）の入力にする | changelog-2-1-261-skill-doctor |
| 中 | R-13（Suno の音源は素材として使う） | Suno の mp3 を LALAL.AI で分離し drums / bass のパーツとして使う | ダウンロードに上限＋課金を設ける方針変更が報じられた。R-13 のコスト前提が変わるため、一次情報（Suno 公式アナウンス・料金ページ）で条件を確認する | x-suno-download-cap-backlash |
| 中 | R-09 の Opus 5 切替通知 | 「作業前に通知し CEO の確認を待つ」を規範で運用 | `PreModelSwitch` / `PostModelSwitch` hook（v2.1.252）でモデル切替をブロック・確認・注釈できる。規範を機構に落とせる | Step B 上限外発見 |
| 低 | visual-prompter | GPT Image 2 / Kling 向けプロンプト生成 | 2つのプロンプト型を追加する。(1) 入力画像＋フォーマット指定＋枠越え演出（雑誌表紙型）、(2) 文字要素を別ツールで作ってから合成する2段階型 | x-gpt-image-2-magazine-cover / x-midjourney-v8-2-edit |
| 低 | `/codex-review`・`/codex-diff` | Critical / Warning / Nit の3分類で受け取り、重みづけして対応 | 公式が「ギャップを探せと指示されたレビュアーは健全な作業でも必ず何か報告する」と明記。2026-09-06 に effort を high へ上げたため指摘増が見込まれ、「Nit をゼロにするまで直す」運用に流れないことを明文化する | best-practices-reviewer-gap-bias |
| 低 | `/facts` の fact-verifier | 数値の矛盾検出・出典の実在確認・計算の検算 | `/deep-research` は「検証不能」と「反論された」を区別する（v2.1.196 以降）。現状 fact-verifier は検証不能ケースの扱いが明示されていないため、同じ区別を導入する | workflows-deep-research-unverified |
| 低 | 各領域の収益設計 | CLAUDE.md・PROJECT CONTEXT に収益に関する項目がない（「ターゲット」「リリース希望日」はある） | 「マネタイズを後回しにしたアプリは困る日すら来ない」という指摘に沿えば、4領域の収益モデル不在が最も後回しにされている項目にあたる。ただし現在フェーズ1〜2でリリース実績がないため、今設計すべきかは CEO 判断。`drafts/roadmap.md` の記載状況を先に確認する | x-indie-dev-three-deferrals / x-indie-app-monetization-design |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| changelog-2-1-257-fable-5-1-added | Fable 5.1 追加・既定 Fable に昇格 |
| changelog-2-1-257-defaultmode-ignored | プロジェクト設定の bypassPermissions 無効化 |
| changelog-2-1-251-subagent-model-default | 環境変数が既定値に降格・定義側が優先 |
| changelog-2-1-260-permission-paren-bug | 括弧付きパスの deny が効いていなかった |
| changelog-2-1-260-zsh-reporttime-bypass | zsh 権限迂回の修正4件目 |
| changelog-2-1-261-skill-doctor | 未使用スキルとコンテキストコストを可視化 |
| models-fable-5-1-knowledge-cutoff | Fable 5.1 のカットオフが Opus 5 超え |
| models-official-model-recommendation | 公式は Opus 5 起点・高度推論は Fable 5.1 |
| models-fable-5-1-cache-read-discount | Fable 5.1 のキャッシュ読取は2.5% |
| models-retirement-dates | Haiku 4.5 の廃止下限が2026-10-15 |
| best-practices-deterministic-gates | 検証ゲートは4段階・Stop hook は8回上限 |
| best-practices-bundled-code-review | /code-review は別コンテキストで diff 検査 |
| best-practices-reviewer-gap-bias | レビュアーは必ず何か報告する偏り |
| best-practices-auto-mode-headless-abort | 非対話の auto mode は判断者不在で中止 |
| workflows-args-input | 保存ワークフローは args で入力を受け取る |
| workflows-script-path | 実行スクリプトを読み・編集・再起動できる |
| workflows-deep-research-unverified | 検証不能と反論を区別する |
| overview-channels | 外部からセッションにイベントを送れる |
| x-claude-code-cheat-sheet-2026 | 公式コマンドのチートシート（画像） |
| x-claude-18-official-courses | 公式無料コース18本・修了証付き |
| x-mcp-master-tree | MCP の概念ツリー図（既知の内容） |
| x-claude-ecosystem-breakdown | Claude のエコシステム全体像の整理 |
| x-claude-desktop-ai-secretary | 外部配布の CLAUDE.md 一式は要注意 |
| x-suno-download-cap-backlash | Suno がDLに上限と課金を設定 |
| x-ai-music-listener-bottleneck | AI音楽の作者は他人の作品を聴かない |
| x-midjourney-v8-2-edit | v8.2 Edit で他ツール出力と合成できる |
| x-gpt-image-2-magazine-cover | 入力画像から雑誌表紙＋枠越え演出 |
| x-awesome-gpt-image-2-repo | プロンプト集リポジトリがトレンド2位 |
| x-indie-app-monetization-design | 機能で線を引くマネタイズ設計への評価 |
| x-indie-dev-three-deferrals | 後回しで本当に危険なのはマネタイズ |

## インスピレーションメモ

- **`/skill-doctor`** — 60件超のスキルのうちどれが実際に使われているかを数値で棚卸しできる。主観に頼っていた剪定が測定可能になる（楽になりそう）
- **Channels（iMessage / webhook → セッション）** — 移動中に思いついた歌詞の断片やメロディのメモを、その場から `drafts/` に流し込める。DAW の前に座る前にアイデアが溜まっている状態を作れる（創造的になりそう）
- **`/goal` 条件** — 「go_live_checklist の要確認項目がゼロ」のような条件を機械判定のゲートにできる。人間の目視確認を、機械が確認できる部分と人間が判断すべき部分に分離できる（楽になりそう）
- **`PreModelSwitch` hook** — R-09 の「Opus 5 への切替通知が必要な場面」という規範を、切替そのものをフックして自動で確認する機構に置き換えられる（楽になりそう）
- **GPT Image 2 の雑誌表紙フォーマット** — 既存の Visual 作品を入力にして別フォーマット（誌面・ポスター・ジャケット）へ二次展開する型。1つの作品から SNS 用ビジュアルを派生させる工程が組める（創造的になりそう）
- **Midjourney v8.2 の2段階合成** — 文字要素を GPT-image で作り、絵と合成する。タイトル入りアートワークの文字品質が上がる（創造的になりそう）
- **動的ワークフローのスクリプトを読む** — Claude が書いたオーケストレーションをファイルとして読み、編集して再実行できる。「どう分岐させたか」を後から検証できる（使うのが楽しくなりそう）

## セキュリティ・安全性への影響

1. **CLI 更新自体がセキュリティ施策である。** zsh 由来の Bash 権限迂回は v2.1.221 / 223 / 238 / 260 と4件連続で修正されており、
   古いバージョンを使い続けると既知の迂回が有効なまま残る。
   **ローカルの Claude Code は 2.1.261 で CHANGELOG 最新と一致しており、すべて適用済み**（2026-09-06 確認）。
2. **`defaultMode: "bypassPermissions"` の無効化は NOCTA に影響しない。** 設定は `~/.claude/settings.json`（user settings）23行目にあり、
   プロジェクト側の `.claude/settings.json` / `settings.local.json` には `defaultMode` の記述がない（2026-09-06 実機確認）。
3. **deny ルールは「書いただけでは効いているとは限らない」。** v2.1.260 でパスに括弧を含む権限ルールが
   無効として落とされ read-only 指定フォルダが書き込み可能になっていた不具合が修正された。
   NOCTA のパスに括弧は含まれないが、2026-08-12 の検証で実セッションの deny 動作を確認した手順は正しかった。
4. **外部配布の CLAUDE.md・スキル一式は導入前に全文レビューが必要。** X 収集分（The_AGI_WAY）に
   「実際に使える CLAUDE.md・スキル・ディレクトリ一式を配布」というセミナー告知が含まれていた。
   インジェクションパターンには一致しないが、`~/.claude/` は API キーを平文で含む settings.json と
   権限ガードの hooks を持つため、第三者の設定ファイルを取り込むことは設定汚染の経路になる。
5. **Channels を導入する場合は送信元の制限が前提。** 外部からセッションにイベントを流せる仕組みは、
   利便性と同時にインジェクションの入口を増やす。

## 適用しない理由がある項目

1. **MCP マスターツリー（概念図）** — MCP 節で既に運用方針を確立済み（ツール総数80以下・書き込み系は ALLOWLIST に含めない）。概念整理から新規に得るものがない
2. **Claude 公式コース18本** — NOCTA は既に実運用段階にあり、入門コースの優先度が低い。ただし「Claude Code in Action（長時間 hands-off セッション）」は無人実行の設計という現在の課題に近く、時間があれば価値がある
3. **Claude Code チートシート 2026** — 内容の実体が添付画像で判別できず、一次情報は公式 CLI リファレンスで代替可能。NOCTA の操作面は自作スキル60件超が主体
4. **Claude エコシステム全体像** — NOCTA は既に該当領域（モデル・コーディング・エージェント・ワークフロー・メモリ・セキュリティ）を実装済み。未活用はエンタープライズ関連のみでスタッフゼロ型には該当しない
5. **awesome-gpt-image-2 リポジトリ** — 中身を未確認のため評価保留。外部プロンプトをそのまま使うと確定パレット（シルバー #B8B4AE × オフホワイト #E8E0D0）と競合しうるため、導入するなら構図・技法の抽出に留める
6. **Gmail / Notion / カレンダーの MCP 接続** — MCP 節の「常時有効は最小限」方針に反する。スタッフゼロ型で調整すべき相手がいないため、秘書系ワークフローの動機が薄い

## CEOが確認すべき事項

1. **`/model-review` での Fable 5.1 対応**（Step E で実施予定）。R-09 の「Fable 5」表記の更新に加えて、
   カットオフ逆転を踏まえた棲み分けの再設計が必要。Opus 5 を批評既定に据える根拠は価格とトークン消費量のみになる。
2. **Suno のダウンロード条件変更の一次情報確認。** X 由来の二次情報のため、上限数・課金額・対象プランが不明。
   R-13 のコスト前提に関わるため、リリース曲に Suno 素材を使う前に確認が必要（`copyright-agent` の確認項目に追加する価値がある）。
3. **`/goal` 条件の導入可否。** 2回収集して未反映。承認ゲート⑨の機械判定可能な部分に限って使えるが、
   「AI が勝手に先に進まない」（APPROVAL GATES の原則）との整合を確認する必要がある。
   自動で作業を続ける仕組みなので、承認ゲートの思想と衝突しうる。
4. **外部配布の設定ファイルを導入しない方針を明文化するか。** 現在 CLAUDE.md には記載がない。
   G-07 の「常時ロードを膨らませない」に1行足すか、セキュリティ節に置くかの選択がある。
5. **git 操作について。** 本レビューで新たな git 操作の提案はなかった。
   Step 9 のコミットは実施するが、**push は CLAUDE.md の git 運用（CEO の明示指示が必要）に従い実施しない。**
