# DOKI — CONTEXT (dirty IST, Planungsgrundlage)

Stand: 2026-09-06 · Quelle: rg-/grep-Verifikation im Bestand, keine Wünsche.
Zweck: EIN Dokument, das den tatsächlichen Zustand von DOKI einfriert —
inklusive Schmutz, Halbfertigkeit und Falsify-Resten — als Planungsbasis.

---

## 1. Struktur (IST)

- Eigenes Git-Repo seit 2026-09-06 (Init-Commit 585c38, 42 Dateien).
  Vorher Anhang des FalsifyMe-Repos (dort Commit 0ff3b59 = Auszug).
- `src/` = 26 Module, `tests/` = 12 Suiten (74 Tests, alle grün,
  Laufzeit ~66 s wegen SQLite-Timeout-Tests).
- Größte Module: bridge.mjs (345 Z.), observer-store.mjs (259),
  ensemble-state.mjs (232), runtime.mjs (230), db.mjs (177),
  reconstruction.mjs (165).
- Kein node_modules, keine Deps außer node:crypto + node:sqlite.
  Node >= 22.5 nötig (DatabaseSync).
- Größter Architektur-Befund: die "Brücke" hat zwei Parallelwelten —
  runtime.mjs (CLI/Replay-Pfad, liest falsify.db SELBST) und bridge.mjs
  (Live-Pfad, Events werden INJIZIERT). Beide bauen Kontext unabhängig
  voneinander auf. Das ist keine saubere Architektur, es sind zwei.

## 2. Was DOKI heute real tut (IST-Ablauf)

```text
Zwei Einstiege:
(A) CLI: cli.mjs run|rebuild --falsify-db --doki-db
    → liest falsify.db READ-ONLY SELBST (falsify-reader.mjs)
(B) Live: ui/worker.mjs (im FalsifyMe-Repo!) importiert bridge.ingest()
    → FM-EVT wird INJIZIERT, doki.db speichert durable Observations
    → bridge.pump() pollt, claimt Slot, baut Kontext, 1 LLM-Call
```

- Ablauf (B): ingest → observer_observations (exactly-once,
  source_event_id als Identität, Content-Hash-Fallback) → Idle-Loop
  pump() → tryClaimThinkerSlot (BEGIN IMMEDIATE, Heartbeat 15 s,
  Stale-Takeover 120 s) → PROMPT_READY → Kontext-Rekonstruktion aus
  DB (crash-sicher) → THINKER_RUNNING → GENAU 1 Call → OUTPUT_READY
  → narrative_boundary gerückt → COLLECTING.
- Kein Warteschlangen-System eigener Art; es gibt genau EINEN Slot
  (thinker_claims Singleton id=1).
- Kill-Switch: DOKI ruft NUR an, wenn FalsifyMe den Thinker NICHT
  aktiv nutzt (sharedKeyWindowOpen über falsify.db-Zeitstempel).
  Vier Prüfstellen in runtime.mjs (164/183/189/191).

## 3. Falsify-Koppelungen (der Schmutz, alle rg-belegt)

| # | Koppelung | Ort | Zustand |
|---|-----------|-----|---------|
| K1 | falsify.db-Schema in rohem SQL | **GELÖST 2026-09-06 (doki-Commit 18a499b):** falsify-adapter.mjs ist EINZIGER Schema-Kenner; db.mjs falsify-frei; falsify-reader/rotation als Delegations-Shims; Single-Knower-Invariante im mirror.test.mjs statisch eingefroren |
| K2 | FM-Event-Vokabular | **GELÖST 2026-09-06 (18a499b):** doki/src/vocabulary.mjs — DOKI_EVENT_TYPES v1 (CLAIM/CHALLENGE/LIFECYCLE/VERDICT/HANDOFF/COMPLETION/DIAGNOSTIC), normalizeEvent als EINZIGE Übersetzungsstelle (wireType bleibt als Beweis); Consumer vergleichen nur DOKI-Typen; thinker_start/done als benannte Konstante im Adapter; eventSignal markiert DOKI_VOCABULARY vs FM_EVT_LEGACY |
| K3 | Contract-SHA auf FalsifyMe-Freeze-Commit gepinnt, Mismatch → UNAVAILABLE | contracts.mjs:17 (EXPECTED_FALSIFYME_CONTRACT_SHA + Env), runtime.mjs:210 | HART |
| K4 | Thinker-Slot = FalsifyMe-Wahrheit (Kill-Switch über falsify.db) | rotation.mjs:3-21, model.mjs:18, runtime.mjs:164/183/189/191 | HART, aber Signaturen für Ports existieren (thinker-orchestrator.mjs:10) |
| K5 | Config/Modell-Wahrheit: Produktion = Provider von FalsifyMe INJIZIERT; nur CLI liest DOKI_*-Env | bridge.mjs:89, 106-109; model.mjs:10-15 | HALB — "eigene API" existiert nur im CLI-Pfad |
| K6 | DOKI lebt physisch IM FalsifyMe-Checkout; FalsifyMe-Worker importiert bridge (lazy, fail-open) | ui/worker.mjs (FalsifyMe-Repo) → doki/src/bridge.mjs | HART — das Import-Verhältnis ist umgekehrt zur neuen Zweckbestimmung |

Nachtrag 2026-09-06 (18a499b): K1+K2 GELÖST (siehe oben); Tests 85/85 grün;
Spiegel-Ausnahme: falsify-adapter.mjs ist der einzige legitime Handle-Bauer,
Shims (falsify-reader/rotation) fliegen im K4-Schritt. NÄCHSTER SCHRITT: K4
(Slot-Gate als injizierte shouldRun/shouldAbort-Ports).

## 4. Ensembles / Narratoren (IST nach RW-100-Schnitt 2026-09-06)

- 14 Profile als ARCHIV (unverändert im Code), aktiv NUR:
  Buffy (attack), Squizzle (analysis), Null (Langzeit-Arc).
- ROLE_MAP im catalog = EINZIGE Quelle des Event-Routings
  (vorher: 'Thinker'/'Buffy' hart in 3 Dateien — bereinigt).
- userProxy = 'Vannon' archiviert, wird nur für Replay-Historie
  referenziert — ACHTUNG: runtime.mjs:78 schreibt scope-CLAIMs
  weiterhin Vannon zu; der Character hat aber KEINEN Ensemble-State
  mehr (mergeCharacterEvent überspringt nicht-aktive still, Zeile 185).
  DAS IST EIN BEKANNTER DIRTY SPOT: CLAIMs werden gebaut, verlieren
  aber ihren Zustandsanker. Für RW-100 zu klären (OD4-Erweiterung oder
  Routing-Änderung).
- Ensemble-Graph: 3 Charaktere → 6 gerichtete Kanten (vorher 182).
  Alle altdaten mit 14er-Graphen sind inkompatibel zum neuen Zustand.
- Innenleben ist DB-Zustand (character_states, relationships, memories,
  beliefs, q_table) — KEIN innerer Agent. Persönlichkeit statisch
  gefroren. Change-Regel geplant (cause_event_id) aber NOCH NICHT
  implementiert — qlearning schreibt heute ohne cause-Kette.

## 5. Persistenz (doki.db, schema user_version = 2)

21 Tabellen (db.mjs): observations (alt?), observer_observations,
observation_cursor, ingest_cursor, thinker_claims, bridge_state,
history_runs, character_states, character_memory, relationships,
relationship_events, threads, thread_observations, perspectives,
beliefs, conflicts, narrative_outputs, update_jobs, phase_reports,
gaps, q_table, prompt_runs, dialog_messages, rotation_state.
- Zwei Cursor-Systeme parallel: ingest_cursor (Live) vs.
  observation_cursor (Replay) — bewusst getrennt, aber ein Hotspot
  für Verwirrung.
- Keine Migration-Logik außer "neuer als unterstützt → throw" und
  "älter → user_version setzen". Kein echtes ALTER-Management.
- Altdaten mit 14er-Ensemble sind nach der Reduktion ORPHAN
  (Charakter-Zeilen ohne aktives Pendant) — es gibt KEINE
  Bereinigung/Archiv-Tabelle dafür.

## 6. Zustandsmaschinen (IST)

- etats.mjs: 4-Stufen-Leiter OBSERVED→PERSISTED→DERIVED→
  NARRATIVELY_RELEVANT, pure, kein Writer (Persistenz außerhalb).
  Monoton aufwärts, unbekanntes Event = fail-open SKIP
  (accumulateEtats try/catch, Zeile ~190) — SCHNITTSTELLE ZUM
  VERLUST: fehlerhafte Events verschwinden still aus der Akkumulation.
- bridge-Laufzeit: COLLECTING → PROMPT_READY → THINKER_RUNNING →
  OUTPUT_READY (+ Slot-Claim, Heartbeat, Stale-Takeover).
- FAIL-OPEN als Grundhaltung im ganzen Bestand (README-Vertrag):
  DOKI-Fehler dürfen FalsifyMe NIE berühren. Der Plan will DOKI zum
  Orchestrator machen — dieser Vertragsumsturz ist NICHT vollzogen,
  nur geplant (plan/rework §5 RW-006).

## 7. Prompt-Pipeline (IST)

- prompt.mjs: 8 STRIPEs (CONTRACT, CARE, CURRENT_OBSERVATION,
  PHASE_STATE, HISTORY, ENSEMBLE, EVIDENCE, OUTPUT_TASK), alle
  digest-getragen, promptId = sha256 über Kontext+Report+Stripes.
  Deterministisch, getestet.
- CARE-Protokoll (CLAIM/ATTACK/RE_EVALUATE/EVIDENCE) ist als
  STRIPE-CARE verdrahtet; authority: 'NONE' überall erzwungen
  (narrator-context wirft sonst).
- detectInstructionLikeData (prompt.mjs:23): Regex-Heuristik gegen
  Prompt-Injection — rudimentär, leicht zu umgehen, ist aber da.
- temperature 0, max_tokens 600 (bridge.mjs defaultCallModel).
- Narrativ-Output geht in narrative_outputs (narrator_id, promptDigest,
  messageText) — ABER: kein Feed-back in den Zustand (gut), und keine
  Qualitätsmetrik (M1-M3 existieren nur als Planzeilen).

## 8. Tests (IST)

12 Dateien, 74 Tests grün (2026-09-06):
activation, blocks, bridge, etats, falsify-contract (friert das
FM-EVT-Vokabular + UI-137-Lücke ein), full-feature-skeleton,
mirror (statisch: pure-Module importieren kein DB/FM/runtime),
narrator-catalog, persistent-store, reconstruction, replay, runtime.
- mirror.test.mjs + falsify-contract.test.mjs sind die
  Isolations-Wächter — beide müssen bei K1-K4-Ablösung umgeschrieben
  werden, nicht still gelöscht.
- bridge.test.mjs: bekannt flaky in langen Sequenzläufen (1 Fail in
  ~170-s-Läufen, 2/3 grün) — dokumentiert im FalsifyMe-AGENTS.md.

## 9. Konfiguration (IST)

- DOKI_*-Env: DOKI_API_BASE, DOKI_API_KEY, DOKI_GREEN_MODEL,
  DOKI_THINKER_MODEL, DOKI_TIMEOUT_MS (12000), DOKI_MAX_CALLS (6),
  DOKI_TOKEN_BUDGET (1500) — NUR CLI-Pfad.
- Produktion: provider { apiBase, apiKey, model, timeoutMs } wird vom
  FalsifyMe-Worker INJIZIERT (aus core/config.mjs + keys.mjs —
  FALSIFY-Key, NICHT eigener). "USE YOUR OWN API" ist damit heute
  FALSCH als Beschreibung des IST.
- Kein config.json, kein Schema-validiertes Config-Format (OD1 offen).

## 10. Bekannte DIRTY SPOTS (Zusammenfassung für die Planung)

1. Zwei Einstiegspfade (CLI vs. Live-Bridge) mit DOPPELTER
   Kontext-Logik — nicht konsolidiert.
2. K1-K6: Falsify klebt an 6 Stellen (siehe §3) — "eigenständig"
   gilt nur git-seitig, nicht code-seitig.
3. Vannon-CLAIM-Routing tot (§4): Block wird gebaut, Zustandsanker
   fehlt still.
4. fail-open SKIP in accumulateEtats = stiller Datenverlust bei
   kaputten Events.
5. Keine cause_event_id-Kette im Beziehungszustand — die
   Anti-Kontaminations-Regel aus dem Plan ist noch nicht Code.
6. Orphan-Daten nach Narrator-Reduktion unbehandelt.
7. Contract-SHA-Pin (K3) macht das doki-Repo allein nicht lauffähig
   ohne falsify-Seite.
8. M1-M3-Messkriterien existieren nur im Plan — es gab NULL
   Messungen der Prompt-Qualität. Alle "gute Ergebnisse"-Aussagen
   sind unbelegt.
9. Bridge-Test-Flake ungeklärt.
10. Fallback-Zip (Documents/snap) ist Stand MIT Narrator-Reduktion,
    aber VOR eigenem Init — keine Recovery für das doki-Repo selbst.

## 11. Was NICHT im IST ist (nur im Plan — Verwechslungsschutz)

- Globales ID-System (Ketten/Primzahl-Mix) — nur Planzeilen (RW-001).
- Bundle/Lane-Topologie — nur Plan (RW-002/003).
- Backend-Prozess / dünnes TUI — nur Plan (RW-101).
- Orchestrator-Rolle / User-Agent-Kanal — nur Plan (RW-006).
- Eigene API im Produktionspfad — nur Plan (K5-Ablösung, RW-005).
- cause_event_id, M1-M3-Harness, aktive Datennutzung — nur Plan (RW-100).
