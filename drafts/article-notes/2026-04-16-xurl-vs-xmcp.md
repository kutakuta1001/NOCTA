---
title: "xmcpよりxurl（公式X CLI）の方が便利かもという提案"
url: "https://x.com/i/status/2041489622061273471"
date: "2026-04-16"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
xmcp（X公式MCP）の代替として、公式X CLI「xurl」（github.com/xdevplatform/xurl）をスキル化する方法を提案するツイート。MCPをローカルに落としてサーバーを立ち上げてClaude Codeを動かすより、CLI + スキル化の方がシンプルという主張。セットアップコストの違いに着目。

## 主なポイント
- xurl = X公式CLI（github.com/xdevplatform/xurl）
- MCPサーバーの起動が不要でシンプルな構成になる
- Bashコマンドとしてスキル化すれば十分機能するという考え方
- xmcpはMCPサーバー起動・ポート管理が必要（NOCTA: ポート8000で稼働中）

## NOCTAへの関連メモ
NOCTAは既にxmcpをポート8000で稼働させており（memory: project_xmcp_setup.md）、/x-practices-searchスキルで活用中。xurlへの移行はセットアップのシンプル化につながるが、xmcpが安定しているなら移行コストに見合わない可能性もある。次回xmcp障害時に検討候補として保持。
