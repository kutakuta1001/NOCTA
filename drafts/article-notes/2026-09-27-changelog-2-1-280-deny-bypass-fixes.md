---
title: "Claude Code CHANGELOG v2.1.268〜280 — deny ルール迂回の修正3件（シンボリックリンク / tee / eval）"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-27"
domain: "github.com"
tags: [best-practices, claude-code, changelog, security, source:manual]
---

## 要約（3〜5行）
ファイル書き込みの deny ルールを迂回できた不具合が3バージョンにわたり修正された。
v2.1.280 はシンボリックリンク経由の書き込みを「見かけのパス」でなく「着地先」で判定するようになり、acceptEdits・allow ルール・auto mode が
作業ディレクトリ外への書き込みを承認しなくなった。v2.1.269 は Bash の `tee` の書き込み先に `Edit()` deny を適用、
v2.1.268 は同一行に `eval` や `env -C` があると Read / Edit deny が外れる不具合を直した。

## 主なポイント
- v2.1.280: symlink 経由の書き込みは着地先で判定。プロンプトも着地先パスを表示する
- v2.1.269: `Bash(tee:*)` allow ルールが作業ディレクトリ外の書き込み先をカバーしなくなった
- v2.1.268: 権限チェッカーが解析できないコマンド（`env -C`・`eval`）が同じ行にあると deny が効かなかった
- v2.1.281: 置換出力のみを対象にする再帰削除が bypass / auto でも確認を求めるようになった

## NOCTAへの関連メモ
R-02 は `permissions.deny` の Edit ルールと approved-guard hook の二重防御で承認済みフォルダを守っている。
今回の修正で deny 側の穴（symlink・tee・eval）が塞がれたので、hook の役割は「コマンド文字列に保護パスが含まれる場合」に集中できる。
R-02 の「cd してから相対パスで書く・スクリプト経由で書く手段の禁止」は引き続き必要。なお hook は本文中のパス文字列にも反応するため、
ノートやレポートで保護対象を書くときは言い換える。
