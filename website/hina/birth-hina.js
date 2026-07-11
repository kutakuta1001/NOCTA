/**
 * NOCTA HiNa — 誕生HiNa: 12ヶ月の贈り物棚
 *
 * 生まれた月を選ぶと、誕生花・誕生石・HiNa誕生色・銀猫の祝福1文を
 * 一枚の暖色の贈り物カード（和紙寄りの生成り#F0EAD8）にして見せる。
 * 誕生花・誕生石は実写の標本写真（丸フレーム2点）を添え、HiNa誕生色は
 * 帯ではなく一つの色点+名前で静かに示す（植物/鉱物標本カードの静けさを保つ）。
 * 落款(スタンプ)は月番号の円のみ（キャラクター表記は持たない）。
 *
 * 依存: window.HINA_BIRTH（hina-birth-data.js を先に読み込むこと。各エントリの
 *       flower.img / stone.img に実写URL(Wikimedia Commons原寸)が必要）
 * 提供: window.NoctaBirthHina.mount(container) → { detach }
 *
 * ?m=1〜12 で該当月を直接開く。不正・欠落時は今日の月、それも無効なら1月。
 * カードのCSS(.hina-birth-*)は website/hina/index.html 側の<style>で定義する
 * （flora/index.html + hana.js と同じ役割分担: データ描画はJS、見た目はホストページのCSS）。
 *
 * 実写画像の取り扱い:
 *  - 表示(<img>): thumbUrl(url,500) + crossorigin="anonymous"。読込失敗時はそのフレームだけ
 *    静かに非表示にする(is-missing。カード全体やラベル文字は壊さない)。
 *  - PNG書き出し: new Image()+crossOrigin='anonymous'でthumbUrl(url,960)を読み込み、
 *    フォント読込(document.fonts.ready)と合わせて両方readyになってからcanvasに描く。
 *    画像読込に失敗した月はその写真だけ省いて(フレーム輪郭のみ)描画を続け、PNG自体は必ず生成する。
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

  /* Wikimedia Commonsの原寸URLからサムネイルURLを導出する(zukan-core.jsのthumbUrlと同一ロジック。
     依存を増やさないためここに複製する)。固定幅バケット(500/960/1280等)以外は非200になるため、
     マッチしない形式のURLはそのまま返す(原寸表示にフォールバック)。 */
  function thumbUrl(url, w) {
    var m = String(url).match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/([^\/]+)$/);
    return m ? (m[1] + "/thumb/" + m[2] + "/" + m[3] + "/" + m[4] + "/" + w + "px-" + m[4]) : url;
  }

  var IMAGE_LOAD_TIMEOUT_MS = 7000;

  /* PNG書き出し用: 実写画像をcrossOrigin='anonymous'で読み込む。失敗時は例外を投げず
     nullに解決する(呼び出し側でその写真だけ省いてカードを描くフォールバックに使う)。
     ネット停滞でonload/onerrorが永久に返らないケースに備え、タイムアウト(既定7秒)でも
     nullに解決する(settleガードで一度だけ解決・保存ボタンの固着を防ぐ)。 */
  function loadImage(url) {
    return new Promise(function (resolve) {
      if (!url) { resolve(null); return; }
      var settled = false;
      var img = new Image();
      var timer = setTimeout(function () { settle(null); }, IMAGE_LOAD_TIMEOUT_MS);
      function settle(result) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        img.onload = null;
        img.onerror = null;
        resolve(result);
      }
      img.crossOrigin = "anonymous";
      img.onload = function () { settle(img); };
      img.onerror = function () { settle(null); };
      img.src = thumbUrl(url, 960);
    });
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
          '<div class="hbc-specimens">' +
            '<figure class="hbc-specimen" data-specimen="flower">' +
              '<span class="hbc-specimen-frame">' +
                '<img class="hbc-specimen-img" data-f="flowerImg" alt="" loading="lazy" crossorigin="anonymous">' +
              "</span>" +
              '<figcaption class="hbc-specimen-label" data-f="flowerLabel"></figcaption>' +
            "</figure>" +
            '<figure class="hbc-specimen" data-specimen="stone">' +
              '<span class="hbc-specimen-frame">' +
                '<img class="hbc-specimen-img" data-f="stoneImg" alt="" loading="lazy" crossorigin="anonymous">' +
              "</span>" +
              '<figcaption class="hbc-specimen-label" data-f="stoneLabel"></figcaption>' +
            "</figure>" +
          "</div>" +
          '<p class="hbc-caption">' +
            '<span class="hbc-caption-dot" data-f="colorDot" aria-hidden="true"></span>' +
            '<span data-f="colorLabel"></span>' +
          "</p>" +
          '<p class="hbc-blessing" data-f="blessing"></p>' +
          '<p class="hbc-stamp">' +
            '<span class="hbc-stamp-num" data-f="stampNum"></span>' +
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

  /* 標本写真1点を丸フレームに描く(clipで丸抜き・object-fit:coverと同じ正方形クロップ)。
     image が null(未読込・失敗)の場合はフレームの輪郭だけを描き、写真は省く
     (グレースフルフォールバック。カード自体はこの1枚を欠いても静かに成立する)。 */
  function drawSpecimen(ctx, cx, cy, r, image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    if (image) {
      ctx.clip();
      var iw = image.naturalWidth || image.width || 1;
      var ih = image.naturalHeight || image.height || 1;
      var side = Math.min(iw, ih);
      var sx = (iw - side) / 2, sy = (ih - side) / 2;
      ctx.drawImage(image, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(42,33,24,0.22)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(107,91,71,0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(42,33,24,0.18)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  /* 実寸1080x1440(3:4・縦長)のカードをオフスクリーンcanvasに描く。
     見た目はDOMのカード(.hina-birth-card)と同じ構成(eyebrow→花名→標本写真2点→誕生色→祝福→スタンプ)。
     images省略時(または未読込)は写真なしで描く(呼び出し側はbuildCardCanvasAsyncを使うこと)。 */
  function buildCardCanvas(entry, images) {
    var flowerImg = images && images.flowerImg;
    var stoneImg = images && images.stoneImg;
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

    /* 標本ラベル/祝福の折り返し行数を先に計算 */
    ctx.font = '500 22px "Noto Sans JP", sans-serif';
    var flowerLabelText = "誕生花 " + entry.flower.name;
    var stoneLabelText = "誕生石 " + entry.stone.name;
    var specimenLabelLH = 30;

    ctx.font = 'italic 500 44px "EB Garamond", "Shippori Mincho", serif';
    var blessingLines = wrapByChar(ctx, entry.blessing, W * 0.72);
    var blessingLH = 64;

    /* ブロック全体の高さを積み上げて求め、余白を残しつつキャンバス縦中央に配置する。
       固定天頂+固定下端(スタンプ)で余白が偏る/余りすぎるのを避け、贈り物として
       バランスの良い一枚に見せる(祝福文の行数が変わっても自動で釣り合う)。 */
    var specimenR = 96;
    var colorLineH = 30;
    var stampR = 52, stampGap = 44;
    var blockHeight =
      36 /* eyebrow */ + 118 /* → flower */ +
      flowerSize * 0.86 /* flower本体 */ + 66 /* → 標本写真 */ +
      specimenR * 2 + 20 + specimenLabelLH /* 標本写真(丸フレーム+ラベル) */ + 54 /* → 誕生色 */ +
      colorLineH + 86 /* → 祝福 */ +
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
    y += 118;

    /* 誕生花名 */
    ctx.font = '600 ' + flowerSize + 'px "Shippori Mincho", "EB Garamond", serif';
    ctx.fillStyle = INK;
    ctx.fillText(entry.flower.name, cx, y);
    y += flowerSize * 0.86 + 66;

    /* 標本写真2点(誕生花・誕生石)を丸フレームで並べ、写実は写真に委ねる。
       写真が読めない月はdrawSpecimenがフレーム輪郭だけを描いて静かに続ける。 */
    var specimenGapX = 60;
    var specCxL = cx - specimenR - specimenGapX / 2;
    var specCxR = cx + specimenR + specimenGapX / 2;
    var specCy = y + specimenR;
    drawSpecimen(ctx, specCxL, specCy, specimenR, flowerImg);
    drawSpecimen(ctx, specCxR, specCy, specimenR, stoneImg);
    y += specimenR * 2 + 20;

    ctx.fillStyle = INK_SUB;
    ctx.font = '500 22px "Noto Sans JP", sans-serif';
    ctx.fillText(flowerLabelText, specCxL, y);
    ctx.fillText(stoneLabelText, specCxR, y);
    y += specimenLabelLH + 54;

    /* 誕生色は帯ではなく色点1つ+名前の1行で静かに示す */
    ctx.font = '500 24px "Noto Sans JP", sans-serif';
    var colorText = "誕生色  " + entry.hinaColor.name;
    var dotR = 7, dotGap = 12;
    var colorTextWidth = ctx.measureText(colorText).width;
    var colorLineLeft = cx - (colorTextWidth + dotR * 2 + dotGap) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(colorLineLeft + dotR, y - 8, dotR, 0, Math.PI * 2);
    ctx.fillStyle = entry.hinaColor.hex;
    ctx.fill();
    /* 淡色(桜色等)でも生成り地に対して色見本として視認できるよう、外枠を強めに引く
       (DOM側 .hbc-caption-dot の box-shadow と同じ強度: rgba(42,33,24,0.38)・約1.75px相当) */
    ctx.strokeStyle = "rgba(42,33,24,0.38)";
    ctx.lineWidth = 1.75;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK_SUB;
    ctx.textAlign = "left";
    ctx.fillText(colorText, colorLineLeft + dotR * 2 + dotGap, y);
    ctx.textAlign = "center";
    y += colorLineH + 86;

    /* 祝福文(このカードの主役) */
    var blessingTop = y;
    ctx.fillStyle = INK;
    ctx.font = 'italic 500 44px "EB Garamond", "Shippori Mincho", serif';
    blessingLines.forEach(function (line, i) { ctx.fillText(line, cx, y + i * blessingLH); });
    y = blessingTop + blessingLines.length * blessingLH;

    /* 落款(はんこ)風の月番号スタンプ。手紙の最後に押すように、祝福文の右下すぐに寄せる。
       円と月番号のみ(キャラクター名は持たない)。 */
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
    ctx.font = '600 32px "Shippori Mincho", serif';
    ctx.fillText(pad2(entry.month), stampCx, stampCy);

    return out;
  }

  /* 誕生花・誕生石の実写を読み込んでからbuildCardCanvasを呼ぶ。画像読込(loadImage)は
     失敗時にnullへ解決するため例外にはならないが、drawImage自体が例外を投げる
     稀なケース(タイント等)に備えてtry/catchし、その場合は写真なしで再描画する
     (PNGは必ず生成される・「読込失敗時はその写真を省いて描く」を徹底する)。 */
  function buildCardCanvasAsync(entry) {
    return Promise.all([
      loadImage(entry.flower && entry.flower.img),
      loadImage(entry.stone && entry.stone.img)
    ]).then(function (imgs) {
      var images = { flowerImg: imgs[0], stoneImg: imgs[1] };
      try {
        return buildCardCanvas(entry, images);
      } catch (_) {
        try { return buildCardCanvas(entry, null); } catch (_) { return null; }
      }
    });
  }

  /* Webフォント(Shippori Mincho/EB Garamond等)の読み込み完了を待つ。
     待てない環境(document.fonts未対応)では即時解決し、保存自体は止めない。
     document.fonts.ready自体が返らない稀な環境に備え、上限(3秒)を設けたPromise.raceで
     必ずどちらか早い方で解決する(保存ボタンの固着防止)。 */
  function waitForFonts() {
    try {
      if (document.fonts && document.fonts.ready) {
        var fontsReady = document.fonts.ready.then(function () {}, function () {});
        var fontsTimeout = new Promise(function (resolve) { setTimeout(resolve, 3000); });
        return Promise.race([fontsReady, fontsTimeout]);
      }
    } catch (_) { /* 検知に失敗しても保存は続行する */ }
    return Promise.resolve();
  }

  /* canvas.toBlob()をPromise化する。callbackが例外や無応答(稀なケース)で返らない場合に備え、
     settleガード付きの短いタイムアウト(5秒)でもnullに解決し、呼び出し側のフォールバックに繋げる。 */
  function toBlobPromise(canvas) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () { settle(null); }, 5000);
      function settle(result) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      }
      try {
        canvas.toBlob(function (blob) { settle(blob || null); }, "image/png");
      } catch (_) {
        settle(null);
      }
    });
  }

  /* blobをobjectURL化してダウンロードを発火する。ダウンロード後にrevokeObjectURLでメモリを解放する。 */
  function downloadBlob(blob, entry) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "hina-birth-" + entry.month + ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    return true;
  }

  /* フォント読み込み・標本写真読み込み完了→canvas描画→toBlob→objectURLでダウンロードの順に行う。
     toDataURL(同期・メインスレッドをブロック)ではなくtoBlob+URL.createObjectURLを使う。
     drawImage自体は成功してもCORS/taint系の問題はtoBlob呼び出し時に表面化することがあるため、
     toBlobが失敗(null/例外)した場合は写真なしで再描画(buildCardCanvas(entry,null))して再度toBlobを
     試す。それでも失敗した場合のみresolve(false)にとどめ、例外を外に漏らさない
     (「PNGは必ず生成される」を保証する最後のフォールバック・連打抑止解除の安定のため)。 */
  function triggerDownload(entry) {
    return waitForFonts().then(function () {
      return buildCardCanvasAsync(entry);
    }, function () { return null; }).then(function (canvas) {
      if (!canvas) return false;
      return toBlobPromise(canvas).then(function (blob) {
        if (blob) return downloadBlob(blob, entry);
        var fallbackCanvas;
        try { fallbackCanvas = buildCardCanvas(entry, null); } catch (_) { fallbackCanvas = null; }
        if (!fallbackCanvas) return false;
        return toBlobPromise(fallbackCanvas).then(function (blob2) {
          return blob2 ? downloadBlob(blob2, entry) : false;
        });
      });
    }, function () { return false; });
  }

  /* ---- マウント ---- */
  function mount(container) {
    if (!container) return { detach: function () {} };

    container.innerHTML = shelfHtml() + cardSectionHtml();

    var buttons = Array.prototype.slice.call(container.querySelectorAll(".hina-birth-m"));
    var fEyebrow = container.querySelector('[data-f="eyebrow"]');
    var fFlower = container.querySelector('[data-f="flower"]');
    var fFlowerImg = container.querySelector('[data-f="flowerImg"]');
    var fFlowerLabel = container.querySelector('[data-f="flowerLabel"]');
    var fStoneImg = container.querySelector('[data-f="stoneImg"]');
    var fStoneLabel = container.querySelector('[data-f="stoneLabel"]');
    var fFlowerFigure = fFlowerImg ? fFlowerImg.closest(".hbc-specimen") : null;
    var fStoneFigure = fStoneImg ? fStoneImg.closest(".hbc-specimen") : null;
    var fColorDot = container.querySelector('[data-f="colorDot"]');
    var fColorLabel = container.querySelector('[data-f="colorLabel"]');
    var fBlessing = container.querySelector('[data-f="blessing"]');
    var fStampNum = container.querySelector('[data-f="stampNum"]');

    var current = null;
    var specimenRequestSeq = 0;

    /* 標本写真1点をDOMに反映する。写真は装飾扱い(alt=""・情報はfigcaptionの
       ラベル文字「誕生花 ○○」が担う。スクリーンリーダーでの重複読み上げを避ける)。
       月を素早く切り替えると同じ<img>要素を使い回すため、前月分の遅延onload/onerrorが
       現在月の表示に誤って反映される競合が起きうる。呼び出しごとにrequestIdを発行し、
       dataset経由で「今どのリクエストが有効か」を持たせ、コールバック発火時に不一致なら
       無視する(is-missingの付与・解除どちらも現在のリクエストのみ反映する)。 */
    function setSpecimenImage(imgEl, figureEl, url) {
      if (!imgEl) return;
      var requestId = String(++specimenRequestSeq);
      imgEl.dataset.hinaReq = requestId;
      imgEl.onload = null;
      imgEl.onerror = null;
      imgEl.alt = "";
      if (figureEl) figureEl.classList.remove("is-missing");
      if (!url) {
        imgEl.removeAttribute("src");
        if (figureEl) figureEl.classList.add("is-missing");
        return;
      }
      imgEl.onload = function () {
        if (imgEl.dataset.hinaReq !== requestId) return;
        if (figureEl) figureEl.classList.remove("is-missing");
      };
      imgEl.onerror = function () {
        if (imgEl.dataset.hinaReq !== requestId) return;
        if (figureEl) figureEl.classList.add("is-missing");
      };
      imgEl.src = thumbUrl(url, 500);
    }

    function render(month) {
      var entry = findEntry(month);
      if (!entry) return;
      current = entry;

      buttons.forEach(function (btn) {
        var isOn = parseInt(btn.getAttribute("data-month"), 10) === month;
        btn.classList.toggle("is-on", isOn);
        btn.setAttribute("aria-pressed", isOn ? "true" : "false");
      });

      var flowerLabelText = "誕生花 " + entry.flower.name;
      var stoneLabelText = "誕生石 " + entry.stone.name;

      fEyebrow.textContent = "誕生 ・ " + MONTH_LABEL[month];
      fFlower.textContent = entry.flower.name;
      fFlowerLabel.textContent = flowerLabelText;
      fStoneLabel.textContent = stoneLabelText;
      setSpecimenImage(fFlowerImg, fFlowerFigure, entry.flower.img);
      setSpecimenImage(fStoneImg, fStoneFigure, entry.stone.img);
      fColorDot.style.background = entry.hinaColor.hex;
      fColorLabel.textContent = "誕生色 " + entry.hinaColor.name;
      fBlessing.textContent = entry.blessing;
      fStampNum.textContent = pad2(month);
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

    /* テスト用: 現在月・保存処理・生成canvasの取得手段を控えめに公開(実挙動には影響しない)。
       renderCanvas()は標本写真の読込を待つ必要があるためPromiseを返す(呼び出し側でawaitする)。 */
    window.__hinaBirth = {
      current: function () { return current; },
      selectMonth: function (m) { selectMonth(m); },
      save: function () { return current ? triggerDownload(current) : Promise.resolve(false); },
      renderCanvas: function () { return current ? buildCardCanvasAsync(current) : Promise.resolve(null); }
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
