// ─────────────────────────────────────────────────────────────────────────────
// DOKI · falsify-reader.mjs — DEPRICATED SHIM (K1-Ablösung, Schritt 1)
// -----------------------------------------------------------------------------
// Der komplette Inhalt dieses Moduls lebt jetzt in falsify-adapter.mjs — dem
// EINZIGEN Schema-Kenner für falsify.db. Dieser Shim delegiert nur noch, damit
// bestehende Importe (runtime.mjs, replay.mjs, cli.mjs) stabil bleiben.
// Aufrufer sind auf den Adapter umgestellt; dieses Modul fliegt bei K1-Schritt 2.
// ─────────────────────────────────────────────────────────────────────────────
export { readSnapshot, listTerminalEvents, inspectEventContinuity } from './falsify-adapter.mjs';
