window.FiscalCancellationPanel={
 async mount(container,{api,tenantCode,onChanged=()=>{}}){
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  container.dataset.tenantCode=tenantCode;container.textContent='Carregando NF-e e NFC-e...';
  try{
   const data=await api(`/api/tenant/${encodeURIComponent(tenantCode)}/fiscal/documents`);if(container.dataset.tenantCode!==tenantCode)return;
   container.innerHTML=`<h2>Cancelar NF-e e NFC-e</h2><p>Unidade: <strong>${escape(data.unit)}</strong>. Ambiente: <strong>${escape(data.environment)}</strong>. O retorno da SEFAZ confirma o cancelamento. Estornos de venda, caixa e estoque usam seus próprios controles.</p>
    <div class="grid four"><div class="field"><label>Buscar por número, cliente ou chave<input data-fiscal-search /></label></div><div class="field"><label>Modelo<select data-fiscal-model><option value="">NF-e e NFC-e</option><option>NF-e</option><option>NFC-e</option></select></label></div><button class="btn" data-fiscal-refresh type="button">Atualizar lista</button></div>
    <div class="network-table-wrap"><table><thead><tr><th>Nota / série</th><th>Modelo / emissão</th><th>Cliente / valor</th><th>Status / protocolo</th><th>Ação</th></tr></thead><tbody data-fiscal-rows></tbody></table></div><div data-fiscal-cancel-form></div><p role="status" aria-live="polite"></p>`;
   const rows=container.querySelector('[data-fiscal-rows]'),status=container.querySelector('[role="status"]'),formArea=container.querySelector('[data-fiscal-cancel-form]');let busy=false;
   const paint=()=>{
    const search=container.querySelector('[data-fiscal-search]').value.trim().toLowerCase(),model=container.querySelector('[data-fiscal-model]').value;
    const filtered=data.documents.filter(r=>(!model||r.model===model)&&[r.number,r.id,r.customer,r.key].join(' ').toLowerCase().includes(search));
    rows.innerHTML=filtered.map(r=>`<tr><td>${escape(r.number||r.id)} / ${escape(r.serie||1)}</td><td>${escape(r.model)}<br>${escape(r.issuedAt||r.date||'')}</td><td>${escape(r.customer||'Consumidor Final')}<br>${Number(r.total||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td><td>${escape(r.status)}<br><small>${escape(r.cancelProtocol||r.protocol||'')}</small>${r.cancelStatusMessage?'<br><small>'+escape(r.cancelStatusMessage)+'</small>':''}</td><td>${r.status==='Autorizada'&&data.canCancel?`<button class="btn danger" type="button" data-select-fiscal-cancel="${Number(r.id)}">Cancelar ${escape(r.model)}</button>`:r.status==='Cancelada'?'Cancelamento confirmado':!data.canCancel?'Sem permissão para cancelar':'Somente notas autorizadas'}</td></tr>`).join('')||'<tr><td colspan="5">Nenhum documento encontrado.</td></tr>';
    rows.querySelectorAll('[data-select-fiscal-cancel]').forEach(button=>button.addEventListener('click',()=>{
     if(busy)return;const row=data.documents.find(r=>Number(r.id)===Number(button.dataset.selectFiscalCancel));
     formArea.innerHTML=`<form class="network-form"><h3>Cancelar ${escape(row.model)} ${escape(row.number||row.id)} / série ${escape(row.serie||1)}</h3><p style="grid-column:1/-1">Unidade ${escape(data.unit)} — ${escape(data.environment)}<br>Chave: ${escape(row.key)}<br>Protocolo de autorização: ${escape(row.protocol)}</p><div class="field" style="grid-column:1/-1"><label>Justificativa real do cancelamento (15 a 255 caracteres)<textarea name="reason" minlength="15" maxlength="255" required></textarea></label></div><button class="btn danger" type="submit">Confirmar envio do cancelamento à SEFAZ</button><button class="btn" data-abort-fiscal-cancel type="button">Voltar sem cancelar</button></form>`;
     formArea.querySelector('[data-abort-fiscal-cancel]').addEventListener('click',()=>{if(!busy)formArea.innerHTML='';});
     const form=formArea.querySelector('form');form.addEventListener('submit',async event=>{
      event.preventDefault();if(busy)return;const reason=form.elements.reason.value.trim();if(reason.length<15||reason.length>255){status.textContent='Informe justificativa entre 15 e 255 caracteres.';return;}
      busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='Solicitando cancelamento à SEFAZ...';
      try{const result=await api(`/api/tenant/${encodeURIComponent(tenantCode)}/fiscal/cancel`,{method:'POST',body:JSON.stringify({id:row.id,reason})});onChanged(result.document);if(container.dataset.tenantCode!==tenantCode)return;Object.assign(row,result.document);formArea.innerHTML='';paint();status.textContent=`Cancelamento confirmado. Protocolo: ${result.document.cancelProtocol||''}`;}
      catch(e){if(container.dataset.tenantCode===tenantCode)status.textContent=e.message||'Não foi possível confirmar o cancelamento. Atualize a lista antes de tentar novamente.';}
      finally{busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
     });
    }));
   };
   container.querySelector('[data-fiscal-search]').addEventListener('input',paint);container.querySelector('[data-fiscal-model]').addEventListener('change',paint);
   container.querySelector('[data-fiscal-refresh]').addEventListener('click',()=>{if(!busy)window.FiscalCancellationPanel.mount(container,{api,tenantCode,onChanged});});paint();
  }catch(e){if(container.dataset.tenantCode===tenantCode)container.textContent=e.message||'Não foi possível carregar as notas.';}
 }
};
