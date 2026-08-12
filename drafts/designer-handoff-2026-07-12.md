# デザイナーセクション引き継ぎ資料

日付: 2026-07-12
出典: `/best-practices-review` 2026-07-12（詳細は各 `drafts/article-notes/2026-07-12-*.md` を参照）
対象読者: design-team スキル（凛・華・紡）

## 目的

ベストプラクティスレビューで見つかったデザイン系リソース3件を、design-team 実行時にブリーフの参考資料として渡せる形にまとめる。強制ではなく参考情報。採用するか無視するかは各デザイナーの判断に委ねる。

## 前提となるNOCTAの現状（website/DESIGN.mdより）

- トーン: dark editorial serif-led music-brand interface
- 配色: warm-black canvas `#0A0906` × off-white `#E8E0D0` × cool-silver accent `#B8B4AE`（アクセントは薄く・CTAやセクションタグ等に限定的使用。面で塗らない）
- 書体: 見出し EB Garamond serif（太字ではなく size + silver contrast で強調）／ポートフォリオ面は Bebas Neue 全角大文字／説明面は section-tag + Noto Sans JP
- 質感: grain-noiseフィールド上のガラスカード、96pxセクションリズム
- 禁止パターン（website/CLAUDE.mdより）: Interフォント+紫グラデ+白背景／対称均等グリッドのみのレイアウト／装飾ゼロのフラットカード羅列

## 参照URL

### 1. awesome-design-md（VoltAgent）
URL: https://github.com/VoltAgent/awesome-design-md
概要: Stripe・Apple・Nike・Spotify等70社超のDESIGN.md（プレーンテキスト形式のブランド設計文書）を収集したリポジトリ。各ファイルにpreview.html付き。
デザイナーへの視点: NOCTA自身のDESIGN.mdは既にトーン・配色・タイポグラフィを記載済みだが、他ブランドの記載粒度（スペーシングスケール・モーショントークン・アクセシビリティ基準の有無等）と比較すると抜けが見つかる可能性がある。ダーク/エディトリアル系に近いブランドがあれば重点的に比較すると効率的。
関連ノート: `drafts/article-notes/2026-07-12-awesome-design-md.md`

### 2. melta-ui
URL: https://github.com/tsubotax/melta-ui
概要: 「人間にもAIにも読めるデザインシステム」。DESIGN.md/CLAUDE.md→JSON契約仕様→CI自動検証（Playwright+axe-core）の3層構成で、99の禁止パターンを自動検出する。
デザイナーへの視点: フルスタック導入（CI基盤・MCP統合）はNOCTAの規模には過剰。核となる発想「禁止パターンの自動検出」だけが参考価値を持つ——website/CLAUDE.mdに既にある禁止パターンリストを、実装時にどう自己チェックするかのヒントとして。
関連ノート: `drafts/article-notes/2026-07-12-melta-ui.md`

### 3. video-use
URL: https://github.com/browser-use/video-use
概要: Claude Code上で自然言語指示だけで動画編集を行うオープンソースツール。フィラー語・無音区間の自動削除、自動カラーグレーディング、字幕焼き込み、アニメーションオーバーレイ生成に対応。
デザイナーへの視点: PVコンセプト設計（concept-director・visual-prompter）時、「編集で自動的に吸収できる作業」と「絵コンテで明示的に指定すべき作業」の切り分けに影響しうる。現行PVパイプラインはRunway WebUI手動＋pv_edit.py（FFmpeg）（[[project_pv_pipeline]]参照）。
関連ノート: `drafts/article-notes/2026-07-12-video-use.md`

## 使い方

design-team スキル実行時、このファイルのパスをブリーフの「参考資料」としてマネージャーが読み込み、凛・華・紡それぞれの判断規範に応じて採用/無視を判断させる。
