import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, StyleSheet, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Button, Switch, Text } from './Terminal.js';
import { domains } from '../core/data.js';
import { api } from './session.js';
import { catalog, readPage } from './data.js';
import { deleteLocalData, importArchive, loadGrants, saveGrants } from './library.js';
import { authorizeHealth } from './health.js';
import { authorizeUsage } from './usage.js';
import { captureLocation, startTracking, stopTracking, locationStatus } from './location-task.js';
import { cloudAccess } from './destinations.js';
import { reconcileExports } from './export-task.js';
import ProfilePanel from './ProfilePanel.js';
import { loadProfiles, saveProfiles } from './profiles.js';
import { parseProfile, profileAllows } from '../core/profiles.js';
import { shareDomain } from './export.js';
/** @param {{session:import('./session.js').Session,incoming:import('../core/profiles.js').ProfileDraft|null,onDismiss:()=>void}} props */
export default function DataPanel({ session, incoming, onDismiss }) {
  const [grants, setGrants] = useState(() => loadGrants(session.deviceId));
  const allowed = useRef(grants);
  const [profiles, setProfiles] = useState(() => loadProfiles(session.deviceId));
  const profileState = useRef(profiles);
  const [types, setTypes] = useState(
    /** @type {Record<import('../core/data.js').Domain,string[]>} */ ({
      health: [],
      time: [],
      location: [],
    }),
  );
  const [proposal, setProposal] = useState(
    /** @type {{id:string,profile:import('../core/profiles.js').ProfileDraft}|null} */ (null),
  );
  const reviewing = useRef(false);
  const receivedProfileId = useRef('');
  useEffect(() => {
    reviewing.current = Boolean(proposal || incoming);
  }, [proposal, incoming]);
  const activeProfile = useCallback(
    () => profileState.current?.profiles.find((p) => p.id === profileState.current?.activeId),
    [],
  );
  const phoneCatalog = useCallback(async () => {
    const raw = await catalog(session.owner, allowed.current);
    setTypes({
      health: raw.domains.find((d) => d.domain === 'health')?.types ?? [],
      time: raw.domains.find((d) => d.domain === 'time')?.types ?? [],
      location: raw.domains.find((d) => d.domain === 'location')?.types ?? [],
    });
    if (!profileState.current) {
      const initial = {
        activeId: 'default',
        profiles: [
          {
            ...parseProfile({
              schema: 'qr-connect.profile.v1',
              name: 'Default',
              selection: Object.fromEntries(
                raw.domains.map((d) => [d.domain, allowed.current[d.domain] ? d.types : []]),
              ),
            }),
            id: 'default',
          },
        ],
      };
      saveProfiles(session.deviceId, initial);
      profileState.current = initial;
      setProfiles(initial);
    }
    const profile = profileState.current.profiles.find(
      (p) => p.id === profileState.current?.activeId,
    );
    if (!profile) throw new Error('Choose an active profile.');
    return {
      ...raw,
      activeProfileId: profile.id,
      profiles: profileState.current.profiles,
      acceptProfiles: !reviewing.current,
      receivedProfileId: receivedProfileId.current,
      domains: raw.domains.map((d) =>
        Object.assign({}, d, {
          enabled: allowed.current[d.domain],
          availableTypes: d.types,
          types: d.types.filter((key) => profile.selection[d.domain].includes(key)),
        }),
      ),
    };
  }, [session]);

  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('READY_ Waiting for chat queries.');
  const [isTracking, setTracking] = useState(false),
    [days, setDays] = useState('7');
  const [notes, setNotes] = useState(/** @type {Record<string,string>} */ ({}));
  const version = useRef(0);
  const [filesOpen, setFilesOpen] = useState(false);
  const resumeFromSettings = useRef(false);
  const [locationInfo, setLocationInfo] = useState('Checking location permissions…');
  const refreshLocation = useCallback(async () => {
    const status = await locationStatus(session.owner);
    setTracking(status.tracking);
    setLocationInfo(
      `${status.permission}. ${status.count} recorded points.${status.last ? ` Last point: ${new Date(status.last).toLocaleString()}.` : ''}`,
    );
    return status;
  }, [session.owner]);
  useEffect(() => {
    const refresh = async (resume = false) => {
      try {
        const status = await refreshLocation();
        if (resume && resumeFromSettings.current) {
          resumeFromSettings.current = false;
          if (status.backgroundGranted) {
            await startTracking(session.owner);
            await refreshLocation();
            setMessage('Location recording is on, including while your phone is locked.');
          } else setMessage('Choose Always in location settings, then start recording again.');
        }
      } catch (error) {
        setLocationInfo(
          error instanceof Error ? error.message : 'Could not check location access.',
        );
      }
    };
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh(true);
    });
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') void refresh();
    }, 5000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [refreshLocation, session.owner]);
  const publish = useCallback(async () => {
    const info = await phoneCatalog();
    setNotes(
      Object.fromEntries(
        info.domains.map((d) => [
          d.domain,
          `${d.domain === 'health' ? 'HealthKit samples + imported archives.' : d.domain === 'time' ? (d.types.some((t) => t.startsWith('native:')) ? 'Live usage totals available.' : 'Import time.md to add history.') : 'Recorded points + iso.me imports.'}`,
        ]),
      ),
    );
    await api(session, `/api/phones/${session.deviceId}/poll`, {
      method: 'POST',
      body: JSON.stringify({ ...info, dispatch: false }),
    });
  }, [session, phoneCatalog]);
  useEffect(() => {
    let active = true,
      running = false;
    /** @type {ReturnType<typeof setTimeout>|undefined} */ let timer;
    const poll = async () => {
      if (!active || running) return;
      if (AppState.currentState !== 'active') {
        timer = setTimeout(() => void poll(), 2000);
        return;
      }
      running = true;
      const current = version.current;
      try {
        const info = await phoneCatalog();
        const response =
          /** @type {{request:null|{id:string,query:import('../core/data.js').DataQuery & {profileId:string}},profile?:{id:string,profile:import('../core/profiles.js').ProfileDraft}|null}} */ (
            await api(session, `/api/phones/${session.deviceId}/poll`, {
              method: 'POST',
              body: JSON.stringify(info),
            })
          );
        if (active) {
          setNotes(
            Object.fromEntries(
              info.domains.map((d) => [
                d.domain,
                `${d.domain === 'health' ? 'HealthKit samples + imported archives.' : d.domain === 'time' ? (d.types.some((t) => t.startsWith('native:')) ? 'Live usage totals available.' : 'Import time.md to add history.') : 'Recorded points + iso.me imports.'}`,
              ]),
            ),
          );
        }
        if (response.profile && active) {
          reviewing.current = true;
          receivedProfileId.current = response.profile.id;
          setProposal({ ...response.profile, profile: parseProfile(response.profile.profile) });
        }
        const request = response.request;
        const profile = activeProfile();
        if (
          request &&
          active &&
          profile &&
          request.query.profileId === profile.id &&
          allowed.current[request.query.domain] &&
          profileAllows(profile, request.query)
        ) {
          setMessage(`Your chat requested ${request.query.domain} data.`);
          let body;
          try {
            body = { id: request.id, page: await readPage(session.owner, request.query, profile) };
          } catch (error) {
            body = {
              id: request.id,
              error: error instanceof Error ? error.message : 'Read failed.',
            };
          }
          if (active && current === version.current && allowed.current[request.query.domain]) {
            await api(session, `/api/phones/${session.deviceId}/result`, {
              method: 'POST',
              body: JSON.stringify(body),
            });
            setMessage('Answered your chat. The server clears responses after five minutes.');
          }
        }
      } catch (error) {
        if (active)
          setMessage(error instanceof Error ? error.message : 'Could not reach your server.');
      } finally {
        running = false;
        if (active) timer = setTimeout(() => void poll(), 2000);
      }
    };
    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [session, phoneCatalog, activeProfile]);
  /** @param {()=>Promise<void>} action */
  async function run(action) {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      Alert.alert(
        'Could not complete this request',
        error instanceof Error ? error.message : 'Please retry.',
      );
    } finally {
      setBusy(false);
    }
  }
  /** @param {boolean} enabled */
  async function changeRecording(enabled) {
    resumeFromSettings.current = false;
    if (!enabled) {
      await stopTracking();
      await refreshLocation();
      setMessage('Location recording stopped.');
      return;
    }
    const started = await startTracking(session.owner);
    await refreshLocation();
    resumeFromSettings.current = !started;
    setMessage(
      started
        ? 'Location recording is on, including while your phone is locked.'
        : 'Use Location permissions to allow Always/background access and precise location, then return. Recording will start when access is granted.',
    );
  }
  /** @param {import('../core/data.js').Domain} domain @param {boolean} enabled */
  async function changeGrant(domain, enabled) {
    version.current++;
    const next = { ...allowed.current, [domain]: enabled };
    allowed.current = next;
    saveGrants(session.deviceId, next);
    setGrants(next);
    await publish();
    if (enabled) {
      if (domain === 'health') await authorizeHealth();
      if (domain === 'time') await authorizeUsage();
      await publish();
    }
  }
  /** @param {import('../core/data.js').Domain} domain */
  async function importFile(domain) {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    const file = new File(asset.uri);
    try {
      if (file.size > 30 * 1024 * 1024) throw new Error('Choose a JSON export smaller than 30 MB.');
      const count = importArchive(session.owner, domain, asset.name, await file.text());
      setMessage(`Imported ${count} indexed records and preserved the complete original file.`);
      await publish();
    } finally {
      file.delete();
    }
  }
  /** @param {import('../core/data.js').Domain} domain */
  async function exportFile(domain) {
    const range = Number(days);
    if (!Number.isInteger(range) || range < 1 || range > 31)
      throw new Error('Choose 1–31 days. Repeat for older date windows through your chat.');
    const profile = activeProfile();
    if (!profile) throw new Error('Choose an active profile.');
    const count = await shareDomain(
      session.owner,
      allowed.current,
      domain,
      profile,
      range,
      setMessage,
    );
    setMessage(
      `Exported ${count} records. Check the file manifest for unreadable or partial sources.`,
    );
  }
  return (
    <View style={styles.container}>
      {profiles ? (
        <ProfilePanel
          session={session}
          state={profiles}
          types={types}
          busy={busy}
          draft={incoming ?? proposal?.profile ?? null}
          onDismiss={() => {
            if (incoming) onDismiss();
            else setProposal(null);
          }}
          onChange={async (next) => {
            if (!next.profiles.length || !next.profiles.some((p) => p.id === next.activeId))
              throw new Error('Keep at least one active profile.');
            for (const p of next.profiles) parseProfile(p);
            for (const previous of profiles.profiles) {
              const changed = next.profiles.find((p) => p.id === previous.id);
              if (
                previous.export.destination === 'cloud' &&
                JSON.stringify(changed) !== JSON.stringify(previous)
              ) {
                // Revoke stored-data sharing before accepting changed profile permissions.
                // oxlint-disable-next-line eslint/no-await-in-loop
                await cloudAccess(session, previous, false);
              }
            }
            version.current++;
            saveProfiles(session.deviceId, next);
            profileState.current = next;
            setProfiles(next);
            void reconcileExports().catch((e) => setMessage(`Profile saved. ${String(e)}`));
            try {
              await publish();
            } catch {
              setMessage(
                'Profile saved locally. Server access updates when this phone reconnects.',
              );
            }
          }}
        />
      ) : (
        <Text>Loading export profiles…</Text>
      )}
      <Text style={styles.heading}>{'> DATA STREAMS'}</Text>
      <Text style={styles.description}>
        Toggle chat access. Keep this app open for queries. Location recording also runs in the
        background.
      </Text>
      <Button
        title={filesOpen ? '[-] Close file tools' : '[+] Import / export files'}
        onPress={() => setFilesOpen(!filesOpen)}
      />
      {filesOpen ? (
        <>
          <Text style={styles.description}>EXPORT WINDOW / DAYS (1–31)</Text>
          <TextInput
            accessibilityLabel="Days to export"
            keyboardType="number-pad"
            value={days}
            onChangeText={setDays}
            style={styles.input}
          />
        </>
      ) : null}
      {domains.map((domain) => (
        <View key={domain} style={styles.card}>
          <Text style={styles.title}>
            {domain === 'health'
              ? '01 / HEALTH'
              : domain === 'time'
                ? '02 / SCREEN TIME'
                : '03 / LOCATION'}
          </Text>
          {domain === 'location' ? (
            <View style={styles.row}>
              <Text style={styles.description}>RECORDING</Text>
              <Switch
                accessibilityLabel="Record location in background"
                value={isTracking}
                disabled={busy}
                onValueChange={(enabled) => void run(() => changeRecording(enabled))}
              />
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.description}>CHAT ACCESS</Text>
            <Switch
              accessibilityLabel={`Allow chat to read ${domain} data`}
              value={grants[domain]}
              disabled={busy}
              onValueChange={(value) => void run(() => changeGrant(domain, value))}
            />
          </View>
          <Text style={styles.description}>
            {grants[domain] ? 'SHARED' : 'PRIVATE'} / {notes[domain] ?? 'Checking data sources…'}
          </Text>
          {domain === 'location' ? (
            <>
              <Text style={styles.description}>{locationInfo}</Text>
              <Button
                title="Location permissions"
                disabled={busy}
                onPress={() => void run(() => Linking.openSettings())}
              />
              <Button
                title="Save location point"
                disabled={busy}
                onPress={() =>
                  void run(async () => {
                    await captureLocation(session.owner);
                    setMessage('Recorded one location point on this phone.');
                    await publish();
                  })
                }
              />
            </>
          ) : null}
          {filesOpen ? (
            <>
              <Button
                title={`Import ${domain === 'health' ? 'health.md' : domain === 'time' ? 'time.md' : 'iso.me'} JSON`}
                disabled={busy}
                onPress={() => void run(() => importFile(domain))}
              />
              <Button
                title={`Export ${domain}`}
                disabled={busy}
                onPress={() => void run(() => exportFile(domain))}
              />
            </>
          ) : null}
        </View>
      ))}
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {message}
      </Text>
      {filesOpen ? (
        <Button
          title="Delete local imported and recorded data"
          disabled={busy}
          onPress={() =>
            Alert.alert(
              'Delete local data?',
              'This deletes imported files and recorded location points from QR Connect. System health and usage data remain in their source apps.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () =>
                    void run(async () => {
                      await stopTracking();
                      setTracking(false);
                      deleteLocalData(session.owner);
                      setMessage('Local records deleted.');
                      await publish();
                    }),
                },
              ],
            )
          }
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 16 },
  heading: { fontSize: 22, lineHeight: 30 },
  description: { fontSize: 16, lineHeight: 24 },
  card: {
    padding: 16,
    gap: 12,
    borderTopWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: { fontSize: 19, lineHeight: 27 },
  input: {
    fontFamily: 'Terminal',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 12,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  status: {
    fontSize: 15,
    lineHeight: 24,
    borderLeftWidth: 3,
    borderColor: '#000000',
    paddingLeft: 12,
  },
});
