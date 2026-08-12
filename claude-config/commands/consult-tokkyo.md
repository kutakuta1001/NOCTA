---
description: tokkyo の特許 run 成果物をコンサルチームに引き継ぎ、出願判断・事業化分析・資料化・戦略壁打ちへ接続する
argument-hint: "run名（部分一致可。例: 推し活 / 20260711）。省略すると run 一覧から選択"
allowed-tools: Bash, Read, Write, Agent
---

# /consult-tokkyo — 特許 run の引き継ぎ（tokkyo → コンサルチーム）

tokkyo（特許出願前パッケージ生成）の run 成果物を読み取り、コンサルチームの検討に引き継ぐ。
規約は `~/.claude/commands/references/consulting-common.md` に従う。

## 役割の棲み分け（最初に確認）

| 相談内容 | 担当 |
|---|---|
| 特許を強くする（先行技術・請求項・新規性・進歩性） | tokkyo: `tokkyo brainstorm -r [run]` |
| 出願する価値・事業化戦略・経営向け資料・意思決定 | 本スキル → コンサルチーム |
| 出願書類の作成・修正・法的助言 | tokkyo のドラフト+弁理士（コンサルチームは行わない） |

CEO の相談が「特許自体を強くしたい」なら、本スキルではなく `tokkyo brainstorm` を案内する。

## Step 0: run の特定

1. 引数なし → `ls ~/tokkyo/runs/` の一覧（.DS_Store 除く）を提示して選択させる
2. 引数あり → 部分一致で解決。複数ヒットは一覧提示、0件は「~/tokkyo/runs/ に見つからない」と伝え、
   runs ディレクトリの場所（config.toml の runs_dir 変更の可能性）を CEO に確認する

## Step 1: engagement 初期化

- `~/consulting/tokkyo-[run短縮名]/` を「エンゲージメント規約」どおり作成（短縮名は run 名のテーマ部分から生成）
- 既存なら再引き継ぎ: inputs/tokkyo/ を更新し、engagement.md の進捗に「再引き継ぎ（run 更新）」と追記する

## Step 2: 成果物の取り込み（読み取り専用）

以下6ファイルを `inputs/tokkyo/` にコピーする（**存在するもののみ**。未生成ステージは engagement.md に「未生成: [ファイル]」と記録）:

```
01_intake/candidates.md          # 3候補の全体像
04_business/report.md            # 事業性評価（市場性・実施可能性・権利行使容易性）
05_select/report.md              # 選定結果と順位
08_package/assessment_report.md  # 総合評価
08_package/attorney_brief.md     # 発明概要・先行技術対比の凝縮版
08_package/design_rationale.md   # 検討背景
```

- `manifest.json` はテーマ・日付の読み取りのみ（コピー不要）
- **tokkyo の run フォルダには何も書き込まない**（読み取り専用の連携）

## Step 3: EM による論点整理（型先行プロトコル）

`consultant-em` を Agent tool で起動する。渡すもの: engagement.md のパスと、inputs/tokkyo/ 配下の
**全ファイルのフルパス一覧**（EM はディレクトリ一覧ツールを持たないため、パスを省略せず列挙する）。指示:

「consulting-common.md の『型先行プロトコル』ステップ1〜3を実行。主型は『知財事業化チェック』
（型カタログ参照。補助型は必要ならリーンキャンバス等を1つまで）。要素充填の規則:
- tokkyo のスコア・評価は必ず『推定（根拠: tokkyo 04_business）』のように出典ステージ付きの**推定**として扱う。事実に昇格させない
- tokkyo が根拠を示していない市場の主張は『仮説』に落とす
- CEO 提供の客観情報（run の日付・選定候補名・スコア数値の存在自体）のみ事実
感度ランキングと、感度『高』上位1〜2変数の検証計画（検証方法×必要データ）まで出す」

## Step 4: 結果とメニューの提示

EM の論点整理を CEO に提示し、次の進み先を選ばせる:

| 次にやること | 手順 |
|---|---|
| 出願するか・どの候補で進めるかを決める | `consult-decide.md` の手順（決定=知財事業化チェックの変数として位置づけ済み） |
| 事業化の分析を深める | `consult-analyze.md` の手順（ワークプランは EM の感度上位変数から） |
| 経営・パートナー向け資料にする | `consult-deck.md` の手順（テーマ選択可） |
| 戦略の壁打ちをしたい | `consult-sparring.md` の手順 |
| 特許自体を強くしたい | `tokkyo brainstorm -r [run]` を案内（tokkyo 側の担当） |

## Step 5: engagement.md 更新

型と変数（検証済み/検証中/未検証）・進捗・次アクションを各1〜3行で更新する。

## 逆方向: コンサル検討 → tokkyo

分析・壁打ちの中で**新しい発明のアイデア**（技術的な解決手段の種）が出たら:
1. アイデアの要点を `analysis/idea-[日付].md` にメモ化する（課題・解決手段の骨子・効果）
2. CEO に案内する: 「`tokkyo run "テーマ" --attach ~/consulting/[slug]/analysis/idea-[日付].md` で
   特許パイプラインに掛けられます」（発明候補の展開・先行技術調査は tokkyo の担当）

## IMPORTANT（制約）

- tokkyo の run フォルダは読み取り専用。tokkyo リポジトリのコード・ドキュメントにも触れない
- 出願書類の作成・修正・法的助言はしない。特許性の評価は tokkyo と弁理士の領分
  （tokkyo のディスクレーマーと同じ立場: 本人出願支援の参考情報であり法律事務の代替ではない）
- tokkyo の評価を事実として引用しない（常に「推定（根拠: tokkyo ...）」）
- 成果物はローカル（~/consulting/）のみ
