# ベストプラクティス インボックス（xmcp自動収集）

`/x-practices-search` で自動収集されたツイートを格納します。
5件以上になったら `/best-practices-review` を実行すると一括レビューが始まります。

---

## 未処理

- https://x.com/ClaudeCode_love/status/2046531725157957964 | 【保存推奨】Claude Codeで意外と知られていないけど本当に差がつくTips10選 ①/clearで不要な文脈を切る ②/compactで長い会話を要約させる ③CLAUDE.mdに開発ルールを固定する ④手順書はSkillsに逃がして再現性を ⑤調査系はSubagentに分業する ⑥Hooksでformat自動化…
- https://x.com/MindTheGapMTG/status/2047008822057701713 | We run 12 Claude Code agents in production daily. The lock-in isn't the model. It's your orchestration layer - CLAUDE.md files, hooks, subagent configs. Build that right and swapping models is an afternoon. The real lock-in is your IDE's workflow assumptions.
- https://x.com/IAmAaronWill/status/2046978768825143655 | → Install Claude Code → Create a /strategy folder → Build your folder structure → Write CLAUDE.md with your offer, ICP & voice → Create a commands folder → Build your first slash command → Add a copywriter subagent → Connect Gmail, Notion and Drive…
- https://x.com/Dhanush_Nehru/status/2045511473620009233 | Claude's Model Context Protocol (MCP) is taking over but finding the right servers for your workflow is impossible. I just open-sourced the definitive directory for all things MCP. Inside: The best community-built tools for connecting Claude & Cursor to your local DBs, Slack…
- https://x.com/FelpsCrypto/status/2047124610760503366 | Se eu tivesse que aprender Claude Code em 7 dias, eu não assistiria um único tutorial. Eu estudaria estes repositórios do GitHub. 1. Awesome Claude Code: O índice mestre de tudo sobre Claude Code. Agentes, comandos, hooks, arquivos CLAUDE.md e fluxos completos.
- https://x.com/manuelibup_/status/2045450235854393561 | 100 tips to master Claude code. For anyone trying to get into vibecoding you'll need to have these at your finger tips overtime. Build hygienic AI habits and improve your workflow long-term. Courtesy: @rubenhassid
- https://x.com/sort5691_p/status/2047395297652056085 | 【雨のままで】 作曲ツール: Studio One(midi) 調教ツール: #Vocaloid V3, DISTOPIA(V3 rate 0.5) 楽曲エンハンス: #Suno Studio, #Ace Studio Mixing : Studio One Mastering : DISTOPIA, #ClaudeCode VOICE #IA
- https://x.com/sort5691_p/status/2047336806828691498 | 【Skybound Resonance】 作曲ツール: Studio One(midi) 調教ツール: #Vocaloid V3, DISTOPIA(V3 rate 0.3) 楽曲エンハンス: #Suno Studio, #Ace Studio Mixing : Studio One Mastering : DISTOPIA, #ClaudeCode
- https://x.com/akaoniudetate/status/2047701099331850443 | Claude Codeで寝てる間に稼ぐX自動化を4ステップで大公開します ① CLAUDE.md作成 → 自分の発信スタイルと哲学をAIに憲法として覚えさせる ② MCPサーバー連携 → NotionやGoogle Sheetsと繋いでデータ管理を自動化 ③ エージェント起動 → トレンド収集・投稿生成・予約投稿をループで…
- https://x.com/N_Taisho/status/2047844741690360204 | AIエージェント普及のボトルネックは企業内で安全に配布・設定・運用できるか。Claude Codeのようなツールは強力だが、実際に使わせようとすると、CLAUDE.md、Skills、MCP、subagents、AGENTS.md、hooks、ローカル環境、Git、CLIなどの理解が必要。
- https://x.com/G1st_oritaka/status/2047243618013135342 | Claude Codeが「バカになった」と感じたら、これを疑う。 1) セッションが肥大化 → タスクを分割、都度リセット 2) 必要情報を都度貼り付け → MCPサーバーで外部記憶化 3) 常識が共有されてない → CLAUDE.mdに規約を書く モデルのせいじゃない、運用設計の問題。
- https://x.com/sho_ai_real/status/2045831363518169241 | Claude Code の初期設定、最初にやるべき順序： 【必ずやる】 CLAUDE.md 作成 → settings.json の permissions 定義 → hooks の実装 【余力があれば】 MCP サーバー追加 → subagents 整理 自分はこの順番で効率が上がりました。
- https://x.com/XVisualneuFX/status/2046981194668298353 | Goodbye, I can't forget you I experimented fisheye lens in an AI-MV, using T2V Dreamina Seedance 2.0 Omni reference Images using GPT Image 2.0, Nano Banana 2 and Nano Banana Pro Upscaler using NVIDIA RTX VSR and AI Music ACE-Step 1.5 XL on @ComfyUI…

## 処理済み

- https://x.com/kimmonismus/status/2044114106064515381 （2026-04-21）
- https://x.com/victormustar/status/2044336082011963872 （2026-04-21）
- https://x.com/RoundtableSpace/status/2044041733659381771 （2026-04-21）
- https://x.com/iam_elias1/status/2045468459740676267 （2026-04-21）
- https://x.com/kaede_gpt/status/2045306750916833503 （2026-04-21）
- https://x.com/junmingong/status/2044832434643173738 （2026-04-21）
- https://x.com/grok/status/2045289998593806813 （2026-04-21）
- https://x.com/pankajkumar_dev/status/2044281458999865495 （2026-04-21）
- https://x.com/nozmen/status/2045254526559740210 （2026-04-18）
- https://x.com/benscharfstein/status/2045250252412956939 （2026-04-18）
- https://x.com/msjiaozhu/status/2041698840236245396 （2026-04-13）
- https://x.com/lucianlamp/status/2042495111578460422 （2026-04-13）
- https://x.com/socialwithaayan/status/2042993563555037688 （2026-04-13）
- https://x.com/sukh_saroy/status/2043199144429531433 （2026-04-13）
- https://x.com/techwith_ram/status/2042094378592923907 （2026-04-13）
- https://x.com/SuguruKun_ai/status/2043558219055071485 （2026-04-13）
- https://x.com/tsumotokai/status/2043339982317011455 （2026-04-13）
- https://x.com/aisearchio/status/2042446695678750882 （2026-04-13）
- https://x.com/StepFun_ai/status/2041918654439141652 （2026-04-13）
