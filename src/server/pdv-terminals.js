function validTerminalId(value) {
  return /^[a-zA-Z0-9_-]{8,80}$/.test(String(value || ""));
}
function legacyEmissionMode(settings = {}) {
  return settings.pdvPrintMode === "Recibo simples" ? "receipt" : "nfce";
}
function registerTerminal(state, id, name) {
  if (!validTerminalId(id)) throw new Error("Identificacao do terminal invalida.");
  state.settings.pdvTerminals = Array.isArray(state.settings.pdvTerminals) ? state.settings.pdvTerminals : [];
  let terminal = state.settings.pdvTerminals.find(row => row.id === id);
  if (!terminal) {
    terminal = { id, name: String(name || `PDV ${state.settings.pdvTerminals.length + 1}`).slice(0, 80), emissionMode: legacyEmissionMode(state.settings) };
    state.settings.pdvTerminals.push(terminal);
  }
  terminal.lastSeenAt = new Date().toISOString();
  return terminal;
}
function updateTerminal(state, id, name, emissionMode) {
  if (!["receipt", "nfce"].includes(emissionMode)) throw new Error("Escolha recibo nao fiscal ou NFC-e.");
  const terminal = (state.settings.pdvTerminals || []).find(row => row.id === id);
  if (!terminal) throw new Error("Terminal nao encontrado. Entre no PDV para registra-lo.");
  const label = String(name || "").trim();
  if (!label || label.length > 80) throw new Error("Informe um nome de ate 80 caracteres.");
  Object.assign(terminal, { name: label, emissionMode, updatedAt: new Date().toISOString() });
  return terminal;
}
function listTerminals(state, tenant) {
  return (state.settings.pdvTerminals || []).map(row => ({ ...row, online: (tenant.activeSessions || []).some(session => session.terminalId === row.id) }));
}
module.exports = { validTerminalId, legacyEmissionMode, registerTerminal, updateTerminal, listTerminals };
