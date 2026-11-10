/**
 * NOCTA Works Data
 *
 * 曲を追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * youtubeId : YouTube動画ID（例: "dQw4w9WgXcQ"）。
 *             null の場合、カードはクリック不可（準備中状態）になります。
 *
 * cat       : フィルター用カテゴリ。"music" | "pv" | "content"
 *
 * thumbClass: サムネイル背景グラジエント。thumb-1〜thumb-6 から選択。
 */
const NOCTA_WORKS = [
  {
    title: "NuWord",
    cat: "music",
    youtubeId: null,          // TODO: リリース後に YouTube 動画 ID を設定
    thumbClass: "thumb-1",
    badge: "Music",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "森林から始まる冒険の出発シーン。疾走感のある伴奏と、期待感を胸に抱く前向きな世界観。",
    descEn: "An adventure begins in the forest. Uplifting J-pop with a driving beat and a hopeful world."
  }
];
