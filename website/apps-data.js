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
    title: "lampnook",
    cat: "app",
    url: "./lampnook/index.html",
    imgUrl: "./lampnook/cover.svg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "ドット絵の小さな部屋で、ランプの灯りのそばで二十五分。集中を重ねるほど行ける場所が開いていく集中タイマー。",
    descEn: "Twenty-five minutes by lamplight in a small pixel-art room. A focus timer that opens up more places the more you focus."
  },
  {
    title: "Barside",
    cat: "app",
    url: "./barside/index.html",
    imgUrl: "./barside/cover.svg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "夜のバーの常連と、英語でひとこと。会話中は直されず、帰り道の手帳でふりかえる会話練習。自分の API キーで使える。",
    descEn: "A little English with the regulars at a night bar. No corrections mid-conversation, and a notebook to look back on during the walk home. Bring your own API keys."
  },
  {
    title: /* strategy-name:start */ "HiNa Kai" /* strategy-name:end */,
    cat: "app",
    url: "./strategy/index.html",
    imgUrl: "./strategy/cover.svg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "歴史の判断を図でたどる、十八の思考の地図。拾った言葉を今日の仕事へ映す。",
    descEn: "Eighteen maps of thought that trace historical decisions. Carry the words you collect into today's work."
  },
  {
    title: "HiNa Kihi",
    cat: "app",
    url: "./kihi/index.html",
    imgUrl: "./kihi/cover.svg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "三十の家紋を眺め、色と余白をしつらえて、一枚の絵に。",
    descEn: "Thirty Japanese family crests. Contemplate their forms and compose a single picture with color and space."
  },
  {
    title: "HiNa Hare",
    cat: "app",
    url: "./iro/index.html",
    imgUrl: "./images/hare.jpg",
    thumbClass: "thumb-4",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "日本の伝統色の図鑑。色の物語とかさね配色を眺め、選んだ色のインクで文字も書ける。",
    descEn: "A field guide to traditional Japanese colors. Read their stories and layered pairings, and write in ink of the color you choose."
  },
  {
    title: "HiNa Ichi",
    cat: "app",
    url: "./flora/index.html",
    imgUrl: "./images/ichi.jpg",
    thumbClass: "thumb-6",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "季節の花を眺める図鑑。花言葉と誕生花を添え、指でなぞると花が咲く。",
    descEn: "A field guide to seasonal flowers, with flower meanings and birth flowers. Trace with your finger and flowers bloom."
  },
  {
    title: "HiNa Gyu",
    cat: "app",
    url: "./gems/index.html",
    imgUrl: "./images/gyu.jpg",
    thumbClass: "thumb-5",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "世界の宝石と原石を眺める図鑑。石言葉と誕生石を添え、光にかざすと面がきらめく。",
    descEn: "A field guide to the world's gems and rough stones, with stone meanings and birthstones. Hold one to the light and its facets sparkle."
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
    descJa: "思考の種を蒔く、カード型メモアプリ。アイデアをリンクでつなぎ、育てる。",
    descEn: "A card-based note app for planting ideas. Link them and let them grow."
  },
  {
    title: "NuWord Verse",
    cat: "app",
    url: "https://nuword-nu.vercel.app/verse",
    imgUrl: "./images/verse.jpg",
    thumbClass: "thumb-2",
    badge: "App",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "読書中に出会った印象的な一文をストックするウェブアプリ。",
    descEn: "A web app for collecting memorable lines from your reading."
  },
  {
    title: "NuWord Inner Canvas",
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
