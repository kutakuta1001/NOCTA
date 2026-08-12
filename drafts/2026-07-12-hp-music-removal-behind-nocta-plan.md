# NOCTA HP Music撤去 + Behind NOCTA 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 未完成のミュージック紹介(PORTFOLIO セクション)を撤去して足あと装飾帯に置き換え、フッター直前に AI エージェントチームのミニマルなクレジット(Behind NOCTA)を新設する。

**Architecture:** website/index.html 単一ファイルの編集のみ。works-data.js はファイルとして残すが読み込みを外す。JA/EN の i18n 辞書(index.html 内の I18N オブジェクト)も同時更新する。

**Tech Stack:** 静的 HTML + Tailwind CSS(CDN)+ Vanilla JS。自動テストはないため、grep 検証・inline script 構文チェック・ローカルサーバー目視で代替する。

## Global Constraints

- 対象ファイルは `website/index.html` のみ。works-data.js は編集も削除もしない
- パスはすべて相対パス(website/CLAUDE.md 規則)
- 既存セクションのデザイン(クラス・トーン)は変えない。新規装飾は導入しない
- コミットは `website/` 以下のファイルのみ git add する。push は CEO 承認後のみ
- 絵文字はコード・コメントに使わない
- 行番号は編集により変動するため、必ず一意な文字列でマッチさせる(Edit の old_string)

---

### Task 1: PORTFOLIO セクションを足あとトランジション帯に置換

**Files:**
- Modify: `website/index.html`(セクション `<section id="works"` 758〜791行付近)

**Interfaces:**
- Produces: `.paw-trail` を持つ装飾帯(既存 JS の IntersectionObserver `document.querySelectorAll('.paw-trail, .cat-scene')` が in-view クラスを付与しアニメーションが発火する — JS 変更不要)

- [ ] **Step 1: セクション全体を置換する**

`<!-- =============================================\n     03. WORKS / PORTFOLIO` のコメントから `</section>`(791行、直後に `04. TOOLS` コメントが続く)までを、以下に置換:

```html
<!-- =============================================
     03. PAW TRAIL TRANSITION（Statement → Tools の場面転換・楽曲リリース時に PORTFOLIO を復活予定）
     ============================================= -->
<div class="relative z-10 bg-black/30 border-y border-white/5 overflow-hidden" aria-hidden="true">
    <div class="paw-trail relative max-w-[1200px] mx-auto h-[110px]" style="--paw-dur:1.8s;">
        <span class="paw" style="left:4%;  top:18%; width:40px; transform:rotate(-14deg);"><svg class="paw-svg" viewBox="0 0 100 100" style="color:#CC5B4A; animation-delay:0s"><use href="#cat-paw" filter="url(#watercolor)"/></svg></span>
        <span class="paw" style="left:20%; top:52%; width:36px; transform:rotate(10deg);"><svg class="paw-svg" viewBox="0 0 100 100" style="color:#D9A441; animation-delay:.5s"><use href="#cat-paw" filter="url(#watercolor)"/></svg></span>
        <span class="paw" style="left:36%; top:22%; width:38px; transform:rotate(-6deg);"><svg class="paw-svg" viewBox="0 0 100 100" style="color:#5586BE; animation-delay:1s"><use href="#cat-paw" filter="url(#watercolor)"/></svg></span>
        <span class="paw" style="left:52%; top:50%; width:36px; transform:rotate(12deg);"><svg class="paw-svg" viewBox="0 0 100 100" style="color:#9472B8; animation-delay:1.5s"><use href="#cat-paw" filter="url(#watercolor)"/></svg></span>
        <span class="paw" style="left:68%; top:20%; width:38px; transform:rotate(-9deg);"><svg class="paw-svg" viewBox="0 0 100 100" style="color:#4FA597; animation-delay:2s"><use href="#cat-paw" filter="url(#watercolor)"/></svg></span>
        <span class="paw" style="left:84%; top:48%; width:40px; transform:rotate(8deg);"><svg class="paw-svg" viewBox="0 0 100 100" style="color:#CC5B4A; animation-delay:2.5s"><use href="#cat-paw" filter="url(#watercolor)"/></svg></span>
    </div>
</div>
```

設計意図: 足あと6個(5色・watercolor フィルタ・0.5s 刻みの歩行ディレイ)を左から右へ再配置。bg-black/30 border-y は旧セクションのトーンを踏襲。id="works" は持たせない。

- [ ] **Step 2: 置換結果を確認**

Run: `grep -c 'id="works"' website/index.html`
Expected: `0`

Run: `grep -c 'cat-paw' website/index.html`
Expected: `9` 以上(symbol 定義1 + statement 用 + 新しい帯の6個。減っていないこと)

### Task 2: 導線整理(ナビ・Hero CTA・フッター・統計バー・CSS)

**Files:**
- Modify: `website/index.html`(ナビ 477/506行付近・Hero CTA 580行付近・統計バー 593〜611行付近・フッター 1050行付近・CSS 255〜267行付近)

**Interfaces:**
- Consumes: なし(Task 1 と独立)
- Produces: `#works` への参照ゼロの状態。Task 3 の i18n 更新が前提とするキー(hero.cta.works / footer.s1)は HTML 側で維持

- [ ] **Step 1: デスクトップナビから Works リンクを削除**

削除する行:
```html
                <a href="#works"    class="text-brand-sub hover:text-white transition-colors duration-300">Works</a>
```

- [ ] **Step 2: モバイルメニューから Works リンクを削除**

削除する行:
```html
            <a href="#works"    class="text-brand-sub hover:text-white transition-colors">Works</a>
```

- [ ] **Step 3: Hero CTA のリンク先と文言を変更**

変更前:
```html
                <a href="#works"   class="btn-primary-cta" data-i18n="hero.cta.works">Works を見る</a>
```
変更後:
```html
                <a href="#visual"  class="btn-primary-cta" data-i18n="hero.cta.works">作品を見る</a>
```

- [ ] **Step 4: 統計バーを3カラム化**

変更前(グリッド開始行):
```html
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
```
変更後:
```html
        <div class="grid grid-cols-3 gap-8 text-center">
```

続けて「楽曲数」ブロック(4行)を削除:
```html
            <div class="reveal">
                <div class="stat-num" id="stat-works">—</div>
                <div class="font-jp text-[11px] text-brand-sub mt-1 tracking-wider" data-i18n="stats.works">楽曲数</div>
            </div>
```

残り3ブロックの reveal ディレイを繰り上げる: ビジュアル数の `reveal reveal-delay-1` を `reveal` に、ブログ数の `reveal reveal-delay-2` を `reveal reveal-delay-1` に、アプリ数の `reveal reveal-delay-3` を `reveal reveal-delay-2` に変更。

- [ ] **Step 5: フッターの「音楽」をリンクなしテキストに変更**

変更前:
```html
                    <a href="#works"  class="hover:text-white transition-colors duration-200" data-i18n="footer.s1">音楽</a>
```
変更後:
```html
                    <span class="text-brand-sub/60" data-i18n="footer.s1">音楽（Coming Soon）</span>
```

- [ ] **Step 6: 未使用になる .filter-pill CSS を削除**

削除するブロック(256〜268行の実物・確認済み):
```css
        /* Filter pill */
        .filter-pill {
            padding: 9px 22px; border-radius: 9999px;
            font-family: 'Syne', sans-serif;
            font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
            cursor: pointer; transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            color: #9A8A7A; background: transparent;
        }
        .filter-pill:hover, .filter-pill.active {
            background: #B8B4AE; color: #0A0906;
            border-color: #B8B4AE;
            box-shadow: 0 0 28px rgba(184,180,174,0.55);
        }
```

続けて、直後のコメント行も `.filter-pill` への参照を含むため書き換える。

変更前:
```css
        /* Visual フィルターピル（Works の .filter-pill と独立） */
```
変更後:
```css
        /* Visual フィルターピル */
```

`.vfilter-pill` の宣言本体(270〜288行)は**削除しない**。

- [ ] **Step 7: 参照ゼロを確認**

Run: `grep -n '#works' website/index.html`
Expected: 出力なし

Run: `grep -nE '[^v]filter-pill' website/index.html`
Expected: 出力なし(vfilter-pill のみ残る)

### Task 3: works 関連 JS の削除と i18n 辞書の更新

**Files:**
- Modify: `website/index.html`(script タグ 1176行付近・setCount 1189行付近・works 描画 IIFE 1284〜1359行付近・I18N 辞書 1732〜1817行付近)

**Interfaces:**
- Consumes: Task 2 が HTML 側の data-i18n キーを維持していること
- Produces: NOCTA_WORKS / stat-works への参照ゼロ。I18N 辞書の整合(HTML の data-i18n キーと辞書キーが一致)

- [ ] **Step 1: works-data.js の script タグを削除**

削除する行:
```html
<script src="works-data.js"></script>
```

- [ ] **Step 2: 統計カウントから stat-works を削除**

削除する行:
```js
        setCount('stat-works', typeof NOCTA_WORKS !== 'undefined' ? NOCTA_WORKS.length : null);
```

- [ ] **Step 3: works 描画・フィルタ IIFE を丸ごと削除**

`/* ---- Works: データ配列からカードをレンダリング ---- */` のコメント行から、フィルタ処理を閉じる `})();`(直後に `/* ---- Visual: データ配列からカードをレンダリング ---- */` が続く)までを削除する。Visual 用 IIFE は削除しない。

- [ ] **Step 4: I18N 辞書(ja)を更新**

削除する行:
```js
    'stats.works': '楽曲数',
```
```js
    'works.subtitle': 'AIと感性が生んだ、作品たち',
```
変更前:
```js
    'hero.cta.works': 'Works を見る',
```
変更後:
```js
    'hero.cta.works': '作品を見る',
```
変更前:
```js
    'footer.s1': '音楽', 'footer.s2': '映像・ビジュアル', 'footer.s3': '言葉・ブログ', 'footer.s4': 'アプリ・ツール',
```
変更後:
```js
    'footer.s1': '音楽（Coming Soon）', 'footer.s2': '映像・ビジュアル', 'footer.s3': '言葉・ブログ', 'footer.s4': 'アプリ・ツール',
```

- [ ] **Step 5: I18N 辞書(en)を更新**

削除する行:
```js
    'stats.works': 'Tracks',
```
```js
    'works.subtitle': 'Works born from AI and human creativity.',
```
変更前:
```js
    'footer.s1': 'Music', 'footer.s2': 'Visual', 'footer.s3': 'Words', 'footer.s4': 'Code',
```
変更後:
```js
    'footer.s1': 'Music (Coming Soon)', 'footer.s2': 'Visual', 'footer.s3': 'Words', 'footer.s4': 'Code',
```
注意: en の `'hero.cta.works': 'View Works',` は変更しない。

- [ ] **Step 6: 参照ゼロを確認**

Run: `grep -n 'NOCTA_WORKS\|stat-works\|works-data\|works.subtitle\|stats.works' website/index.html`
Expected: 出力なし

### Task 4: BEHIND NOCTA セクションの新設

**Files:**
- Modify: `website/index.html`(Contact セクション終了 1019行付近の直後・paw-divider の手前 / I18N 辞書 ja・en 両方)

**Interfaces:**
- Consumes: 既存の `.reveal` IntersectionObserver・`.section-tag` CSS・font-heading/font-jp クラス(すべて既存・変更不要)
- Produces: 新規 i18n キー behind.tag / behind.lead / behind.design.name / behind.design.desc / behind.consult.name / behind.consult.desc

- [ ] **Step 1: セクション HTML を挿入**

Contact セクションの閉じタグ `</section>` と `<!-- =============================================\n     FOOTER` コメントの間に挿入:

```html
<!-- =============================================
     09. BEHIND NOCTA（支えるチーム）
     ============================================= -->
<section class="relative z-10 border-t border-white/5 bg-white/[0.02] py-20">
    <div class="max-w-[760px] mx-auto px-6 lg:px-8 text-center">
        <p class="section-tag reveal" data-i18n="behind.tag">Behind NOCTA</p>
        <p class="font-jp text-brand-sub text-[14px] leading-relaxed mb-12 reveal" data-i18n="behind.lead">
            このプロジェクトは、CEO と、ローカル環境で働く AI エージェントチームが支えています。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-10 text-left max-w-[640px] mx-auto">
            <div class="reveal">
                <div class="font-heading font-bold text-[12px] tracking-[3px] uppercase text-white mb-2" data-i18n="behind.design.name">デザイナーチーム — 3 agents</div>
                <p class="font-jp text-[13px] text-brand-sub leading-relaxed mb-3" data-i18n="behind.design.desc">設計・実装の競作</p>
                <p class="text-[10px] tracking-wide text-white/25" style="font-family:'SF Mono',Menlo,monospace;">manual: ~/designer/CLAUDE.md</p>
            </div>
            <div class="reveal reveal-delay-1">
                <div class="font-heading font-bold text-[12px] tracking-[3px] uppercase text-white mb-2" data-i18n="behind.consult.name">コンサルチーム — 3 agents</div>
                <p class="font-jp text-[13px] text-brand-sub leading-relaxed mb-3" data-i18n="behind.consult.desc">分析・批評・意思決定支援</p>
                <p class="text-[10px] tracking-wide text-white/25" style="font-family:'SF Mono',Menlo,monospace;">manual: ~/.claude/commands/references/consulting-common.md</p>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: i18n キーを ja 辞書に追加**

`'footer.tff.desc': '人生観・詩・思い・感動を<br>つづるパーソナルサイト',` の直後に追加:

```js
    'behind.tag': 'Behind NOCTA',
    'behind.lead': 'このプロジェクトは、CEO と、ローカル環境で働く AI エージェントチームが支えています。',
    'behind.design.name': 'デザイナーチーム — 3 agents',
    'behind.design.desc': '設計・実装の競作',
    'behind.consult.name': 'コンサルチーム — 3 agents',
    'behind.consult.desc': '分析・批評・意思決定支援',
```

- [ ] **Step 3: i18n キーを en 辞書に追加**

`'footer.tff.desc': 'A personal site for life philosophy,<br>poetry, and moments that move us.',` の直後に追加:

```js
    'behind.tag': 'Behind NOCTA',
    'behind.lead': 'This project is supported by the CEO and a team of AI agents running locally on a single Mac.',
    'behind.design.name': 'Designer Team — 3 agents',
    'behind.design.desc': 'Competitive design and implementation',
    'behind.consult.name': 'Consultant Team — 3 agents',
    'behind.consult.desc': 'Analysis, critique and decision support',
```

- [ ] **Step 4: キー整合を確認**

Run: `grep -o 'data-i18n="behind[^"]*"' website/index.html | sort -u | wc -l`
Expected: `6`

Run: `grep -c "'behind\." website/index.html`
Expected: `12`(ja 6 + en 6)

### Task 5: 全体検証

**Files:**
- 検証のみ(変更なし)

- [ ] **Step 1: inline script の構文チェック**

Run(website/ ディレクトリで):
```bash
node -e "
const html = require('fs').readFileSync('index.html','utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let ok = true;
scripts.forEach((m,i)=>{ try { new Function(m[1]); } catch(e){ ok=false; console.error('script['+i+'] SYNTAX ERROR:', e.message); } });
console.log(ok ? 'OK: ' + scripts.length + ' inline scripts parsed' : 'NG');
process.exitCode = ok ? 0 : 1;
"
```
Expected: `OK: N inline scripts parsed`

- [ ] **Step 2: 残存参照の最終確認**

Run: `grep -n '#works\|works-grid\|NOCTA_WORKS\|stat-works\|works-data\|data-filter=' website/index.html`
Expected: 出力なし

- [ ] **Step 3: ローカルサーバーで目視確認**

Run: `cd website && python3 -m http.server 8080`
確認項目(CEO 目視):
1. Statement と Tools の間に足あと帯が表示され、スクロール到達時に足あとが順に浮かぶ
2. 統計バーが3カラム(ビジュアル・ブログ・アプリ)で数字が駆け上がる
3. Contact の下に Behind NOCTA セクション(2チーム+manual パス)が表示される
4. フッター Creative 列が「音楽（Coming Soon）」(ホバー反応なし)
5. ナビに Works がなく、Hero「作品を見る」が VISUAL セクションへスクロールする
6. JA/EN 切替で Behind NOCTA・フッター・Hero CTA が正しく切り替わる
7. ブラウザコンソールにエラーがない

- [ ] **Step 4: website-reviewer エージェントで検証**

website-reviewer に依頼: index.html の JS 構文・相対パス・i18n キー整合(data-i18n と I18N 辞書の突合)・#works 参照ゼロを確認。

- [ ] **Step 5: CEO 承認後にコミット(push はしない)**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(site): Music紹介を撤去しBehind NOCTAセクションを追加"
```
注意: git add は website/index.html のみ。drafts/ の設計書・計画書は含めない。push は CEO の明示承認後に別途実行する。
