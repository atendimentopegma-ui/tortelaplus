// Entire HTTP/event flow is isolated in fresh temporary files; agent is a local mock.
const fs=require('fs'),os=require('os'),path=require('path'),crypto=require('crypto'),net=require('net'),http=require('http'),assert=require('assert/strict'),{spawn}=require('child_process');
const {baseState,row}=require('./fiscal-test-fixture'),{generateNfeXml}=require('../src/server/fiscal-documents');
const root=path.resolve(__dirname,'..'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tortela-cancel-api-'));require('./fixtures/seed-operational-state')(dir);
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 let calls=0,received,status='135';const mock=http.createServer(async(req,res)=>{let body='';for await(const c of req)body+=c;received=JSON.parse(body);calls++;assert.equal(req.headers.authorization,'Bearer MockOnly');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({parsed:{statusCode:status,statusMessage:'Somente mock local',protocol:'123456789012345',raw:'cStat='+status},response:{code:0}}));});await new Promise(r=>mock.listen(0,'127.0.0.1',r));
 const env={...process.env};for(const k of Object.keys(env))if(k==='DATABASE_URL'||k.startsWith('PEGMA_')||k.startsWith('TORTELAPLUS_'))delete env[k];
 Object.assign(env,{PORT:String(port),DATABASE_URL:'',TORTELAPLUS_DB_DIR:dir,TORTELAPLUS_SECRET_KEY:'OnlySyntheticTestKey012345678901234567890',TORTELAPLUS_CENTRAL_USER:'admin',TORTELAPLUS_CENTRAL_PASSWORD:'TestOnly123'});
 const clock=path.join(dir,'clock.cjs');fs.writeFileSync(clock,"const NativeDate=Date;global.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2027-02-01T12:00:00-03:00']))}static now(){return new NativeDate('2027-02-01T12:00:00-03:00').getTime()}};");
 let child;const base='http://127.0.0.1:'+port,tenant=path.join(dir,'tenants/cliente-exemplo.json');
 async function start(){child=spawn(process.execPath,['--require',clock,'server.js'],{cwd:root,env,stdio:'ignore'});for(let n=0;n<100;n++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Servidor isolado indisponivel');}
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const p=new Promise(r=>child.once('exit',r));child.kill();await p;}}
 async function api(route,body,session,expected=200){const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)}),j=await r.json();assert.equal(r.status,expected,route+': '+j.error);return j;}
 try{
 await start();await stop();const originalTenant=JSON.parse(fs.readFileSync(tenant)),state=structuredClone(baseState);state.users=originalTenant.users;Object.assign(state.settings,{regime:'Simples Nacional',crt:'1',tenantCode:'cliente-exemplo',acbrApiUrl:'http://127.0.0.1:'+mock.address().port,acbrApiTokenConfigured:true});state.fiscalQueue=[];
 const notes=['NF-e','NFC-e','NF-e','NF-e','NF-e'].map((model,i)=>{const doc={...row(model),id:i+1,status:'Autorizada',protocol:'123456789012345'};doc.xml=generateNfeXml(state,doc,{csc:'FicticioApenasTeste'});doc.key=doc.xml.match(/Id="NFe(\d{44})"/)[1];return doc;});state.fiscalQueue=notes;fs.writeFileSync(tenant,JSON.stringify(state));
 const providerFile=path.join(dir,'provider-state.json'),provider=JSON.parse(fs.readFileSync(providerFile));for(const c of provider.clients)c.licenseExpiresAt='2099-12-31';provider.clients.push({...structuredClone(provider.clients[0]),id:999,tenantCode:'outro-cliente',tradeName:'Outra empresa ficticia',activeSessions:[]});const other=structuredClone(state);other.settings.tenantCode='outro-cliente';fs.writeFileSync(path.join(dir,'tenants/outro-cliente.json'),JSON.stringify(other));fs.writeFileSync(providerFile,JSON.stringify(provider));
 const vaultDir=path.join(dir,'storage/cliente-exemplo/secrets');fs.mkdirSync(vaultDir,{recursive:true});const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',crypto.createHash('sha256').update(env.TORTELAPLUS_SECRET_KEY).digest(),iv),encrypted=Buffer.concat([cipher.update(JSON.stringify({acbrApiToken:'MockOnly'})),cipher.final()]);fs.writeFileSync(path.join(vaultDir,'fiscal-vault.json'),JSON.stringify({iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:encrypted.toString('base64')}));
 await start();const login=await api('/api/auth/login',{tenantCode:'cliente-exemplo',user:'Operador',password:'123456'}),session=login.sessionId;
 const admin=(await api('/api/provider/auth/login',{username:'admin',password:'TestOnly123'})).sessionId;
 async function list(token,expected=200){const res=await fetch(base+'/api/tenant/cliente-exemplo/fiscal/documents',{headers:token?{Authorization:'Bearer '+token}:{}});const data=await res.json();assert.equal(res.status,expected,JSON.stringify(data));return data;}
 const before=hash(tenant),business=JSON.parse(fs.readFileSync(tenant));await list(undefined,401);const docs=await list(admin);assert.equal(docs.documents.length,5);assert.equal(docs.canCancel,true);assert.equal(docs.documents[0].xml,undefined);await list(session);assert.equal(hash(tenant),before);
 await api('/api/provider/admins',{username:'consulta',password:'MockOnly123',permissions:['fiscal']},admin,201);
 const reader=(await api('/api/provider/auth/login',{username:'consulta',password:'MockOnly123'})).sessionId;
 assert.equal((await list(reader)).canCancel,false);await api('/api/tenant/cliente-exemplo/fiscal/cancel',{id:1,reason:'Justificativa sintetica para teste'},reader,403);
 await api('/api/provider/admins',{username:'vendas',password:'MockOnly123',permissions:['sales']},admin,201);
 const sales=(await api('/api/provider/auth/login',{username:'vendas',password:'MockOnly123'})).sessionId;await list(sales,403);assert.equal(hash(tenant),before);
 const cancel='/api/tenant/cliente-exemplo/fiscal/cancel',reason='Cancelamento sintetico para teste isolado';
 await api('/api/tenant/outro-cliente/fiscal/cancel',{id:1,reason},session,401);
 await api(cancel,{id:1,reason:'curta'},admin,400);await api(cancel,{id:1,reason:'x'.repeat(256)},session,400);assert.equal(calls,0);
 const first=await api(cancel,{id:1,reason},admin);assert.equal(first.document.status,'Cancelada');assert.equal(first.document.cancelProtocol,'123456789012345');assert.equal(received.steps[0].method,'cancelar');assert.equal(received.steps[0].args[0],notes[0].key);assert.equal(calls,1);
 const repeat=await api(cancel,{id:1,reason},admin);assert.equal(repeat.alreadyCancelled,true);assert.equal(calls,1);
 status='155';const second=await api(cancel,{id:2,reason},session);assert.equal(second.document.status,'Cancelada');assert.equal(calls,2);
 status='136';await api(cancel,{id:3,reason},admin,409);let after=JSON.parse(fs.readFileSync(tenant));assert.equal(after.fiscalQueue[2].status,'Autorizada');assert.equal(after.fiscalQueue[2].cancelProtocol,'');assert.equal(after.fiscalQueue[2].cancelAttempts.length,1);
 status='573';await api(cancel,{id:3,reason},session,409);after=JSON.parse(fs.readFileSync(tenant));assert.equal(after.fiscalQueue[2].status,'Autorizada');assert.equal(after.fiscalQueue[2].cancelAttempts.length,2);
 for(const field of ['products','sales','cash','stockMovements','receivables','settings'])assert.deepEqual(after[field],business[field]);
 await stop();after.fiscalQueue[3].key='0'.repeat(44);after.fiscalQueue[4].xml=after.fiscalQueue[4].xml.replace('<tpAmb>2</tpAmb>','<tpAmb>1</tpAmb>');fs.writeFileSync(tenant,JSON.stringify(after));await start();const last=(await api('/api/provider/auth/login',{username:'admin',password:'TestOnly123'})).sessionId;
 const count=calls;await api(cancel,{id:4,reason},last,409);await api(cancel,{id:5,reason},last,409);assert.equal(calls,count);
 const {centralPermissions,centralRouteAllowed}=require('../src/server/central-permissions');
 assert.equal(centralRouteAllowed({permissions:['fiscal']},cancel),false);assert.equal(centralRouteAllowed({permissions:['fiscal']},'/api/tenant/cliente-exemplo/fiscal/documents'),true);assert.equal(centralRouteAllowed({permissions:['sales']},'/api/tenant/cliente-exemplo/fiscal/documents'),false);assert(centralPermissions.includes('fiscal_cancel'));
 console.log('OK cancelamento HTTP isolado: ambas as centrais, NF-e 135, NFC-e 155, rejeicoes 136/573, justificativa, idempotencia, ambiente, chave, permissoes, isolamento e dados comerciais preservados.');
 }finally{await stop();await new Promise(r=>mock.close(r));}
})().catch(e=>{console.error(e.stack);process.exitCode=1});


