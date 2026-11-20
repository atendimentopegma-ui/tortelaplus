// The client confirms its connection every 30 seconds. Keep authentication
// available for reconnecting, but release the terminal slot after three minutes.
const presenceTtlMs = 3 * 60 * 1000;

function terminalKey(session) {
  return session.terminalId || session.sessionId;
}

function connectedSessions(tenant, now = Date.now()) {
  return (tenant.activeSessions || []).filter(session => {
    const lastSeen = Date.parse(session.lastSeenAt || session.startedAt || "");
    return Number.isFinite(lastSeen) && now - lastSeen < presenceTtlMs;
  });
}

function countTerminals(tenant, now = Date.now()) {
  return new Set(connectedSessions(tenant, now).map(terminalKey)).size;
}

function canConnectTerminal(tenant, session, now = Date.now()) {
  const connected = new Set(connectedSessions(tenant, now).map(terminalKey));
  return connected.has(terminalKey(session)) || connected.size < Number(tenant.maxTerminals || 1);
}

module.exports = { connectedSessions, countTerminals, canConnectTerminal };
