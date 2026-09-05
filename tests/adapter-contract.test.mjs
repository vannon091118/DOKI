import assert from 'node:assert/strict';
import test from 'node:test';
import { SUPPORTED_CONTRACT_VERSIONS, checkAdapterContract } from '../src/contracts.mjs';
import { adapterContract } from '../src/falsify-adapter.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('K3: SUPPORTED_CONTRACT_VERSIONS ist gefroren und pinnt keinen Env-Pin mehr', () => {
  assert.ok(SUPPORTED_CONTRACT_VERSIONS.length >= 1);
  assert.ok(!('EXPECTED_FALSIFYME_CONTRACT_SHA' in globalThis));
  // Der alte Env-Pin darf nicht mehr existieren: keine Prozess-Env-Lektüre im contracts-Modul.
  const src = readFileSync(resolve(ROOT, 'src/contracts.mjs'), 'utf8');
  const code = src.split(String.fromCharCode(10)).filter((l) => !l.trim().startsWith('//')).join(String.fromCharCode(10));
  assert.ok(!code.includes('FALSIFYME_CONTRACT_SHA'), 'kein FALSIFYME_CONTRACT_SHA-Env mehr (nur noch als Doku-Kommentar erlaubt)');
  assert.ok(!code.includes('56d2fb7e0fa6c2101700b2616f0b02d4725615bf'), 'kein roher 40-Zeichen-Freeze-SHA im Code — nur gekürzt in der benannten Version');
  assert.ok(code.includes('checkAdapterContract'), 'generischer Check ist der einzige Pfad');
});

test('K3: falsify-Adapter meldet eine UNTERSTÜTZTE Vertrags-Version', () => {
  const c = checkAdapterContract(adapterContract());
  assert.equal(c.ok, true);
  assert.equal(c.contract_version, SUPPORTED_CONTRACT_VERSIONS[0]);
});

test('K3: Fremd-Version wird fail-closed abgelehnt (Konkretes Objekt)', () => {
  const c = checkAdapterContract({ contract_version: 'sys3-v99' });
  assert.equal(c.ok, false);
  assert.equal(c.reason, 'CONTRACT_MISMATCH');
  assert.deepEqual(c.expected, [...SUPPORTED_CONTRACT_VERSIONS]);
  assert.equal(c.configured, 'sys3-v99');
});

test('K3: bare String-Version wird akzeptiert (Port kann schlank sein)', () => {
  assert.equal(checkAdapterContract(SUPPORTED_CONTRACT_VERSIONS[0]).ok, true);
  assert.equal(checkAdapterContract('unbekannt-v1').ok, false);
});

test('K3: leerer/fehlender Vertrag wird abgelehnt (kein stiller Default)', () => {
  assert.equal(checkAdapterContract({}).ok, false);
  assert.equal(checkAdapterContract(null).ok, false);
  assert.equal(checkAdapterContract('').ok, false);
  assert.match(checkAdapterContract({}).configured, /leer/);
});

test('K3: erweiterte SUPPORTED-Liste erlaubt SYS3 — mechanisch, ohne Codeänderung', () => {
  const c = checkAdapterContract({ contract_version: 'sys3-v1' }, { supported: [...SUPPORTED_CONTRACT_VERSIONS, 'sys3-v1'] });
  assert.equal(c.ok, true);
  assert.equal(c.contract_version, 'sys3-v1');
});
