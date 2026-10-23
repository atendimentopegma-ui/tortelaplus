// No production credentials or database: isolated HTTP server and synthetic tenant files.
const fs=require('fs'),os=require('os'),path=require('path'),net=require('net'),crypto=require('crypto'),assert=require('assert/strict'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),profiles=require('../src/company-profile');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tortela-company-api-'));require('./fixtures/seed-operational-state')(dir);
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,()=>{const value=s.address().port;s.close(()=>resolve(value));});});
 const env={...process.env};for(const key of Object.keys(env))if(key==='DATABASE_URL'||key.startsWith('PEGMA_')||key.startsWith('TORTELAPLUS_'))delete env[key];
 Object.assign(env,{PORT:String(port),DATABASE_URL:'',TORTELAPLUS_DB_DIR:dir,TORTELAPLUS_CENTRAL_USER:'admin',TORTELAPLUS_CENTRAL_PASSWORD:'OnlyTest123',TORTELAPLUS_SECRET_KEY:'SyntheticFiscalVaultKeyOnlyForTests12345'});
 const base='http://127.0.0.1:'+port,tenantFile=path.join(dir,'tenants/cliente-exemplo.json'),otherFile=path.join(dir,'tenants/outra-unidade.json'),providerFile=path.join(dir,'provider-state.json');let child;
 async function start(){child=spawn(process.execPath,['server.js'],{cwd:root,env,stdio:'ignore'});for(let n=0;n<100;n++){try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(2000)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Servidor isolado indisponivel');}
 async function stop(){if(child?.exitCode===null&&!child.signalCode){const done=new Promise(r=>child.once('exit',r));child.kill();await done;}}
 async function api(route,token,body,expected=200){const response=await fetch(base+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)}),data=await response.json();assert.equal(response.status,expected,route+': '+JSON.stringify(data));return data;}
 const read=file=>JSON.parse(fs.readFileSync(file)),hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const centralRoute='/api/provider/company-profile',unitRoute='/api/tenant/cliente-exemplo/company-profile';
 try{
  await start();await stop();const first=read(tenantFile),other=structuredClone(first);other.settings.company='Outra empresa isolada';other.settings.tenantCode='outra-unidade';fs.writeFileSync(otherFile,JSON.stringify(other));
  first.settings.legalName='Empresa Legal Anterior';first.settings.company='Fantasia Anterior';first.users.push({...structuredClone(first.users[0]),id:99,name:'Vendas',username:'vendas',role:'Caixa',permissions:['sales']});fs.writeFileSync(tenantFile,JSON.stringify(first));
  const provider=read(providerFile);for(const client of provider.clients){client.maxTerminals=20;client.licenseExpiresAt='2099-12-31';}provider.clients.push({...structuredClone(provider.clients[0]),id:999,tenantCode:'outra-unidade',tradeName:'Outra empresa isolada',activeSessions:[]});fs.writeFileSync(providerFile,JSON.stringify(provider));
  await start();let admin=(await api('/api/provider/auth/login',null,{username:'admin',password:'OnlyTest123'})).sessionId;
  const unit=(await api('/api/auth/login',null,{tenantCode:'cliente-exemplo',user:'Operador',password:'123456'})).sessionId;
  const statePayload=await api('/api/state?tenantCode=cliente-exemplo',admin),normalized=statePayload.state||statePayload;
  first.users=first.users.map(user=>({...user,permissions:normalized.users.find(row=>row.id===user.id).permissions,screenPermissions:{}}));
  const firstHash=hash(tenantFile),otherHash=hash(otherFile),blank=await api(centralRoute,admin);assert.equal(blank.profile.company,'');assert.equal(blank.scope,'central');assert.equal(hash(tenantFile),firstHash);
  await api(centralRoute,null,null,401);await api(centralRoute,unit,null,401);await api('/api/tenant/outra-unidade/company-profile',unit,null,401);
  const central=await api(centralRoute,admin,{revision:blank.revision,profile:{company:'Franqueadora Ficticia Ltda',tradeName:'Rede Teste',document:'11.222.333/0001-81',email:'rede@example.test',regime:'Lucro Real',crt:'3',cep:'01001-000',uf:'SP',cityCode:'3550308'}});
  assert.equal(central.profile.document,'11222333000181');assert.equal(hash(tenantFile),firstHash);assert.equal(hash(otherFile),otherHash);
  const original=await api(unitRoute,unit);assert.equal(original.profile.company,first.settings.legalName);assert.equal(original.profile.tradeName,first.settings.company);assert.equal(original.profile.certificatePassword,undefined);assert.equal(original.profile.tenantCode,undefined);
  const saved=await api(unitRoute,unit,{revision:original.revision,profile:{company:'Loja Ficticia Ltda',tradeName:'Loja Piloto Teste',email:'loja@example.test',complement:'Sala 2'}});
  assert.equal(saved.scope,'unit');assert.equal(saved.profile.document,original.profile.document);assert.equal((await api(centralRoute,admin)).profile.company,'Franqueadora Ficticia Ltda');assert.equal(hash(otherFile),otherHash);
  const after=read(tenantFile);for(const field of ['products','sales','cash','stockMovements','fiscalQueue','users'])assert.deepEqual(after[field],first[field]);assert.equal(after.settings.legalName,'Loja Ficticia Ltda');assert.equal(after.settings.company,'Loja Piloto Teste');assert.equal(after.settings.fiscalEnvironment,first.settings.fiscalEnvironment);assert.equal(after.settings.email,'loja@example.test');assert.equal(read(providerFile).clients.find(c=>c.tenantCode==='cliente-exemplo').tradeName,'Loja Piloto Teste');
  const validHash=hash(tenantFile);await api(unitRoute,unit,{revision:original.revision,profile:{company:'Desatualizada'}},409);await api(unitRoute,unit,{revision:saved.revision,profile:{company:'Loja',cep:'1'}},422);await api(unitRoute,unit,{revision:saved.revision,profile:{company:'Loja',password:'Segredo'}},422);assert.equal(hash(tenantFile),validHash);
  const publicProvider=(await api('/api/provider',admin)).provider;assert.equal(publicProvider.companyProfile,undefined);await api('/api/provider',admin,{provider:publicProvider});assert.equal((await api(centralRoute,admin)).profile.company,'Franqueadora Ficticia Ltda');
  for(const [username,permissions]of [['centralconfig',['deployment']],['unidades',['franchisees']],['vendascentral',['sales']]])await api('/api/provider/admins',admin,{username,password:'OnlyTest123',permissions},201);
  const cfg=(await api('/api/provider/auth/login',null,{username:'centralconfig',password:'OnlyTest123'})).sessionId;await api(centralRoute,cfg);await api(unitRoute,cfg,null,403);
  const units=(await api('/api/provider/auth/login',null,{username:'unidades',password:'OnlyTest123'})).sessionId;await api(unitRoute,units);await api(centralRoute,units,null,403);
  const sales=(await api('/api/provider/auth/login',null,{username:'vendascentral',password:'OnlyTest123'})).sessionId;await api(unitRoute,sales,null,403);await api(centralRoute,sales,null,403);
  const cashier=(await api('/api/auth/login',null,{tenantCode:'cliente-exemplo',user:'vendas',password:'123456'})).sessionId;await api(unitRoute,cashier,null,403);
  const fiscalPath='/api/tenant/cliente-exemplo/fiscal/settings';
  const beforeFiscal=read(tenantFile),otherBeforeFiscal=hash(otherFile),fiscalConfig=await api(fiscalPath,admin);
  assert(!fiscalConfig.missing.some(value=>value.includes('NFS-e')||value.includes('municipal')));
  await api(fiscalPath,null,null,401);await api(fiscalPath,units,null,403);await api(fiscalPath,cashier,null,403);
  const fiscalSaved=await api(fiscalPath,admin,{revision:fiscalConfig.revision,config:{...fiscalConfig.config,fiscalEnvironment:'Homologacao',certificateName:'C:/Fiscal/test-only.pfx',certificateExpiresAt:'2099-12-31',cscId:'000001',nfeSerie:3,nfceSerie:4,sefazUf:'SP'},secrets:{certificatePassword:'FakeCertificateOnly',csc:'SyntheticCscOnly',acbrApiToken:'FakeAgentOnly'}});
  assert.equal(fiscalSaved.config.nfeSerie,3);assert.equal(fiscalSaved.config.nfceSerie,4);assert.equal(fiscalSaved.configured.csc,true);assert(!JSON.stringify(fiscalSaved).includes('SyntheticCscOnly'));assert(!JSON.stringify(fiscalSaved).includes('FakeCertificateOnly'));assert.equal(hash(otherFile),otherBeforeFiscal);
  const afterFiscal=read(tenantFile);for(const key of ['sales','products','users','fiscalQueue','cash','stockMovements'])assert.deepEqual(afterFiscal[key],beforeFiscal[key]);
  await api(fiscalPath,admin,{revision:fiscalConfig.revision,config:fiscalConfig.config},409);
  await api(fiscalPath,admin,{revision:fiscalSaved.revision,config:{...fiscalSaved.config,document:'99999999999999'}},422);
  await api(fiscalPath,admin,{revision:fiscalSaved.revision,config:{...fiscalSaved.config,acbrApiUrl:'http://remote.test'}},422);
  const connection=await api(fiscalPath+'/connection',admin,{});assert.equal(connection.connected,false);assert.deepEqual(read(tenantFile).fiscalQueue,beforeFiscal.fiscalQueue);
  const retained=await api(fiscalPath,admin,{revision:fiscalSaved.revision,config:fiscalSaved.config,secrets:{certificatePassword:'',csc:'',acbrApiToken:''}});assert(retained.configured.csc);assert.equal(hash(otherFile),otherBeforeFiscal);
  assert(!fs.readFileSync(path.join(dir,'storage/cliente-exemplo/secrets/fiscal-vault.json'),'utf8').includes('SyntheticCscOnly'));
  const filePayload={fileName:'synthetic-only.pfx',content:Buffer.from([0x30,7,2,1,3,0x30,2,5,0]).toString('base64')};
  const beforeUpload=await api(fiscalPath,admin),existingOther=hash(otherFile);
  const withFile=await api(fiscalPath,admin,{revision:beforeUpload.revision,config:beforeUpload.config,certificateFile:filePayload});assert.match(withFile.config.certificateName,/^vault-a1:[a-f0-9]{64}$/);assert.equal(withFile.certificateFile,'synthetic-only.pfx');assert(!JSON.stringify(withFile).includes(filePayload.content));assert.equal(hash(otherFile),existingOther);
  const vault=JSON.parse(fs.readFileSync(path.join(dir,'storage/cliente-exemplo/secrets/fiscal-vault.json'),'utf8'));const decipher=crypto.createDecipheriv('aes-256-gcm',crypto.createHash('sha256').update(env.TORTELAPLUS_SECRET_KEY).digest(),Buffer.from(vault.iv,'base64'));decipher.setAuthTag(Buffer.from(vault.tag,'base64'));const unsealed=JSON.parse(Buffer.concat([decipher.update(Buffer.from(vault.data,'base64')),decipher.final()]));assert.equal(unsealed.certificateA1.content,filePayload.content);assert.equal(unsealed.csc,'SyntheticCscOnly');
  const uploadHash=hash(tenantFile);await api(fiscalPath,admin,{revision:withFile.revision,config:withFile.config,certificateFile:{fileName:'bad.txt',content:filePayload.content}},422);assert.equal(hash(tenantFile),uploadHash);
  await api(fiscalPath,units,{revision:withFile.revision,config:withFile.config,certificateFile:filePayload},403);assert.equal(hash(tenantFile),uploadHash);
  const certHelper=require('../src/server/a1-certificate'),agentDir=path.join(dir,'isolated-agent','tenant-a'),certPath=certHelper.installCertificate(agentDir,unsealed.certificateA1);assert(fs.readFileSync(certPath).equals(Buffer.from(filePayload.content,'base64')));assert(certPath.startsWith(agentDir));assert.throws(()=>certHelper.validateCertificate({...filePayload,fileName:'../other.pfx'}));assert.throws(()=>certHelper.validateCertificate({...filePayload,content:'bm90LWNlcnRpZmljYXRl'}));assert(!fs.existsSync(path.join(dir,'isolated-agent','tenant-b')));

  await stop();env.TORTELAPLUS_SECRET_KEY='';await start();admin=(await api('/api/provider/auth/login',null,{username:'admin',password:'OnlyTest123'})).sessionId;
  const noKey=await api(fiscalPath,admin),beforeNoKey=hash(tenantFile);
  await api(fiscalPath,admin,{revision:noKey.revision,config:{...noKey.config,nfeSerie:9},secrets:{csc:'MustNotSave'}},503);assert.equal(hash(tenantFile),beforeNoKey);
  await stop();env.TORTELAPLUS_SECRET_KEY='SyntheticFiscalVaultKeyOnlyForTests12345';await start();admin=(await api('/api/provider/auth/login',null,{username:'admin',password:'OnlyTest123'})).sessionId;
  const beforeCreate=hash(tenantFile);
  await api('/api/tenants',admin,{tenantCode:'nova-invalida',tradeName:'Nova',adminUser:'gestor',adminPassword:'OnlyTest123',companyProfile:{company:'Empresa',cep:'1'}},422);
  assert(!read(providerFile).clients.some(c=>c.tenantCode==='nova-invalida'));
  await api('/api/tenants',admin,{tenantCode:'nova-consulta',tradeName:'Fantasia Nova',document:'11222333000181',adminUser:'gestor',adminPassword:'OnlyTest123',companyProfile:{company:'Razao Nova Ltda',cnae:'5611201',cep:'01001000',address:'Praca da Se',number:'10',city:'Sao Paulo',cityCode:'3550308',uf:'SP',email:'nova@example.test'}},201);
  const created=await api('/api/tenant/nova-consulta/company-profile',admin);assert.equal(created.profile.company,'Razao Nova Ltda');assert.equal(created.profile.tradeName,'Fantasia Nova');assert.equal(created.profile.cityCode,'3550308');assert.equal(created.profile.document,'11222333000181');assert.equal(hash(tenantFile),beforeCreate);
  const loginCreated=await api('/api/auth/login',null,{tenantCode:'nova-consulta',user:'gestor',password:'OnlyTest123'});assert(loginCreated.sessionId);
  await stop();await start();admin=(await api('/api/provider/auth/login',null,{username:'admin',password:'OnlyTest123'})).sessionId;assert.equal((await api(centralRoute,admin)).profile.company,'Franqueadora Ficticia Ltda');assert.equal((await api(unitRoute,admin)).profile.company,'Loja Ficticia Ltda');assert.equal(hash(otherFile),otherHash);assert((await api(fiscalPath,admin)).configured.csc);
  assert.throws(()=>profiles.validate({company:'Empresa',regime:'MEI',crt:'3'}),/CRT incompat/);assert.throws(()=>profiles.validate({company:'Empresa',website:'javascript:alert(1)'}),/https/);
  console.log('OK empresas HTTP: central independente, unidade propria, isolamento entre lojas, permissoes, validacao, conflitos, auditoria e persistencia apos reinicio; dados comerciais preservados.');
 }finally{await stop();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
