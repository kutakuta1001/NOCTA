/**
 * NOCTA HiNa — 誕生HiNa: 12ヶ月の贈り物棚
 *
 * 生まれた月を選ぶと、誕生花・誕生石・HiNa誕生色・銀猫の祝福1文を
 * 「標本便箋」の趣の一枚(和紙に留めた贈り物カード)にして見せる。
 * 地は生成りの縦グラデ(#F4EEDF→#EBE2CE)+微細な紙グレイン+内側ヴィネット、
 * 縁は外周ヘアライン+二重の内枠(標本シートの縁)。
 *
 * カードのヒーローは「花紋(かもん)エンブレム」— 誕生花・誕生石・HiNa誕生色の3点を
 * 1つの意匠に融合した手続き生成の紋章(drawEmblem)。外部画像は使わない(Canvas 2D手続き
 * 生成・CORS読込不要)。花(flower.formに応じた花弁の形)を誕生色(hinaColor.hex)で描き、
 * その中心に宝石のファセット(多面体の芯・墨の稜線+白いきらめき)を据え、細い二重
 * ヘアラインの紋枠で囲む。旧・誕生花/誕生石/誕生色を並べた「三点の丸」(実写標本3点)は
 * この1つのエンブレムに統合され撤去した。エンブレムの下には簡潔なラベル1行
 * 「誕生花 ○○ ・ 誕生石 ○○ ・ 誕生色 ○○」を添え、名前情報はここが担う
 * (エンブレム自体はaria-hidden。装飾扱い)。
 * drawEmblem(ctx,cx,cy,r,entry) は DOMの<canvas class="hbc-emblem">とPNG書き出し用
 * オフスクリーンcanvasの両方から同じ関数を呼ぶ(完全一致を関数共有で保証する)。
 *
 * 誕生花名は必ず1行に収める（DOM: white-space:nowrap+実測での自動縮小、
 * Canvas: 自動縮小フォントの下限を低めに取る）。
 * 落款(スタンプ)は月番号の二重リング円のみ（キャラクター表記は持たない）。控えめに右下。
 *
 * 依存: window.HINA_BIRTH（hina-birth-data.js を先に読み込むこと。各エントリの
 *       flower.form が花紋エンブレムの花形カテゴリを指定する）
 * 提供: window.NoctaBirthHina.mount(container) → { detach }
 *
 * ?m=1〜12 で該当月を直接開く。不正・欠落時は今日の月、それも無効なら1月。
 * カードのCSS(.hina-birth-*)は website/hina/index.html 側の<style>で定義する
 * （flora/index.html + hana.js と同じ役割分担: データ描画はJS、見た目はホストページのCSS）。
 *
 * PNG書き出しは花紋エンブレムが手続き生成(外部画像不使用)になったため、誕生花・誕生石の実写
 * 画像読込待ち(CORS依存・失敗フォールバック)は不要になった(旧・実写標本の読込待ちは撤去)。
 * 代わりに紙グレイン(loadGrainImage・ローカルdata URI・タイムアウト1.5秒)とフォント読込
 * (document.fonts.ready・タイムアウト3秒)を待つ(いずれも外部ネットワーク読込ではないため
 * CORS/失敗の心配はなく、待ちはタイムアウトによる固着防止のみが目的。Codex W3)。
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

  /* 花紋エンブレムの「実効半径 ÷ カード幅(380px基準)」の比率。DOMの<canvas class="hbc-emblem">と
     PNG書き出し用オフスクリーンcanvasの両方が、この1つの比率から実効半径を算出する(Codex C1)。
     修正前はDOM側がEMBLEM_CANVAS_R=180(バッキングストア400pxの45%=切れ防止の独自マージンを
     含んだ値)・PNG側がEMBLEM_R=round(69*S)(カード幅380pxの18.16%)という別々の値になっており、
     見た目の実効半径がDOM/PNGで約10%ずれていた。69/380は下記DOM_EMBLEM_BOX_MAXの由来と同じ、
     index.html .hbc-emblem のCSS表示直径上限138px(=69*2)をカード最大幅380pxで割った値。 */
  var EMBLEM_RADIUS_RATIO = 69 / 380;

  /* DOM側<canvas class="hbc-emblem">の実ピクセル(バッキングストア)サイズ。表示サイズは
     index.htmlの.hbc-emblem(width/height:clamp(...)、上限DOM_EMBLEM_BOX_MAX=138px)がCSSで
     縮小表示するため、バッキングストアを表示上限より大きく取ることで簡易的な高解像度描画になる
     (paintEmblemで devicePixelRatio 分をさらに掛けて引き上げる)。EMBLEM_CANVAS_Rは、
     EMBLEM_RADIUS_RATIO(カード幅380px基準の実効半径69px相当)を「バッキングストアPX ÷
     CSS表示上限138px」の比でバッキングストア座標系に変換した値にする。138がちょうど69の2倍
     (=CSSの箱の幅そのものが花紋の直径と等しい設計)のため、この式は常にPXのちょうど半分になり、
     PNG側の比率と厳密に一致する。紋枠の線幅がrをごくわずか(1%未満)超えて描かれるが、
     devicePixelRatio分のバッキングストア拡張とcanvas自体のアンチエイリアスにより視認できない
     (旧180は「切れ防止」のための独自マージンだったが、この差分そのものがC1の原因だったため撤去した)。 */
  var EMBLEM_CANVAS_PX = 400;
  var DOM_EMBLEM_BOX_MAX = 138; // index.html .hbc-emblem width/height clamp(...)の上限値と一致させる
  var EMBLEM_CANVAS_R = Math.round(EMBLEM_RADIUS_RATIO * 380 * (EMBLEM_CANVAS_PX / DOM_EMBLEM_BOX_MAX)); // = 200 = EMBLEM_CANVAS_PX/2

  /* 花紋ラベルの1点分(タグ+名前)。タグ(「誕生花」等)は月に関わらず不変の静的文字列として
     ここに固定し、JS側では名前(data-f)だけを書き換える。タグと名前の間の半角スペース1つは
     見た目上「誕生花 チューリップ」のように読める1単位を作る(.hel-itemでwhite-space:nowrapにし、
     この単位が行の途中で不自然に割れないようにする)。.hel-item自体はaria-hidden化した視覚専用の
     装飾テキストであり、読み上げは親.hbc-emblem-label内の.hel-sr(sr-only・視覚的に隠すが
     読み上げはされる。render()内で月ごとにtextContentを設定)に一本化する(狭幅でflex-wrapが
     2行に折り返しても読み上げ内容が視覚と分岐しないようにするため)。<p>要素自体への
     aria-label付与(旧実装)は一部のスクリーンリーダーで安定して読み上げられずラベルが空扱いに
     なるリスクがあったため撤去し、確実に読み上げられるsr-onlyテキストに一本化した
     (Codex 2周目 W1)。 */
  function emblemLabelItemHtml(tag, nameField) {
    return (
      '<span class="hel-item" aria-hidden="true">' +
        '<span class="hel-tag">' + tag + "</span> " +
        '<span class="hel-name" data-f="' + nameField + '"></span>' +
      "</span>"
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
            '<canvas class="hbc-emblem" data-f="emblem" width="' + EMBLEM_CANVAS_PX + '" height="' + EMBLEM_CANVAS_PX + '" aria-hidden="true"></canvas>' +
            '<p class="hbc-emblem-label" data-f="emblemLabel">' +
              emblemLabelItemHtml("誕生花", "flowerName") +
              '<span class="hel-sep" aria-hidden="true">・</span>' +
              emblemLabelItemHtml("誕生石", "stoneName") +
              '<span class="hel-sep" aria-hidden="true">・</span>' +
              emblemLabelItemHtml("誕生色", "colorName") +
              '<span class="hel-sr sr-only" data-f="emblemLabelSr"></span>' +
            "</p>" +
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
  /* Canvasの基準スケール(Codex C2由来の慣習を継続): DOMのカード基準幅380px : Canvas全体幅
     (1080px)の比率。花紋エンブレム(emblemR)・落款(stampR)・各フォントサイズ・四隅tickは、
     すべてDOM側のCSS実測px値(clampの上限値等)にこのSを掛けて求める。DOM側のサイズを変えれば
     Canvas側も追随する。 */
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
     「紫陽花」「桔梗」「金木犀」等で確認・修正済み)。
     GAP_EYEBROW_TOPはblockHeightの見積りにのみ使う予算枠(実際の描画シーケンスではeyebrowは
     topMarginの位置にそのまま描かれ、この値だけ余分に加算する)。結果としてblockHeightが
     ブロックの実高さよりGAP_EYEBROW_TOP分大きく出るため、topMarginが下限110pxに達した場合でも
     その分だけ下端(落款)の溢れに対する余裕として働く(既存設計からの継続)。 */
  var GAP_EYEBROW_TOP = 36;
  var GAP_FLOWER_TO_EMBLEM = Math.round(26 * S);   // DOM: .hbc-emblem margin-top 26px
  var GAP_EMBLEM_TO_LABEL = Math.round(14 * S);    // DOM: .hbc-emblem-label margin-top 14px
  var GAP_LABEL_TO_BLESSING = 78;
  var DOT_OFFSET = 30;
  var GAP_BLESSING_TO_STAMP = 36;

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
  var EMBLEM_R = Math.round(EMBLEM_RADIUS_RATIO * CANVAS_W); // = round(69*S)と同値。EMBLEM_RADIUS_RATIO(Codex C1)に一本化

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

  /* ==== 花紋エンブレム(drawEmblem) ====
     誕生花(hanaForm)・誕生石(ファセットの芯)・誕生色(hinaColor.hex)を1つの紋章に融合する。
     DOMの<canvas class="hbc-emblem">とPNG書き出し用オフスクリーンcanvasの両方から
     drawEmblem(ctx,cx,cy,r,entry)を呼ぶ(同一関数=完全一致を保証)。 */

  /* RGB(0-255)→HSL([0,1],[0,1],[0,1])。shadeHexが明度(L)だけを動かして色相/彩度を保つために使う。 */
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToRgb(h, s, l) {
    if (s === 0) {
      var v = Math.round(l * 255);
      return [v, v, v];
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    ];
  }

  /* hex(#RRGGBB)の明度(L)だけをamt分動かした(amt>0で白へ・amt<0で黒へ)'rgb(...)'文字列を返す。
     色相・彩度はHSLで固定して保つ(RGB各チャンネルを直接ブレンドする素朴な実装では、桜色
     #FEF4F4のような「白に近いが彩度は高い」淡色を暗くすると彩度が失われグレーに褪せてしまう
     不具合があったため、HSL経由に変更した)。花弁の濃淡(中心/縁の立体感)・宝石の淡い
     クリスタル色を作るのに使う。 */
  function shadeHex(hex, amt) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex));
    var n = m ? parseInt(m[1], 16) : 0x7a6f5e;
    var hsl = rgbToHsl((n >> 16) & 255, (n >> 8) & 255, n & 255);
    var l = amt >= 0 ? hsl[2] + (1 - hsl[2]) * amt : hsl[2] * (1 + amt);
    l = Math.max(0, Math.min(1, l));
    var rgb = hslToRgb(hsl[0], hsl[1], l);
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
  }

  /* 相対輝度(0=黒〜1=白)。花弁の濃淡方向・輪郭線の色(墨か白かの選択)を輝度で切り替える。 */
  function hexLuminance(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex));
    var n = m ? parseInt(m[1], 16) : 0x7a6f5e;
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }

  /* 花弁1枚の輪郭パスをローカル座標(基部=原点(0,0)・先端=(0,-len))に作る。tipで先端の形を
     切り替える: "point"=尖り(水仙・チューリップ・藤・シクラメン・ひまわり・菊等)/
     "round"=丸み(蓮の八重)/"notch"=浅い切れ込み(桜・梅・紫陽花・金木犀の小花)。 */
  function petalPath(ctx, len, halfW, midT, tip) {
    var w = halfW, my = -len * midT;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(w * 1.08, my * 0.45, w, my);
    if (tip === "notch") {
      var n = w * 0.16;
      ctx.quadraticCurveTo(w * 0.6, -len * 0.92, n, -len);
      ctx.lineTo(-n, -len);
      ctx.quadraticCurveTo(-w * 0.6, -len * 0.92, -w, my);
    } else if (tip === "round") {
      ctx.quadraticCurveTo(w * 0.92, -len * 1.02, 0, -len * 1.03);
      ctx.quadraticCurveTo(-w * 0.92, -len * 1.02, -w, my);
    } else {
      ctx.quadraticCurveTo(w * 0.32, -len * 0.985, 0, -len);
      ctx.quadraticCurveTo(-w * 0.32, -len * 0.985, -w, my);
    }
    ctx.quadraticCurveTo(-w * 1.08, my * 0.45, 0, 0);
    ctx.closePath();
  }

  /* 花弁1枚を(cx,cy)を基部にrotRad回転させて描く(先端方向=ローカルの-y=rot0で真上)。
     塗りは基部(colorNear)→先端(colorFar)の線形グラデ(中心/縁の濃淡で立体感)。 */
  function drawPetal(ctx, cx, cy, rotRad, len, halfW, midT, tip, colorNear, colorFar, strokeStyle, lineWidth) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotRad);
    petalPath(ctx, len, halfW, midT, tip);
    var grad = ctx.createLinearGradient(0, 0, 0, -len);
    grad.addColorStop(0, colorNear);
    grad.addColorStop(1, colorFar);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  /* count枚の花弁を(cx,cy)を中心に等間隔リング状に描く(rot0=先頭の花弁の向き)。 */
  function drawPetalRing(ctx, cx, cy, count, rot0, len, halfWFactor, midT, tip, colorNear, colorFar, strokeStyle, lineWidth) {
    var halfW = len * halfWFactor;
    for (var i = 0; i < count; i++) {
      drawPetal(ctx, cx, cy, rot0 + (i * Math.PI * 2) / count, len, halfW, midT, tip, colorNear, colorFar, strokeStyle, lineWidth);
    }
  }

  /* 花形カテゴリ(flower.form)ごとの花弁レイアウト。layers=1つの花に重ねる花弁の層
     (2層は八重・チューリップのカップ状を表す。lightenで内層をわずかに明るくし奥行きを出す)。
     cluster=中心の周りに小花が環になったクラスター(梅・紫陽花・金木犀=「clustered small
     blossoms」。1つの大花ではなく複数の小さな花で構成する形)。 */
  var HANA_FORMS = {
    star: { layers: [{ count: 6, len: 0.80, w: 0.15, midT: 0.42, tip: "point" }] },
    tulip: { layers: [
      { count: 3, rot: 0, len: 0.78, w: 0.24, midT: 0.80, tip: "point" },
      { count: 3, rot: Math.PI / 3, len: 0.64, w: 0.22, midT: 0.80, tip: "point", lighten: 0.10 }
    ] },
    sakura: { layers: [{ count: 5, len: 0.80, w: 0.44, midT: 0.55, tip: "notch" }] },
    bell: { layers: [{ count: 5, len: 0.88, w: 0.15, midT: 0.62, tip: "point" }] },
    layered: { layers: [
      { count: 8, rot: 0, len: 0.80, w: 0.30, midT: 0.50, tip: "round" },
      { count: 8, rot: Math.PI / 8, len: 0.56, w: 0.27, midT: 0.50, tip: "round", lighten: 0.10 }
    ] },
    kiku: { layers: [{ count: 16, len: 0.84, w: 0.045, midT: 0.30, tip: "point" }] },
    komori: { cluster: true, count: 6, ringR: 0.54, floretLen: 0.30, petals: 4, w: 0.55, midT: 0.55, tip: "notch" }
  };

  /* 花紋の花(flower.form)を(cx,cy)中心・半径r相当のスケールで描く。誕生色(hex)そのものを
     花弁の色に使い(石の色ではなく)、輝度に応じて濃淡方向(中心濃→縁淡・暗い誕生色は逆)と
     輪郭線色(明るい花は墨・暗い花は縁を淡く起こす)を切り替える。 */
  function renderHanaForm(ctx, cx, cy, r, formKey, hex) {
    var spec = HANA_FORMS[formKey] || HANA_FORMS.sakura;
    var lum = hexLuminance(hex);
    var nearAmt = lum < 0.35 ? 0.22 : -0.24;
    var farAmt = lum < 0.35 ? 0 : 0.10;
    var strokeStyle = lum > 0.55 ? "rgba(42,33,24,0.30)" : "rgba(255,253,247,0.24)";
    var lineWidth = Math.max(1, r * 0.014);

    if (spec.cluster) {
      for (var i = 0; i < spec.count; i++) {
        var ang = (i * Math.PI * 2) / spec.count;
        drawPetalRing(
          ctx, cx + Math.cos(ang) * r * spec.ringR, cy + Math.sin(ang) * r * spec.ringR,
          spec.petals, ang + Math.PI / 2, r * spec.floretLen, spec.w, spec.midT, spec.tip,
          shadeHex(hex, nearAmt), shadeHex(hex, farAmt), strokeStyle, lineWidth * 0.75
        );
      }
      return;
    }
    spec.layers.forEach(function (layer) {
      var add = layer.lighten || 0;
      drawPetalRing(
        ctx, cx, cy, layer.count, layer.rot || 0, r * layer.len, layer.w, layer.midT, layer.tip,
        shadeHex(hex, nearAmt + add), shadeHex(hex, farAmt + add), strokeStyle, lineWidth
      );
    });
  }

  /* 花紋の芯=宝石のファセット。誕生石ごとの厳密な形は問わず、六角のテーブル面+クラウン
     ファセット(三角×6・交互に濃淡)+一点のハイライトで「宝石らしさ」を統一して表す。
     誕生色に染めず淡いクリスタル色に留める(誕生色+墨線+芯の静かな配色を保つ)。 */
  function drawGemCore(ctx, cx, cy, rGem) {
    ctx.save();
    ctx.translate(cx, cy);
    var sides = 6, tableR = rGem * 0.46, crownR = rGem;
    var tablePts = [], crownPts = [], i, a0, a1;
    for (i = 0; i < sides; i++) {
      a0 = -Math.PI / 2 + (i * Math.PI * 2) / sides;
      tablePts.push([Math.cos(a0) * tableR, Math.sin(a0) * tableR]);
      a1 = a0 + Math.PI / sides;
      crownPts.push([Math.cos(a1) * crownR, Math.sin(a1) * crownR]);
    }
    ctx.beginPath();
    ctx.arc(0, 0, rGem * 1.3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(42,33,24,0.30)";
    ctx.lineWidth = Math.max(1, rGem * 0.05);
    ctx.stroke();
    for (i = 0; i < sides; i++) {
      var t0 = tablePts[i], t1 = tablePts[(i + 1) % sides], c0 = crownPts[i];
      ctx.beginPath();
      ctx.moveTo(t0[0], t0[1]);
      ctx.lineTo(c0[0], c0[1]);
      ctx.lineTo(t1[0], t1[1]);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.58)" : "rgba(226,225,230,0.36)";
      ctx.fill();
      ctx.strokeStyle = "rgba(42,33,24,0.26)";
      ctx.lineWidth = Math.max(0.6, rGem * 0.022);
      ctx.stroke();
    }
    ctx.beginPath();
    tablePts.forEach(function (p, idx) { idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); });
    ctx.closePath();
    var g = ctx.createLinearGradient(-tableR, -tableR, tableR, tableR);
    g.addColorStop(0, "rgba(255,255,255,0.92)");
    g.addColorStop(1, "rgba(220,220,227,0.42)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(42,33,24,0.36)";
    ctx.lineWidth = Math.max(0.7, rGem * 0.026);
    ctx.stroke();
    ctx.save();
    ctx.translate(-tableR * 0.32, -tableR * 0.4);
    ctx.rotate(-0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, tableR * 0.24, tableR * 0.11, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  /* 紋枠 — 細い二重ヘアラインの円(カードの二重内枠と同じ精緻さ)。
     外周リングは渡された半径rそのものではなく、r内側に収まる半径(outerR)に描く
     (Codex 2周目 W2)。DOM側の呼び出し(paintEmblem)ではr=EMBLEM_CANVAS_R*dprが
     canvasバッキングストアの半分の幅=キャンバス境界そのものと一致するため、r上に
     ストロークを描くとその外側半分が必ずcanvas境界でクリップされていた(PNG側は
     十分大きいcanvas内に描くためクリップされず、DOM/PNGで外枠線の見え幅に微差が
     生じていた)。outerRを「outerRの外側半分+outerR自体が確実にr以内に収まる」
     半径(= r - ceil(lineWidth/2) - 1px)にすることで、rが実際のcanvas境界と一致する
     DOMでもクリップされなくなる。PNG側も同じ関数を通るため同一比率で縮み、
     DOM/PNGの一致(Codex C1)は保ったまま解消する。r自体(EMBLEM_RADIUS_RATIO由来の
     実効半径)は変えない — 花弁(renderHanaForm)・宝石芯(drawGemCore)はrをそのまま使う。 */
  function drawMonFrame(ctx, cx, cy, r) {
    ctx.save();
    var outerLineWidth = Math.max(1, r * 0.012);
    var outerR = r - Math.ceil(outerLineWidth / 2) - 1;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(42,33,24,0.28)";
    ctx.lineWidth = outerLineWidth;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, outerR * 0.955, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(42,33,24,0.20)";
    ctx.lineWidth = Math.max(1, r * 0.008);
    ctx.stroke();
    ctx.restore();
  }

  /* 花紋エンブレム本体 — 紋枠(円)→花(誕生色)→芯(宝石ファセット)の順に(cx,cy)半径rへ描く。
     DOMの<canvas class="hbc-emblem">とPNG書き出しcanvasの両方がこの1関数を呼ぶ。 */
  var EMBLEM_GEM_RATIO = 0.30; // 芯(宝石)の半径 = r * この比率
  function drawEmblem(ctx, cx, cy, r, entry) {
    var form = (entry && entry.flower && entry.flower.form) || "sakura";
    var hex = (entry && entry.hinaColor && entry.hinaColor.hex) || "#7A6F5E";
    ctx.save();
    drawMonFrame(ctx, cx, cy, r);
    renderHanaForm(ctx, cx, cy, r * 0.88, form, hex);
    drawGemCore(ctx, cx, cy, r * EMBLEM_GEM_RATIO);
    ctx.restore();
  }

  /* エンブレム下のラベル1行(「誕生花 ○○ ・ 誕生石 ○○ ・ 誕生色 ○○」)をCanvasに描く。
     DOM側 .hbc-emblem-label(.hel-tag/.hel-name/.hel-sep)と書式(タグ=Syne細字・名前=Shippori・
     セパレータ=中黒)を揃える。Canvas(1080px幅)は十分広いため折り返しはせず1行で描く。 */
  var EMBLEM_LABEL_TAG_SIZE = Math.round(8 * S);    // DOM: .hel-tag font-size 8px
  var EMBLEM_LABEL_NAME_SIZE = Math.round(11 * S);  // DOM: .hel-name font-size 11px
  var EMBLEM_LABEL_TAG_FONT = '700 ' + EMBLEM_LABEL_TAG_SIZE + 'px "Syne", sans-serif';
  var EMBLEM_LABEL_NAME_FONT = '600 ' + EMBLEM_LABEL_NAME_SIZE + 'px "Shippori Mincho", "Noto Sans JP", serif';
  var EMBLEM_LABEL_SEP_FONT = '400 ' + EMBLEM_LABEL_NAME_SIZE + 'px "Noto Sans JP", sans-serif';
  var EMBLEM_LABEL_LH = Math.round(EMBLEM_LABEL_NAME_SIZE * 1.5);
  var EMBLEM_LABEL_TAG_GAP = Math.round(4 * S);  // タグ→名前の間隔(DOM: 半角スペース1つ相当)
  var EMBLEM_LABEL_SEP_GAP = Math.round(5 * S);  // ・の左右の間隔(DOM: .hbc-emblem-label gap 5px)

  function drawEmblemLabel(ctx, INK, INK_SUB, cx, baselineY, entry) {
    var segs = [
      { text: "誕生花", font: EMBLEM_LABEL_TAG_FONT, color: INK_SUB, gapAfter: EMBLEM_LABEL_TAG_GAP },
      { text: entry.flower.name, font: EMBLEM_LABEL_NAME_FONT, color: INK, gapAfter: EMBLEM_LABEL_SEP_GAP },
      { text: "・", font: EMBLEM_LABEL_SEP_FONT, color: INK_SUB, gapAfter: EMBLEM_LABEL_SEP_GAP },
      { text: "誕生石", font: EMBLEM_LABEL_TAG_FONT, color: INK_SUB, gapAfter: EMBLEM_LABEL_TAG_GAP },
      { text: entry.stone.name, font: EMBLEM_LABEL_NAME_FONT, color: INK, gapAfter: EMBLEM_LABEL_SEP_GAP },
      { text: "・", font: EMBLEM_LABEL_SEP_FONT, color: INK_SUB, gapAfter: EMBLEM_LABEL_SEP_GAP },
      { text: "誕生色", font: EMBLEM_LABEL_TAG_FONT, color: INK_SUB, gapAfter: EMBLEM_LABEL_TAG_GAP },
      { text: entry.hinaColor.name, font: EMBLEM_LABEL_NAME_FONT, color: INK, gapAfter: 0 }
    ];
    var widths = segs.map(function (s) {
      ctx.font = s.font;
      return ctx.measureText(s.text).width;
    });
    var total = widths.reduce(function (sum, w, idx) { return sum + w + segs[idx].gapAfter; }, 0);
    var x = cx - total / 2;
    var prevAlign = ctx.textAlign;
    ctx.textAlign = "left";
    segs.forEach(function (s, idx) {
      ctx.font = s.font;
      ctx.fillStyle = s.color;
      ctx.fillText(s.text, x, baselineY);
      x += widths[idx] + s.gapAfter;
    });
    ctx.textAlign = prevAlign;
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
     kicker付きeyebrow→花名→花紋エンブレム→ラベル1行→点+祝福→落款)。
     images省略時(または紙グレイン画像未読込)でも描画を続ける(呼び出し側はbuildCardCanvasAsyncを使うこと)。 */
  function buildCardCanvas(entry, images) {
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
       花紋エンブレム(EMBLEM_R)は1つの丸として積み上げ、その下にラベル1行(EMBLEM_LABEL_LH)を
       続ける。全12ヶ月・最長の花名+石名の組(3月「チューリップ」+「アクアマリン」)+3行祝福文の
       組み合わせでも下端(落款)が溢れないことをスクリーンショットで確認して調整済み。 */
    var stampR = 29 * S;                // DOM: 直径58px(29*2)相当
    var blockHeight =
      GAP_EYEBROW_TOP + eyebrowToFlowerGap +
      flowerSize * 0.86 /* flower本体 */ + GAP_FLOWER_TO_EMBLEM +
      EMBLEM_R * 2 + GAP_EMBLEM_TO_LABEL + EMBLEM_LABEL_LH /* 花紋エンブレム+ラベル1行 */ + GAP_LABEL_TO_BLESSING +
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
    y += flowerSize * 0.86 + GAP_FLOWER_TO_EMBLEM;

    /* 花紋エンブレム(誕生花×誕生石×誕生色の融合紋章)。DOMの<canvas class="hbc-emblem">と
       同じdrawEmblem(ctx,cx,cy,r,entry)を呼ぶ(完全一致)。 */
    var emblemCy = y + EMBLEM_R;
    drawEmblem(ctx, cx, emblemCy, EMBLEM_R, entry);
    y += EMBLEM_R * 2 + GAP_EMBLEM_TO_LABEL;

    /* エンブレム下のラベル1行(「誕生花 ○○ ・ 誕生石 ○○ ・ 誕生色 ○○」) */
    drawEmblemLabel(ctx, INK, INK_SUB, cx, y + EMBLEM_LABEL_LH * 0.78, entry);
    y += EMBLEM_LABEL_LH;

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

  /* 紙グレイン用のノイズ画像(ローカルdata URI・CORS不要)を読み込んでからbuildCardCanvasを呼ぶ。
     花紋エンブレムは手続き生成(外部画像不使用)になったため、誕生花・誕生石の実写読込待ちは
     不要になった(PNG書き出しはこのグレイン読込+フォント読込のみで完結する)。
     loadGrainImageは失敗時にnullへ解決するため例外にはならないが、drawImage自体が例外を
     投げる稀なケースに備えてtry/catchし、その場合はグレインなしで再描画する
     (PNGは必ず生成される)。 */
  function buildCardCanvasAsync(entry) {
    return loadGrainImage().then(function (grainImg) {
      var images = { grainImg: grainImg };
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

  /* フォント読み込み完了→canvas描画→toBlob→objectURLでダウンロードの順に行う。
     toDataURL(同期・メインスレッドをブロック)ではなくtoBlob+URL.createObjectURLを使う。
     花紋エンブレムは手続き生成(外部画像不使用)のためCORS/taint系の失敗要因は基本的に
     無くなったが、toBlob自体が何らかの理由で失敗(null/例外)した場合に備え、1度だけ
     再描画(buildCardCanvas(entry,null))して再度toBlobを試す簡易リトライを残す。
     それでも失敗した場合のみresolve(false)にとどめ、例外を外に漏らさない
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
    var fEmblemCanvas = container.querySelector('[data-f="emblem"]');
    var fEmblemLabelSr = container.querySelector('[data-f="emblemLabelSr"]');
    var fFlowerName = container.querySelector('[data-f="flowerName"]');
    var fStoneName = container.querySelector('[data-f="stoneName"]');
    var fColorName = container.querySelector('[data-f="colorName"]');
    var fBlessing = container.querySelector('[data-f="blessing"]');
    var fStampNum = container.querySelector('[data-f="stampNum"]');

    var current = null;

    /* 花紋エンブレムをDOMの<canvas class="hbc-emblem">に描く。PNG書き出し(buildCardCanvas)と
       同じdrawEmblem(ctx,cx,cy,r,entry)を呼び、rとバッキングストアPXの比(EMBLEM_CANVAS_R/
       EMBLEM_CANVAS_PX=0.5)をPNG側の比率(EMBLEM_RADIUS_RATIO)と揃えることでDOM≡PNGの
       実効半径の一致を保証する(Codex C1)。devicePixelRatio(上限2倍・過剰なバッキングストア
       肥大を避ける)分だけバッキングストアを追加拡張して高DPI環境での鮮明さを上げるが、
       rとPXに同じdprを掛けるためこの比は変わらず一致は崩れない。 */
    function paintEmblem(entry) {
      if (!fEmblemCanvas) return;
      var ctx = fEmblemCanvas.getContext && fEmblemCanvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var px = Math.round(EMBLEM_CANVAS_PX * dpr);
      if (fEmblemCanvas.width !== px || fEmblemCanvas.height !== px) {
        fEmblemCanvas.width = px;
        fEmblemCanvas.height = px;
      }
      ctx.clearRect(0, 0, px, px);
      drawEmblem(ctx, px / 2, px / 2, EMBLEM_CANVAS_R * dpr, entry);
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
         ここでは名前だけを書き換える(タグ+半角スペース+名前でhbc-emblem-label.textContentが
         「誕生花 チューリップ」のように揃う)。 */
      fFlowerName.textContent = entry.flower.name;
      fStoneName.textContent = entry.stone.name;
      fColorName.textContent = entry.hinaColor.name;
      /* 視覚上の子要素(.hel-item)はaria-hidden化しているため、読み上げ用の完全な文言
         (「誕生花 ○○・誕生石 ○○・誕生色 ○○」)は.hel-sr(sr-only・視覚的に隠すが読み上げは
         される)のtextContentとして設定する。<p>自身へのaria-label付与(旧実装)は一部の
         スクリーンリーダーで安定して読み上げられずラベルが空扱いになるリスクがあったため
         撤去した。狭幅でflex-wrapが2行に折り返しても、読み上げは常にこの1本のsr-onlyテキストで
         一貫する(Codex 2周目 W1)。 */
      if (fEmblemLabelSr) {
        fEmblemLabelSr.textContent =
          "誕生花 " + entry.flower.name + "・誕生石 " + entry.stone.name + "・誕生色 " + entry.hinaColor.name;
      }
      paintEmblem(entry);
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
       renderCanvas()は紙グレイン画像の読込を待つ必要があるためPromiseを返す(呼び出し側でawaitする)。
       emblemRatio()はDOM側(EMBLEM_CANVAS_R/EMBLEM_CANVAS_PX)とPNG側(EMBLEM_R/CANVAS_W)の
       実効半径比率を読み取り専用で返す(Codex C1の回帰検証用。両者が厳密に一致することを
       テストで確認できるようにする)。 */
    window.__hinaBirth = {
      current: function () { return current; },
      selectMonth: function (m) { selectMonth(m); },
      save: function () { return current ? triggerDownload(current) : Promise.resolve(false); },
      renderCanvas: function () { return current ? buildCardCanvasAsync(current) : Promise.resolve(null); },
      emblemRatio: function () {
        /* domEffectiveRatio/pngEffectiveRatioは、いずれも「表示上の実効半径 ÷ カード幅380px」に
           正規化した値(=EMBLEM_RADIUS_RATIOに一致するはずの値)。単位が異なるEMBLEM_CANVAS_R
           (バッキングストア座標)とEMBLEM_R(PNGキャンバス座標)を直接比較すると単位不一致になるため、
           それぞれ自身の基準幅(DOM_EMBLEM_BOX_MAX=138px / CANVAS_W=カード380px相当)で
           正規化してから比較する。 */
        return {
          targetRatio: EMBLEM_RADIUS_RATIO,
          domEffectiveRatio: (EMBLEM_CANVAS_R / EMBLEM_CANVAS_PX) * (DOM_EMBLEM_BOX_MAX / 380),
          pngEffectiveRatio: EMBLEM_R / CANVAS_W
        };
      }
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
