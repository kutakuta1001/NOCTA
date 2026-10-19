"""状態の SQLite。接続は呼び出し側（スレッド）ごとに connect() で開く（計画書 K7）。"""
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,            -- 最初に見つけた版の SHA-256 の先頭 16 桁（以後変えない）
    sha256 TEXT NOT NULL UNIQUE,
    lkey TEXT NOT NULL UNIQUE,      -- 同じ写真を束ねる鍵（takeout は title と撮影時刻、photos_app は sha256）
    taken_utc INTEGER,
    tz TEXT, tz_source TEXT,
    lat REAL, lng REAL,             -- 不明は NULL（0 で埋めない）
    people INTEGER NOT NULL DEFAULT 0,
    width INTEGER, height INTEGER
);
CREATE TABLE IF NOT EXISTS photo_variants (
    photo_id TEXT NOT NULL REFERENCES photos(id),
    sha256 TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('original', 'edited')),
    PRIMARY KEY (photo_id, sha256)
);
CREATE TABLE IF NOT EXISTS source_files (
    path TEXT PRIMARY KEY,
    root TEXT NOT NULL,
    kind TEXT NOT NULL,
    sha256 TEXT,
    sidecar_path TEXT,
    role TEXT,                      -- original / edited / video / sidecar / other
    photo_id TEXT,
    taken_utc INTEGER,
    status TEXT NOT NULL            -- photo / duplicate / pending / video / sidecar / other
);
CREATE TABLE IF NOT EXISTS pending_files (
    path TEXT PRIMARY KEY,
    reason TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS photo_albums (
    photo_id TEXT NOT NULL REFERENCES photos(id),
    album TEXT NOT NULL,
    PRIMARY KEY (photo_id, album)
);
CREATE TABLE IF NOT EXISTS regions (
    photo_id TEXT PRIMARY KEY REFERENCES photos(id),
    region_id TEXT,
    status TEXT NOT NULL,           -- resolved / needs_review / unknown
    candidates TEXT                 -- JSON 配列
);
CREATE TABLE IF NOT EXISTS overrides (
    photo_id TEXT PRIMARY KEY REFERENCES photos(id),
    region_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS review_groups (
    group_id TEXT PRIMARY KEY,
    local_day TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',   -- open / confirmed / not_trip
    region_id TEXT
);
CREATE TABLE IF NOT EXISTS review_group_members (
    group_id TEXT NOT NULL REFERENCES review_groups(group_id),
    photo_id TEXT NOT NULL REFERENCES photos(id),
    PRIMARY KEY (group_id, photo_id)
);
CREATE TABLE IF NOT EXISTS region_suggestions (
    group_id TEXT NOT NULL REFERENCES review_groups(group_id),
    region_id TEXT NOT NULL,
    source TEXT NOT NULL,           -- day / album
    votes INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (group_id, region_id, source)
);
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    lat REAL, lng REAL, radius_km REAL
);
CREATE TABLE IF NOT EXISTS place_members (
    photo_id TEXT NOT NULL REFERENCES photos(id),
    place_id TEXT NOT NULL REFERENCES places(id),
    PRIMARY KEY (photo_id, place_id)
);
CREATE TABLE IF NOT EXISTS assessments (
    sha256 TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    status TEXT NOT NULL,           -- ok / failed
    error TEXT,
    flags TEXT,                     -- JSON 配列
    landscape REAL, person REAL, blur REAL,
    embedding BLOB
);
CREATE TABLE IF NOT EXISTS photo_editorial (
    photo_id TEXT PRIMARY KEY REFERENCES photos(id),
    caption TEXT,
    rejected INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS region_choices (
    photo_id TEXT NOT NULL REFERENCES photos(id),
    region_id TEXT NOT NULL,
    selected INTEGER NOT NULL DEFAULT 0,
    allow_excluded INTEGER NOT NULL DEFAULT 0,
    variant_sha256 TEXT,
    updated_at INTEGER,
    PRIMARY KEY (photo_id, region_id)
);
CREATE TABLE IF NOT EXISTS representatives (
    parent_id TEXT NOT NULL,
    photo_id TEXT NOT NULL REFERENCES photos(id),
    ord INTEGER NOT NULL,
    PRIMARY KEY (parent_id, photo_id)
);
"""


def connect(db_path):
    conn = sqlite3.connect(str(db_path), isolation_level=None, timeout=5)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.executescript(SCHEMA)
    return conn
