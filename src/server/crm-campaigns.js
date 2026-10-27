const {randomUUID}=require('crypto'),insights=require('../customer-insights');
function tags(value){if(!Array.isArray(value)||value.length>8)throw Error('Use até 8 etiquetas.');const result=[...new Set(value.map(v=>String(v).trim()).filter(Boolean))];if(result.some(v=>v.length>30||/[<>\r\n]/.test(v)))throw Error('Cada etiqueta deve ter até 30 caracteres, sem quebras de linha.');return result;}
function create(body,units,states,ownerUnit='',now=new Date()){
 const title=String(body.title||'').trim(),message=String(body.message||'').trim();
 if(!title||title.length>100||!message||message.length>4000)throw Error('Informe nome (até 100 caracteres) e mensagem (até 4000).');
 if(!Array.isArray(body.recipients)||!body.recipients.length||body.recipients.length>10000)throw Error('Selecione de 1 a 10000 cadastros.');
 const contacts=new Map();for(const selected of body.recipients){const unit=units.find(u=>u.code===selected.unitCode);if(!unit||(ownerUnit&&unit.code!==ownerUnit))throw Error('Unidade não autorizada.');
  const person=(states[unit.code]?.people||[]).find(p=>String(p.id)===String(selected.id)&&p.type==='Cliente');
  const phone=person&&insights.phone(person);if(!person||person.active===false||person.marketingOptOut===true||!phone)throw Error('Revise a seleção: cliente inativo, removido ou sem telefone válido.');
  if(!contacts.has(phone))contacts.set(phone,{phone,name:person.name,sources:[]});const contact=contacts.get(phone);if(!contact.sources.some(s=>s.unitCode===unit.code&&s.id===String(person.id)))contact.sources.push({unitCode:unit.code,unit:unit.name,id:String(person.id)});
 }
 const template=String(body.template||'').trim(),language=String(body.language||'pt_BR').trim(),parameters=Array.isArray(body.parameters)?body.parameters.map(String):[];if(template&&!/^[a-z0-9_]{1,100}$/.test(template)||!/^\w{2,8}$/.test(language)||parameters.length>20||parameters.some(p=>!p.trim()||p.length>1024))throw Error('Confira o modelo Meta, idioma e parâmetros.');
 return {id:randomUUID(),sendMode:'meta',template,language,parameters,title,message,createdAt:now.toISOString(),updatedAt:now.toISOString(),status:'Preparada',ownerUnit,units:[...new Set([...contacts.values()].flatMap(c=>c.sources.map(s=>s.unitCode)))],recipients:[...contacts.values()].map(r=>({...r,deliveryId:randomUUID(),status:'Não enviada'}))};
}
function launch(campaign,connection,now=new Date()){
 if(campaign.automatic)throw Error('Esta ação é exclusiva das campanhas de envio manual.');
 if(!connection?.enabled||!connection.tokenVault)throw Error('Conecte a conta oficial da Meta na Central antes de enviar. Nenhuma mensagem foi disparada.');
 if(!campaign.template)throw Error('Informe o nome do modelo aprovado na Meta antes de enviar.');
 if(campaign.launchedAt)return campaign;
 if(campaign.status!=='Preparada')throw Error('A campanha precisa estar preparada para enviar.');
 for(const recipient of campaign.recipients)require('./crm-automation').payload(campaign,recipient);
 return {...campaign,sendMode:'meta',launchedAt:now.toISOString(),status:'Processando',recipients:campaign.recipients.map(r=>({...r,deliveryId:r.deliveryId||randomUUID(),status:'Pendente'}))};
}
function configure(campaign,body){
 if(campaign.automatic||campaign.launchedAt)throw Error('Não é possível alterar o conteúdo após iniciar o envio.');
 const template=String(body.template||'').trim(),language=String(body.language||'pt_BR'),parameters=Array.isArray(body.parameters)?body.parameters.map(String):[];
 if(!/^[a-z0-9_]{1,100}$/.test(template)||!/^\w{2,8}$/.test(language)||parameters.length>20||parameters.some(p=>!p.trim()||p.length>1024))throw Error('Confira o modelo aprovado, idioma e parâmetros.');
 return {...campaign,sendMode:'meta',template,language,parameters};
}
function project(campaign,unit=''){
 const recipients=campaign.recipients.map(r=>({...r,sources:r.sources.filter(s=>!unit||s.unitCode===unit)})).filter(r=>r.sources.length);
 if(!recipients.length)return null;return {...campaign,units:unit?[unit]:campaign.units,recipients,count:recipients.length,canManage:!unit||campaign.ownerUnit===unit};
}
function transition(campaign,status,now=new Date()){
 const allowed={Preparada:['Pausada','Finalizada'],Processando:['Pausada','Finalizada'],Pausada:['Preparada','Finalizada'],Finalizada:[]};if(!allowed[campaign.status]?.includes(status))throw Error('Mudança de situação inválida.');return {...campaign,status,updatedAt:now.toISOString()};
}
module.exports={tags,create,project,transition,launch,configure};
