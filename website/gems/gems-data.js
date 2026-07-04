/**
 * NOCTA Gems Catalogue Data
 *
 * 宝石を追加するときは、この配列の末尾に新しいオブジェクトを追加してください（表示順=収録順）。
 *
 * title       : 和名
 * titleEn     : 英名
 * imgUrl      : 実写の直接画像URL（Wikimedia Commons / Smithsonian Open Access）
 * sourceUrl   : ライセンス確認元のファイルページURL
 * sourceName  : "Wikimedia Commons" | "Smithsonian Open Access" | "AI Generated"
 * license     : ライセンス表記（ファイルページに記載の通り）
 * credit      : クレジット表記が必要な場合の著者名。CC0で不要な場合は null
 * accentColor : 宝石本来の色（カード背景に反映。ブランド継承のハイブリッド部分）
 * hardness    : モース硬度
 * origin      : 産地
 * descJa      : 日本語の短い鑑賞的説明文
 * descEn      : 英語の短い鑑賞的説明文（言語トグル用）
 *
 * 出典・ライセンスは全件 2026-07-04 にWebFetchで実在確認済み（4件は二重検証済み）。
 */
const NOCTA_GEMS = [
  {
    title: "ダイヤモンド",
    titleEn: "Diamond",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Rough_diamond.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rough_diamond.jpg",
    sourceName: "Wikimedia Commons",
    license: "Public Domain",
    credit: null,
    accentColor: "#D8ECEF",
    hardness: "10",
    origin: "南アフリカ、ロシア、ボツワナ 他",
    descJa: "深い地中の圧力が幾億年をかけて研ぎ澄ませた、透明な沈黙。",
    descEn: "A transparent silence, honed by eons of pressure deep within the earth."
  },
  {
    title: "ルビー",
    titleEn: "Ruby",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Ruby_gem.JPG",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ruby_gem.JPG",
    sourceName: "Wikimedia Commons",
    license: "CC BY 3.0",
    credit: "Humanfeather",
    accentColor: "#9B111E",
    hardness: "9",
    origin: "ミャンマー、タイ、スリランカ",
    descJa: "血の色を宿しながら、内側では静かに光を持ち続ける石。",
    descEn: "A stone the color of blood, yet holding a quiet light within."
  },
  {
    title: "イエローサファイア",
    titleEn: "Yellow Sapphire",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Yellow_sapphire_oval_gemstone.JPG",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Yellow_sapphire_oval_gemstone.JPG",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    credit: "Gemsphoto",
    accentColor: "#E8B923",
    hardness: "9",
    origin: "スリランカ",
    descJa: "陽の光を溶かし込んだような、澄んだ黄の輝き。",
    descEn: "A clear yellow glow, as if sunlight had dissolved into stone."
  },
  {
    title: "エメラルド",
    titleEn: "Emerald",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Chalk_emerald.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Chalk_emerald.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY 2.0",
    credit: "Cliff (Carl Clifford)",
    accentColor: "#0F5C3D",
    hardness: "7.5-8",
    origin: "コロンビア",
    descJa: "深い森の静けさを閉じ込めた、緑の結晶。",
    descEn: "A green crystal that seals in the stillness of a deep forest."
  },
  {
    title: "アメジスト",
    titleEn: "Amethyst",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Amethyst_geode_in_its_parent_rock.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Amethyst_geode_in_its_parent_rock.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 2.0",
    credit: "MoRDi CuaC",
    accentColor: "#9966CC",
    hardness: "7",
    origin: "ブラジル、ウルグアイ",
    descJa: "夜明け前の空の色を、結晶の中に閉じ込めた石。",
    descEn: "A stone that captures the color of the sky just before dawn."
  },
  {
    title: "オパール",
    titleEn: "Opal",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/Precious_opal_%28Spencer_Opal_Mine%2C_Spencer%2C_Idaho%2C_USA%29_%2829284532634%29.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Precious_opal_(Spencer_Opal_Mine,_Spencer,_Idaho,_USA)_(29284532634).jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY 2.0",
    credit: "James St. John",
    accentColor: "#C9E4E0",
    hardness: "5.5-6.5",
    origin: "米国アイダホ州、スペンサー・オパール鉱山",
    descJa: "光の粒がゆらぎながら、虹をひとつずつ手放していく石。",
    descEn: "A stone where flecks of light waver, releasing rainbows one by one."
  },
  {
    title: "パライバトルマリン",
    titleEn: "Paraíba Tourmaline",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Tourmaline_para%C3%AFba_%28Br%C3%A9sil%29_1.JPG",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tourmaline_para%C3%AFba_(Br%C3%A9sil)_1.JPG",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    credit: "Géry Parent",
    accentColor: "#18C2B4",
    hardness: "7-7.5",
    origin: "ブラジル、パライバ州、バタリャ鉱山",
    descJa: "ブラジルの大地が生んだ、電気を帯びたような青緑の光。",
    descEn: "An electric blue-green glow, born from the earth of Brazil."
  },
  {
    title: "トパーズ",
    titleEn: "Topaz",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/0/03/Natural_blue_topaz_gemstone.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Natural_blue_topaz_gemstone.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    credit: "Gemsphoto",
    accentColor: "#6BB8E0",
    hardness: "8",
    origin: "ブラジル 他",
    descJa: "冷たい水の底を思わせる、澄んだ青の静寂。",
    descEn: "A clear blue stillness, reminiscent of the depths of cold water."
  },
  {
    title: "ガーネット",
    titleEn: "Garnet",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Cut_garnet_collection.JPG",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cut_garnet_collection.JPG",
    sourceName: "Wikimedia Commons",
    license: "CC BY 3.0",
    credit: "Humanfeather",
    accentColor: "#7B1113",
    hardness: "6.5-7.5",
    origin: "インド、アフリカ各地",
    descJa: "燃えるような赤の奥に、静かな重さを秘めた石。",
    descEn: "A stone with a quiet weight hidden behind its burning red."
  },
  {
    title: "アクアマリン",
    titleEn: "Aquamarine",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/6/66/Aquamarine6.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aquamarine6.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC0 1.0",
    credit: null,
    accentColor: "#9FD8DE",
    hardness: "7.5-8",
    origin: "ブラジル、ミナスジェライス州",
    descJa: "海の底の静けさを、そのまま結晶にしたような青。",
    descEn: "A blue as if the stillness of the ocean floor had crystallized."
  },
  {
    title: "タンザナイト",
    titleEn: "Tanzanite",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/2/21/Tanzanite_%28Merelani_Tanzanite_Deposit%2C_Merelani_Hills%2C_Arusha%2C_Tanzania%29.JPG",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tanzanite_(Merelani_Tanzanite_Deposit,_Merelani_Hills,_Arusha,_Tanzania).JPG",
    sourceName: "Wikimedia Commons",
    license: "CC BY 2.0",
    credit: "James St. John",
    accentColor: "#4B3F91",
    hardness: "6-7",
    origin: "タンザニア、アルーシャ州、メレラニ・ヒルズ",
    descJa: "見る角度によって色を変える、キリマンジャロ山麓の石。",
    descEn: "A stone from the foot of Kilimanjaro that shifts color with the angle of view."
  },
  {
    title: "アレキサンドライト",
    titleEn: "Alexandrite",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/Alexandrite_26.75cts.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Alexandrite_26.75cts.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    credit: "David Weinberg (Alexandrite.net)",
    accentColor: "#3F7357",
    hardness: "8.5",
    origin: "スリランカ、ブラジル",
    descJa: "昼と夜、ふたつの光の下で違う顔を見せる稀有な石。",
    descEn: "A rare stone that reveals two different faces under daylight and lamplight."
  },
  {
    title: "ラブラドライト",
    titleEn: "Labradorite",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Labradorite_with_rare_colours.JPG",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Labradorite_with_rare_colours.JPG",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    credit: "Awiejekeal",
    accentColor: "#3E7A8C",
    hardness: "6-6.5",
    origin: "マダガスカル、カナダ ラブラドール半島",
    descJa: "石の内側に、極夜の光を隠し持つ鉱物。",
    descEn: "A mineral that hides the light of the polar night within itself."
  },
  {
    title: "ペリドット",
    titleEn: "Peridot",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Peridot2.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Peridot2.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    credit: "Azuncha",
    accentColor: "#A6BE3F",
    hardness: "6.5-7",
    origin: "米国アリゾナ州、ミャンマー",
    descJa: "オリーブ色の光を、静かにたたえた火山の石。",
    descEn: "A volcanic stone that quietly holds an olive-colored light."
  },
  {
    title: "ムーンストーン",
    titleEn: "Moonstone",
    imgUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/Natural_Blue_Moonstone_loose_gemstone.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Natural_Blue_Moonstone_loose_gemstone.jpg",
    sourceName: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    credit: "Gemsphoto",
    accentColor: "#D6E4EE",
    hardness: "6-6.5",
    origin: "スリランカ、インド",
    descJa: "満ちる月の光を、そのまま石に閉じ込めたような輝き。",
    descEn: "A glow as if the light of a full moon had been sealed into stone."
  }
];
