/**
 * NOCTA HiNa — 誕生HiNa: 12ヶ月の贈り物棚
 *
 * 生まれた月を選ぶと、誕生花・誕生石・HiNa誕生色・銀猫の祝福1文を
 * 一枚の暖色の贈り物カード（和紙寄りの生成り#F0EAD8）にして見せる。
 * 花・石・色は写実ではなく「色」（帯・面）で静かに表現する。
 *
 * 依存: window.HINA_BIRTH（hina-birth-data.js を先に読み込むこと）
 * 提供: window.NoctaBirthHina.mount(container) → { detach }
 *
 * ?m=1〜12 で該当月を直接開く。不正・欠落時は今日の月、それも無効なら1月。
 * カードのCSS(.hina-birth-*)は website/hina/index.html 側の<style>で定義する
 * （flora/index.html + hana.js と同じ役割分担: データ描画はJS、見た目はホストページのCSS）。
 */
(function () {
  "use strict";

  var MONTH_LABEL = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  /* ---- 月の検証・解決 ---- */
  /* 完全一致のみ許可(1〜12・先頭ゼロや後続文字は不可)。"1abc"や"01"はここで無効になり
     呼び出し元のフォールバック(今日の月→それも無効なら1月)に委ねられる。 */
  function clampMonth(v) {
    var s = String(v);
    if (!/^(?:[1-9]|1[0-2])$/.test(s)) return null;
    return parseInt(s, 10);
  }

  function todayMonthFallback() {
    return clampMonth(new Date().getMonth() + 1) || 1;
  }

  function readMonthFromQuery() {
    try {
      var sp = new URLSearchParams(window.location.search);
      if (!sp.has("m")) return null;
      return clampMonth(sp.get("m"));
    } catch (_) {
      return null;
    }
  }

  function findEntry(month) {
    var list = window.HINA_BIRTH || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].month === month) return list[i];
    }
    return null;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /* ---- DOM構築（見た目は index.html の<style>が担当） ---- */
  function shelfHtml() {
    var out = "";
    for (var m = 1; m <= 12; m++) {
      out +=
        '<button type="button" class="hina-birth-m" data-month="' + m + '" aria-pressed="false" aria-label="' + MONTH_LABEL[m] + '">' +
          '<span class="hbm-num">' + pad2(m) + "</span>" +
          '<span class="hbm-suffix">月</span>' +
        "</button>";
    }
    return '<nav class="hina-birth-nav" aria-label="誕生月をえらぶ">' + out + "</nav>";
  }

  function cardSectionHtml() {
    return (
      '<div class="hina-birth-stage">' +
        '<article class="hina-birth-card">' +
          '<p class="hbc-eyebrow" data-f="eyebrow"></p>' +
          '<h3 class="hbc-flower" data-f="flower"></h3>' +
          '<div class="hbc-ribbon" role="img" aria-label="この月の色">' +
            '<span class="hbc-seg" data-seg="flower"></span>' +
            '<span class="hbc-seg" data-seg="stone"></span>' +
            '<span class="hbc-seg" data-seg="hina"></span>' +
          "</div>" +
          '<p class="hbc-caption" data-f="caption"></p>' +
          '<p class="hbc-blessing" data-f="blessing"></p>' +
          '<p class="hbc-stamp">' +
            '<span class="hbc-stamp-num" data-f="stampNum"></span>' +
            '<span class="hbc-stamp-cat">銀猫</span>' +
          "</p>" +
        "</article>" +
      "</div>" +
      '<div class="hina-birth-actions">' +
        '<button type="button" class="hina-birth-save">この月を保存 <span aria-hidden="true">&darr;</span></button>' +
      "</div>" +
      '<div class="hina-birth-open">' +
        '<span class="hbo-tag">Open in HiNa</span>' +
        '<a href="../gems/" class="hbo-link">Gyu<span class="hbo-jp">宝石</span></a>' +
        '<a href="../flora/" class="hbo-link">Ichi<span class="hbo-jp">花</span></a>' +
        '<a href="../iro/" class="hbo-link">Hare<span class="hbo-jp">色</span></a>' +
      "</div>"
    );
  }

  /* ---- Canvas描画ユーティリティ ---- */
  function wrapByChar(ctx, text, maxWidth) {
    var lines = [];
    var cur = "";
    for (var i = 0; i < text.length; i++) {
      var next = cur + text[i];
      if (cur.length > 0 && ctx.measureText(next).width > maxWidth) {
        lines.push(cur);
        cur = text[i];
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* 実寸1080x1440(3:4・縦長)のカードをオフスクリーンcanvasに描く。
     見た目はDOMのカード(.hina-birth-card)と同じ構成(eyebrow→花名→帯→caption→祝福→スタンプ)。 */
  function buildCardCanvas(entry) {
    var W = 1080, H = 1440, cx = W / 2;
    var INK = "#2A2118";
    var INK_SUB = "#6B5B47";

    var out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    var ctx = out.getContext("2d");

    /* 紙(生成り) */
    ctx.fillStyle = "#F0EAD8";
    ctx.fillRect(0, 0, W, H);
    /* ほのかな陰影で奥行き(保存物としての質感) */
    var vg = ctx.createRadialGradient(cx, H * 0.4, H * 0.1, cx, H * 0.5, H * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(60,50,32,0.08)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    /* 縁 */
    ctx.strokeStyle = "rgba(60,50,30,0.16)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    /* 誕生花名の自動縮小フォント(長い名前でも1行に収まる大きさを先に確定) */
    var flowerSize = 128;
    ctx.font = '600 ' + flowerSize + 'px "Shippori Mincho", "EB Garamond", serif';
    while (ctx.measureText(entry.flower.name).width > W * 0.8 && flowerSize > 56) {
      flowerSize -= 4;
      ctx.font = '600 ' + flowerSize + 'px "Shippori Mincho", "EB Garamond", serif';
    }

    /* caption/祝福の折り返し行数を先に計算 */
    ctx.font = '500 24px "Noto Sans JP", sans-serif';
    var captionText = "誕生花  " + entry.flower.name + "　誕生石  " + entry.stone.name + "　誕生色  " + entry.hinaColor.name;
    var captionLines = wrapByChar(ctx, captionText, W * 0.82);
    var captionLH = 34;

    ctx.font = 'italic 500 44px "EB Garamond", "Shippori Mincho", serif';
    var blessingLines = wrapByChar(ctx, entry.blessing, W * 0.72);
    var blessingLH = 64;

    /* ブロック全体の高さを積み上げて求め、余白を残しつつキャンバス縦中央に配置する。
       固定天頂+固定下端(スタンプ)で余白が偏る/余りすぎるのを避け、贈り物として
       バランスの良い一枚に見せる(祝福文の行数が変わっても自動で釣り合う)。 */
    var ribbonH = 22;
    var stampR = 56, stampGap = 46;
    var blockHeight =
      36 /* eyebrow */ + 130 /* → flower */ +
      flowerSize * 0.86 /* flower本体 */ + 60 /* → ribbon */ +
      ribbonH + 44 /* → caption */ +
      captionLines.length * captionLH + 130 /* → blessing */ +
      blessingLines.length * blessingLH + stampGap +
      stampR * 2 /* stamp */;
    var topMargin = Math.max(110, (H - blockHeight) / 2);
    var y = topMargin;

    /* eyebrow */
    ctx.fillStyle = INK_SUB;
    ctx.font = '700 25px "Syne", sans-serif';
    try { ctx.letterSpacing = "3px"; } catch (_) {}
    ctx.fillText("誕生 ・ " + MONTH_LABEL[entry.month], cx, y);
    try { ctx.letterSpacing = "0px"; } catch (_) {}
    y += 130;

    /* 誕生花名 */
    ctx.font = '600 ' + flowerSize + 'px "Shippori Mincho", "EB Garamond", serif';
    ctx.fillStyle = INK;
    ctx.fillText(entry.flower.name, cx, y);
    y += flowerSize * 0.86 + 60;

    /* 色の帯(誕生花/誕生石/HiNa誕生色を3色でつなぐ・写実ではなく色そのもので表現) */
    var ribbonY = y, ribbonW = W * 0.58, ribbonX = cx - ribbonW / 2;
    roundedRectPath(ctx, ribbonX, ribbonY, ribbonW, ribbonH, ribbonH / 2);
    ctx.save();
    ctx.clip();
    var segW = ribbonW / 3;
    ctx.fillStyle = entry.flower.hex;
    ctx.fillRect(ribbonX, ribbonY, segW, ribbonH);
    ctx.fillStyle = entry.stone.hex;
    ctx.fillRect(ribbonX + segW, ribbonY, segW, ribbonH);
    ctx.fillStyle = entry.hinaColor.hex;
    ctx.fillRect(ribbonX + segW * 2, ribbonY, segW, ribbonH);
    ctx.strokeStyle = "rgba(42,33,24,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ribbonX + segW, ribbonY); ctx.lineTo(ribbonX + segW, ribbonY + ribbonH);
    ctx.moveTo(ribbonX + segW * 2, ribbonY); ctx.lineTo(ribbonX + segW * 2, ribbonY + ribbonH);
    ctx.stroke();
    ctx.restore();
    y += ribbonH + 44;

    /* caption(誕生花・誕生石・誕生色を静かに1行で・必要なら折り返す) */
    ctx.fillStyle = INK_SUB;
    ctx.font = '500 24px "Noto Sans JP", sans-serif';
    captionLines.forEach(function (line, i) { ctx.fillText(line, cx, y + i * captionLH); });
    y += captionLines.length * captionLH;

    /* 余白をたっぷり置いて祝福文(このカードの主役) */
    y += 130;
    var blessingTop = y;
    ctx.fillStyle = INK;
    ctx.font = 'italic 500 44px "EB Garamond", "Shippori Mincho", serif';
    blessingLines.forEach(function (line, i) { ctx.fillText(line, cx, y + i * blessingLH); });
    y = blessingTop + blessingLines.length * blessingLH;

    /* 銀猫の落款(はんこ)風の署名。手紙の最後に押すように、祝福文の右下すぐに寄せる */
    var lastBlessingWidth = ctx.measureText(blessingLines[blessingLines.length - 1]).width;
    var textColumnRight = cx + Math.max(lastBlessingWidth / 2, W * 0.2);
    var stampCx = Math.min(textColumnRight, W - stampR - 60);
    var stampCy = y + stampGap + stampR;
    ctx.beginPath();
    ctx.arc(stampCx, stampCy, stampR, 0, Math.PI * 2);
    ctx.strokeStyle = entry.hinaColor.hex;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.textBaseline = "middle";
    ctx.fillStyle = INK_SUB;
    ctx.font = '600 30px "Shippori Mincho", serif';
    ctx.fillText(pad2(entry.month), stampCx, stampCy - 14);
    ctx.font = '400 16px "Noto Sans JP", sans-serif';
    ctx.fillText("銀猫", stampCx, stampCy + 18);

    return out;
  }

  /* Webフォント(Shippori Mincho/EB Garamond等)の読み込み完了を待つ。
     待てない環境(document.fonts未対応)では即時解決し、保存自体は止めない。 */
  function waitForFonts() {
    try {
      if (document.fonts && document.fonts.ready) {
        return document.fonts.ready.then(function () {}, function () {});
      }
    } catch (_) { /* 検知に失敗しても保存は続行する */ }
    return Promise.resolve();
  }

  /* フォント読み込み完了→canvas描画→toBlob→objectURLでダウンロードの順に行う。
     toDataURL(同期・メインスレッドをブロック)ではなくtoBlob+URL.createObjectURLを使い、
     ダウンロード後にrevokeObjectURLでメモリを解放する。 */
  function triggerDownload(entry) {
    return waitForFonts().then(function () {
      return new Promise(function (resolve) {
        var canvas;
        try {
          canvas = buildCardCanvas(entry);
        } catch (_) {
          resolve(false);
          return;
        }
        canvas.toBlob(function (blob) {
          if (!blob) { resolve(false); return; }
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "hina-birth-" + entry.month + ".png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          resolve(true);
        }, "image/png");
      });
    });
  }

  /* ---- マウント ---- */
  function mount(container) {
    if (!container) return { detach: function () {} };

    container.innerHTML = shelfHtml() + cardSectionHtml();

    var buttons = Array.prototype.slice.call(container.querySelectorAll(".hina-birth-m"));
    var fEyebrow = container.querySelector('[data-f="eyebrow"]');
    var fFlower = container.querySelector('[data-f="flower"]');
    var fCaption = container.querySelector('[data-f="caption"]');
    var fBlessing = container.querySelector('[data-f="blessing"]');
    var fStampNum = container.querySelector('[data-f="stampNum"]');
    var segFlower = container.querySelector('[data-seg="flower"]');
    var segStone = container.querySelector('[data-seg="stone"]');
    var segHina = container.querySelector('[data-seg="hina"]');

    var current = null;

    function render(month) {
      var entry = findEntry(month);
      if (!entry) return;
      current = entry;

      buttons.forEach(function (btn) {
        var isOn = parseInt(btn.getAttribute("data-month"), 10) === month;
        btn.classList.toggle("is-on", isOn);
        btn.setAttribute("aria-pressed", isOn ? "true" : "false");
      });

      fEyebrow.textContent = "誕生 ・ " + MONTH_LABEL[month];
      fFlower.textContent = entry.flower.name;
      fCaption.textContent = "誕生花 " + entry.flower.name + " ・ 誕生石 " + entry.stone.name + " ・ 誕生色 " + entry.hinaColor.name;
      fBlessing.textContent = entry.blessing;
      fStampNum.textContent = pad2(month);
      segFlower.style.background = entry.flower.hex;
      segStone.style.background = entry.stone.hex;
      segHina.style.background = entry.hinaColor.hex;
    }

    function selectMonth(monthLike, opts) {
      var m = clampMonth(monthLike);
      if (!m) return;
      render(m);
      if (!opts || opts.updateUrl !== false) {
        try {
          var url = new URL(window.location.href);
          url.searchParams.set("m", String(m));
          window.history.replaceState(null, "", url.pathname + "?" + url.searchParams.toString() + url.hash);
        } catch (_) { /* URL未対応環境では静かに諦める(実挙動には影響しない) */ }
      }
    }

    function onClick(e) {
      var monthBtn = e.target.closest ? e.target.closest(".hina-birth-m") : null;
      if (monthBtn) {
        selectMonth(monthBtn.getAttribute("data-month"));
        return;
      }
      var saveBtn = e.target.closest ? e.target.closest(".hina-birth-save") : null;
      if (saveBtn && current && !saveBtn.disabled) {
        saveBtn.disabled = true;
        var reEnable = function () { saveBtn.disabled = false; };   /* 成功/失敗どちらでも解除(エラー時の固着防止) */
        triggerDownload(current).then(reEnable, reEnable);
      }
    }
    container.addEventListener("click", onClick);

    /* 初期表示: ?m= を最優先。不正・欠落は今日の月(それも無効なら1月)にフォールバック */
    var initial = readMonthFromQuery();
    if (initial === null) initial = todayMonthFallback();
    selectMonth(initial, { updateUrl: false });

    /* テスト用: 現在月・保存処理・生成canvasの取得手段を控えめに公開(実挙動には影響しない) */
    window.__hinaBirth = {
      current: function () { return current; },
      selectMonth: function (m) { selectMonth(m); },
      save: function () { return current ? triggerDownload(current) : Promise.resolve(false); },
      renderCanvas: function () { return current ? buildCardCanvas(current) : null; }
    };

    return {
      detach: function () {
        container.removeEventListener("click", onClick);
        container.innerHTML = "";
      }
    };
  }

  window.NoctaBirthHina = { mount: mount };
})();
