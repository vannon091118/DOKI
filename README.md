# DOKI

> **Ab hier übernimmt DOKI die Dokumentation und Commits.**

Dieses Repository wird vom **DOKI Commit-Narrative-System** verwaltet. Jeder Commit wird automatisch in eine Geschichte verwandelt — erzählt von einem von 14 Charakteren, mit emergenten Handlungsbögen und maschinell durchsuchbarer Dokumentation.

---

## ⚠️ Wichtig: DOKI funktioniert NUR auf DOKI-Repos

DOKI kann **ausschließlich auf Repositories verwendet werden, die mit `doki bootstrap` initialisiert wurden.** Es ist nicht möglich, DOKI nachträglich auf bestehende Repositories anzuwenden. Der Grund: DOKI erfordert eine spezielle Chain-Struktur (`narrative_chain.json`), die ab dem allerersten Commit aufgebaut wird. Ohne Genesis-Commit gibt es keine Chain — und ohne Chain gibt es keine Narratoren, Composites oder Arcs.

**So startest du ein neues DOKI-Repository:**

```bash
# 1. DOKI-Release herunterladen und entpacken
# 2. Im Zielordner:
bin/doki bootstrap --name MeinRepo --non-interactive
```

Das erstellt automatisch:
- `.doki/` Verzeichnis mit Chain-State, Character-Sheets, Arcs
- `AGENTS.md` — Commit-Flow-Anweisungen für Agenten
- `CHANGELOG.md` — Narrative Commit-Historie
- Genesis-Commit #1 (durch die DOKI-Engine)

---

## Die 14 Charaktere

| # | Name | Rolle | Stimme |
|---|------|-------|--------|
| 1 | **Buffy** | Orchestrator | Zynisch, präzise, genervt aber stolz |
| 2 | **Basher** | Terminal Bot | Kurz, maschinell, CLI-Output-Ästhetik |
| 3 | **Thinker** | Analyse-Agent | Analytisch, methodisch, Trade-off-fokussiert |
| 4 | **Vannon** | User / Regisseur | Direktiv, knapp, Imperative |
| 5 | **Squizzle** | Forensiker | Detektiv-Logbuch, Spuren & Indizien |
| 6 | **Devin** | Architekt | Pattern-Erkennung, Schichten & Nähte |
| 7 | **Argos** | Lokaler Techniker | Bissig, direkt, Hab ich doch gesagt |
| 8 | **Ghost** | Chronist | Feierlich, historisch, archivarisch |
| 9 | **Spark** | Der Neue | Neugierig, fragend, enthusiastisch |
| 10 | **Glitch** | Verschwörungstheoretiker | Paranoid, mustersuchend |
| 11 | **Null** | Nihilist | Resigniert, philosophisch |
| 12 | **Echo** | Archivar | Erinnert sich an ALLES |
| 13 | **Flux** | Chaot | Stream-of-Consciousness |
| 14 | **Sage** | Lehrer | Pädagogisch, Lektionen |

---

## Commit-Flow

```bash
git add <dateien>
doki prepare "kurzer Impuls"
# Agent liest .doki/prompt.txt und schreibt Narrator-Text
doki finish "<Agent-Text>"
git commit -F .commit_msg.txt
# post-commit-Hook ruft automatisch doki finalize auf
```

## Determinismus

```
Seed = Djb2(prevComposite + treeHash + diffHash + impulse)
         ↓
XorShift128(Seed) → c(seq++), j(1-99), n(1-14), a(1-N), p(1-N)
         ↓
SelectMood(j, prevMood) → nie derselbe Mood
```

Deterministisch **innerhalb einer Chain** — gleicher Vorgänger-Composite + gleicher Code + gleicher Impuls → gleiches Ergebnis.

## Version

DOKI 0.1.0 — Bootstrap 2026-06-26
/* Hook-System updated: DokiCommand() replaces DokiExecutable() */
