const assert=require('assert/strict'),company=require('../src/company-profile');

(async()=>{

 const profile=company.profile({company:'Anterior',document:'11222333000181',regime:'Lucro Real',crt:'3',stateRegistration:'ISENTO'});

 const elements=Object.fromEntries(company.fields.map(([,k])=>[k,{value:profile[k]}])),status={},events={};

 const buttons=['cnpj','cep'].map(kind=>({getAttribute:()=>kind,addEventListener:(event,handler)=>events[kind]=handler}));

 const form={elements,querySelector:selector=>selector==='[role="status"]'?status:{addEventListener(){}},querySelectorAll:selector=>buttons,addEventListener(){}};

 const container={querySelector:()=>form};let fetches=[],fail=false,gate,release;let writes=0;

 const lookupFetch=async url=>{fetches.push(url);if(gate)await gate;if(fail)throw Error('Indisponível');return {ok:true,json:async()=>(url.includes('brasilapi')||url.includes('minhareceita'))?{cnpj:'11222333000181',razao_social:'Empresa Consultada',nome_fantasia:'Fantasia',cep:'01001-000',descricao_tipo_de_logradouro:'PRACA',logradouro:'DA SE',numero:'123',municipio:'SAO PAULO',uf:'SP',cnae_fiscal:5611201}:{logradouro:'Praça da Sé',bairro:'Sé',localidade:'São Paulo',uf:'SP',ibge:'3550308'}};};

 await company.mount(container,{api:async(endpoint,options)=>{if(options)writes++;return {scope:'central',profile,revision:'r'};},endpoint:'/profile',lookupFetch});

 await events.cnpj();assert.equal(elements.company.value,'Empresa Consultada');assert.equal(elements.cityCode.value,'3550308');assert.equal(elements.address.value,'PRACA DA SE');assert.equal(elements.number.value,'123');assert.equal(elements.regime.value,'Lucro Real');assert.equal(elements.crt.value,'3');assert.equal(elements.stateRegistration.value,'ISENTO');assert.equal(writes,0);assert.match(status.textContent,/Confira/);

 await events.cep();assert.equal(elements.address.value,'Praça da Sé');assert.equal(elements.number.value,'123');

 elements.document.value='123';const count=fetches.length;await events.cnpj();assert.equal(fetches.length,count);

 elements.document.value=profile.document;fail=true;await events.cnpj();assert.equal(elements.company.value,'Empresa Consultada');assert.match(status.textContent,/Indisponível/);fail=false;

 gate=new Promise(resolve=>release=resolve);const pending=events.cnpj();elements.document.value='00000000000191';release();await pending;assert.match(status.textContent,/mudou/);gate=null;

 elements.document.value=profile.document;gate=new Promise(resolve=>release=resolve);const editing=events.cnpj();elements.company.value='Editada durante consulta';release();await editing;assert.equal(elements.company.value,'Editada durante consulta');assert.equal(writes,0);

 assert.match(company.form({scope:'central',profile}),/Consultar CNPJ/);assert.match(company.form({scope:'central',profile}),/Buscar endereço pelo CEP/);

 console.log('OK consulta CNPJ/CEP: mapeamento, IBGE, revisão manual, sem gravar, erro, formato e edição concorrente.');

})().catch(error=>{console.error(error);process.exitCode=1});

