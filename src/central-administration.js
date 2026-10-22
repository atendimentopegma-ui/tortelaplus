window.CentralAdministration = {
  render(key) {
    if(key==="franchisees")return '<div class="network-module compact network-module-flow"><div class="network-module-title"><div><h1>Franqueados e seus acessos</h1><p>Identifique a unidade, controle os modulos liberados e administre os usuarios de cada franquia.</p></div></div><section id="franchise-directory" class="franchise-directory"></section><header id="franchise-detail-header" class="franchise-detail-header" hidden><button class="btn" type="button" id="back-franchise-list">← Todos os franqueados</button><div><h2 id="franchise-detail-name"></h2><p id="franchise-detail-code"></p></div><nav class="franchise-detail-tabs" aria-label="Informações da franqueada"><button type="button" data-franchise-tab="company">Dados da empresa</button><button type="button" data-franchise-tab="management">Cadastro e módulos</button><button type="button" data-franchise-tab="fiscal">Configuração fiscal</button><button type="button" data-franchise-tab="users">Usuários e permissões</button></nav></header><section class="network-card" id="franchise-management" hidden></section><section class="network-card" id="franchise-company-card" hidden><h2>Dados da empresa</h2><div id="managed-company-profile"></div></section><section class="network-card" id="franchise-fiscal" hidden></section><section class="network-card" id="franchise-users" hidden></section></div>';
    if(key==="users")return '<div class="network-module compact network-module-flow"><h1>Usuarios da Central do Administrador</h1><p>Estes usuarios administram a rede. Os funcionarios das lojas ficam em Franqueados.</p><section class="network-card" id="central-user-access"></section></div>';
    return `<div class="network-module compact network-module-flow"><section class="network-card"><h1>Meu acesso</h1><p>Altere a senha do usuario conectado a Central do Administrador.</p>
      <form id="central-password-form" class="network-form">
        <div class="field"><label>Senha atual<input name="currentPassword" type="password" autocomplete="current-password" required /></label></div>
        <div class="field"><label>Nova senha<input name="newPassword" type="password" minlength="6" autocomplete="new-password" required /></label></div>
        <div class="field"><label>Confirmar nova senha<input name="confirmation" type="password" minlength="6" autocomplete="new-password" required /></label></div>
        <button class="btn primary" type="submit">Alterar minha senha</button><span role="status" style="grid-column:1/-1"></span>
      </form></section></div>`;
  },
  bind({api,onFranchiseSaved=async()=>{}}) {
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
    if(management)this.mountFranchisees(management,api,"",onFranchiseSaved);
  },
  async mountFranchisees(container,api,selectedCode="",onFranchiseSaved=async()=>{}) {
    const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    container.textContent="Carregando franqueados...";
    try{
      const {clients}=await api("/api/network/franchisees");
      const modules=["PDV","NF-e","NFC-e","NFS-e","Estoque","Financeiro","Relatorios","Compras","CTe","CTe-OS","MDFe","SAT","MFe","SPED","Sintegra"];
      container.innerHTML=`<div class="franchise-heading"><div><h2>Cadastro da franqueada</h2><p>Selecione uma unidade para editar ou cadastre uma nova.</p></div><span class="franchise-mode" id="franchise-mode"></span></div>
        <p class="franchise-save-feedback" data-franchise-feedback role="status" aria-live="polite"></p><div class="franchise-toolbar"><div class="field"><label>Unidade selecionada<select id="managed-franchise"><option value="" disabled>Nova franqueada — preencha o cadastro abaixo</option>${clients.map(row=>`<option value="${escape(row.tenantCode)}">${escape(row.tradeName)} — ${escape(row.tenantCode)}</option>`).join("")}</select></label></div><button class="btn" type="button" id="new-franchise">+ Cadastrar franqueado</button></div>
        <form class="network-form franchise-editor" id="franchise-form">
          <fieldset class="franchise-section"><legend>1. Identificação e contato</legend><div class="franchise-fields">
            <div class="field"><label>Código da unidade<input name="tenantCode" required pattern="[a-z0-9-]+" placeholder="Ex.: loja-02" /></label><small>Use letras minúsculas, números e hífen.</small></div>
            <div class="field"><label>Nome da franqueada / unidade<input name="tradeName" required /></label></div>
            <div class="field"><label>CNPJ / CPF<div class="franchise-document-row"><input name="document" /><button class="btn" type="button" id="lookup-franchise-cnpj">Buscar CNPJ</button></div></label><small id="franchise-lookup-status" aria-live="polite"></small></div>
            <div class="field"><label>Responsável / contato<input name="adminUser" /></label></div>
          </div></fieldset>
          <fieldset class="franchise-section" id="franchise-initial-company"><legend>Dados da empresa e endereço</legend><p>Preenchidos pela consulta do CNPJ. Confira antes de salvar.</p><div class="franchise-fields">${window.CompanyProfile.fields.filter(([,key])=>['company','cnae','stateRegistration','municipalRegistration','cep','address','number','complement','district','city','cityCode','uf','phone','email'].includes(key)).map(([,key,label,type,limit])=>`<div class="field"><label>${escape(label)}<input name="profile_${key}" type="${type==='select'?'text':type}" maxlength="${limit}" /></label></div>`).join('')}</div></fieldset>
          <fieldset class="franchise-section" id="franchise-initial-access"><legend>Acesso inicial da unidade</legend><p>Defina o usuário administrador para o primeiro acesso.</p><div class="franchise-fields"><div class="field"><label>Login do administrador<input name="initialUsername" autocomplete="off" /></label></div><div class="field"><label>Senha inicial (mínimo 8 caracteres)<input name="adminPassword" type="password" minlength="8" autocomplete="new-password" /></label></div></div></fieldset>
          <fieldset class="franchise-section"><legend>2. Plano e operação</legend><div class="franchise-fields franchise-fields-four">
            <div class="field"><label>Plano<input name="plan" /></label></div>
            <div class="field"><label>Situação<select name="status"><option>Ativo</option><option>Homologacao</option><option>Inadimplente</option><option>Bloqueado</option></select></label></div>
            <div class="field"><label>Terminais permitidos<input name="maxTerminals" type="number" min="1" required /></label></div>
            <div class="field"><label>Renovação (dias)<input name="renewalDays" type="number" min="1" required /></label></div>
          </div></fieldset>
          <fieldset class="franchise-section"><legend>3. Módulos liberados</legend><p>Marque os recursos que esta unidade poderá utilizar.</p><div class="store-permission-grid franchise-modules">${modules.map(name=>`<label class="check-row"><input type="checkbox" name="module" value="${escape(name)}" /> ${escape(name)}</label>`).join("")}</div></fieldset>
          <div class="franchise-actions"><button class="btn primary" type="submit">Salvar franqueado e poderes</button><button class="btn" type="button" id="cancel-franchise-edit">Cancelar alterações</button></div><span role="status" aria-live="polite" class="full"></span>
        </form>`;
      const select=container.querySelector('#managed-franchise'),form=container.querySelector('#franchise-form'),status=form.querySelector('[role="status"]');
      const users=document.getElementById("franchise-users");let creating=false,lookupVersion=0,lookingUp=false;
      const directory=document.getElementById('franchise-directory'),detailHeader=document.getElementById('franchise-detail-header'),companyCard=document.getElementById('franchise-company-card'),fiscalCard=document.getElementById('franchise-fiscal');
      const showTab=tab=>{container.hidden=tab!=='management';companyCard.hidden=tab!=='company';users.hidden=tab!=='users';fiscalCard.hidden=tab!=='fiscal';detailHeader.querySelectorAll('[data-franchise-tab]').forEach(button=>{button.classList.toggle('active',button.dataset.franchiseTab===tab);button.setAttribute('aria-pressed',String(button.dataset.franchiseTab===tab));});};
      const showDirectory=()=>{lookupVersion++;directory.hidden=false;detailHeader.hidden=true;container.hidden=companyCard.hidden=users.hidden=fiscalCard.hidden=true;renderDirectory();directory.scrollIntoView({block:'start'});};
      const openUnit=(row,tab='company')=>{load(row);showTab(row?tab:'management');directory.hidden=true;detailHeader.hidden=false;document.getElementById('franchise-detail-name').textContent=row?.tradeName||'Cadastrar nova franqueada';document.getElementById('franchise-detail-code').textContent=row?`Código: ${row.tenantCode} · ${row.document||'CNPJ não informado'} · ${row.status||'Ativo'}`:'Preencha o cadastro e salve para liberar os dados da empresa e os usuários.';detailHeader.querySelector('nav').hidden=!row;detailHeader.scrollIntoView({block:'start'});};
      const renderDirectory=()=>{
        directory.innerHTML=`<div class="franchise-directory-top"><div><h2>Franqueados cadastrados <span>${clients.length}</span></h2><p>Encontre uma unidade e escolha o que deseja consultar.</p></div><button type="button" class="btn primary" id="directory-new-franchise">+ Novo franqueado</button></div><div class="franchise-directory-search"><label for="franchise-search">Buscar franqueado</label><input id="franchise-search" type="search" placeholder="Digite o nome, CNPJ ou código da unidade" /><p id="franchise-search-count" role="status"></p></div><div id="franchise-unit-list" class="franchise-unit-list"></div>`;
        const draw=()=>{const query=directory.querySelector('#franchise-search').value.toLocaleLowerCase('pt-BR').trim(),digits=query.replace(/\D/g,'');const matches=clients.filter(row=>[row.tradeName,row.tenantCode,row.document].some(value=>String(value||'').toLocaleLowerCase('pt-BR').includes(query))||(digits.length>2&&String(row.document||'').replace(/\D/g,'').includes(digits)));
          directory.querySelector('#franchise-search-count').textContent=`${matches.length} de ${clients.length} franqueados`;
          directory.querySelector('#franchise-unit-list').innerHTML=matches.length?matches.map(row=>`<article class="franchise-unit-card"><div class="franchise-unit-title"><h3>${escape(row.tradeName)}</h3><span class="franchise-unit-status">${escape(row.status||'Ativo')}</span></div><dl><div><dt>Código da unidade</dt><dd>${escape(row.tenantCode)}</dd></div><div><dt>CNPJ / CPF</dt><dd>${escape(row.document||'Não informado')}</dd></div><div><dt>Plano</dt><dd>${escape(row.plan||'Essencial')}</dd></div><div><dt>Terminais</dt><dd>${escape(row.maxTerminals||1)}</dd></div></dl><div class="franchise-unit-actions"><button type="button" class="btn primary" data-open-unit="${escape(row.tenantCode)}" data-open-tab="company">Abrir dados da empresa</button><button type="button" class="btn" data-open-unit="${escape(row.tenantCode)}" data-open-tab="management">Cadastro e módulos</button><button type="button" class="btn" data-open-unit="${escape(row.tenantCode)}" data-open-tab="fiscal">Configuração fiscal</button><button type="button" class="btn" data-open-unit="${escape(row.tenantCode)}" data-open-tab="users">Usuários e permissões</button></div></article>`).join(''):'<div class="franchise-empty"><h3>Nenhuma unidade encontrada</h3><p>Confira o nome, CNPJ ou código pesquisado.</p></div>';
          directory.querySelectorAll('[data-open-unit]').forEach(button=>button.addEventListener('click',()=>openUnit(clients.find(row=>row.tenantCode===button.dataset.openUnit),button.dataset.openTab)));
        };
        directory.querySelector('#franchise-search').addEventListener('input',draw);directory.querySelector('#directory-new-franchise').addEventListener('click',()=>openUnit(null));draw();
      };
      document.getElementById('back-franchise-list').onclick=showDirectory;
      detailHeader.querySelectorAll('[data-franchise-tab]').forEach(button=>button.onclick=()=>showTab(button.dataset.franchiseTab));

      const load=row=>{
        if(row&&window.FiscalSettingsPanel)window.FiscalSettingsPanel.mount(fiscalCard,{api,tenantCode:row.tenantCode});else{fiscalCard.fiscalMount={};fiscalCard.textContent='Salve a unidade para configurar a emissão fiscal.';}

        lookupVersion++;lookingUp=false;container.querySelector('#lookup-franchise-cnpj').disabled=false;
        container.querySelector('#franchise-lookup-status').textContent='';
        for(const id of ['franchise-initial-company','franchise-initial-access']){const section=container.querySelector('#'+id);section.hidden=!!row;section.disabled=!!row;}
        for(const input of form.querySelectorAll('[name^="profile_"]'))input.value='';
        form.elements.initialUsername.value='';form.elements.adminPassword.value='';form.elements.initialUsername.required=!row;form.elements.adminPassword.required=!row;

        const companyContainer=document.getElementById("managed-company-profile");
        if(companyContainer&&window.CompanyProfile){
          if(row)window.CompanyProfile.mount(companyContainer,{api,endpoint:`/api/tenant/${encodeURIComponent(row.tenantCode)}/company-profile`,onSaved:profile=>{
            row.tradeName=profile.tradeName||profile.company;row.document=profile.document;
            form.elements.tradeName.value=row.tradeName;form.elements.document.value=row.document;
            const option=[...select.options].find(option=>option.value===row.tenantCode);if(option)option.textContent=`${row.tradeName} — ${row.tenantCode}`;
          }});
          else{companyContainer.companyMount={};companyContainer.textContent="Salve a nova unidade para configurar os dados da empresa.";}
        }
        select.value=row?.tenantCode||"";container.querySelector('#franchise-mode').textContent=row?'Editando unidade':'Nova franqueada';
        creating=!row;for(const key of ["tenantCode","tradeName","document","adminUser","plan","maxTerminals","renewalDays","status"])form.elements[key].value=row?.[key]??({maxTerminals:1,renewalDays:30,status:"Ativo",plan:"Essencial"}[key]||"");
        form.elements.tenantCode.disabled=!!row;form.querySelectorAll('[name="module"]').forEach(input=>input.checked=(row?.modules||["PDV","Estoque","Financeiro","Relatorios","Compras"]).includes(input.value));status.textContent="";
        if(row)window.UserAccessPanel.mount(users,{api,basePath:`/api/provider/tenant/${encodeURIComponent(row.tenantCode)}/users`,permissions:window.UserAccessPanel.tenantPermissions});else users.textContent="Salve a nova franquia para administrar seus usuarios.";
      };
      select.addEventListener("change",()=>load(clients.find(row=>row.tenantCode===select.value)));
      container.querySelector('#new-franchise').addEventListener("click",()=>openUnit(null));
      container.querySelector('#cancel-franchise-edit').addEventListener("click",()=>{if(creating)showDirectory();else load(clients.find(row=>row.tenantCode===select.value)||clients[0]||null);});
      container.querySelector('#lookup-franchise-cnpj').addEventListener('click',async()=>{
        if(lookingUp)return;const version=++lookupVersion,documentValue=form.elements.document.value,code=documentValue.replace(/\D/g,''),wasCreating=creating;
        const before=Object.fromEntries([...form.elements].filter(input=>input.name).map(input=>[input.name,input.value]));const button=container.querySelector('#lookup-franchise-cnpj'),message=container.querySelector('#franchise-lookup-status');
        lookingUp=true;button.disabled=true;message.textContent='Consultando CNPJ...';
        try{const values=await window.CompanyProfile.lookupCnpj(code);if(version!==lookupVersion||form.elements.document.value!==documentValue)return;
          const fill=(name,value)=>{const input=form.elements[name];if(input&&input.value===before[name])input.value=String(value||'').slice(0,input.maxLength>0?input.maxLength:160);};
          fill('tradeName',values.tradeName||values.company);fill('adminUser',values.email||values.phone);
          if(wasCreating){for(const [key,value]of Object.entries(values))fill('profile_'+key,value);}
          else{const company=document.getElementById('managed-company-profile');const fields=company?.querySelector('form')?.elements;if(fields&&fields.document.value.replace(/\D/g,'')===code){for(const [key,value]of Object.entries(values))if(fields[key])fields[key].value=String(value||'').slice(0,fields[key].maxLength>0?fields[key].maxLength:160);}}
          message.textContent=wasCreating?'Dados preenchidos. Confira os dados da empresa e o endereço abaixo antes de salvar.':'Nome e contato preenchidos. Confira e salve cada bloco alterado.';
        }catch(error){if(version===lookupVersion)message.textContent=error.message;}finally{if(version===lookupVersion){lookingUp=false;button.disabled=false;}}
      });
      form.addEventListener("submit",async event=>{
        event.preventDefault();if(lookingUp){status.textContent="Aguarde a consulta do CNPJ terminar.";return;}const button=form.querySelector('button[type="submit"]');button.disabled=true;
        const body=Object.fromEntries(["tenantCode","tradeName","document","adminUser","plan","maxTerminals","renewalDays","status"].map(key=>[key,form.elements[key].value]));
        body.modules=[...form.querySelectorAll('[name="module"]:checked')].map(input=>input.value);
        try{if(creating){body.adminUser=form.elements.initialUsername.value;body.adminPassword=form.elements.adminPassword.value;body.companyProfile=window.CompanyProfile.validate({...Object.fromEntries(window.CompanyProfile.fields.map(([,key])=>[key,form.elements['profile_'+key]?.value||''])),company:form.elements.profile_company.value||body.tradeName,tradeName:body.tradeName,document:body.document});}await api(creating?"/api/tenants":`/api/provider/tenant/${encodeURIComponent(body.tenantCode)}`,{method:"POST",body:JSON.stringify(body)});await this.mountFranchisees(container,api,body.tenantCode,onFranchiseSaved);container.querySelector('[data-franchise-feedback]').textContent=`Unidade ${body.tradeName} (${body.tenantCode}) salva e selecionada.`;container.scrollIntoView({block:'start',behavior:'smooth'});await onFranchiseSaved();}catch(error){status.textContent=error.message;button.disabled=false;}
      });
      if(selectedCode){const selected=clients.find(row=>row.tenantCode===selectedCode);if(selected)openUnit(selected,'management');else showDirectory();}else showDirectory();
    }catch(error){container.textContent=error.message;}
  }
};
