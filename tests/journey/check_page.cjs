/**
 * 旅の地図ページのブラウザ check（Playwright + ヘッドレス Chromium）。
 * 実行（website/ で python3 -m http.server を起動しておく）:
 *   NODE_PATH=<playwright の node_modules> CHROMIUM_PATH=<chromium> JR_BASE=http://localhost:8766 node tests/journey/check_page.cjs
 * 公開データは fixture（tests/journey/fixtures/journey-sample.js）に差し替え、画像は 1x1 の JPEG を返す。
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = (process.env.JR_BASE || "http://localhost:8766") + "/the-first-flower/journey/index.html";
const FIXTURE = fs.readFileSync(path.join(__dirname, "fixtures", "journey-sample.js"), "utf8");
const EMPTY = "const TFF_JOURNEY = { schemaVersion: 1, regions: [], photos: {} };";
const BROKEN_ID = "a000000000000001"; // 小樽の 1 枚目。img-error でだけ 404 にする
const JPEG = Buffer.from(
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
    "base64"
);

const results = [];
function check(name, ok, detail) {
    results.push({ name, ok: !!ok });
    console.log((ok ? "ok   " : "FAIL ") + name + (ok || detail === undefined ? "" : "  (" + detail + ")"));
}

async function openPage(browser, opts) {
    opts = opts || {};
    const page = await browser.newPage({ viewport: { width: opts.width || 1280, height: 900 }, isMobile: !!opts.mobile });
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
    await page.route("**/tff-journey-data.js*", (r) =>
        r.fulfill({ contentType: "application/javascript", body: opts.empty ? EMPTY : FIXTURE }));
    await page.route("**/journey/img/**", (r) => {
        const broken = opts.brokenImage && r.request().url().includes(BROKEN_ID);
        if (broken) return r.fulfill({ status: 404, body: "" });
        if (opts.slowId && r.request().url().includes(opts.slowId))
            return new Promise((res) => setTimeout(() => res(r.fulfill({ contentType: "image/jpeg", body: JPEG })), 600));
        return r.fulfill({ contentType: "image/jpeg", body: JPEG });
    });
    await page.goto(BASE, { waitUntil: "networkidle" });
    return { page, errors };
}

const text = (page, sel) => page.$eval(sel, (el) => el.textContent.trim());

const WAIT = 2600; // 寄る 0.7s + 形に変わる 0.7s + 花 0.6s のあと
const visibleTiles = (page) => page.$$eval("#mapT .tile", (gs) =>
    gs.filter((g) => { const c = getComputedStyle(g); return c.display !== "none" && c.visibility !== "hidden" && +c.opacity > 0.05; }).length);
const chips = (page) => page.$$eval("#panel .chips button", (bs) => bs.map((b) => b.textContent.trim()));

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    const allErrors = [];
    try {
        let { page, errors } = await openPage(browser);
        allErrors.push(...errors);

        check("tiles", (await page.$$("#mapT .tile")).length === 48 && (await page.$$("#mapT .tile.yes")).length === 3,
            (await page.$$("#mapT .tile")).length + " / " + (await page.$$("#mapT .tile.yes")).length);
        check("all-panel", (await text(page, "#panel h2")) === "歩いた日本" && (await page.$$("#panel .sw")).length > 0);

        // 地方を押すと寄って、周りの地方のタイルは消える（県が 1 つなら詳細まで進む）
        await page.click('.rb[data-k="chubu"]');
        await page.waitForTimeout(WAIT);
        check("zoom-region", (await text(page, "#panel h2")) === "長野" && (await visibleTiles(page)) === 0,
            (await text(page, "#panel h2")) + " / tiles " + (await visibleTiles(page)));

        await page.click('.rb[data-k="hokkaido"]');
        await page.waitForTimeout(WAIT);
        const c1 = await chips(page);
        check("pref-detail", (await text(page, "#panel h2")) === "北海道" && c1.join("|") === "代表 3 枚|小樽 2 枚|美瑛 1 枚" &&
            (await text(page, "#panel .pcount")) === "1 / 3", c1.join("|"));

        await page.click("#panel .chips button:nth-child(2)");
        await page.click("#panel .thumbs button:nth-child(2)");
        const mainSrc = await page.$eval("#panel .pbox img", (i) => i.getAttribute("src"));
        check("place-and-thumb", mainSrc === "img/a000000000000002.jpg" && (await text(page, "#panel .pcount")) === "2 / 2", mainSrc);
        check("caption-is-text",
            (await text(page, "#panel .cap")) === '<b>"夜"</b>' && (await page.$$("#panel .cap b")).length === 0);

        // 全国へ戻るとタイルが戻る
        await page.click('.rb[data-k="all"]');
        await page.waitForTimeout(WAIT);
        check("back-to-all", (await visibleTiles(page)) === 48 && (await text(page, "#panel h2")) === "歩いた日本",
            "tiles " + (await visibleTiles(page)));

        await page.click("#bWd");
        await page.waitForTimeout(WAIT);
        const worldRb = await page.$$eval(".rb", (bs) => bs.map((b) => b.dataset.k));
        await page.click('.rb[data-k="asia"]');
        await page.waitForTimeout(WAIT);
        check("world", worldRb.includes("asia") && (await text(page, "#panel h2")) === "香港" && (await text(page, "#nWd")) === "1",
            worldRb.join(",") + " / " + (await text(page, "#panel h2")));

        // キーボードで地方ボタンを押せる
        await page.click("#bJp");
        await page.waitForTimeout(WAIT);
        await page.focus('.rb[data-k="kinki"]');
        await page.keyboard.press("Enter");
        await page.waitForTimeout(WAIT);
        check("keyboard", (await text(page, "#panel h2")) === "京都", await text(page, "#panel h2"));

        // 撮影日・日付らしい文字を出さない
        const body = await page.$eval("body", (b) => b.innerText);
        check("no-dates", !/\d{4}\s*[年./-]\s*\d{1,2}/.test(body) && !/\d{1,2}\s*月\s*\d{1,2}\s*日/.test(body));
        await page.close();

        ({ page, errors } = await openPage(browser, { brokenImage: true }));
        await page.click('.rb[data-k="hokkaido"]');
        await page.waitForTimeout(WAIT);
        await page.click("#panel .chips button:nth-child(2)");
        await page.waitForTimeout(300);
        check("img-error", (await text(page, "#panel h2")) === "北海道" &&
            errors.filter((e) => e.startsWith("pageerror")).length === 0, errors.join(" | "));
        await page.close();

        ({ page, errors } = await openPage(browser, { empty: true }));
        check("empty-data", (await text(page, "#empty")) === "旅の写真は準備中です。" && errors.length === 0, errors.join(" | "));
        await page.close();

        ({ page, errors } = await openPage(browser, { width: 390, mobile: true }));
        allErrors.push(...errors);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        await page.click('.rb[data-k="hokkaido"]');
        await page.waitForTimeout(WAIT);
        const sw2 = await page.evaluate(() => document.documentElement.scrollWidth);
        const top = await page.$eval("#panel", (el) => el.getBoundingClientRect().top + window.scrollY);
        check("mobile-390", sw <= 390 && sw2 <= 390 && top < 900 * 1.5, "scrollWidth " + sw + "/" + sw2 + " / top " + top);
        await page.close();

        check("no-errors", allErrors.length === 0, allErrors.join(" | "));
    } finally {
        await browser.close();
    }
    const failed = results.filter((r) => !r.ok).length;
    console.log(failed ? failed + " 件失敗" : "すべて ok（" + results.length + " 件）");
    process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
