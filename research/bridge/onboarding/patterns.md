# Onboarding design

The redesign follows the restraint, monochrome, typography-first hierarchy, plain language, and purposeful grouping in [Vercel design.md](https://vercel.com/design.md) and [design.dark.md](https://vercel.com/design.dark.md), read on 8 October 2026. Both URLs returned the same guidance at that time. Website-specific Vercel logos, CSS, and authorship are not appropriate for this native Agent Bridge app.

The app’s existing Profiles view is the visual reference. Its source and shared theme were left unchanged. Onboarding reuses the existing compact Group and Row components: 16-point page insets, 12-point group corners, 14-point row titles, and 13-point secondary copy. Native system typography and the app’s neutral light/dark colors maintain continuity. The onboarding heading is 24 points, body copy 14; the primary action uses foreground/background contrast with 12-point corners and a minimum 44-point target.

Three native push screens explain available sources, sharing controls, and where to start. The final choices are direct actionable rows. Skip and Explore the app first remain available; completion removes onboarding from history. Pairing has Profiles beneath it so native Back returns to the app. The existing persistence and permission behavior is preserved.

There are no illustrative previews, icon tiles, tracked eyebrows, progress bars, colored selection panels, or custom motion. Group surfaces communicate true peer lists. Native push/pop and press feedback provide continuity.

Earlier research studied 27 Appllama screens from BePresent (1644737181), Welltory (1074367771), and Driversnote (924418916). Screen metadata remains in screens.json and references-0.jpg through references-2.jpg. Their reversible navigation and deferred permission patterns remain applicable; the visual direction now comes from Vercel and the current Profiles view.

API references: [Expo SDK 57 Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/) and [Expo SDK 57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/).
