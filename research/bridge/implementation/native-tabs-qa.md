# Native tabs verification

Profiles, History, and Settings use Expo Router 57 native tabs with an independent native stack per tab. SF Symbols identify the iOS items; Material icons identify Android items. The system draws Liquid Glass on iOS 26, including its selected pill and content fade. No custom glass overlay or tab-switch animation is added.

Implementation follows the [Expo 57 native tabs API](https://docs.expo.dev/versions/v57.0.0/sdk/router/native-tabs/) and [native tabs navigation guidance](https://docs.expo.dev/router/advanced/native-tabs/). The installed SDK exports the API through `expo-router/unstable-native-tabs`.

Verified in the designated iOS 26.5 simulator using a bundled Release build:

- Profiles opens by default with all three native tab buttons visible.
- Tab switches retain each stack. Reselecting Profiles or Settings pops its stack to the root.
- Global History retains its Agent access filter while profile history opens independently in Profiles.
- Profile detail push, profile history push, native back and edge-swipe back work.
- Settings opens Connections; profile customization presents above the tab interface, keyboard opens, and unchanged Cancel dismisses safely.
- Light/dark appearance and live XXXL text-size changes preserve the bar and readable screen content. Original simulator appearance and text size were restored.

The full navigation flow was recorded and its frame sheet inspected. The recording is 41.67 seconds at 30 fps after static-frame trimming; it does not measure physical-device frame performance. No profile or export data was changed during verification.

`npm run format`, aggregate `npm run check`, all-platform `npm run bundle`, and the iOS Release simulator build passed. Native dependencies and configuration did not change. Android and web module resolution passed through the bundle; their tab gestures were not exercised on devices.
