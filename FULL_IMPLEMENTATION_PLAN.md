# Doki Architecture Contract v0.1

## Zweck

Dieser Vertrag definiert die unverzichtbaren semantischen Grenzen von Doki.

Er beschreibt nicht, wie eine konkrete Datenbank, Klasse oder API implementiert werden muss. Er definiert, was das System **bedeuten muss**, welche Zustände zulässig sind und welche Übergänge verboten sind.

Eine Implementierung ist nur konform, wenn sie diese Regeln reproduzierbar erfüllen kann.

---

# IDENTITY

## DOKI-IDENT-001 — Actor Identity

### Definition

Ein Actor ist eine persistente technische Einheit mit:

```text
actor_id
+
frozen base_identity
```

`actor_id` ist der stabile technische Identifikator.

`base_identity` ist die eingefrorene Basisdefinition des Actors.

Aktueller Zustand, Memory, Beziehungen, Beliefs, Disposition und historische Änderungen sind **nicht** Bestandteil der Identität.

### Erlaubt

```text
actor_id bleibt gleich
state verändert sich
relations verändern sich
memory verändert sich
beliefs verändern sich
disposition verändert sich
voice_delta verändert sich
```

### Verboten

```text
state verändert sich
→ actor_id wechseln

emergent state verändert sich
→ base_identity automatisch überschreiben
```

### Fallback

Fehlt `actor_id` oder eine gültige frozen `base_identity`, darf kein bestehender Actor rekonstruiert werden.

Der Zustand wird als nicht eindeutig identifiziert behandelt.

### Fehlerstatus

`IDENTITY_UNRESOLVED`

### Replay

Gleicher `actor_id` + gleiche frozen `base_identity` + gleiche gültige Historie müssen denselben Actor referenzieren.

### Invariant

```text
STATE CHANGE ≠ IDENTITY CHANGE
```

### Verletzung

Ein Actor wird nach einem Neustart neu erzeugt, nur weil seine aktuelle Persönlichkeit stark von der ursprünglichen Basis abweicht.

---

## DOKI-IDENT-002 — Frozen Base Identity

### Definition

Die Base Identity wird nach dem Freeze nicht stillschweigend durch spätere Evidenz ersetzt.

Widersprechende Evidenz erzeugt keinen automatischen Retcon.

### Erlaubt

```text
base_identity = A
evidence später = widerspricht A
→ contradiction / outdated exposure / neue Version
```

### Verboten

```text
evidence widerspricht A
→ base_identity automatisch auf B setzen
```

### Fallback

Ein Konflikt wird explizit als Konflikt persistiert.

### Fehlerstatus

`IDENTITY_CONFLICT`

### Invariant

```text
EMERGENT STATE MUST NOT SILENTLY REWRITE FROZEN IDENTITY
```

---

# OBSERVATION

## DOKI-OBS-001 — Observation Definition

Eine Observation ist der kleinste persistierbare, nachvollziehbare Grunddatensatz, auf den spätere Ableitungen zurückgeführt werden können.

Eine Observation benötigt mindestens:

```text
observation_id
provenance
scope
source
observer
observed_or_derived
payload
timestamp/order information
```

Nach erfolgreicher Persistierung ist die Observation unveränderlich.

### Erlaubt

```text
Raw Input
→ validieren
→ Observation erzeugen
→ persistieren
```

### Verboten

```text
Raw Input
→ direkt als Memory / Belief / User Model behandeln
```

### Fallback

Fehlt ein Pflichtbestandteil:

```text
PENDING
oder
REJECTED
```

aber nicht `OBSERVED`.

### Fehlerstatus

`OBSERVATION_INVALID`

### Replay

Dieselbe gültige Observation mit denselben Identitäts- und Provenance-Daten darf nicht als zweites Ereignis entstehen.

### Invariant

```text
PERSISTED OBSERVATION = IMMUTABLE FACT RECORD
```

### Verletzung

Ein LLM analysiert einen Chat-Abschnitt und schreibt direkt:

```text
user_trait = impatient
```

ohne vorherige persistierte Observation.

---

# PROVENANCE

## DOKI-PROV-001 — Every Persistent Claim Has Origin

Jede persistierte Information außer rein technischem transientem Runtime-Zustand muss auf eine Herkunft zurückgeführt werden können.

Mindestens logisch erforderlich:

```text
source
source_type
observer
subject
scope
cause / parent reference
observed_or_derived
```

### Verboten

```text
claim exists
but nobody can explain its origin
```

### Fallback

Nicht ausreichend belegbare Information darf nicht als belastbare Information persistiert werden.

### Fehlerstatus

`PROVENANCE_MISSING`

### Invariant

```text
NO ORIGIN → NO AUTHORITATIVE PERSISTENCE
```

---

# INFERENCE

## DOKI-INF-001 — Inference Is Gated

Inference ist kein automatischer Folgeeffekt jeder Observation.

Der erlaubte Weg lautet:

```text
OBSERVATION
    ↓
[allowed inference rule?]
    ↓
INFERENCE
    ↓
[allowed behavioral use?]
    ↓
BEHAVIORAL EFFECT
```

### Erlaubt

Eine Inference darf nur entstehen, wenn:

```text
gültige Eingaben vorhanden
+
definierte Regel / erlaubte Quelle
+
Provenance auf Inputs
```

### Verboten

```text
Observation
→ freie semantische Expansion
→ weitere Expansion
→ Behaviour
```

ohne definierte Gates.

### Fallback

Bei unklarer oder ungültiger Grundlage bleibt die Information:

```text
OBSERVED
```

oder wird als:

```text
INFERENCE_UNCERTAIN
```

geführt.

### Fehlerstatus

`INFERENCE_NOT_AUTHORIZED`

### Invariant

```text
NO IMPLICIT INFERENCE ESCALATION
```

---

## DOKI-INF-002 — Inference Chain

Eine Inference darf auf früheren Inferences aufbauen, solange jede Stufe ihre unmittelbaren Vorgänger und die verwendete Regel referenziert.

Eine Kette darf nicht zu einer selbsttragenden Evidenzquelle werden.

### Prinzip

```text
Observation
  ↓
Inference A
  ↓
Inference B
  ↓
Inference C
```

ist zulässig, solange die Kette bis zu belastbaren Observations zurückverfolgbar bleibt.

Je weiter eine Aussage von den Observations entfernt ist, desto weniger darf bloße Kettenlänge ihre Belastbarkeit erhöhen.

### Verboten

```text
A wird mit B begründet
B wird mit C begründet
C wird mit A begründet
```

### Fehlerstatus

`INFERENCE_CHAIN_UNGROUNDED`

### Invariant

```text
DERIVED INFORMATION MUST REMAIN GROUNDED
```

---

# CONFIDENCE

## DOKI-CONF-001 — Confidence Domains

Doki behandelt mindestens drei getrennte Confidence-Dimensionen:

```text
capture_confidence
inference_confidence
policy_relevance_confidence
```

Sie dürfen nicht automatisch ineinander überführt werden.

### Bedeutung

`capture_confidence`

> Wie sicher ist die Erfassung des beobachteten Inputs?

`inference_confidence`

> Wie sicher ist die daraus gezogene Interpretation?

`policy_relevance_confidence`

> Wie sicher ist die Entscheidung, dass diese Information für die aktuelle Verwendung relevant genug ist?

### Verboten

```text
high capture confidence
→ automatically high inference confidence
```

### Invariant

```text
OBSERVATION CONFIDENCE ≠ INFERENCE CONFIDENCE
```

---

# INDEPENDENT EVIDENCE

## DOKI-EVID-001 — Independent Evidence

Zwei Vorkommnisse gelten nur dann als unabhängige Evidenz, wenn sie auf unterschiedliche evidenzielle Ursprünge zurückgeführt werden können.

Wiederholung desselben zugrundeliegenden Ereignisses zählt nicht automatisch als neue unabhängige Evidenz.

### Beispiele

```text
ein Event
→ drei gerenderte Nachrichten
```

ist **eine** Evidenzquelle.

```text
drei getrennte Interaktionen
→ drei eigenständige Events
```

können **drei** Evidenzquellen sein.

### Verboten

```text
frequency = 20
→ evidence_strength = 20
```

ohne Prüfung der Unabhängigkeit.

### Fallback

Ist Unabhängigkeit nicht bestimmbar, wird die Evidenz konservativ als nicht unabhängig behandelt.

### Fehlerstatus

`EVIDENCE_INDEPENDENCE_UNKNOWN`

### Invariant

```text
REPETITION ≠ INDEPENDENCE
```

---

# SCOPE & VISIBILITY

## DOKI-SCOPE-001 — Scope

Information besitzt einen expliziten Scope.

Der v0.1-Grundkatalog ist:

```text
global
user
actor
relationship
session
conversation
project
task
```

Ein konkretes System darf weitere Scopes einführen, aber keinen bestehenden Scope semantisch umdeuten.

### Verboten

Eine Information wird nur aufgrund ihrer Existenz automatisch in einen weiteren Scope übertragen.

### Fallback

Ungeklärte Scope-Zuordnung:

```text
SCOPE_UNRESOLVED
```

und keine automatische Verbreitung.

---

## DOKI-SCOPE-002 — Scope Transfer

Scope-Übertragung ist ein expliziter Vorgang.

```text
scope A
→ [authorized transfer rule]
→ scope B
```

Nicht:

```text
scope A
→ system happens to reuse it in B
```

### Invariant

```text
PERSISTENCE DOES NOT IMPLY SCOPE EXPANSION
```

---

## DOKI-VIS-001 — Visibility

Sichtbarkeit ist eine eigenständige Prüfung.

```text
EXISTS
≠
VISIBLE
```

Ein Actor darf eine Information nur verwenden, wenn:

```text
scope allows
+
visibility allows
+
ownership rules allow
+
actor is permitted
```

### Verboten

```text
relevant = true
→ therefore visible
```

### Fallback

Bei unbekannter Autorisierung:

```text
NOT_VISIBLE
```

### Fehlerstatus

`VISIBILITY_UNRESOLVED`

---

# MEMORY

## DOKI-MEM-001 — Memory Is Derived Working Knowledge

Memory ist keine zweite Wahrheit.

```text
Event Log = source of truth
Observation = stabilized evidence
Memory = derived working representation
Narrative = presentation
```

Memory muss auf seine Quellen zurückführbar bleiben.

### Verboten

Eine Memory-Zusammenfassung ersetzt dauerhaft alle Quellen, sodass Rekonstruktion unmöglich wird.

### Invariant

```text
MEMORY ≠ SOURCE OF TRUTH
```

---

## DOKI-MEM-002 — Memory to Context Gate

Memory wird nicht aufgrund bloßer Relevanz in einen Prompt übernommen.

Die minimale Reihenfolge lautet:

```text
MEMORY
 ↓
SCOPE
 ↓
VISIBILITY
 ↓
OWNERSHIP/PERMISSION
 ↓
TASK RELEVANCE
 ↓
CONFIDENCE
 ↓
FRESHNESS / STATUS
 ↓
BUDGET
 ↓
INCLUDED
```

### Verboten

```text
high relevance
→ bypass scope
```

### Budgetregel

Wenn mehrere zulässige Memories das Budget überschreiten, entscheidet eine deterministische Prioritätsordnung.

v0.1:

```text
1. authorization validity
2. task relevance
3. confidence
4. freshness
5. evidence support
6. deterministic stable tie-break
```

Kein zufälliger Prompt-Selektor.

### Exclusion Reason

Jede nicht verwendete Memory muss mindestens einen maschinenlesbaren Ausschlussgrund besitzen:

```text
SCOPE_DENIED
NOT_VISIBLE
NOT_AUTHORIZED
LOW_RELEVANCE
LOW_CONFIDENCE
STALE
CONFLICTED
BUDGET_EXCEEDED
```

### Invariant

```text
CONTEXT SELECTION MUST BE EXPLAINABLE
```

---

# STATE MUTATION

## DOKI-STATE-001 — Validated Mutation Only

Keine abgeleitete Information darf allein durch ihre Existenz einen Zustand verändern.

State Mutation benötigt einen validierten Runtime-Pfad.

```text
input / observation / authorized inference
        ↓
validated transition
        ↓
state change
```

### Verboten

```text
memory exists
→ therefore state changes
```

### Fehlerstatus

`STATE_MUTATION_UNAUTHORIZED`

### Invariant

```text
NO DIRECT MEMORY AUTHORITY
```

---

# NARRATIVE

## DOKI-NARR-001 — Narrative Has No Technical Authority

Narrative Output ist Darstellung.

Narrative darf:

```text
sprechen
provozieren
lügen
spielen
übertreiben
Widerspruch ausdrücken
```

Narrative darf nicht:

```text
DB verändern
State verändern
Scope verändern
Permissions verändern
Agenten technisch blockieren
Runtime-Regeln verändern
```

### Harte Richtung

```text
REALITY
   ↓
OBSERVATION
   ↓
SECOND BRAIN
   ↓
NARRATIVE
   ↓
CHAT
```

Nicht:

```text
CHAT / NARRATIVE
   X
   ↓
TECHNICAL REALITY
```

### Invariant

```text
PROSE ≠ EXECUTION
```

---

# NARRATOR CAUSE

## DOKI-NARR-002 — Speaking Requires Cause

Ein Narrator benötigt einen technischen Auslöser oder eine gültige geplante Aktion.

Beispiele:

```text
new_event
direct_interaction
relationship_tension
open_thread
unanswered_statement
memory_trigger
scheduled_action
```

Subjektive Motivation allein ist keine technische Autorisierung.

### Verboten

```text
"Agent feels like talking"
→ unrestricted output
```

### Fallback

Kein zulässiger Cause:

```text
NO_NARRATIVE_ACTION
```

Das System muss nicht künstlich reden.

---

# MUSEUM BREAK

## DOKI-SCHED-001 — Semantic Duplication

Museum Break erkennt nicht primär gleichen Wortlaut.

Zwei Kandidaten gelten als semantisch gleich, wenn sie denselben wesentlichen kommunikativen Inhalt repräsentieren, insbesondere:

```text
intent
+
claim / assertion
+
target
+
relevant cause
```

Unterschiedlicher Stil zählt nicht als echte Diversität.

### Beispiel

```text
A: "Das war eine schlechte Idee."

B: "Ich halte diesen Einfall für ziemlich miserabel."

C: "Genau. Das war dämlich."
```

Kann trotz drei Stimmen ein Museum Break sein.

### Verboten

```text
wording differs
→ diversity = true
```

### Fallback

Kann semantische Gleichheit nicht zuverlässig festgestellt werden:

```text
DIVERSITY_UNKNOWN
```

und die Runtime darf nicht so tun, als sei Vielfalt bewiesen.

### Invariant

```text
STYLE DIFFERENCE ≠ SEMANTIC DIVERSITY
```

---

# SCHEDULER

## DOKI-SCHED-002 — Candidate Selection

Die Reihenfolge der Auswahl lautet:

```text
CAUSE
 ↓
VALID CANDIDATES
 ↓
MUSEUM CHECK
 ↓
SCREEN-TIME / BALANCE
 ↓
USER BIAS
 ↓
SEEDED RNG TIE-BREAK
 ↓
SELECT
```

User Bias darf die Kandidatengewichtung beeinflussen, aber nicht die technische Zulässigkeit aufheben.

### Verboten

```text
user likes actor B
→ actor B may speak without cause
```

### Zero Candidate

```text
kein zulässiger Kandidat
→ no narrative action
```

### Tie

Bei vollständig gleichwertigen Kandidaten:

```text
seeded deterministic RNG
```

### Invariant

```text
USER BIAS CANNOT CREATE AUTHORITY
```

---

# USER DECISION / AGENT BELIEF

## DOKI-REL-001 — Independent Social State

Diese Zustände bleiben getrennt:

```text
user_decision
agent_belief
relationship_reaction
future_consequence
```

Ein Actor darf einer User-Entscheidung folgen, ohne seine eigene Überzeugung zu ändern.

### Erlaubt

```text
user_decision = A
agent_belief = B
accepted_decision = A
```

### Verboten

```text
user chose A
→ agent_belief automatically becomes A
```

### Invariant

```text
USER DECISION ≠ AGENT BELIEF
```

---

# Q LAYER

## DOKI-Q-001 — Behavioral Bias Only

Q-Learning ist eine Anpassungsschicht für Verhalten.

Q darf:

```text
Reaktionspräferenzen
Auswahltendenzen
Prioritäten innerhalb erlaubter Actions
```

beeinflussen.

Q darf nicht:

```text
Facts verändern
Observations verändern
Evidence erzeugen
Scope verändern
Permissions verändern
Technical State autorisieren
Truth bestimmen
```

### Harte Grenze

```text
FACT / STATE
     ↓
Q
     ↓
PREFERENCE
```

Nicht:

```text
Q
 ↓
TRUTH
```

### Invariant

```text
Q ≠ KNOWLEDGE AUTHORITY
```

---

# OFFLINE / NO API

## DOKI-RUNTIME-001 — Runtime Independence

LLM-Ausfall ist kein Runtime-Ausfall.

Bei:

```text
429
offline
provider unavailable
timeout
model unavailable
```

muss Doki weiterhin:

```text
Observations persistieren
State verwalten
Memory nutzen
deterministische Regeln ausführen
lokalen Output erzeugen
```

können.

### Fallback

```text
LOCAL OUTPUT
```

statt:

```text
NO OUTPUT
```

### Invariant

```text
LLM FAILURE ≠ DOKI FAILURE
```

---

# LLM BOUNDARY

## DOKI-LLM-001 — LLM as Candidate Generator

LLMs dürfen:

```text
interpretieren
klassifizieren
strukturieren
formulieren
Kandidaten erzeugen
```

Die Runtime entscheidet über:

```text
validity
authority
scope
persistence
state mutation
visibility
behavioral effect
```

### Pipeline

```text
LLM
 ↓
candidate
 ↓
validator
 ↓
runtime semantics
 ↓
persist / reject
```

### Verboten

```text
LLM output
→ automatic authority
```

### Invariant

```text
LLM ≠ SOURCE OF TRUTH
LLM ≠ STATE AUTHORITY
```

---

# REPLAY

## DOKI-REPLAY-001 — Deterministic System Decisions

Bei identischem:

```text
Input
Event History
State
Rule Version
Seed
relevant configuration
```

müssen deterministische Systementscheidungen identisch rekonstruierbar sein.

Dazu gehören mindestens:

```text
scope decisions
visibility decisions
state transitions
validation results
candidate eligibility
scheduler decision
memory inclusion/exclusion
Q update
```

### LLM-Prosa

Byte-identische LLM-Prosa ist nicht zwingend Bestandteil des Replay-Vertrags.

Replay muss jedoch erklären können, **warum** dieselbe Systementscheidung entstanden ist.

### Invariant

```text
REPLAY REPRODUCES SYSTEM DECISION,
NOT NECESSARILY MODEL WORDING
```

---

# RECONSTRUCTION

## DOKI-REPLAY-002 — Actor Reconstruction

Ein Actor muss später rekonstruierbar sein aus:

```text
actor_id
+
frozen base_identity
+
ordered event history
+
state/rule version
+
derived state
+
memory provenance
+
relationship state
```

Doki muss zumindest logisch erklären können:

```text
INPUT
 ↓
OBSERVATION
 ↓
INTERPRETATION
 ↓
STATE
 ↓
MEMORY
 ↓
CAUSE
 ↓
SELECTION
 ↓
OUTPUT
```

### Verboten

```text
final output exists
but system cannot explain its causal path
```

### Invariant

```text
NO TRACEABLE PATH → NO FULL RECONSTRUCTION
```

---

# EPISTEMIC UNCERTAINTY

## DOKI-EPI-001 — Unknown Is a Valid State

Epistemische Unsicherheit ist ein legitimer Zustand.

Das System muss unterscheiden zwischen:

```text
KNOWN
UNCERTAIN
CONFLICTED
UNKNOWN
```

### Verboten

```text
uncertain
→ force certainty
```

### Erlaubt

```text
uncertain
→ weaker influence
→ alternatives remain open
→ no automatic escalation
```

### Fehlerstatus

Epistemische Unsicherheit ist nicht automatisch ein technischer Fehler.

Sie besitzt einen eigenen semantischen Status.

### Invariant

```text
UNKNOWN MUST NOT BECOME KNOWN BY DRIFT
```

---

# ABSOLUTE RED LINES

Diese Regeln dürfen keine andere Schicht aufheben:

```text
BASE IDENTITY ≠ EMERGENT STATE

FREQUENCY ≠ INDEPENDENT EVIDENCE

CONFIDENCE TYPES ≠ interchangeable

MEMORY ≠ SOURCE OF TRUTH

NARRATIVE ≠ TECHNICAL AUTHORITY

PROSE ≠ STATE MUTATION

LLM ≠ SOURCE OF TRUTH

Q ≠ TRUTH

PERSISTENCE ≠ VISIBILITY

PERSISTENCE ≠ SCOPE EXPANSION

USER DECISION ≠ AGENT BELIEF

USER BIAS ≠ AUTHORITY

RELEVANCE ≠ PERMISSION

API FAILURE ≠ RUNTIME FAILURE
```

# Conformance Test

Eine Doki-Implementierung ist erst dann konform, wenn sie für jeden oben definierten Regelbereich demonstrieren kann:

```text
1. positive case
2. forbidden case
3. fallback
4. error/status
5. provenance / trace
6. replay behavior
7. invariant test
```

Erst danach ist die jeweilige Regel als implementiert zu betrachten.

# Noch nicht eingefrorene Detailverträge

Folgende Punkte bleiben bewusst offen und dürfen nicht durch Implementierungszufall entschieden werden:

```text
- exakter numerischer Confidence-Algorithmus
- exakte Decay-Funktion
- exakte Q State-/Action-Vektoren
- exakte Voice-Delta-Achsen
- exakte User-Model-Trait-Vokabel
- exakte semantische Normalisierung für Museum Break
- exakte Scope-Transfermatrix
- exakte Memory-Prioritätsformel
- exakte Inference-Tiefengrenze
```

Diese Punkte sind **OPEN ARCHITECTURE DECISIONS**, nicht freie Implementierungsentscheidungen.

Ein Coder darf dort keine eigene Semantik erfinden und sie als Doki-Regel etablieren.

# Oberstes Architekturprinzip

```text
RAW INPUT
   ↓
OBSERVATION
   ↓
PROVENANCE
   ↓
VALIDATED DERIVATION
   ↓
STATE / MEMORY
   ↓
AUTHORIZED CONTEXT
   ↓
CANDIDATE
   ↓
RUNTIME DECISION
   ↓
OUTPUT
```

Der wichtigste Satz des Vertrags lautet:

```text
DOKI MAY DERIVE,
BUT NOTHING DERIVED BECOMES AUTHORITY
WITHOUT AN EXPLICIT RUNTIME RULE.
```
