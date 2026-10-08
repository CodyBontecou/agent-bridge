# Onboarding verification

Verified the minimal redesign on an iPhone 17 Pro simulator running iOS 26.5 with a native Release build, 8 October 2026.

- Fresh launch opens Welcome. Continue pushes Your control, then Get started.
- Short edge swipe cancels; native back button and full edge swipe return to the prior onboarding page.
- Explore data sources opens Connections directly.
- Connect an agent opens pairing directly with Profiles beneath it. Native back returns to Profiles.
- Explore the app first and Skip enter Profiles. Completion persists after restart.
- All three screens were visually inspected in light and dark appearance and extra-extra-extra-large Dynamic Type. Content fits at the tested size and actions stay above the safe area.
- An SQLite trigger forced completion writes to fail. Skip stayed in onboarding with a readable inline error. Removing the trigger and retrying completed setup; restart opened Profiles.
- The existing Profiles view, shared UI components, and shared theme have no changes from this redesign.

The redesigned main flow was recorded at 30 fps and inspected through overview contact sheets and consecutive transition frames. Native push/pop, cancelled gestures, press states, and data-source handoff are visible. No custom motion was added.

Artifacts in implementation/: onboarding-preview.jpg, onboarding-preview-dark.jpg, light/dark screenshots, dark large-text screenshots, save-error.png, onboarding-flow.mp4, motion-contact-sheet.jpg, and transition-frames.jpg.

Validation: npm run format; npm run check (exit 0); npm run bundle (exit 0); iOS simulator Release build succeeded.

Limits: Android device behavior, physical-device 60 fps, VoiceOver traversal, and the full accessibility text-size range have not been measured. Onboarding has no text fields; real pairing credentials and account connection were outside this change.
