# 旅の地図: 候補作りと選ぶ画面（計画 2） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Google Takeout の写真（約 44,000 枚）を Mac 上で地域ごとに分け、景色の候補を 1 地域 20 枚まで出し、作者がブラウザで 2〜3 枚を選ぶと、位置情報を消した縮小版と公開データが `website/the-first-flower/journey/` に書き出される道具を作る。

**Architecture:** Python のコマンド `tools/journey/jr.py`（サブコマンド ingest / geo / assess / suggest / serve / export / backup）。状態は SQLite 1 ファイル、縮小画像と特徴量はキャッシュに置き、どちらもリポジトリの外の `JOURNEY_HOME`（既定 `~/Pictures/nocta-journey/`）に置く。工程ごとに別のコマンドで動かし、途中から再開できる。選ぶ画面は `127.0.0.1` だけで動く小さなサーバーと素の HTML。

**Tech Stack:** Python 3.12（`uv` で `JOURNEY_HOME/venv` に作る）、Pillow + pillow-heif、numpy、shapely、timezonefinder、open_clip_torch（ViT-B-32 / laion2b_s34b_b79k・MPS）、標準ライブラリの sqlite3 / http.server / unittest。境界データは Natural Earth v5.1.1（パブリックドメイン）の admin-1 10m（日本の都道府県）と admin-0 50m（国）。

**Spec:** `docs/superpowers/specs/2026-10-18-tff-journey-map-design.md`（4-3〜4-7・5 章）。計画 1 `docs/superpowers/plans/2026-10-18-tff-journey-map-page.md` が作った公開データの形と `journey-core.js` の検証を使う。

## Global Constraints

- 入力は読むだけ: `~/Downloads/Takeout` と `~/Downloads/Takeout-2` のファイルを書き換え・移動・削除しない。
- 写真・状態・キャッシュ・境界データ・venv はリポジトリに入れない（`JOURNEY_HOME` の下）。git に入れるのはコードと合成テストデータと、`export` が書く公開ファイルだけ。
- 有料 API・外部送信なし。モデルと境界データの取得（初回のダウンロード）以外はオフラインで動く。
- 写真 ID はファイル内容の SHA-256 の先頭 16 桁（小文字 16 進）。同じ ID は 1 枚として扱う。
- 公開データは計画 1 の形（`schemaVersion: 1`・写真の項目は `src` `thumb` `w` `h` `taken` `caption` `alt` だけ）。書き出したら `node` で `journey-core.js` の `validateJourney` を通し、`ok:false` なら公開ファイルを変えない。
- 公開画像は大 = 長辺 1600px・小 = 長辺 480px・sRGB・JPEG 品質 82・メタデータなし・1 ファイル 1MB 未満。
- 緯度経度の欠損を 0 で埋めない。撮影年月はファイルの更新日時で代用しない。
- 自動で外した写真は消さず、理由つきで残して作者が戻せる。一度却下した写真は候補に出さない。
- 作者の手直し（地域・日ごとの地域・採否・ひとこと・地点）は自動の判定より常に優先し、再実行で消えない。
- 選ぶ画面: `127.0.0.1` だけで待ち受け、起動ごとのトークンを URL に付ける。書き換えの API は `Origin` が自分と一致しなければ拒む。写真は登録済みの ID でだけ返す。外部のスクリプトを読み込まない。
- git: `git add` は個別指定、`git add` と `git commit` は別々の Bash 呼び出し。push しない。ドキュメント・コメントに絵文字なし。

## 共通の決め事（Codex レビュー 2026-10-19 を反映。各 Task はこれに従う）

- **K1 公開の順番（途中で失敗しても壊れない）**: 公開画像のファイル名は内容から決まる ID なので、(1) 新しい画像を `img/` に足す → (2) `tff-journey-data.js` を同じフォルダの一時ファイルに書いて `os.replace` で一度に差し替える → (3) どこからも参照されなくなった画像を消す、の順にする。(1) か (2) で失敗しても前のデータと前の画像が残る。(3) の失敗は「公開は成功・掃除だけ失敗」として別に報告する。`home/export.lock` で同時に 2 つ走らないようにする。
- **K2 書き出し専用の厳しい検証**（`export.validate_export(data) -> list[str]`。`journey-core.js` の検証に加えて行う）: 最上位の項目が `schemaVersion` `regions` `photos` だけ / 公開する地域だけが入っている（写真 2〜3 枚。1 枚以下の地域をデータに入れない）/ `photos` のすべてがどこかの地域から参照されている / 同じ地域の `photoIds` に重複がない / 地点の親もデータに入っていて、親の写真は子の地点の採用写真から選ばれている。
- **K3 写真と実ファイル**: 写真 1 枚 = `photos` の 1 行で、ID は元ファイルの SHA-256 の先頭 16 桁（完全な SHA-256 も持ち、16 桁が別の写真とぶつかったら止める）。元と編集版は `photo_variants(photo_id, sha256 UNIQUE, path, role: original|edited)` に入れる。候補の判定・縮小・書き出しは「採用したときに見ていた版」の `sha256` を使い、`region_choices.variant_sha256` に固定する。あとで編集版が増えても、作者が選び直すまで公開する版は変わらない。
- **K4 採否の持ち方**: `photo_editorial(photo_id PK, caption, rejected 0|1)` = 写真ごと（ひとことは公開データと同じく写真に 1 つ。却下は全地域で出さない）。`region_choices(photo_id, region_id, selected 0|1, allow_excluded 0|1, variant_sha256, updated_at, PK(photo_id, region_id))` = 地域ごと。採用を外すのは `selected=0` にするだけで、ひとことや「戻した」印は残す。
- **K5 確認のまとまりと時刻**: 撮影場所のない写真は「確認グループ」（`review_groups(group_id PK, local_day, status: open|confirmed|not_trip)`・`review_group_members(group_id, photo_id)`）にまとめる。地域の候補は複数持てる（`region_suggestions(group_id, region_id, source: day|album, votes)`）。同数や `白神山地` のような候補 2 つは自動で決めず、作者が選ぶ。確認したグループのメンバーは再実行で組み替えない。現地時刻は、撮影場所があれば `timezonefinder`（オフライン）でタイムゾーンを求めて `zoneinfo` で直す。なければ `Asia/Tokyo` として、その由来を記録する。現地日と撮影年月はこの共通関数 `jr.timeutil.local(taken_utc, lat, lng) -> (datetime, tz_source)` だけで出す。
- **K6 縮小画像と判定を分ける**: 縮小画像（`home/cache/<sha256>.jpg`・長辺 512px）は確認グループの代表にも要るので、`jr.py previews` で判定とは別に作る。グループを確認したら、その写真を判定の待ち行列に入れ、画面の「候補を作り直す」ボタンでその分だけ判定する（裏で 1 本のスレッド）。
- **K7 SQLite**: サーバーは接続ではなく DB のパスを受け取り、リクエストごとに接続する（`isolation_level=None, timeout=5`、`PRAGMA foreign_keys=ON`、WAL）。「3 枚まで」の数え直しと保存は 1 つの `BEGIN IMMEDIATE` の中で行う。書き出しは短い読み取りで中身を固めてから画像を作る。SQL は必ずプレースホルダで渡す。
- **K8 入力の種類と来歴**: 入力フォルダごとに `takeout` か `photos_app` を決める（`JOURNEY_ROOTS` の各要素に `takeout:` / `photos_app:` を前に付ける。付けなければ takeout）。takeout で情報ファイルが壊れている・曖昧なものは EXIF で黙って代わりにせず保留にする。photos_app は EXIF の `DateTimeOriginal` と GPS を使い、日時がなければ保留。全ファイル（動画と保留も）を `source_files(path PK, root, kind, sha256, sidecar_path, role, taken_utc NULL, status)` に記録し、バックアップはこの台帳だけを使う。
- **K9 選ぶ画面の守り**: `Host` が `127.0.0.1:<port>` と一致しなければ 403。最初の URL のトークンは確かめたあと `HttpOnly; SameSite=Strict; Path=/` の Cookie に移し、トークンなしの URL に転送する。全レスポンスに `Cache-Control: no-store` と `Referrer-Policy: no-referrer`。アクセスログにトークンを出さない。POST の本文は JSON だけで 64KB まで、ひとことは 200 字まで、地点名は 40 字まで、地域 ID は計画 1 と同じ形、座標は有限、半径は 0.1〜50km。画面に文字を入れるときは `textContent` と `value` だけを使う。
- **K10 判定の再現と再開**: モデル名・重み・すべての文・前処理を 1 つの `ASSESS_VERSION` 文字列にまとめる（文は Task 3 に全部書く）。32 枚ずつ処理し、1 枚ごとに成功か失敗を記録する。壊れた画像 1 枚で止めない。キャッシュのファイルが消えていたら作り直す。日ごとの確認・除外の一覧の API は 1 ページ 30 件。
- **K11 地域判定の決まり**: `inside = 含む地域`。ちょうど 1 つで、ほかの地域の境界から 0.5km 以上離れていれば resolved。ちょうど 1 つでも 0.5km 未満なら、その地域と近い地域を候補に持って needs_review。2 つ以上（境界線上）も needs_review。どこにも含まれず 3km 以内に地域があれば、近い順に候補を持って needs_review（同じ距離でも先頭を自動で採らない）。それ以外は unknown。
- **K12 テストの読み込み**: テストは冒頭で `sys.path.insert(0, str(REPO / "tools" / "journey"))` をしてから `import jr` する。実行コマンドは `$VENV/bin/python -m unittest discover -s tests/journey_tools -t . -v`（`VENV=$JOURNEY_HOME/venv`）。

## Review Focus

1. 位置情報つきの写真（EXIF GPS・XMP）を採用して書き出す → 大小どちらの画像にも位置情報が残らない（Task 5 `test_export_strips_gps`）。
2. `IMG_1234(1).jpg` や `-編集済み.jpg`、名前が途中で切れた情報ファイル → 正しい情報ファイルに結びつく。結びつかないものは保留に入り件数が出る（Task 1 `test_match_*`）。
3. 候補を作り直す（`assess` の再実行・写真の追加） → 採用・却下・ひとこと・手直しが残る（Task 3 `test_rerun_keeps_decisions`）。
4. 選ぶ画面にトークンなし・別の Origin・任意パスで来る → 403 / 404 で、写真の中身を返さない（Task 6 `test_server_*`）。
5. 書き出しの途中で失敗する（検証 NG・1MB 超） → 前回の公開ファイルがそのまま残る（Task 5 `test_export_keeps_previous_on_failure`）。

---

### Task 1: 取り込み（ingest）

**Files:**
- Create: `tools/journey/jr.py`（引数の解釈と各サブコマンドの呼び出しだけ）
- Create: `tools/journey/jr/__init__.py`、`tools/journey/jr/config.py`、`tools/journey/jr/store.py`、`tools/journey/jr/ingest.py`
- Create: `tools/journey/requirements.txt`、`tools/journey/README.md`（環境づくりと実行順）
- Test: `tests/journey_tools/test_ingest.py`（合成の Takeout フォルダをテスト内で作る）

**Interfaces:**
- `config.load() -> Config`（`home: Path`、`roots: list[Path]`。環境変数 `JOURNEY_HOME` と `JOURNEY_ROOTS`（`:` 区切り）で上書き）
- `store.connect(db_path) -> sqlite3.Connection`（K7 の設定で開き、なければ表を作る。表: `photos(id PK, sha256 UNIQUE, taken_utc INT, tz TEXT, tz_source, lat REAL NULL, lng REAL NULL, people INT, width, height)`、`photo_variants`（K3）、`source_files`（K8）、`photo_albums(photo_id, album)`、`regions(photo_id PK, region_id NULL, status, candidates JSON)`、`overrides(photo_id PK, region_id)`、`review_groups` `review_group_members` `region_suggestions`（K5）、`places(id PK, parent_id, name, lat, lng, radius_km)`、`place_members(photo_id, place_id)`（撮影場所のない写真を作者が地点に入れたとき。半径の判定より優先）、`assessments(sha256 PK, version, status: ok|failed, error, flags JSON, landscape REAL, person REAL, blur REAL, embedding BLOB)`、`photo_editorial` `region_choices`（K4）、`representatives(parent_id, photo_id, ord)`）
- `ingest.match_sidecar(media_name: str, json_names: list[str]) -> list[str]`
- `ingest.run(conn, roots: list[tuple[kind, Path]]) -> IngestReport`（`added`, `duplicates`, `pending`, `videos`）

- [ ] **Step 1: Write the failing tests**
  - `test_match_plain`: `IMG_1.jpg` → `["IMG_1.jpg.supplemental-metadata.json"]`
  - `test_match_numbered`: `IMG_1(1).jpg` → `["IMG_1.jpg.supplemental-metadata(1).json"]`
  - `test_match_edited`: `IMG_1-編集済み.jpg` → 元の `IMG_1.jpg.supplemental-metadata.json`
  - `test_match_truncated`: 情報ファイル名が途中で切れている（`<長い名前>.jpg.supplemental-me.json` など、`.json` を除いた名前が `<メディア名>.supplemental-metadata` の先頭と一致）→ そのファイル
  - `test_match_ambiguous`: 候補が 2 つ → 2 つ返す（呼び出し側が保留にする）
  - `test_ingest_dedupes`: 同じ中身が年フォルダとアルバムに 1 枚ずつ → `photos` 1 行、`photo_albums` にアルバム名 1 行（年フォルダ `NNNN 年の写真` と数字だけのフォルダはアルバムとして記録しない）
  - `test_ingest_edited_variant`: 元と `-編集済み` がある → `photos` 1 行、`photo_variants` に original と edited の 2 行、メタデータは元の情報ファイル。編集版だけが先に取り込まれても、あとから元が来たら同じ写真にまとまる
  - `test_ingest_no_geo_is_null`: `geoData` が 0,0 で `geoDataExif` もない → `lat` `lng` が NULL
  - `test_ingest_people_flag`: `people` が空でない → `people = 1`
  - `test_ingest_pending`: 情報ファイルなし・壊れた JSON・候補 2 つ → `pending` に理由つきで入り、`photos` に入らない
  - `test_ingest_rerun_idempotent`: 2 回走らせても行数が変わらない
  - `test_ingest_photos_app_exif`: photos_app の入力で、EXIF に GPS と DateTimeOriginal がある JPEG → `photos` に入り、緯度経度と日時が入る。日時なし → 保留
  - `test_ingest_takeout_bad_json_not_exif`: takeout で JSON が壊れている → EXIF に GPS があっても保留
  - `test_ingest_source_files`: 動画・保留を含む全ファイルが `source_files` に入る
  - `test_ingest_short_id_collision`: 先頭 16 桁が同じで中身が違う 2 ファイル（テストでハッシュ関数を差し替える）→ 止まって理由が出る
- [ ] **Step 2: Run** `JOURNEY_HOME=$(mktemp -d) $VENV/bin/python -m unittest discover -s tests/journey_tools -t . -v`（K12。以降の Task の Run も同じコマンド）→ Expected: FAIL（`jr` がない）
- [ ] **Step 3: Implement** `store.py` と `ingest.py`。動画（mp4 / mov / avi / 3gp / m4v）は数えて飛ばす。HEIC は pillow-heif で幅と高さを読む。撮影日時は `photoTakenTime.timestamp`（UTC 秒）。
- [ ] **Step 4: Run** 同上 → Expected: PASS
- [ ] **Step 5: 実データで走らせる**: `$VENV/bin/python tools/journey/jr.py ingest` → 件数を表示。Expected: 写真の行数が 44,230 前後、保留の件数と理由別の内訳が出る。結果の数字を ledger に記録する。
- [ ] **Step 6: Commit**（`tools/journey/` の新しいファイルと `tests/journey_tools/test_ingest.py` を個別に add → 別呼び出しで commit `feat(journey-tools): Takeout の取り込みを追加`）

### Task 2: 地域の判定（geo）と日ごとの推定（suggest）

**Files:**
- Create: `tools/journey/jr/geo.py`、`tools/journey/jr/suggest.py`、`tools/journey/jr/regions.py`（地域 ID・名前・アルバム名の対応表）
- Test: `tests/journey_tools/test_geo.py`、`tests/journey_tools/test_suggest.py`

**Interfaces:**
- `geo.Boundaries.load(home) -> Boundaries`（初回は Natural Earth v5.1.1 の 2 ファイルを `home/geo/` に取得。admin-1 は `iso_a2 == "JP"` だけ、`iso_3166_2` を地域 ID に使う。admin-0 は `ISO_A2`（`-99` のときは `ISO_A2_EH`）。日本の点は都道府県で判定し、国は使わない）
- `geo.assign(b: Boundaries, lat: float | None, lng: float | None) -> RegionResult`（`status: resolved | needs_review | unknown`、`region_id: str | None`（resolved のときだけ）、`candidates: list[str]`（needs_review のとき、近い順））。決まりは K11。
- `geo.run(conn, b) -> dict`（`overrides` がある写真はその地域を resolved として書く）
- `suggest.run(conn) -> dict`: 撮影場所のない写真を、現地日（K5 の共通関数）ごとの確認グループにまとめる。同じ現地日の resolved の写真の地域を票として `region_suggestions(source=day, votes)` に入れ、アルバム名が `regions.ALBUM_HINTS` にあれば `source=album` も入れる（候補は複数持てる）。`confirmed` / `not_trip` のグループには触れない。
- `regions.ALBUM_HINTS`: `屋久島→JP-46`、`白神山地→[JP-02, JP-05]`（候補 2 つ。作者が選ぶ）、`NewYork / L.A. / Las Vegas / ラスベガスへの旅行→US`、`香港 マカオ→[HK, MO]`、`オーストラリア→AU`、`シンガポール→SG`、`CANADA→CA`、`bari→ID`、`koria→KR`
- `regions.name(region_id) -> str`（都道府県は計画 1 の `journey-map.js` と同じ名前。国は日本語名の表を持ち、計画 1 の `COUNTRY_NAMES` にない国はここで足す）

- [ ] **Step 1: Write the failing tests**（境界は小さな合成ポリゴンを `Boundaries` に直接渡す）
  - `test_assign_inside`: 正方形の中心 → resolved
  - `test_assign_near_border`: 2 つの正方形の境界から 0.2km 内側 → needs_review、candidates に両方
  - `test_assign_on_border`: 境界線の上 → needs_review
  - `test_assign_equidistant`: 2 つの地域から同じ距離の海上 → needs_review、region_id は None
  - `test_assign_sea_near`: 外側 1km → needs_review、region_id は近い方
  - `test_assign_none`: `None, None` → unknown
  - `test_override_wins`: `overrides` がある写真は自動の結果より優先
  - `test_suggest_votes_day`: 同じ現地日に A が 3 枚・B が 1 枚 → グループの候補が A（votes 3）と B（votes 1）
  - `test_local_day_overseas`: ニューヨークで UTC 2016-03-02 03:00 → 現地日 2016-03-01、tz_source が `geo`
  - `test_suggest_album_hint`: 撮影場所なしで、アルバム `屋久島` → JP-46（album）
  - `test_suggest_keeps_confirmed`: confirmed のグループは再実行でもメンバーと地域が変わらない
  - `test_suggest_two_album_candidates`: アルバム `白神山地` → 候補が JP-02 と JP-05 の 2 つ
  - `test_real_points`（境界データがあるときだけ走らせる。ないときは skip）: 小樽運河（43.1997, 140.9947）→ JP-01、嵐山（35.0094, 135.6668）→ JP-26、香港（22.2830, 114.1588）→ HK
- [ ] **Step 2: Run** → Expected: FAIL
- [ ] **Step 3: Implement**（shapely の `STRtree` で探す。距離は緯度経度を局所的に km に直して測る）
- [ ] **Step 4: Run** → Expected: PASS（境界データ取得後は `test_real_points` も PASS）
- [ ] **Step 5: 実データで走らせる**: `jr.py geo && jr.py suggest` → 地域ごとの枚数の上位 15 と、resolved / needs_review / unknown の件数、日ごとの推定（suggested / album）の日数を ledger に記録する。
- [ ] **Step 6: Commit**（`feat(journey-tools): 地域の判定と日ごとの推定を追加`）

### Task 3: 候補作り（assess）

**Files:**
- Create: `tools/journey/jr/assess.py`、`tools/journey/jr/candidates.py`
- Test: `tests/journey_tools/test_candidates.py`

**Interfaces:**
- `assess.Scorer`（`score(images: list[PIL.Image]) -> list[{"landscape": float, "person": float, "embedding": np.ndarray}]`）。本番は open_clip ViT-B-32 / laion2b_s34b_b79k のゼロショット。文は次の 9 つで固定する: 景色 = "a scenic landscape photo" / "a photo of a city street" / "a photo of the sea and sky" / "a photo of a temple or shrine"、人 = "a photo of a person" / "a group photo of people"、ほか = "a photo of food" / "a screenshot" / "a photo of a document"。9 文の softmax のうち、景色 4 文の合計を `landscape`、人 2 文の合計を `person` とする。テストでは偽の Scorer を渡す。
- `assess.run(conn, home, scorer, version: str, photo_ids=None) -> dict`: K6 の縮小画像を使って（なければ作る）、`blur`（ラプラシアンの分散）と `flags`（`people_tag` / `person` / `blurry` / `dark` / `not_landscape`）を `assessments` に書く。K10 のとおり 32 枚ずつ・1 枚ごとに成否を記録し、同じ `version` で `ok` のものは飛ばす。
- `previews.run(conn, home, photo_ids) -> dict`（K6。`jr.py previews` から呼ぶ）
- `candidates.for_region(conn, region_id, limit=20) -> list[str]`: 対象は、その地域に属する写真（resolved・`overrides`・confirmed のグループの写真。地点なら半径内か `place_members`）のうち、`photo_editorial.rejected = 0` のもの。`people_tag` か `person > 0.5` か `blurry` は除外（`allow_excluded = 1` なら戻す）。`dark` は除外しない（夜景を落とさない）。`landscape` の高い順に、既に取った写真と埋め込みのコサイン類似度 0.93 以上のものと、同じ日から 5 枚目以降を飛ばして 20 枚まで。`selected` の写真は必ず含める。
- `candidates.excluded(conn, region_id) -> list[(photo_id, flags)]`

- [ ] **Step 1: Write the failing tests**（偽の Scorer と合成の DB 行で）
  - `test_people_excluded` / `test_allow_excluded_comes_back` / `test_dark_kept`
  - `test_assess_bad_image_continues`: 壊れた画像 1 枚を混ぜる → その 1 枚が `failed`、ほかは `ok`
  - `test_assess_missing_cache_rebuilt`: キャッシュのファイルを消して再実行 → 作り直される
  - `test_near_duplicates_dropped`: 埋め込みがほぼ同じ 5 枚 → 1 枚だけ
  - `test_day_cap`: 同じ日の 10 枚 → 4 枚まで
  - `test_rejected_never_again` / `test_selected_always_included`
  - `test_rerun_keeps_decisions`: `photo_editorial` `region_choices` `overrides` を入れてから `assess.run` を `version` を変えて再実行 → その 3 つの表の行がそのまま
  - `test_unselect_keeps_caption`: 採用を外す → `selected=0`、ひとことは残る
- [ ] **Step 2: Run** → Expected: FAIL
- [ ] **Step 3: Implement**
- [ ] **Step 4: Run** → Expected: PASS
- [ ] **Step 5: 実データで走らせる**: `jr.py assess`（撮影場所あり・推定あり・アルバムの写真だけ。かかった時間を記録）→ 北海道・京都など上位 3 地域の候補 20 枚を縮小画像の一覧（`home/review/<region>.jpg`）にして CEO に見せ、閾値（0.5・0.93・4 枚）が妥当かを聞く。値を変えたら ledger に記録する。
- [ ] **Step 6: Commit**（`feat(journey-tools): 景色の候補作りを追加`）

### Task 4: 地点の提案（places）

**Files:**
- Create: `tools/journey/jr/places.py`
- Test: `tests/journey_tools/test_places.py`

**Interfaces:**
- `places.propose(conn, min_photos=150, cell_km=5.0) -> list[Proposal]`（地域ごとに、撮影場所のある写真を 5km 四方のマス目で数え、150 枚以上のマスを隣どうしでまとめて提案。中心の緯度経度・半径・枚数を持つ。名前は付けない）
- `places.create(conn, parent_id, name, lat, lng, radius_km) -> str`（ID は `place-<ローマ字か英小文字>`。作者が入力した名前から作れないときは `place-<親の番号>-<連番>`）

- [ ] **Step 1: Write the failing tests**: `test_propose_dense_cell`（200 枚が 1 マス → 提案 1 件）、`test_propose_sparse`（各マス 10 枚 → 0 件）、`test_create_id`（`小樽` → `place-01-1` のように重複しない ID）
- [ ] **Step 2〜4**: FAIL → 実装 → PASS
- [ ] **Step 5: Commit**（`feat(journey-tools): 地点の提案を追加`）

### Task 5: 書き出し（export）

（Task 6 の画面が「公開する」ボタンでこれを呼ぶので先に作る）

**Files:**
- Create: `tools/journey/jr/export.py`
- Test: `tests/journey_tools/test_export.py`

**Interfaces:**
- `export.run(conn, repo_root: Path) -> ExportReport`。公開する地域 = `selected` が 2〜3 枚の地域・地点。地点のある親は `representatives` の 2〜3 枚。
  1. 一時フォルダ（`home/staging/`）に、採用写真ごとに大小 2 枚を作る（`ImageOps.exif_transpose` で回転を画素に適用 → sRGB に変換 → `exif` も `icc_profile` も渡さずに保存）
  2. 書き出した全画像を読み直し、EXIF・XMP・IPTC・ICC が空で、1MB 未満であることを確かめる
  3. 公開データを `json.dumps(ensure_ascii=False, allow_nan=False)` で作り、`node -e` で `journey-core.js` の `validateJourney` に通す
  4. 書き出す画像の一覧と公開データの写真がちょうど一致することを確かめる
  5. 全部通ったら K1 の順番で公開する（採用を外した写真の画像は最後の掃除で消える）。1〜4 で失敗したら公開側には触れず、理由を返す
  - 3 の前に K2 の `validate_export` も通す。画像は `region_choices.variant_sha256` の版から作る（K3）。小さい元画像は拡大しない
- `alt` は `"<地域名>の景色"`。`caption` は `photo_editorial` のひとこと（空なら null）。`taken` は K5 の共通関数による現地の年月。

- [ ] **Step 1: Write the failing tests**（Pillow で GPS と XMP を入れた合成 JPEG を作る）
  - `test_export_strips_metadata`: 入力に GPS・XMP・IPTC・ICC が入っていることを先に確かめてから書き出す → 大小とも `getexif()` が空、`info` に `xmp` / `icc_profile` がなく、`IptcImagePlugin.getiptcinfo()` が None
  - `test_export_rotation_applied`: 保存画素が横 120 × 縦 80 で四隅の色が違う画像に Orientation=6 → 書き出した画像は縦長で、左上の色が回転後の位置にある
  - `test_export_no_upscale`: 長辺 300px の元画像 → 大の長辺は 300 のまま
  - `test_export_size_limit`: 書き出した画像がすべて 1MB 未満、長辺 1600 / 480
  - `test_export_publishes_only_2_to_3`: 1 枚の地域は出ない（データにも入らない）
  - `test_validate_export_rejects`: 最上位に余分な項目 / 参照されない写真 / `photoIds` の重複 / 親のない地点 → それぞれ理由が返る
  - `test_export_failure_at_data_write`: データの差し替えで失敗させる → 前のデータと前の画像がそのまま（足した画像は残ってよい）
  - `test_export_lock`: ロックがあるとき → すぐに失敗して理由が出る
  - `test_export_uses_selected_variant`: 採用後に編集版が増えても、書き出す画像は採用時の版
  - `test_export_removes_unselected`: 前回あった画像のうち、今回選ばれていないものが消える
  - `test_export_keeps_previous_on_failure`: 検証を差し替える引数 `export.run(conn, repo_root, validate=lambda data: (False, ["x"]))` で失敗させる → 前回の画像とデータがそのまま
  - `test_export_caption_is_json_string`: ひとこと `</script><b>"` → データファイルに JSON 文字列として入り、`node` の検証が通る
- [ ] **Step 2〜4**: FAIL → 実装 → PASS
- [ ] **Step 5: Commit**（`feat(journey-tools): 位置情報を消した書き出しを追加`）

### Task 6: 選ぶ画面（serve）

**Files:**
- Create: `tools/journey/jr/server.py`、`tools/journey/ui/index.html`、`tools/journey/ui/app.js`、`tools/journey/ui/app.css`
- Test: `tests/journey_tools/test_server.py`（サーバーを別スレッドで立てて `urllib` で叩く）

**Interfaces:**
- `server.serve(db_path, home, port=0) -> (url_with_token, httpd)`（`127.0.0.1` 固定。起動時に `http://127.0.0.1:<port>/?t=<token>` を表示してブラウザで開く。守りは K9、DB は K7）
- API（すべてトークン必須。POST は `Origin` 一致も必須）:
  - `GET /api/regions` → 地域ごとの写真数・候補数・採用数・公開できるか
  - `GET /api/candidates?region=<id>` → 候補 20 枚（ID・撮影日・採用状態・ひとこと）
  - `GET /api/excluded?region=<id>` → 除外された写真と理由
  - `GET /api/groups?status=open|confirmed|not_trip&has_suggestion=1|0&page=N` → 確認グループの代表 6 枚と地域の候補（30 件ずつ）
  - `GET /api/review?page=N` → 地域判定が needs_review の写真と候補（30 件ずつ）
  - `GET /api/places/proposals` → Task 4 の提案
  - `GET /img/<photo_id>` → その写真の表示中の版の縮小画像だけ（登録済みの ID 以外は 404）
  - `POST /api/decision`（`photo_id, region_id, state, caption`）、`POST /api/group`（`group_id, region_id | null` → confirmed か not_trip）、`POST /api/reassess`（確認した写真の判定を裏で走らせる。進み具合は `GET /api/reassess`）、`POST /api/override`（`photo_id, region_id`）、`POST /api/place`（`parent_id, name, lat, lng, radius_km`）、`POST /api/representatives`（`parent_id, photo_ids`）、`POST /api/export` → Task 5 を呼んで結果を返す
- 画面（素の HTML・外部読み込みなし）: 左に地域の一覧（採用 0〜3 枚の数つき）、右に候補 20 枚のグリッド。押すと採用、もう一度押すと外す、×で却下。採用した写真にひとことの入力欄。上のタブで「日ごとの確認」（推定のあるグループから 1 つずつ、6 枚を見て「この地域 / 違う地域を選ぶ / 旅ではない」）、「場所の要確認」（needs_review の写真に地域を付ける）、「除外した写真」（戻す）、「地点」（提案に名前を付けて作る・親の代表 2〜3 枚を地点の採用写真から選ぶ）。右上に「公開データを書き出す」。
- 採用が 3 枚に達したら、その地域ではそれ以上採用できない（ボタンを無効にして理由を出す）。

- [ ] **Step 1: Write the failing tests**
  - `test_server_rejects_no_token`: トークンなし → 403
  - `test_server_rejects_bad_origin`: POST で `Origin: http://evil.example` → 403、DB は変わらない
  - `test_server_img_unknown_id`: `/img/../../etc/passwd` と未登録の ID → 404
  - `test_server_decision_roundtrip`: 採用 → `/api/candidates` で selected
  - `test_server_fourth_select_refused`: 4 枚目の採用 → 409
  - `test_server_group_confirm`: `/api/group` → グループが confirmed、メンバーの写真がその地域の対象になる
  - `test_server_bad_host`: `Host: localhost:<port>` → 403
  - `test_server_token_moves_to_cookie`: `/?t=<token>` → 303 でトークンなしの URL へ、Cookie が `HttpOnly` と `SameSite=Strict`
  - `test_server_rejects_long_caption`: 201 字 → 400
  - `test_server_concurrent_fourth`: 2 枚採用済みの地域に 2 つのスレッドから同時に採用 → 採用は 3 枚で止まる
  - `test_server_binds_localhost`: `httpd.server_address[0] == "127.0.0.1"`
- [ ] **Step 2〜4**: FAIL → 実装 → PASS
- [ ] **Step 5: 画面を目で確かめる**: 実データで `jr.py serve` を立て、Playwright でスクリーンショット（地域一覧＋候補・日ごとの確認）を撮って CEO に見せる。
- [ ] **Step 6: Commit**（`feat(journey-tools): 写真を選ぶ画面を追加`）

### Task 7: バックアップ用の整理（backup・優先度低）

**Files:**
- Create: `tools/journey/jr/backup.py`
- Test: `tests/journey_tools/test_backup.py`

**Interfaces:**
- `backup.run(conn, dest: Path) -> dict`（既定 `dest = home/library`）。`source_files` の台帳（K8）だけを使い、`photos` の 1 行ごとに `dest/<YYYY>/<YYYY-MM>/<YYYY-MM-DD>_<元のファイル名>` を**ハードリンク**で作る（容量を使わない。編集版があれば両方）。同じ名前が衝突したら `_<ID の先頭 6 桁>` を足す。動画も入れる（Task 1 で数えて飛ばしたものを、ここでは元のパスのまま年月フォルダへ）。各写真の横に Takeout の情報ファイルを `<同じ名前>.json` として置き、`dest/manifest.csv` に元のパス（重複していた全部）と置き先を書く。日時の分からないものは `dest/_未整理/` へ。保留の写真は `dest/_未整理/` に元のフォルダ構成で置く。最後に `dest/README.txt`（枚数・作った日・このフォルダを丸ごと HDD にコピーすればよいこと）を書く。
- 入力側のファイルは変えない（ハードリンクは別名を足すだけ）。`dest` が入力と別のボリュームならハードリンクできないので、その場合は止めて理由を出す。

- [ ] **Step 1: Write the failing tests**: `test_backup_one_file_per_photo`（重複 2 か所 → 1 つ）、`test_backup_hardlink`（`os.stat(...).st_ino` が元と同じ）、`test_backup_name_collision`、`test_backup_keeps_sidecar`、`test_backup_pending_folder`
- [ ] **Step 2〜4**: FAIL → 実装 → PASS
- [ ] **Step 5: 実データで走らせる** → `home/library` のファイル数と、`du -sh` の見かけの容量を CEO に伝える（「このフォルダを HDD にコピーすれば OK」）。
- [ ] **Step 6: Commit**（`feat(journey-tools): バックアップ用の整理を追加`）

### Task 8: 設計メモ・引き継ぎ

- Modify: `tools/journey/README.md`（実行順: ingest → geo → suggest → assess → serve。写真を足したときの回し方。テストの走らせ方）
- Modify: `website/the-first-flower/DESIGN-NOTES.md`（journey 小節に「公開データは `tools/journey` の export が書く」）
- Modify: `handoff.md`（1 行）
- [ ] **Step 1〜2**: 追記 → commit（`docs(journey-tools): 使い方と引き継ぎを追加`）

---

## 本計画でやらないこと

- TFF の Profile 節からのリンク（CEO が最初の地域を選び終え、書き出した結果を見て OK を出してから付ける）
- 動画の公開
