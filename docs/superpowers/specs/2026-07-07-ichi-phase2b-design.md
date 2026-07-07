# Ichi Phase 2b「無常と季節」設計

作成: 2026-07-07 / モデル: Opus 4.8
承認: 提案書 `drafts/ichi-refinement-proposal.md`（CEO承認済・「次のphaseに進んで」）
状態: 実装計画へ

## 目的

提案書 B-4（散る花＝無常）＋ C-1（図鑑側の余白）＋ C-2（今日と連動する季節）を実装する。
咲かせた庭が「永遠に固定」でなく「緩やかに移ろう」ことで瞑想的な無常を与え、押し花で
「移ろうものを留める」意味を立てる。図鑑側は余白と季節連動で「今日だけの景色」に近づける。

憲法（Phase 2a 継承）: 引き算が上質／遅さを報酬に／二度と同じ画にしない／ゴールを作らない／無音で成立。

## スコープと重要な設計判断

### B-4 散る花（無常）— 中核
「花びらが1枚ずつ落ちて淡く散る＋花はゆっくり past-peak になる」で無常を表現する。
**庭（花）は自動では消さない**（ユーザーの制作を勝手に消さない安全側）。花びらの落下と
花の「盛りを過ぎた」佇まいで移ろいを見せ、留めたければ押し花にする。
- 各花は満開後 `holdMs`(≈12〜22秒・ランダム) 経つと**加齢期**に入り、数秒おきに花びらを1枚ずつ
  落とす（落ちた花びらは重力＋横ドリフト＋回転で下方へ流れ、約2.5秒で淡くフェード＝パーティクル）。
  総花びらの約40%を落とすと落下は止まり、花は「盛りを過ぎた姿」(花びら数減・わずかに低alpha)で残る。
- パーティクル総数に上限(≈120)。落下は稀（花ごと数秒間隔）なので通常は低数で収まる。
- reduce-motion: 加齢・落下・パーティクルを一切行わない（従来通り静的）。
- press(): 現在のcanvasを drawImage で取り込むため、加齢した花＋落下中の花びらもそのまま
  押し花に写る（移ろいの一瞬を留める＝意図通り）。背景は従来通り和紙(透明canvas前提)を維持。

### C-2 今日と連動する季節
- `currentSeason()`（`new Date()` の月→spring{3,4,5}/summer{6,7,8}/autumn{9,10,11}/winter{12,1,2}）。
- 汎用CTA「咲かせて遊ぶ」(seedなし)の初期季節を今日の季節にする（`mount({season: currentSeason()})`）。
  ※ 各花入口(.hana-sow)のseedはその花の季節のままで不変。
- 図鑑カバーの雰囲気に**ごく淡い**今日の季節の色を添える（既存の暗いテーマを壊さない微妙な色温度）。
  セクションのレイアウト・--gem グロー等には触れない（回帰リスク回避）。

### C-1 図鑑側の余白（軽微・低リスク）
- 各花セクションの情報密度をわずかに下げ、花の周囲の呼吸を増やす。**レイアウト構造は変えず**、
  余白（セクション内の縦間隔）とチップの視覚的軽さの微調整に留める（zukan 36項目の回帰を守る）。

非目標: 花の自動消滅（庭を空にする挙動）／なぞり音（Phase 2c）／一輪挿し・絵本（バックログ）。

## アーキテクチャ上の要点

### 1. flower に加齢状態・particles 配列を createGarden に追加
- flower に `holdMs`(spawn時ランダム)・`shed`(落とした枚数)・`nextShedT`・`maxShed`(≈floor(n*0.4)) を持たせる。
- createGarden に `var petals = [];`（落下パーティクル）。
- redraw で: 各花の経過時間から (a) bloom(既存) (b) sway(既存) に加え、加齢判定→到来していれば1枚shed
  （particles に1つ push・flower.shed++・nextShedT 更新）、(c) drawFlower に `shed` を渡し 花びらを n-shed 枚で描画。
- redraw 末尾で particles を更新（位置・回転・alpha減衰）＋描画、寿命切れを除去。

### 2. drawFlower に `shed` 引数（既定0）
- 既存の花びらループを `for (i=0; i < n - shed; i++)` にするだけ（shed=0で従来と完全同一）。
- 落下パーティクルは drawFlower とは別の軽量描画（1枚の petal 形＋グラデ＋回転＋alpha）。共通の petal() を流用。

### 3. loop 継続条件に particles を追加
- `needLoop`: reduce時 false（静的）。非reduce時 `flowers.length>0 || petals.length>0`。
  （花が無くても落下中パーティクルがあれば描き続け、消えたら停止）。

### 4. C-2/C-1 は index.html 中心（hana.js は mount({season}) を既に受ける）
- 汎用CTAの mount 呼びに today の season を渡す。カバー淡色・余白はCSS/HTML。

## 変更ファイル

- `website/flora/hana.js`: drawFlower(shed) / createGarden(petals・加齢・落下更新・needLoop・spawnにhold等) 
- `website/flora/index.html`: currentSeason() / 汎用CTA mount に today season / カバー淡い季節色 / C-1 余白CSS / `hana.js?v=4`

## 検証設計

- 新規 Playwright `verify-hana-phase2b.js`: (a) 満開後（holdを短縮する内部テストフック or 長時間待ち）花びらが落ち particles が増える→やがて花の花びらが減る(n-shed) (b) 落下パーティクルはフェードして消える(particles減) (c) reduce-motion で加齢・落下なし（時間経過で花不変・particles=0） (d) press() が加齢後も背景を含まず和紙で出る (e) 汎用CTAが今日の季節パレットで開く (f) 各花入口(seed)の季節は花の季節のまま (g) エラー0。
  ※ holdMs を長いままだとテストが遅いので、mount/createGarden にテスト専用の `opts.__fastAge`（holdMs/shed間隔を短縮）を設けてよい（本番未使用・reduce同様の内部フラグ）。
- 既存 hana スイート（forms/seed/engine2/press/mount2/perflower/integration2）＋iro/fude/zukan 回帰維持。
  drawFlower shed=0 で既存描画不変・seedなし従来挙動維持。
- 散る花の見た目は Task でスクショ/動画的連番目視ゲート。

## リスク

| リスク | 対応 |
|---|---|
| 落下が「散らかって」瞑想性を損なう | 稀な落下(数秒間隔)・淡いフェード・上限40%で止め花は残す。スクショ目視で頻度調整 |
| 常時rAF+particlesで負荷 | particle上限120・30fpsスロットル(既存)・reduce停止。実測確認 |
| C-1でzukanレイアウト回帰 | 構造非変更・余白/チップの微調整のみ・zukan36を各Tで回帰確認 |
| press に落下中パーティクルが写る | 仕様として許容（移ろいの一瞬を留める）。背景透明は維持し和紙合成は不変 |
| テストが遅い(hold待ち) | `__fastAge` 内部フラグで短縮（本番未使用） |
