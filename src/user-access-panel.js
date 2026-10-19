window.UserAccessPanel = {
  tenantPermissions: {dashboard:"Painel",people:"Pessoas",products:"Produtos",stock:"Estoque",purchases:"Compras",sales:"Vendas",finance:"Financeiro",fiscal:"Fiscal",reports:"Relatorios",settings:"Configuracoes",pdv:"PDV",stock_adjust:"Ajustar estoque",purchase_cancel:"Cancelar compras",sales_cancel:"Cancelar vendas",finance_settle:"Baixar financeiro",fiscal_transmit:"Transmitir fiscal",fiscal_cancel:"Cancelar fiscal",restore_backup:"Restaurar backup",manage_users:"Gerenciar usuarios"},
  centralPermissions: {overview:"Painel",sales:"Vendas",products:"Produtos",orders:"Pedidos e aprovacoes",promotions:"Promocoes",royalties:"Royalties",customers:"Clientes",finance:"Financeiro",permissions:"Licencas e bloqueios",terminals:"Terminais PDV",production:"Producao",deployment:"Implantacao e backups",reports:"Relatorios",franchisees:"Administrar franqueados e seus usuarios",users:"Administrar usuarios da Central"},
  async mount(container, {api, basePath, permissions, onChanged = () => {}}) {
    const escape = value => String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const key=basePath;container.dataset.accessPath=key;container.textContent="Carregando usuarios...";
    try {
      const result=await api(basePath);
      if(container.dataset.accessPath!==key)return;
      const users=result.users, allowed=result.assignablePermissions || Object.keys(permissions);
      const canGiveAll=Object.keys(permissions).every(p=>allowed.includes(p));
      container.innerHTML=`<h2>Usuarios e poderes</h2><p>Crie usuarios ou edite os acessos existentes. Escolha acesso total ou somente os setores marcados.</p>
        <form class="network-form" data-access-form>
          <input name="userId" type="hidden" />
          <div class="field"><label>Nome<input name="displayName" required maxlength="100" /></label></div>
          <div class="field"><label>Login<input name="username" required maxlength="80" autocomplete="off" /></label></div>
          <div class="field" data-password-field><label>Senha inicial<input name="password" type="password" minlength="8" autocomplete="new-password" required /></label></div>
          <div class="field"><label>Tipo de acesso<select name="accessType"><option value="sectors">Somente setores escolhidos</option><option value="all" ${canGiveAll?"":"disabled"}>Acesso total</option></select></label></div>
          <div style="grid-column:1/-1"><strong>Setores e operacoes permitidos</strong><div class="store-permission-grid">${Object.entries(permissions).map(([value,label])=>`<label class="check-row"><input type="checkbox" name="permission" value="${escape(value)}" ${allowed.includes(value)?"":"disabled"} /> ${escape(label)}</label>`).join("")}</div></div>
          <button type="submit" class="btn primary" data-save-user>Criar usuario</button><button type="button" class="btn" data-new-user>Novo / cancelar edicao</button><span role="status" style="grid-column:1/-1"></span>
        </form>
        <div class="table-wrap"><table><thead><tr><th>Nome / login</th><th>Acessos</th><th>Status</th><th>Acoes</th></tr></thead><tbody>${users.map(user=>`<tr><td>${escape(user.name)}<br/><small>${escape(user.username)}</small></td><td>${(user.permissions||[]).map(p=>escape(permissions[p]||p)).join(", ") || "Nenhum setor"}</td><td>${user.active===false?"Bloqueado":"Ativo"}</td><td><button type="button" class="btn" data-edit-access="${Number(user.id)}">Editar poderes</button> <button type="button" class="btn" data-toggle-access="${Number(user.id)}">${user.active===false?"Ativar":"Bloquear"}</button></td></tr>`).join("")}</tbody></table></div>`;
      const form=container.querySelector("[data-access-form]"), status=form.querySelector('[role="status"]');
      const boxes=()=>[...form.querySelectorAll('input[name="permission"]')];
      const edit=user=>{
        form.elements.userId.value=user?.id||"";form.elements.displayName.value=user?.name||"";form.elements.username.value=user?.username||"";form.elements.username.disabled=!!user;
        form.elements.password.value="";form.elements.password.required=!user;form.querySelector('[data-password-field]').hidden=!!user;
        const rights=user?.permissions||[];const all=Object.keys(permissions).every(p=>rights.includes(p));
        form.elements.accessType.value=all?"all":"sectors";boxes().forEach(input=>input.checked=rights.includes(input.value));
        form.querySelector('[data-save-user]').textContent=user?"Salvar poderes":"Criar usuario";status.textContent="";
      };
      form.elements.accessType.addEventListener("change",()=>{boxes().forEach(input=>input.checked=form.elements.accessType.value==="all" && !input.disabled);});
      boxes().forEach(input=>input.addEventListener("change",()=>{form.elements.accessType.value="sectors";}));
      form.querySelector('[data-new-user]').addEventListener("click",()=>edit(null));
      container.querySelectorAll('[data-edit-access]').forEach(button=>button.addEventListener("click",()=>edit(users.find(user=>Number(user.id)===Number(button.dataset.editAccess)))));
      container.querySelectorAll('[data-toggle-access]').forEach(button=>button.addEventListener("click",async()=>{
        const user=users.find(user=>Number(user.id)===Number(button.dataset.toggleAccess));
        try{await api(`${basePath}/${user.id}`,{method:"POST",body:JSON.stringify({active:user.active===false})});await onChanged();await this.mount(container,{api,basePath,permissions,onChanged});}catch(error){status.textContent=error.message;}
      }));
      form.addEventListener("submit",async event=>{
        event.preventDefault();const button=form.querySelector('[data-save-user]');button.disabled=true;
        const id=Number(form.elements.userId.value||0), rights=boxes().filter(input=>input.checked).map(input=>input.value), all=Object.keys(permissions).every(p=>rights.includes(p));
        const existing=users.find(user=>Number(user.id)===id);
        const body={name:form.elements.displayName.value.trim(),permissions:rights,role:all?"Administrador":(existing?.role&&existing.role!=="Administrador"?existing.role:"Vendedor")};
        if(!id){body.username=form.elements.username.value.trim();body.password=form.elements.password.value;}
        try{await api(id?`${basePath}/${id}`:basePath,{method:"POST",body:JSON.stringify(body)});await onChanged();await this.mount(container,{api,basePath,permissions,onChanged});container.querySelector('[role="status"]').textContent="Usuario e poderes salvos.";}catch(error){status.textContent=error.message;button.disabled=false;}
      });
    }catch(error){container.textContent=error.message||"Nao foi possivel carregar usuarios.";}
  }
};
