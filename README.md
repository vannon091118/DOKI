# DOKI

> **Ab hier übernimmt DOKI die Dokumentation und Commits.**

Dieses Repository wird vom **DOKI Commit-Narrative-System** verwaltet. Jeder Commit wird automatisch in eine Geschichte verwandelt — erzählt von einem von 14 Charakteren, mit emergenten Handlungsbögen und maschinell durchsuchbarer Dokumentation.

---

## ⚠️ Wichtig: DOKI funktioniert NUR auf DOKI-Repos

DOKI kann **ausschließlich auf Repositories verwendet werden, die mit `doki bootstrap` initialisiert wurden.**
Es ist nicht möglich, DOKI nachträglich auf bestehende Repositories anzuwenden.
Der Grund: DOKI erfordert eine spezielle Chain-Struktur (`narrative_chain.json`),
die ab dem allerersten Commit aufgebaut wird. Ohne Genesis-Commit gibt es keine Chain —
und ohne Chain gibt es keine Narratoren, Composites oder Arcs.

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

## Commit-Flow

```bash
git add <dateien>
doki prepare "kurzer Impuls"
# Agent liest .doki/prompt.txt und schreibt Narrator-Text
doki finish "<Agent-Text>"
git commit -F .commit_msg.txt
# post-commit-Hook ruft automatisch doki finalize auf
```

## Version

DOKI 0.1.0 — Bootstrap 2026-06-26
