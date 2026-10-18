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
const BROKEN_ID = "a000000000000007"; // 京都の 2 枚目。img-error でだけ 404 にする
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
    await page.route("**/tff-journey-data.js", (r) =>
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

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    const allErrors = [];
    try {
        let { page, errors } = await openPage(browser);
        allErrors.push(...errors);

        check("tiles", (await page.$$(".jr-tile")).length === 47 && (await page.$$(".jr-tile.is-visited")).length === 2,
            (await page.$$(".jr-tile")).length + " / " + (await page.$$(".jr-tile.is-visited")).length);

        await page.click('.jr-tile[data-region="JP-01"]');
        const placeNames = await page.$$eval("#jr-places button", (bs) => bs.map((b) => b.textContent.trim()));
        check("select-region",
            (await text(page, "#jr-label")) === "北海道" && (await page.$$("#jr-thumbs button")).length === 3 && placeNames.includes("小樽"),
            JSON.stringify(placeNames));

        await page.click('#jr-places button[data-region="place-otaru"]');
        check("select-place", (await text(page, "#jr-label")) === "北海道 › 小樽" && (await page.$$("#jr-thumbs button")).length === 2);

        await page.click("#jr-thumbs button:nth-child(2)");
        const mainSrc = await page.$eval("img.jr-main", (i) => i.getAttribute("src"));
        check("thumb-swap", mainSrc === "img/a000000000000002.jpg", mainSrc);

        check("caption-is-text",
            (await text(page, "#jr-caption")) === '<b>"夜"</b>' && (await page.$$("#jr-caption b")).length === 0);

        await page.click('.jr-tile[data-region="JP-20"]', { force: true });
        check("disabled-tile", (await text(page, "#jr-label")) === "北海道 › 小樽");

        await page.click('#jr-tabs button[data-mode="world"]');
        const worldList = await page.$$eval("#jr-list button", (bs) => bs.map((b) => b.textContent.trim()));
        await page.click('#jr-list button[data-region="HK"]');
        check("world", worldList.length === 1 && worldList[0] === "香港" && (await text(page, "#jr-label")) === "香港",
            JSON.stringify(worldList));
        await page.close();

        ({ page, errors } = await openPage(browser));
        allErrors.push(...errors);
        await page.focus('.jr-tile[data-region="JP-26"]');
        await page.keyboard.press("Enter");
        const kb1 = await text(page, "#jr-label");
        await page.focus('.jr-tile[data-region="JP-01"]');
        await page.keyboard.press("Enter");
        check("keyboard", kb1 === "京都" && (await text(page, "#jr-label")) === "北海道");
        await page.close();

        ({ page, errors } = await openPage(browser, { brokenImage: true }));
        allErrors.push(...errors.filter((e) => !e.includes("404")));
        await page.click('.jr-tile[data-region="JP-26"]');
        await page.click("#jr-thumbs button:nth-child(2)");
        await page.waitForTimeout(500);
        check("img-error", (await text(page, "#jr-status")) === "写真を読み込めませんでした", await text(page, "#jr-status"));
        await page.close();

        ({ page, errors } = await openPage(browser, { slowId: "a000000000000001" }));
        allErrors.push(...errors);
        await page.click('.jr-tile[data-region="JP-26"]');
        await page.click('.jr-tile[data-region="JP-01"]');
        await page.click('.jr-tile[data-region="JP-26"]');
        await page.waitForTimeout(1000);
        const rapidSrc = await page.$eval("img.jr-main", (i) => i.getAttribute("src"));
        check("rapid-switch", (await text(page, "#jr-label")) === "京都" && rapidSrc === "img/a000000000000006.jpg"
            && (await text(page, "#jr-status")) === "", rapidSrc);
        await page.close();

        ({ page, errors } = await openPage(browser, { empty: true }));
        check("empty-data", (await text(page, "#jr-status")) === "旅の写真は準備中です。" && errors.length === 0, errors.join(" | "));
        await page.close();

        ({ page, errors } = await openPage(browser, { width: 390, mobile: true }));
        allErrors.push(...errors);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        await page.click('.jr-tile[data-region="JP-26"]');
        await page.waitForTimeout(1000);
        const top = await page.$eval("#jr-photo", (el) => el.getBoundingClientRect().top);
        check("mobile-390", sw <= 390 && top >= 0 && top < 900, "scrollWidth " + sw + " / top " + top);
        await page.close();

        check("no-errors", allErrors.length === 0, allErrors.join(" | "));
    } finally {
        await browser.close();
    }
    const failed = results.filter((r) => !r.ok).length;
    console.log(failed ? failed + " 件失敗" : "すべて ok（" + results.length + " 件）");
    process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
