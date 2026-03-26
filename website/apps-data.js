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
    title: "Thought Network",
    cat: "app",
    url: "https://example.com/thought-network",
    thumbClass: "thumb-3",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "過去のメモを起点に、自分の思考をネットワーク状に可視化・記録できるウェブアプリ。",
    descEn: "A web app to visualize and record your thoughts as a network, starting from past notes."
  },
  {
    title: "Book Highlights",
    cat: "app",
    url: "https://example.com/book-highlights",
    thumbClass: "thumb-2",
    badge: "App",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "読書中に出会った印象的な文章をストックし、ランダムに表示するウェブアプリ。",
    descEn: "A web app to store and randomly display memorable passages encountered while reading."
  },
  {
    title: "Self Reflection",
    cat: "app",
    url: "https://example.com/self-reflection",
    thumbClass: "thumb-1",
    badge: "App",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "日々の内省を記録し、自己理解を深めるためのウェブアプリ。",
    descEn: "A web app for recording daily reflections and deepening self-understanding."
  }
];
