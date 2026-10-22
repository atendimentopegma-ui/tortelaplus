(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CompanyProfile=api;})(typeof window==='object'?window:globalThis,()=>{
 const fields=[
  ['Identificação','company','Razão social / nome empresarial','text',160],['Identificação','tradeName','Nome fantasia','text',160],['Identificação','document','CNPJ / CPF','text',18],['Identificação','stateRegistration','Inscrição estadual / ISENTO','text',30],['Identificação','municipalRegistration','Inscrição municipal','text',30],['Identificação','cnae','CNAE principal','text',12],
  ['Endereço','cep','CEP','text',10],['Endereço','address','Logradouro','text',160],['Endereço','number','Número / S/N','text',30],['Endereço','complement','Complemento','text',120],['Endereço','district','Bairro','text',100],['Endereço','city','Município','text',100],['Endereço','cityCode','Código IBGE do município','text',7],['Endereço','uf','UF','select',2],
  ['Contato','contactName','Responsável / contato','text',120],['Contato','phone','Telefone','tel',30],['Contato','email','E-mail','email',160],['Contato','website','Site','url',200],
  ['Tributação','regime','Regime tributário','select',60],['Tributação','crt','CRT','select',1],['Tributação','accountantName','Contador / escritório contábil','text',120],['Tributação','accountantDocument','CNPJ / CPF do contador','text',18],['Tributação','accountantCrc','CRC do contador','text',30],['Tributação','accountantEmail','E-mail do contador','email',160],['Tributação','accountantPhone','Telefone do contador','tel',30]
 ];
 const ufs='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
 const regimes=['Simples Nacional','Simples Nacional - Excesso de Sublimite','MEI','Lucro Presumido','Lucro Real','Lucro Arbitrado'];
 const profile=value=>Object.fromEntries(fields.map(([,key])=>[key,String(key==='company'?(value?.legalName||value?.company||''):key==='tradeName'?(value?.tradeName||(value?.legalName?value?.company:'')||''):(value?.[key]??''))]));
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function validate(incoming,current={}){
  if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw Error('Dados da empresa inválidos.');
  const allowed=new Set(fields.map(([,key])=>key));for(const key of Object.keys(incoming))if(!allowed.has(key))throw Error('Campo não permitido: '+key);
  const result=profile({...current,...incoming});
  for(const [,key,label,,limit] of fields){result[key]=result[key].trim();if(result[key].length>limit)throw Error(label+': tamanho máximo de '+limit+' caracteres.');if(/[\x00-\x1f\x7f]/.test(result[key]))throw Error(label+': caracteres inválidos.');}
  if(result.company.length<2)throw Error('Informe a razão social / nome empresarial.');
  for(const key of ['document','accountantDocument','cep','cityCode','cnae']){const value=result[key];if(value&&!/^[\d.\s/()-]+$/.test(value))throw Error('Formato inválido: '+key);result[key]=value.replace(/\D/g,'');}
  for(const key of ['document','accountantDocument'])if(result[key]&&![11,14].includes(result[key].length))throw Error('CNPJ / CPF deve conter 14 ou 11 dígitos.');
  if(result.cep&&result.cep.length!==8)throw Error('CEP deve conter 8 dígitos.');
  if(result.cityCode&&result.cityCode.length!==7)throw Error('Código IBGE deve conter 7 dígitos.');
  if(result.cnae&&result.cnae.length!==7)throw Error('CNAE deve conter 7 dígitos.');
  result.uf=result.uf.toUpperCase();if(result.uf&&!ufs.includes(result.uf))throw Error('UF inválida.');
  for(const key of ['email','accountantEmail'])if(result[key]&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result[key]))throw Error('E-mail inválido.');
  if(result.website&&!/^https?:\/\/[^\s]+$/i.test(result.website))throw Error('O site deve começar com https:// ou http://.');
  if(result.regime&&!regimes.includes(result.regime))throw Error('Regime tributário inválido.');
  const expected={'Simples Nacional':'1','Simples Nacional - Excesso de Sublimite':'2',MEI:'4','Lucro Presumido':'3','Lucro Real':'3','Lucro Arbitrado':'3'};
  if(result.crt&&!['1','2','3','4'].includes(result.crt))throw Error('CRT inválido.');
  if(result.regime&&result.crt&&result.crt!==expected[result.regime]&&!(result.regime==='Simples Nacional'&&result.crt==='2'))throw Error('CRT incompatível com o regime tributário.');
  return result;
 }
 function form(data){
  const groups=[...new Set(fields.map(row=>row[0]))];
  return `<form class="network-form"><p style="grid-column:1/-1">${escape(data.scope==='central'?'Empresa franqueadora — Central da rede':'Empresa desta unidade: '+data.unit)}. Este cadastro é independente das demais empresas.</p>${groups.map(group=>`<fieldset style="grid-column:1/-1;min-width:0"><legend>${escape(group)}</legend><div class="grid two">${fields.filter(row=>row[0]===group).map(([,key,label,type,limit])=>`<div class="field"><label>${escape(label)}${type==='select'?`<select name="${key}">${(key==='uf'?['',...ufs]:key==='regime'?['',...regimes]:['','1','2','3','4']).map(value=>`<option value="${escape(value)}" ${data.profile[key]===value?'selected':''}>${escape(value||(key==='crt'?'Automático pelo regime':'Selecione'))}</option>`).join('')}</select>`:`<input name="${key}" type="${type}" maxlength="${limit}" value="${escape(data.profile[key])}" ${key==='company'?'required':''} />`}</label>${key==='document'?'<button class="btn" type="button" data-lookup-company="cnpj">Consultar CNPJ</button>':key==='cep'?'<button class="btn" type="button" data-lookup-company="cep">Buscar endereço pelo CEP</button>':''}</div>`).join('')}</div></fieldset>`).join('')}<p style="grid-column:1/-1">O cadastro não ativa emissão fiscal. Certificado, CSC e agente fiscal são configurados no setor Fiscal da empresa emissora.</p><button class="btn primary" type="submit">Salvar dados da empresa</button><button class="btn" type="button" data-reload-company>Recarregar cadastro</button><span role="status" aria-live="polite" style="grid-column:1/-1"></span></form>`;
 }
 async function lookupCnpj(code,lookupFetch=globalThis.fetch){
  code=String(code).replace(/\D/g,'');if(!/^\d{14}$/.test(code)||/^(\d)\1+$/.test(code))throw Error('Informe um CNPJ com 14 dígitos.');
  const request=async url=>{const response=await lookupFetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Consulta indisponível ou CNPJ não encontrado. Tente novamente ou preencha manualmente.');return response.json();};
      let result;try{result=await request('https://minhareceita.org/'+code);}catch{result=await request('https://brasilapi.com.br/api/cnpj/v1/'+code);}
      if(String(result.cnpj||'').replace(/\D/g,'')!==code||!result.razao_social)throw Error('A consulta retornou dados inconsistentes. Preencha manualmente.');
      const values={company:result.razao_social,tradeName:result.nome_fantasia||'',cnae:result.cnae_fiscal||'',cep:result.cep||'',address:[result.descricao_tipo_de_logradouro,result.logradouro].filter(Boolean).join(' '),number:result.numero||'',complement:result.complemento||'',district:result.bairro||'',city:result.municipio||'',uf:result.uf||'',cityCode:'',phone:result.ddd_telefone_1||'',email:result.email||''};
      values.cep=String(values.cep).replace(/\D/g,'');
      if(/^\d{8}$/.test(values.cep)){try{const address=await request('https://viacep.com.br/ws/'+values.cep+'/json/');const normalized=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();if(normalized(address.uf)===normalized(values.uf)&&normalized(address.localidade)===normalized(values.city))values.cityCode=address.ibge||'';}catch{}}
  return values;
 }
 async function mount(container,{api,endpoint,onSaved=()=>{},lookupFetch=globalThis.fetch}){
  const token={};container.companyMount=token;container.textContent='Carregando dados da empresa...';
  try{const data=await api(endpoint);if(container.companyMount!==token)return;container.innerHTML=form(data);const element=container.querySelector('form'),status=element.querySelector('[role="status"]');let busy=false;
   element.querySelector('[data-reload-company]').addEventListener('click',()=>{if(!busy)mount(container,{api,endpoint,onSaved,lookupFetch});});
   element.querySelectorAll('[data-lookup-company]').forEach(button=>button.addEventListener('click',async()=>{
    if(busy)return;const kind=button.getAttribute('data-lookup-company'),key=kind==='cnpj'?'document':'cep';
    const original=Object.fromEntries(fields.map(([,name])=>[name,element.elements[name].value]));
    const code=original[key].replace(/\D/g,'');
    if((kind==='cnpj'&&(!/^\d{14}$/.test(code)||/^(\d)\1+$/.test(code)))||(kind==='cep'&&!/^\d{8}$/.test(code))){status.textContent=kind==='cnpj'?'Informe um CNPJ com 14 dígitos para consultar. CPF não possui consulta pública.':'Informe um CEP com 8 dígitos.';return;}
    busy=true;element.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent=kind==='cnpj'?'Consultando CNPJ na base pública...':'Consultando endereço no ViaCEP...';
    try{
     const request=async url=>{const response=await lookupFetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error(response.status===404?'Cadastro não encontrado.':'Serviço de consulta indisponível. Tente novamente ou preencha manualmente.');const value=await response.json();if(value.erro)throw Error('CEP não encontrado.');return value;};
     let values;
     if(kind==='cnpj'){
      values=await lookupCnpj(code,lookupFetch);
     }else{const result=await request('https://viacep.com.br/ws/'+code+'/json/');values={address:result.logradouro||'',district:result.bairro||'',city:result.localidade||'',uf:result.uf||'',cityCode:result.ibge||''};}
     if(container.companyMount!==token)return;
     if(element.elements[key].value!==original[key]){status.textContent='O documento ou CEP mudou durante a consulta. Consulte novamente.';return;}
     for(const [,name,,,limit] of fields)if(Object.hasOwn(values,name)&&element.elements[name].value===original[name])element.elements[name].value=String(values[name]).slice(0,limit);
     status.textContent='Dados preenchidos pela consulta. Confira os campos e clique em Salvar dados da empresa. Regime e inscrições não foram alterados.';
    }catch(error){if(container.companyMount===token)status.textContent=error.name==='TimeoutError'?'A consulta demorou demais. Tente novamente ou preencha manualmente.':error.message||'Não foi possível consultar. Preencha manualmente.';}
    finally{busy=false;element.querySelectorAll('button').forEach(b=>b.disabled=false);}
   }));
   element.addEventListener('submit',async event=>{event.preventDefault();if(busy)return;try{const draft=validate(Object.fromEntries(fields.map(([,key])=>[key,element.elements[key].value])));busy=true;element.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='Salvando dados da empresa...';const saved=await api(endpoint,{method:'POST',body:JSON.stringify({profile:draft,revision:data.revision})});if(container.companyMount!==token)return;data.profile=saved.profile;data.revision=saved.revision;for(const [,key]of fields)element.elements[key].value=saved.profile[key];onSaved(saved.profile);status.textContent='Dados da empresa salvos. As outras empresas foram preservadas.';}catch(error){if(container.companyMount===token)status.textContent=error.message;}finally{busy=false;element.querySelectorAll('button').forEach(b=>b.disabled=false);}});
  }catch(error){if(container.companyMount===token)container.textContent=error.message||'Não foi possível carregar os dados da empresa.';}
 }
 return {fields,profile,validate,form,mount,lookupCnpj};
});
