# Gyu「光にかざす」設計書 — ライトボックスの進化

作成日: 2026-07-05
起案・実装: Opus 4.7（CEOフル委任）
前提: HiNa体験原則4カ条の第4「遊んで跡を残す」を Gyu にも実装。Hare（筆あそび）と対をなす体験のレイヤー。

## 1. コンセプト

「宝石をピックアップして光にかざす」— 手で持っているような臨場感を出す。

Hareが「その色で書く」なら、Gyuは「その石を光にかざして眺める」。書く/眺めるはHiNaの銀猫ストーリー（散歩の途中で見つけたものを眺める）と自然に呼応する。

## 2. 実装方針

既存の`openLightbox`（画像を全画面で表示するだけ）を拡張し、以下の光学的特徴を追加:

1. **3D傾き**: マウス位置に追随して宝石画像がperspectiveでrotateX/Y。手のひらで石を傾けているような視差
2. **スペキュラハイライト**: マウス位置に光の輝きが移動（`::before`のradial-gradient・mix-blend-mode:screen）
3. **虹色プリズム反射**: 宝石の縁に薄い虹色（conic-gradient）が石の向きで少し動く
4. **色相の微妙な変化**: マウス位置に応じてCSS `hue-rotate` を±8deg振る（宝石が動くと色相が変わる感）
5. **深い影**: 宝石の下に大きなソフトシャドウ（実在感の要）
6. **DeviceOrientation対応**: モバイルでは端末の傾きに追随（許可制・ユーザーが「傾きを使う」を明示的にonにする）
7. **reduced-motion**: 動きを止めるが、色相と光沢の静止的な効果は維持

## 3. ファイル計画

| ファイル | 変更 |
|---|---|
| `website/gems/kazasu.js` | **新規** 光沢エンジン（NoctaKazasu.attach/detach・~180行） |
| `website/gems/index.html` | ライトボックスHTML/CSSに光沢レイヤ追加・kazasu.js読込・「光にかざす」CTA文言 |
| `website/apps-data.js` | HiNa Gyu紹介文に「光にかざす」を追記 |
| `website/DESIGN-NOTES.md` | HiNa §7に「Gyu 光にかざす」節を追記 |

## 4. UI詳細

**CTA**: `data-lightbox`chipを「この石を眺める」→「**光にかざす**」に文言変更＋新デザイン（Hareの`.fude-cta`スタイルを継承・その石のaccentColor塗り）

**ライトボックス（進化版）**:
- 既存の`<img>`を`.gyu-gem-wrap`でラップ、内側に`.gyu-gem`（transform-preservedな3D要素）
- `.gyu-highlight`: mix-blend-mode:screenの光の点（マウスに追随）
- `.gyu-prism`: 縁の虹色（薄く）
- `.gyu-shadow`: 下部の柔らかい影
- 底部の既存キャプション（英名・和名・石言葉・出典リンク）は維持

## 5. 主要ロジック（kazasu.js）

```js
// マウスイベント: 中央からの距離を-1〜1に正規化
function onMove(e) {
  var rect = wrap.getBoundingClientRect();
  var mx = (e.clientX - rect.left) / rect.width * 2 - 1;   // -1〜1
  var my = (e.clientY - rect.top) / rect.height * 2 - 1;
  // 3D傾き（最大 ±12°）
  gem.style.transform = 'rotateY(' + (mx * 12) + 'deg) rotateX(' + (-my * 12) + 'deg)';
  // ハイライト位置（マウス周辺）
  highlight.style.left = (mx * 40 + 50) + '%';
  highlight.style.top = (my * 40 + 50) + '%';
  // 色相回転
  gem.style.filter = 'hue-rotate(' + (mx * 8) + 'deg) saturate(1.15) brightness(1.02)';
}
```

DeviceOrientation対応:
```js
window.addEventListener('deviceorientation', function (e) {
  var beta = e.beta;   // 前後傾き
  var gamma = e.gamma; // 左右傾き
  // マウスと同じ座標系にマッピング
  onMoveVirtual(gamma / 45, beta / 45);
});
```
iOS 13+のpermission要求は「傾きを使う」ボタンでユーザーがトリガー。

## 6. アクセシビリティ・互換
- ライトボックス自体は既存ダイアログ管理（core registerDialog）を継続
- reduced-motion: transform・hue-rotate無効、静的な光沢のみ
- キーボード: ESC閉じ（既存）
- タッチ: pointermoveで動く（ドラッグでなくても効く）

## 7. 検証計画
1. `node --check` fude.js相当のkazasu.js構文チェック
2. 既存gems 18項目（verify-zukan.jsのgemsセクション）維持
3. 新規Playwright: 光にかざすで画像が3D transform属性を持つ・マウス移動で変化・ESC閉じ・reduced-motion時transform無効
4. Codexレビュー2周
5. push→ライブ確認→DESIGN-NOTES更新→handoff

本設計は叩き台です。数値（傾き角度・ハイライト範囲・色相回転量）は自由に調整してください。
