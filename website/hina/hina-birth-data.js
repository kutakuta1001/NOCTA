/**
 * NOCTA HiNa — 誕生HiNa: 12ヶ月の贈り物棚 データ
 *
 * 生まれた月を選ぶと、その月の誕生花・誕生石・HiNa誕生色・銀猫の祝福1文が
 * 一枚の贈り物カードになる（birth-hina.js が描画）。
 *
 * month     : 1〜12の整数
 * flower    : { name(誕生花・和名), hex(代表色), img(実写URL・Wikimedia Commons原寸),
 *               form(花紋エンブレムの花形。drawEmblem/renderHanaFormが参照する意匠カテゴリ。
 *               star=先端の尖った放射花弁/tulip=カップ状2層花弁/sakura=丸弁+浅い切れ込み/
 *               bell=細長い花弁(藤・シクラメン等の釣鐘・百合状)/layered=八重(密な2層花弁)/
 *               kiku=多数の細い放射花弁/komori=小花が環になったクラスター(梅・紫陽花・金木犀等)) }
 * stone     : { name(誕生石), hex(代表色), img(実写URL・Wikimedia Commons原寸) }
 * hinaColor : { name(HiNa誕生色・日本の伝統色), hex }
 * blessing  : 銀猫の祝福1文（叩き台。1/5/10月は仕上げ基準、他9件もCEO選択前の草案）
 *
 * 出典: 誕生花・誕生石は既存データ（flora-data.js / gems-data.js のbirthMonths）に基づく代表choice。
 * imgは同choiceのimgUrlをそのまま転記（flora-data.js / gems-data.js のtitleと一致する行）。
 * 例外: 9月の石はhina側の呼称が「サファイア」(gems-data.jsには「イエローサファイア」「ブルーサファイア」の
 * 2種のみで単独の「サファイア」表記は無い)。9月誕生石として一般的なブルーサファイアのimgUrlを採用した
 * (判断メモ: 名称の完全一致を優先するなら要CEO確認だが、標本写真としての通りの良さを優先)。
 * HiNa誕生色・祝福文は計画書(docs/superpowers/plans/2026-07-11-hina-concept-birth.md)の叩き台をそのまま採用。
 * flower.form は花紋エンブレム導入(2026-07-11)時に追加。植物学的な厳密分類ではなく、
 * 花紋として描き分けるための意匠カテゴリ(7種)。img/hexは実写標本を撤去した現在も
 * 他画面(flora-data.js連携等)からの参照に備えてそのまま残す。
 */
window.HINA_BIRTH = [
  {
    month: 1,
    flower: { name: "水仙", hex: "#F2C14E", img: "https://upload.wikimedia.org/wikipedia/commons/7/79/Narcissus_poeticus_Spechtensee_01.JPG", form: "star" },
    stone: { name: "ガーネット", hex: "#7B1113", img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Cut_garnet_collection.JPG" },
    hinaColor: { name: "紅", hex: "#D7003A" },
    blessing: "冬を照らす小さな灯が、あなたのそばにありますように。"
  },
  {
    month: 2,
    flower: { name: "梅", hex: "#D96BA0", img: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Prunus_mume_G02.JPG", form: "komori" },
    stone: { name: "アメジスト", hex: "#9966CC", img: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Amethyst_sceptre2.jpg" },
    hinaColor: { name: "梅鼠", hex: "#C099A0" },
    blessing: "まだ寒い日にひらく梅のように、心にひとつ、ほころびを。"
  },
  {
    month: 3,
    flower: { name: "チューリップ", hex: "#E63A2E", img: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Tulip_cv._34.JPG", form: "tulip" },
    stone: { name: "アクアマリン", hex: "#9FD8DE", img: "https://upload.wikimedia.org/wikipedia/commons/6/66/Aquamarine6.jpg" },
    hinaColor: { name: "桜色", hex: "#FEF4F4" },
    blessing: "うすももいろの風が、あなたの新しい季節を運びますように。"
  },
  {
    month: 4,
    flower: { name: "桜", hex: "#F7C6D4", img: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Cherry_blossoms_%28Prunus_x_yedoensis_%27Awanui%27%29_with_dew_drops_close-up.jpg", form: "sakura" },
    stone: { name: "ダイヤモンド", hex: "#C7D2DE", img: "https://upload.wikimedia.org/wikipedia/commons/2/2a/The_Hope_Diamond_-_SIA.jpg" },
    hinaColor: { name: "若草色", hex: "#C3D825" },
    blessing: "芽ぶく色のなかで、あなたのはじまりがやわらかくありますように。"
  },
  {
    month: 5,
    flower: { name: "藤", hex: "#8172B8", img: "https://upload.wikimedia.org/wikipedia/commons/6/69/Japanese_wisteria%2C_Ashikaga_Flower_Park_2.jpg", form: "bell" },
    stone: { name: "エメラルド", hex: "#0F5C3D", img: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Chalk_emerald.jpg" },
    hinaColor: { name: "藤色", hex: "#BBA1CB" },
    blessing: "風にゆれる藤の色が、あなたの五月をやわらかく包みますように。"
  },
  {
    month: 6,
    flower: { name: "紫陽花", hex: "#5F82BD", img: "https://upload.wikimedia.org/wikipedia/commons/1/14/Hydrangea_macrophylla_2021.2.jpg", form: "komori" },
    stone: { name: "パール", hex: "#F2ECE0", img: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Akoya_pearls.JPG" },
    hinaColor: { name: "露草色", hex: "#38A1DB" },
    blessing: "雨の日の青がしずかに澄んで、あなたの時間を潤しますように。"
  },
  {
    month: 7,
    flower: { name: "蓮", hex: "#E8A0BF", img: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Sacred_lotus_Nelumbo_nucifera.jpg", form: "layered" },
    stone: { name: "ルビー", hex: "#9B111E", img: "https://upload.wikimedia.org/wikipedia/commons/9/93/Gemstone_Rubies.jpg" },
    hinaColor: { name: "浅葱色", hex: "#00A3AF" },
    blessing: "水の上にひらく花のように、涼しい静けさがそばにありますように。"
  },
  {
    month: 8,
    flower: { name: "ひまわり", hex: "#F5C518", img: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Sunflowers_helianthus_annuus.jpg", form: "kiku" },
    stone: { name: "ペリドット", hex: "#A6BE3F", img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Peridot_with_ludwigite_inclusion_-_faceted_gemstone_peridot_from_Pakistan.jpg" },
    hinaColor: { name: "青竹色", hex: "#7EBEAB" },
    blessing: "陽のなかの緑のように、あなたの夏がまっすぐに伸びますように。"
  },
  {
    month: 9,
    flower: { name: "桔梗", hex: "#5B6FB0", img: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Platycodon_grandiflorus_%28flower_s2%29.jpg", form: "star" },
    stone: { name: "サファイア", hex: "#0F52BA", img: "https://upload.wikimedia.org/wikipedia/commons/3/37/Sapphire_%28corundum%29_%2826663158752%29.jpg" },
    hinaColor: { name: "竜胆色", hex: "#9079AD" },
    blessing: "深まる青のなかで、あなたの想いが澄んでゆきますように。"
  },
  {
    month: 10,
    flower: { name: "金木犀", hex: "#F08A24", img: "https://upload.wikimedia.org/wikipedia/commons/2/27/Osmanthus_fragrans_var._aurantiacus.JPG", form: "komori" },
    stone: { name: "オパール", hex: "#C9E4E0", img: "https://upload.wikimedia.org/wikipedia/commons/9/95/Precious_opal_%28Spencer_Opal_Mine%2C_Spencer%2C_Idaho%2C_USA%29_%2829284532634%29.jpg" },
    hinaColor: { name: "柿色", hex: "#ED6D3D" },
    blessing: "金木犀の香りのように、日々にそっと灯がともりますように。"
  },
  {
    month: 11,
    flower: { name: "菊", hex: "#D4A02C", img: "https://upload.wikimedia.org/wikipedia/commons/5/51/Chrysanthemum_%C3%97_morifolium_Dompierre_1.jpg", form: "kiku" },
    stone: { name: "トパーズ", hex: "#6BB8E0", img: "https://upload.wikimedia.org/wikipedia/commons/0/03/Natural_blue_topaz_gemstone.jpg" },
    hinaColor: { name: "琥珀色", hex: "#BF783A" },
    blessing: "実りの色を集めて、あなたの一年が静かに満ちますように。"
  },
  {
    month: 12,
    flower: { name: "シクラメン", hex: "#C6407A", img: "https://upload.wikimedia.org/wikipedia/commons/3/31/Cyclamen_persicum_flower2.JPG", form: "bell" },
    stone: { name: "ラピスラズリ", hex: "#26619C", img: "https://upload.wikimedia.org/wikipedia/commons/0/08/Lazurite_polie_-_94_mm_-_%28Afghanistan%29_1.JPG" },
    hinaColor: { name: "鉄紺", hex: "#17184B" },
    blessing: "夜のいちばん深い青のなかに、小さなあかりがともりますように。"
  }
];
