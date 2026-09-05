// ─────────────────────────────────────────────────────────────────────────────
// DOKI · falsify-adapter.mjs — der EINZIGE Schema-Kenner für falsify.db
// -----------------------------------------------------------------------------
// K1-Ablösung (Schritt 1, plan/rework §10): DOKI kannte falsify.db-Tabellen an
// VIER verstreuten Stellen (falsify-reader.mjs rohes SQL, rotation.mjs +
// model.mjs queryten jobs.loop_state direkt, db.mjs hielt das Handle). Jetzt
// ist DIESES Modul die EINZIGE Fläche, die FalsifyMe-Schema-Details kennt.
//
// Vertrag:
// - Alles hier ist READ-ONLY (openReadOnlyFalsifyDb öffnet readOnly: true).
// - Kein anderes doki-Modul darf SQL auf falsify-Tabellen schreiben (G1,
//   Spiegel von mirror.test.mjs — doki kennt nur den Adapter, nicht das Schema).
// - Zielbild (Schritt 2+): diese Funktionen werden zum Ingest-Port — der
//   Adapter wird dann INJIZIERT oder durch einen FM-EVT-Envelope-Feed ersetzt,
//   ohne dass seine Aufrufer sich ändern. Die Signaturen hier SIND der Port.
// - Enthält die FM-Loop-Interrogation (thinker_start/done, ACTIVE_STATES) als
//   ÜBERGANGSLÖSUNG von K4 — die Slots werden später injizierte Ports
//   (shouldRun/shouldAbort, Signaturen existieren in thinker-orchestrator.mjs).
// ─────────────────────────────────────────────────────────────────────────────
import { digestJson } from './hash.mjs';
import { TERMINAL_STATES, ACTIVE_STATES, SUPPORTED_CONTRACT_VERSIONS } from './contracts.mjs';

// K3-Rework: der Adapter MELDET seine Vertrags-Version (Port-Konvention).
// DOKI-prüft diese gegen SUPPORTED_CONTRACT_VERSIONS — fail-closed bei Fremd-
// versionen. Kein Env-Pin, kein FalsifyMe-Commit mehr in DOKIs Identität.
// K2 (Schritt 2): FM-interne Event-Namen NUR hier als Datenwerte, benannt via
// vocabulary.mjs — kein verstreuter Name in Consumer-Modulen.
import { WIRE_THINKER_WINDOW_EVENTS } from './vocabulary.mjs';
const [WIRE_THINKER_START, WIRE_THINKER_DONE] = WIRE_THINKER_WINDOW_EVENTS;

/** Read-only Handle auf falsify.db. EINZIGER Öffnungspunkt im ganzen Repo.
 *  (Kompatibilitäts-Export: der frühere Name aus db.mjs lebt HIER weiter —
 *  Aufrufer werden auf dieses Modul umgestellt, db.mjs wird falsify-frei.) */
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
export function openReadOnlyFalsifyDb(path) {
  return new DatabaseSync(resolve(path), { readOnly: true, timeout: 250 });
}

function safeJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { _invalid_json: true, raw: String(text) }; }
}

/** Snapshot EINES loop_events-Eintrags + angrenzende Zeilen (jobs, findings,
 *  scopes, checkouts, projects). Deterministische Lesung in EINER Transaktion. */
export function readSnapshot(fdb, eventId) {
  fdb.exec('BEGIN');
  try {
    const event = fdb.prepare('SELECT id, job_id, scope_id, handoff_id, change_digest, event_type, from_state, to_state, payload, created_at FROM loop_events WHERE id = ?').get(eventId);
    if (!event) throw new Error(`loop_event nicht gefunden: ${eventId}`);
    const job = fdb.prepare(`SELECT checkout_id, loop_state, status, verdict, wave, attempt, loop_count, max_loop_count, parent_job_id, iteration_id,
      review_iteration, header_digest, change_digest, runtime_config, created_at, started_at, done_at FROM jobs WHERE id = ?`).get(event.job_id) ?? null;
    const findings = fdb.prepare('SELECT round, wave, mode, befund, verdict FROM findings WHERE job_id = ? AND wave IN (\'scan\', \'plan\', \'evil\', \'replan\') ORDER BY round ASC').all(event.job_id);
    const scope = event.scope_id ? (fdb.prepare('SELECT header, phase, last_befund, open_conflicts, last_divergence, research_additions, hardened_at FROM scopes WHERE id = ?').get(event.scope_id) ?? null) : null;
    const checkout = job?.checkout_id ? (fdb.prepare('SELECT project_id, checkout_id, bound_root, anchor_digest FROM checkouts WHERE checkout_id = ?').get(job.checkout_id) ?? null) : null;
    const project = checkout?.project_id ? (fdb.prepare('SELECT project_id, created_at FROM projects WHERE project_id = ?').get(checkout.project_id) ?? null) : null;
    const snapshot = { loop_event: { ...event, payload: safeJson(event.payload) }, job: job ? { ...job, runtime_config: safeJson(job.runtime_config) } : null, findings, scope, project, checkout };
    fdb.exec('COMMIT');
    return { snapshot, snapshotDigest: digestJson(snapshot) };
  } catch (error) {
    try { fdb.exec('ROLLBACK'); } catch {}
    throw error;
  }
}

/** Alle terminalen Loop-Events (Replay-Quelle), deterministisch sortiert. */
export function listTerminalEvents(fdb) {
  const states = TERMINAL_STATES.map(() => '?').join(', ');
  return fdb.prepare(`SELECT id, job_id, scope_id, handoff_id, change_digest, event_type, from_state, to_state, payload, created_at
    FROM loop_events WHERE to_state IN (${states}) ORDER BY created_at ASC, id ASC`).all(...TERMINAL_STATES);
}

/** Kausalitäts-Prüfung: from_state des Events muss an previous.to_state
 *  anschließen — sonst GAP (fail-closed in runtime.mjs interpretiert). */
export function inspectEventContinuity(fdb, event) {
  const previous = fdb.prepare(`SELECT id, from_state, to_state, created_at FROM loop_events
    WHERE job_id = ? AND (created_at < ? OR (created_at = ? AND id < ?)) ORDER BY created_at DESC, id DESC LIMIT 1`)
    .get(event.job_id, event.created_at, event.created_at, event.id);
  if (!previous) return null;
  if (event.from_state && previous.to_state && event.from_state !== previous.to_state) {
    return { kind: 'STATE_SEQUENCE_GAP', detail: `${previous.id}:${previous.to_state} -> ${event.id}:${event.from_state}` };
  }
  return null;
}

// ── FM-Loop-Interrogation (K4-Übergang, wird später injizierter Port) ────────

/** Offenes Shared-Key-Fenster: DOKI darf nur denken, wenn FalsifyMe schläft.
 *  Fenster = geschlossen, wenn ein Job aktiv ist ODER der letzte
 *  thinker_start NACH dem letzten thinker_done liegt (Rotation-Vertrag). */
export function sharedKeyWindowOpen(fdb, eventId) {
  const activeMarks = ACTIVE_STATES.map(() => '?').join(', ');
  const active = fdb.prepare(`SELECT id FROM jobs WHERE loop_state IN (${activeMarks}) LIMIT 1`).get(...ACTIVE_STATES);
  if (active) return false;
  const current = fdb.prepare('SELECT created_at FROM loop_events WHERE id = ?').get(eventId);
  if (!current) return false;
  const start = fdb.prepare(`SELECT id, created_at FROM loop_events WHERE event_type='${WIRE_THINKER_START}' AND created_at <= ? ORDER BY created_at DESC, id DESC LIMIT 1`).get(current.created_at);
  if (!start) return true; // noch nie gestartet -> frei
  const done = fdb.prepare(`SELECT id, created_at FROM loop_events WHERE event_type='${WIRE_THINKER_DONE}' AND created_at <= ? ORDER BY created_at DESC, id DESC LIMIT 1`).get(current.created_at);
  if (!done) return false; // offenes Erst-Fenster
  if (Date.parse(start.created_at) >= Date.parse(done.created_at)) return false; // start nach letztem done = belegt
  return true;
}

/** Läuft gerade ein FalsifyMe-Thinker? (Kill-Switch zweiter Prüfpunkt) */
export function activeThinkerRunExists(fdb) {
  const marks = ACTIVE_STATES.map(() => '?').join(', ');
  return Boolean(fdb.prepare(`SELECT 1 FROM jobs WHERE loop_state IN (${marks}) LIMIT 1`).get(...ACTIVE_STATES));
}

/** Vertrags-Ankündigung des Adapters (Port-Konvention, K3-Rework). */
export function adapterContract() {
  return {
    adapter: 'falsify-db-readonly',
    contract_version: SUPPORTED_CONTRACT_VERSIONS[0],
    schema_owner: 'falsify-adapter.mjs (EINZIGER Schema-Kenner)',
  };
}
