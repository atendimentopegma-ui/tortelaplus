const fs=require('fs'),os=require('os'),path=require('path'),net=require('net'),{spawn}=require('child_process');
(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,()=>{const p=s.address().port;s.close(()=>resolve(p));});});
 const env={...process.env};for(const k of Object.keys(env))if(k==='DATABASE_URL'||k.startsWith('PEGMA_')||k.startsWith('TORTELAPLUS_'))delete env[k];
 Object.assign(env,{DATABASE_URL:'',PORT:String(port),TORTELAPLUS_DB_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'tortela-request-recovery-'))});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env,stdio:'ignore'});
 try{
  const base='http://127.0.0.1:'+port;let ready=false;
  for(let i=0;i<60;i++){try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  if(!ready)throw Error('Servidor de teste indisponivel');
  const socket=net.createConnection({host:'127.0.0.1',port});await new Promise(r=>socket.once('connect',r));
  socket.write('POST /api/provider/auth/login HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 200\r\n\r\n{"username":');
  await new Promise(r=>setTimeout(r,100));socket.destroy();
  const response=await fetch(base+'/api/health',{signal:AbortSignal.timeout(3000)});
  if(!response.ok)throw Error('Requisicao abandonada bloqueou a fila do servidor');
  console.log('OK - requisicao interrompida libera a fila e o sistema continua respondendo.');
 }finally{const done=new Promise(r=>child.once('exit',r));child.kill();await done;}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
