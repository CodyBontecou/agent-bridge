import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const values = Object.fromEntries(
  readFileSync('.env.cloud', 'utf8')
    .trim()
    .split('\n')
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
for (const key of ['CLOUD_ENCRYPTION_KEY', 'IDENTITY_DB_PASSWORD', 'IDENTITY_ADMIN_PASSWORD'])
  if (!values[key]) throw new Error(`Missing ${key} in .env.cloud.`);
mkdirSync('.local/fly-identity', { recursive: true });
copyFileSync('.local/cloud-realm/qr-connect.json', '.local/fly-identity/qr-connect.json');
for (const [name, value] of Object.entries({
  service: `CLOUD_ENCRYPTION_KEY=${values.CLOUD_ENCRYPTION_KEY}\n`,
  identity: `KC_DB_PASSWORD=${values.IDENTITY_DB_PASSWORD}\nKC_BOOTSTRAP_ADMIN_PASSWORD=${values.IDENTITY_ADMIN_PASSWORD}\n`,
  database: `POSTGRES_PASSWORD=${values.IDENTITY_DB_PASSWORD}\n`,
}))
  writeFileSync(`.local/fly-${name}.secrets`, value, { mode: 0o600 });
console.log('Prepared production realm context and private Fly secret files.');
