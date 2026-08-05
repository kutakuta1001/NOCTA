---
title: "[changelog v2.1.221] WebSearch が effort xhigh / max で thinking 無効時に 400 エラーになる問題を修正"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-05"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.221 で、reasoning effort が `xhigh` または `max` かつ thinking が無効の状態で WebSearch が 400 エラーで失敗する問題を修正した。同バージョンでは、セッション開始時に thinking をオフにしていると以降トグルが効かなくなる問題も修正されている。

## 主なポイント
- 条件は「effort が xhigh / max」かつ「thinking 無効」
- 該当時は WebSearch が 400 で失敗していた
- thinking トグルがセッション途中で効かなくなる問題も同時修正

## NOCTAへの関連メモ
NOCTA は重要タスクに `/effort xhigh` を推奨しており、WebSearch は trend-analyst（トレンド調査）と copyright-agent（著作権確認）が使う。この組み合わせで検索が失敗していた可能性があるため、過去のフェーズ1トレンド分析で「検索結果が薄かった」ケースがあれば原因がこれかもしれない。/effort の既定値が high 保持（v2.1.162〜）なので常時該当ではないが、xhigh 指定時は要注意だった。
