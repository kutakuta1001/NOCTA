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
  },
  {
    title: "Neon Cascade",
    cat: "pv",
    youtubeId: null,
    thumbClass: "thumb-1",
    badge: "PV",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "シネマティック映像とシンセウェーブが融合した未来的MV。視覚と音楽が一体となった体験を追求。",
    descEn: "A futuristic MV blending cinematic visuals and synthwave. An experience where sight and sound merge."
  },
  {
    title: "Solitude.exe",
    cat: "music",
    youtubeId: null,
    thumbClass: "thumb-2",
    badge: "Music",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "深夜のためのアンビエントトラック。静寂の中に宿る、内省的なサウンドスケープ。",
    descEn: "An ambient track for late nights. An introspective soundscape born from silence."
  },
  {
    title: "Brand Film — NEXUS",
    cat: "content",
    youtubeId: null,
    thumbClass: "thumb-3",
    badge: "Content",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "タイアップブランドのためのショートフィルム。世界観からサウンドまで一気通貫で制作。",
    descEn: "A short film for a tie-up brand. Produced end-to-end, from concept to sound design."
  },
  {
    title: "Void Protocol",
    cat: "music",
    youtubeId: null,
    thumbClass: "thumb-4",
    badge: "Music",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "ダーク・テクノとアンビエントが交差する、没入感の高いコンセプトアルバムより。",
    descEn: "From a concept album where dark techno meets ambient sound. High-immersion listening."
  },
  {
    title: "Organic Syntax",
    cat: "pv",
    youtubeId: null,
    thumbClass: "thumb-5",
    badge: "PV",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "自然とデジタルが交差するボタニカル映像作品。生命の律動をビジュアルで表現。",
    descEn: "A botanical visual piece where nature and digital worlds intersect. Life's rhythm in visuals."
  }
];
