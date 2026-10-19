const fs=require("fs"),os=require("os"),path=require("path"),net=require("net"),{spawn}=require("child_process");
const {centralPermissions}=require("../src/server/central-permissions");
const assert=(ok,message)=>{if(!ok)throw Error(message)};
(async()=>{
  const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,()=>{const p=s.address().port;s.close(()=>resolve(p))})});
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"tortela-access-test-"));const env={...process.env};
  for(const key of Object.keys(env))if(key==="DATABASE_URL"||key.startsWith("TORTELAPLUS_")||key.startsWith("PEGMA_"))delete env[key];
  Object.assign(env,{PORT:String(port),DATABASE_URL:"",TORTELAPLUS_DB_DIR:dir,TORTELAPLUS_CENTRAL_USER:"admin",TORTELAPLUS_CENTRAL_PASSWORD:"BootstrapTeste123"});
  const base=`http://localhost:${port}`;let child;
  async function start(){child=spawn(process.execPath,["server.js"],{cwd:path.resolve(__dirname,".."),env,stdio:["ignore","pipe","pipe"]});for(let i=0;i<80;i++){try{if((await fetch(base+"/api/health")).ok)return}catch{};await new Promise(r=>setTimeout(r,100))}throw Error("Servidor nao iniciou")}
  async function stop(){if(child?.exitCode===null){const ended=new Promise(resolve=>child.once("exit",resolve));child.kill();await ended}}
  async function call(route,{session,method="GET",body,expected=200,permission}={}){const r=await fetch(base+route,{method,headers:{"Content-Type":"application/json",...(session?{Authorization:`Bearer ${session}`}:{}) ,...(permission?{"X-PEGMA-PERMISSION":permission}:{})},body:body?JSON.stringify(body):undefined});const data=await r.json();assert(r.status===expected,`${route}: esperado ${expected}, obtido ${r.status}: ${data.error||""}`);return data}
  const centralLogin=(username,password)=>call("/api/provider/auth/login",{method:"POST",body:{username,password}});
  const unitLogin=(user,password)=>call("/api/auth/login",{method:"POST",body:{tenantCode:"cliente-exemplo",user,password}});
  try{
    await start();let root=(await centralLogin("admin","BootstrapTeste123")).sessionId;
    await call("/api/provider/admins",{expected:401});
    const financial=await call("/api/provider/admins",{session:root,method:"POST",body:{name:"Financeiro central",username:"financeiro-central",password:"SenhaFinanceiro123",permissions:["finance"]},expected:201});
    const staff=(await centralLogin("financeiro-central","SenhaFinanceiro123")).sessionId;
    const summary=await call("/api/network/summary",{session:staff});
    assert(Array.isArray(summary.finance)&&!summary.salesDetails&&!summary.units&&!summary.deployment,"Resumo da Central vazou setores nao autorizados");
    for(const route of ["/api/provider","/api/provider/admins","/api/network/franchisees","/api/provider/tenant/cliente-exemplo/users","/api/tenant/cliente-exemplo/pdv-terminals"])await call(route,{session:staff,expected:403});
    await call("/api/provider/admins/1",{session:root,method:"POST",body:{permissions:["finance"]},expected:400});
    await call("/api/provider/admins",{session:root,method:"POST",body:{name:"Gestor parcial",username:"gestor-parcial",password:"SenhaGestor123",permissions:["users","finance"]},expected:201});
    const partial=(await centralLogin("gestor-parcial","SenhaGestor123")).sessionId;
    await call("/api/provider/admins",{session:partial,method:"POST",body:{username:"elevacao",password:"SenhaEscalada123",permissions:centralPermissions},expected:403});
    const franchisees=await call("/api/network/franchisees",{session:root});assert(franchisees.clients[0].tenantCode==="cliente-exemplo","Franqueado nao identificado");
    const admin=(await unitLogin("Operador","123456")).sessionId;
    const created=await call("/api/tenant/cliente-exemplo/users",{session:admin,method:"POST",body:{username:"financeiro-loja",name:"Financeiro loja",password:"SenhaLoja987",role:"Financeiro",permissions:["finance","dashboard"]},expected:201});
    let employee=(await unitLogin("financeiro-loja","SenhaLoja987")).sessionId;
    await call("/api/tenant/cliente-exemplo/users",{session:employee,expected:403});
    let state=(await call("/api/tenant/cliente-exemplo/state",{session:employee})).state;
    state.products[0].stock+=10;
    await call("/api/tenant/cliente-exemplo/state",{session:employee,method:"POST",permission:"finance",body:{state,baseRevision:state._meta.revision},expected:403});
    state=(await call("/api/tenant/cliente-exemplo/state",{session:employee})).state;
    state.receivables.push({id:999,value:5,customer:"Teste isolado",paid:false});
    await call("/api/tenant/cliente-exemplo/state",{session:employee,method:"POST",permission:"finance",body:{state,baseRevision:state._meta.revision}});
    // Normal snapshot saves must preserve passwords created by the account endpoint.
    employee=(await unitLogin("financeiro-loja","SenhaLoja987")).sessionId;
    await call(`/api/provider/tenant/cliente-exemplo/users/${created.user.id}`,{session:root,method:"POST",body:{permissions:["dashboard"]}});
    state=(await call("/api/tenant/cliente-exemplo/state",{session:employee})).state;
    await call("/api/tenant/cliente-exemplo/state",{session:employee,method:"POST",permission:"finance",body:{state,baseRevision:state._meta.revision},expected:403});
    await call("/api/tenant/cliente-exemplo/users/1",{session:admin,method:"POST",body:{permissions:[]},expected:400});
    await call("/api/provider/tenant/cliente-exemplo",{session:root,method:"POST",body:{modules:["PDV","Estoque","Compras","Relatorios"]}});
    state=(await call("/api/tenant/cliente-exemplo/state",{session:admin})).state;
    await call("/api/tenant/cliente-exemplo/state",{session:admin,method:"POST",permission:"finance",body:{state,baseRevision:state._meta.revision},expected:403});
    await call(`/api/provider/admins/${financial.user.id}`,{session:root,method:"POST",body:{active:false}});
    await call("/api/network/summary",{session:staff,expected:401});
    // Password changes below apply only to this isolated temporary test account.
    await call("/api/provider/auth/password",{session:root,method:"POST",body:{currentPassword:"BootstrapTeste123",newPassword:"123456"}});
    root=(await centralLogin("admin","123456")).sessionId;
    await stop();await start();await centralLogin("admin","123456");
    console.log("OK - Central e franquias: usuarios, acesso total/setorial, bloqueios, revogacao imediata, ultimo administrador, modulos por franquia, dados protegidos contra escrita de outro setor e senhas preservadas.");
  }finally{await stop()}
})().catch(error=>{console.error(error.message);process.exitCode=1});
