const assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http'),net=require('net'),{spawn}=require('child_process');
const area=require('../src/server/delivery-area');
async function port(){return new Promise(r=>{const s=net.createServer();s.listen(0,()=>{const p=s.address().port;s.close(()=>r(p));});});}
(async()=>{
 const origin={latitude:-23,longitude:-46},at=km=>({latitude:-23+km/6371.0088*180/Math.PI,longitude:-46});
 assert.equal(area.decision({distanceKm:0,tradeName:'A'},{cep:'10000001'}).available,true);
 for(const km of [0,14.99,15])assert.equal(area.decision({distanceKm:area.distanceKm(origin,at(km)),tradeName:'A'},{cep:'10000001'}).available,true);
 assert.equal(area.decision({distanceKm:15.00001},{cep:'10000001'}).available,false);assert.equal(area.distanceKm(origin,{}),null);assert.equal(area.coordinates({latitude:'',longitude:''}),null);
 assert.equal(area.chooseNearest([{tenantCode:'a',distanceKm:2,products:1},{tenantCode:'b',distanceKm:1,products:1}]).tenantCode,'b');
 const addresses={'10000001':{road:'Rua Loja A',lat:-23,lon:-46},'10000002':{road:'Rua Loja B',lat:-23,lon:-46.3},'10000003':{road:'Rua Cliente A',lat:-23.001,lon:-46},'10000004':{road:'Rua Cliente B',lat:-23,lon:-46.299},'10000005':{road:'Rua Distante',lat:-24,lon:-46},'10000006':{road:'Rua Sem Local',lat:null,lon:null}};
 const mock=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');const u=new URL(req.url,'http://localhost');if(u.pathname.startsWith('/cep/')){const cep=u.pathname.split('/')[2],d=addresses[cep];return res.end(JSON.stringify(d?{cep,logradouro:d.road,localidade:'Testopolis',uf:'SP'}:{erro:true}));}const q=u.searchParams.get('q')||'',entry=Object.entries(addresses).find(([,v])=>q.includes(v.road)),d=entry?.[1];res.end(JSON.stringify({features:d&&d.lat!==null?[{geometry:{coordinates:[d.lon,d.lat]},properties:{countrycode:'BR',city:'Testopolis',name:d.road,street:d.road,type:'street',postcode:entry[0]}}]:[]}));});await new Promise(r=>mock.listen(0,'127.0.0.1',r));const geoBase='http://127.0.0.1:'+mock.address().port;
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'tortela-delivery-')),apiPort=await port(),base='http://127.0.0.1:'+apiPort,env={...process.env};for(const k of Object.keys(env))if(k==='DATABASE_URL'||k.startsWith('TORTELAPLUS_')||k.startsWith('PEGMA_'))delete env[k];Object.assign(env,{PORT:String(apiPort),DATABASE_URL:'',TORTELAPLUS_DB_DIR:dataDir,TORTELAPLUS_PROVIDER_TOKEN:'test-delivery-provider',TORTELAPLUS_CEP_LOOKUP_URL:geoBase+'/cep/',TORTELAPLUS_GEOCODER_URL:geoBase+'/geo'});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env,stdio:['ignore','pipe','pipe']});let logs='';child.stderr.on('data',d=>logs+=d);child.stdout.on('data',d=>logs+=d);
 const request=async(route,body,expected=200,auth=false)=>{const r=await fetch(base+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{'X-Provider-Token':env.TORTELAPLUS_PROVIDER_TOKEN}:{})},body:body?JSON.stringify(body):undefined}),d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;};
 try{
  for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));if(i===99)throw Error(logs);}
  const providerFile=path.join(dataDir,'provider-state.json'),provider=JSON.parse(fs.readFileSync(providerFile,'utf8')),first=provider.clients[0],a=structuredClone(first),b=structuredClone(first);Object.assign(a,{tenantCode:'loja-a',tradeName:'Loja A',status:'Ativo',deliveryRadiusKm:100});Object.assign(b,{tenantCode:'loja-b',tradeName:'Loja B',status:'Ativo'});provider.clients=[a,b];fs.writeFileSync(providerFile,JSON.stringify(provider));
  const original=JSON.parse(fs.readFileSync(path.join(dataDir,'tenants','cliente-exemplo.json'),'utf8'));
  for(const [code,cep] of [['loja-a','10000001'],['loja-b','10000002']]){const state=structuredClone(original);state.settings={...state.settings,tenantCode:code,cep,address:addresses[cep].road,number:'1',city:'Testopolis',uf:'SP',deliveryRadiusKm:100};state.sales=[];state.stockMovements=[];state.products=[{id:1,description:'TORTELA TESTE',price:20,stock:20,unit:'UN',active:true}];fs.writeFileSync(path.join(dataDir,'tenants',code+'.json'),JSON.stringify(state));}
  const catalog=await request('/api/public/store/catalog?cep=10000004&unidade=loja-a');assert.equal(catalog.nearest.tenantCode,'loja-b');assert.equal(catalog.deliveryAvailable,true);assert.equal(catalog.deliveryRadiusKm,15);
  const outside=await request('/api/public/store/catalog?cep=10000005');assert.equal(outside.deliveryAvailable,false);assert.equal(outside.deliveryMessage,area.OUTSIDE_MESSAGE);
  assert.equal((await request('/api/public/store/catalog?cep=10000006')).deliveryAvailable,false);
  const customer={name:'Cliente teste',phone:'11999999999',document:'52998224725',birthDate:'1990-01-01',cep:'10000004',address:addresses['10000004'].road,number:'5',district:'Centro',city:'Testopolis',uf:'SP',consent:true};
  const lookup=await request('/api/public/store/customer-lookup',{document:customer.document});assert.equal(lookup.exists,false);
  const registration=await request('/api/public/store/registration',customer,201);
  assert.equal((await request('/api/public/store/customer-lookup',{document:customer.document})).verificationRequired,true);
  await request('/api/public/store/customer-lookup',{document:customer.document,phone:'11888888888'},400);
  const recognized=await request('/api/public/store/customer-lookup',{document:customer.document,phone:customer.phone});assert.equal(recognized.customer.name,customer.name);
  await request('/api/public/store/journey',{id:registration.id,token:'wrong',action:'coverage'},403);
  const coverage=await request('/api/public/store/journey',{id:registration.id,token:registration.token,action:'coverage'});assert.equal(coverage.available,true);assert.equal(coverage.tenantCode,'loja-b');
  const body={tenantCode:'loja-b',journeyId:registration.id,journeyToken:registration.token,cep:customer.cep,paymentMethod:'PIX',deliveryMode:'Entrega',customer,items:[{productId:1,qty:2}]};
  await request('/api/public/store/orders',{...body,cep:'10000005'},403);await request('/api/public/store/orders',{...body,cep:''},422);await request('/api/public/store/orders',{...body,tenantCode:'loja-a'},409);await request('/api/public/store/orders',{...body,customer:{...body.customer,address:'Rua Distante'}},403);
  await request('/api/network/store-leads',null,401);const leads=await request('/api/network/store-leads',null,200,true);assert(leads.leads.some(l=>l.id===registration.id));assert(!JSON.stringify(leads).includes('accessHash'));
  const distant=await request('/api/public/store/registration',{...customer,cep:'10000005',address:'Rua Distante'},201);
  assert.equal((await request('/api/public/store/journey',{id:distant.id,token:distant.token,action:'coverage'})).available,false);
  const abandoned=await request('/api/public/store/registration',customer,201);await request('/api/public/store/journey',{id:abandoned.id,token:abandoned.token,action:'coverage'});await request('/api/public/store/journey',{id:abandoned.id,token:abandoned.token,action:'abandon'});
  const unitLeads=await request('/api/tenant/loja-b/store-leads',null,200,true);assert(unitLeads.leads.find(l=>l.id===abandoned.id).status.includes('compra não concluída'));assert(unitLeads.leads.every(l=>l.tenantCode==='loja-b'));
  const read=code=>JSON.parse(fs.readFileSync(path.join(dataDir,'tenants',code+'.json'),'utf8'));
  assert(!read('loja-a').people.some(p=>p.document===customer.document));
  const priorCustomer=read('loja-b').people.find(p=>p.document===customer.document);const repeated=await request('/api/public/store/registration',{...customer,name:'Nome apenas desta tentativa'},201);await request('/api/public/store/journey',{id:repeated.id,token:repeated.token,action:'coverage'});assert.deepEqual(read('loja-b').people.find(p=>p.document===customer.document),priorCustomer);
  assert.equal(read('loja-a').sales.length,0);assert.equal(read('loja-b').sales.length,0);
  const order=await request('/api/public/store/orders',body,201);assert.equal(order.tenantCode,'loja-b');assert.equal(order.total,40);assert.equal(read('loja-b').products[0].stock,18);assert.equal(read('loja-a').products[0].stock,20);assert.equal(read('loja-a').sales.length,0);assert.equal(read('loja-b').sales.length,1);assert(read('loja-b').stockMovements.some(row=>row.history==='Pedido online '+order.orderId));
  const duplicate=await request('/api/public/store/orders',body);assert.equal(duplicate.orderId,order.orderId);assert.equal(read('loja-b').sales.length,1);assert.equal(read('loja-b').products[0].stock,18);
  await request('/api/public/store/journey',{id:registration.id,token:registration.token,action:'coverage'},409);
  assert.equal((await request('/api/network/store-leads',null,200,true)).leads.find(l=>l.id===registration.id).status,'Pedido enviado');
  assert.equal((await request('/api/tenant/loja-b/online-order-notifications',null,200,true)).orders.length,1);assert.equal((await request('/api/tenant/loja-a/online-order-notifications',null,200,true)).orders.length,0);await request('/api/tenant/loja-b/online-order-notifications',null,401);
  if(process.argv.includes('--preview')){console.log('PREVIEW '+base+' STOP '+path.join(dataDir,'preview-stop')); await new Promise(resolve=>{const timer=setInterval(()=>{if(fs.existsSync(path.join(dataDir,'preview-stop'))){clearInterval(timer);resolve();}},1000);});}
  console.log('OK raio 15km: zero/limite/exterior, geocodificacao indisponivel bloqueada, loja mais proxima obrigatoria mesmo com unidade forjada, estoque/financeiro/pedido/aviso isolados por loja. Somente dados temporarios.');
 }finally{child.kill();await new Promise(r=>child.once('exit',r));await new Promise(r=>mock.close(r));}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
