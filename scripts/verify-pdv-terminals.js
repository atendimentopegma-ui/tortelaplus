const fs = require("fs"), os = require("os"), path = require("path"), net = require("net"), {spawn} = require("child_process");
const assert = (ok, message) => { if (!ok) throw Error(message); };
const root = path.resolve(__dirname, "..");
async function main() {
  const port = await new Promise(resolve => { const s=net.createServer(); s.listen(0,()=>{const p=s.address().port;s.close(()=>resolve(p));}); });
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "tortela-terminal-test-"));
require("./fixtures/seed-operational-state")(dataDir);

  const env = {...process.env};
  for (const key of Object.keys(env)) if (key === "DATABASE_URL" || key.startsWith("TORTELAPLUS_") || key.startsWith("PEGMA_")) delete env[key];
  Object.assign(env, {PORT:String(port), DATABASE_URL:"", TORTELAPLUS_DB_DIR:dataDir, TORTELAPLUS_PROVIDER_TOKEN:"terminal-provider-test-token"});
  const base = `http://localhost:${port}`;
  let child;
  async function start() {
    child=spawn(process.execPath,["server.js"],{cwd:root,env,stdio:["ignore","pipe","pipe"]});
    let errors="";child.stderr.on("data",d=>errors+=d);
    for(let i=0;i<60;i++){try{const r=await fetch(base+"/api/health");if(r.ok)return;}catch{};await new Promise(r=>setTimeout(r,100));}
    throw Error("Servidor nao iniciou: "+errors);
  }
  async function stop(){if(child && child.exitCode===null){const ended=new Promise(resolve=>child.once("exit",resolve));child.kill();await ended;}}
  async function call(route, {session, provider=false, method="GET", body, expected=200, permission}={}) {
    const r=await fetch(base+route,{method,headers:{"Content-Type":"application/json",...(session?{Authorization:`Bearer ${session}`} : {}),...(provider?{"X-Provider-Token":env.TORTELAPLUS_PROVIDER_TOKEN}:{}),...(permission?{"X-PEGMA-PERMISSION":permission}:{})},body:body?JSON.stringify(body):undefined});
    const data=await r.json();assert(r.status===expected,`${method} ${route}: esperado ${expected}, obtido ${r.status}: ${data.error||""}`);return data;
  }
  const route="/api/tenant/cliente-exemplo/pdv-terminals";
  const login = terminalId => call("/api/auth/login",{method:"POST",body:{tenantCode:"cliente-exemplo",user:"Operador",password:"123456",terminalName:terminalId,terminalId}});
  try {
    await start();
    await call(route,{expected:401});
    let a=await login("pdv-caixa-01"), b=await login("pdv-caixa-02");
    let rows=(await call(route,{session:a.sessionId})).terminals;
    assert(rows.length===2 && rows.every(row=>row.online),"Dois terminais com mesmo usuario/IP nao permaneceram conectados.");
    await call(route,{session:a.sessionId,method:"POST",body:{terminalId:"pdv-caixa-01",name:"Caixa recibo",emissionMode:"receipt"}});
    rows=(await call(route,{provider:true})).terminals;
    assert(rows.find(r=>r.id==="pdv-caixa-01").emissionMode==="receipt" && rows.find(r=>r.id==="pdv-caixa-02").emissionMode==="nfce","Configuracao de um terminal afetou outro.");
    await call(route,{provider:true,method:"POST",body:{terminalId:"pdv-caixa-02",name:"Caixa fiscal",emissionMode:"receipt"}});
    a=await login("pdv-caixa-01");
    rows=(await call(route,{session:a.sessionId})).terminals;
    assert(rows.length===2 && rows[0].name==="Caixa recibo" && rows[0].emissionMode==="receipt","Reconectar alterou identidade/nome/emissao.");
    await call(route,{provider:true,method:"POST",body:{terminalId:"pdv-caixa-01",name:"Teste",emissionMode:"invalido"},expected:400});
    await call("/api/tenant/outra-unidade/pdv-terminals",{session:a.sessionId,expected:404});
    let state=(await call("/api/tenant/cliente-exemplo/state",{session:a.sessionId})).state;
    state.settings.pdvTerminals=[];
    state.sales.push({id:9999,type:"PDV",emissionMode:"receipt",cashRegisterOpenedAt:state.cashRegister.openedAt,date:new Date().toISOString().slice(0,10),items:[],total:0});
    await call("/api/tenant/cliente-exemplo/state",{session:a.sessionId,method:"POST",permission:"settings",body:{state,baseRevision:state._meta.revision}});
    assert((await call(route,{provider:true})).terminals.length===2,"Salvamento geral apagou configuracao de terminais.");
    const blocked=await call("/api/tenant/cliente-exemplo/fiscal/transmit",{session:a.sessionId,method:"POST",body:{document:{model:"NFC-e",saleId:9999}},expected:503});
    assert(blocked.error.includes("recibo nao fiscal"),"Servidor tentou transmitir NFC-e de venda nao fiscal.");
    await call("/api/tenant/cliente-exemplo/users",{session:a.sessionId,method:"POST",expected:201,body:{username:"caixa-terminal",name:"Caixa",password:"SenhaTeste123",role:"Caixa"}});
    await call("/api/auth/logout",{session:b.sessionId,method:"POST",body:{tenantCode:"cliente-exemplo",sessionId:b.sessionId}});
    const cashier=await call("/api/auth/login",{method:"POST",body:{tenantCode:"cliente-exemplo",user:"caixa-terminal",password:"SenhaTeste123"}});
    await call(route+"/register",{session:cashier.sessionId,method:"POST",body:{terminalId:"pdv-caixa-03",name:"Terceiro PDV"}});
    await call(route,{session:cashier.sessionId,method:"POST",body:{terminalId:"pdv-caixa-03",name:"Tentativa",emissionMode:"receipt"},expected:403});
    await stop();await start();
    rows=(await call(route,{provider:true})).terminals;
    assert(rows.length===3 && rows.find(r=>r.id==="pdv-caixa-02").emissionMode==="receipt","Configuracao nao persistiu apos reiniciar.");
    console.log("OK - terminais PDV: duas sessoes no mesmo IP, configuracao pela loja/Central, isolamento, persistencia, permissao, protecao contra sobrescrita e bloqueio fiscal de recibos.");
  } finally { await stop(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
