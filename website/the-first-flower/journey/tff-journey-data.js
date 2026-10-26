/**
 * tff-journey-data.js
 * The First Flower — 旅の地図の公開データ（作者が選んだ写真だけ）
 *
 * tools/journey の export が書く。手で直すときは項目を増やさない（journey-core.js の検証で弾かれる）。
 * 形: regions[] = { id, kind: "pref" | "country" | "place", parentId, name, photoIds }、
 *     photos{}  = { src, thumb, w, h, taken: "YYYY-MM" | null, caption: 文字列 | null, alt }
 */
const TFF_JOURNEY = {
  "schemaVersion": 1,
  "regions": [
    {
      "id": "CA",
      "kind": "country",
      "parentId": null,
      "name": "カナダ",
      "photoIds": [
        "ed541a9e176b2f1e",
        "8e55e6878408f121",
        "32e771f092b14197"
      ]
    },
    {
      "id": "GU",
      "kind": "country",
      "parentId": null,
      "name": "グアム",
      "photoIds": [
        "44a31d37f4365b4f",
        "48f9e0c4e651eef8",
        "4b4a5128abde34d4"
      ]
    },
    {
      "id": "HK",
      "kind": "country",
      "parentId": null,
      "name": "香港",
      "photoIds": [
        "b526214eb9fa0f12",
        "9a207ba38262c653",
        "fe65d3d2b97cfe0c"
      ]
    },
    {
      "id": "JP-01",
      "kind": "pref",
      "parentId": null,
      "name": "北海道",
      "photoIds": [
        "d2a22d61cc9ca215",
        "43f2c8ad909a17d7",
        "574e1c1999fb3dc5"
      ]
    },
    {
      "id": "place-hokkaido-dohoku",
      "kind": "place",
      "parentId": "JP-01",
      "name": "道北",
      "photoIds": [
        "293b5211b9e1d265",
        "d2a22d61cc9ca215",
        "4e2f079846f105e7"
      ]
    },
    {
      "id": "place-hokkaido-donan",
      "kind": "place",
      "parentId": "JP-01",
      "name": "道南",
      "photoIds": [
        "589292dc5cd130ca",
        "d65ac18a225e6e4a",
        "45073a06622bbafb"
      ]
    },
    {
      "id": "place-hokkaido-doo",
      "kind": "place",
      "parentId": "JP-01",
      "name": "道央",
      "photoIds": [
        "fda3a67e55b0892c",
        "60021d76de7de35c",
        "252b9ec19f8f86dd"
      ]
    },
    {
      "id": "JP-02",
      "kind": "pref",
      "parentId": null,
      "name": "青森",
      "photoIds": [
        "bbefefd53010b45a",
        "adb5583c53220f0b",
        "93d61d7450dbadce"
      ]
    },
    {
      "id": "JP-03",
      "kind": "pref",
      "parentId": null,
      "name": "岩手",
      "photoIds": [
        "96d87362bc9b9859",
        "ae8660de10a91f43",
        "4ca39cad5fd49c68"
      ]
    },
    {
      "id": "JP-04",
      "kind": "pref",
      "parentId": null,
      "name": "宮城",
      "photoIds": [
        "2ea0c6449c4a3ce5",
        "58b4802260574a53",
        "5622e573504ac48e"
      ]
    },
    {
      "id": "JP-05",
      "kind": "pref",
      "parentId": null,
      "name": "秋田",
      "photoIds": [
        "82f1f22f6e225896",
        "0a4695cf4435111e",
        "8517b98b014dde61"
      ]
    },
    {
      "id": "place-05-1",
      "kind": "place",
      "parentId": "JP-05",
      "name": "大曲花火",
      "photoIds": [
        "e3351bc7b386853d",
        "fc9c114850e24229",
        "3eb577e48f12d9eb"
      ]
    },
    {
      "id": "JP-06",
      "kind": "pref",
      "parentId": null,
      "name": "山形",
      "photoIds": [
        "fc5ab11152a013d1",
        "e823b085a0659a73",
        "a0e8619b25191dfa"
      ]
    },
    {
      "id": "JP-07",
      "kind": "pref",
      "parentId": null,
      "name": "福島",
      "photoIds": [
        "1b11df844d17c7bb",
        "eeb5c7179d7ee637",
        "b66c6aa2027f82e1"
      ]
    },
    {
      "id": "JP-08",
      "kind": "pref",
      "parentId": null,
      "name": "茨城",
      "photoIds": [
        "a2d5879338e2180a",
        "72bca2c054fe4a3e",
        "27793dbef584e371"
      ]
    },
    {
      "id": "JP-09",
      "kind": "pref",
      "parentId": null,
      "name": "栃木",
      "photoIds": [
        "8773b7826bbf4178",
        "774109f6cb34a165",
        "76d56a548d36202a"
      ]
    },
    {
      "id": "JP-10",
      "kind": "pref",
      "parentId": null,
      "name": "群馬",
      "photoIds": [
        "4eb3f6bebc9d8966",
        "c4889a00bbdd2a35",
        "ba8d011d49d38efe"
      ]
    },
    {
      "id": "JP-11",
      "kind": "pref",
      "parentId": null,
      "name": "埼玉",
      "photoIds": [
        "0b00d46bcdc9a7cf",
        "36306eb02eeee317"
      ]
    },
    {
      "id": "place-11-1",
      "kind": "place",
      "parentId": "JP-11",
      "name": "ムーミン",
      "photoIds": [
        "a6b1f1663d31c601",
        "8170926c49d7cece",
        "e2bd930afdda96fb"
      ]
    },
    {
      "id": "JP-12",
      "kind": "pref",
      "parentId": null,
      "name": "千葉",
      "photoIds": [
        "dd021e36d7647f6a",
        "35720c8135b538d3",
        "f0efed253d5d0059"
      ]
    },
    {
      "id": "JP-13",
      "kind": "pref",
      "parentId": null,
      "name": "東京",
      "photoIds": [
        "9308d32868f3d1d0",
        "d430e8862c0deb58",
        "b180298d384e534d"
      ]
    },
    {
      "id": "JP-14",
      "kind": "pref",
      "parentId": null,
      "name": "神奈川",
      "photoIds": [
        "aabfe1aaa96b9705",
        "3b9be7942c0f2f29",
        "7443df2726d94788"
      ]
    },
    {
      "id": "JP-15",
      "kind": "pref",
      "parentId": null,
      "name": "新潟",
      "photoIds": [
        "39e65a26bbaf04fa",
        "6e9bad713ec1b1f6",
        "85619e7034c1edfc"
      ]
    },
    {
      "id": "JP-16",
      "kind": "pref",
      "parentId": null,
      "name": "富山",
      "photoIds": [
        "871bdeb3d518add2",
        "c48170e00de2fec4",
        "e20255960ddaf202"
      ]
    },
    {
      "id": "JP-17",
      "kind": "pref",
      "parentId": null,
      "name": "石川",
      "photoIds": [
        "f0f02faedea5ab77",
        "9a41502e6de7abba",
        "337e5dfe5b2479d7"
      ]
    },
    {
      "id": "JP-19",
      "kind": "pref",
      "parentId": null,
      "name": "山梨",
      "photoIds": [
        "93c7274e55ed4b07",
        "b0514210fa5cdab7"
      ]
    },
    {
      "id": "JP-20",
      "kind": "pref",
      "parentId": null,
      "name": "長野",
      "photoIds": [
        "a044010afc7f0cc2",
        "164dfe635db9f2c3",
        "d0b99f1bea5291af"
      ]
    },
    {
      "id": "JP-21",
      "kind": "pref",
      "parentId": null,
      "name": "岐阜",
      "photoIds": [
        "476474ddd9b75e88",
        "5b9a90d066b8ed62",
        "54454de5ce7e2a99"
      ]
    },
    {
      "id": "JP-22",
      "kind": "pref",
      "parentId": null,
      "name": "静岡",
      "photoIds": [
        "0aa8fba9212dffad",
        "14f9571c21db6439",
        "981a2e93a8d72ac5"
      ]
    },
    {
      "id": "place-22-1",
      "kind": "place",
      "parentId": "JP-22",
      "name": "網代",
      "photoIds": [
        "0be591bba40a50f1",
        "a56ac2cef5de0c53",
        "d654aa1712adb51d"
      ]
    },
    {
      "id": "JP-23",
      "kind": "pref",
      "parentId": null,
      "name": "愛知",
      "photoIds": [
        "89e3f306c098f82f",
        "3f9417bed00c8a65",
        "f9687ad9ebfd0bab"
      ]
    },
    {
      "id": "place-23-1",
      "kind": "place",
      "parentId": "JP-23",
      "name": "名古屋",
      "photoIds": [
        "03763941dd1e1202",
        "52ffe873d9187509"
      ]
    },
    {
      "id": "JP-24",
      "kind": "pref",
      "parentId": null,
      "name": "三重",
      "photoIds": [
        "08810d93ffda7205",
        "c8626c57670986b4",
        "02df887b7d2fd974"
      ]
    },
    {
      "id": "JP-25",
      "kind": "pref",
      "parentId": null,
      "name": "滋賀",
      "photoIds": [
        "20c0b947b3663449",
        "5468418f7a5a2502",
        "a497e05077e8ef4f"
      ]
    },
    {
      "id": "place-25-1",
      "kind": "place",
      "parentId": "JP-25",
      "name": "琵琶湖",
      "photoIds": [
        "4c54ba7e19717a29",
        "582bcf5d36b57d4a",
        "d2e22c3ff4b71a0e"
      ]
    },
    {
      "id": "JP-26",
      "kind": "pref",
      "parentId": null,
      "name": "京都",
      "photoIds": [
        "c55650e37f49975c",
        "5f181106d6e8afc7",
        "5ef02f87d96ff18c"
      ]
    },
    {
      "id": "JP-27",
      "kind": "pref",
      "parentId": null,
      "name": "大阪",
      "photoIds": [
        "da29b6c9e1bd633a",
        "fab4af82038c3962",
        "706308d9a8ddab49"
      ]
    },
    {
      "id": "JP-28",
      "kind": "pref",
      "parentId": null,
      "name": "兵庫",
      "photoIds": [
        "7ddbc0df3533652d",
        "b91e07a9b82e72c3",
        "0d1e1d47df21b63f"
      ]
    },
    {
      "id": "JP-30",
      "kind": "pref",
      "parentId": null,
      "name": "和歌山",
      "photoIds": [
        "c4f30c5a793738bf",
        "e64be0d23ce935d5",
        "e6681b99e719b4c0"
      ]
    },
    {
      "id": "JP-31",
      "kind": "pref",
      "parentId": null,
      "name": "鳥取",
      "photoIds": [
        "de2d7b22c84ffa60",
        "3544090346a6a76f",
        "b3933ce9af5ce59a"
      ]
    },
    {
      "id": "JP-32",
      "kind": "pref",
      "parentId": null,
      "name": "島根",
      "photoIds": [
        "393c7b25fe321415",
        "a8d49aec4f79157f"
      ]
    },
    {
      "id": "JP-33",
      "kind": "pref",
      "parentId": null,
      "name": "岡山",
      "photoIds": [
        "c01dc6098259229f",
        "2faad75928ccb207"
      ]
    },
    {
      "id": "JP-35",
      "kind": "pref",
      "parentId": null,
      "name": "山口",
      "photoIds": [
        "f6183b7bba0dbfde",
        "da18552459977279",
        "06f9fbec1896d5e4"
      ]
    },
    {
      "id": "JP-37",
      "kind": "pref",
      "parentId": null,
      "name": "香川",
      "photoIds": [
        "d0a8db7fff25111c",
        "6e45fc64a0f00f09",
        "67c8bbf17044ba4f"
      ]
    },
    {
      "id": "JP-42",
      "kind": "pref",
      "parentId": null,
      "name": "長崎",
      "photoIds": [
        "642b0c3d376e0f55",
        "94ad7de061b23bf5",
        "835d56182e3c8514"
      ]
    },
    {
      "id": "JP-44",
      "kind": "pref",
      "parentId": null,
      "name": "大分",
      "photoIds": [
        "55c1e4dca4f0e01e",
        "5d3ee20d5a9a9b8f",
        "3ea0f62dd732b9a3"
      ]
    },
    {
      "id": "JP-45",
      "kind": "pref",
      "parentId": null,
      "name": "宮崎",
      "photoIds": [
        "4b4052d3de91a31a",
        "75d0e20b70196d16",
        "16508a25595ced2a"
      ]
    },
    {
      "id": "JP-46",
      "kind": "pref",
      "parentId": null,
      "name": "鹿児島",
      "photoIds": [
        "1c6603e43c08386e",
        "3400a5a6d2e502c0",
        "84c5eed862038c82"
      ]
    },
    {
      "id": "JP-47",
      "kind": "pref",
      "parentId": null,
      "name": "沖縄",
      "photoIds": [
        "31c7b0b0c1181724",
        "b2228f79bf7dde0f",
        "3c9913f9d6c39c70"
      ]
    },
    {
      "id": "place-47-1",
      "kind": "place",
      "parentId": "JP-47",
      "name": "那覇",
      "photoIds": [
        "77b835c581a5cfeb",
        "a2ea5c96ff71eaa5",
        "d9ebf2b3a3d49af1"
      ]
    },
    {
      "id": "US",
      "kind": "country",
      "parentId": null,
      "name": "アメリカ",
      "photoIds": [
        "4926146221d7f204",
        "24f8fa56ecbcecc9",
        "0e3fbd9a20fd4e09"
      ]
    },
    {
      "id": "place-us-east",
      "kind": "place",
      "parentId": "US",
      "name": "東部",
      "photoIds": [
        "84bb7e3a568f084e",
        "650de0fc2ae76d19",
        "53c378a4e4416cba"
      ]
    },
    {
      "id": "place-us-west",
      "kind": "place",
      "parentId": "US",
      "name": "西部",
      "photoIds": [
        "7c3029e26ba9273a",
        "1e84ace3fa1e5329",
        "47ebcf7f8b98ed43"
      ]
    }
  ],
  "photos": {
    "ed541a9e176b2f1e": {
      "src": "img/ed541a9e176b2f1e.jpg",
      "thumb": "img/ed541a9e176b2f1e-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-09",
      "caption": null,
      "alt": "カナダの景色"
    },
    "8e55e6878408f121": {
      "src": "img/8e55e6878408f121.jpg",
      "thumb": "img/8e55e6878408f121-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-09",
      "caption": null,
      "alt": "カナダの景色"
    },
    "32e771f092b14197": {
      "src": "img/32e771f092b14197.jpg",
      "thumb": "img/32e771f092b14197-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-09",
      "caption": null,
      "alt": "カナダの景色"
    },
    "44a31d37f4365b4f": {
      "src": "img/44a31d37f4365b4f.jpg",
      "thumb": "img/44a31d37f4365b4f-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2012-03",
      "caption": null,
      "alt": "グアムの景色"
    },
    "48f9e0c4e651eef8": {
      "src": "img/48f9e0c4e651eef8.jpg",
      "thumb": "img/48f9e0c4e651eef8-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2012-03",
      "caption": null,
      "alt": "グアムの景色"
    },
    "4b4a5128abde34d4": {
      "src": "img/4b4a5128abde34d4.jpg",
      "thumb": "img/4b4a5128abde34d4-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2012-03",
      "caption": null,
      "alt": "グアムの景色"
    },
    "b526214eb9fa0f12": {
      "src": "img/b526214eb9fa0f12.jpg",
      "thumb": "img/b526214eb9fa0f12-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2015-11",
      "caption": null,
      "alt": "香港の景色"
    },
    "9a207ba38262c653": {
      "src": "img/9a207ba38262c653.jpg",
      "thumb": "img/9a207ba38262c653-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2015-11",
      "caption": null,
      "alt": "香港の景色"
    },
    "fe65d3d2b97cfe0c": {
      "src": "img/fe65d3d2b97cfe0c.jpg",
      "thumb": "img/fe65d3d2b97cfe0c-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2015-11",
      "caption": null,
      "alt": "香港の景色"
    },
    "d2a22d61cc9ca215": {
      "src": "img/d2a22d61cc9ca215.jpg",
      "thumb": "img/d2a22d61cc9ca215-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-05",
      "caption": null,
      "alt": "北海道の景色"
    },
    "43f2c8ad909a17d7": {
      "src": "img/43f2c8ad909a17d7.jpg",
      "thumb": "img/43f2c8ad909a17d7-s.jpg",
      "w": 240,
      "h": 400,
      "taken": "2009-03",
      "caption": null,
      "alt": "北海道の景色"
    },
    "574e1c1999fb3dc5": {
      "src": "img/574e1c1999fb3dc5.jpg",
      "thumb": "img/574e1c1999fb3dc5-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-01",
      "caption": null,
      "alt": "北海道の景色"
    },
    "293b5211b9e1d265": {
      "src": "img/293b5211b9e1d265.jpg",
      "thumb": "img/293b5211b9e1d265-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-05",
      "caption": null,
      "alt": "道北の景色"
    },
    "4e2f079846f105e7": {
      "src": "img/4e2f079846f105e7.jpg",
      "thumb": "img/4e2f079846f105e7-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2013-05",
      "caption": null,
      "alt": "道北の景色"
    },
    "589292dc5cd130ca": {
      "src": "img/589292dc5cd130ca.jpg",
      "thumb": "img/589292dc5cd130ca-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-01",
      "caption": null,
      "alt": "道南の景色"
    },
    "d65ac18a225e6e4a": {
      "src": "img/d65ac18a225e6e4a.jpg",
      "thumb": "img/d65ac18a225e6e4a-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-01",
      "caption": null,
      "alt": "道南の景色"
    },
    "45073a06622bbafb": {
      "src": "img/45073a06622bbafb.jpg",
      "thumb": "img/45073a06622bbafb-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-01",
      "caption": null,
      "alt": "道南の景色"
    },
    "fda3a67e55b0892c": {
      "src": "img/fda3a67e55b0892c.jpg",
      "thumb": "img/fda3a67e55b0892c-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-09",
      "caption": null,
      "alt": "道央の景色"
    },
    "60021d76de7de35c": {
      "src": "img/60021d76de7de35c.jpg",
      "thumb": "img/60021d76de7de35c-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-09",
      "caption": null,
      "alt": "道央の景色"
    },
    "252b9ec19f8f86dd": {
      "src": "img/252b9ec19f8f86dd.jpg",
      "thumb": "img/252b9ec19f8f86dd-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-09",
      "caption": null,
      "alt": "道央の景色"
    },
    "bbefefd53010b45a": {
      "src": "img/bbefefd53010b45a.jpg",
      "thumb": "img/bbefefd53010b45a-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-06",
      "caption": null,
      "alt": "青森の景色"
    },
    "adb5583c53220f0b": {
      "src": "img/adb5583c53220f0b.jpg",
      "thumb": "img/adb5583c53220f0b-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-08",
      "caption": null,
      "alt": "青森の景色"
    },
    "93d61d7450dbadce": {
      "src": "img/93d61d7450dbadce.jpg",
      "thumb": "img/93d61d7450dbadce-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-08",
      "caption": null,
      "alt": "青森の景色"
    },
    "96d87362bc9b9859": {
      "src": "img/96d87362bc9b9859.jpg",
      "thumb": "img/96d87362bc9b9859-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-11",
      "caption": null,
      "alt": "岩手の景色"
    },
    "ae8660de10a91f43": {
      "src": "img/ae8660de10a91f43.jpg",
      "thumb": "img/ae8660de10a91f43-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-07",
      "caption": null,
      "alt": "岩手の景色"
    },
    "4ca39cad5fd49c68": {
      "src": "img/4ca39cad5fd49c68.jpg",
      "thumb": "img/4ca39cad5fd49c68-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-02",
      "caption": null,
      "alt": "岩手の景色"
    },
    "2ea0c6449c4a3ce5": {
      "src": "img/2ea0c6449c4a3ce5.jpg",
      "thumb": "img/2ea0c6449c4a3ce5-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-04",
      "caption": null,
      "alt": "宮城の景色"
    },
    "58b4802260574a53": {
      "src": "img/58b4802260574a53.jpg",
      "thumb": "img/58b4802260574a53-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-11",
      "caption": null,
      "alt": "宮城の景色"
    },
    "5622e573504ac48e": {
      "src": "img/5622e573504ac48e.jpg",
      "thumb": "img/5622e573504ac48e-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-06",
      "caption": null,
      "alt": "宮城の景色"
    },
    "82f1f22f6e225896": {
      "src": "img/82f1f22f6e225896.jpg",
      "thumb": "img/82f1f22f6e225896-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2012-09",
      "caption": null,
      "alt": "秋田の景色"
    },
    "0a4695cf4435111e": {
      "src": "img/0a4695cf4435111e.jpg",
      "thumb": "img/0a4695cf4435111e-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2016-03",
      "caption": null,
      "alt": "秋田の景色"
    },
    "8517b98b014dde61": {
      "src": "img/8517b98b014dde61.jpg",
      "thumb": "img/8517b98b014dde61-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-04",
      "caption": null,
      "alt": "秋田の景色"
    },
    "e3351bc7b386853d": {
      "src": "img/e3351bc7b386853d.jpg",
      "thumb": "img/e3351bc7b386853d-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": null,
      "caption": null,
      "alt": "大曲花火の景色"
    },
    "fc9c114850e24229": {
      "src": "img/fc9c114850e24229.jpg",
      "thumb": "img/fc9c114850e24229-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": null,
      "caption": null,
      "alt": "大曲花火の景色"
    },
    "3eb577e48f12d9eb": {
      "src": "img/3eb577e48f12d9eb.jpg",
      "thumb": "img/3eb577e48f12d9eb-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": null,
      "caption": null,
      "alt": "大曲花火の景色"
    },
    "fc5ab11152a013d1": {
      "src": "img/fc5ab11152a013d1.jpg",
      "thumb": "img/fc5ab11152a013d1-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-02",
      "caption": null,
      "alt": "山形の景色"
    },
    "e823b085a0659a73": {
      "src": "img/e823b085a0659a73.jpg",
      "thumb": "img/e823b085a0659a73-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-02",
      "caption": null,
      "alt": "山形の景色"
    },
    "a0e8619b25191dfa": {
      "src": "img/a0e8619b25191dfa.jpg",
      "thumb": "img/a0e8619b25191dfa-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-02",
      "caption": null,
      "alt": "山形の景色"
    },
    "1b11df844d17c7bb": {
      "src": "img/1b11df844d17c7bb.jpg",
      "thumb": "img/1b11df844d17c7bb-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2013-12",
      "caption": null,
      "alt": "福島の景色"
    },
    "eeb5c7179d7ee637": {
      "src": "img/eeb5c7179d7ee637.jpg",
      "thumb": "img/eeb5c7179d7ee637-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-02",
      "caption": null,
      "alt": "福島の景色"
    },
    "b66c6aa2027f82e1": {
      "src": "img/b66c6aa2027f82e1.jpg",
      "thumb": "img/b66c6aa2027f82e1-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2014-02",
      "caption": null,
      "alt": "福島の景色"
    },
    "a2d5879338e2180a": {
      "src": "img/a2d5879338e2180a.jpg",
      "thumb": "img/a2d5879338e2180a-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-08",
      "caption": null,
      "alt": "茨城の景色"
    },
    "72bca2c054fe4a3e": {
      "src": "img/72bca2c054fe4a3e.jpg",
      "thumb": "img/72bca2c054fe4a3e-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-08",
      "caption": null,
      "alt": "茨城の景色"
    },
    "27793dbef584e371": {
      "src": "img/27793dbef584e371.jpg",
      "thumb": "img/27793dbef584e371-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-08",
      "caption": null,
      "alt": "茨城の景色"
    },
    "8773b7826bbf4178": {
      "src": "img/8773b7826bbf4178.jpg",
      "thumb": "img/8773b7826bbf4178-s.jpg",
      "w": 240,
      "h": 400,
      "taken": "2009-03",
      "caption": null,
      "alt": "栃木の景色"
    },
    "774109f6cb34a165": {
      "src": "img/774109f6cb34a165.jpg",
      "thumb": "img/774109f6cb34a165-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2014-03",
      "caption": null,
      "alt": "栃木の景色"
    },
    "76d56a548d36202a": {
      "src": "img/76d56a548d36202a.jpg",
      "thumb": "img/76d56a548d36202a-s.jpg",
      "w": 240,
      "h": 400,
      "taken": "2009-03",
      "caption": null,
      "alt": "栃木の景色"
    },
    "4eb3f6bebc9d8966": {
      "src": "img/4eb3f6bebc9d8966.jpg",
      "thumb": "img/4eb3f6bebc9d8966-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2010-08",
      "caption": null,
      "alt": "群馬の景色"
    },
    "c4889a00bbdd2a35": {
      "src": "img/c4889a00bbdd2a35.jpg",
      "thumb": "img/c4889a00bbdd2a35-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2010-08",
      "caption": null,
      "alt": "群馬の景色"
    },
    "ba8d011d49d38efe": {
      "src": "img/ba8d011d49d38efe.jpg",
      "thumb": "img/ba8d011d49d38efe-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2010-08",
      "caption": null,
      "alt": "群馬の景色"
    },
    "0b00d46bcdc9a7cf": {
      "src": "img/0b00d46bcdc9a7cf.jpg",
      "thumb": "img/0b00d46bcdc9a7cf-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-02",
      "caption": null,
      "alt": "埼玉の景色"
    },
    "36306eb02eeee317": {
      "src": "img/36306eb02eeee317.jpg",
      "thumb": "img/36306eb02eeee317-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-02",
      "caption": null,
      "alt": "埼玉の景色"
    },
    "a6b1f1663d31c601": {
      "src": "img/a6b1f1663d31c601.jpg",
      "thumb": "img/a6b1f1663d31c601-s.jpg",
      "w": 1108,
      "h": 1477,
      "taken": "2024-11",
      "caption": null,
      "alt": "ムーミンの景色"
    },
    "8170926c49d7cece": {
      "src": "img/8170926c49d7cece.jpg",
      "thumb": "img/8170926c49d7cece-s.jpg",
      "w": 1108,
      "h": 1477,
      "taken": "2024-11",
      "caption": null,
      "alt": "ムーミンの景色"
    },
    "e2bd930afdda96fb": {
      "src": "img/e2bd930afdda96fb.jpg",
      "thumb": "img/e2bd930afdda96fb-s.jpg",
      "w": 1108,
      "h": 1477,
      "taken": "2024-11",
      "caption": null,
      "alt": "ムーミンの景色"
    },
    "dd021e36d7647f6a": {
      "src": "img/dd021e36d7647f6a.jpg",
      "thumb": "img/dd021e36d7647f6a-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-02",
      "caption": null,
      "alt": "千葉の景色"
    },
    "35720c8135b538d3": {
      "src": "img/35720c8135b538d3.jpg",
      "thumb": "img/35720c8135b538d3-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2017-04",
      "caption": null,
      "alt": "千葉の景色"
    },
    "f0efed253d5d0059": {
      "src": "img/f0efed253d5d0059.jpg",
      "thumb": "img/f0efed253d5d0059-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2026-03",
      "caption": null,
      "alt": "千葉の景色"
    },
    "9308d32868f3d1d0": {
      "src": "img/9308d32868f3d1d0.jpg",
      "thumb": "img/9308d32868f3d1d0-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-02",
      "caption": null,
      "alt": "東京の景色"
    },
    "d430e8862c0deb58": {
      "src": "img/d430e8862c0deb58.jpg",
      "thumb": "img/d430e8862c0deb58-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2019-10",
      "caption": null,
      "alt": "東京の景色"
    },
    "b180298d384e534d": {
      "src": "img/b180298d384e534d.jpg",
      "thumb": "img/b180298d384e534d-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2022-04",
      "caption": null,
      "alt": "東京の景色"
    },
    "aabfe1aaa96b9705": {
      "src": "img/aabfe1aaa96b9705.jpg",
      "thumb": "img/aabfe1aaa96b9705-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2015-05",
      "caption": null,
      "alt": "神奈川の景色"
    },
    "3b9be7942c0f2f29": {
      "src": "img/3b9be7942c0f2f29.jpg",
      "thumb": "img/3b9be7942c0f2f29-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2023-08",
      "caption": null,
      "alt": "神奈川の景色"
    },
    "7443df2726d94788": {
      "src": "img/7443df2726d94788.jpg",
      "thumb": "img/7443df2726d94788-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2023-08",
      "caption": null,
      "alt": "神奈川の景色"
    },
    "39e65a26bbaf04fa": {
      "src": "img/39e65a26bbaf04fa.jpg",
      "thumb": "img/39e65a26bbaf04fa-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-04",
      "caption": null,
      "alt": "新潟の景色"
    },
    "6e9bad713ec1b1f6": {
      "src": "img/6e9bad713ec1b1f6.jpg",
      "thumb": "img/6e9bad713ec1b1f6-s.jpg",
      "w": 240,
      "h": 400,
      "taken": "2009-03",
      "caption": null,
      "alt": "新潟の景色"
    },
    "85619e7034c1edfc": {
      "src": "img/85619e7034c1edfc.jpg",
      "thumb": "img/85619e7034c1edfc-s.jpg",
      "w": 240,
      "h": 400,
      "taken": "2009-03",
      "caption": null,
      "alt": "新潟の景色"
    },
    "871bdeb3d518add2": {
      "src": "img/871bdeb3d518add2.jpg",
      "thumb": "img/871bdeb3d518add2-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-03",
      "caption": null,
      "alt": "富山の景色"
    },
    "c48170e00de2fec4": {
      "src": "img/c48170e00de2fec4.jpg",
      "thumb": "img/c48170e00de2fec4-s.jpg",
      "w": 1401,
      "h": 786,
      "taken": "2011-04",
      "caption": null,
      "alt": "富山の景色"
    },
    "e20255960ddaf202": {
      "src": "img/e20255960ddaf202.jpg",
      "thumb": "img/e20255960ddaf202-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-04",
      "caption": null,
      "alt": "富山の景色"
    },
    "f0f02faedea5ab77": {
      "src": "img/f0f02faedea5ab77.jpg",
      "thumb": "img/f0f02faedea5ab77-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-04",
      "caption": null,
      "alt": "石川の景色"
    },
    "9a41502e6de7abba": {
      "src": "img/9a41502e6de7abba.jpg",
      "thumb": "img/9a41502e6de7abba-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-04",
      "caption": null,
      "alt": "石川の景色"
    },
    "337e5dfe5b2479d7": {
      "src": "img/337e5dfe5b2479d7.jpg",
      "thumb": "img/337e5dfe5b2479d7-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-04",
      "caption": null,
      "alt": "石川の景色"
    },
    "93c7274e55ed4b07": {
      "src": "img/93c7274e55ed4b07.jpg",
      "thumb": "img/93c7274e55ed4b07-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-05",
      "caption": null,
      "alt": "山梨の景色"
    },
    "b0514210fa5cdab7": {
      "src": "img/b0514210fa5cdab7.jpg",
      "thumb": "img/b0514210fa5cdab7-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-05",
      "caption": null,
      "alt": "山梨の景色"
    },
    "a044010afc7f0cc2": {
      "src": "img/a044010afc7f0cc2.jpg",
      "thumb": "img/a044010afc7f0cc2-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-05",
      "caption": null,
      "alt": "長野の景色"
    },
    "164dfe635db9f2c3": {
      "src": "img/164dfe635db9f2c3.jpg",
      "thumb": "img/164dfe635db9f2c3-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-09",
      "caption": null,
      "alt": "長野の景色"
    },
    "d0b99f1bea5291af": {
      "src": "img/d0b99f1bea5291af.jpg",
      "thumb": "img/d0b99f1bea5291af-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-05",
      "caption": null,
      "alt": "長野の景色"
    },
    "476474ddd9b75e88": {
      "src": "img/476474ddd9b75e88.jpg",
      "thumb": "img/476474ddd9b75e88-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2013-12",
      "caption": null,
      "alt": "岐阜の景色"
    },
    "5b9a90d066b8ed62": {
      "src": "img/5b9a90d066b8ed62.jpg",
      "thumb": "img/5b9a90d066b8ed62-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-12",
      "caption": null,
      "alt": "岐阜の景色"
    },
    "54454de5ce7e2a99": {
      "src": "img/54454de5ce7e2a99.jpg",
      "thumb": "img/54454de5ce7e2a99-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2013-12",
      "caption": null,
      "alt": "岐阜の景色"
    },
    "0aa8fba9212dffad": {
      "src": "img/0aa8fba9212dffad.jpg",
      "thumb": "img/0aa8fba9212dffad-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "静岡の景色"
    },
    "14f9571c21db6439": {
      "src": "img/14f9571c21db6439.jpg",
      "thumb": "img/14f9571c21db6439-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "静岡の景色"
    },
    "981a2e93a8d72ac5": {
      "src": "img/981a2e93a8d72ac5.jpg",
      "thumb": "img/981a2e93a8d72ac5-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "静岡の景色"
    },
    "0be591bba40a50f1": {
      "src": "img/0be591bba40a50f1.jpg",
      "thumb": "img/0be591bba40a50f1-s.jpg",
      "w": 1108,
      "h": 1477,
      "taken": "2026-10",
      "caption": null,
      "alt": "網代の景色"
    },
    "a56ac2cef5de0c53": {
      "src": "img/a56ac2cef5de0c53.jpg",
      "thumb": "img/a56ac2cef5de0c53-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-10",
      "caption": null,
      "alt": "網代の景色"
    },
    "d654aa1712adb51d": {
      "src": "img/d654aa1712adb51d.jpg",
      "thumb": "img/d654aa1712adb51d-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-10",
      "caption": null,
      "alt": "網代の景色"
    },
    "89e3f306c098f82f": {
      "src": "img/89e3f306c098f82f.jpg",
      "thumb": "img/89e3f306c098f82f-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2026-04",
      "caption": null,
      "alt": "愛知の景色"
    },
    "3f9417bed00c8a65": {
      "src": "img/3f9417bed00c8a65.jpg",
      "thumb": "img/3f9417bed00c8a65-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2013-12",
      "caption": null,
      "alt": "愛知の景色"
    },
    "f9687ad9ebfd0bab": {
      "src": "img/f9687ad9ebfd0bab.jpg",
      "thumb": "img/f9687ad9ebfd0bab-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-03",
      "caption": null,
      "alt": "愛知の景色"
    },
    "03763941dd1e1202": {
      "src": "img/03763941dd1e1202.jpg",
      "thumb": "img/03763941dd1e1202-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-03",
      "caption": null,
      "alt": "名古屋の景色"
    },
    "52ffe873d9187509": {
      "src": "img/52ffe873d9187509.jpg",
      "thumb": "img/52ffe873d9187509-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-09",
      "caption": null,
      "alt": "名古屋の景色"
    },
    "08810d93ffda7205": {
      "src": "img/08810d93ffda7205.jpg",
      "thumb": "img/08810d93ffda7205-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-07",
      "caption": null,
      "alt": "三重の景色"
    },
    "c8626c57670986b4": {
      "src": "img/c8626c57670986b4.jpg",
      "thumb": "img/c8626c57670986b4-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-07",
      "caption": null,
      "alt": "三重の景色"
    },
    "02df887b7d2fd974": {
      "src": "img/02df887b7d2fd974.jpg",
      "thumb": "img/02df887b7d2fd974-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-07",
      "caption": null,
      "alt": "三重の景色"
    },
    "20c0b947b3663449": {
      "src": "img/20c0b947b3663449.jpg",
      "thumb": "img/20c0b947b3663449-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-09",
      "caption": null,
      "alt": "滋賀の景色"
    },
    "5468418f7a5a2502": {
      "src": "img/5468418f7a5a2502.jpg",
      "thumb": "img/5468418f7a5a2502-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-09",
      "caption": null,
      "alt": "滋賀の景色"
    },
    "a497e05077e8ef4f": {
      "src": "img/a497e05077e8ef4f.jpg",
      "thumb": "img/a497e05077e8ef4f-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "滋賀の景色"
    },
    "4c54ba7e19717a29": {
      "src": "img/4c54ba7e19717a29.jpg",
      "thumb": "img/4c54ba7e19717a29-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-10",
      "caption": null,
      "alt": "琵琶湖の景色"
    },
    "582bcf5d36b57d4a": {
      "src": "img/582bcf5d36b57d4a.jpg",
      "thumb": "img/582bcf5d36b57d4a-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-10",
      "caption": null,
      "alt": "琵琶湖の景色"
    },
    "d2e22c3ff4b71a0e": {
      "src": "img/d2e22c3ff4b71a0e.jpg",
      "thumb": "img/d2e22c3ff4b71a0e-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2026-10",
      "caption": null,
      "alt": "琵琶湖の景色"
    },
    "c55650e37f49975c": {
      "src": "img/c55650e37f49975c.jpg",
      "thumb": "img/c55650e37f49975c-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2015-09",
      "caption": null,
      "alt": "京都の景色"
    },
    "5f181106d6e8afc7": {
      "src": "img/5f181106d6e8afc7.jpg",
      "thumb": "img/5f181106d6e8afc7-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-09",
      "caption": null,
      "alt": "京都の景色"
    },
    "5ef02f87d96ff18c": {
      "src": "img/5ef02f87d96ff18c.jpg",
      "thumb": "img/5ef02f87d96ff18c-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2010-11",
      "caption": null,
      "alt": "京都の景色"
    },
    "da29b6c9e1bd633a": {
      "src": "img/da29b6c9e1bd633a.jpg",
      "thumb": "img/da29b6c9e1bd633a-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2013-06",
      "caption": null,
      "alt": "大阪の景色"
    },
    "fab4af82038c3962": {
      "src": "img/fab4af82038c3962.jpg",
      "thumb": "img/fab4af82038c3962-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-04",
      "caption": null,
      "alt": "大阪の景色"
    },
    "706308d9a8ddab49": {
      "src": "img/706308d9a8ddab49.jpg",
      "thumb": "img/706308d9a8ddab49-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2022-06",
      "caption": null,
      "alt": "大阪の景色"
    },
    "7ddbc0df3533652d": {
      "src": "img/7ddbc0df3533652d.jpg",
      "thumb": "img/7ddbc0df3533652d-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2010-10",
      "caption": null,
      "alt": "兵庫の景色"
    },
    "b91e07a9b82e72c3": {
      "src": "img/b91e07a9b82e72c3.jpg",
      "thumb": "img/b91e07a9b82e72c3-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2010-07",
      "caption": null,
      "alt": "兵庫の景色"
    },
    "0d1e1d47df21b63f": {
      "src": "img/0d1e1d47df21b63f.jpg",
      "thumb": "img/0d1e1d47df21b63f-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-12",
      "caption": null,
      "alt": "兵庫の景色"
    },
    "c4f30c5a793738bf": {
      "src": "img/c4f30c5a793738bf.jpg",
      "thumb": "img/c4f30c5a793738bf-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-02",
      "caption": null,
      "alt": "和歌山の景色"
    },
    "e64be0d23ce935d5": {
      "src": "img/e64be0d23ce935d5.jpg",
      "thumb": "img/e64be0d23ce935d5-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2007-08",
      "caption": null,
      "alt": "和歌山の景色"
    },
    "e6681b99e719b4c0": {
      "src": "img/e6681b99e719b4c0.jpg",
      "thumb": "img/e6681b99e719b4c0-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-02",
      "caption": null,
      "alt": "和歌山の景色"
    },
    "de2d7b22c84ffa60": {
      "src": "img/de2d7b22c84ffa60.jpg",
      "thumb": "img/de2d7b22c84ffa60-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-10",
      "caption": null,
      "alt": "鳥取の景色"
    },
    "3544090346a6a76f": {
      "src": "img/3544090346a6a76f.jpg",
      "thumb": "img/3544090346a6a76f-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "鳥取の景色"
    },
    "b3933ce9af5ce59a": {
      "src": "img/b3933ce9af5ce59a.jpg",
      "thumb": "img/b3933ce9af5ce59a-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2018-06",
      "caption": null,
      "alt": "鳥取の景色"
    },
    "393c7b25fe321415": {
      "src": "img/393c7b25fe321415.jpg",
      "thumb": "img/393c7b25fe321415-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "島根の景色"
    },
    "a8d49aec4f79157f": {
      "src": "img/a8d49aec4f79157f.jpg",
      "thumb": "img/a8d49aec4f79157f-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "島根の景色"
    },
    "c01dc6098259229f": {
      "src": "img/c01dc6098259229f.jpg",
      "thumb": "img/c01dc6098259229f-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-10",
      "caption": null,
      "alt": "岡山の景色"
    },
    "2faad75928ccb207": {
      "src": "img/2faad75928ccb207.jpg",
      "thumb": "img/2faad75928ccb207-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2024-08",
      "caption": null,
      "alt": "岡山の景色"
    },
    "f6183b7bba0dbfde": {
      "src": "img/f6183b7bba0dbfde.jpg",
      "thumb": "img/f6183b7bba0dbfde-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-02",
      "caption": null,
      "alt": "山口の景色"
    },
    "da18552459977279": {
      "src": "img/da18552459977279.jpg",
      "thumb": "img/da18552459977279-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-02",
      "caption": null,
      "alt": "山口の景色"
    },
    "06f9fbec1896d5e4": {
      "src": "img/06f9fbec1896d5e4.jpg",
      "thumb": "img/06f9fbec1896d5e4-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-02",
      "caption": null,
      "alt": "山口の景色"
    },
    "d0a8db7fff25111c": {
      "src": "img/d0a8db7fff25111c.jpg",
      "thumb": "img/d0a8db7fff25111c-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-08",
      "caption": null,
      "alt": "香川の景色"
    },
    "6e45fc64a0f00f09": {
      "src": "img/6e45fc64a0f00f09.jpg",
      "thumb": "img/6e45fc64a0f00f09-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-12",
      "caption": null,
      "alt": "香川の景色"
    },
    "67c8bbf17044ba4f": {
      "src": "img/67c8bbf17044ba4f.jpg",
      "thumb": "img/67c8bbf17044ba4f-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-03",
      "caption": null,
      "alt": "香川の景色"
    },
    "642b0c3d376e0f55": {
      "src": "img/642b0c3d376e0f55.jpg",
      "thumb": "img/642b0c3d376e0f55-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2015-06",
      "caption": null,
      "alt": "長崎の景色"
    },
    "94ad7de061b23bf5": {
      "src": "img/94ad7de061b23bf5.jpg",
      "thumb": "img/94ad7de061b23bf5-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2015-06",
      "caption": null,
      "alt": "長崎の景色"
    },
    "835d56182e3c8514": {
      "src": "img/835d56182e3c8514.jpg",
      "thumb": "img/835d56182e3c8514-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2015-06",
      "caption": null,
      "alt": "長崎の景色"
    },
    "55c1e4dca4f0e01e": {
      "src": "img/55c1e4dca4f0e01e.jpg",
      "thumb": "img/55c1e4dca4f0e01e-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-03",
      "caption": null,
      "alt": "大分の景色"
    },
    "5d3ee20d5a9a9b8f": {
      "src": "img/5d3ee20d5a9a9b8f.jpg",
      "thumb": "img/5d3ee20d5a9a9b8f-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-03",
      "caption": null,
      "alt": "大分の景色"
    },
    "3ea0f62dd732b9a3": {
      "src": "img/3ea0f62dd732b9a3.jpg",
      "thumb": "img/3ea0f62dd732b9a3-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2012-03",
      "caption": null,
      "alt": "大分の景色"
    },
    "4b4052d3de91a31a": {
      "src": "img/4b4052d3de91a31a.jpg",
      "thumb": "img/4b4052d3de91a31a-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2012-03",
      "caption": null,
      "alt": "宮崎の景色"
    },
    "75d0e20b70196d16": {
      "src": "img/75d0e20b70196d16.jpg",
      "thumb": "img/75d0e20b70196d16-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-03",
      "caption": null,
      "alt": "宮崎の景色"
    },
    "16508a25595ced2a": {
      "src": "img/16508a25595ced2a.jpg",
      "thumb": "img/16508a25595ced2a-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-03",
      "caption": null,
      "alt": "宮崎の景色"
    },
    "1c6603e43c08386e": {
      "src": "img/1c6603e43c08386e.jpg",
      "thumb": "img/1c6603e43c08386e-s.jpg",
      "w": 1600,
      "h": 899,
      "taken": "2012-03",
      "caption": null,
      "alt": "鹿児島の景色"
    },
    "3400a5a6d2e502c0": {
      "src": "img/3400a5a6d2e502c0.jpg",
      "thumb": "img/3400a5a6d2e502c0-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2012-03",
      "caption": null,
      "alt": "鹿児島の景色"
    },
    "84c5eed862038c82": {
      "src": "img/84c5eed862038c82.jpg",
      "thumb": "img/84c5eed862038c82-s.jpg",
      "w": 658,
      "h": 1026,
      "taken": "2012-03",
      "caption": null,
      "alt": "鹿児島の景色"
    },
    "31c7b0b0c1181724": {
      "src": "img/31c7b0b0c1181724.jpg",
      "thumb": "img/31c7b0b0c1181724-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-06",
      "caption": null,
      "alt": "沖縄の景色"
    },
    "b2228f79bf7dde0f": {
      "src": "img/b2228f79bf7dde0f.jpg",
      "thumb": "img/b2228f79bf7dde0f-s.jpg",
      "w": 778,
      "h": 1600,
      "taken": "2018-08",
      "caption": null,
      "alt": "沖縄の景色"
    },
    "3c9913f9d6c39c70": {
      "src": "img/3c9913f9d6c39c70.jpg",
      "thumb": "img/3c9913f9d6c39c70-s.jpg",
      "w": 1600,
      "h": 1200,
      "taken": "2018-08",
      "caption": null,
      "alt": "沖縄の景色"
    },
    "77b835c581a5cfeb": {
      "src": "img/77b835c581a5cfeb.jpg",
      "thumb": "img/77b835c581a5cfeb-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-06",
      "caption": null,
      "alt": "那覇の景色"
    },
    "a2ea5c96ff71eaa5": {
      "src": "img/a2ea5c96ff71eaa5.jpg",
      "thumb": "img/a2ea5c96ff71eaa5-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-06",
      "caption": null,
      "alt": "那覇の景色"
    },
    "d9ebf2b3a3d49af1": {
      "src": "img/d9ebf2b3a3d49af1.jpg",
      "thumb": "img/d9ebf2b3a3d49af1-s.jpg",
      "w": 1200,
      "h": 1600,
      "taken": "2025-06",
      "caption": null,
      "alt": "那覇の景色"
    },
    "4926146221d7f204": {
      "src": "img/4926146221d7f204.jpg",
      "thumb": "img/4926146221d7f204-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2011-08",
      "caption": null,
      "alt": "アメリカの景色"
    },
    "24f8fa56ecbcecc9": {
      "src": "img/24f8fa56ecbcecc9.jpg",
      "thumb": "img/24f8fa56ecbcecc9-s.jpg",
      "w": 900,
      "h": 1600,
      "taken": "2014-09",
      "caption": null,
      "alt": "アメリカの景色"
    },
    "0e3fbd9a20fd4e09": {
      "src": "img/0e3fbd9a20fd4e09.jpg",
      "thumb": "img/0e3fbd9a20fd4e09-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2011-08",
      "caption": null,
      "alt": "アメリカの景色"
    },
    "84bb7e3a568f084e": {
      "src": "img/84bb7e3a568f084e.jpg",
      "thumb": "img/84bb7e3a568f084e-s.jpg",
      "w": 1195,
      "h": 1600,
      "taken": "2010-12",
      "caption": null,
      "alt": "東部の景色"
    },
    "650de0fc2ae76d19": {
      "src": "img/650de0fc2ae76d19.jpg",
      "thumb": "img/650de0fc2ae76d19-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2010-12",
      "caption": null,
      "alt": "東部の景色"
    },
    "53c378a4e4416cba": {
      "src": "img/53c378a4e4416cba.jpg",
      "thumb": "img/53c378a4e4416cba-s.jpg",
      "w": 1600,
      "h": 1195,
      "taken": "2010-12",
      "caption": null,
      "alt": "東部の景色"
    },
    "7c3029e26ba9273a": {
      "src": "img/7c3029e26ba9273a.jpg",
      "thumb": "img/7c3029e26ba9273a-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-09",
      "caption": null,
      "alt": "西部の景色"
    },
    "1e84ace3fa1e5329": {
      "src": "img/1e84ace3fa1e5329.jpg",
      "thumb": "img/1e84ace3fa1e5329-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-09",
      "caption": null,
      "alt": "西部の景色"
    },
    "47ebcf7f8b98ed43": {
      "src": "img/47ebcf7f8b98ed43.jpg",
      "thumb": "img/47ebcf7f8b98ed43-s.jpg",
      "w": 1600,
      "h": 900,
      "taken": "2014-09",
      "caption": null,
      "alt": "西部の景色"
    }
  }
};
