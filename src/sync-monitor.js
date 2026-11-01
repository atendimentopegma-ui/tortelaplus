(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SyncMonitor=api;})(typeof window!=='undefined'?window:this,function(){
 function create(options){const now=options.now||Date.now,set=options.setInterval||setInterval,clear=options.clearInterval||clearInterval;let timer=null,busy=false,next=0,failures=0;const status={phase:'idle',checkedAt:0,confirmedAt:0,nextCheckAt:0,error:''};
 const publish=()=>options.onStatus?.({...status});
 async function run(force=false){if(busy||!options.sessionReady())return false;if(!force&&now()<next)return false;busy=true;status.phase='checking';publish();try{await options.check();status.checkedAt=now();if(options.hasPending()){status.phase='sending';publish();const sent=await options.send();if(sent===false||options.hasPending()){status.phase='pending';status.error='O envio ainda não foi confirmado. Os dados continuam protegidos neste computador.';next=now()+10000;return false;}status.confirmedAt=now();}failures=0;status.phase='online';status.error='';next=now()+(options.hasPending()?10000:30000);return true;}catch(error){failures++;status.phase=error.status===401?'auth-required':error.status===403?'access-blocked':'offline';status.error=error.status===401?'Sessão expirada. Entre novamente para enviar as pendências.':error.status===403?'Acesso recusado pelo servidor. Confira a liberação da unidade.':(error.message||'Falha ao acessar o servidor.');next=now()+Math.min(30000,5000*2**Math.min(3,failures-1));return false;}finally{busy=false;status.nextCheckAt=next;publish();}}
 function start(){if(timer!==null)return;next=0;timer=set(()=>{run();},5000);run(true);}
 function stop(){if(timer!==null)clear(timer);timer=null;}
 function pending(){next=0;}
 return {start,stop,run,pending,status:()=>({...status,busy})};
 }
 return {create};
});
