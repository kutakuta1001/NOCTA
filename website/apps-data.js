/**
 * NOCTA Apps Portfolio Data
 *
 * Tools のカードを足すときは、先に docs/tools-collections.md を読む。
 * 新しいカードは NOCTA_APPS の先頭に追加する。collection が抜けたコミットは copy-audit-guard が止める。
 *
 * NOCTA_APP_COLLECTIONS（Tools 欄の表紙。並び順がそのまま表示順）
 * key        : カードの collection に書く値
 * title      : コレクションの正式名
 * label      : 表紙とカードのバッジに出す短い名前
 * verbJa / verbEn : 表紙の見出しの動詞
 * descJa / descEn : 表紙の説明 1 行（カードと同じく文言監査の対象）
 * accent     : 表紙の色
 * badgeClass : カードとモーダルのバッジの Tailwind クラス
 * pageUrl    : コレクションのページ（ない場合は ""）
 *
 * NOCTA_APPS（カード）
 * title        : アプリ名
 * collection   : "nuword" / "hina" / "yori" のどれか（必須）。バッジはここから決まるので手で書かない
 * cat          : "app"（将来の拡張用。現時点は "app" のみ）
 * url          : アプリの URL（モーダルの「アプリを開く」ボタン先）
 * imgUrl       : サムネイル画像
 * thumbClass   : Works と同じグラデーション背景クラス（"thumb-1"〜"thumb-6"）。画像がないときに使う
 * descJa       : 日本語説明
 * descEn       : 英語説明
 */
const NOCTA_APP_COLLECTIONS = [
  {
    key: "nuword",
    title: "NuWord Collection",
    label: "NuWord",
    verbJa: "内省する",
    verbEn: "Reflect",
    descJa: "心を静め、日々の気づきを結んでいく。",
    descEn: "Quiet the mind, and connect each day's small noticings.",
    accent: "#D8C9A8",
    badgeClass: "bg-[#D8C9A8]/15 text-[#D8C9A8]",
    pageUrl: "https://nuword-nu.vercel.app"
  },
  {
    key: "hina",
    title: "HiNa Collection",
    label: "HiNa",
    verbJa: "集める",
    verbEn: "Collect",
    descJa: "石や花、世界の国々を、集めて眺める。",
    descEn: "Collect and gaze at stones, flowers and the countries of the world.",
    accent: "#B9C4B1",
    badgeClass: "bg-[#B9C4B1]/15 text-[#B9C4B1]",
    pageUrl: "./hina/"
  },
  {
    key: "yori",
    title: "Yori Collection",
    label: "Yori",
    verbJa: "学ぶ",
    verbEn: "Learn",
    descJa: "好きなことを入り口に、深めていく。",
    descEn: "Start from what you enjoy, and go deeper.",
    accent: "#B3BCCB",
    badgeClass: "bg-[#B3BCCB]/15 text-[#B3BCCB]",
    pageUrl: ""
  }
];

const NOCTA_APPS = [
  {
    title: "NuWord before",
    collection: "nuword",
    cat: "app",
    url: "https://nuword-nu.vercel.app/before",
    imgUrl: "./images/before.jpg",
    thumbClass: "thumb-4",
    descJa: "はじめる前の数十秒。問いをひとつ拾い、気づきを持って始める。",
    descEn: "A few dozen seconds before you begin. Pick up one question, and start with what you notice."
  },
  {
    title: "HiNa Mado",
    collection: "hina",
    cat: "app",
    url: "./mado/index.html",
    imgUrl: "./mado/cover.jpg",
    thumbClass: "thumb-4",
    descJa: "知らない国の窓をひとつ開けて、日本にない言葉や考え方、風習に出会う。",
    descEn: "Open a window onto a country you don't know, and meet words, ways of thinking and customs Japan doesn't have."
  },
  {
    title: "lampnook",
    collection: "yori",
    cat: "app",
    url: "./lampnook/index.html",
    imgUrl: "./lampnook/cover.svg",
    thumbClass: "thumb-4",
    descJa: "ドット絵の小さな部屋で、ランプの灯りのそばで二十五分。集中を重ねるほど行ける場所が開いていく集中タイマー。",
    descEn: "Twenty-five minutes by lamplight in a small pixel-art room. A focus timer that opens up more places the more you focus."
  },
  {
    title: "Barside",
    collection: "yori",
    cat: "app",
    url: "./barside/index.html",
    imgUrl: "./barside/cover.svg",
    thumbClass: "thumb-4",
    descJa: "夜のバーの常連と、英語でひとこと。会話中は直されず、帰り道の手帳でふりかえる会話練習。自分の API キーで使える。",
    descEn: "A little English with the regulars at a night bar. No corrections mid-conversation, and a notebook to look back on during the walk home. Bring your own API keys."
  },
  {
    title: /* strategy-name:start */ "HiNa Kai" /* strategy-name:end */,
    collection: "hina",
    cat: "app",
    url: "./strategy/index.html",
    imgUrl: "./images/kai.jpg",
    thumbClass: "thumb-4",
    descJa: "歴史の判断を図でたどる、十八の思考の地図。拾った言葉を今日の仕事へ映す。",
    descEn: "Eighteen maps of thought that trace historical decisions. Carry the words you collect into today's work."
  },
  {
    title: "HiNa Kihi",
    collection: "hina",
    cat: "app",
    url: "./kihi/index.html",
    imgUrl: "./images/kihi.jpg",
    thumbClass: "thumb-4",
    descJa: "三十の家紋を眺め、色と余白をしつらえて、一枚の絵に。",
    descEn: "Thirty Japanese family crests. Contemplate their forms and compose a single picture with color and space."
  },
  {
    title: "HiNa Hare",
    collection: "hina",
    cat: "app",
    url: "./iro/index.html",
    imgUrl: "./images/hare.jpg",
    thumbClass: "thumb-4",
    descJa: "日本の伝統色の図鑑。色の物語とかさね配色を眺め、選んだ色のインクで文字も書ける。",
    descEn: "A field guide to traditional Japanese colors. Read their stories and layered pairings, and write in ink of the color you choose."
  },
  {
    title: "HiNa Ichi",
    collection: "hina",
    cat: "app",
    url: "./flora/index.html",
    imgUrl: "./images/ichi.jpg",
    thumbClass: "thumb-6",
    descJa: "季節の花を眺める図鑑。花言葉と誕生花を添え、指でなぞると花が咲く。",
    descEn: "A field guide to seasonal flowers, with flower meanings and birth flowers. Trace with your finger and flowers bloom."
  },
  {
    title: "HiNa Gyu",
    collection: "hina",
    cat: "app",
    url: "./gems/index.html",
    imgUrl: "./images/gyu.jpg",
    thumbClass: "thumb-5",
    descJa: "世界の宝石と原石を眺める図鑑。石言葉と誕生石を添え、光にかざすと面がきらめく。",
    descEn: "A field guide to the world's gems and rough stones, with stone meanings and birthstones. Hold one to the light and its facets sparkle."
  },
  {
    title: "NuWord still",
    collection: "nuword",
    cat: "app",
    url: "https://kutakuta1001.github.io/NOCTA/still/",
    imgUrl: "./images/still.jpg",
    thumbClass: "thumb-4",
    descJa: "ドットに触れ、ただ止まる。5・10・15分の静かな瞑想タイマー。",
    descEn: "Touch the dot. Simply be still. A quiet meditation timer for 5, 10, or 15 minutes."
  },
  {
    title: "NuWord Seed",
    collection: "nuword",
    cat: "app",
    url: "https://nuword-nu.vercel.app/seed",
    imgUrl: "./images/seed.jpg",
    thumbClass: "thumb-3",
    descJa: "思考の種を蒔く、カード型メモアプリ。アイデアをリンクでつなぎ、育てる。",
    descEn: "A card-based note app for planting ideas. Link them and let them grow."
  },
  {
    title: "NuWord Verse",
    collection: "nuword",
    cat: "app",
    url: "https://nuword-nu.vercel.app/verse",
    imgUrl: "./images/verse.jpg",
    thumbClass: "thumb-2",
    descJa: "読書中に出会った印象的な一文をストックするウェブアプリ。",
    descEn: "A web app for collecting memorable lines from your reading."
  },
  {
    title: "NuWord Inner Canvas",
    collection: "nuword",
    cat: "app",
    url: "https://nner-canvas.vercel.app",
    imgUrl: "./images/inner-canvas.jpg",
    thumbClass: "thumb-1",
    descJa: "書いた言葉が鏡になり、自分の姿を映す。AIと対話しながら内省を深めるキャンバス。",
    descEn: "Words become a mirror. An AI-assisted canvas for deep self-reflection and inner dialogue."
  }
];
