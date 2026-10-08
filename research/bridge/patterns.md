# Design references for the agent–data bridge

Reviewed on 2026-10-08 with Appllama. The checkout currently contains the default Expo starter screen; recommendations use the user's brief rather than an existing product UI. Research only; no app code changed.

## Recommendation

Use Claude's quiet grouped lists as the primary visual language, ChatGPT's Codex setup as the first-run pattern, and ChatGPT's integration detail as the connection-detail structure. Keep the main interface focused on agents, sources, and the access between them.

Start with one Connections screen containing two sections: Your agents and Your data. Each row carries an icon, name, account identity where relevant, and a concise status. An agent detail shows the data it can access; a data detail shows the agents with access. These are proposed product behaviors, not claims about the references.

A first-run screen can say: “Connect your agent to your data.” Primary action: “Connect an agent.” After that, show “Add a data source.” Each completed step returns to the same connection overview.

A source detail should answer: Which account is connected? What can the agent access? Which agents have access? Is anything requiring attention? Use one main action matching the current state: Connect, Manage access, or Reconnect. Keep Disconnect available in the detail.

## Ranked references

1. Claude — Permissions (6473753684/oth_vd3d4). Strongest core list reference. Icons on the left, source labels, muted access text on the right, chevrons for details. Its location/calendar/reminders permissions are an analogy for our agent–source access, not the same permission model.
2. ChatGPT — Codex Setup (6448311069/oth_9bdxg). Best first-run reference. One icon, short explanation, one Connect action, ample whitespace. For ours, remove unrelated chat controls.
3. ChatGPT — App Detail Overview and Info (6448311069/oth_3x8wa, 6448311069/oth_3k69g). Borrow provider identity, a clear Connect action, and a compact information list. Replace the screenshot carousel and catalog information with account/access information.
4. Claude — Add to Chat (6473753684/oth_vtujo). Good reference for a short “Add data” sheet. Clearly labeled choices and grouped rows. Its actual image shows Camera, Photos, Files, project, Connectors, and Memory. Only offer choices supported by our product.
5. Claude — Connectors and Connector Menu (6473753684/oth_9zxhx, 6473753684/oth_exvyu). Useful secondary reference for sparse integration management. Its empty connector screen gives little guidance; ours needs a clear next action. Keep adding a source directly visible rather than hidden in an overflow menu.
6. ChatGPT — Library Empty State (6448311069/oth_n8qod). Useful empty-state restraint: icon, short title, supporting sentence, single action.
7. Dropbox — Files and File Layout Menu (327630330/oth_y63kd, 327630330/oth_r5q49). Lower priority. Search and readable list choices are useful if we later need file selection. Captured Files screen is empty: it does not establish a populated file-row pattern. Avoid inheriting its tabs, scanning options, folder creation, and multiple view modes for the initial bridge.

## Simplicity boundaries

- Keep the connection overview as the root. Add separate Agents/Data tabs only if actual usage makes the two-section screen unwieldy.
- Use neutral surfaces and one accent for primary actions; familiar provider logos supply recognition.
- Show Connected, Needs attention, or Connecting as text. Do not rely on a colored dot alone.
- Favor concise rows over large repeated cards.
- Make access understandable in plain language. Do not copy a “Read & write” label unless it matches the actual authorization.
- Put technical setup details behind a secondary route when they are necessary.
- Keep promotional rails, trending lists, ratings, prompt catalogs, model selection, and rich chat out of the initial connection flow.
- A recent-activity line can live in a connection detail; a dashboard is not justified yet.

## Study scope and limitations

Reviewed all images returned for Claude Chat (6), Claude Settings (10), ChatGPT Apps (5), ChatGPT Main Navigation (4), and Dropbox Files (3): 28 screenshots across five complete captured flows. These are captured Appllama references, not a live audit of every app screen. No conclusions about animation or unrecorded transitions. 1Password was searched but its library entry only supplied onboarding/paywall flows; it was not used as a product-screen reference.

Screen downloads and contact sheets are saved locally. IDs are durable; media URLs in references.json expire about one hour after retrieval.

## Full screen inventory

- **ChatGPT — Apps Home** (Apps): `6448311069/oth_ll4sb` — [image](6448311069/img/oth_ll4sb.webp)
- **ChatGPT — App Detail Overview** (Apps): `6448311069/oth_3x8wa` — [image](6448311069/img/oth_3x8wa.webp)
- **ChatGPT — App Detail Info** (Apps): `6448311069/oth_3k69g` — [image](6448311069/img/oth_3k69g.webp)
- **ChatGPT — Apps Explore** (Apps): `6448311069/oth_m319j` — [image](6448311069/img/oth_m319j.webp)
- **ChatGPT — GPT Profile Modal** (Apps): `6448311069/oth_a34ty` — [image](6448311069/img/oth_a34ty.webp)
- **Claude by Anthropic — Home** (Chat): `6473753684/oth_4xxu2` — [image](6473753684/img/oth_4xxu2.webp)
- **Claude by Anthropic — Add to Chat** (Chat): `6473753684/oth_vtujo` — [image](6473753684/img/oth_vtujo.webp)
- **Claude by Anthropic — Chat Thread** (Chat): `6473753684/oth_obfe4` — [image](6473753684/img/oth_obfe4.webp)
- **Claude by Anthropic — Chat Response** (Chat): `6473753684/oth_svd3w` — [image](6473753684/img/oth_svd3w.webp)
- **Claude by Anthropic — Chat Response** (Chat): `6473753684/oth_k1q2c` — [image](6473753684/img/oth_k1q2c.webp)
- **Claude by Anthropic — Voice Input Composer** (Chat): `6473753684/oth_8ujyb` — [image](6473753684/img/oth_8ujyb.webp)
- **Dropbox: Cloud Storage Backup — Files Setup Intro** (Files): `327630330/oth_r6dx6` — [image](327630330/img/oth_r6dx6.webp)
- **Dropbox: Cloud Storage Backup — Files** (Files): `327630330/oth_y63kd` — [image](327630330/img/oth_y63kd.webp)
- **Dropbox: Cloud Storage Backup — File Layout Menu** (Files): `327630330/oth_r5q49` — [image](327630330/img/oth_r5q49.webp)
- **Claude by Anthropic — Settings** (Settings): `6473753684/oth_mjp03` — [image](6473753684/img/oth_mjp03.webp)
- **Claude by Anthropic — Settings** (Settings): `6473753684/oth_51l93` — [image](6473753684/img/oth_51l93.webp)
- **Claude by Anthropic — Profile Settings** (Settings): `6473753684/oth_jdon3` — [image](6473753684/img/oth_jdon3.webp)
- **Claude by Anthropic — Time & Focus** (Settings): `6473753684/oth_wt1lt` — [image](6473753684/img/oth_wt1lt.webp)
- **Claude by Anthropic — Privacy Settings** (Settings): `6473753684/oth_267dv` — [image](6473753684/img/oth_267dv.webp)
- **Claude by Anthropic — Capabilities** (Settings): `6473753684/oth_7heb6` — [image](6473753684/img/oth_7heb6.webp)
- **Claude by Anthropic — Connectors** (Settings): `6473753684/oth_9zxhx` — [image](6473753684/img/oth_9zxhx.webp)
- **Claude by Anthropic — Connector Menu** (Settings): `6473753684/oth_exvyu` — [image](6473753684/img/oth_exvyu.webp)
- **Claude by Anthropic — Permissions** (Settings): `6473753684/oth_vd3d4` — [image](6473753684/img/oth_vd3d4.webp)
- **Claude by Anthropic — Voice Settings** (Settings): `6473753684/oth_w8y2d` — [image](6473753684/img/oth_w8y2d.webp)
- **ChatGPT — Navigation Drawer** (Main Navigation): `6448311069/oth_i9lfd` — [image](6448311069/img/oth_i9lfd.webp)
- **ChatGPT — Images Home** (Main Navigation): `6448311069/oth_r84qv` — [image](6448311069/img/oth_r84qv.webp)
- **ChatGPT — Codex Setup** (Main Navigation): `6448311069/oth_9bdxg` — [image](6448311069/img/oth_9bdxg.webp)
- **ChatGPT — Library Empty State** (Main Navigation): `6448311069/oth_n8qod` — [image](6448311069/img/oth_n8qod.webp)
