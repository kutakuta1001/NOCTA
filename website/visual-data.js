/**
 * NOCTA Visual Portfolio Data
 *
 * 画像を追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * cloudinaryUrl : Cloudinary のフル解像度 URL
 * thumbUrl      : サムネ用 URL（cloudinaryUrl の /upload/ 直後に w_600/ を挿入）
 *                 例: .../upload/v123/img.jpg → .../upload/w_600/v123/img.jpg
 * cat           : "art" | "photo"
 */
const NOCTA_VISUALS = [
  {
    title: "Sample Art",
    cat: "art",
    cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    thumbUrl: "https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "サンプル。Cloudinary の URL に差し替えてください。",
    descEn: "Sample. Replace with your Cloudinary URL."
  }
];
