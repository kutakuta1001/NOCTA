/**
 * NOCTA HiNa — 誕生HiNa: 12ヶ月の贈り物棚
 *
 * 生まれた月を選ぶと、誕生花・誕生石・HiNa誕生色・銀猫の祝福1文を
 * 「標本便箋」の趣の一枚(押し花/鉱物標本を和紙に留めた贈り物カード)にして見せる。
 * 地は生成りの縦グラデ(#F4EEDF→#EBE2CE)+微細な紙グレイン+内側ヴィネット、
 * 縁は外周ヘアライン+二重の内枠(標本シートの縁)。
 * 誕生花・誕生石・HiNa誕生色は同格の丸フレーム標本3点として並べる
 * （花・石は実写写真、誕生色は hinaColor.hex のソリッド色見本。サイズ・外枠(ヘアライン)・
 * 内側の押し込み影・ラベル(tiny capsのタグ+Shippori名前の2段)を揃え、
 * 淡色（桜色等）でも生成り地に対して視認できるよう全丸に強めの外枠を効かせる）。
 * 誕生花名は必ず1行に収める（DOM: white-space:nowrap+実測での自動縮小、
 * Canvas: 自動縮小フォントの下限を低めに取る）。標本名(タグ+名前の2段目)も
 * 全12ヶ月の最長データ(6文字)がDOM側で1行に収まる列幅/フォントサイズを実測して選んでいる
 * (probe-label-width調べ)。
 * 落款(スタンプ)は月番号の二重リング円のみ（キャラクター表記は持たない）。控えめに右下。
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

  /* 標本ラベルの1点分(タグ+名前)。タグ(「誕生花」等)は月に関わらず不変の静的文字列として
     ここに固定し、JS側では名前(data-f)だけを書き換える。タグと名前の間の半角スペース1つは
     アクセシビリティ用(figcaption.textContentが「誕生花 チューリップ」のように空白を挟んだ
     1文としてスクリーンリーダーに読まれる)。タグ/名前はどちらもCSSでdisplay:blockのため、
     このスペース自体が見た目の版面(2段組)に隙間を作ることはない。 */
  function specimenLabelHtml(tag, nameField) {
    return (
      '<figcaption class="hbc-specimen-label">' +
        '<span class="hbc-specimen-tag">' + tag + "</span> " +
        '<span class="hbc-specimen-name" data-f="' + nameField + '"></span>' +
      "</figcaption>"
    );
  }

  function cardSectionHtml() {
    return (
      '<div class="hina-birth-stage">' +
        '<article class="hina-birth-card">' +
          '<span class="hbc-grain" aria-hidden="true"></span>' +
          '<span class="hbc-frame-outer" aria-hidden="true"></span>' +
          '<span class="hbc-frame-inner" aria-hidden="true"></span>' +
          '<span class="hbc-ticks" aria-hidden="true"></span>' +
          '<div class="hbc-content">' +
            '<p class="hbc-eyebrow">' +
              '<span class="hbc-eyebrow-rule" aria-hidden="true"></span>' +
              '<span data-f="eyebrow"></span>' +
              '<span class="hbc-eyebrow-rule" aria-hidden="true"></span>' +
            "</p>" +
            '<h3 class="hbc-flower" data-f="flower"></h3>' +
            '<div class="hbc-specimens">' +
              '<figure class="hbc-specimen" data-specimen="flower">' +
                '<span class="hbc-specimen-frame">' +
                  '<img class="hbc-specimen-img" data-f="flowerImg" alt="" loading="lazy" crossorigin="anonymous">' +
                "</span>" +
                specimenLabelHtml("誕生花", "flowerName") +
              "</figure>" +
              '<figure class="hbc-specimen" data-specimen="stone">' +
                '<span class="hbc-specimen-frame">' +
                  '<img class="hbc-specimen-img" data-f="stoneImg" alt="" loading="lazy" crossorigin="anonymous">' +
                "</span>" +
                specimenLabelHtml("誕生石", "stoneName") +
              "</figure>" +
              '<figure class="hbc-specimen" data-specimen="color">' +
                '<span class="hbc-specimen-frame" data-f="colorSwatch" aria-hidden="true"></span>' +
                specimenLabelHtml("誕生色", "colorName") +
              "</figure>" +
            "</div>" +
            '<span class="hbc-blessing-mark" aria-hidden="true"></span>' +
            '<p class="hbc-blessing" data-f="blessing"></p>' +
            '<p class="hbc-stamp">' +
              '<span class="hbc-stamp-num" data-f="stampNum"></span>' +
            "</p>" +
          "</div>" +
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

  /* ---- DOM描画ユーティリティ ---- */
  /* 誕生花名(.hbc-flower)を必ず1行に収める。CSS側でwhite-space:nowrapを強制しているため、
     文字数が多い花名(「チューリップ」等)はビューポート幅基準のclamp()フォントサイズのままだと
     カード幅をはみ出しうる(特にデスクトップ幅でフォントサイズが大きく振れる場合)。
     実測(scrollWidth>clientWidth)しながら1pxずつ縮小し、1行に収まるまで続ける
     (下限を設け、極端な縮小は避ける。要素が非表示/未接続でclientWidthが取れない場合は
     CSSのclamp()にそのまま委ねて静かに諦める)。 */
  function fitFlowerName(el) {
    if (!el) return;
    el.style.fontSize = "";
    var maxWidth = el.clientWidth;
    if (!maxWidth) return;
    var minPx = 28;
    var guard = 0;
    while (el.scrollWidth > maxWidth && guard < 60) {
      var size = parseFloat(getComputedStyle(el).fontSize);
      if (!size || size <= minPx) break;
      el.style.fontSize = (size - 1) + "px";
      guard++;
    }
  }

  /* ---- Canvas描画ユーティリティ ---- */
  /* Canvasの基準スケール(Codex C2): DOMのカード基準幅380px : Canvas全体幅(1080px)の比率。
     標本丸(specimenR)・落款(stampR)・各フォントサイズ・四隅tickは、すべてDOM側のCSS実測px値
     (.hbc-specimen-frame=86px・.hbc-stamp-num=58px等)にこのSを掛けて求める。従来はCanvas側だけ
     独自に手調整した小さめの値(specimenR=80・stampR=46)を使っていたため、DOM(86px/58px≒22.6%/15.3%)
     に対しCanvas(160px/92px≒14.8%/8.5%)が明らかに小さく、書き出したPNGの主役(標本・落款)の
     存在感がDOMより弱かった。Sを1つの数値に揃えることで今後DOM側のサイズを変えてもCanvas側が
     追随しやすくなる。 */
  var CANVAS_W = 1080, CANVAS_H = 1440;
  var S = CANVAS_W / 380;

  /* 縦の積み(余白)。DOMのmargin値そのままではなくCanvas固有の構成(テキストbaseline基準の
     積み上げ)のため、DOM margin+行間から実測相当のbaseline間隔として再設計した値
     (全12ヶ月—最短の1文字花名「梅」「桜」「藤」「菊」から最長6文字「チューリップ」まで—で
     縦に溢れない/重ならないことをスクリーンショットで確認して調整済み)。
     GAP_EYEBROW_TO_FLOWERは固定値ではなく、花名フォント(flowerSize)のascent実測に基づく
     関数にする(下のeyebrowToFlowerGap参照)。花名は1〜6文字いずれもflowerSizeがほぼ上限
     (FLOWER_FONT_MAX)近くに留まるため、固定116pxでは大きな漢字のascent(約0.9em)を
     吸収できずeyebrow行と花名の上端が重なる不具合があった(スクリーンショットで実際に
     「紫陽花」「桔梗」「金木犀」等で確認・修正済み)。 */
  var GAP_EYEBROW_TOP = 36;
  var GAP_FLOWER_TO_SPECIMENS = 60;
  var GAP_SPECIMENS_TO_LABEL = 28;
  var GAP_LABEL_TO_BLESSING = 90;
  var DOT_OFFSET = 34;
  var GAP_BLESSING_TO_STAMP = 40;

  /* フォントサイズ(DOM pxをSで換算・Codex C2)。 */
  var EYEBROW_FONT_SIZE = Math.round(10 * S);          // DOM: .hbc-eyebrow font-size 10px
  var EYEBROW_LETTER_SPACING = EYEBROW_FONT_SIZE * 0.28; // DOM: letter-spacing 0.28em
  var EYEBROW_RULE_LEN = Math.round(20 * S);            // DOM: .hbc-eyebrow-rule width 20px
  var EYEBROW_RULE_GAP = Math.round(11 * S);            // DOM: .hbc-eyebrow flex gap 11px
  var FLOWER_FONT_MAX = Math.round(54 * S);             // DOM: .hbc-flower clamp(...,54px)上限
  var FLOWER_FONT_MIN = Math.round(28 * S);             // DOM: fitFlowerNameのminPx=28相当
  var BLESSING_FONT = Math.round(19 * S);               // DOM: .hbc-blessing clamp(...,19px)上限
  var BLESSING_LH = Math.round(BLESSING_FONT * 1.9);    // DOM: line-height 1.9
  var STAMP_FONT = Math.round(19 * S);                  // DOM: .hbc-stamp-num font-size 19px

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

  /* 誕生花・誕生石・誕生色の3標本すべてに使う強化枠(淡色の色見本(桜色等)でも生成り地に対して
     視認できる強度。DOM側 .hbc-specimen-frame の box-shadow と同じ強度。3点の「枠」を揃えるため
     写真標本にも同じ強度を適用する)。 */
  var SPECIMEN_RING_STYLE = "rgba(42,33,24,0.36)";
  var SPECIMEN_RING_WIDTH = 1.5 * S;      // DOM: box-shadow 1層目「0 0 0 1.5px」
  var SPECIMEN_RIM_STYLE = "rgba(42,33,24,0.20)";
  var SPECIMEN_SHADOW_STYLE = "rgba(42,33,24,0.30)";
  var SPECIMEN_FALLBACK_FILL = "rgba(122,111,94,0.08)";
  var SPECIMEN_SHADOW_BLUR = 20 * S;      // DOM: box-shadow 4層目「0 10px 20px -10px」のblur
  var SPECIMEN_SHADOW_OFFSET_Y = 10 * S;  // 同box-shadowのoffset-y

  /* 標本1点を丸フレームに描く(clipで丸抜き・object-fit:coverと同じ正方形クロップ)。
     image指定時は実写(花・石)、hex指定時はソリッド色見本(誕生色)、どちらも無ければ
     未読込/失敗のフォールバック(フレーム輪郭のみ)。どの場合も同じ外枠・内側の
     押し込み影(rim)・外側の柔らかい落ち影を重ね、「標本を留めた」質感で3点を揃える
     (DOM側 .hbc-specimen-frame の box-shadow構成と対応)。 */
  function drawSpecimen(ctx, cx, cy, r, image, hex) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (image) {
      var iw = image.naturalWidth || image.width || 1;
      var ih = image.naturalHeight || image.height || 1;
      var side = Math.min(iw, ih);
      var sx = (iw - side) / 2, sy = (ih - side) / 2;
      ctx.drawImage(image, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
    } else if (hex) {
      ctx.fillStyle = hex;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = SPECIMEN_FALLBACK_FILL;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    /* 内側の押し込み影(box-shadow insetに相当)。縁に向けてわずかに沈める。 */
    var rim = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
    rim.addColorStop(0, "rgba(42,33,24,0)");
    rim.addColorStop(1, SPECIMEN_RIM_STYLE);
    ctx.fillStyle = rim;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    /* 外枠(ヘアライン)＋柔らかい外側落ち影(clip解除後・丸の外側に描く) */
    ctx.save();
    ctx.shadowColor = SPECIMEN_SHADOW_STYLE;
    ctx.shadowBlur = SPECIMEN_SHADOW_BLUR;
    ctx.shadowOffsetY = SPECIMEN_SHADOW_OFFSET_Y;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = SPECIMEN_RING_STYLE;
    ctx.lineWidth = SPECIMEN_RING_WIDTH;
    ctx.stroke();
    ctx.restore();
  }

  /* 標本ラベル1点(タグ「誕生花」等+名前)を2段で描く。DOM側 .hbc-specimen-tag/.hbc-specimen-name の
     タイポ階層(tiny caps+Shippori名前)と対応させ、3点のラベル書式を揃える。 */
  var SPECIMEN_TAG_SIZE = Math.round(10 * S);     // DOM: .hbc-specimen-tag font-size 10px
  var SPECIMEN_NAME_SIZE = Math.round(13.5 * S);  // DOM: .hbc-specimen-name font-size 13.5px
  var SPECIMEN_TAG_FONT = '700 ' + SPECIMEN_TAG_SIZE + 'px "Syne", sans-serif';
  var SPECIMEN_NAME_FONT = '600 ' + SPECIMEN_NAME_SIZE + 'px "Shippori Mincho", "Noto Sans JP", serif';
  var SPECIMEN_TAG_LH = Math.round(SPECIMEN_TAG_SIZE * 1.6);
  var SPECIMEN_NAME_LH = Math.round(SPECIMEN_NAME_SIZE * 1.26);
  var SPECIMEN_LABEL_BLOCK_H = SPECIMEN_TAG_LH + SPECIMEN_NAME_LH;

  function drawSpecimenLabel(ctx, INK, INK_SUB, cx, topY, tag, name) {
    ctx.font = SPECIMEN_TAG_FONT;
    ctx.fillStyle = INK_SUB;
    try { ctx.letterSpacing = "1.8px"; } catch (_) {}
    ctx.fillText(tag, cx, topY + SPECIMEN_TAG_LH * 0.72);
    try { ctx.letterSpacing = "0px"; } catch (_) {}
    ctx.font = SPECIMEN_NAME_FONT;
    ctx.fillStyle = INK;
    ctx.fillText(name, cx, topY + SPECIMEN_TAG_LH + SPECIMEN_NAME_LH * 0.74);
  }

  /* 紙質のグレイン(Codex W2): DOM側 .hbc-grain と全く同じSVGノイズ画像(feTurbulence・
     baseFrequency 0.9・numOctaves 2)を読み込み、同じopacity(0.045)・同じmix-blend-mode
     (overlay)・同じタイルサイズ(130x130)でCanvasに敷く。従来はDOM(SVGの滑らかな乱流)と
     Canvas(Math.randomの疎らな黒点)で質感も毎回の見た目もずれていた不備を解消する。
     feTurbulenceのseed属性は仕様上デフォルト0=決定論的なため、この画像は毎回同じ絵になる
     (=保存のたびに粒が変わらない)。読込に失敗した場合のみ、固定seedの疑似乱数(seededRandom)で
     近似した粒を敷くフォールバックに切り替える(いずれの経路でも「粒が変わらない」を保証する)。 */
  var GRAIN_SVG_DATA_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";
  var grainImagePromise = null;
  function loadGrainImage() {
    if (!grainImagePromise) {
      grainImagePromise = new Promise(function (resolve) {
        var settled = false;
        function settle(v) { if (!settled) { settled = true; resolve(v); } }
        var img = new Image();
        img.onload = function () { settle(img); };
        img.onerror = function () { settle(null); };
        img.src = GRAIN_SVG_DATA_URL;
        setTimeout(function () { settle(null); }, 1500); /* data URIのローカル読込なので短めで十分 */
      });
    }
    return grainImagePromise;
  }

  /* 固定seedの疑似乱数(mulberry32)。grainImageの読込に失敗した場合だけ使うフォールバックの
     紙グレインで使う(同じseedなので保存を繰り返しても粒の見た目が変わらない)。 */
  function seededRandom(seed) {
    var s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawPaperGrain(ctx, W, H, grainImg) {
    var tile = document.createElement("canvas");
    tile.width = 130;
    tile.height = 130;
    var tctx = tile.getContext("2d");
    if (grainImg) {
      /* DOM側 background-size:130px 130px と同じく、120x120の原寸を130x130に拡大して敷く。 */
      tctx.drawImage(grainImg, 0, 0, 130, 130);
      ctx.save();
      ctx.globalAlpha = 0.045;
      try { ctx.globalCompositeOperation = "overlay"; } catch (_) {}
      ctx.fillStyle = ctx.createPattern(tile, "repeat");
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      return;
    }
    /* フォールバック: 固定seed(20260711)の疑似乱数で疎らな点を敷く(見た目はDOMの完全一致では
       ないが、保存のたびに変わらないことは保証する)。 */
    var rand = seededRandom(20260711);
    for (var i = 0; i < 700; i++) {
      var gx = rand() * 130, gy = rand() * 130;
      var v = 0.03 + rand() * 0.09;
      tctx.fillStyle = "rgba(42,33,24," + v.toFixed(3) + ")";
      tctx.fillRect(gx, gy, 1, 1);
    }
    ctx.save();
    ctx.fillStyle = ctx.createPattern(tile, "repeat");
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* 標本便箋の縁 — 外周の細いヘアライン(1点)＋二重の内枠(2点)＋四隅tick。DOM側の
     .hina-birth-cardの1pxアウトライン＋.hbc-frame-outer/inner(4%/5.6%インセット)＋
     .hbc-ticks(Codex W3・4%インセット矩形の四隅のL字線)と対応させる。 */
  function drawHairlineFrame(ctx, W, H) {
    ctx.save();
    ctx.strokeStyle = "rgba(42,33,24,0.14)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.strokeStyle = "rgba(42,33,24,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(W * 0.04, H * 0.04, W * 0.92, H * 0.92);
    ctx.strokeStyle = "rgba(42,33,24,0.10)";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(W * 0.056, H * 0.056, W * 0.888, H * 0.888);
    ctx.restore();

    /* 四隅tick: 外枠(4%インセット)の四隅に、水平+垂直の短い線分1本ずつでL字を作る
       (DOM側 .hbc-ticks の「同色2色linear-gradientの矩形×2」実装と対応・12px*S相当)。 */
    var tickLen = 12 * S;
    var left = W * 0.04, top = H * 0.04, right = W * 0.96, bottom = H * 0.96;
    ctx.save();
    ctx.strokeStyle = "rgba(42,33,24,0.30)";
    ctx.lineWidth = 1.4 * S;
    function tick(ox, oy, dx, dy) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + dx, oy);
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy + dy);
      ctx.stroke();
    }
    tick(left, top, tickLen, tickLen);
    tick(right, top, -tickLen, tickLen);
    tick(right, bottom, -tickLen, -tickLen);
    tick(left, bottom, tickLen, -tickLen);
    ctx.restore();
  }

  /* 実寸1080x1440(3:4・縦長)のカードをオフスクリーンcanvasに描く。
     見た目はDOMのカード(.hina-birth-card)と同じ構成(標本便箋の紙質・二重内枠→
     kicker付きeyebrow→花名→標本3点(花・石・誕生色)→点+祝福→落款)。
     images省略時(または未読込)は写真なしで描く(呼び出し側はbuildCardCanvasAsyncを使うこと)。 */
  function buildCardCanvas(entry, images) {
    var flowerImg = images && images.flowerImg;
    var stoneImg = images && images.stoneImg;
    var grainImg = images && images.grainImg;
    var W = CANVAS_W, H = CANVAS_H, cx = W / 2;
    var INK = "#2A2118";
    var INK_SUB = "#7A6F5E";

    var out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    var ctx = out.getContext("2d");

    /* 紙(生成りの縦グラデ) */
    var paper = ctx.createLinearGradient(0, 0, 0, H);
    paper.addColorStop(0, "#F4EEDF");
    paper.addColorStop(1, "#EBE2CE");
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);
    /* 内側ヴィネット(縁がわずかに沈む・保存物としての質感) */
    var vg = ctx.createRadialGradient(cx, H * 0.38, H * 0.12, cx, H * 0.5, H * 0.8);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(42,33,24,0.07)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    /* 微細な紙グレイン(DOM同一のSVGノイズ画像・Codex W2) */
    drawPaperGrain(ctx, W, H, grainImg);
    /* 標本便箋の縁(外周ヘアライン+二重の内枠+四隅tick・Codex W3) */
    drawHairlineFrame(ctx, W, H);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    /* 誕生花名の自動縮小フォント(長い名前でも1行に収まる大きさを先に確定)。
       基準サイズ・下限ともDOM側(.hbc-flowerのclamp上限54px・fitFlowerNameのminPx=28)を
       Sで換算した値にする(Codex C2)。「チューリップ」等の長い花名でも確実に1行(W*0.8以内)に
       収める(DOM側のwhite-space:nowrap+実測縮小と同じ意図をCanvas側でも保証する)。
       字間0.06em(DOM側.hbc-flowerのletter-spacingと対応)もmeasure/描画の両方に適用する。 */
    var flowerSize = FLOWER_FONT_MAX;
    function setFlowerFont(px) {
      ctx.font = '600 ' + px + 'px "Shippori Mincho", "EB Garamond", serif';
      try { ctx.letterSpacing = (px * 0.06).toFixed(2) + "px"; } catch (_) {}
    }
    setFlowerFont(flowerSize);
    while (ctx.measureText(entry.flower.name).width > W * 0.8 && flowerSize > FLOWER_FONT_MIN) {
      flowerSize -= 4;
      setFlowerFont(flowerSize);
    }
    /* eyebrow行と花名の間隔は花名フォント(flowerSize)のascent(和文フォントは概ね0.9em)を
       上回る必要がある。固定pxではflowerSizeがFLOWER_FONT_MAX付近(大半の月・1〜5文字)で
       eyebrowの行と花名の上端が重なってしまうため、flowerSizeに追随させる
       (縮小された長い花名ではその分ゆとりが増える方向になるため安全)。 */
    var eyebrowToFlowerGap = Math.round(flowerSize * 0.92) + 26;

    /* 祝福の折り返し行数を先に計算(measureを絞り「便箋」らしい読みの幅にする)。
       フォントサイズはDOM側.hbc-blessingのclamp上限19px・line-height1.9をSで換算(Codex C2)。 */
    ctx.font = 'italic 500 ' + BLESSING_FONT + 'px "EB Garamond", "Shippori Mincho", serif';
    var blessingLines = wrapByChar(ctx, entry.blessing, W * 0.72);
    var blessingLH = BLESSING_LH;

    /* ブロック全体の高さを積み上げて求め、余白を残しつつキャンバス縦中央に配置する。
       固定天頂+固定下端(スタンプ)で余白が偏る/余りすぎるのを避け、贈り物として
       バランスの良い一枚に見せる(祝福文の行数が変わっても自動で釣り合う)。
       標本3点(花・石・誕生色)は1つの行として積み上げる(誕生色専用の帯行は持たない)。
       specimenR/specimenGapXはDOM側(.hbc-specimen-frame=86px・.hbc-specimens gap=16px)を
       Sで換算した値(Codex C2)。全12ヶ月のうち最も長い花名+石名の組(3月「チューリップ」+
       「アクアマリン」)でもラベル同士が重ならないこと・縦にも溢れないことをスクリーンショットで
       確認して調整済み。 */
    var specimenR = 43 * S;             // DOM: 直径86px(43*2)相当
    var specimenGapX = Math.round(16 * S); // DOM: .hbc-specimens gap 16px
    var stampR = 29 * S;                // DOM: 直径58px(29*2)相当
    var blockHeight =
      GAP_EYEBROW_TOP + eyebrowToFlowerGap +
      flowerSize * 0.86 /* flower本体 */ + GAP_FLOWER_TO_SPECIMENS +
      specimenR * 2 + GAP_SPECIMENS_TO_LABEL + SPECIMEN_LABEL_BLOCK_H /* 標本3点(丸フレーム+2段ラベル) */ + GAP_LABEL_TO_BLESSING +
      blessingLines.length * blessingLH + GAP_BLESSING_TO_STAMP +
      stampR * 2 /* stamp */;
    var topMargin = Math.max(110, (H - blockHeight) / 2);
    var y = topMargin;

    /* eyebrow(両脇に短いヘアライン罫を添えたkicker)。フォント・字間・罫の長さ/間隔は
       DOM側(.hbc-eyebrow font-size 10px・letter-spacing 0.28em・.hbc-eyebrow-rule 20px・
       flex gap 11px)をSで換算(Codex C2)。 */
    ctx.fillStyle = INK_SUB;
    ctx.font = '700 ' + EYEBROW_FONT_SIZE + 'px "Syne", sans-serif';
    try { ctx.letterSpacing = EYEBROW_LETTER_SPACING.toFixed(2) + "px"; } catch (_) {}
    var eyebrowText = "誕生 ・ " + MONTH_LABEL[entry.month];
    var eyebrowWidth = ctx.measureText(eyebrowText).width;
    ctx.fillText(eyebrowText, cx, y);
    try { ctx.letterSpacing = "0px"; } catch (_) {}
    var ruleGap = EYEBROW_RULE_GAP, ruleLen = EYEBROW_RULE_LEN, ruleY = y - Math.round(EYEBROW_FONT_SIZE * 0.36);
    ctx.strokeStyle = "rgba(42,33,24,0.26)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - eyebrowWidth / 2 - ruleGap - ruleLen, ruleY);
    ctx.lineTo(cx - eyebrowWidth / 2 - ruleGap, ruleY);
    ctx.moveTo(cx + eyebrowWidth / 2 + ruleGap, ruleY);
    ctx.lineTo(cx + eyebrowWidth / 2 + ruleGap + ruleLen, ruleY);
    ctx.stroke();
    y += eyebrowToFlowerGap;

    /* 誕生花名 */
    setFlowerFont(flowerSize);
    ctx.fillStyle = INK;
    ctx.fillText(entry.flower.name, cx, y);
    try { ctx.letterSpacing = "0px"; } catch (_) {}
    y += flowerSize * 0.86 + GAP_FLOWER_TO_SPECIMENS;

    /* 標本3点(誕生花・誕生石・誕生色)を同じ大きさの丸フレームで並べる。
       花・石は実写写真(写実は写真に委ねる。読めない月はdrawSpecimenがフレーム輪郭だけを描いて
       静かに続ける)、誕生色はhinaColor.hexのソリッド色見本。3点とも同じ強化枠・
       同じ書式の2段ラベルで同格に揃える。 */
    var specCxL = cx - (specimenR * 2 + specimenGapX);
    var specCxM = cx;
    var specCxR = cx + (specimenR * 2 + specimenGapX);
    var specCy = y + specimenR;
    drawSpecimen(ctx, specCxL, specCy, specimenR, flowerImg, null);
    drawSpecimen(ctx, specCxM, specCy, specimenR, stoneImg, null);
    drawSpecimen(ctx, specCxR, specCy, specimenR, null, entry.hinaColor.hex);
    y += specimenR * 2 + GAP_SPECIMENS_TO_LABEL;

    drawSpecimenLabel(ctx, INK, INK_SUB, specCxL, y, "誕生花", entry.flower.name);
    drawSpecimenLabel(ctx, INK, INK_SUB, specCxM, y, "誕生石", entry.stone.name);
    drawSpecimenLabel(ctx, INK, INK_SUB, specCxR, y, "誕生色", entry.hinaColor.name);
    y += SPECIMEN_LABEL_BLOCK_H;

    /* 便箋の書き出しを示す小さな一点(過剰にしない・祝福文の直前) */
    var dotY = y + DOT_OFFSET;
    ctx.beginPath();
    ctx.arc(cx, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(42,33,24,0.28)";
    ctx.fill();
    y += GAP_LABEL_TO_BLESSING;

    /* 祝福文(このカードの主役) */
    var blessingTop = y;
    ctx.fillStyle = INK;
    ctx.font = 'italic 500 ' + BLESSING_FONT + 'px "EB Garamond", "Shippori Mincho", serif';
    blessingLines.forEach(function (line, i) { ctx.fillText(line, cx, y + i * blessingLH); });
    y = blessingTop + blessingLines.length * blessingLH;

    /* 落款(はんこ)風の月番号スタンプ。控えめに右下(DOM側 .hbc-stamp の
       justify-content:flex-endと対応)。二重リング+月数字(Bebas)・色はインクのサブ調
       (誕生色ではない・淡色でも視認性が揺れないようにする)。リング直径・数字フォント・
       内側リングの inset は DOM側(.hbc-stamp-num=58px・font-size19px・::before inset6px)を
       Sで換算(Codex C2)。 */
    var stampRightMargin = Math.round(40 * S); // DOM: カード右paddingのclamp上限40px相当
    var stampInnerInset = Math.round(6 * S);   // DOM: .hbc-stamp-num::before inset 6px
    var stampCx = W - stampRightMargin - stampR;
    var stampCy = y + GAP_BLESSING_TO_STAMP + stampR;
    ctx.beginPath();
    ctx.arc(stampCx, stampCy, stampR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(42,33,24,0.34)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(stampCx, stampCy, stampR - stampInnerInset, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(42,33,24,0.16)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.textBaseline = "middle";
    ctx.fillStyle = INK;
    ctx.font = '400 ' + STAMP_FONT + 'px "Bebas Neue", sans-serif';
    ctx.fillText(pad2(entry.month), stampCx, stampCy + 3);

    return out;
  }

  /* 誕生花・誕生石の実写、および紙グレイン用のノイズ画像を読み込んでからbuildCardCanvasを呼ぶ。
     画像読込(loadImage/loadGrainImage)は失敗時にnullへ解決するため例外にはならないが、
     drawImage自体が例外を投げる稀なケース(タイント等)に備えてtry/catchし、その場合は
     写真なしで再描画する(PNGは必ず生成される・「読込失敗時はその写真を省いて描く」を徹底する)。 */
  function buildCardCanvasAsync(entry) {
    return Promise.all([
      loadImage(entry.flower && entry.flower.img),
      loadImage(entry.stone && entry.stone.img),
      loadGrainImage()
    ]).then(function (imgs) {
      var images = { flowerImg: imgs[0], stoneImg: imgs[1], grainImg: imgs[2] };
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
    var fFlowerName = container.querySelector('[data-f="flowerName"]');
    var fStoneImg = container.querySelector('[data-f="stoneImg"]');
    var fStoneName = container.querySelector('[data-f="stoneName"]');
    var fFlowerFigure = fFlowerImg ? fFlowerImg.closest(".hbc-specimen") : null;
    var fStoneFigure = fStoneImg ? fStoneImg.closest(".hbc-specimen") : null;
    var fColorSwatch = container.querySelector('[data-f="colorSwatch"]');
    var fColorName = container.querySelector('[data-f="colorName"]');
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

      fEyebrow.textContent = "誕生 ・ " + MONTH_LABEL[month];
      fFlower.textContent = entry.flower.name;
      fitFlowerName(fFlower); /* 長い花名(「チューリップ」等)でも必ず1行に収める */
      /* ラベルの「誕生花」等のタグ文字はcardSectionHtml側に静的に固定済みのため、
         ここでは名前(2段目)だけを書き換える(タグ+半角スペース+名前でfigcaption.textContentが
         「誕生花 チューリップ」のように揃う)。 */
      fFlowerName.textContent = entry.flower.name;
      fStoneName.textContent = entry.stone.name;
      setSpecimenImage(fFlowerImg, fFlowerFigure, entry.flower.img);
      setSpecimenImage(fStoneImg, fStoneFigure, entry.stone.img);
      fColorSwatch.style.background = entry.hinaColor.hex;
      fColorName.textContent = entry.hinaColor.name;
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

    /* 花名1行保証の再計測: fitFlowerNameはrender時に1回走るが、Webフォント(Shippori Mincho)適用前に
       計測されると差し替え後に幅が変わる。またウィンドウ縮小/画面回転でも器の幅が変わる。
       → フォントready後とresizeで現在月の花名を再fitする(detachで解除)。 */
    function refitName() { if (current) fitFlowerName(fFlower); }
    window.addEventListener("resize", refitName);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(refitName, function () {}); }

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
        window.removeEventListener("resize", refitName);
        container.innerHTML = "";
      }
    };
  }

  window.NoctaBirthHina = { mount: mount };
})();
