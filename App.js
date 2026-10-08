import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DataPanel from './client/DataPanel.js';
import { Button, Text } from './client/Terminal.js';
import { useFonts } from 'expo-font';
import { reconcileExports, cancelExports, runScheduledExports } from './client/export-task.js';
import { stopTracking } from './client/location-task.js';
import { profileFromLink } from './core/profiles.js';
import { parsePairingQr } from './core/index.js';
import {
  api,
  clearSession,
  loadSession,
  saveSession,
  signIn,
  revokeDevice,
} from './client/session.js';
/** @typedef {import('./client/session.js').Session} Session */
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Terminal: require('./assets/fonts/JetBrainsMono-Regular.ttf'),
  });
  const [permission, requestPermission] = useCameraPermissions();
  const [session, setSession] = useState(/** @type {Session|null} */ (null));
  const [pairing, setPairing] = useState(
    /** @type {import('./core/index.js').PairingQr|null} */ (null),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const locked = useRef(false);
  const [incoming, setIncoming] = useState(
    /** @type {import('./core/profiles.js').ProfileDraft|null} */ (null),
  );
  useEffect(() => {
    /** @param {string|null} url */
    const receive = (url) => {
      if (!url) return;
      try {
        if (url.startsWith('qrconnect://profile')) setIncoming(profileFromLink(url));
        else if (url.startsWith('qrconnect://pair?') || /^https?:\/\/[^/]+\/pair#/.test(url)) {
          setPairing(parsePairingQr(url));
          locked.current = true;
          setError('');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid app link.');
      }
    };
    void Linking.getInitialURL()
      .then(receive)
      .catch((e) => setError(String(e)));
    const listener = Linking.addEventListener('url', ({ url }) => receive(url));
    return () => listener.remove();
  }, []);
  useEffect(() => {
    loadSession()
      .then(setSession)
      .catch((e) => setError(String(e)));
  }, []);
  useEffect(() => {
    if (!session) cancelExports();
    void reconcileExports().catch((e) => setError(String(e)));
    if (!session) return;
    const tick = () => {
      void runScheduledExports().catch((e) => setError(String(e)));
    };
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, [session]);
  /** @param {string} value */
  function scan(value) {
    if (locked.current) return;
    Keyboard.dismiss();
    try {
      setPairing(parsePairingQr(value.trim()));
      locked.current = true;
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid QR code.');
    }
  }
  /** @param {() => Promise<void>} action */
  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setPairing(null);
    setLink('');
    locked.current = false;
  }
  async function confirm() {
    if (!session || !pairing) return;
    const device = await api(session, '/api/claim', {
      method: 'POST',
      body: JSON.stringify({
        ticket: pairing.ticket,
        name: Platform.OS === 'ios' ? 'iPhone' : 'Android phone',
      }),
    });
    const connected = { ...session, deviceId: /** @type {{id:string}} */ (device).id };
    await saveSession(connected);
    setSession(connected);
    reset();
  }
  async function refresh() {
    if (!session) return;
    const info = /** @type {{devices:{id:string}[]}} */ (await api(session, '/api/devices'));
    if (!info.devices.some((device) => device.id === session.deviceId)) {
      await clearSession(session);
      setSession(null);
      throw new Error('This phone was disconnected. Scan a new QR code.');
    }
    Alert.alert('Connected', 'This phone is connected to your MCP account.');
  }
  async function disconnect() {
    if (!session) return;
    const previous = session;
    cancelExports();
    await clearSession(previous);
    setSession(null);
    reset();
    void Promise.allSettled([stopTracking(), revokeDevice(previous)]).then(([tracking, remote]) => {
      const failures = [
        tracking.status === 'rejected' ? 'Location shutdown failed; check location settings.' : '',
        remote.status === 'rejected'
          ? 'The old server could not confirm revocation. Its device pairing may still exist.'
          : '',
      ].filter(Boolean);
      if (failures.length) Alert.alert('Signed out on this phone', failures.join('\n'));
      return undefined;
    });
  }
  const connected = Boolean(session?.deviceId);
  if (!fontsLoaded && !fontError)
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.boot}>BOOTING TERMINAL_</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        {/* Expo StatusBar uses a string enum rather than a React Native style object. */}
        {/* oxlint-disable-next-line react/style-prop-object */}
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <Text style={styles.eyebrow}>QR CONNECT // PERSONAL DATA</Text>
          <Text style={styles.title}>{connected ? '> CONNECTED_' : '> CONNECT PHONE_'}</Text>
          <Text style={styles.description}>
            {connected
              ? 'SESSION READY. Your chat can query this phone.'
              : 'Generate a pairing QR in your chat. Scan it here.'}
          </Text>
          {incoming && !connected ? (
            <Text>Profile “{incoming.name}” is ready for review after you connect this phone.</Text>
          ) : null}
          {connected && session ? (
            <View style={styles.card}>
              <Text style={styles.label}>SESSION / USER</Text>
              <Text style={styles.account}>{session.account}</Text>
              <Text selectable style={styles.server}>
                {session.server}
              </Text>
              <Button title="Check connection" disabled={busy} onPress={() => void run(refresh)} />
              <Button title="Disconnect phone" onPress={() => void run(disconnect)} />
              {pairing ? (
                <>
                  <Text>New pairing link received for {pairing.server}</Text>
                  <Button
                    title="Switch to this connection"
                    onPress={() =>
                      void run(async () => {
                        const next = pairing;
                        await disconnect();
                        setPairing(next);
                        locked.current = true;
                      })
                    }
                  />
                  <Button title="Dismiss pairing link" onPress={reset} />
                </>
              ) : null}
            </View>
          ) : pairing ? (
            <View style={styles.card}>
              <Text style={styles.label}>PAIR / SERVER</Text>
              <Text selectable style={styles.server}>
                {pairing.server}
              </Text>
              <Text style={styles.description}>
                Only continue if you trust this server. Sign in with the same account used by your
                MCP client.
              </Text>
              {session ? (
                <>
                  <Text style={styles.account}>{session.account}</Text>
                  <Button
                    title="Confirm connection"
                    disabled={busy}
                    onPress={() => void run(confirm)}
                  />
                </>
              ) : (
                <Button
                  title="Sign in"
                  disabled={busy}
                  onPress={() => void run(async () => setSession(await signIn(pairing.server)))}
                />
              )}
              <Button
                title="Use another account"
                disabled={busy || !session}
                onPress={() => setSession(null)}
              />
              <Button
                title="Scan another code"
                disabled={busy}
                onPress={() => {
                  setSession(null);
                  reset();
                }}
              />
            </View>
          ) : (
            <>
              {permission?.granted ? (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => scan(data)}
                />
              ) : (
                <View style={styles.card}>
                  <Text style={styles.description}>
                    Camera access is needed to scan the QR code.
                  </Text>
                  <Button
                    title={
                      permission?.canAskAgain === false
                        ? 'Open camera settings'
                        : 'Allow camera access'
                    }
                    onPress={() => {
                      if (permission?.canAskAgain === false) void Linking.openSettings();
                      else void requestPermission();
                    }}
                  />
                </View>
              )}
              <Text style={styles.label}>INPUT / PAIRING LINK</Text>
              <TextInput
                style={styles.input}
                value={link}
                onChangeText={setLink}
                onSubmitEditing={() => scan(link)}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://server/pair#code"
                placeholderTextColor="#000000"
                accessibilityLabel="Pairing link"
              />
              <Button title="Use pairing link" disabled={!link} onPress={() => scan(link)} />
            </>
          )}
          {connected && session ? (
            <DataPanel
              key={session.deviceId}
              session={session}
              incoming={incoming}
              onDismiss={() => setIncoming(null)}
            />
          ) : null}
          {busy ? (
            <Text accessibilityLiveRegion="polite" style={styles.description}>
              [BUSY] CONNECTING...
            </Text>
          ) : null}
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Text style={styles.footnote}>QR TTL: 5 MIN / ONE PHONE PER CODE</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, gap: 16 },
  boot: { padding: 24 },
  eyebrow: { fontSize: 13, lineHeight: 20, letterSpacing: 1 },
  title: { fontSize: 30, lineHeight: 38, letterSpacing: 0.5 },
  description: { fontSize: 17, lineHeight: 25 },
  card: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  label: { fontSize: 13, lineHeight: 20 },
  account: { fontSize: 22, lineHeight: 30 },
  server: { fontSize: 14, lineHeight: 22 },
  camera: { height: 280, borderWidth: 2, borderColor: '#000000', overflow: 'hidden' },
  input: {
    fontFamily: 'Terminal',
    fontSize: 17,
    lineHeight: 25,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 12,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  error: {
    fontSize: 17,
    lineHeight: 25,
    borderLeftWidth: 4,
    borderColor: '#000000',
    paddingLeft: 12,
  },
  footnote: { fontSize: 13, lineHeight: 20 },
});
