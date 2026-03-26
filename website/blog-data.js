/**
 * NOCTA Blog Data
 *
 * 記事は /blog-publish コマンドで自動追加されます。
 * 手動で追加する場合は配列の先頭に新しいオブジェクトを追加してください。
 *
 * slug        : URL用識別子（英数字・ハイフンのみ、最大50文字）
 * title       : 記事タイトル
 * cat         : "music" | "essay"
 * date        : "YYYY-MM-DD" 形式
 * excerpt     : カード表示用の抜粋（最初の句点まで、または150文字まで）
 * contentHtml : AI整形済みHTML本文（<h2>/<p>/<strong> を使用）
 */
const NOCTA_BLOG = [
  {
    slug: "sample-post",
    title: "サンプル記事",
    cat: "essay",
    date: "2026-03-26",
    excerpt: "これはサンプル記事です。/blog-publish で実際の記事に差し替えてください。",
    contentHtml: "<p>これはサンプル記事です。<strong>/blog-publish</strong> コマンドで実際の記事に差し替えてください。</p>"
  }
];
