"""選ぶ画面のサーバー（serve）のテスト。守り（計画書 K9）と操作。"""
import http.client
import json
import threading
import unittest

from tests.journey_tools.helpers import make_jpeg, tmpdir

from jr import server, store

T = 1456801200


class ServerTest(unittest.TestCase):
    def setUp(self):
        self.home = tmpdir()
        self.db = self.home / "s.db"
        conn = store.connect(self.db)
        for i in range(5):
            pid = f"{i + 1:016x}"
            path = make_jpeg(self.home / "in" / f"{pid}.jpg", size=(64, 48))
            conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,?,?,?)", (pid, pid * 4, pid, T + i * 86400, 43.2, 141.0))
            conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES (?,?,?, 'original')", (pid, pid * 4, str(path)))
            conn.execute("INSERT INTO regions(photo_id, region_id, status) VALUES (?, 'JP-01', 'resolved')", (pid,))
            conn.execute("INSERT INTO assessments(sha256, version, status, flags, landscape, person, blur, embedding) VALUES (?, 'v', 'ok', '[]', 0.8, 0.1, 99, NULL)", (pid * 4,))
        conn.execute("INSERT INTO review_groups(group_id, local_day) VALUES ('day-2016-03-01', '2016-03-01')")
        conn.close()
        self.url, self.httpd = server.serve(self.db, self.home, port=0, repo_root=self.home, open_browser=False)
        self.port = self.httpd.server_address[1]
        self.token = self.url.split("t=")[1]
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()

    def req(self, method, path, body=None, cookie=True, host=None, origin="self"):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        headers = {"Host": host or f"127.0.0.1:{self.port}"}
        if cookie:
            headers["Cookie"] = f"jr_t={self.token}"
        if origin == "self":
            headers["Origin"] = f"http://127.0.0.1:{self.port}"
        elif origin:
            headers["Origin"] = origin
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        c.request(method, path, body=data, headers=headers)
        r = c.getresponse()
        out = (r.status, dict(r.getheaders()), r.read())
        c.close()
        return out

    def selected(self):
        conn = store.connect(self.db)
        n = conn.execute("SELECT COUNT(*) FROM region_choices WHERE region_id = 'JP-01' AND selected = 1").fetchone()[0]
        conn.close()
        return n

    def test_server_binds_localhost(self):
        self.assertEqual(self.httpd.server_address[0], "127.0.0.1")

    def test_server_rejects_no_token(self):
        self.assertEqual(self.req("GET", "/api/regions", cookie=False)[0], 403)
        self.assertEqual(self.req("GET", "/", cookie=False)[0], 403)

    def test_server_bad_host(self):
        self.assertEqual(self.req("GET", "/api/regions", host=f"localhost:{self.port}")[0], 403)

    def test_server_token_moves_to_cookie(self):
        status, headers, _ = self.req("GET", f"/?t={self.token}", cookie=False)
        self.assertEqual(status, 303)
        self.assertEqual(headers["Location"], "/")
        cookie = headers["Set-Cookie"]
        self.assertIn("HttpOnly", cookie)
        self.assertIn("SameSite=Strict", cookie)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(headers["Referrer-Policy"], "no-referrer")

    def test_server_rejects_bad_origin(self):
        r = self.req("POST", "/api/decision", {"photo_id": "0000000000000001", "region_id": "JP-01", "selected": True}, origin="http://evil.example")
        self.assertEqual(r[0], 403)
        self.assertEqual(self.selected(), 0)

    def test_server_img_unknown_id(self):
        self.assertEqual(self.req("GET", "/img/../../etc/passwd")[0], 404)
        self.assertEqual(self.req("GET", "/img/ffffffffffffffff")[0], 404)
        status, headers, body = self.req("GET", "/img/0000000000000001")
        self.assertEqual(status, 200)
        self.assertEqual(headers["Content-Type"], "image/jpeg")

    def test_server_decision_roundtrip(self):
        self.assertEqual(self.req("POST", "/api/decision", {"photo_id": "0000000000000001", "region_id": "JP-01", "selected": True, "caption": "運河の夜"})[0], 200)
        status, _, body = self.req("GET", "/api/candidates?region=JP-01")
        items = {p["id"]: p for p in json.loads(body)["photos"]}
        self.assertTrue(items["0000000000000001"]["selected"])
        self.assertEqual(items["0000000000000001"]["caption"], "運河の夜")

    def test_server_fourth_select_refused(self):
        for i in (1, 2, 3):
            self.assertEqual(self.req("POST", "/api/decision", {"photo_id": f"{i:016x}", "region_id": "JP-01", "selected": True})[0], 200)
        self.assertEqual(self.req("POST", "/api/decision", {"photo_id": f"{4:016x}", "region_id": "JP-01", "selected": True})[0], 409)
        self.assertEqual(self.selected(), 3)

    def test_server_concurrent_fourth(self):
        for i in (1, 2):
            self.req("POST", "/api/decision", {"photo_id": f"{i:016x}", "region_id": "JP-01", "selected": True})
        threads = [threading.Thread(target=self.req, args=("POST", "/api/decision", {"photo_id": f"{i:016x}", "region_id": "JP-01", "selected": True}))
                   for i in (3, 4, 5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        self.assertEqual(self.selected(), 3)

    def test_server_rejects_long_caption(self):
        r = self.req("POST", "/api/decision", {"photo_id": "0000000000000001", "region_id": "JP-01", "caption": "あ" * 201})
        self.assertEqual(r[0], 400)

    def test_server_rejects_bad_region(self):
        r = self.req("POST", "/api/decision", {"photo_id": "0000000000000001", "region_id": "<script>", "selected": True})
        self.assertEqual(r[0], 400)

    def test_server_group_confirm(self):
        self.assertEqual(self.req("POST", "/api/group", {"group_id": "day-2016-03-01", "region_id": "JP-26"})[0], 200)
        conn = store.connect(self.db)
        self.assertEqual(conn.execute("SELECT status, region_id FROM review_groups").fetchone(), ("confirmed", "JP-26"))
        conn.close()
        self.assertEqual(self.req("POST", "/api/group", {"group_id": "day-2016-03-01", "region_id": None})[0], 200)
        conn = store.connect(self.db)
        self.assertEqual(conn.execute("SELECT status FROM review_groups").fetchone()[0], "not_trip")
        conn.close()

    def test_server_region_names(self):
        status, _, body = self.req("GET", "/api/region_names")
        names = {r["id"]: r["name"] for r in json.loads(body)["regions"]}
        self.assertEqual(status, 200)
        self.assertEqual(names["JP-26"], "京都")
        self.assertEqual(names["HK"], "香港")
        self.assertEqual(len([k for k in names if k.startswith("JP-")]), 47)

    def test_server_regions_list(self):
        status, _, body = self.req("GET", "/api/regions")
        self.assertEqual(status, 200)
        r = json.loads(body)["regions"]
        self.assertEqual(r[0]["id"], "JP-01")
        self.assertEqual(r[0]["name"], "北海道")
        self.assertEqual(r[0]["photos"], 5)


if __name__ == "__main__":
    unittest.main()
