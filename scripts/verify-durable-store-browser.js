const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'tortela-durable-'));
 const script=fs.readFileSync(path.join(__dirname,'../src/durable-store.js'),'utf8');
 async function open(){const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true});const page=await context.newPage();await page.route('https://durable-test.invalid/**',r=>r.fulfill({contentType:'text/html',body:'<html><body>Teste isolado</body></html>'}));await page.goto('https://durable-test.invalid/');await page.addScriptTag({content:script});return {context,page};}
 let {context,page}=await open();
 const saved=await page.evaluate(async()=>{const operationId=DurableStore.operationId();const state={settings:{tenantCode:'test-a'},sales:[{id:1,operationId,total:25}]};const version=await DurableStore.checkpoint(state);return {operationId,version};});
 await context.close();({context,page}=await open());
 let result=await page.evaluate(()=>DurableStore.restore({settings:{tenantCode:'test-a'},sales:[]},false));
 assert.equal(result.state.sales[0].operationId,saved.operationId);assert(result.pending);
 const newer=await page.evaluate(async()=>{const old=(await DurableStore.read('test-a')).snapshot;old.state.settings.marker='alteração durante envio';return DurableStore.checkpoint(old.state);});
 await page.evaluate(async({operationId,version})=>DurableStore.acknowledge('test-a',[operationId],version),saved);
 assert(await page.evaluate(async()=> (await DurableStore.read('test-a')).snapshot.pending));
 await page.evaluate(async version=>DurableStore.acknowledge('test-a',[],version),newer);
 assert.equal(await page.evaluate(async()=> (await DurableStore.read('test-a')).snapshot.pending),false);
 assert.equal(await page.evaluate(async()=> (await DurableStore.read('test-a')).pending.length),0);
 assert.equal(await page.evaluate(async()=> (await DurableStore.read('test-b')).snapshot),null);
 const recovery=await page.evaluate(()=>DurableStore.exportAll());assert(recovery.sales[0].acknowledged);assert.equal(recovery.snapshots.find(s=>s.key==='test-a').state.settings.marker,'alteração durante envio');
 const denied=await context.newPage();await denied.route('https://durable-test.invalid/**',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await denied.goto('https://durable-test.invalid/');await denied.addScriptTag({content:script});
 const failed=await denied.evaluate(async()=>{indexedDB.open=()=>{const request={};queueMicrotask(()=>{request.error=new DOMException('Armazenamento cheio','QuotaExceededError');request.onerror();});return request;};try{await DurableStore.checkpoint({settings:{tenantCode:'test-a'},sales:[]});return false;}catch(error){return error.name==='QuotaExceededError';}});assert(failed);
 await context.close();console.log('OK: IndexedDB mantém venda após reiniciar Chrome; restaura sem cópia principal; confirmação antiga não remove alterações recentes; venda confirmada não retorna à fila; unidades isoladas; exportação completa; armazenamento cheio rejeita gravação.');
})().catch(error=>{console.error(error);process.exitCode=1;});
