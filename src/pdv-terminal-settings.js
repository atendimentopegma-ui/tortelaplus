// Shared administration panel used by both back offices.
window.PdvTerminalSettings = {
  async mount(container, { api, tenantCode, onSaved = () => {} }) {
    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    container.textContent = "Carregando terminais...";
    container.dataset.tenantCode = tenantCode;
    try {
      const result = await api(`/api/tenant/${encodeURIComponent(tenantCode)}/pdv-terminals`);
      if (container.dataset.tenantCode !== tenantCode) return;
      container.innerHTML = `<h2>Emissao por terminal do PDV</h2><p>Escolha o comprovante de cada terminal. A alteracao vale para as proximas vendas; vendas anteriores mantem sua emissao.</p>
        ${result.terminals.map(row => `<form data-terminal-id="${escape(row.id)}" class="network-form form-card" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));padding:16px;margin-bottom:12px">
          <div class="field"><label>Nome do terminal<input name="name" value="${escape(row.name)}" maxlength="80" required /></label><small>${escape(row.id)} — ${row.online ? "Conectado" : "Desconectado"}</small></div>
          <div class="field"><label>Tipo de emissao<select name="emissionMode"><option value="receipt" ${row.emissionMode === "receipt" ? "selected" : ""}>Recibo nao fiscal</option><option value="nfce" ${row.emissionMode === "nfce" ? "selected" : ""}>NFC-e fiscal</option></select></label></div>
          <button class="btn primary" type="submit">Salvar emissao deste terminal</button><span role="status" style="grid-column:1/-1"></span>
        </form>`).join("") || "<p>Nenhum PDV identificado. Entre no PDV de cada computador para registra-lo nesta unidade.</p>"}`;
      container.querySelectorAll("form[data-terminal-id]").forEach(form => form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = form.querySelector("button");
        const status = form.querySelector('[role="status"]');
        button.disabled = true;
        try {
          const saved = await api(`/api/tenant/${encodeURIComponent(tenantCode)}/pdv-terminals`, { method: "POST", body: JSON.stringify({ terminalId: form.dataset.terminalId, name: form.elements.name.value, emissionMode: form.elements.emissionMode.value }) });
          await onSaved(saved.terminals);
          status.textContent = "Configuracao salva para as proximas vendas.";
        } catch (error) { status.textContent = error.message || "Nao foi possivel salvar."; }
        finally { button.disabled = false; }
      }));
    } catch (error) { container.textContent = error.message || "Nao foi possivel carregar os terminais."; }
  }
};
