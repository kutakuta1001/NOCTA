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
    title: "NuWord Seed",
    cat: "app",
    url: "https://nuword-nu.vercel.app/seed",
    imgUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&h=600&q=85",
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
    imgUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&h=600&q=85",
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
    imgUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&h=600&q=85",
    thumbClass: "thumb-1",
    badge: "App",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "書いた言葉が鏡になり、自分の姿を映す。AIと対話しながら内省を深めるキャンバス。",
    descEn: "Words become a mirror. An AI-assisted canvas for deep self-reflection and inner dialogue."
  }
];
