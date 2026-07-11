/**
 * NOCTA HiNa — 誕生HiNa: 12ヶ月の贈り物棚 データ
 *
 * 生まれた月を選ぶと、その月の誕生花・誕生石・HiNa誕生色・銀猫の祝福1文が
 * 一枚の贈り物カードになる（birth-hina.js が描画）。
 *
 * month     : 1〜12の整数
 * flower    : { name(誕生花・和名), hex(代表色) }
 * stone     : { name(誕生石), hex(代表色) }
 * hinaColor : { name(HiNa誕生色・日本の伝統色), hex }
 * blessing  : 銀猫の祝福1文（叩き台。1/5/10月は仕上げ基準、他9件もCEO選択前の草案）
 *
 * 出典: 誕生花・誕生石は既存データ（flora-data.js / gems-data.js のbirthMonths）に基づく代表choice。
 * HiNa誕生色・祝福文は計画書(docs/superpowers/plans/2026-07-11-hina-concept-birth.md)の叩き台をそのまま採用。
 */
window.HINA_BIRTH = [
  {
    month: 1,
    flower: { name: "水仙", hex: "#F2C14E" },
    stone: { name: "ガーネット", hex: "#7B1113" },
    hinaColor: { name: "紅", hex: "#D7003A" },
    blessing: "冬を照らす小さな灯が、あなたのそばにありますように。"
  },
  {
    month: 2,
    flower: { name: "梅", hex: "#D96BA0" },
    stone: { name: "アメジスト", hex: "#9966CC" },
    hinaColor: { name: "梅鼠", hex: "#C099A0" },
    blessing: "まだ寒い日にひらく梅のように、心にひとつ、ほころびを。"
  },
  {
    month: 3,
    flower: { name: "チューリップ", hex: "#E63A2E" },
    stone: { name: "アクアマリン", hex: "#9FD8DE" },
    hinaColor: { name: "桜色", hex: "#FEF4F4" },
    blessing: "うすももいろの風が、あなたの新しい季節を運びますように。"
  },
  {
    month: 4,
    flower: { name: "桜", hex: "#F7C6D4" },
    stone: { name: "ダイヤモンド", hex: "#C7D2DE" },
    hinaColor: { name: "若草色", hex: "#C3D825" },
    blessing: "芽ぶく色のなかで、あなたのはじまりがやわらかくありますように。"
  },
  {
    month: 5,
    flower: { name: "藤", hex: "#8172B8" },
    stone: { name: "エメラルド", hex: "#0F5C3D" },
    hinaColor: { name: "藤色", hex: "#BBA1CB" },
    blessing: "風にゆれる藤の色が、あなたの五月をやわらかく包みますように。"
  },
  {
    month: 6,
    flower: { name: "紫陽花", hex: "#5F82BD" },
    stone: { name: "パール", hex: "#F2ECE0" },
    hinaColor: { name: "露草色", hex: "#38A1DB" },
    blessing: "雨の日の青がしずかに澄んで、あなたの時間を潤しますように。"
  },
  {
    month: 7,
    flower: { name: "蓮", hex: "#E8A0BF" },
    stone: { name: "ルビー", hex: "#9B111E" },
    hinaColor: { name: "浅葱色", hex: "#00A3AF" },
    blessing: "水の上にひらく花のように、涼しい静けさがそばにありますように。"
  },
  {
    month: 8,
    flower: { name: "ひまわり", hex: "#F5C518" },
    stone: { name: "ペリドット", hex: "#A6BE3F" },
    hinaColor: { name: "青竹色", hex: "#7EBEAB" },
    blessing: "陽のなかの緑のように、あなたの夏がまっすぐに伸びますように。"
  },
  {
    month: 9,
    flower: { name: "桔梗", hex: "#5B6FB0" },
    stone: { name: "サファイア", hex: "#0F52BA" },
    hinaColor: { name: "竜胆色", hex: "#9079AD" },
    blessing: "深まる青のなかで、あなたの想いが澄んでゆきますように。"
  },
  {
    month: 10,
    flower: { name: "金木犀", hex: "#F08A24" },
    stone: { name: "オパール", hex: "#C9E4E0" },
    hinaColor: { name: "柿色", hex: "#ED6D3D" },
    blessing: "金木犀の香りのように、日々にそっと灯がともりますように。"
  },
  {
    month: 11,
    flower: { name: "菊", hex: "#D4A02C" },
    stone: { name: "トパーズ", hex: "#6BB8E0" },
    hinaColor: { name: "琥珀色", hex: "#BF783A" },
    blessing: "実りの色を集めて、あなたの一年が静かに満ちますように。"
  },
  {
    month: 12,
    flower: { name: "シクラメン", hex: "#C6407A" },
    stone: { name: "ラピスラズリ", hex: "#26619C" },
    hinaColor: { name: "鉄紺", hex: "#17184B" },
    blessing: "夜のいちばん深い青のなかに、小さなあかりがともりますように。"
  }
];
