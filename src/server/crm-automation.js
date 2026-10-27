const {createHash,randomUUID}=require('crypto'),{businessDay}=require('./cash-register'),insights=require('../customer-insights'),coupons=require('./coupons');
const presets=[{key:'birthday',name:'Aniversário do cliente'},{key:'mothers',name:'Dia das Mães'},{key:'fathers',name:'Dia dos Pais'},{key:'valentines',name:'Dia dos Namorados'},{key:'annual',name:'Data personalizada anual'}];
function rule(body,units,previous){
 const result={id:previous?.id||randomUUID(),name:String(body.name||'').trim(),event:body.event,hour:String(body.hour||'09:00'),monthDay:String(body.monthDay||''),units:[...new Set(body.units||[])],tag:String(body.tag||'').trim(),enabled:body.enabled===true,template:String(body.template||'').trim(),language:String(body.language||'pt_BR'),discountType:body.discountType,discountValue:Number(body.discountValue),validDays:Number(body.validDays),createdAt:previous?.createdAt||new Date().toISOString()};
 if(!result.name||result.name.length>100||!presets.some(p=>p.key===result.event)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(result.hour)||!result.units.length||result.units.some(c=>!units.includes(c)))throw Error('Confira nome, evento, horário e unidades.');
 if(!/^[a-z0-9_]{1,100}$/.test(result.template)||!/^\w{2,8}$/.test(result.language)||!Number.isInteger(result.validDays)||result.validDays<1||result.validDays>365)throw Error('Informe modelo aprovado, idioma e validade de 1 a 365 dias.');
 if(result.event==='annual'&&!/^\d{2}-\d{2}$/.test(result.monthDay))throw Error('Informe dia e mês da campanha.');
 if(result.event==='annual'&&new Date('2024-'+result.monthDay+'T00:00:00Z').toISOString().slice(5,10)!==result.monthDay)throw Error('Data personalizada inválida.');
 coupons.create({code:'VALIDACAO',type:result.discountType,value:result.discountValue,validFrom:'2026-01-01',validTo:'',maxUses:1,perCustomerLimit:1,audience:'all'});
 if(previous&&(previous.event!==result.event||previous.monthDay!==result.monthDay))throw Error('Para trocar o evento, crie outra campanha.');
 return result;
}
function eventDate(rule,year){const sunday=(month,n)=>{const first=new Date(Date.UTC(year,month-1,1));return String(month).padStart(2,'0')+'-'+String(1+(7-first.getUTCDay())%7+7*(n-1)).padStart(2,'0');};return rule.event==='mothers'?sunday(5,2):rule.event==='fathers'?sunday(8,2):rule.event==='valentines'?'06-12':rule.monthDay;}
function plan(rules,states,unitNames,existing=[],now=new Date()){
 const date=businessDay(now),year=Number(date.slice(0,4)),time=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now),planned=[];
 for(const r of rules){if(existing.some(c=>c.ruleId===r.id&&c.date===date&&c.status==='Finalizada'))continue;
 if(!r.enabled||time<r.hour||r.event!=='birthday'&&date.slice(5)!==eventDate(r,year))continue;
 const seen=new Set();for(const unit of r.units){for(const p of states[unit]?.people||[]){const document=String(p.document||'').replace(/\D/g,''),phone=insights.phone(p),key=r.id+':'+year+':'+document;
  if(p.type!=='Cliente'||p.active===false||p.marketingOptOut===true||document.length!==11||!phone||(seen.has(phone)||seen.has(document))||r.tag&&!(p.crmTags||[]).includes(r.tag))continue;
  if(r.event==='birthday'){let birthday=String(p.birthDate||'').slice(5,10);if(birthday==='02-29'&&new Date(Date.UTC(year,1,29)).getUTCMonth()!==1)birthday='02-28';if(birthday!==date.slice(5))continue;}
  seen.add(phone);seen.add(document);if(existing.some(c=>(c.recipients||[]).some(rec=>rec.automationKey===key)))continue;
  const code='AUTO'+createHash('sha256').update(key).digest('hex').slice(0,16).toUpperCase(),until=new Date(Date.parse(date+'T00:00:00Z')+(r.validDays-1)*86400000).toISOString().slice(0,10);
  planned.push({ruleId:r.id,title:r.name,date,template:r.template,language:r.language,recipient:{name:p.name,phone,document,automationKey:key,couponCode:code,status:'Pendente',sources:[{unitCode:unit,unit:unitNames[unit]||unit,id:String(p.id)}]},coupon:coupons.create({code,type:r.discountType,value:r.discountValue,validFrom:date,validTo:until,maxUses:1,perCustomerLimit:1,audience:'selected',documents:[document]})});
 }}
 }return planned;
}
function payload(campaign,recipient){const c=recipient.coupon;return {messaging_product:'whatsapp',to:recipient.phone,type:'template',template:{name:campaign.template,language:{code:campaign.language},components:[{type:'body',parameters:[recipient.name,recipient.couponCode,recipient.sources.map(s=>s.unit).join(', '),c.type==='percent'?c.value+'%':Number(c.value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),c.validTo.split('-').reverse().join('/')].map(text=>({type:'text',text:String(text)}))}]}};}
async function send(config,token,campaign,recipient,fetcher=fetch){
 const response=await fetcher(`https://graph.facebook.com/${config.version}/${config.phoneId}/messages`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload(campaign,recipient)),signal:AbortSignal.timeout(20000)});const data=await response.json();
 if(!response.ok)return {status:response.status>=500?'Incerto':'Erro',error:'Meta recusou a mensagem (código '+String(data.error?.code||response.status)+').'};
 if(!data.messages?.[0]?.id)return {status:'Incerto',error:'Meta respondeu sem identificador de mensagem. Conferir antes de repetir.'};
 return {status:'Aceita pela Meta',messageId:data.messages[0].id};
}
module.exports={presets,rule,plan,eventDate,payload,send};
