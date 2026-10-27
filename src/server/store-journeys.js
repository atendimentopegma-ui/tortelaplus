const {randomBytes,randomUUID,createHash}=require('crypto');
const digits=v=>String(v||'').replace(/\D/g,''),hash=v=>createHash('sha256').update(String(v||'')).digest('hex');
function validCpf(v){const n=digits(v);if(n.length!==11||/^(\d)\1{10}$/.test(n))return false;const check=s=>{const r=[...s].reduce((a,d,i)=>a+Number(d)*(s.length+1-i),0)*10%11;return r===10?0:r;};return check(n.slice(0,9))===+n[9]&&check(n.slice(0,10))===+n[10];}
function create(body,now=new Date()){
 const fields=['name','phone','birthDate','address','number','complement','district','city','uf','email'],customer=Object.fromEntries(fields.map(k=>[k,String(body[k]||'').trim()]));customer.document=digits(body.document);customer.cep=digits(body.cep);customer.uf=customer.uf.toUpperCase();
 if(fields.some(k=>customer[k].length>160)||!customer.name||!validCpf(customer.document)||digits(customer.phone).length<10||digits(customer.phone).length>13||!/^\d{4}-\d{2}-\d{2}$/.test(customer.birthDate)||!Number.isFinite(Date.parse(customer.birthDate))||new Date(customer.birthDate).toISOString().slice(0,10)!==customer.birthDate||customer.birthDate>now.toISOString().slice(0,10)||customer.cep.length!==8||!customer.address||!customer.number||!customer.district||!customer.city||!/^[A-Z]{2}$/.test(customer.uf)||body.consent!==true)throw Error('Confira nome, CPF, nascimento, telefone, endereço completo e autorização do cadastro.');
 const token=randomBytes(32).toString('hex');return {token,lead:{id:randomUUID(),accessHash:hash(token),customer,createdAt:now.toISOString(),updatedAt:now.toISOString(),phase:'registered',whatsappGroupAuthorized:body.whatsappGroupAuthorized===true,consent:{accepted:true,acceptedAt:now.toISOString()},tenantCode:'',tenantName:''}};
}
function authorize(leads,id,token){const lead=leads.find(l=>l.id===id&&l.accessHash===hash(token));if(!lead||Date.now()-Date.parse(lead.createdAt)>30*86400000)throw Error('Cadastro de compra não identificado. Inicie seu cadastro novamente.');return lead;}
function describe(lead,now=new Date()){
 if(lead.phase==='ordered')return 'Pedido enviado';if(lead.phase==='outside')return 'Não atendido — fora da área';if(lead.phase==='location_error')return 'Não atendido — endereço não confirmado';
 if(lead.phase==='abandoned'||now-Date.parse(lead.updatedAt)>=30*60000)return 'Não atendido — compra não concluída';
 return lead.phase==='registered'?'Cadastro recebido — verificar entrega':'Compra em andamento';
}
function safe(lead,now=new Date()){const {accessHash,...result}=lead;return {...result,status:describe(lead,now)};}
function checkAddress(lead,body){const a=lead.customer,b=body.customer||{};for(const k of ['name','phone','address','number','district','city','uf'])if(String(a[k]||'').trim().toLowerCase()!==String(b[k]||'').trim().toLowerCase())throw Error('O cadastro ou endereço mudou. Atualize o cadastro e confirme a entrega novamente.');if(a.cep!==digits(body.cep))throw Error('Confirme o CEP no cadastro antes de continuar.');}
const attempts=new Map();
function allow(key,limit=30,now=Date.now()){
 for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);
 if(attempts.size>10000&&!attempts.has(key))return false;
 const entry=attempts.get(key)||{count:0,until:now+15*60000};entry.count++;attempts.set(key,entry);return entry.count<=limit;
}
module.exports={allow,create,authorize,describe,safe,checkAddress,validCpf};
