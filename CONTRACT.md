# DOKI Architekturvertrag — CONTRACT v2 (Conformance-fähig)

Eingefroren am 2026-09-06 als Wurzel-Dokument des Reinit. Änderungen nur
als neue Version (v3) mit Begründung und eigener Commit-Entscheidung —
nie still, nie retcon.

Jede Regel trägt die **7-Punkt-Conformance-Struktur**:

```text
POSITIVE   — der Fall, in dem die Regel gilt
FORBIDDEN  — der Fall, der abgewiesen wird
FALLBACK   — was bei Nichterfüllung passiert
ERROR      — maschinenlesbarer Fehlerstatus
TRACE      — Herkunfts-/Provenanzkette
REPLAY     — Replay-Verhalten (deterministisch vs. semantisch)
INVARIANT  — testbare Zusicherung
```

Eine Regel ist erst implementiert, wenn sie falsifizierbar ist: alle 7
Punkte zeigbar. Sonst ist sie Philosophie, kein Vertrag.

Oberstes Architekturprinzip:

```
DOKI MAY DERIVE,
BUT NOTHING DERIVED BECOMES AUTHORITY
WITHOUT AN EXPLICIT RUNTIME RULE.
```

---

## §1 Plattformgrundsatz

DOKI ist die BASISPLATTFORM. Alles andere hängt als Add-on daran.

```
DOKI BASIS: Orchestrator | State | Events | Identity | Memory | Agents
            Narrative | Persistence | Runtime | UI
                        │
                  ADDON CONTRACT
            ┌───────────┼───────────┐
            ▼           ▼           ▼
         FALSIFY      LIMEN        ...
```

- Ein Add-on darf DOKI erweitern. DOKI darf NICHT von einem bestimmten
  Add-on abhängen.
- NARRATIVE und SECOND BRAIN sind Basisfähigkeiten, keine Add-ons.
- FALSIFY und LIMEN sind nicht der Sinn von DOKI — sie sind Beweise,
  dass die Basis etwas kann.

Nordstern: **DOKI macht Agenten zu persistenten, rekonstruierbaren
Akteuren statt zu einzelnen LLM-Aufrufen.**

Conformance:
- POSITIVE: DOKI läuft standalone mit eigenem Event-Vokabular, eigenem
  Denken, eigenen Stimmen.
- FORBIDDEN: ein Kernmodul importiert Falsify/LIMEN-spezifische Logik.
- FALLBACK: fehlt ein Add-on → DOKI läuft, nur die Addon-Fähigkeit fehlt.
- ERROR: `ADDON_DEPENDENCY_VIOLATION` (statischer Scan).
- TRACE: Import-Graph je Modul.
- REPLAY: Import-Graph deterministisch prüfbar.
- INVARIANT: Addon-Entfernung bricht keine Core-Invariante (Test).

## §2 Der Hebel

```
EVENTS → deterministische Zustandsableitung → MEMORY | AGENTS | NARRATIVE → ORCHESTRATION
```

Agent ≠ Prompt + LLM. Agent = Identity + State + Memory + Relations +
History + Role + Orchestration.

## §3 Schichten und Fluss (ONE-WAY)

```
REALITY → OBSERVATION → SECOND BRAIN → AGENT STATE → DOKI BRAIN → REACTION → OUTPUT
```

- SECOND BRAIN = Kontext-Gedächtnis (beobachtet → persistiert →
  relevant? → granuliert → gezielter Kontext). Granulierung OHNE API.
- DOKI BRAIN = narrative/soziale Schicht ("Was sage ich?").
- ONE WAY: NARRATIVE X→ REAL STATE. Narrativ-Output ist nie Input des
  technischen Zustands.

## DOKI-NARR-001 — Richtungsregel (formal)

```text
REALITY → OBSERVATION → SECOND BRAIN → NARRATIVE → CHAT
Nicht: CHAT/NARRATIVE → TECHNICAL REALITY
```

Conformance:
- POSITIVE: Narrative annotiert State sichtbar als abgeleitet.
- FORBIDDEN: Prosa bewegt State; State braucht Runtime-Ursache.
- FALLBACK: kein Prose-to-State-Pfad.
- ERROR: `NARRATIVE_STATE_MUTATION_ATTEMPT`.
- TRACE: jede State-Änderung mit cause_event_id.
- REPLAY: gleiche Events → gleiche State-Sequenz.
- INVARIANT: PROSE ≠ STATE MUTATION (auch der Versuch)._relationship_tension
  als Cause ist ein VALIDierter State-Eintrag mit eigener Event-Ursache,
  nie eine narrative Selbst-Einschätzung; daraus folgt DOKI-NARR-002-Loop-Guard:
  Sie darf nur aus OBSERVIERTER Interaktionshistorie abgeleitet sein, und
  der Sprech-Kandidat muss eine cause_event_id tragen, die NICHT aus
  eigener Prosa stammt (keine Selbst-Berechtigung zum Reden über die
  eigene Spannung).

## DOKI-CONF-001 — drei Confidence-Domänen

```text
capture_confidence     → Sicherheit der Erfassung
inference_confidence   → Sicherheit der Interpretation
policy_relevance_confidence → Sicherheit der Relevanzentscheidung
```

Conformance:
- POSITIVE: capture 0.99 mit inference 0.31 ist gültig und bleibt zweigeteilt.
- FORBIDDEN: automatische Übertragung capture → inference (auch nicht
  durch Zeit oder fehlenden Widerspruch).
- FALLBACK: fehlt eine Domain → niedrigster Wert; keine Synthese.
- ERROR: `CONFIDENCE_DOMAIN_COLLAPSE`.
- TRACE: jede Confidence mit Domain-Typ am Artefakt.
- REPLAY: deterministisch aus gleicher Evidenz.
- INVARIANT: hohe Capture-Sicherheit rechtfertigt nie allein hohe
  Interpretationssicherheit.

## DOKI-EVID-001 — unabhängige Evidenz

```text
frequency = 20
→ NICHT automatisch evidence_strength = 20
ohne Prüfung der Unabhängigkeit
```

Unterschieden: raw occurrences / unique occurrences / independent
evidence. Session-Spam bläht nichts auf.

Conformance:
- POSITIVE: 20 echte, datierbare, unterschiedliche Vorkommnisse mit
  expliziter Unabhängigkeitseinstufung.
- FORBIDDEN: Spam/Retries/identische Nachricht zählen als 20 Evidenz.
- FALLBACK: Unabhängigkeit unbekannt → als NICHT unabhängig behandeln
  (konservativ, nie mehr Evidenz annehmen als belegbar).
- ERROR: `INDEPENDENCE_UNPROVEN`.
- TRACE: jede Evidenz mit Unabhängigkeitsklassifikation.
- REPLAY: deterministisch.
- INVARIANT: RED LINE bleibt doppelt bestehen —
  FREQUENCY ≠ CONFIDENCE **und** FREQUENCY ≠ INDEPENDENT EVIDENCE.
  Beide sind wahr und unabhängig wichtig: häufige Beobachtungen können
  unabhängig sein UND trotzdem unsicher interpretiert werden.

## §5 Identität

- `actor_id` = technische Kontinuität. `persona_id`/`base_identity` =
  bewusst gesetzter, GEFRORENER Kern. `emergent` = rekonstruierte
  Entwicklung als persistierter, versionierter Zustand — keine zweite
  Identitätswurzel.
- BASE IDENTITY wird nach dem Freeze nie in-place geändert. Widersprüch-
  liche Evidenz ist ein Zustandsfakt oder führt zu einem neuen,
  versionierten Re-Freeze mit Ursache — nie zu stiller Mutation.
- Emergent darf die Präsentation innerhalb der Basis verändern, nie die
  Basis selbst überschreiben.
- SAME ACTOR TOMORROW = actor_id + frozen base_identity + geordnete
  Event-Historie + Zustandsregeln/Version + emergenter Zustand + Memory +
  Beziehungszustand. **Nicht das LLM.**
- DOKI = 1 Actor ≠ 1 Prompt ≠ 1 Session.

Conformance:
- POSITIVE: Neustart rekonstruiert Akteur aus persistierten Ankern.
- FORBIDDEN: Basis wird von Zustands-Drift stillschweigend überschrieben.
- FALLBACK: Widerspruch → neuer versionierter Freeze mit Ursache.
- ERROR: `IDENTITY_MUTATION_WITHOUT_FREEZE`.
- TRACE: Freeze-Version je Akteur.
- REPLAY: gleiche Historie → gleicher Akteur-Zustand.
- INVARIANT: BASIS IDENTITY ≠ EMERGENT STATE.

## §6 Epistemik

- Jede persistierte Tatsache trägt: `source, source_type, source_actor,
  scope, observed_or_derived, created_at, confidence, evidence`.
- Observation ≠ Inference: der erste nicht-abgeleitete Schritt bleibt
  auffindbar. Kettengrenze: wird die Kette opak, wird der Claim
  geschwächt oder pausiert — nie still verstärkt.
- Widerlegung ist Statusänderung (schwächer / pausiert / konfligierend /
  ersetzt), kein stilles Löschen.

## DOKI-INF-001 — Inference-Quellen (Gate)

Inference darf nur aus DEKLARIERTEN Quellen entstehen. Gate:

```text
candidate-inference
  → hat deklarierte Quelle?           sonst ERROR
  → referenziert ihre Inputs?         sonst ERROR
  → hat sichtbare Evidenzkette?       sonst FALLBACK niedrigere Confidence
  → bleibt bis zu Observations
     zurückverfolgbar?                sonst FALLBACK Pausierung
```

Conformance:
- POSITIVE: Inference mit Quelle, Inputs, Kette, Auffindbarkeit.
- FORBIDDEN: Ad-hoc-Inference im Prompt-Builder oder sonstiger
  Runtime-Komponente ohne deklarierte Quelle.
- FALLBACK: opake Kette → Claim wird geschwächt/pausiert.
- ERROR: `INFERENCE_SOURCE_UNDECLARED`.
- TRACE: erste nicht-abgeleitete Stufe auffindbar.
- REPLAY: deterministisch.
- INVARIANT: INFERENCE braucht Provenance.

## DOKI-INF-002 — Kettentiefe

Kette muss bis zu Observations zurückverfolgbar bleiben; Kettenlänge
erhöht nicht automatisch Belastbarkeit. Keine numerische Tiefengrenze
im v2-Vertrag (bleibt in §18 Open Architecture Decisions als
`exakte Inference-Tiefengrenze`) — sobald implementiert: als
konfigurierbarer Parameter mit ehrlichem Default, nie hart im Code.

Conformance:
- POSITIVE: jede Kette auflösbar bis zu nicht-abgeleiteten Fakten.
- FORBIDDEN: selbstreferenzielle Endlos-Kette ("Der User ist halt so").
- FALLBACK: Kette schwächt sich mit Tiefe — nie verstärkt sie sich.
- ERROR: `INFERENCE_CHAIN_OPAQUE`.
- TRACE: vollständige Kette.
- REPLAY: deterministisch.
- INVARIANT: jede Inference weiß, welche Beobachtung sie trägt.

## §7 Scope und Ownership

- Scope-Katalog (v0.1): global, agent, user, relationship, session,
  task, project, conversation. Scope ist Sichtbarkeits- und
  Transferregel, nicht Etikett. (Transfermatrix bleibt in §18 offen.)
- Ownership getrennt: `owner` ≠ `subject` ≠ `observer`. "Über den User"
  ist nicht "dem User gehörend".
- Scope-Übergänge sind explizite, versionierte Regeln. Default: eng.
- Visibility = Autorisierungsregel pro Akteur, nicht nur "ist relevant".

## DOKI-MEM-002 — Memory → Prompt als Gate-Kette + Ausschluss-Codes

Inklusion ist eine Gate-Kette, nie `relevant === true`:

```text
scope check → ownership check → agent visibility → task relevance
→ confidence threshold → freshness/decay → prompt budget → included
```

Ausschluss ist OBSERVABLE: jede Memory, die NICHT in den Prompt geht,
bekommt einen maschinenlesbaren Grund:

```text
SCOPE_DENIED / NOT_VISIBLE / NOT_AUTHORIZED / LOW_RELEVANCE /
LOW_CONFIDENCE / STALE / CONFLICTED / BUDGET_EXCEEDED
```

Budget-Kollision (Relevanz vs. Budget) entscheidet DETERMINISTISCH in
dieser Ordnung:

```text
1. authorization validity
2. task relevance
3. confidence
4. freshness
5. evidence support
6. deterministic stable tie-break
```

Begründung: Autorisierung hat Vorrang vor Relevanz — eine höchst
relevante aber scope-verletzende Memory kommt nie rein. (Bewusste
Abwägung: evidence support steht bewusst hinter Relevanz —
gut belegte, aktuell unrelevante Memories können herausfallen; dies
wird als WILLE des Vertrags erklärt, nicht als Nebenwirkung.)

Conformance:
- POSITIVE: jede Inklusion/Ausschluss-Entscheidung ist aus der
  Gate-Kette + Prioritätsordnung rekonstruierbar.
- FORBIDDEN: `relevant === true` als einzige Schwelle; schwarzes Loch
  namens "Context Selection".
- FALLBACK: alle Kandidaten abgewiesen → definierter Leerkontext mit
  Grundprotokoll.
- ERROR: Ausschlusscode (s. o.).
- TRACE: Ausschlusscodes + Gate-Stufen je Memory.
- REPLAY: gleicher Zustand → gleiche Inklusionsentscheidung.
- INVARIANT: Context Selection ist rekonstruierbar; "nicht im Kontext"
  ist präzise (nicht geladen ≠ geladen und verworfen ≠ bekannt aber
  nicht materialisiert ≠ unter Threshold).
- Granularität: raw event → observation → pattern → hypothesis →
  summary. Eine Summary darf nie die einzige verbleibende
  Repräsentation sein.

## DOKI-EPI-001 — epistemische Unsicherheit als valider Zustand

```text
KNOWN / UNCERTAIN / CONFLICTED / UNKNOWN
```

Conformance:
- POSITIVE: "Wir wissen es nicht" ist ein legitimer Systemzustand.
- FORBIDDEN: UNKNOWN wird durch Drift (Zeit, fehlender Widerspruch,
  Wiederholung) zu KNOWN.
- FALLBACK: UNCERTAIN/UNKNOWN führt zu geschwächter Nutzung
  (niedrigere Policy-Relevanz), nie zu Scheinwissen.
- ERROR: `EPISTEMIC_DRIFT_DETECTED`.
- TRACE: Statuswechsel mit Grund (Gegenbeweis, Rule-Change, Decay,
  explizite Refutation — Alter allein ist kein voller Grund).
- REPLAY: Statuswechsel deterministisch.
- INVARIANT: **UNKNOWN MUST NOT BECOME KNOWN BY DRIFT.**

## §10 Output-Vertrag

- JEDER INPUT bekommt eine Antwort. Nie "ich sammle erstmal", nie
  "kein Output nötig", nie "warte auf mehr Kontext". Die Frage ist nur,
  wie teuer die Antwort ist.
- Output-Klassen: LOCAL (deterministisch/Template/state-aware),
  NARRATIVE (Zustand + Persona + Beziehungen), LLM (komplexe
  sprachliche Realisierung). Immer die einfachste Klasse, die genügt.
- 429/Timeout/API down bedeutet niemals "User bekommt nichts": lokale
  State-Änderung läuft weiter, lokaler Output-Kandidat wird erzeugt,
  der API-Call ist genau EIN optionaler Renderer-Schritt.
- LLM FAIL ≠ RUNTIME FAIL.

Conformance:
- POSITIVE: API down → LOCAL/NARRATIVE-Output, State weiter.
- FORBIDDEN: "keine Antwort" als Zustand; API-Ausfall blockiert State-Entscheidungen.
- FALLBACK: LOCAL-Output ist ehrlich (kein Anschein von LLM-Qualität).
- ERROR: `LLM_UNAVAILABLE` (sichtbar, begrenzt).
- TRACE: Output-Klasse als gewählte Entscheidung.
- REPLAY: LOCAL exakt; LLM semantisch.
- INVARIANT: EVERY USER INPUT → OUTPUT.

## §11 Narrative Ebene, Vorlaut, Rote Linien

- DOKI = Orchestrator + eigener Charakter + 1 von 3 Stimmen — nicht
  Chef der anderen Persönlichkeiten. Drei Narratoren = drei persistente
  Akteure mit eigenem State unter EINER geteilten Runtime.
- VORLAUT ≠ AUTORITÄT: Die Stimmen dürfen Theater spielen, lügen,
  provozieren, Unsinn ankündigen ("Ich lösch kurz deine State Machine,
  okay?" → "Nee, war Spaß, Kleiner.") — die technische Realität bleibt
  unverändert.
- DOKI DARF NICHT: die DB manipulieren, die technische State Machine
  verändern, den Scope brechen, Agents blockieren, mit der Coding-LLM
  kommunizieren.

## §12 Scheduler

## DOKI-SCHED-001 — Kaskade und Museum Break

```text
CAUSE → MUSEUM BREAK → SCREEN-TIME BALANCE → USER BIAS → SEEDED RNG
```

- CAUSE: new_event, direct_interaction, relationship_tension,
  open_thread, unanswered_statement, memory_trigger, scheduled_action.
  "Der Narrator fühlte sich gesprächig" ist kein Grund.
- USER BIAS gewichtet nur zwischen validen Kandidaten — er überstimmt
  niemals eine echte Ursache.
- MUSEUM BREAK = semantische Deduplizierung über
  `intent + claim + target + cause`: gleicher Claim/gleiche Intention/
  gleiches zugrunde liegendes Event = ein Gedanke in drei Hüten.
  Stilvariation allein reicht nie.
- **DIVERSITY_UNKNOWN-Fallback:** Kann semantische Gleichheit nicht
  zuverlässig festgestellt werden, darf das System NICHT so tun, als
  sei Vielfalt bewiesen. Fallback-Zweig: beide Kandidaten werden
  NICHT beide zugelassen; es geht der zuverlässigste Kandidat in die
  Screen-Time-Balance, der Rest wird mit
  `DIVERSITY_UNRESOLVED` protokolliert und übergangen. (Kein
  Rätselraten auf Kosten der Nutzererfahrung: Eins statt Echo.)

Conformance:
- POSITIVE: drei Stimmen = drei unterschiedliche Claims/Intents.
- FORBIDDEN: Echo mit drei Hüten; Stilvariation als Diversitätsbeweis.
- FALLBACK: DIVERSITY_UNRESOLVED wie oben.
- ERROR: `DIVERSITY_UNKNOWN` / `DIVERSITY_UNRESOLVED`.
- TRACE: Museum-Break-Entscheidung je Kandidatenpaar.
- REPLAY: deterministisch.
- INVARIANT: keine semantische Duplikation als "Diversität".

## DOKI-SCHED-002 — Zero-Candidate-Fall

Alle Kandidaten fliegen (Museum Break / Causes leer) → SCHWEIGEN mit
rekonstruierbarem Grund ist der DEFAULT: `NO_SPEAKER_REASON: <code>`.
Kein unbestimmter Stillstand, keine erzwungene Pflichtäußerung.

Conformance:
- POSITIVE: leerer Speaker-Slot ist legitim und erklärt.
- FORBIDDEN: Erzwingen einer Äußerung ohne Cause.
- FALLBACK: definierte, konfigurierbare Fallback-Aktion (z. B. lokale
  Warteaufforderung mit Grund), nie Pflicht-Noise.
- ERROR: `NO_SPEAKER_REASON`.
- TRACE: Kandidatenliste + Ausschlussgrund.
- REPLAY: deterministisch.
- INVARIANT: Scheduler hat für JEDE Eingangsbelegung ein definiertes
  Verhalten — auch für 0.

## §13 User-Modell und Q

## DOKI-REL-001 — ZUSTIMMUNG ≠ ÜBERZEUGUNG

Vier getrennte Social-States:

```text
user_decision          — was der User entschieden hat
agent_belief           — was der Agent für wahr hält
relationship_reaction  — wie die Interaktion die Beziehung bewegt
future_consequence     — die sachliche Erwartung über den Ausgang
```

- `user_decision = A` und `agent_belief = B` koexistieren. Kein
  reflexives "okay, du hast recht, also glaube ich jetzt dasselbe".
- Der Agent kann zustimmen, ausführen, akzeptieren — und trotzdem seine
  eigene Einschätzung behalten und relevante Konsequenzen mitgeben.

Conformance:
- POSITIVE: Agent führt A aus und äußert B-Bezug ehrlich.
- FORBIDDEN: Belief-Überschreibung durch Decision.
- FALLBACK: Belief bleibt, Konfliktdarstellung ehrlich.
- ERROR: `BELIEF_OVERWRITTEN_BY_DECISION`.
- TRACE: vier Felder je Interaktion.
- REPLAY: deterministisch.
- INVARIANT: USER DECISION ≠ AGENT BELIEF.

- User Model entsteht aus Wiederholung + Pattern + Match Rate +
  Confidence + Scope + Quelle — nie aus einer einzelnen Aussage.
  Widerlegung ist Statusänderung (s. DOKI-EPI-001), kein Löschen —
  sonst entsteht ein digitaler Gerichtsstenograf, der nur Anklage sammelt.
- Q-Learning ist Verhaltensbias, nie Wahrheit: Q darf
  Reaktionspräferenzen ändern, nie Evidenz, Scope oder Bedeutung.

## §14 Persönlichkeit

- Unveränderlich: BASE IDENTITY (Freeze). Emergent: current state,
  relationships, disposition, voice delta.
- Emergente Zustände brauchen Bounds, Decay und Baseline-Rückkehr —
  keine unbegrenzte Selbstverstärkung. Aus `irritation +0.05` hundertmal
  wird keine andere Persönlichkeit, die nie freigegeben wurde.
- HOW HE IS = State/Disposition. HOW HE SOUNDS = Voice Delta.

## §15 Rekonstruktion als oberster Test

```
INPUT → OBSERVATIONS → STATE CHANGES → ACTIVE MEMORIES → VISIBLE SCOPE
      → NARRATIVE CANDIDATES → SCHEDULER DECISION → VOICE DELTA → OUTPUT
```

Wenn irgendwann nur noch steht "doki felt like saying this", ist die
Architektur kaputt. Rekonstruktion gilt für Systementscheidungen
exakt/deterministisch; LLM-Prosa ist semantisch, nicht bytegenau
replay-bar.

## §16 Rote Linien (konsolidiert, v2)

```text
 1. BASE IDENTITY ≠ EMERGENT STATE
 2. FREQUENCY ≠ CONFIDENCE
 3. FREQUENCY ≠ INDEPENDENT EVIDENCE (neu, neben 2)
 4. USER DECISION ≠ AGENT BELIEF
 5. NARRATIVE ≠ TECHNICAL AUTHORITY
 6. PROSE ≠ STATE MUTATION
 7. LLM ≠ SOURCE OF TRUTH
 8. MEMORY ≠ SECOND TRUTH
 9. SECOND BRAIN ≠ NARRATIVE BRAIN
10. DOKI ≠ FALSIFY
11. ADDON ≠ CORE DEPENDENCY
12. LLM FAILURE ≠ RUNTIME FAILURE
13. REPLAY ≠ bytegleiche LLM-Prosa
14. EVERY USER INPUT → OUTPUT
15. AGENT IDENTITY überlebt Sessions
16. INFERENCE braucht Provenance
17. UNKNOWN MUST NOT BECOME KNOWN BY DRIFT (neu)
18. DOKI MAY DERIVE — NOTHING DERIVED BECOMES AUTHORITY
    WITHOUT AN EXPLICIT RUNTIME RULE (Oberprinzip)
```

## §17 Nicht eingefrorene Detailverträge (Implementierungs-Vorbehalt)

Ein Coder darf hier KEINE eigene Semantik erfinden und als DOKI-Regel
etablieren. Diese Punkte werden als versionierte Detail-Entscheidungen
nachgezogen, nicht als Implementierungs-Nebenwirkung:

```text
exakter numerischer Confidence-Algorithmus je Domain
exakte Decay-Funktion (Memory/Disposition)
exakte Q State-/Action-Vektoren und Update-Regel
exakte Voice-Delta-Achsen und Bounds
exakte Inference-Tiefengrenze (dann als Parameter)
exakte Scope-Transfermatrix (wer liest worüber hinweg)
exakte "Gleich"-Normalisierung des Museum Break
exakte Trigger-/Queue-Semantik proaktiver Aktionen
echte Parallelität vs. deterministisch geordnete Ausführung
exakte Replay-Bytegenauigkeit pro Artefakt
vollständige Fehlerklassen-Taxonomie (recovern/einfrieren/verwerfen)
```

## §18 Verhältnis zu Code und Tests

- Stand bei Freeze: K1–K4 von FalsifyMe abgelöst (falsify-adapter als
  einziger Schema-Kenner, eigenes Event-Vokabular, generischer
  Adapter-Vertrag, Slot-Gate als Port), 95/95 Tests grün, aktives Trio
  Squizzle / Null / Argos.
- Dieser Vertrag bindet jede künftige Implementierung. Ein Coder sagt
  nicht "ich dachte, das wäre so gemeint", sondern "§X / DOKI-YY sagt
  dies, Fallback Z, deshalb Implementierung A".
- Die Conformance-Struktur (7 Punkte) macht jede Regel zu einer
  Testspezifikation: Die 18 Roten Linien und die formalen Regeln sind
  als Tests auszudrücken, sobald die betroffenen Module existieren.
  Ein neuer Feature-Vorschlag wird am Oberprinzip geprüft: "Produziert
  das etwas Abgeleitetes? Hat das Abgeleitete eine explizite
  Runtime-Regel, die ihm Autorität gibt?" Wenn nein — es darf keinen
  Effekt haben.
