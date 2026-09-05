import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTERS, CHARACTER_AXES, RELATIONSHIP_COUNT, EnsembleState } from '../src/ensemble-state.mjs';
import { allNarrators, allActiveNarrators, activeNarratorByName, narratorByIndex, narratorByName, REACTIVITY_AXES, ACTIVE_NARRATOR_NAMES, ROLE_MAP } from '../src/narrator-catalog.mjs';

test('SnipWar narrator catalog keeps all 14 identities as ARCHIVE', () => {
  assert.equal(allNarrators().length, 14);
  for (let index = 1; index <= 14; index += 1) {
    const narrator = narratorByIndex(index);
    assert.equal(narrator.index, index);
    assert.equal(narratorByName(narrator.name), narrator);
    assert.equal(narrator.reactivity && Object.keys(narrator.reactivity).length, REACTIVITY_AXES.length);
  }
});

test('RW-100: exactly the ACTIVE_NARRATOR_NAMES trio is materialized as ensemble characters', () => {
  assert.deepEqual(ACTIVE_NARRATOR_NAMES, ['Buffy', 'Squizzle', 'Null']);
  assert.deepEqual(CHARACTERS, ['Buffy', 'Squizzle', 'Null']);
  assert.deepEqual(allActiveNarrators().map((n) => n.name), ['Buffy', 'Squizzle', 'Null']);
  assert.equal(CHARACTERS.length, 3);
});

test('RW-100: active narrator lookup is fail-closed for archived identities', () => {
  assert.equal(activeNarratorByName('Buffy').name, 'Buffy');
  assert.throws(() => activeNarratorByName('Thinker'), /not active/);
  assert.throws(() => activeNarratorByName('NichtExistiert'), /not active|Unknown/);
});

test('RW-100: ROLE_MAP carries the event-routing roles — no wired narrator strings', () => {
  assert.equal(ROLE_MAP.analysis, 'Squizzle');
  assert.equal(ROLE_MAP.attack, 'Buffy');
  assert.equal(ROLE_MAP.userProxy, 'Vannon');
  for (const value of Object.values(ROLE_MAP)) {
    // Rollen müssen im ARCHIV bekannt sein (aber nicht zwingend aktiv —
    // userProxy 'Vannon' ist archiviert und wird nur für Replay-Historie genutzt).
    assert.equal(narratorByName(value).name, value);
  }
});

test('character personality is static while runtime state is mutable', () => {
  const ensemble = new EnsembleState();
  const before = structuredClone(ensemble.profile('Buffy'));
  ensemble.recordRecall('Buffy', 'obs-1');
  ensemble.setKnowledge('Buffy', 'fix', true);
  ensemble.remember('Buffy', { memoryId: 'mem-1', observationId: 'obs-1' });
  ensemble.applyEmotion('Buffy', { curiosity: 0.4 });
  assert.deepEqual(ensemble.profile('Buffy'), before);
  assert.equal(ensemble.characters.get('Buffy').recallCount, 1);
});

test('active characters materialize the complete directed relationship graph', () => {
  const ensemble = new EnsembleState();
  assert.equal(RELATIONSHIP_COUNT, 6); // 3 aktive × 2 gerichtete Kanten
  assert.equal(ensemble.relationships.size, 6);
  for (const from of CHARACTERS) {
    for (const to of CHARACTERS) {
      if (from !== to) assert.deepEqual(Object.keys(ensemble.relationships.get(`${from}->${to}`)), CHARACTER_AXES);
    }
  }
  assert.throws(() => ensemble.profile('Unknown'));
  // Archiv-Profile sind im Katalog lesbar, haben aber KEINEN Ensemble-Zustand:
  assert.equal(ensemble.profile('Thinker').name, 'Thinker');
  assert.equal(ensemble.characters.get('Thinker'), undefined);
  assert.throws(() => ensemble.recordRecall('Thinker', 'obs-x'), /Unknown DOKI character/);
  assert.throws(() => ensemble.applyRelationshipDelta('Buffy', 'Buffy', { trust: 0.1 }));
});
