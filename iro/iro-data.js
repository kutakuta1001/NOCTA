/**
 * NOCTA Iro Catalogue Data — 日本の伝統色
 *
 * 色を追加するときは、季節のまとまりを保ちながら配列に追加してください（表示順=収録順・春→夏→秋→冬）。
 *
 * name    : 色名（漢字）
 * kana    : 読み
 * romaji  : ローマ字（長音は マクロン表記）
 * hex     : 慣用値（出典により揺れがあるため一例。フッターに注記あり）
 * season  : "春" | "夏" | "秋" | "冬"
 * family  : 色系統 red/pink/orange/brown/yellow/green/blue/purple/white/gray/black
 * kasane  : 配色（本データ内の色名を2つ参照。レンダラーがhexを解決する）
 * storyJa : 由来・言葉の物語（自作の文章）
 * storyEn : 英語の物語（言語トグル用）
 */
const NOCTA_IRO = [
  /* ---- 春 ---- */
  {
    name: "桜色", kana: "さくらいろ", romaji: "Sakura-iro", hex: "#FEF4F4",
    season: "春", family: "pink", kasane: ["鴇色", "若草色"],
    storyJa: "白に一滴の紅を落とした、花びらの内側の色。平安の人々は染めの薄さにこそ贅を尽くした。",
    storyEn: "White touched by a single drop of crimson — the inner color of a petal. Heian nobles spared no luxury on the palest of dyes."
  },
  {
    name: "鴇色", kana: "ときいろ", romaji: "Toki-iro", hex: "#F4B3C2",
    season: "春", family: "pink", kasane: ["桜色", "藤色"],
    storyJa: "朱鷺が翼を広げたときだけ見える、風切羽のうすくれない。空を飛ぶ鳥の名を持つ色。",
    storyEn: "The pale crimson seen only when the crested ibis spreads its wings — a color named after a bird in flight."
  },
  {
    name: "一斤染", kana: "いっこんぞめ", romaji: "Ikkon-zome", hex: "#F5B1AA",
    season: "春", family: "pink", kasane: ["紅梅色", "白磁"],
    storyJa: "紅花一斤で絹一疋を染めた薄紅。禁色の紅のうち、庶民に唯一ゆるされた淡さ。",
    storyEn: "Silk dyed with a single measure of safflower. Of all forbidden crimsons, the only paleness permitted to common folk."
  },
  {
    name: "菜の花色", kana: "なのはないろ", romaji: "Nanohana-iro", hex: "#FFEC47",
    season: "春", family: "yellow", kasane: ["若草色", "露草色"],
    storyJa: "春の野をいちめんに塗りかえる、菜の花畑のあかるい黄。月は東に、日は西に。",
    storyEn: "The bright yellow that repaints spring fields — rapeseed blossoms, with the moon rising east and the sun setting west."
  },
  {
    name: "山吹色", kana: "やまぶきいろ", romaji: "Yamabuki-iro", hex: "#F8B500",
    season: "春", family: "yellow", kasane: ["江戸紫", "常磐色"],
    storyJa: "山吹の花の、こがねを溶かしたような黄。小判の異名にもなった、実らぬ花の豊かな色。",
    storyEn: "The molten-gold yellow of kerria blossoms. A flower that bears no fruit, yet its color became a byword for gold coins."
  },
  {
    name: "若草色", kana: "わかくさいろ", romaji: "Wakakusa-iro", hex: "#C3D825",
    season: "春", family: "green", kasane: ["桜色", "菜の花色"],
    storyJa: "雪解けの土を割って伸びる、生まれたての草の色。万葉の歌人は「若草の」を妻にかけた。",
    storyEn: "The color of newborn grass breaking through thawed earth. Manyō poets used 'young grass' as an epithet for a beloved wife."
  },
  {
    name: "萌黄", kana: "もえぎ", romaji: "Moegi", hex: "#AACF53",
    season: "春", family: "green", kasane: ["藤色", "山吹色"],
    storyJa: "木々の芽が萌え出づる黄緑。平家物語の若武者が鎧に纏った、青春の色でもある。",
    storyEn: "The yellow-green of budding trees. In the Tale of the Heike, young warriors wore it on their armor — the color of youth."
  },
  {
    name: "若竹色", kana: "わかたけいろ", romaji: "Wakatake-iro", hex: "#68BE8D",
    season: "春", family: "green", kasane: ["水色", "胡粉色"],
    storyJa: "その年に生えた竹の、みずみずしい青緑。夜のあいだにひと節伸びる、いきおいの色。",
    storyEn: "The fresh blue-green of bamboo born this year — a color of momentum, growing a node taller overnight."
  },
  {
    name: "藤色", kana: "ふじいろ", romaji: "Fuji-iro", hex: "#BBA1CB",
    season: "春", family: "purple", kasane: ["萌黄", "白鼠"],
    storyJa: "藤棚から垂れる花房のうす紫。源氏物語の姫君たちが幾度も重ねた、雅の定番。",
    storyEn: "The pale purple of wisteria clusters. A staple of courtly elegance, layered again and again by the ladies of the Genji tale."
  },
  {
    name: "菫色", kana: "すみれいろ", romaji: "Sumire-iro", hex: "#7058A3",
    season: "春", family: "purple", kasane: ["女郎花", "銀鼠"],
    storyJa: "道端にうつむいて咲く菫の、小さくて濃い紫。漱石が「小さき人」に例えた花の色。",
    storyEn: "The small, deep purple of violets nodding by the roadside — the flower Sōseki likened to a small, quiet person."
  },
  {
    name: "桃色", kana: "ももいろ", romaji: "Momo-iro", hex: "#F09199",
    season: "春", family: "pink", kasane: ["水色", "若草色"],
    storyJa: "桃の花びらで染めたとされる、ふっくらとした紅。古事記では桃の実が魔を祓った。",
    storyEn: "A plump crimson said to be dyed with peach petals. In the Kojiki, peaches drove away demons."
  },
  {
    name: "紅梅色", kana: "こうばいいろ", romaji: "Kōbai-iro", hex: "#F2A0A1",
    season: "春", family: "pink", kasane: ["藍白", "松葉色"],
    storyJa: "まだ寒い庭にひらく紅梅のあかるさ。枕草子は「木の花はこきもうすきも紅梅」と記した。",
    storyEn: "The brightness of red plum blossoms in a still-cold garden. The Pillow Book declares plum, deep or pale, the finest of flowering trees."
  },

  /* ---- 夏 ---- */
  {
    name: "瑠璃色", kana: "るりいろ", romaji: "Ruri-iro", hex: "#1E50A2",
    season: "夏", family: "blue", kasane: ["黄金色", "白磁"],
    storyJa: "仏典の七宝に数えられた宝石ラピスラズリの青。深い海とも夜空ともつかない、祈りの色。",
    storyEn: "The blue of lapis lazuli, one of Buddhism's seven treasures. Neither deep sea nor night sky — a color of prayer."
  },
  {
    name: "露草色", kana: "つゆくさいろ", romaji: "Tsuyukusa-iro", hex: "#38A1DB",
    season: "夏", family: "blue", kasane: ["菜の花色", "藍白"],
    storyJa: "朝露とともにひらき、昼にはしぼむ露草の青。水に流れやすく、友禅の下絵に使われた。",
    storyEn: "The blue of dayflowers that open with the dew and fade by noon. Quick to wash away, it drew the underlines of yūzen dyeing."
  },
  {
    name: "浅葱色", kana: "あさぎいろ", romaji: "Asagi-iro", hex: "#00A3AF",
    season: "夏", family: "blue", kasane: ["緋色", "胡粉色"],
    storyJa: "葱の若芽よりなお浅い藍染の青緑。新選組の羽織の色として、幕末の京を駆けた。",
    storyEn: "An indigo blue-green paler than young onion shoots. As the haori of the Shinsengumi, it raced through Kyoto at the end of the shogunate."
  },
  {
    name: "甕覗", kana: "かめのぞき", romaji: "Kamenozoki", hex: "#A2D7DD",
    season: "夏", family: "blue", kasane: ["藍色", "白鼠"],
    storyJa: "藍甕をほんの一度だけ覗かせた、いちばん淡い藍。名付けの遊び心まで含めて美しい色。",
    storyEn: "The palest indigo, dipped just once — as if the cloth merely 'peeked into the dye vat.' Beautiful down to the wit of its name."
  },
  {
    name: "水色", kana: "みずいろ", romaji: "Mizu-iro", hex: "#BCE2E8",
    season: "夏", family: "blue", kasane: ["桃色", "若竹色"],
    storyJa: "汲みたての水がたたえる、かすかな青。ゆらぎまで含めてひとつの色名になった。",
    storyEn: "The faint blue held by freshly drawn water — a color whose very shimmer became its name."
  },
  {
    name: "藍色", kana: "あいいろ", romaji: "Ai-iro", hex: "#165E83",
    season: "夏", family: "blue", kasane: ["甕覗", "柿色"],
    storyJa: "藍甕で幾度も染め重ねた、日本の労働着の青。ジャパン・ブルーと呼ばれ海を渡った。",
    storyEn: "The blue of Japan's working clothes, dyed again and again in the indigo vat. It crossed the seas as 'Japan Blue.'"
  },
  {
    name: "杜若色", kana: "かきつばたいろ", romaji: "Kakitsubata-iro", hex: "#3E62AD",
    season: "夏", family: "blue", kasane: ["撫子色", "藍白"],
    storyJa: "水辺に立つ杜若の青紫。伊勢物語の「からころも」の歌は、この花の五文字を句頭に隠した。",
    storyEn: "The blue-purple of irises standing in shallow water. In the Tales of Ise, a famous poem hides this flower's name in its opening syllables."
  },
  {
    name: "青竹色", kana: "あおたけいろ", romaji: "Aotake-iro", hex: "#7EBEAB",
    season: "夏", family: "green", kasane: ["墨", "胡粉色"],
    storyJa: "夏の竹林の、風の通り道の色。切り出したばかりの竹の肌は、ほのかに青い。",
    storyEn: "The color of wind-paths through a summer bamboo grove. Freshly cut bamboo skin carries a faint blue."
  },
  {
    name: "常磐色", kana: "ときわいろ", romaji: "Tokiwa-iro", hex: "#007B43",
    season: "夏", family: "green", kasane: ["山吹色", "琥珀色"],
    storyJa: "常磐木——松や杉の、季節に負けない深い緑。永遠に変わらぬものの喩えとされた。",
    storyEn: "The deep green of evergreens — pine and cedar unbowed by seasons. A metaphor for what never changes."
  },
  {
    name: "撫子色", kana: "なでしこいろ", romaji: "Nadeshiko-iro", hex: "#EEBBCB",
    season: "夏", family: "pink", kasane: ["杜若色", "白磁"],
    storyJa: "秋の七草に数えられながら夏に咲く、撫子のやさしい紅。撫でたいほど愛しい花の名を持つ。",
    storyEn: "The gentle pink of fringed pinks, blooming in summer though counted among autumn's seven grasses. Its name means 'a flower dear enough to caress.'"
  },
  {
    name: "緋色", kana: "ひいろ", romaji: "Hi-iro", hex: "#D3381C",
    season: "夏", family: "red", kasane: ["浅葱色", "墨"],
    storyJa: "茜で染めた、炎のあかい色。緋縅の鎧、緋毛氈——晴れの場をつくる日本の赤。",
    storyEn: "A flame-red dyed with madder. Scarlet-laced armor, scarlet felt at tea gatherings — the red that makes an occasion."
  },
  {
    name: "白磁", kana: "はくじ", romaji: "Hakuji", hex: "#F8FBF8",
    season: "夏", family: "white", kasane: ["瑠璃色", "銀鼠"],
    storyJa: "焼き上がった白磁の肌の、青みを含んだ白。手を触れる前の、しんとした涼しさ。",
    storyEn: "The blue-tinged white of fired porcelain — the hushed coolness of a surface not yet touched."
  },

  /* ---- 秋 ---- */
  {
    name: "茜色", kana: "あかねいろ", romaji: "Akane-iro", hex: "#B7282E",
    season: "秋", family: "red", kasane: ["黄金色", "朽葉色"],
    storyJa: "茜の根で染めた、夕焼けの記憶を宿す赤。万葉集の「あかねさす」は光の枕詞になった。",
    storyEn: "A red dyed from madder root, holding the memory of sunset. In the Manyōshū, 'akane-sasu' became an epithet for light itself."
  },
  {
    name: "蘇芳", kana: "すおう", romaji: "Suō", hex: "#9E3D3F",
    season: "秋", family: "red", kasane: ["利休鼠", "女郎花"],
    storyJa: "南方から渡ってきた蘇芳の芯材で染める、くすんだ深い紅。正倉院の宝物にも残る古代の赤。",
    storyEn: "A muted deep crimson dyed from sappanwood brought over southern seas — an ancient red still kept among the Shōsōin treasures."
  },
  {
    name: "柿色", kana: "かきいろ", romaji: "Kaki-iro", hex: "#ED6D3D",
    season: "秋", family: "orange", kasane: ["藍色", "墨"],
    storyJa: "熟れた柿の実のあたたかな橙。歌舞伎の定式幕にも使われる、江戸の粋な橙色。",
    storyEn: "The warm orange of ripened persimmons — the stylish Edo orange that stripes the kabuki curtain."
  },
  {
    name: "琥珀色", kana: "こはくいろ", romaji: "Kohaku-iro", hex: "#BF783A",
    season: "秋", family: "brown", kasane: ["常磐色", "胡粉色"],
    storyJa: "太古の樹脂が固まった宝石、琥珀の透きとおる茶。グラスの中の時間にもこの名を使う。",
    storyEn: "The translucent brown of amber, ancient resin turned to gem. We borrow its name for time resting in a glass."
  },
  {
    name: "朽葉色", kana: "くちばいろ", romaji: "Kuchiba-iro", hex: "#917347",
    season: "秋", family: "brown", kasane: ["茜色", "黄金色"],
    storyJa: "落ち葉が朽ちてゆく途中の、黄とも茶ともつかない色。平安人は朽ちてゆくものにさえ名を与えた。",
    storyEn: "Neither yellow nor brown — the color of leaves mid-decay. Heian people gave names even to things falling to ruin."
  },
  {
    name: "小豆色", kana: "あずきいろ", romaji: "Azuki-iro", hex: "#96514D",
    season: "秋", family: "brown", kasane: ["銀鼠", "女郎花"],
    storyJa: "炊きあがった小豆の、赤みを帯びた渋い茶。祝いの赤飯にも、日々の汁粉にも宿る色。",
    storyEn: "The reddish, subdued brown of simmered azuki beans — a color living in festive red rice and everyday sweet soup alike."
  },
  {
    name: "団十郎茶", kana: "だんじゅうろうちゃ", romaji: "Danjūrō-cha", hex: "#9F563A",
    season: "秋", family: "brown", kasane: ["墨", "白鼠"],
    storyJa: "市川団十郎が舞台で纏った柿渋の茶。役者の名がそのまま色名になった、江戸の熱狂。",
    storyEn: "The persimmon-tannin brown worn on stage by Ichikawa Danjūrō. Edo's enthusiasm turned an actor's name into a color."
  },
  {
    name: "黄金色", kana: "こがねいろ", romaji: "Kogane-iro", hex: "#E6B422",
    season: "秋", family: "yellow", kasane: ["茜色", "江戸紫"],
    storyJa: "刈り入れ前の稲穂が波打つ、実りの黄金。ひと粒の米に宿る一年分の光。",
    storyEn: "The harvest gold of rice ears swaying before the reaping — a year's worth of light held in a single grain."
  },
  {
    name: "女郎花", kana: "おみなえし", romaji: "Ominaeshi", hex: "#F2F2B0",
    season: "秋", family: "yellow", kasane: ["竜胆色", "蘇芳"],
    storyJa: "秋の七草、女郎花の花あわい黄。粟飯の色に似ることから「おみなめし」とも呼ばれた。",
    storyEn: "The pale yellow of golden lace, one of autumn's seven grasses — once called 'omina-meshi' for its likeness to millet rice."
  },
  {
    name: "竜胆色", kana: "りんどういろ", romaji: "Rindō-iro", hex: "#9079AD",
    season: "秋", family: "purple", kasane: ["女郎花", "白鼠"],
    storyJa: "秋草の名残に咲く竜胆の、青みがかった薄紫。晴れた日にだけ花をひらく律儀な色。",
    storyEn: "The bluish pale purple of gentians blooming at autumn's end — a dutiful flower that opens only on clear days."
  },
  {
    name: "江戸紫", kana: "えどむらさき", romaji: "Edo-murasaki", hex: "#745399",
    season: "秋", family: "purple", kasane: ["黄金色", "銀鼠"],
    storyJa: "武蔵野の紫草で染めた、青みの強い粋な紫。助六の鉢巻の色として江戸っ子の誇りになった。",
    storyEn: "A blue-leaning, dashing purple dyed with Musashino gromwell. As Sukeroku's headband, it became the pride of Edo."
  },
  {
    name: "葡萄色", kana: "えびいろ", romaji: "Ebi-iro", hex: "#640125",
    season: "秋", family: "purple", kasane: ["梅鼠", "胡粉色"],
    storyJa: "山葡萄「葡萄葛」の熟した実の、黒みを帯びた赤紫。「えび」と読む古い言葉が残る色。",
    storyEn: "The blackened red-purple of ripe wild grapes. Its reading 'ebi' preserves a word older than the fruit's modern name."
  },

  /* ---- 冬 ---- */
  {
    name: "胡粉色", kana: "ごふんいろ", romaji: "Gofun-iro", hex: "#FFFFFC",
    season: "冬", family: "white", kasane: ["紅", "墨"],
    storyJa: "牡蠣殻を焼いて砕いた顔料、胡粉の白。日本画の雪も、人形の肌も、この白からはじまる。",
    storyEn: "The white of gofun, pigment ground from baked oyster shells. Snow in paintings and the skin of dolls both begin with this white."
  },
  {
    name: "藍白", kana: "あいじろ", romaji: "Aijiro", hex: "#EBF6F7",
    season: "冬", family: "white", kasane: ["鉄紺", "紅梅色"],
    storyJa: "藍染のいちばん手前にある、白にひそむ藍。降りはじめの雪の影は、たしかにこの色をしている。",
    storyEn: "The indigo hiding inside white, at the very threshold of the dye. The shadows of first-falling snow are exactly this color."
  },
  {
    name: "銀鼠", kana: "ぎんねず", romaji: "Gin-nezu", hex: "#AFAFB0",
    season: "冬", family: "gray", kasane: ["梅鼠", "江戸紫"],
    storyJa: "銀の光を帯びた明るい鼠色。派手を禁じられた江戸の人々は「四十八茶百鼠」の粋をきわめた。",
    storyEn: "A bright gray touched with silver light. Forbidden bright colors, Edo people perfected 'forty-eight browns and a hundred grays.'"
  },
  {
    name: "白鼠", kana: "しろねず", romaji: "Shiro-nezu", hex: "#DCDDDD",
    season: "冬", family: "gray", kasane: ["藤色", "墨"],
    storyJa: "鼠色のなかでもっとも白に近い、上品なしらけ色。銀箔のくもりのような静けさがある。",
    storyEn: "The most white-leaning of grays, quietly refined — with the stillness of silver leaf gone softly matte."
  },
  {
    name: "利休鼠", kana: "りきゅうねずみ", romaji: "Rikyū-nezumi", hex: "#888E7E",
    season: "冬", family: "gray", kasane: ["蘇芳", "胡粉色"],
    storyJa: "緑を含んだ茶人好みの鼠色。「城ヶ島の雨」に歌われ、雨の日の海の色として記憶された。",
    storyEn: "A green-tinged gray beloved of tea masters. Sung in 'Rain at Jōgashima,' it became the remembered color of the sea on rainy days."
  },
  {
    name: "墨", kana: "すみ", romaji: "Sumi", hex: "#595857",
    season: "冬", family: "black", kasane: ["胡粉色", "緋色"],
    storyJa: "硯の上で磨られた墨の、やわらかな黒。書も水墨画も、この一色の濃淡だけで世界を描いた。",
    storyEn: "The soft black of ink ground on a stone. Calligraphy and ink painting drew entire worlds from the shades of this one color."
  },
  {
    name: "漆黒", kana: "しっこく", romaji: "Shikkoku", hex: "#0D0015",
    season: "冬", family: "black", kasane: ["黄金色", "白磁"],
    storyJa: "幾層にも塗り重ねた漆の、光を呑む黒。闇の中でこそ、蒔絵の金は目を覚ます。",
    storyEn: "The light-swallowing black of layered lacquer. Only in that darkness does the gold of makie truly wake."
  },
  {
    name: "鉄紺", kana: "てつこん", romaji: "Tetsukon", hex: "#17184B",
    season: "冬", family: "blue", kasane: ["藍白", "黄金色"],
    storyJa: "鉄の冷たさを宿した、黒に近い紺。冬の夜、雪が降る直前の空はこの色まで沈む。",
    storyEn: "A near-black navy holding the coldness of iron. On winter nights, the sky sinks to this color just before snow."
  },
  {
    name: "紅", kana: "くれない", romaji: "Kurenai", hex: "#D7003A",
    season: "冬", family: "red", kasane: ["胡粉色", "墨"],
    storyJa: "紅花の花びらから、ほんのわずかしか採れない真紅。「呉の藍」が転じた名に大陸の記憶が残る。",
    storyEn: "True crimson, drawn only scarcely from safflower petals. Its name, once 'the indigo of Wu,' keeps a memory of the continent."
  },
  {
    name: "檜皮色", kana: "ひわだいろ", romaji: "Hiwada-iro", hex: "#965042",
    season: "冬", family: "brown", kasane: ["松葉色", "藍白"],
    storyJa: "檜の樹皮で葺いた屋根の、あたたかい赤茶。社寺の甍に降る雪がよく似合う。",
    storyEn: "The warm red-brown of roofs thatched with cypress bark. Snow falling on shrine eaves suits it best."
  },
  {
    name: "松葉色", kana: "まつばいろ", romaji: "Matsuba-iro", hex: "#839B5C",
    season: "冬", family: "green", kasane: ["檜皮色", "紅梅色"],
    storyJa: "雪をかぶってなお青い、松の葉の渋い緑。変わらぬものの象徴として正月を飾る。",
    storyEn: "The subdued green of pine needles, still alive beneath the snow — a New Year emblem of the unchanging."
  },
  {
    name: "梅鼠", kana: "うめねず", romaji: "Ume-nezu", hex: "#C099A0",
    season: "冬", family: "gray", kasane: ["銀鼠", "葡萄色"],
    storyJa: "紅梅の紅をひそめた鼠色。冬の終わりと春のはじまりの、あわいの気配をまとう。",
    storyEn: "A gray with red plum hidden inside — wearing the in-between air where winter ends and spring begins."
  }
];
