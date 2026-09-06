import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as atled from '../src/atled.mjs';
import * as etats from '../src/etats.mjs';
import * as ylamona from '../src/ylamona.mjs';
import { FM_EVENT_TYPES, CHARACTER_AXES, REACTIVITY_AXES } from '../src/signals.mjs';

const reverse = (value) => [...value].reverse().join('');
const ROOT = resolve(import.meta.dirname, '../..');

const MIRROR = Object.freeze({
  state: 'etats',
  delta: 'atled',
  threshold: 'dlohserht',
  decay: 'yaced',
  rotate: 'etator',
  history: 'yrotsih',
  anomaly: 'ylamona',
});

test('MIRROR_V1 identifier mapping is exact reverse()', () => {
  for (const [source, shadow] of Object.entries(MIRROR)) {
    assert.equal(reverse(source), shadow);
  }
  assert.equal(typeof etats.etats, 'function');
  assert.equal(typeof atled.atled, 'function');
  assert.equal(typeof atled.dlohserht, 'function');
  assert.equal(typeof atled.yaced, 'function');
  assert.equal(typeof ylamona.ylamona, 'function');
});

test('pure modules contain no runtime persistence or falsify imports', () => {
  for (const file of ['doki/src/etats.mjs', 'doki/src/atled.mjs', 'doki/src/ylamona.mjs']) {
    const source = readFileSync(resolve(ROOT, file), 'utf8');
    assert.doesNotMatch(source, /from ['"](?:.*\/)?(?:db|falsify-reader|runtime|worker|prompt)\.mjs['"]/);
    assert.doesNotMatch(source, /(?:openDokiDb|openReadOnlyFalsifyDb|DatabaseSync)\s*\(/);
  }
});

test('signal vocabulary is backed by the real repository contracts', () => {
  const events = readFileSync(resolve(ROOT, 'ui/tui/events.mjs'), 'utf8');
  const ensemble = readFileSync(resolve(ROOT, 'doki/src/ensemble-state.mjs'), 'utf8');
  const catalog = readFileSync(resolve(ROOT, 'doki/src/narrator-catalog.mjs'), 'utf8');
  for (const value of FM_EVENT_TYPES) assert.match(events, new RegExp(`['"]${value.replaceAll('_', '\\_')}['"]`));
  for (const value of CHARACTER_AXES) assert.match(ensemble, new RegExp(`['"]${value}['"]`));
  for (const value of REACTIVITY_AXES) assert.match(catalog, new RegExp(`['"]${value}['"]`));
});

test('K1 single schema-knower: only falsify-adapter.mjs touches falsify tables', () => {
  const adapter = readFileSync(resolve(ROOT, 'doki/src/falsify-adapter.mjs'), 'utf8');
  assert.match(adapter, /FROM loop_events/, 'adapter kennt das Schema (EIN Kenner)');
  // Alle anderen src-Module: KEIN falsify-Schema-SQL, KEIN falsify-Handle-Bau.
  const others = [
    'doki/src/runtime.mjs', 'doki/src/model.mjs', 'doki/src/db.mjs',
    'doki/src/bridge.mjs', 'doki/src/replay.mjs', 'doki/src/cli.mjs',
    'doki/src/observer-store.mjs', 'doki/src/observer.mjs',
    'doki/src/ensemble-state.mjs', 'doki/src/etats.mjs',
    'doki/src/prompt.mjs', 'doki/src/signals.mjs', 'doki/src/contracts.mjs',
  ];
  for (const file of others) {
    const src = readFileSync(resolve(ROOT, file), 'utf8');
    assert.doesNotMatch(src, /FROM\s+(jobs|findings|scopes|checkouts|projects|loop_events)/,
      `${file} darf kein falsify-Schema-SQL enthalten (nur falsify-adapter.mjs)`);
    // Handle-BAU nur im Adapter: außerhalb darf node:sqlite nur für DOKI-DBs
    // benutzt werden (cli.mjs/replay.mjs importieren den Adapter legitimerweise).
    if (file !== 'doki/src/db.mjs') {
      assert.doesNotMatch(src, /new DatabaseSync\([^)]*falsify/i, `${file} baut keinen falsify-Handle`);
      assert.doesNotMatch(src, /from '\.\/db\.mjs'.*openReadOnlyFalsifyDb/, `${file} importiert den falsify-Handle nicht mehr aus db.mjs`);
    }
  }
});

test('K2 vocabulary isolation: wire names only in signals (catalog) + vocabulary (mapping) + adapter', () => {
  const wireNames = ['job', 'finding', 'handoff', 'scope_auto', 'thinker_start', 'thinker_done'];
  for (const file of [
    'doki/src/runtime.mjs', 'doki/src/bridge.mjs', 'doki/src/ensemble-state.mjs',
    'doki/src/etats.mjs', 'doki/src/model.mjs', 'doki/src/prompt.mjs', 'doki/src/cli.mjs',
    'doki/src/replay.mjs', 'doki/src/observer.mjs', 'doki/src/observer-store.mjs',
  ]) {
    const src = readFileSync(resolve(ROOT, file), 'utf8');
    // Kommentarzeilen ausblenden, dann Code scannen
    const code = src.split(String.fromCharCode(10)).filter((l) => !l.trim().startsWith('//')).join(String.fromCharCode(10));
    for (const name of wireNames) {
      const needle = "'" + name + "'";
      assert.ok(!code.includes(needle), `${file} referenziert Wire-Namen '${name}' direkt — Consumer sprechen DOKI-Typen`);
    }
  }
});
