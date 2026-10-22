window.CentralAdministration = {
  render(key) {
    if(key==="franchisees")return '<div class="network-module compact"><div class="network-module-title"><div><h1>Franqueados e seus acessos</h1><p>Identifique a unidade, controle os modulos liberados e administre os usuarios de cada franquia.</p></div></div><section class="network-card" id="franchise-management"></section><section class="network-card"><h2>Dados da empresa da unidade selecionada</h2><div id="managed-company-profile"></div></section><section class="network-card" id="franchise-users"></section></div>';
    if(key==="users")return '<div class="network-module compact"><h1>Usuarios da Central do Administrador</h1><p>Estes usuarios administram a rede. Os funcionarios das lojas ficam em Franqueados.</p><section class="network-card" id="central-user-access"></section></div>';
    return `<div class="network-module compact"><section class="network-card"><h1>Meu acesso</h1><p>Altere a senha do usuario conectado a Central do Administrador.</p>
      <form id="central-password-form" class="network-form">
        <div class="field"><label>Senha atual<input name="currentPassword" type="password" autocomplete="current-password" required /></label></div>
        <div class="field"><label>Nova senha<input name="newPassword" type="password" minlength="6" autocomplete="new-password" required /></label></div>
        <div class="field"><label>Confirmar nova senha<input name="confirmation" type="password" minlength="6" autocomplete="new-password" required /></label></div>
        <button class="btn primary" type="submit">Alterar minha senha</button><span role="status" style="grid-column:1/-1"></span>
      </form></section></div>`;
  },
  bind({api}) {
    const userContainer=document.getElementById("central-user-access");
    if(userContainer)window.UserAccessPanel.mount(userContainer,{api,basePath:"/api/provider/admins",permissions:window.UserAccessPanel.centralPermissions});
    const passwordForm=document.getElementById("central-password-form");
    if(passwordForm)passwordForm.addEventListener("submit",async event=>{
      event.preventDefault();const status=passwordForm.querySelector('[role="status"]');
      if(passwordForm.elements.newPassword.value!==passwordForm.elements.confirmation.value){status.textContent="A confirmacao da senha nao confere.";return;}
      const button=passwordForm.querySelector("button");button.disabled=true;
      try{await api("/api/provider/auth/password",{method:"POST",body:JSON.stringify({currentPassword:passwordForm.elements.currentPassword.value,newPassword:passwordForm.elements.newPassword.value})});passwordForm.reset();status.textContent="Senha alterada. Use a nova senha nos proximos acessos.";}catch(error){status.textContent=error.message;}finally{button.disabled=false;}
    });
    const management=document.getElementById("franchise-management");
    if(management)this.mountFranchisees(management,api);
  },
  async mountFranchisees(container,api) {
    const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    container.textContent="Carregando franqueados...";
    try{
      const {clients}=await api("/api/network/franchisees");
      const modules=["PDV","NF-e","NFC-e","NFS-e","Estoque","Financeiro","Relatorios","Compras","CTe","CTe-OS","MDFe","SAT","MFe","SPED","Sintegra"];
      container.innerHTML=`<h2>Cadastro e poderes da unidade</h2><div class="field"><label>Franqueado<select id="managed-franchise">${clients.map(row=>`<option value="${escape(row.tenantCode)}">${escape(row.tradeName)} — ${escape(row.tenantCode)}</option>`).join("")}</select></label></div>
        <button class="btn" type="button" id="new-franchise">Cadastrar franqueado</button>
        <form class="network-form" id="franchise-form">
          <div class="field"><label>Codigo da unidade<input name="tenantCode" required pattern="[a-z0-9-]+" /></label></div>
          <div class="field"><label>Nome do franqueado / unidade<input name="tradeName" required /></label></div>
          <div class="field"><label>CNPJ / CPF<input name="document" /></label></div>
          <div class="field"><label>Responsavel / contato<input name="adminUser" /></label></div>
          <div class="field"><label>Plano<input name="plan" /></label></div>
          <div class="field"><label>Terminais permitidos<input name="maxTerminals" type="number" min="1" required /></label></div>
          <div class="field"><label>Dias por renovacao<input name="renewalDays" type="number" min="1" required /></label></div>
          <div class="field"><label>Situacao<select name="status"><option>Ativo</option><option>Homologacao</option><option>Inadimplente</option><option>Bloqueado</option></select></label></div>
          <div style="grid-column:1/-1"><strong>Modulos liberados para esta franquia</strong><div class="store-permission-grid">${modules.map(name=>`<label class="check-row"><input type="checkbox" name="module" value="${escape(name)}" /> ${escape(name)}</label>`).join("")}</div></div>
          <button class="btn primary" type="submit">Salvar franqueado e poderes</button><span role="status" style="grid-column:1/-1"></span>
        </form>`;
      const select=container.querySelector('#managed-franchise'),form=container.querySelector('#franchise-form'),status=form.querySelector('[role="status"]');
      const users=document.getElementById("franchise-users");let creating=false;
      const load=row=>{
        const companyContainer=document.getElementById("managed-company-profile");
        if(companyContainer&&window.CompanyProfile){
          if(row)window.CompanyProfile.mount(companyContainer,{api,endpoint:`/api/tenant/${encodeURIComponent(row.tenantCode)}/company-profile`,onSaved:profile=>{
            row.tradeName=profile.tradeName||profile.company;row.document=profile.document;
            form.elements.tradeName.value=row.tradeName;form.elements.document.value=row.document;
            const option=[...select.options].find(option=>option.value===row.tenantCode);if(option)option.textContent=`${row.tradeName} — ${row.tenantCode}`;
          }});
          else{companyContainer.companyMount={};companyContainer.textContent="Salve a nova unidade para configurar os dados da empresa.";}
        }
        creating=!row;for(const key of ["tenantCode","tradeName","document","adminUser","plan","maxTerminals","renewalDays","status"])form.elements[key].value=row?.[key]??({maxTerminals:1,renewalDays:30,status:"Ativo",plan:"Essencial"}[key]||"");
        form.elements.tenantCode.disabled=!!row;form.querySelectorAll('[name="module"]').forEach(input=>input.checked=(row?.modules||["PDV","Estoque","Financeiro","Relatorios","Compras"]).includes(input.value));status.textContent="";
        if(row)window.UserAccessPanel.mount(users,{api,basePath:`/api/provider/tenant/${encodeURIComponent(row.tenantCode)}/users`,permissions:window.UserAccessPanel.tenantPermissions});else users.textContent="Salve a nova franquia para administrar seus usuarios.";
      };
      select.addEventListener("change",()=>load(clients.find(row=>row.tenantCode===select.value)));
      container.querySelector('#new-franchise').addEventListener("click",()=>load(null));
      form.addEventListener("submit",async event=>{
        event.preventDefault();const button=form.querySelector('button[type="submit"]');button.disabled=true;
        const body=Object.fromEntries(["tenantCode","tradeName","document","adminUser","plan","maxTerminals","renewalDays","status"].map(key=>[key,form.elements[key].value]));
        body.modules=[...form.querySelectorAll('[name="module"]:checked')].map(input=>input.value);
        try{await api(creating?"/api/tenants":`/api/provider/tenant/${encodeURIComponent(body.tenantCode)}`,{method:"POST",body:JSON.stringify(body)});await this.mountFranchisees(container,api);container.querySelector('[role="status"]').textContent="Franqueado e poderes salvos.";}catch(error){status.textContent=error.message;button.disabled=false;}
      });
      load(clients[0]||null);
    }catch(error){container.textContent=error.message;}
  }
};
