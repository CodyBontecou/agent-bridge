# Onboarding patterns

Studied 27 image screens in journey order from BePresent (1644737181), Welltory (1074367771), and Driversnote (924418916) through Appllama. Screen IDs and metadata are in screens.json; references-0.jpg through references-2.jpg are local contact sheets.

- BePresent: one benefit per page, prominent headline, a product preview, and a bottom Continue action. Adopt the clear hierarchy; omit surveys, projections, and social-proof claims.
- Welltory: explain health access before the system permission dialog and let people defer it. Adopt contextual permission education; omit pressure to enable every category.
- Driversnote: native back, visible Skip, and setup choices tied to actual next steps. Adopt reversible navigation during introduction and optional pairing.

Agent Bridge uses three native push screens: value, control, then a setup choice. Continue has one label. The final action describes the destination. Skip and Explore the app first complete the introduction without enabling grants, creating profiles, or pairing. Stack.Protected removes the entire onboarding stack after completion; the entry route consumes the selected destination once.

Reuse the app's warm neutral semantic theme and terracotta accent. Cards use continuous 20-point corners, inner surfaces and actions 16; progress tracks 2. No gradients, emoji, generated illustrations, or artificial loading. The welcome preview is explanatory UI, clearly labeled as an example. Native transitions and immediate press highlights provide feedback without custom spatial motion.

Completion is one install-local flag in the existing Expo SQLite key/value store. Read it synchronously before rendering routes to avoid flashing the app beneath onboarding. Save errors stay inline and permit retry. Pairing deep links remain accessible during introduction.

API references: [Expo SDK 57 Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/) and [Expo SDK 57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/).
