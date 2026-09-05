export const TERMINAL_STATES = Object.freeze(['DONE', 'LOOP_BLOCKED', 'ABORTED', 'ERROR']);
export const ACTIVE_STATES = Object.freeze(['RUNNING', 'RE_REVIEW_RUNNING']);
export const MESSAGE_MODES = Object.freeze(['NARRATIVE', 'FACTUAL_FALLBACK', 'UNAVAILABLE']);
export const RENDER_PATHS = Object.freeze(['SMALL_MODEL', 'RESWITCH_THINKER_MODEL', 'FACTUAL_FALLBACK']);
export const CORRELATIONS = Object.freeze(['CONVERGENT', 'PERSPECTIVE_DIFFERENCE', 'DIVERGENCE', 'UNAVAILABLE']);
export const RUNTIME_VERSION = 'doki-runtime-v1';
export const DEFAULT_MAX_RESWITCH = 5;
export const DEFAULT_MAX_CALLS = 6;
export const DEFAULT_TOKEN_BUDGET = 1500;

// ── Adapter-Vertrag (generisch, K3-Rework 2026-09-06) ────────────────────────
// ALT (entfernt): DOKI war gegen einen KONKRETEN FalsifyMe-Freeze-Commit
// gepinnt (EXPECTED_FALSIFYME_CONTRACT_SHA + FALSIFYME_CONTRACT_SHA-Env).
// Das machte DOKI allein nicht lauffähig und pinnte die eigene Identität an
// einen fremden Commit. NEU: JEDER Ingest-Adapter (FalsifyMe-DB, FM-EVT-Feed,
// jedes andere System) MELDET SEINE Vertrags-Version als Daten. DOKI hält
// selbst die Liste der Vertrags-Versionen, gegen die es gebaut/getestet ist,
// und lehnt Fremdversionen fail-closed ab (CONTRACT_MISMATCH → UNAVAILABLE).
// Der Mechanismus kennt kein FalsifyMe mehr — nur Versionen.
export const SUPPORTED_CONTRACT_VERSIONS = Object.freeze([
  'falsify-freeze-56d2fb7e',  // Freeze-Stand, gegen den readSnapshot/getestet wurde
]);

/** Generischer Vertrags-Check: adapterContract kommt vom ADAPTER (Funktion/
 *  Objekt des Ports), nicht aus der Prozess-Env. fail-closed bei alles anderem
 *  als einer unterstützten Version. */
export function checkAdapterContract(adapterContract, {
  supported = SUPPORTED_CONTRACT_VERSIONS,
} = {}) {
  // Nur zwei legitime Port-Formen: Objekt mit contract_version ODER bare String.
  // Alles andere (null, {}, Funktionen ohne Ergebnis) ist ein Vertragsbruch und
  // wird als 'leer' gemeldet — kein '[object Object]'-Geräusch.
  const raw = (adapterContract !== null && typeof adapterContract === 'object')
    ? adapterContract.contract_version
    : adapterContract;
  const version = (typeof raw === 'string' || typeof raw === 'number') ? String(raw).trim() : '';
  if (!version) {
    return { ok: false, reason: 'CONTRACT_MISMATCH', expected: [...supported], configured: '(leer — Adapter meldet keine Vertrags-Version)' };
  }
  if (!supported.includes(version)) {
    return { ok: false, reason: 'CONTRACT_MISMATCH', expected: [...supported], configured: version };
  }
  return { ok: true, contract_version: version };
}
