import assert from 'node:assert/strict';
import test from 'node:test';
import {
  VOCABULARY_VERSION, DOKI_EVENT_TYPES, WIRE_TO_DOKI,
  WIRE_THINKER_WINDOW_EVENTS, normalizeEvent, toDokiT,
} from '../src/vocabulary.mjs';
import { eventSignal } from '../src/signals.mjs';

test('Vokabular-Version + Typen sind eingefroren und vollständig', () => {
  assert.equal(VOCABULARY_VERSION, 'doki-vocabulary-v1');
  assert.deepEqual([...DOKI_EVENT_TYPES].sort(),
    ['CHALLENGE', 'CLAIM', 'COMPLETION', 'DIAGNOSTIC', 'HANDOFF', 'LIFECYCLE', 'VERDICT']);
  assert.deepEqual([...WIRE_THINKER_WINDOW_EVENTS], ['thinker_start', 'thinker_done']);
});

test('normalizeEvent: FM-Wire-Namen werden deterministisch auf DOKI-Typen gemappt', () => {
  const cases = [
    ['job', 'CLAIM'], ['scope_auto', 'CLAIM'],
    ['finding', 'CHALLENGE'],
    ['loop', 'LIFECYCLE'], ['phase', 'LIFECYCLE'], ['state', 'LIFECYCLE'],
    ['verdict', 'VERDICT'],
    ['handoff', 'HANDOFF'],
    ['done', 'COMPLETION'],
    ['boot', 'DIAGNOSTIC'], ['selftest', 'DIAGNOSTIC'],
  ];
  for (const [wire, expected] of cases) {
    for (const key of ['t', 'type', 'event_type']) {
      const n = normalizeEvent({ [key]: wire, id: 'x' });
      assert.equal(n.type, expected, `${key}='${wire}' → ${expected}`);
      assert.equal(n.wireType, wire, 'Original-Name bleibt als Beweis');
      assert.equal(n.vocabulary, VOCABULARY_VERSION);
      assert.equal(n.id, 'x', 'kein Feldverlust');
    }
  }
});

test('normalizeEvent: unbekannter Wire-Typ → DIAGNOSTIC (fail-open, aber ehrlich grob)', () => {
  const n = normalizeEvent({ t: 'zukuenftiger_neuer_typ' });
  assert.equal(n.type, 'DIAGNOSTIC');
  assert.equal(n.wireType, 'zukuenftiger_neuer_typ');
});

test('normalizeEvent: bereits DOKI-getypte Events bleiben unverändert (Idempotenz)', () => {
  const once = normalizeEvent({ t: 'finding' });
  const twice = normalizeEvent(once);
  assert.equal(twice.type, 'CHALLENGE');
  const doki = normalizeEvent({ event_type: 'CLAIM' });
  assert.equal(doki.type, 'CLAIM');
});

test('normalizeEvent: null/ohne Typ wirft (fail-closed am Eingang)', () => {
  assert.throws(() => normalizeEvent(null), TypeError);
  const n = normalizeEvent({ id: 'ohne-typ' });
  assert.equal(n.type, 'DIAGNOSTIC'); // fehlender Typ ist Datenmüll, nicht Fehler — aber markiert
  assert.equal(n.wireType, null);
});

test('WIRE_TO_DOKI: Werte sind ausschließlich DOKI-Typen (kein Slash-Graubereich)', () => {
  for (const value of Object.values(WIRE_TO_DOKI)) {
    assert.ok(DOKI_EVENT_TYPES.includes(value), `unbekannter Ziel-Typ: ${value}`);
  }
});

test('eventSignal: DOKI-Typen sind first-class (source DOKI_VOCABULARY)', () => {
  const sig = eventSignal({ t: 'CHALLENGE', id: 'e1', seq: 2 });
  assert.equal(sig.source, 'DOKI_VOCABULARY');
  assert.equal(sig.type, 'CHALLENGE');
  assert.equal(sig.eventId, 'e1');
  assert.equal(sig.seq, 2);
});

test('eventSignal: Legacy-Wire-Typen laufen weiter (Replay alter Ketten), ehrlich markiert', () => {
  const sig = eventSignal({ t: 'job', id: 'e2' });
  assert.equal(sig.source, 'FM_EVT_LEGACY');
  assert.equal(sig.type, 'job');
  assert.equal(eventSignal({ t: 'gibtsnicht' }), null);
});

test('toDokiT: Roh-Event wird auf DOKI-t gemappt (etats-Kette in eigener Sprache)', () => {
  const mapped = toDokiT({ t: 'finding', wave: 'evil' });
  assert.equal(mapped.t, 'CHALLENGE');
  assert.equal(mapped.wave, 'evil');
});
