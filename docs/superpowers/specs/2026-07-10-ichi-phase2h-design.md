# Ichi Phase 2h「密度調整・自動明るさ・図鑑連動・和の音」設計

作成: 2026-07-10 / モデル: Opus 4.8 / 実装SA: Sonnet・レビュー: Codex（CEO指定）
承認: CEO（密度30・大輪の重なり減・明るさは自動自生時のみ・自生resume調査・季節/花種の活用=図鑑24種・音を和の五音階に）
状態: 実装計画へ

## 目的（CEOの依頼）

1. 完成密度を 44→**30** に下げる。
2. 大輪の重なりを減らす（最小距離を広く）。
3. 明るさ（暗→生成り）は**自動自生の時だけ**にする（タップ/なぞりでは明るくしない）。
4. 「1回操作した後だと自動で花が咲かないように感じる」件の調査・改善。
5. 季節と花の種類を活かす → **図鑑24種の実物（実際の色・形）を咲かせる**。
6. 花が咲く音がランダム → **和の五音階でやさしいメロディー調**にし、心が安らぐように。

憲法（継承）: 一回性・ゴールなし・無音でも成立・reduce対応・操作中は暗い庭/自動仕上がりは明るいの棲み分け。

## 調査結果（依頼4: 自生が操作後に効かない件）

コード精査の結論: **ロジック上の停止バグはない**。tap/なぞり後は flowers≥1 で needLoop=true→rAF継続し、
redraw保険の `maybeSprout(t)`（無条件・毎フレーム）と setTimeout駆動 `armSproutTimer` の両経路で、
最後の操作から IDLE_MS(3秒)後・以後 SPROUT_INTERVAL ごとに自生が再開する。
体感の主因は **背景の明るさが全要素連動で、タップ後に見た目が変わらず「自動が止まった」ように感じる**こと。
→ 依頼3（明るさを自動自生時のみ）を実装すると、自生が進むたび背景が明るくなる＝**自動が働いている可視サイン**となり体感が解消する。念のため回帰テスト（tap→放置→自生再開）を追加して確証する。

## 設計要点

### A. 密度 30・大輪の重なり減（依頼1,2）

- `FILL_TARGET` 44→**30**。自生の停止・完成の基準。
- 大輪級（size>=70）の配置: 既存の「7×6グリッド空きセル優先＋縁-縁クリアランス」を、大輪では**最小クリアランス閾値を大きく**し、満たす候補が無ければその周期は中サイズ以下に格下げ（大輪の団子を避ける）。中小・緑は隙間を埋めてよい。

### B. 明るさは自動自生の時だけ（依頼3）

- **ambientCount**（ambientSprout で生えた要素数のカウンタ）を新設。tap/なぞり/長押し大輪では増やさない。
- 背景の `fillRatio` を `flowers.length / FILL_TARGET` から **`ambientCount / FILL_TARGET`** に変更。
  - タップ/なぞりで咲かせても背景は暗いまま。自動自生が進むと明るくなる。
  - 突風クリアで ambientCount=0 リセット→暗へ。
- 自生の停止条件（flowers.length>=FILL_TARGET）は総数のまま（画面が埋まったら止める）。明るさだけ ambient 由来に分離。

### C. 自生resume の確証（依頼4）

- 追加のコード修正は原則不要（調査結果の通り）。ただし **回帰テスト**を追加: mount→tap 1回→IDLE_MS+interval 相当を進める→entityCount が増える（自生再開）。
- Bにより自生が視覚化されるため体感も改善。もしテストで真のバグが出たら修正する。

### D. 図鑑24種の実物を咲かせる（依頼5）

- index.html（NOCTA_FLORA を保持）が、mount opts に **`flowerKinds`**（24種の `{color: accentColor, form: hanaForm, season}` 配列）を渡す。
- ambientSprout が「花」要素を生やすとき、flowerKinds から1種をランダム選択し、
  **色 = `deriveSeededPalette(flower.color, 現在の季節)`（既存関数を流用）・形 = `flower.form`（hanaForm）** で咲かせる。
  → 桜・薔薇・向日葵・彼岸花… 名前のある花の実際の色と形が自動の庭に集まる（多彩な植物標本）。
- 季節チップ（現在の季節）は deriveSeededPalette の seasonName に渡り地色/芯の統一感を保つ（花の accentColor は主色）。
  現在の季節に属する花を軽く優先してもよい（任意・季節感）。ただし基本は24種の多様性を見せる。
- flowerKinds が未指定（テスト等）なら従来通り（currentPalette + pickForm）にフォールバック。
- 緑（sprig/fern/umbel/floret）は従来通り。なぞり/タップの花は現状維持（seed時は従来のseed色）。

### E. 咲く音を和の五音階でやさしく（依頼6）

- otoPlay の周波数を、**和風の五音音階（陽旋法 yo scale 等）にクォンタイズ**する。
  - 例: 基音から yo旋法の音度（相対比）を配列で持ち、花のサイズ or 咲いた順で音度を選ぶ。連続して咲くと自然にやさしい旋律になる。
  - ランダムでも音階内なので常に調和（濁らない）。音域は現状の落ち着いた帯（〜低め）を踏襲。
  - 音色（sine+triangle）・エンベロープ（やわらかい減衰）はやさしさ優先で微調整可。最小発音間隔90msは維持（or 旋律感が出るよう軽く調整）。
- デフォルト無音（音ONトグル時のみ）は不変。突風音(otoPlayGust)・そよ風音(otoPlayWind)は対象外（今回は咲く音のみ）。

## 変更ファイル

- `website/flora/hana.js`: FILL_TARGET30・大輪クリアランス・ambientCount と fillRatio 分離・flowerKinds 受領と ambient の図鑑連動・otoPlay の五音階化。
- `website/flora/index.html`: mount opts に flowerKinds（NOCTA_FLORA 由来）を渡す・`hana.js?v=9`→`?v=10`。

## 検証設計（Playwright + Codex）

- 新規 `verify-hana-phase2h.js`:
  (a) 密度: __fastGrow 放置で entityCount が **30付近**で停止（30を大きく超えない）。
  (b) 大輪の重なり: 大輪級同士の最小中心間距離が旧より広い（or 縁-縁クリアランス>=閾値）。
  (c) 明るさ自動限定: **タップだけ**で花を増やしても背景輝度が上がらない（暗いまま）。**自動自生**が進むと背景輝度が上がる。突風クリアで暗へ。
  (d) 自生resume: mount→tap1回→__fastGrowで時間を進める→entityCount 増加（自生が操作後も再開する）。
  (e) 図鑑連動: flowerKinds を渡すと、自生の花要素の色/形がその集合由来（複数種の色が出る＝単一season一色でない）。未指定でフォールバック。
  (f) 和の音: 音ON+複数回spawnで、鳴った周波数が**五音階の集合に含まれる**（scaleに量子化されている）。音OFFで無音。
  (g) reduce網羅・エラー0。
- 既存 hana スイート（util/forms/seed/engine2/press/mount2/perflower/phase2b/season/oto/kaze/taika/hizuke/kyou/integration2/leaf/wind2/phase2e/phase2f/phase2g）＋iro/fude/zukan 回帰維持。
  特に phase2g（FILL_TARGET44・fillRatio=総数連動）と oto（freq連続前提）は 30/ambient連動/五音階へ**期待値更新**の可能性→報告。__noSprout 隔離を活用。
- コードレビュー: Codex（`codex-review.sh custom` でブランチ差分・2周・Critical必修正）。
- スクショ/実機目視: タップでは暗い/自動で明るくなる・図鑑の花が多彩に咲く・密度30の余白・大輪が重ならない。音は実機で心地よさ確認（CEO最終採否）。

## リスク

| リスク | 対応 |
|---|---|
| ambientCount と flowers.length のずれで整合が崩れる | クリア/散りで両者を整合（ambientCountはambient由来のみ・クリアで0）。テストで担保 |
| 図鑑連動でhana.jsがflora-dataに密結合 | opts.flowerKinds 経由の疎結合（index.htmlが渡す）・未指定でフォールバック |
| 五音階が単調/機械的 | 音度選択に軽い揺らぎ・やわらかいエンベロープ。実機で調整 |
| 密度30で「画面いっぱい」感が減る | CEO明示の30。大輪級と全面配置で疎密のリズムを保つ。目視調整可 |
| phase2g/oto テストの前提変更で退行 | 正当な期待値更新のみ・報告。fillRatio=ambient連動/FILL_TARGET30/五音階 |
