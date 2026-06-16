# PV ストーリーボード（HTML版・プロトタイプ／ペンディング）

作成日: 2026-06-16
状態: **ペンディング**（本番未反映・アイデア記録として保管）

## これは何か
NOCTA Visual 01（藤の少女・3シーン）の PV を、AI動画生成（Kling/Runway＝品質不足で停止）の代わりに
**HTML+CSS のアニメーション・ストーリーボード**で「イメージと演出意図を他者に伝える」試作。
`index.html` を直接ブラウザで開くと、タイトル→3シーン→エンドカードが自動再生される（操作UI付き）。

## なぜペンディングか
内容として今は意味が薄いと CEO 判断（2026-06-16）。将来使うかもしれないため記録として残す。

## 重要: 本番未反映
GitHub Pages は `website/` 配下のみ公開するため、このフォルダ（`drafts/`）はリポジトリに残るが
**ライブサイトには表示されない**。再開して公開する場合は `website/pv/` へ移し push する。

## 中身
- `index.html` — self-contained（フォントCDNのみ依存）。シーン定義は `<script>` 冒頭の `SCENES` 配列で調整可。
- `visual01-key.jpg` — web最適化したキー画像（元: outputs/pv/images/key/...png）。

## 設計の経緯
`docs/superpowers/specs/2026-06-16-nocta-visual-01-storyboard-design.md` を参照。
