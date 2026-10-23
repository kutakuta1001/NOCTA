# ベストプラクティスレビュー（インボックス一括）
日付: 2026-10-24
次回レビュー推奨: 2026-11-23 以降（インボックスに5件貯まったら）
ソース: Claude Code CHANGELOG（v2.1.284〜v2.1.309）/ platform.claude.com Models overview / code.claude.com Best practices・Overview / x.com 9件
除外URL: なし（取得はすべて本文付きのため WebFetch なし。インジェクション検査で `rm -rf` に1件一致したが、「rm -rf を止める hook」の説明文で実行指示ではないため残した）

## 収集の取りこぼし

| 項目 | 何回目 | CLAUDE.md への反映 |
|---|---|---|
| deny 迂回の修正（approved-guard の前提） | 2回目（2026-09-27 に v2.1.268〜280 の3件） | 反映不要（Claude Code 側の修正。R-02 の運用は変えない） |
| auto mode が開始権限モードになる | 2回目（2026-09-27 は Pro / Max / Team 限定の旧仕様） | 未反映（前回「低」で提案・未実施） |
| `/goal` | 4回目 | 未反映 |
| `/doctor`（CLAUDE.md の監査） | 3回目（2026-08-05 `claude-api` 版・2026-09-27 `prompt-audit`） | **未実行。優先度を上げた** |
| Suno の利用条件の変化 | 2回目（2026-09-27「V6 以前の全モデル廃止」） | **R-13・copyright-agent とも未反映。優先度を上げた** |
| claude-code-best-practice リポジトリ | 2回目以上（`references:claude-code-best-practice` として取込済み） | 反映済み |

## 要約（3行以内）

新モデル Sonnet 5.5（$2/$10）と Haiku 5.5（$0.10/$0.50）が既定に昇格し、別名（`model: sonnet` / `haiku`）で指定しているエージェントは既に新モデルで動いている。一方 R-09 は Sonnet 5 / Haiku 4.5 / Opus 5 のままで、表記と実際がずれている。
公式は「検証手段を渡す」「レビュアーには正しさと要件の穴だけを挙げさせる」を強調しており、NOCTA のレビュー系スキルに直接使える。
Suno のダウンロード制限の報告が出た。R-13 の手順の前提に関わり、2回続けて未反映。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | R-09・G-01・AGENTS 節・`model-lineup.md` | R-09 は「起案 Sonnet 5 / 調査 Haiku 4.5 / 批評 Opus 5」。model-lineup.md は rev.10 で批評を Opus 5.5 にしたが、project CLAUDE.md の R-09 は Opus 5 のまま。エージェント定義は `model: sonnet` / `haiku` の別名指定で、実際には Sonnet 5.5 / Haiku 5.5 が動いている | `/model-review` で Sonnet 5.5・Haiku 5.5 の割当を決め、R-09・G-01・AGENTS 節・model-lineup.md を同じ表記に揃える。Haiku 5.5 の既定 effort は medium、Sonnet 5.5 は high。R-09 の「Fable 5.1 はカットオフで上回る」は全モデル2026年6月になったため削る | changelog-2-1-284-309-sonnet-haiku-5-5 / models-overview-lineup-5-5 |
| 高 | `~/.claude/agents/svp-generator.md` | `model: opus`（Opus 5.5）で `effort:` の記載なし。Opus 5.5 の既定 effort は medium | model-lineup.md rev.10 の「effort high を明示」が定義に入っていない。`effort: high` を足す（前回提案の「批評系に effort を明記」の未実施分） | models-overview-lineup-5-5 |
| 高 | R-13・copyright-agent・`nocta-tools.md` | R-13 は「Suno の mp3 を LALAL.AI で分離して素材に使う」。V6 以前の廃止（2026-09-27 収集）も未反映 | Suno の現行のダウンロード条件と利用規約を一次情報（Suno 公式）で確認し、R-13 に「ダウンロードできない場合の代替（ACE-Step のローカル生成など）」を1行足す。**2回続けて未反映のため優先度を上げた** | x-suno-limited-downloads |
| 高 | スキル設計節（6ヶ月見直し・次回 2027-02） | 剪定の判断は主観。`/doctor prompt-audit` は前回提案・未実行 | 公式に「git 管理下の CLAUDE.md に `/doctor` を実行するとコードから導ける内容の削除案を出す」と追記された。`/doctor` と `/doctor prompt-audit` を一度実行し、結果を `drafts/` に保存して 2027-02 見直しの入力にする。**3回目の収集で未実行のため優先度を上げた** | cc-best-practices-verify-review-doctor |
| 中 | `/persona-review`・`/codex-review`・`/design-review-public` の指示文 | 「Easy タスクには使わない（レビュー過剰）」はあるが、指摘の絞り方の指示はない | 公式の注意「レビュアーは頼まれれば何か見つける。追いかけると過剰設計になる」を受け、レビュアーへの指示に「正しさと要件に関わる穴だけを挙げ、それ以外は任意として分ける」を1行足す | cc-best-practices-verify-review-doctor |
| 中 | COST POLICY・`/weekly-check`・`/version-audit` | 定期点検は CEO が手で起動 | Desktop scheduled tasks（ローカル実行）で `/weekly-check` の「表示だけ」部分を月曜に回す案。R-03・push 禁止はそのまま守れる（コミットまでにとどめる）。採否は CEO | cc-overview-cloud-scheduled-tasks |
| 低 | visual-prompter | GPT Image 向けは単一プロンプト | GPT Image 2.5 は「描き込み過多で AI 生成感が出る」との比較報告が2件。描き込みを抑える指示（余白・要素数の上限）を選択肢として足す。MOSS-Image は JSON 構造化プロンプト向きという所感もあり、`nocta-tools.md` の候補に記録する | x-moss-image-vs-gpt-image-2-5 / x-moss-image-json-prompt |
| 低 | permissions（bypassPermissions） | user settings で bypass 固定 | v2.1.283 から auto mode が全プランの開始モードになり、`/auto-mode-setup` で環境を教えられるようになった。前回提案（1セッション試験）の材料が揃った | changelog-2-1-284-309-sonnet-haiku-5-5 / cc-best-practices-verify-review-doctor |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| github.com/anthropics/claude-code/CHANGELOG | Sonnet/Haiku 5.5 と deny 修正 |
| platform.claude.com/models/overview | 現行4本が全部カットオフ2026年6月 |
| code.claude.com/best-practices | 検証4段・レビューは穴だけ挙げる |
| code.claude.com/overview | routines が Cloud scheduled tasks に |
| x.com/choopyplug1 | 編集後テストと破壊操作を止める hook |
| x.com/aiedge_ | 作者チームの小技10選 |
| x.com/KanThread | best-practice リポジトリ84の小技 |
| x.com/Bic_Revelation | 15より3つで1本完成させる |
| x.com/AI_kagakuri | 明確さ・理解確認・使い分け |
| x.com/IamKuyikBassey | Suno がダウンロードを制限 |
| x.com/aawuup | GPT Image 2.5 は描き込み過多 |
| x.com/ku_nel_notekute | MOSS-Image は JSON 指示向き |
| x.com/masabloo | 個人開発マネタイズ大全 |

## インスピレーションメモ

- 編集後に自動で検証する hook — website/ の `*-data.js` を編集したら構文チェックを自動で走らせ、website-reviewer を呼ぶ前に壊れを止められそう（楽になりそう。参照: x.com/choopyplug1）
- Desktop scheduled tasks — 月曜の朝に `/weekly-check` の結果が届いていれば、点検の起動を忘れなくなりそう（楽になりそう。参照: code.claude.com/overview）
- 「3つから始めて1本完成させる」 — 新しい道具を足す前に、1曲・1作品を最後まで出すことを優先する判断軸として `/kabeuchi` で使えそう（創造的になりそう。参照: x.com/Bic_Revelation）
- 個人開発の収益化 — HP の Tools 領域で何を有料にするかの壁打ち材料になりそう（参照: x.com/masabloo）

## セキュリティ・安全性への影響

- v2.1.309 でサブシェルを含む Bash リダイレクトが `Edit(path)` deny をすり抜ける不具合が修正された。2026-10-23 に v2.1.309 へ更新済みのため、`outputs/approved/` の deny は現在この経路でも効いている。approved-guard hook は引き続き併用する

## 適用しない理由がある項目

- `/goal`（4回目の収集）: NOCTA の作業はほぼ承認ゲートで止まる対話型で、無人で回し続ける用途がない。HP の大きな改修で使う場面が出たら検討する
- 作者チームの小技10選・best-practice リポジトリ: 本文が取れず、既知の公式ベストプラクティスと重なる。リポジトリは取込済み
- 「5原則」（AI_kagakuri）: R-14・R-05・スキル設計節で実装済み
- Channels（Telegram / Discord / iMessage の受信）: 外部からの入力をセッションに入れる経路が増え、R-03 とインジェクション対策の負担が上がる。今は採らない

## CEOが確認すべき事項

1. `/model-review` を今回のフルルーティンの続きで実行してよいか（Sonnet 5.5・Haiku 5.5 の割当と、R-09・G-01 の表記揃え。CLAUDE.md の変更は CEO 承認後）
2. AGENTS 節にある `lyric-critic` / `concept-critic` のエージェント定義が `~/.claude/agents/` にも `claude-config/agents/` にも見当たらない。スキル内の処理に統合済みなら AGENTS 節から外す、未作成なら作るかを決める
3. Suno のダウンロード制限が手元のプランでも起きているか（R-13 の手順が止まっていないか）
