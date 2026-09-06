Ja. Ich rekonstruiere den konzeptionellen Verlauf **ab „Basis-Identität“** und trenne dabei sauber zwischen **festgelegt**, **stark favorisiert** und **noch offen**. Keine neue Architektur hineininterpretieren.

---

# Rekonstruktion ab „Basis-Identität“

## 1. Basis-Identität

Ausgangspunkt war:

> Basis-Identität wird vorgegeben und bleibt gleich.

Dann wurde präzisiert:

```text
ACTOR
├── actor_id
├── BASE IDENTITY
└── EMERGENT
```

Die gedachte Semantik war:

```text
actor_id
= technische Kontinuität

base_identity
= bewusst gesetzter, stabiler Kern

emergent
= das, was durch Geschichte entsteht
```

Dabei wurde entschieden:

```text
BASE IDENTITY
   ↓
FREEZE
   ↓
bleibt Basis
```

Emergente Entwicklung darf die Basis **nicht retconnen**.

Beispiel:

```text
BASE:
"geduldig"

HISTORIE:
wiederholt ungeduldiges Verhalten

        ↓

EMERGENT:
Ungeduld ↑

BASE bleibt trotzdem "geduldig".
```

Wichtig war also die Trennung:

```text
IDENTITY ≠ CURRENT STATE
```

Noch offen blieb damals:

* Exakte Semantik von `persona_id`
* Ob `persona_id` überhaupt nötig ist
* Welche Bestandteile genau frozen sind
* Wie stark emergente Entwicklung gehen darf
* Was „same actor tomorrow“ technisch exakt voraussetzt

---

# 2. Onboarding für die Basis-Identität

Dann kam die Idee:

Nicht manuell alles konfigurieren, sondern ein **Mini-Q&A**.

Zunächst entstand kurz die Idee von Multiple Choice, wurde aber korrigiert.

Das eigentliche Ziel:

```text
RUNTIME
  ↓
gezielte elementare Fragen
  ↓
USER antwortet frei
  ↓
LLM klassifiziert
  ↓
strukturierte Basis-Identität
  ↓
FREEZE
```

Wichtig:

**Die Fragen sind bewusst konstruiert. Die Antworten bleiben frei.**

Also:

```text
FRAGEN = kontrolliert
ANTWORTEN = offen
AUSWERTUNG = constrained
```

Die LLM soll dabei nicht Persönlichkeit erfinden, sondern aus der Antwort innerhalb eines festen Schemas extrahieren.

---

# 3. Die Fragen selbst sollen Informationsdichte besitzen

Dann kam die entscheidende Verschiebung:

Die Fragen sollen **nicht zufällig im technischen Sinn** sein.

Für den User:

```text
wirkt natürlich / teilweise random
```

Für die Runtime:

```text
gezielte Auswahl
```

Die Fragen werden nach Coverage ausgewählt.

```text
QUESTION POOL
      ↓
welche Dimensionen fehlen?
      ↓
welche Frage liefert mehrere davon?
      ↓
Redundanz / Balance
      ↓
seeded Auswahl
```

Wichtige Idee:

```text
eine Frage
   ↓
mehrere Traits
```

und dieselbe Dimension kann aus verschiedenen Winkeln geprüft werden.

Damit:

```text
Frage A ─┐
Frage B ─┼──► konsistente Evidenz
Frage C ─┘
```

Die Auswahl soll also **deterministisch gesteuert zufällig erscheinen**, nicht stumpf zufällig sein.

---

# 4. „Garbage“ wurde als eigenes Architekturproblem erkannt

Dann kam:

> Was passiert bei `iuaghijg`?

Es wurde wichtig, **Garbage nicht mit „komisch“ gleichzusetzen**.

Es entstanden drei Kategorien:

```text
TYPUS
UNKLAR
GARBAGE
```

Zum Beispiel:

```text
"kommt drauf an"
→ Typus

"keine Ahnung"
→ Typus / niedrige Informationsdichte

"Ich will das nicht beantworten."
→ Verweigerung / Signal

"iuaghijg"
→ Garbage
```

Dann wurde noch präzisiert:

```text
GARBAGE ≠ UNKLAR ≠ VERWEIGERUNG
```

Das war wichtig, weil eine Verweigerung **selbst** ein Interaktionssignal sein kann, während Garbage keinerlei Trait ableiten darf.

---

# 5. Die erste große epistemische Trennung

Dann kam die zentrale Forderung:

Nicht einfach:

```text
"user mag kurze Antworten"
```

sondern:

```text
FREQUENCY
+
CONFIDENCE
```

getrennt.

Beispiel:

```text
observations = 17
matches      = 14
confidence   = 0.82
```

Und die entscheidende Einsicht:

```text
FREQUENCY ≠ CONFIDENCE
```

Eine Beobachtung kann häufig sein, während wir trotzdem unsicher sind, was sie bedeutet.

Damit entstand implizit die Kette:

```text
OBSERVATION
   ↓
PATTERN
   ↓
MATCH RATE
   ↓
CONFIDENCE
   ↓
USER MODEL
```

Und wir wollten **nicht** vorschnell behaupten:

> „Der User ist so.“

---

# 6. User Style wurde vom kosmetischen Profil zum Runtime-State

Danach wurde ausdrücklich verworfen, User Style als einfaches Profil zu behandeln.

Die Idee wurde:

```text
User Style
= beobachtete, evidenzbasierte Anpassung
```

Also:

```text
USER-VERHALTEN
      ↓
PATTERN
      ↓
FREQUENCY
+
CONFIDENCE
      ↓
USER MODEL
      ↓
REACTION POLICY
```

Der User soll diese internen Zahlen **nicht** als Meta-Erklärung vorgesetzt bekommen.

Sie beeinflussen das Verhalten.

---

# 7. Q-Learning bekam eine sehr klare Rolle

Dann wurde Q-Learning eingeordnet:

```text
Q-Learning
= Variation / Anpassung

NICHT
= Wahrheit
```

Also:

```text
FACT / STATE
      ↓
   Wahrheit
      │
      ▼
   Q-LAYER
      ↓
Reaktionspräferenz
```

Damit darf Q beispielsweise beeinflussen:

```text
direkter widersprechen
vorsichtiger reagieren
nachfragen
mitgehen
warnen
provozieren
```

Aber nicht:

```text
"Diese Information ist wahr."
```

Das wurde mehrfach als harte Trennung formuliert.

---

# 8. Zustimmung ≠ Überzeugung

Dann kam dein Beispiel:

> „Okay, wird gemacht. Aber denk an A+B. Das wird C oder D.“

Daraus entstand eine wichtige soziale Semantik:

```text
USER DECISION
≠
AGENT BELIEF
```

Ein Agent darf also:

```text
deine Entscheidung akzeptieren
```

ohne:

```text
seine eigene Einschätzung zu verlieren
```

Somit können gleichzeitig existieren:

```text
user_decision = X
agent_belief = Y
```

Der Agent kann X ausführen/akzeptieren und trotzdem Y für problematisch halten.

Das wurde als wesentlich für die Glaubwürdigkeit des Akteurs erkannt.

---

# 9. Doki soll nicht auf User-Turns warten

Danach kam der Proaktivitätsgedanke.

Doki darf:

```text
ungefragt sprechen
```

Beispiel:

```text
"Ach ja, ich lösch kurz deine State Machine, okay?"

...

"Nee, war Spaß, Kleiner."
```

Aber die sichtbare Prosa ist **nicht** selbst die technische Aktion.

Daher:

```text
VORLAUT ≠ AUTORITÄT
```

---

# 10. Die wichtige Korrektur: Doki „imitiert“ Proaktivität nur oberflächlich

Dann wurde präzisiert, wie das technisch aussehen soll.

Für den User:

```text
wirkt spontan
```

Intern:

```text
RUNTIME
↓
nächster Intent
↓
Action Candidate
↓
Trigger / Timing
↓
Output
```

Also:

```text
STATE
 ↓
INTENT
 ↓
SCHEDULED ACTION
 ↓
TRIGGER
 ↓
OUTPUT
```

Die Runtime **bereitet den nächsten Schritt vor**, während der User nur das resultierende Verhalten sieht.

---

# 11. Die Narratoren wurden neu verstanden

Dann wurde sehr deutlich:

Doki ist nicht bloß Moderator.

```text
DOKI = 1/3 NARRATOREN
```

Also:

```text
CHAT
 ├── Doki
 ├── Narrator B
 └── Narrator C
```

Sie leben dauerhaft in der Oberfläche und dürfen miteinander reagieren.

Doki ist gleichzeitig:

```text
ORCHESTRATOR
+
EIGENER AKTEUR
```

aber **nicht Chef der anderen Persönlichkeiten**.

---

# 12. Drei Narratoren sind nicht drei LLM-Aufrufe

Dann kam die Runtime-Struktur:

```text
                 DOKI RUNTIME
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        DOKI       NARRATOR B   NARRATOR C
        STATE          STATE        STATE
```

Jeder hat eigenen:

```text
Identity
State
Memory
Relations
User relationship
Disposition
Voice Delta
```

Sie teilen eine Runtime, aber nicht dieselbe Identität.

---

# 13. Narrative und technische Realität wurden getrennt

Das wurde danach eine harte Grenze:

```text
REALITÄT
   ↓
OBSERVATION
   ↓
SECOND BRAIN
   ↓
DOKI BRAIN
   ↓
NARRATIVE
```

Nicht:

```text
NARRATIVE ───X──► technische Realität
```

Die Narratoren dürfen:

```text
lügen
spielen
provozieren
Unsinn ankündigen
sich irren
Theater machen
```

ohne dadurch echte technische Konsequenzen auszulösen.

---

# 14. Doki Brain und Second Brain wurden getrennt

Dann wurde die Begriffsstruktur präzisiert:

```text
SECOND BRAIN
= Kontext-/Arbeitsgedächtnis

DOKI BRAIN
= narrative / soziale Schicht
```

Das Second Brain ist also nicht das „persönliche Denken“ eines Narrators.

Es ist die kontrollierte Zwischenstufe:

```text
beobachtet
  ↓
persistiert
  ↓
relevant?
  ↓
granuliert
  ↓
gezielter Kontext
```

---

# 15. Second Brain soll lokal granulieren

Dann kam die API-Kosten-/429-Frage.

Entscheidung:

**Granulierung selbst braucht keine API.**

```text
EVENTS
 ↓
NORMALIZE
 ↓
DEDUP
 ↓
DETERMINISTIC DELTA
 ↓
CLUSTER
 ↓
LAZY THRESHOLD
 ↓
MEMORY
```

LLM kommt erst ganz am Ende als sprachlicher Renderer.

Damit:

```text
LLM = Renderer
nicht
LLM = Memory
```

---

# 16. Jeder User-Input braucht Output

Dann wurde eine harte UX-Regel hinzugefügt:

```text
JEDER INPUT
   ↓
lokale Zustandsänderung / Observation
   ↓
OUTPUT
```

Nie:

```text
"warte erst"
"ich sammle noch"
"kein Output nötig"
```

API-Ausfall darf also nicht zum sichtbaren Systemstillstand führen.

```text
API OK
→ reichhaltiger Output

API 429
→ lokaler Fallback

API DOWN
→ lokaler Fallback
```

---

# 17. Der zentrale Doki-Hebel wurde dadurch schärfer

Der erste Satz war:

> Doki macht Agenten zu persistenten, rekonstruierbaren Akteuren statt zu einzelnen LLM-Aufrufen.

Danach wurde klar, dass „persistenter Agent“ alleine **nicht genug** ist.

Der eigentliche Doki-Kern ist:

```text
WARUM kenne ich diese Information?
WOHER kommt sie?
WEM gehört sie?
WELCHEM SCOPE gehört sie?
BEOBACHTET oder ABGELEITET?
WARUM darf dieser Agent sie sehen?
WAS darf daraus seinen Zustand verändern?
```

Das ist **Context Integrity + rekonstruierbare Agentenkontinuität**.

---

# 18. Der Informationsfluss wurde dadurch formalisiert

Aktuell ergibt sich:

```text
EVENT
 ↓
IDENTITY
 ↓
SCOPE
 ↓
PROVENANCE
 ↓
PERSISTENCE
 ↓
INFERENCE
 ↓
STATE
 ↓
MEMORY
 ↓
RELEVANCE
 ↓
AGENT CONTEXT
 ↓
REACTION
 ↓
OUTPUT
```

Das ist bisher der stärkste gemeinsame Nenner unserer Diskussion.

---

# 19. Observation, Pattern, Hypothesis wurden getrennt

Wir haben explizit verhindert:

```text
Observation
 ↓
Inference
 ↓
Inference
 ↓
Inference
 ↓
"Der User ist halt so."
```

Stattdessen:

```text
OBSERVED
 ↓
PATTERN
 ↓
HYPOTHESIS
 ↓
STATE / POLICY
 ↓
NARRATIVE
```

Und dabei:

```text
Observation Confidence
≠
Hypothesis Confidence
```

---

# 20. Scope und Ownership wurden als getrennte Probleme erkannt

Das war ein wichtiger Punkt.

```text
SCOPE
≠
OWNERSHIP
```

Deshalb kamen:

```text
owner
subject
observer
scope
```

Beispielsweise:

```text
owner: user
subject: user
observer: Doki
scope: relationship
```

Das verhindert den „User-Model-Eimer“, in den irgendwann alles hineinfällt.

---

# 21. Memory muss seine Herkunft behalten

Auch nach Granulierung:

```text
memory
 ↓
source
 ↓
evidence
 ↓
scope
 ↓
confidence
```

Die Kernforderung:

> Kompression darf Rekonstruktion erschweren, aber nicht unmöglich machen.

Das heißt praktisch:

```text
SUMMARY
   ↓
muss auf ursprüngliche Evidenz zurückzeigen können
```

---

# 22. Memory → Prompt wurde als Autorisierungsproblem erkannt

Nicht:

```text
relevant === true
```

sondern eher:

```text
MEMORY
 ↓
SCOPE
 ↓
OWNERSHIP
 ↓
AGENT VISIBILITY
 ↓
TASK RELEVANCE
 ↓
CONFIDENCE
 ↓
FRESHNESS / DECAY
 ↓
BUDGET
 ↓
PROMPT
```

Die noch offene Frage ist:

**Welche Regel gewinnt bei Konflikten zwischen Relevanz und Kontextbudget?**

---

# 23. State darf nicht durch Prosa verändert werden

Eine besonders harte Trennung entstand:

```text
PROSE
   X
   ↓
STATE
```

Narrative Output ist kein Zustands-Input.

Wenn ein Agent sagt:

> „Ich bin jetzt wütend.“

darf dadurch nicht automatisch:

```text
anger += 1
```

entstehen.

State braucht einen echten Runtime-Grund / ein Event.

---

# 24. Persönlichkeit wird aus Basis + Entwicklung gebaut

Das aktuelle Modell:

```text
BASE IDENTITY
        +
CURRENT STATE
        +
RELATIONSHIP
        +
USER MODEL
        +
RECENT EVENTS
        ↓
DISPOSITION
        ↓
VOICE DELTA
        ↓
OUTPUT
```

Dabei:

```text
BASE VOICE
≠
CURRENT VOICE
```

Die Stimme bleibt erkennbar, aber der Zustand verschiebt ihre Ausdrucksweise.

---

# 25. Scheduler für die drei Narratoren

Dann wurde für Parallelität eine eigene Schicht identifiziert.

Nicht einfach:

```text
RNG = wer redet?
```

sondern:

```text
NARRATIVE SCHEDULER
```

mit ungefähr dieser Reihenfolge:

```text
CAUSE
 ↓
MUSEUM BREAK
 ↓
SCREEN-TIME BALANCE
 ↓
USER BIAS
 ↓
SEEDED RNG
 ↓
NARRATOR
```

Die drei wichtigen Kräfte waren:

```text
CAUSE
= Wer hat gerade einen echten Grund?

BALANCE
= Hat jemand ohne Grund zu viel Bühne?

USER BIAS
= Gibt es eine evidenzbasierte Nutzerpräferenz?
```

RNG ist dann nur der deterministische Tie-Breaker unter zulässigen Kandidaten.

---

# 26. „Museum Break“ entstand aus dem Problem der drei Stimmen

Problem:

```text
Doki:
"Das ist eine schlechte Idee."

Narrator B:
"Ich halte den Ansatz für problematisch."

Narrator C:
"Fantastisch. Noch eine Idee, die brennt."
```

Die offene Frage wurde:

> Sind das drei eigenständige Reaktionen oder drei Varianten derselben Reaktion?

Dafür braucht es eine **semantische Deduplizierung**.

Noch nicht final entschieden ist:

```text
Was bedeutet "gleich"?
```

---

# 27. „Grund“ für proaktives Sprechen

Wir haben Kandidaten definiert wie:

```text
new_event
direct_interaction
relationship_tension
open_thread
unanswered_statement
memory_trigger
scheduled_action
```

Damit soll „ich hatte einfach Lust zu reden“ kein technisches Kriterium sein.

Der konkrete Candidate darf natürlich trotzdem albern wirken.

---

# 28. Replay wurde getrennt von Prosa verstanden

Aktueller Zielgedanke:

```text
SAME EVENTS
   ↓
SAME STATE
   ↓
SAME DISPOSITION
   ↓
SAME SCHEDULER DECISION
```

Aber:

```text
LOCAL OUTPUT
→ exakt reproduzierbar

LLM OUTPUT
→ nicht zwingend bytegleich
```

Also:

> Replaybarkeit gilt primär für die **Systementscheidung**, nicht zwingend für die sprachliche Oberfläche.

---

# 29. Fehler und 429

Bisherige Grundrichtung:

```text
RUNTIME FAIL
≠
LLM FAIL
```

LLM darf ausfallen.

Die lokale Runtime soll weiterleben.

Das ist noch nicht vollständig spezifiziert für alle Fehlerklassen, aber die Grundrichtung ist sehr klar.

---

# 30. Doki vs. Falsify / Limen

Dann kam die große Repository-/Plattformkorrektur:

```text
DOKI
= BASISPLATTFORM
```

und:

```text
FALSIFY = ADDON
LIMEN    = ADDON
...      = weitere ADDONS
```

Die wichtigste Regel:

```text
ADDON darf Doki erweitern.

Doki darf NICHT von einem bestimmten Addon abhängen.
```

Daher:

```text
DOKI standalone
    │
    ├── Falsify
    ├── Limen
    └── ...
```

Falsify ist **nicht der Sinn von Doki**.

Es ist ein Beweis/Addon dafür, dass die Basis etwas kann.

---

# 31. Doki soll als eigenes Repo existieren

Du wolltest Doki aus Falsify herauslösen:

```text
DOKI → eigenes Git Repo
FALSIFY → eigenes Repo
```

Nicht nur zur Architektur, sondern auch für:

```text
Backups
saubere Historie
Standalone-Marke
klaren Scope
keine Mischkonzepte
```

Das war der gewünschte unmittelbare Schnitt.

---

# 32. Was der aktuelle Falsify-Bestand rückblickend gezeigt hat

Beim Audit des echten Repos wurde deutlich:

Der vorhandene `doki/`-Bereich enthält schon ziemlich viel:

```text
Observer
Replay
Pure State Logic
Ensemble
Narrator Catalog
Prompt Compilation
DB
Memory
Relationships
Threads
Perspectives
Beliefs
Conflicts
Bridge
```

Die Pure-State-Machine ist bereits als bewusst getrennte, IO-freie Logik angelegt. Die aktuelle Doki-DB enthält bereits getrennte Observation-, History-, Character-, Memory- und Relationsebenen. Das ist eine starke Ausgangsbasis, aber noch kein Grund, die bestehende Falsify-Kopplung als Zielarchitektur zu übernehmen.

Besonders wichtig: Der aktuelle Stand koppelt Doki konzeptionell noch an Falsify-Contracts, Falsify-Events und Falsify-Konfiguration. Genau diese Dinge gehören beim Standalone-Rework **an die Addon-Grenze**, nicht in Doki Core.

---

# 33. Daraus ergibt sich der bisherige Doki-Nordstern

```text
                         DOKI
                STANDALONE BASIS
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ Identity │ Scope │ Events │ Provenance │ State               │
│ Memory │ Second Brain │ User Model │ Q/Policy                │
│ Scheduler │ Agents │ Narrative │ Replay │ Output Runtime     │
│                                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                         ADDON CONTRACT
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                 FALSIFY      LIMEN       ...
```

Und innerhalb des Systems:

```text
REALITY
   ↓
OBSERVATION
   ↓
SECOND BRAIN
   ↓
AGENT STATE
   ↓
NARRATIVE BRAIN
   ↓
REACTION
   ↓
OUTPUT
```

---

# 34. Die bisher wichtigsten festgezurrten Invarianten

```text
1. BASE IDENTITY ≠ EMERGENT STATE

2. FREQUENCY ≠ CONFIDENCE

3. USER DECISION ≠ AGENT BELIEF

4. NARRATIVE ≠ TECHNICAL AUTHORITY

5. PROSE ≠ STATE MUTATION

6. LLM ≠ SOURCE OF TRUTH

7. MEMORY ≠ SECOND TRUTH

8. SECOND BRAIN ≠ NARRATIVE BRAIN

9. DOKI ≠ FALSIFY

10. ADDON ≠ CORE DEPENDENCY

11. LLM FAILURE ≠ RUNTIME FAILURE

12. REPLAY ≠ zwingend identische LLM-Prosa

13. EVERY USER INPUT → OUTPUT

14. AGENT IDENTITY survives sessions

15. INFERENCE needs provenance
```

---

# 35. Was noch NICHT entschieden ist

Und hier würde ich jetzt **nicht so tun, als wäre es bereits geklärt**:

```text
IDENTITY
  └─ exakte actor_id / persona_id Semantik

OBSERVATION
  └─ kleinste zulässige Beobachtungseinheit

INFERENCE
  └─ wer darf sie erzeugen?

CONFIDENCE
  └─ exakte Mathematik / mehrere Confidence-Arten?

FREQUENCY
  └─ Definition von unabhängigen Ereignissen / Spam

SCOPE
  └─ exakter Scope-Katalog und Vererbungsregeln

MEMORY
  └─ exakte Granulations- und Eviktionslogik

CONFLICT
  └─ Umgang mit widersprüchlichen Erinnerungen

STATE
  └─ exakte erlaubte Mutationsquellen

SCHEDULER
  └─ komplette Prioritäts- und Fallbackordnung

MUSEUM BREAK
  └─ Definition semantischer Duplikation

PROACTIVE ACTION
  └─ genaue Trigger-/Queue-Semantik

PARALLEL NARRATORS
  └─ echte Parallelität vs. deterministisch geordnete Ausführung

VOICE DELTA
  └─ Grenzen und Rückkehr zum Baseline

429
  └─ genaue lokale Output-Mechanik

REPLAY
  └─ was exakt reproduziert werden muss

ERROR
  └─ welche Zustände recovern / einfrieren / verwerfen
```

Der wichtigste Audit-Befund ist für mich:

```text
          VORHER
Falsify als Zentrum
       ↓
Doki als Erweiterung

          JETZT
Doki als Basis
       ↓
persistente Akteure
       ↓
Context Integrity
       ↓
narratives Erlebnis

Falsify / Limen / ...
       ↓
optionale Fähigkeiten
```

**Das ist die eigentliche konzeptionelle Bewegung des gesamten Gesprächs.**
