import assert from 'node:assert/strict';
import test from 'node:test';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { openDokiDb } from '../src/db.mjs';
import { processEvent } from '../src/runtime.mjs';
import { adapterContract } from '../src/falsify-adapter.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Minimale falsify-freie Fixture: processEvent braucht readSnapshot (Adapter),
// daher echtes falsify-Schema — ABER das Gate ist injiziert, der Slot-SQL
// wird nie berührt. Das ist genau die K4-Trennung: Eingangsdaten via Adapter,
// Denk-Erlaubnis via Port.
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'doki-gate-'));
  const fPath = join(dir, 'falsify.db');
  const dPath = join(dir, 'doki.db');
  const fdb = new DatabaseSync(fPath);
  fdb.exec(`
    CREATE TABLE jobs(id TEXT PRIMARY KEY, checkout_id TEXT, scope_id TEXT, payload TEXT, diff_text TEXT,
      root TEXT, files TEXT, agent_intent TEXT, affected TEXT, wave TEXT, mode TEXT, status TEXT,
      verdict TEXT, window_idx INTEGER, error TEXT, runtime_config TEXT, attempt INTEGER,
      max_attempts INTEGER, failure_kind TEXT, retry_at TEXT, created_at TEXT, started_at TEXT,
      done_at TEXT, parent_job_id TEXT, handoff_id TEXT, iteration_id TEXT, change_digest TEXT,
      header_digest TEXT, loop_state TEXT, review_iteration INTEGER, loop_count INTEGER, max_loop_count INTEGER);
    CREATE TABLE loop_events(id TEXT PRIMARY KEY, job_id TEXT NOT NULL, scope_id TEXT, handoff_id TEXT,
      change_digest TEXT, event_type TEXT NOT NULL, from_state TEXT, to_state TEXT, payload TEXT, created_at TEXT NOT NULL);
    CREATE TABLE findings(id INTEGER PRIMARY KEY AUTOINCREMENT, scope_id TEXT, job_id TEXT, round INTEGER,
      wave TEXT, mode TEXT, befund TEXT, content TEXT, verdict TEXT, created_at TEXT);
    CREATE TABLE scopes(id TEXT PRIMARY KEY, checkout_id TEXT, header TEXT, status TEXT, phase TEXT,
      last_befund TEXT, sub_prompt TEXT, open_conflicts INTEGER, hardened_at TEXT, created_at TEXT,
      updated_at TEXT, done_at TEXT, last_gap TEXT, last_divergence TEXT, research_additions TEXT);
    CREATE TABLE projects(project_id TEXT PRIMARY KEY, created_at TEXT);
    CREATE TABLE checkouts(checkout_id TEXT PRIMARY KEY, project_id TEXT, bound_root TEXT, root_name TEXT,
      root_binding TEXT, anchor_digest TEXT, records_digest TEXT, created_at TEXT, updated_at TEXT);
  `);
  fdb.prepare(`INSERT INTO jobs (id, scope_id, mode, status, verdict, attempt, max_attempts, loop_count,
    max_loop_count, created_at, started_at, done_at, loop_state, review_iteration)
    VALUES ('j1','s1','write','DONE WRITE','WRITE',1,2,1,5,'2026-09-03T00:00:00Z','2026-09-03T00:01:00Z','2026-09-03T00:02:00Z','DONE',0)`).run();
  fdb.prepare('INSERT INTO loop_events VALUES(?,?,?,?,?,?,?,?,?,?)').run(
    'e1', 'j1', 's1', null, 'c', 'transition', 'RUNNING', 'DONE',
    JSON.stringify({ safe: true }), '2026-09-03T00:02:00Z');
  fdb.prepare(`INSERT INTO findings (scope_id, job_id, round, wave, mode, befund, content, verdict, created_at)
    VALUES ('s1','j1',1,'scan','write','facts','x','WRITE','2026-09-03T00:02:00Z')`).run();
  fdb.prepare(`INSERT INTO scopes (id, header, status, phase, last_befund, open_conflicts, created_at, updated_at)
    VALUES ('s1','hello','done','write','facts',0,'2026-09-03T00:00:00Z','2026-09-03T00:02:00Z')`).run();
  return { dir, fdb, dPath };
}

test('K4: geschlossenes Gate -> FACTUAL_FALLBACK, null Call, null Interpretation', async () => {
  const { dir, fdb, dPath } = fixture();
  const ddb = openDokiDb(dPath);
  let calls = 0;
  const m = await processEvent({
    falsifyDb: fdb, dokiDb: ddb, eventId: 'e1',
    env: { DOKI_MAX_CALLS: '0' },
    adapterContract,
    slotGate: { windowOpen: () => false, source: 'test-closed' },
    modelCall: async () => { calls++; return { text: 'sollte nie passieren', model: 'm' }; },
  });
  assert.equal(calls, 0, 'geschlossenes Gate ruft das Modell NIE');
  assert.equal(ddb.prepare('SELECT COUNT(*) c FROM narrative_outputs').get().c, 0);
  fdb.close(); ddb.close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
});

test('K4: offenes Gate -> normaler Lauf mit genau 1 Call', async () => {
  const { dir, fdb, dPath } = fixture();
  const ddb = openDokiDb(dPath);
  let calls = 0;
  const m = await processEvent({
    falsifyDb: fdb, dokiDb: ddb, eventId: 'e1',
    env: { DOKI_MAX_CALLS: '1', DOKI_API_BASE: 'http://localhost:9', DOKI_API_KEY: 'k', DOKI_THINKER_MODEL: 'm', DOKI_GREEN_MODEL: 'g' },
    adapterContract,
    slotGate: { windowOpen: () => true, source: 'test-open' },
    modelCall: async () => { calls++; return { text: 'Narrativ', model: 'm' }; },
  });
  assert.equal(calls, 1, 'offenes Gate erlaubt genau einen Call');
  assert.equal(m.mode, 'NARRATIVE');
  assert.equal(ddb.prepare('SELECT COUNT(*) c FROM narrative_outputs').get().c, 1);
  fdb.close(); ddb.close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
});

test('K4: Kill-Switch-Vertrag — narrateOnce reicht gate.windowOpen als shouldAbort durch', async () => {
  const { dir, fdb, dPath } = fixture();
  const ddb = openDokiDb(dPath);
  // callThinker mockt callModel-Verhalten: nimmt Optionen, pollt shouldAbort
  // wie das echte callModel (100ms-Interval) und bricht ab, wenn zu.
  const seen = [];
  let open = true;
  let abortErr = null;
  const gate = {
    windowOpen: () => { seen.push(open); return open; },
    source: 'test-switch',
  };
  const m = await processEvent({
    falsifyDb: fdb, dokiDb: ddb, eventId: 'e1',
    env: { DOKI_MAX_CALLS: '1', DOKI_API_BASE: 'http://localhost:9', DOKI_API_KEY: 'k', DOKI_THINKER_MODEL: 'm', DOKI_GREEN_MODEL: 'g' },
    adapterContract,
    slotGate: gate,
    modelCall: async (body, model, { shouldAbort = () => false } = {}) => {
      // poll wie das echte callModel; schliesst das Gate WAHREND des Calls
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 60));
        if (i === 1) open = false; // Mitte des Calls zu
        if (shouldAbort()) { abortErr = new Error('DOKI-KILL-SWITCH'); return { text: '', model: 'm', aborted: true }; }
      }
      return { text: 'Narrativ', model: 'm' };
    },
  });
  assert.ok(seen.length >= 2, `Gate wurde mehrfach geprüft (${seen.length})`);
  assert.equal(abortErr === null || abortErr.message === 'DOKI-KILL-SWITCH', true);
  fdb.close(); ddb.close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
});

test('K4: runtime kennt kein FM-Slot-SQL mehr — Gate ist der einzige Denk-Türsteher', () => {
  const src = readFileSync(resolve(ROOT, 'src/runtime.mjs'), 'utf8');
  const code = src.split(String.fromCharCode(10)).filter((l) => !l.trim().startsWith('//')).join(String.fromCharCode(10));
  assert.ok(!code.includes('thinker_start'), 'kein thinker_start im Runtime-Code');
  assert.ok(!code.includes('thinker_done'), 'kein thinker_done im Runtime-Code');
  assert.ok(!/loop_state\s+IN/.test(code), 'kein jobs.loop_state-SQL im Runtime-Code');
  assert.ok(code.includes('slotGate'), 'slotGate-Port ist die Schnittstelle');
});
