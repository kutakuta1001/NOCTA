# ブレインストーミング: The First Flower リデザイン
日付: 2026-04-18

---

## 合意事項

| Q | 回答 | 方針 |
|---|------|------|
| Q1 アイデンティティ | C | TFFは独立ブランド。NOCTAとの視覚的共通点は薄くてよい |
| Q2 カラーパレット | 新規パレット指定 | パステル系（下記トークン表） |
| Q3 Profileセクション背景 | Q2と統一 | 新パレットで全セクション統一 |
| Q4 写真 | A（後で追加） | プレースホルダー維持・tff-profile-data.jsで管理 |
| Q5 プロフィール文 | いつでも変更できるように | `tff-profile-data.js` を新規作成、HTML分離 |
| Q6 外部リンク | 3つとも継続 | アイコンをSVG化・色を新パレットに統一 |
| Q7 セクション構成 | そのまま | Hero → Profile → Quotes → Blog |
| Q8 Claude Design | OK | Midjourneyプロンプト3点生成 |

---

## カラートークン

| トークン | HEX | CMYK元 | 用途 |
|---------|-----|--------|------|
| `tff-base` | `#FCFBF5` | C1M1Y3 | ページベース背景 |
| `tff-pink` | `#FDD9D9` | M15Y8 | ソフトピンク（グラデ・カード） |
| `tff-rose` | `#EEA4C0` | C5M35Y8 | ローズアクセント（ディバイダー・バッジ） |
| `tff-mint` | `#B8E3B7` | C28Y25 | ミント（Flickrアイコン・アクセント） |
| `tff-teal` | `#A6DDD6` | C35Y10 | ティール（Booklogアイコン・サブアクセント） |
| `tff-accent` / `tff-purple` | `#B168A8` | C30M55Y5 | パープル（見出し・ラベル） |
| `tff-dark` | `#705E92` | C45M45K20 | ダークパープル（暗セクション背景・フッター） |
| `tff-deep` | `#3D2E52` | ― | 最深部パープル（ボディテキスト・グラデ起点） |
| `tff-sub` | `#9A86B0` | ― | サブテキスト |

---

## セクション別背景グラデ

| セクション | グラデ |
|-----------|------|
| Hero | `#3D2E52 → #705E92 → #B168A8 → #EEA4C0 → #FDD9D9` |
| Profile | `#FDD9D9 → #FCFBF5 → #A6DDD6 → #B8E3B7` |
| Quotes | `#3D2E52 → #4E3D72 → #705E92 → #3D2E52` |
| Blog | `#3D2E52 → #4A3870 → #5E4E82 → #3D2E52` |
| Footer | `bg-tff-dark`（#705E92） |

---

## コンテンツ管理

- `tff-profile-data.js` を新規作成
- `TFF_PROFILE.bio` / `.hobbiesList` / `.hobbyDetail` / `.photos[]` を定義
- index.html の profile セクションは `renderProfile()` でこのJSから動的レンダリング
- プロフィール更新時は `tff-profile-data.js` だけ編集すればOK

---

## アーカイブリンクのアイコン変更

| サービス | 絵文字（旧） | SVG + 色（新） |
|--------|------------|--------------|
| Ameblo | ✏️ | Pen SVG + `#EEA4C0`（ローズ） |
| ブクログ | 📚 | Book SVG + `#A6DDD6`（ティール） |
| Flickr | 📷 | Camera SVG + `#B8E3B7`（ミント） |
| 矢印 | → | ↗ SVG（各カードのアクセントカラー） |

---

## 実装スコープ

- [x] ブレスト保存
- [ ] カラートークン全置換
- [ ] 各セクション背景グラデ更新
- [ ] Nav リンク色の明暗対応（ヘッダーがlight/darkで切り替わる）
- [ ] `tff-profile-data.js` 新規作成・renderProfile()実装
- [ ] アーカイブリンク SVGアイコン化
- [ ] Blog カードバッジカラー更新
- [ ] Midjourneyプロンプト生成 → `outputs/prompts/tff-visual-prompts.md`
