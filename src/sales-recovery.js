(function(){
 'use strict';
 const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let archive;
 $('date').value=new Date(Date.now()-86400000).toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
 async function readJournal(){
  if(!indexedDB.databases)return {error:'Este navegador não permite listar os bancos locais sem abri-los.'};
  if(!(await indexedDB.databases()).some(d=>d.name==='tortela-durable-v1'))return {snapshots:[],sales:[],absent:true};
  return new Promise((resolve,reject)=>{
   const request=indexedDB.open('tortela-durable-v1');
   request.onupgradeneeded=()=>request.transaction.abort();
   request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{const db=request.result,names=['snapshots','sales'].filter(n=>db.objectStoreNames.contains(n)),result={snapshots:[],sales:[]};if(!names.length){db.close();resolve(result);return;}const tx=db.transaction(names,'readonly');for(const name of names){const r=tx.objectStore(name).getAll();r.onsuccess=()=>result[name]=r.result;}tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};};
  });
 }
 async function scan(){
  $('scan').disabled=true;$('status').textContent='Lendo cópias preservadas…';
  try{
   const local={};for(const key of Object.keys(localStorage)){if(key==='tortelaplus-state-v1'||key==='tortelaplus-corrupt-primary-backup'||key.startsWith('tortelaplus-pending-backup-')||key==='tortelaplus-pending-sync')local[key]=localStorage.getItem(key);}
   let durable;try{durable=await readJournal();}catch(e){durable={error:e.message};}
   archive={format:'tortela-recovery-readonly-v1',exportedAt:new Date().toISOString(),origin:location.origin,local,durable};
   const sources=[];
   function walk(value,label,tenant){if(!value||typeof value!=='object')return;if(value.settings&&Array.isArray(value.sales)){sources.push({label,tenant:value.settings.tenantCode||tenant,sales:value.sales});return;}if(value.sale){sources.push({label,tenant:value.tenant||tenant,sales:[value.sale]});return;}if(Array.isArray(value)){value.forEach((v,i)=>walk(v,label+' ['+i+']',tenant));return;}if(value.state)walk(value.state,label,tenant);}
   for(const [key,raw] of Object.entries(local)){try{walk(JSON.parse(raw),key);}catch{sources.push({label:key+' (conteúdo inválido)',tenant:'',sales:[]});}}
   for(const row of durable.snapshots||[])walk(row,'Diário: snapshot '+row.key,row.key);
   for(const row of durable.sales||[])walk(row,'Diário: '+row.operationId,row.tenant);
   const date=$('date').value,unit=$('unit').value.trim(),matches=s=>s.date===date||(!s.date&&String(s.soldAt||'').slice(0,10)===date);
   $('sources').innerHTML='<table><tr><th>Origem</th><th>Unidade</th><th>Total de registros</th><th>Na data</th></tr>'+sources.map(s=>'<tr><td>'+esc(s.label)+'</td><td>'+esc(s.tenant)+'</td><td>'+s.sales.length+'</td><td>'+s.sales.filter(matches).length+'</td></tr>').join('')+'</table>';
   const rows=new Map();for(const source of sources.filter(s=>s.tenant===unit)){for(const sale of source.sales.filter(matches)){const key=JSON.stringify([sale.operationId||'',sale.id,sale.soldAt,sale.total,sale.items]);if(!rows.has(key))rows.set(key,{sale,sources:[]});rows.get(key).sources.push(source.label);}}
   const values=[...rows.values()];$('sales').innerHTML='<table><tr><th>Venda</th><th>Data/hora registrada</th><th>Valor</th><th>Status</th><th>Cópias</th></tr>'+values.map(({sale,sources})=>'<tr><td>'+esc(sale.id)+'</td><td>'+esc(sale.soldAt||sale.date)+'</td><td>'+Number(sale.total||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})+'</td><td>'+esc(sale.status)+'</td><td>'+sources.length+'</td></tr>').join('')+'</table>';
   $('status').textContent=values.length+' registros distintos na data '+date+' para '+unit+'. '+(durable.error?'Falha ao ler diário: '+durable.error:durable.absent?'Diário independente não encontrado neste perfil.':'Diário independente consultado.');$('backup').disabled=false;
  }catch(e){$('status').textContent='Não foi possível concluir: '+e.message;}finally{$('scan').disabled=false;}
 }
 $('scan').onclick=scan;
 $('backup').onclick=()=>{if(!archive)return;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(archive,null,2)],{type:'application/json'}));a.href=url;a.download='recuperacao-tortela-'+$('unit').value+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
 scan();
})();
