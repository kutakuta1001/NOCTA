# Tools のコレクション分類

HP の Tools 欄（`website/index.html` の `#apps`）は、ツールを 3 つのコレクションに分けて並べる。
見出しの下に各コレクションの表紙があり、押すとそのコレクションのカードだけに絞り込まれる。
定義とカードはどちらも `website/apps-data.js` にあり、ページとコミット時のチェックはここを正とする。

設計の経緯: `docs/superpowers/specs/2026-10-17-tools-collections-design.md`

## 3 つのコレクション

| key | 表示名 | 表紙の動詞 | 何のためのコレクションか |
|---|---|---|---|
| `nuword` | NuWord Collection | 内省する | 心を静め、瞑想し、日々の気づきを捉え、点と点を線で結んでアウトプットを出す。内省のためのシリーズ |
| `hina` | HiNa Collection | 集める | 石・花・世界など、さまざまな観点を面白いと感じるために収集・観察する。収集欲を満たすシリーズ |
| `yori` | Yori Collection | 学ぶ | CEO の趣味を土台に、それを深掘る（英語・作業タイマーなど）。学習欲を満たすシリーズ |

### 見分け方

新しいツールがどれに入るかは、ツールが人に何をさせるかで決める。

- 心を静めて、気づきを書き留めたりつないだりする → `nuword`
- 世界のあるジャンル（石・花・色・国・家紋など）を集めて眺める → `hina`
- 趣味やスキルを練習して身につける → `yori`

どれにも当てはまらないとき、2 つにまたがると感じるときは、勝手に決めずに CEO に聞く。
コレクションを新しく足す・名前を変える・定義を変えるのも CEO の判断。

## カードを足すとき

`NOCTA_APPS` の**先頭**に 1 件足す。

```js
{
  title: "HiNa ○○",
  collection: "hina",          // 必須。nuword / hina / yori のどれか
  cat: "app",
  url: "./xxx/index.html",
  imgUrl: "./xxx/cover.jpg",
  thumbClass: "thumb-4",
  descJa: "日本語の説明（60 字以内）",
  descEn: "English description"
},
```

- `collection` は必須。抜けている・3 つ以外の値のときは、コミット時に copy-audit-guard が止める（監査済みの印があっても止まる）
- バッジ（カード右上とモーダルの小さな札）はコレクションから自動で決まる。`badge` / `badgeColorClass` は書かない
- 名前の付け方: NuWord と HiNa のツールは名前の頭に「NuWord」「HiNa」を付ける。Yori のツールは独立しているので自由な名前でよい
- 説明文の書き方は `docs/tools-page-copy.md`。`descJa` / `descEn` を変えたコミットは文言監査を求められる

## コレクションの定義（NOCTA_APP_COLLECTIONS）

並び順がそのまま表紙の並び順（NuWord → HiNa → Yori）。表紙の説明 1 行は `descJa` / `descEn` に書くので、カードと同じく文言監査の対象になる。

| key | label | accent（表紙の色） | badgeClass | pageUrl |
|---|---|---|---|---|
| `nuword` | NuWord | `#D8C9A8` | `bg-[#D8C9A8]/15 text-[#D8C9A8]` | `https://nuword-nu.vercel.app` |
| `hina` | HiNa | `#B9C4B1` | `bg-[#B9C4B1]/15 text-[#B9C4B1]` | `./hina/` |
| `yori` | Yori | `#B3BCCB` | `bg-[#B3BCCB]/15 text-[#B3BCCB]` | なし（`""`） |

色は確定パレット（シルバー #B8B4AE × オフホワイト #E8E0D0）に寄せたごく薄い色にしている。変えるときもこの範囲に収める。

## ページの動き（参考）

- 初期表示は全カード。表紙を押すとそのコレクションだけ、同じ表紙をもう一度か「すべて表示」で戻る
- 選んだ状態は URL に残る（`#apps-nuword` / `#apps-hina` / `#apps-yori`）。この URL を共有すると、絞り込んだ状態で開く
- `collection` のないカードは、全表示のときだけ「App」のバッジで出る（ページは壊れない）
