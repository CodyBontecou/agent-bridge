import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
const version = '1.17.0';
const digest = '4091dee2a1ec9e0771bef4bd46005197d86b0a2b1f25198c41738476b1d102bb';
const path = `.local/keycloak/providers/apple-identity-provider-${version}.jar`;
function valid() {
  return (
    existsSync(path) && createHash('sha256').update(readFileSync(path)).digest('hex') === digest
  );
}
if (!valid()) {
  const url = `https://github.com/klausbetz/apple-identity-provider-keycloak/releases/download/${version}/apple-identity-provider-${version}.jar`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Apple adapter download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== digest)
    throw new Error('Apple adapter checksum mismatch.');
  mkdirSync('.local/keycloak/providers', { recursive: true });
  writeFileSync(path, bytes);
}
console.log(`Apple adapter ${version} verified. Restart Keycloak to load it.`);
