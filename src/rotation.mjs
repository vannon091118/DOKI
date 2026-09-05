// ─────────────────────────────────────────────────────────────────────────────
// DOKI · rotation.mjs — DEPRICATED SHIM (K1/K4-Ablösung, Schritt 1)
// -----------------------------------------------------------------------------
// Die FM-Loop-Interrogation (jobs.loop_state, thinker_start/done) lebt jetzt
// im falsify-adapter.mjs. Dieser Shim delegiert nur noch; bei K4-Ablösung
// (injizierte shouldRun/shouldAbort-Ports) fliegt er.
// ─────────────────────────────────────────────────────────────────────────────
export { sharedKeyWindowOpen, activeThinkerRunExists } from './falsify-adapter.mjs';
