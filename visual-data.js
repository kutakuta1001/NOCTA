/**
 * NOCTA Visual Portfolio Data
 *
 * NOCTA_VISUALS_WORKS : 完成品（コンセプト付与・Canva加工済み / Base chain）
 * NOCTA_VISUALS_ART   : AI生成元画像コレクション（Zora chain）
 * NOCTA_VISUALS_MUSIC : 楽曲連動ビジュアル
 *
 * imgUrl          : IPFS URL (https://ipfs.io/ipfs/[hash])
 * zoraUrl         : Zora NFT ページ URL（不明な場合は Zora プロフィール）
 * badge           : "Works" | "Art" | "Music"
 * badgeColorClass : Tailwind クラス
 * descJa          : 日本語説明
 * descEn          : 英語説明（言語トグル用）
 *
 * 新しい作品を追加するときは配列の先頭に追加してください。
 */
const NOCTA_VISUALS_WORKS = [
  {
    title: "SILENCE #1",
    imgUrl: "https://ipfs.io/ipfs/bafybeigjekudm2vahgkycl7zh4uyx72qymtpod2l2iny2v74ovroxh67zm",
    zoraUrl: "https://zora.co/collect/base:0xcc3e7dba54406b272bf5dd383cc5d66b00e9f735/1",
    badge: "Works",
    badgeColorClass: "bg-amber-500/20 text-amber-400",
    descJa: "SILENCEを元にCanvaで加工。Warpcastフレームとコピーライン「SILENCE ON THE TIMELINE.」を付与した完成品。",
    descEn: "Processed from SILENCE in Canva. Final version with Warpcast frame and copy line 'SILENCE ON THE TIMELINE.'"
  }
];

const NOCTA_VISUALS_ART = [
  {
    title: "rainy season #1",
    imgUrl: "https://ipfs.io/ipfs/bafybeiddisy5yutc7j6vhy5e6asblpq5gvfm23ss227xtpqco22pse2hh4",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/23",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "梅雨。スペクトルバイオレット×アビスティール。透明傘を持って振り返る少女。",
    descEn: "Rainy season. Spectrum violet × abyss teal. A girl looking back, holding a transparent umbrella."
  },
  {
    title: "pop girl #8",
    imgUrl: "https://ipfs.io/ipfs/bafybeiclqzh2tn23pww7c2iteu6mwkrr6cd4gfpg35ids3gbk7f4blu2qu",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/3",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "アーバンポップ。ビビッドオレンジ×カラースプラッター。ストリートウェア×猫。PixAI生成。",
    descEn: "Urban pop. Vivid orange × color splatter. Streetwear × cat. Generated with PixAI."
  },
  {
    title: "SILENCE",
    imgUrl: "https://ipfs.io/ipfs/bafybeifzffxpusfpoqdloixvrbx46qlczmys4snxejynq5t3j6wzuhg4am",
    zoraUrl: "https://zora.co/collect/zora:0x2cf12ca8cb593870b8e6d9807201b13c0932cbc7/2",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "極限のミニマル。冬の雪景色に溶け込む少女。ほぼモノクロのコールドパレット。",
    descEn: "Ultimate minimalism. A girl dissolving into a winter snowscape. Near-monochrome cold palette."
  },
  {
    title: "Jewel Sky#2",
    imgUrl: "https://ipfs.io/ipfs/bafybeie4wjqjdgsne7tqkb5fw2ycrgfc2j5cfe7ebz3bs5c3ywe4dof4wm",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/7",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "宝石空。アビスティール×ルナゴールド。片腕を掲げる少女とスパークル全面。",
    descEn: "Jewel sky. Abyss teal × lunar gold. A girl with one arm raised, surrounded by full-field sparkles."
  },
  {
    title: "Just an ordinary day in the life",
    imgUrl: "https://ipfs.io/ipfs/bafybeifck5l5enwu3wr2vbrjuu5wktnepkct4argoedmii6exu2enl2y2y",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/16",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "窓辺の秋。ブラッドオレンジの逆光の中でたたずむ少女。日常の詩的な瞬間。",
    descEn: "Autumn by the window. A girl standing in blood-orange backlight. A poetic moment of the everyday."
  },
  {
    title: "await in anticipation",
    imgUrl: "https://ipfs.io/ipfs/bafybeig76tuwjmsrldj75yrzwfst26kdsibl4hruduqcgg2335vhhd34wi",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/14",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "アトリエの夢想。ウォームピーチ×ティール。絵に囲まれた空間で期待を抱く少女。",
    descEn: "Atelier daydream. Warm peach × teal. A girl holding anticipation in a space surrounded by paintings."
  },
  {
    title: "natural / artificial",
    imgUrl: "https://ipfs.io/ipfs/bafybeieglvkoteecug6fovx5qrqkmglkxow6tthnuuxpivptm32f7edoyq",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/12",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "セミリアル油彩。秋の花葉が体に溶け込む。自然と人工の境界を問う。",
    descEn: "Semi-real oil painting. Autumn flowers and leaves merging into the body. Questioning the boundary between nature and artifice."
  },
  {
    title: "enjoy",
    imgUrl: "https://ipfs.io/ipfs/bafybeidj3t7525dixj5w5ppijxm6hk3ifbwxv457edg4ukhpct5zvspvpy",
    zoraUrl: "https://zora.co/collect/base:0xa407f675ab46c5c949e866d8f52331f54596f3c3/2",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "タイポグラフィ×エクスプレッシブ。ブラッドオレンジ×ネイビー。自信溢れる少女と抽象的な筆跡。",
    descEn: "Typography × expressive. Blood orange × navy. A confident girl amid abstract brushstrokes."
  },
  {
    title: "Time leap to GW",
    imgUrl: "https://ipfs.io/ipfs/bafybeicbli4q7nzb7z2tz3v4v2yoppp7nardyk3oub6j53aausammpvnmi",
    zoraUrl: "https://zora.co/collect/zora:0x70694802b830f1e35c289ed73b407bc631482e53/10",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "時間の跳躍。スカイブルーに時計と紙片が舞う。コンセプチュアルな昼空。",
    descEn: "A leap through time. Clocks and paper fragments drifting in a sky-blue sky. A conceptual daytime scene."
  },
  {
    title: "Art and information flood",
    imgUrl: "https://ipfs.io/ipfs/bafybeigs6ncj5xq6bcfat3fljardm3uozejudlacv7zarz6vovllxt5aea",
    zoraUrl: "https://zora.co/@kutakuta1001",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "情報の洪水。ウォームイエロー×ティール×オレンジ。美しいカオスとして視覚化された情報過多。",
    descEn: "Information flood. Warm yellow × teal × orange. Information overload visualized as beautiful chaos."
  },
  {
    title: "wisteria flowers",
    imgUrl: "https://ipfs.io/ipfs/bafybeibvqlfmnq2wfxmv54lpw6e4hjhhk7hta5qon7okvpmx7gvmaq6qe4",
    zoraUrl: "https://zora.co/@kutakuta1001",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "春・静謐。バイオレット×白。藤の花の下に立つ少女。クリーンアニメの精細な描写。",
    descEn: "Spring stillness. Violet × white. A girl standing beneath wisteria blossoms. Refined clean-anime detail."
  },
  {
    title: "Witch girl Sunny afternoon",
    imgUrl: "https://ipfs.io/ipfs/bafybeiealixrjpsumq2vgerdfd7iz2atyvaynxxgj24oqjeozulmvrcv3a",
    zoraUrl: "https://zora.co/@kutakuta1001",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "昼の魔法都市。ターコイズ×カラフル。祭りの賑わいの中を歩く魔女少女。",
    descEn: "A magical city in daylight. Turquoise × colorful. A witch girl walking through a festive crowd."
  },
  {
    title: "Witch girl Midnight Carnival",
    imgUrl: "https://ipfs.io/ipfs/bafybeihfxbmlqorwsagemxy23roabfiwqcjioq7tslgqh33smavhhqekx4",
    zoraUrl: "https://zora.co/@kutakuta1001",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "深夜のカーニバル。深紫×オレンジ。ジャック・オー・ランタンが灯るゴシックな祝祭の夜。",
    descEn: "Midnight carnival. Deep purple × orange. A gothic festival night lit by jack-o'-lanterns."
  }
];

const NOCTA_VISUALS_MUSIC = [
  // NuWord PV ビジュアルなど — 制作後に追加
];
