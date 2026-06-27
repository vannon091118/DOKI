# AGENTS.md — DOKI

> **DOKI verwaltet dieses Repository.** Alle Commits MÜSSEN durch den DOKI-Flow laufen.

## ⚠️ DOKI funktioniert NUR auf DOKI-Repos

Dieses Repository wurde mit `doki bootstrap` initialisiert. DOKI kann **nicht** nachträglich
auf bestehende Repos angewendet werden — die Chain-Struktur muss ab Commit #1 existieren.

## Commit-Flow (PFLICHT)

1. `git add <files>`
2. `doki prepare "<impuls>"` — Prompt in `.doki/prompt.txt`
3. Agent schreibt Commit-Body in Narrator-Rolle
4. `doki finish "<text>"` — VerifyEngine (9 Checks)
5. `git commit -F .commit_msg.txt`
6. `doki finalize` läuft via post-commit-Hook

**FinalizeCommit nach jedem Commit — sonst bricht die Chain.**

## VerifyEngine Checks

- Checks 1–6: Normale Fehler (werden gemeldet)
- Checks 7–9: **HARTER BLOCK** (Kausalität, DocSync, ChainAudit)

## Daten

- `.doki/Data/` — narrative_chain, change_index, character_sheets, lore_arcs
- `CHANGELOG.md` — SSoT für Menschen

## Befehle

```bash
doki prepare "Impuls"
doki finish "Text"
doki verify-only --file .commit_msg.txt
```

---

*DOKI v0.1.0 — Ab hier übernimmt DOKI die Dokumentation und Commits.*
