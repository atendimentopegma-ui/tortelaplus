const fs=require('fs'),os=require('os'),path=require('path'),net=require('net'),crypto=require('crypto'),assert=require('assert/strict');
const {spawn}=require('child_process');
const {regimes,profile}=require('../src/fiscal-regimes');
const {baseState,row}=require('./fiscal-test-fixture');
const root=path.resolve(__dirname,'..');
(async()=>{
  // Only synthetic files in a newly created OS temporary directory; no production DB.
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'tortela-regimes-api-'));
  require('./fixtures/seed-operational-state')(directory);
  const env={...process.env};
  for(const key of Object.keys(env))if(key==='DATABASE_URL'||key.startsWith('PEGMA_')||key.startsWith('TORTELAPLUS_'))delete env[key];
  const port=await new Promise(resolve=>{const server=net.createServer();server.listen(0,()=>{const value=server.address().port;server.close(()=>resolve(value));});});
  Object.assign(env,{PORT:String(port),DATABASE_URL:'',TORTELAPLUS_DB_DIR:directory,TORTELAPLUS_CENTRAL_USER:'admin',TORTELAPLUS_CENTRAL_PASSWORD:'TestOnly123'});
  const base=`http://localhost:${port}`;let child;
  async function start(){child=spawn(process.execPath,['server.js'],{cwd:root,env,stdio:['ignore','pipe','pipe']});for(let n=0;n<100;n++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}throw Error('Servidor de teste indisponivel');}
  async function stop(){if(child?.exitCode===null){const ended=new Promise(resolve=>child.once('exit',resolve));child.kill();await ended;}}
  async function call(route,body,session,expected=200){const response=await fetch(base+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});const data=await response.json();assert.equal(response.status,expected,`${route}: ${data.error||''}`);return data;}
  const tenantFile=code=>path.join(directory,'tenants',code+'.json');
  const hash=code=>crypto.createHash('sha256').update(fs.readFileSync(tenantFile(code))).digest('hex');
  try{
    await start();await stop();
    const providerFile=path.join(directory,'provider-state.json'),provider=JSON.parse(fs.readFileSync(providerFile));
    const user=JSON.parse(fs.readFileSync(tenantFile('cliente-exemplo'))).users;
    const template=provider.clients[0];
    provider.clients=regimes.map((regime,index)=>{
      const code='regime-'+index,state=structuredClone(baseState);
      Object.assign(state.settings,{company:'Empresa ficticia '+index,tenantCode:code,regime:regime.name,crt:regime.crt});
      state.users=structuredClone(user);state.sales=[];state.fiscalQueue=[];state.auditLogs=[];
      state.products[0].cst=profile(state.settings).icmsSimple?'102':'00';
      for(const rule of state.fiscalRules)Object.assign(rule,{crt:regime.crt,regime:regime.name,cst:state.products[0].cst});
      fs.writeFileSync(tenantFile(code),JSON.stringify(state));
      return {...structuredClone(template),id:index+1,tradeName:state.settings.company,tenantCode:code,activeSessions:[],maxTerminals:2,licenseExpiresAt:'2099-12-31'};
    });
    fs.writeFileSync(providerFile,JSON.stringify(provider));await start();
    const page=await fetch(base+'/').then(response=>response.text());
    assert(page.includes('src/fiscal-regimes.js'));
    assert(page.indexOf('src/fiscal-regimes.js')<page.indexOf('src/app.js'),'Modulo de regimes deve carregar antes do app');
    const moduleResponse=await fetch(base+'/src/fiscal-regimes.js');
    assert.equal(moduleResponse.status,200,'Modulo de regimes precisa estar disponivel ao navegador');
    assert((await moduleResponse.text()).includes('Lucro Arbitrado'));
    const sessions=[];
    for(const [index,regime] of regimes.entries()){
      const code='regime-'+index,login=await call('/api/auth/login',{tenantCode:code,user:'Operador',password:'123456'});
      sessions.push(login.sessionId);
      const before=hash(code),document={...row('NF-e'),includeIbsCbs:false};
      const result=await call(`/api/tenant/${code}/fiscal/preview`,{document},login.sessionId);
      assert(result.xml.includes(`<CRT>${regime.crt}</CRT>`));
      assert(result.xml.includes(`<xNome>Empresa ficticia ${index}</xNome>`));
      await call(`/api/tenant/${code}/fiscal/preview`,{document:{...document,total:999}},login.sessionId,422);
      if(regime.crt==='3'){
        const ipiDocument=structuredClone(document);
        ipiDocument.items[0].ipi={enabled:true,cst:'50',enquadramento:'999',method:'percent',rate:10,priceMode:'included'};
        const ipi=await call(`/api/tenant/${code}/fiscal/preview`,{document:ipiDocument},login.sessionId);
        assert.equal(ipi.taxSummary.ipi,9.09);assert.equal(ipi.taxSummary.total,100);
        ipiDocument.items[0].ipi.enquadramento='';
        await call(`/api/tenant/${code}/fiscal/preview`,{document:ipiDocument},login.sessionId,422);
        const creditDocument=structuredClone(document);creditDocument.date='2027-01-01';
        Object.assign(creditDocument.items[0],{ibsUfRate:.05,ibsCityRate:.05,cbsFederalRate:8.8,cbsRateYear:2027,rtcCredit:{enabled:true,code:'04',usedGoods:true,legalBasis:'Fictício para teste',basePerUnit:1,ibsEnabled:true,cbsEnabled:true,ibsRate:1,cbsRate:2}});
        const credit=await call(`/api/tenant/${code}/fiscal/preview`,{document:creditDocument},login.sessionId);
        assert.equal(credit.taxSummary.ibsCredit,0.02);assert.equal(credit.taxSummary.cbsCredit,0.04);
      }
      assert.equal(hash(code),before,'Preview nao pode alterar dados nem configuracoes do cliente');
    }
    await call('/api/tenant/regime-1/fiscal/preview',{document:row('NF-e')},sessions[0],401);
    await call('/api/tenant/regime-0/fiscal/preview',{document:row('NF-e')},undefined,401);
    console.log('OK - API HTTP com seis empresas isoladas: CRT correto, XML valido, erro 422, acesso cruzado negado e arquivos dos clientes inalterados.');
  }finally{await stop();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
