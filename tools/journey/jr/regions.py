"""地域 ID・名前・アルバム名の対応。都道府県の名前は website/the-first-flower/journey/journey-map.js と同じ。"""

PREFS = {
    "JP-01": "北海道", "JP-02": "青森", "JP-03": "岩手", "JP-04": "宮城", "JP-05": "秋田", "JP-06": "山形",
    "JP-07": "福島", "JP-08": "茨城", "JP-09": "栃木", "JP-10": "群馬", "JP-11": "埼玉", "JP-12": "千葉",
    "JP-13": "東京", "JP-14": "神奈川", "JP-15": "新潟", "JP-16": "富山", "JP-17": "石川", "JP-18": "福井",
    "JP-19": "山梨", "JP-20": "長野", "JP-21": "岐阜", "JP-22": "静岡", "JP-23": "愛知", "JP-24": "三重",
    "JP-25": "滋賀", "JP-26": "京都", "JP-27": "大阪", "JP-28": "兵庫", "JP-29": "奈良", "JP-30": "和歌山",
    "JP-31": "鳥取", "JP-32": "島根", "JP-33": "岡山", "JP-34": "広島", "JP-35": "山口", "JP-36": "徳島",
    "JP-37": "香川", "JP-38": "愛媛", "JP-39": "高知", "JP-40": "福岡", "JP-41": "佐賀", "JP-42": "長崎",
    "JP-43": "熊本", "JP-44": "大分", "JP-45": "宮崎", "JP-46": "鹿児島", "JP-47": "沖縄",
}

# 国の日本語名（ISO 3166-1 alpha-2）。ない国は英語名のまま出し、ここに足す
COUNTRIES = {
    "HK": "香港", "MO": "マカオ", "TW": "台湾", "KR": "韓国", "CN": "中国", "US": "アメリカ", "CA": "カナダ",
    "AU": "オーストラリア", "SG": "シンガポール", "ID": "インドネシア", "TH": "タイ", "FR": "フランス",
    "IT": "イタリア", "GB": "イギリス", "DE": "ドイツ", "ES": "スペイン", "VN": "ベトナム", "MY": "マレーシア",
    "PH": "フィリピン", "NZ": "ニュージーランド", "GU": "グアム", "TR": "トルコ",
}

# アルバム名 → 地域の候補（2 つ以上なら作者が選ぶ）
ALBUM_HINTS = {
    "屋久島": ["JP-46"],
    "白神山地": ["JP-02", "JP-05"],
    "NewYork": ["US"],
    "L.A.": ["US"],
    "Las Vegas": ["US"],
    "ラスベガスへの旅行": ["US"],
    "香港 マカオ": ["HK", "MO"],
    "オーストラリア": ["AU"],
    "シンガポール": ["SG"],
    "CANADA": ["CA"],
    "bari": ["ID"],
    "koria": ["KR"],
}


def name(region_id, fallback=None):
    return PREFS.get(region_id) or COUNTRIES.get(region_id) or fallback or region_id


def kind(region_id):
    if region_id.startswith("JP-"):
        return "pref"
    if region_id.startswith("place-"):
        return "place"
    return "country"
