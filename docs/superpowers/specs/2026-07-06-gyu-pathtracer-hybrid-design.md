# Gyu 3D宝石 — パストレーシング・ハイブリッド 設計

作成: 2026-07-06 / モデル: Opus 4.8 (effort xhigh)

## 目的

Gyu（宝石を眺めるアプリ）の3D宝石を「本物に見える」レベルに引き上げる。
現行 Phase 3（MeshPhysicalMaterial の PBR）はリアルタイム・ラスタライズの天井にあり、
本物の宝石の「内部の複雑な模様」（手前と奥のファセットの屈折が多重に干渉する現象）は
1回屈折の近似でしか出せない。この天井を越えるには光の計算方法自体を変える。

## 採用アプローチ: ハイブリッド（動=PBR / 静=パストレース）

「眺めるアプリ」のユーザー行動は2状態に分かれる:
- **動**（傾けて遊ぶ）: 即応性が命 → 現行 Phase 3 PBR を 60fps で維持
- **静**（手を止めて見入る）: 画質が命 → 手が止まった瞬間からパストレーサが
  1〜3秒かけて「現像」し、Cycles級の多重反射・内部干渉模様・分散を持つ静止画に収束

これは「眺めるアプリの核心体験（見入る瞬間）にこそ最高画質を割り当てる」構造で、
コストと目的が一致する。現行 Phase 3 の資産（ジオメトリ・環境・データ）は
すべてパストレーサの入力にそのまま流用でき、捨てるものがない。

デスクトップ先行。モバイル・低性能機・reduce-motion・WebGL2非対応は
パストレースをスキップし PBR のまま（劣化ではなく現行維持）。
モバイル向けプリレンダー（軸3）は将来フェーズとし本計画のスコープ外（YAGNI）。

## ライブラリ

- `three-gpu-pathtracer`（gkjohnson）: three.js シーンを GPU パストレースする実績あるライブラリ。
  新 API `WebGLPathTracer` を使う（`setScene` → 毎フレーム `renderSample()` で累積収束）。
- 依存: `three-mesh-bvh`（同作者・BVH構築）。
- 配信: 既存方針どおり jsdelivr の ESM を importmap に追加（ビルドなし）。
  **最大リスク**: three@0.180.0 とのバージョン整合。Phase 0 のスパイクで先に検証する。

## 環境光（記事の最重要ポイント「環境テクスチャ」）

パストレーサ用シーンに、既存 `buildShowcaseScene()` の**高輝度ライトカード（emissive
MeshBasicMaterial）をそのまま光源として入れる**。パストレーサは emissive メッシュを
実光源として扱うため、これらのカードを通した光が宝石内部で多重反射し、
記事の言う「内部の複雑で美しい模様」が近似でなく計算結果として現れる。
アンビエントは `GradientEquirectTexture`（three-gpu-pathtracer 同梱・手続き的・バイナリ不要）。
→ コード生成の思想を保ったまま実写HDRI相当の複雑さを得る。バイナリ資産をgitに追加しない。

## 状態機械（gem3d.js が所有）

```
[開く] → autoSpin(PBR, ~5秒) → ease-to-rest → settle(500ms静止) → DEVELOP(PT累積)
   ↑                                                                      │
   └──────────────── [傾け入力] 即PBR復帰・PT破棄 ←──────────────────────┘
```

- settle 検出: autoSpin中・|target-cur|>eps・直近setTiltから500ms以内 のいずれかなら「動」。
  すべて解消したら「静」と判定し develop 開始。
- develop: PT を別canvasに累積描画し、サンプル増加に応じて PBR canvas の上に opacity 0→1 でクロスフェード。
- 復帰: 傾け入力が来たら即座に PT canvas を隠し PT 累積をリセット、PBR に戻す（応答遅延ゼロ）。

## ファイル構成

- 新規 `website/gems/gem3d-pathtracer.js`: パストレーサのラッパ。
  `createDeveloper({ renderer, gem, lights, camera, size })` →
  `{ reset(), renderSample()→progress, getCanvas(), dispose() }`。
  重いので gem3d.js から**遅延import**（宝石が静止し、かつ対応端末のときだけ読む）。
- 変更 `website/gems/gem3d.js`: 状態機械・遅延import・クロスフェード・対応判定・disposeの統合。
- 変更 `website/gems/index.html`: importmap に three-mesh-bvh / three-gpu-pathtracer を追加、`?v` 更新。

## 対応判定（capability gating）

`usePathtracer = webgl2 && !reduce && !coarse && !lowCores && floatBufExt`。
非対応時は develop を一切開始せず PBR を維持。

## 検証設計

- Playwright（swiftshader WebGL2）: (a) 非対応時に PBR フォールバックが正しく効く、
  (b) 対応時に PT canvas が生成されコンソールエラー0、(c) develop→傾けで即PBR復帰。
  swiftshader で PT が実走できない場合は「フォールバックが正しく効く」ことを緑にし、
  実GPUでのスクショ目視で画質確認（CIヘッドレスの限界を log で明示）。
- Codex レビュー2周・既存スイート（gem3d/kazasu/zukan/iro/fude）全緑を維持。

## 先行改善（どのフェーズでも効く・計画に内包）

1. 透過レンダリング解像度 `renderer.transmissionResolutionScale` 引き上げ（PBR側の屈折像シャープ化）
2. 石ごとの thickness / attenuationDistance 可変（深い石ほど色濃く・個体差）

## 非目標（YAGNI）

- モバイル向けプリレンダー・ターンテーブル配信（将来フェーズ）
- 実写HDRIのバイナリ同梱（手続き的環境で代替）
- 全36石への3D拡張（別途 Phase 4 として既に予定・本計画と独立）

## リスクと撤退ライン

| リスク | 対応 |
|---|---|
| three-gpu-pathtracer が three@0.180 と非互換 | Phase 0 スパイクで先に確認。非互換なら互換版へピン留め、無理なら本計画を中止し軸2/軸3を再検討 |
| dispersion（分散）非対応 | スパイクで確認。非対応なら PT 側は分散なし・PBR 側の dispersion で妥協 |
| swiftshader で PT 実走不可 | フォールバック検証＋実GPU目視に切替（log明示） |
| 初回 develop の GPU 負荷スパイク | サンプル/解像度を段階調整、develop 中のみ確保し settle 解除で即解放 |

## スパイク結論（2026-07-06・Task 0）

- **互換バージョン**: `three-gpu-pathtracer@0.0.24` + `three-mesh-bvh@0.9.10` が `three@0.180.0` と互換（peerDeps が >=0.180.0 を明示）。
- **importmap 追加要件**: 上記2つに加え、`"three/examples/jsm/"` prefix も必須（PTが内部でPass.js等を絶対importするため）。
- **API**: `WebGLPathTracer` に `setScene`/`renderSample`/`reset`/`dispose` あり。描画先は渡した renderer の `domElement`。
  → PBRと競合させないため **PT専用の別 WebGLRenderer/別canvas** が必要（計画 Task 2 の方針で確定・正しい）。
- **swiftshader**: `--use-gl=swiftshader --enable-webgl --enable-webgl2 --ignore-gpu-blocklist` で実走可。400サンプル累積・エラー0・屈折確認。→ Playwrightで実描画検証が可能。
- **dispersion（分散/ファイア）**: **非対応**。`'dispersion' in mat` は true だが PT 実装に dispersion は無く、見た目に反映されない。
  → 現像された静止画には「多重反射・内部干渉模様」は出るが「虹色のファイア」は出ない。動（PBR）モードには従来通りファイアが出る。
  → この差（静止でファイアが消える）は体験上の判断が必要。CEO確認事項。
