# NOCTA とアプリ群の関係図

NOCTA（ランディングページ／ポートフォリオの総元締め）と、各ディレクトリ／リポジトリで
作っているアプリの関係を図示する。誰でも全体像を把握できるようにするための資料。
最終更新: 2026-06-16

---

## 名前の対応（CEOの呼び名 → 正式名）

| CEOの呼び名 | 正式名 | ディレクトリ / リポジトリ | ホスティング | 含むアプリ |
|---|---|---|---|---|
| New World（MemoUp） | NuWord / memo-app | `~/memo-app`（repo: nuword） | Vercel（nuword-nu.vercel.app） | Seed・Verse（2アプリ） |
| Inner Campus | Inner Canvas | `~/nner-canvas`（repo: nner-canvas） | Vercel（nner-canvas.vercel.app） | Inner Canvas |
| Stell | still | NOCTA repo内 `website/still/` | GitHub Pages | still |

補足: still は独立リポジトリではなく **NOCTA HP 本体の一部**（`website/still/`）。

---

## 図1: ディレクトリ／リポジトリ と アプリの関係（基本）

```mermaid
graph TD
    NOCTA["NOCTA HP（総元締め・ポートフォリオ）<br/>repo: NOCTA / GitHub Pages"]

    subgraph D1["~/memo-app （repo: nuword・Next.js）"]
        SEED["Seed アプリ"]
        VERSE["Verse アプリ"]
    end

    subgraph D2["~/nner-canvas （repo: nner-canvas・Vite+React）"]
        IC["Inner Canvas アプリ"]
    end

    subgraph D3["NOCTA repo 内 website/still/ （静的）"]
        STILL["still アプリ"]
    end

    NOCTA -->|紹介・リンク| SEED
    NOCTA -->|紹介・リンク| VERSE
    NOCTA -->|紹介・リンク| IC
    NOCTA -->|内包・ホスト| STILL
```

要点:
- **NOCTA HP** が全アプリを「紹介・入口」としてまとめる総元締め。
- **memo-app（nuword）** は1つのコードベースで **Seed と Verse の2アプリ** を提供。
- **nner-canvas** は **Inner Canvas** 単独。
- **still** は NOCTA HP の中（website/still/）に同居。

---

## 図2: 共有インフラと収益化を重ねた全体像（詳細）

```mermaid
graph TD
    NOCTA["NOCTA HP<br/>repo: NOCTA / GitHub Pages"]

    subgraph APPS["アプリ群"]
        STILL["still（静的）<br/>website/still/"]
        SEED["Seed"]
        VERSE["Verse"]
        IC["Inner Canvas"]
    end

    MEMO["~/memo-app（repo: nuword・Next.js / Vercel）"]
    NNER["~/nner-canvas（repo: nner-canvas・Vercel）"]
    MEMO --- SEED
    MEMO --- VERSE
    NNER --- IC

    SUPA["Supabase プロジェクト（共有）<br/>afnbrzpmxdnmxtnwazdq<br/>認証 + entitlements"]
    GUM["Gumroad（決済）"]

    NOCTA -->|入口・紹介| STILL & SEED & VERSE & IC

    %% 認証・権限（Vercel系3アプリは同一Supabaseを共有）
    SEED -. 認証/権限 .-> SUPA
    VERSE -. 認証/権限 .-> SUPA
    IC -. 認証/権限 .-> SUPA

    %% 収益化
    GUM -->|ライセンスキー Tier1| STILL
    GUM -->|購入Webhook| SUPA
```

要点:
- **Seed・Verse・Inner Canvas は同一の Supabase プロジェクトを共有**（認証＋購入権限 entitlements）。
- **収益化は2系統**:
  - still = Gumroad のライセンスキーをクライアント照合（Tier1・Supabase不要）
  - Vercel系3アプリ = Gumroad購入 → Webhook → 共有Supabaseの entitlements（all-access）
- 詳細は `drafts/monetization-kit/MONETIZATION-STATUS.md` を参照。

---

## 図3: プレーンテキスト版（Mermaid非対応ビューア用）

```
NOCTA HP（総元締め・GitHub Pages / repo: NOCTA）
│  各アプリを紹介・リンクする入口
│
├─ website/still/ …………… still（静的・NOCTA内に同居）   ── 課金: Gumroadキー(Tier1)
│
├─ ~/memo-app（repo: nuword・Next.js / Vercel）
│     ├─ Seed                                            ┐
│     └─ Verse                                           │ 課金: Gumroad→Webhook
│                                                        │      →共有Supabase権限
└─ ~/nner-canvas（repo: nner-canvas / Vercel）            │
      └─ Inner Canvas                                    ┘
                          ↑
        Seed / Verse / Inner Canvas は
        同一Supabaseプロジェクト（認証＋権限）を共有
```
