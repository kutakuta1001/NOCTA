/**
 * NOCTA Apps Portfolio Data
 *
 * アプリを追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * title        : アプリ名
 * cat          : "app"（将来の拡張用。現時点は "app" のみ）
 * url          : アプリの URL（モーダルの「アプリを開く」ボタン先）
 * thumbClass   : Works と同じグラデーション背景クラス（"thumb-1"〜"thumb-6"）
 * badge        : バッジ表示テキスト
 * badgeColorClass : Tailwind 色クラス
 * descJa       : 日本語説明
 * descEn       : 英語説明
 */
const NOCTA_APPS = [
  {
    title: "HiNa Hare",
    cat: "app",
    url: "./iro/index.html",
    imgUrl: "./images/hare.jpg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "銀猫が見つけた日本の伝統色48色の図鑑。色の物語とかさね配色に加え、選んだ色のインクで文字を書き遊べる小さな書斎をたずさえた、HiNaコレクション第三部。",
    descEn: "HiNa Hare — the silver cat's catalogue of 48 traditional Japanese colors. Beyond their stories and layered pairings, a little writing room where you play with ink in the color you choose. Part III of the HiNa collection."
  },
  {
    title: "HiNa Ichi",
    cat: "app",
    url: "./flora/index.html",
    imgUrl: "./images/ichi.jpg",
    thumbClass: "thumb-6",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "銀猫が見つけた季節の花24種の図鑑。花言葉と誕生花に加え、指でなぞると花が咲いて散り、手を止めると庭が画面いっぱいの草花に自生して仕上がる。気に入った庭は押し花にして持ち帰れる、HiNaコレクション第二部。",
    descEn: "HiNa Ichi — the silver cat's catalogue of 24 seasonal flowers. Beyond flower meanings and birth flowers, trace to make flowers bloom and scatter; rest, and the garden grows itself into a field of blossoms you can press and keep. Part II of the HiNa collection."
  },
  {
    title: "HiNa Gyu",
    cat: "app",
    url: "./gems/index.html",
    imgUrl: "./images/gyu.jpg",
    thumbClass: "thumb-5",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "銀猫が見つけた宝石36種の図鑑。石言葉と誕生石に加え、手のひらで光にかざすと面がきらめき、手を止めると内部の反射までゆっくり現れる、HiNaコレクション第一部。",
    descEn: "HiNa Gyu — the silver cat's catalogue of 36 gemstones. Beyond stone meanings and birthstones, hold each to the light and its facets catch fire; pause, and the inner reflections slowly emerge. Part I of the HiNa collection."
  },
  {
    title: "NuWord still",
    cat: "app",
    url: "https://kutakuta1001.github.io/NOCTA/still/",
    imgUrl: "./images/still.jpg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "ドットに触れ、ただ止まる。5・10・15分の静かな瞑想タイマー。",
    descEn: "Touch the dot. Simply be still. A quiet meditation timer for 5, 10, or 15 minutes."
  },
  {
    title: "NuWord Seed",
    cat: "app",
    url: "https://nuword-nu.vercel.app/seed",
    imgUrl: "./images/seed.jpg",
    thumbClass: "thumb-3",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "思考の種を蒔く、カード型メモアプリ。アイデアをカードに書き、リンクでつなぎ、育てる。",
    descEn: "A card-based note app to plant and grow ideas. Write, link, and cultivate your thoughts."
  },
  {
    title: "NuWord Verse",
    cat: "app",
    url: "https://nuword-nu.vercel.app/verse",
    imgUrl: "./images/verse.jpg",
    thumbClass: "thumb-2",
    badge: "App",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "詩節のように言葉を手もとに置く。読書中に出会った印象的な一文をストックするウェブアプリ。",
    descEn: "Keep words close, like verses. A web app to collect and revisit memorable lines from your reading."
  },
  {
    title: "NuWord inner canvas",
    cat: "app",
    url: "https://nner-canvas.vercel.app",
    imgUrl: "./images/inner-canvas.jpg",
    thumbClass: "thumb-1",
    badge: "App",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "書いた言葉が鏡になり、自分の姿を映す。AIと対話しながら内省を深めるキャンバス。",
    descEn: "Words become a mirror. An AI-assisted canvas for deep self-reflection and inner dialogue."
  }
];
