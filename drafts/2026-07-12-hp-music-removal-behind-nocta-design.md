# NOCTA HP 改修設計書 — Music 紹介の撤去と Behind NOCTA セクション追加

日付: 2026-07-12
対象: website/index.html のみ(works-data.js はファイルとして残置)
ステータス: CEO レビュー待ち

---

## 目的

1. 未完成のミュージック紹介(全カードが youtubeId: null のプレースホルダー・NuWord 以外はダミー作品)を公開サイトから撤去し、誠実な状態にする
2. プロジェクトを支えるローカル AI エージェントチーム(デザイナー3・コンサル3)を、個人名を出さないミニマルなクレジットとして紹介する

## 決定済み事項(ブレインストーミングでの CEO 判断)

- ミュージック専用セクションは作らない(Coming Soon 帯も置かない)
- 猫の足あと UI は Statement と Tools の間に装飾として残す
- フッターの「音楽」は「音楽(Coming Soon)」のリンクなしテキストに変更
- 統計バーは「楽曲数」を外して3カラム化
- Behind NOCTA はチーム名表記のみ(個人名なし)+ 取扱説明書のチルダ表記パスを小さく併記
- 既存セクションのデザインは変えない

---

## 変更1: PORTFOLIO セクション → 足あとトランジション帯

対象: index.html 758〜791行(section id="works")

- 残すもの: paw-trail(watercolor 足あと6個・歩行アニメーション --paw-dur:1.8s・IntersectionObserver 連動・5色の配色)
- 削除するもの: PORTFOLIO タイトル・サブタイトル・フィルタピル(All/Music/PV/Content)・works-grid
- 新しい姿: py-16〜20 程度のスリムな装飾帯。bg-black/30 border-y border-white/5 の既存トーンは維持し、Statement から Tools への場面転換を足あとだけが横切る
- 足あとの配置(top/left/right の割合)は帯の高さに合わせて再調整する。左から右へ歩く流れは維持
- id="works" のアンカーは削除(参照元も併せて整理・変更2参照)
- 銀猫の物語(足あと → 座る猫 → 眠る猫)はそのまま成立する

## 変更2: 導線と関連コードの整理

- ナビゲーション: デスクトップ(約470行)とモバイルメニュー(約505行)から「Works」リンクを削除
- Hero CTA: 「Works を見る」(href="#works"・580行) → 「作品を見る」(href="#visual")に変更。EN は「View Works」のまま
  ※ 実装者判断の要確認ポイント。リンク先を Tools(#apps)にしたい等あれば指示を
- フッター Creative 列(1050行): 「音楽」の a タグを span に変え「音楽(Coming Soon)」表記へ。hover 装飾は外す
- 統計バー(593〜611行): stat-works の枠を削除し3カラム化。グリッドは grid-cols-2 md:grid-cols-4 → grid-cols-3(モバイルでも3つ横並び。数字は小さいため収まる)
- JavaScript:
  - setCount('stat-works', ...)(1189行)を削除
  - works-grid 描画処理(1286行〜)と filter-pill 処理(1334行〜)を削除
  - works-data.js の script タグを削除(ファイル自体は楽曲リリース時の復活用に残す)
  - yt-modal(YouTube モーダル)は works カード専用のため未使用になるが、楽曲リリース時に復活させるため残置(動作に影響なし)
- i18n 辞書(JA: 1737行付近 / EN: 1779行付近):
  - stats.works / works.subtitle を JA/EN 両方から削除
  - footer.s1 を JA「音楽(Coming Soon)」/ EN「Music (Coming Soon)」に更新
  - hero.cta.works を JA「作品を見る」に更新
- 完了条件: grep で「#works」「works-grid」「NOCTA_WORKS」「stat-works」の参照がゼロになっていること

## 変更3: BEHIND NOCTA セクション(新規)

- 位置: Contact セクションの後・フッター直前(眠る銀猫の直前)
- デザイン: 既存デザイン言語をそのまま使用(section-tag / font-heading / font-jp / border-white/10 罫線 / reveal アニメーション)。新しい装飾は導入しない。py-20 前後のスリムな帯
- 内容(JA):
  - section-tag: Behind NOCTA
  - リード文: 「このプロジェクトは、CEO と、ローカル環境で働く AI エージェントチームが支えています。」
  - クレジット2行:
    - デザイナーチーム — 3 agents / 設計・実装の競作
    - コンサルチーム — 3 agents / 分析・批評・意思決定支援
  - 各行の下に取扱説明書パスをコピー可能な小さいモノスペーステキストで併記(リンクにしない):
    - manual: ~/designer/CLAUDE.md
    - manual: ~/.claude/commands/references/consulting-common.md
- EN 訳も i18n 辞書に追加(新規キー: behind.tag / behind.lead / behind.design.name / behind.design.desc / behind.consult.name / behind.consult.desc)
- ナビゲーションには追加しない(ミニマル方針)
- 注意: file:// リンクはブラウザが https ページからの遷移をブロックするため、パスはテキスト表記とする。フルパス(ユーザー名入り)は公開サイトに載せない

## スコープ外

- VISUAL セクション内の Music サブセクション(楽曲連動ビジュアル)は今回触らない
- works-data.js の中身の編集はしない(読み込みを外すのみ)
- コミット・デプロイは CEO 確認後に別途実行

## 追記(2026-07-13・CEO判断による変更1の再構成)

実装後のCEOレビューで、足あと帯を「PORTFOLIO 章扉」に再構成することを決定した。

- PORTFOLIO タイトル+サブタイトル+足あと(元の配置)を復元し、`section id="portfolio"` とする
- タイトル下に3カテゴリピルを配置: Tools(#apps へスクロール)/ Visual(#visual へスクロール)/ Music — Coming Soon(淡色・クリック不可)
- Hero CTA「作品を見る」の行き先は #visual から #portfolio に変更
- ナビは現状維持(Portfolio リンクは追加しない)
- i18n キー portfolio.subtitle を JA/EN に追加(旧 works.subtitle と同文)

## 検証手順

1. JavaScript 構文エラーがないこと(node --check 相当の確認、またはブラウザコンソール)
2. ローカルサーバー(python3 -m http.server)で表示確認: 足あと帯・統計3カラム・Behind NOCTA・フッター表記
3. 言語切替(JA/EN)で新規・変更キーが正しく切り替わること
4. grep で #works / works-grid / NOCTA_WORKS / stat-works の残存参照がゼロであること
5. website-reviewer エージェントで最終検証
