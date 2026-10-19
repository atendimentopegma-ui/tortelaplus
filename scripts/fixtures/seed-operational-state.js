const fs=require("fs"),path=require("path"),os=require("os");
module.exports=function seedOperationalState(directory){
  const target=path.resolve(directory),temp=path.resolve(os.tmpdir());
  if(!target.startsWith(temp+path.sep))throw Error("Fixtures operacionais permitidos somente na pasta temporaria de testes.");
  fs.mkdirSync(path.join(target,"tenants"),{recursive:true});
  const state=JSON.parse(fs.readFileSync(path.join(__dirname,"tenant-operational-state.json"),"utf8"));state.cashRegister.openedAt=new Date().toISOString();fs.writeFileSync(path.join(target,"tenants","cliente-exemplo.json"),JSON.stringify(state));
};
