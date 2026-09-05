// ─────────────────────────────────────────────────────────────────────────────
// DOKI · vocabulary.mjs — DOKIs EIGENES, versioniertes Event-Vokabular
// -----------------------------------------------------------------------------
// K2-Ablösung (Schritt 2, plan/rework §10): Vorher waren FM-Event-Namen
// ('job', 'finding', 'loop', 'handoff', 'scope_auto', 'verdict', 'done' …)
// über den ganzen Code verstreut (bridge.mjs CARE-Logik, runtime.mjs
// Akkumulation, ensemble-state.mjs Routing). Intern spricht DOKI jetzt seine
// EIGENE Sprache:
//
//   DOKI_EVENT_TYPES (v1):
//     CLAIM      — eine Behauptung/Anforderung wurde geäußert (war FM 'job'/'scope_auto')
//     CHALLENGE  — ein Widerspruch/Angriff (war FM 'finding')
//     LIFECYCLE  — Zustands-/Lebenszyklus-Übergang (war FM 'loop'/'phase'/'state')
//     VERDICT    — ein Urteil wurde verkündet (war FM 'verdict')
//     HANDOFF    — Übergabe an externen Writer (war FM 'handoff')
//     COMPLETION — Lauf beendet (war FM 'done')
//     DIAGNOSTIC — infrastruktur-/diagnosebezogen (war FM 'boot'/'selftest'/'stats'/'model' …)
//
// Der Producer (FalsifyMe ODER jedes andere System) spricht in SEINEN Namen.
// normalizeEvent() ist die EINZIGE Übersetzungsstelle. DOKI-Module
// (bridge/runtime/ensemble) vergleichen NUR NOCH DOKI-Typen — ändern sich die
// Producer-Namen, ändert sich GENAU EINE Tabelle (WIRE_TO_DOKI), kein Code.
//
// Vokabular-Version: eingefroren im Schema-Sinn; Erweiterung = neue Version
// (VOCABULARY_VERSION), nie stiller Umbau bestehender Typen.
// ─────────────────────────────────────────────────────────────────────────────

export const VOCABULARY_VERSION = 'doki-vocabulary-v1';

export const DOKI_EVENT_TYPES = Object.freeze([
  'CLAIM', 'CHALLENGE', 'LIFECYCLE', 'VERDICT', 'HANDOFF', 'COMPLETION', 'DIAGNOSTIC',
]);

/** Wire→DOKI-Mapping: die EINZIGE Stelle, die Producer-Namen kennt.
 *  Neue Producer-Namen = hier eine Zeile, kein Consumer-Code berührt. */
export const WIRE_TO_DOKI = Object.freeze({
  // FalsifyMe FM-EVT-Namen (Bestand, dokumentiert in ui/tui/events.mjs)
  job: 'CLAIM',
  scope_auto: 'CLAIM',
  finding: 'CHALLENGE',
  loop: 'LIFECYCLE',
  phase: 'LIFECYCLE',
  phase_done: 'LIFECYCLE',
  state: 'LIFECYCLE',
  model: 'LIFECYCLE',
  verdict: 'VERDICT',
  handoff: 'HANDOFF',
  done: 'COMPLETION',
  // Infrastruktur/Diagnose
  boot: 'DIAGNOSTIC',
  selftest: 'DIAGNOSTIC',
  stats: 'DIAGNOSTIC',
  activity: 'DIAGNOSTIC',
  files: 'DIAGNOSTIC',
  focus: 'DIAGNOSTIC',
  output: 'DIAGNOSTIC',
  doki: 'DIAGNOSTIC',
});

/** FM-interne Loop-Event-Typen (thinker-Fenster-Anker, Adapter-Abfrage).
 *  Bleiben Datenwerte im Adapter — hier nur als benannte Konstante, damit
 *  der Name nicht wieder verstreut. */
export const WIRE_THINKER_WINDOW_EVENTS = Object.freeze(['thinker_start', 'thinker_done']);

const DOKI_SET = new Set(DOKI_EVENT_TYPES);

/**
 * normalizeEvent: rohes Producer-Event → DOKI-Envelope.
 * - type: DOKI-Typ (aus WIRE_TO_DOKI; unbekannter Wire-Typ → DIAGNOSTIC,
 *   NICHT abwerfen — Observation bleibt erhalten, Typ ehrlich grob).
 * - wireType: der Original-Name (Beweis, nie Interpretation).
 * - Kein Feldverlust: alles Übrige wird durchgereicht.
 */
export function normalizeEvent(event) {
  if (!event || typeof event !== 'object') throw new TypeError('normalizeEvent requires an event object');
  const wire = event.event_type ?? event.type ?? event.t ?? null;
  const wireType = wire == null ? null : String(wire);
  const type = DOKI_SET.has(wireType) ? wireType : (WIRE_TO_DOKI[wireType] ?? 'DIAGNOSTIC');
  return Object.freeze({ ...event, wireType, type, vocabulary: VOCABULARY_VERSION });
}

/** Legacy-Kompatibilität: `t`-basierte Signals (etats-Kette). Mappt ein
 *  Roh-Event auf das DOKI-`t` für eventSignal() — gleiche Kette, eigene Sprache. */
export function toDokiT(event) {
  const n = normalizeEvent(event);
  return { ...event, t: n.type };
}
