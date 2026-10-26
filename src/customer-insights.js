(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CustomerInsights=factory();})(typeof window!=='undefined'?window:this,function(){
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 const doc=v=>String(v||'').replace(/[^a-z0-9]/gi,'').toUpperCase();
 const day=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||'').slice(0,10))?Date.parse(String(v).slice(0,10)+'T00:00:00Z'):NaN;
 function build(people,sales,days,today){
  const now=day(today),start=now-(days-1)*86400000,groups=new Map(people.map(p=>[String(p.id),[]]));
  const docs=new Map(),names=new Map();for(const p of people){if(doc(p.document)){const key=doc(p.document);docs.set(key,docs.has(key)?null:p);}const key=normalize(p.name);if(key)names.set(key,names.has(key)?null:p);}
  for(const sale of sales){if(['Orcamento','Orçamento'].includes(sale.type)||!['Fechado','Parcialmente devolvido','Concluido','Concluído'].includes(sale.status||'Fechado'))continue;
   const date=day(sale.date||sale.createdAt);if(!Number.isFinite(date)||date>now)continue;
   const document=doc(sale.customerDocument||sale.clubCpf);let person=document?docs.get(document):sale.customerId?people.find(p=>String(p.id)===String(sale.customerId)):names.get(normalize(sale.customer));
   if(!person)continue;const net=Math.max(0,Number(sale.total||0)-(sale.returns||[]).reduce((sum,r)=>sum+Number(r.value||0),0));if(net<=0)continue;
   groups.get(String(person.id)).push({date,net});
  }
  const result=new Map();for(const p of people){const all=groups.get(String(p.id)).sort((a,b)=>a.date-b.date),period=all.filter(x=>x.date>=start),total=period.reduce((n,x)=>n+x.net,0),last=all.at(-1)?.date;
   result.set(String(p.id),{count:period.length,total,ticket:period.length?total/period.length:0,last:last===undefined?'':new Date(last).toISOString().slice(0,10),daysSince:last===undefined?null:Math.floor((now-last)/86400000),lifetimeCount:all.length,interval:all.length>1?Math.round((all.at(-1).date-all[0].date)/86400000/(all.length-1)):null,frequency:period.length>=2?'Recorrente':period.length===1?'Uma compra':all.length?'Sem compra no período':'Nunca comprou'});
  }return result;
 }
 function matches(metric,filter){return filter==='all'||filter==='recurring'&&metric.count>=2||filter==='one'&&metric.count===1||filter==='none'&&metric.count===0||filter==='never'&&metric.lifetimeCount===0||filter==='dormant'&&metric.lifetimeCount>0&&metric.count===0;}
 function phone(person){let n=String(person.whatsapp||person.phone||'').replace(/\D/g,'');if(n.length===10||n.length===11)n='55'+n;return /^55\d{10,11}$/.test(n)?n:'';}
 return {build,matches,phone,normalize};
});
