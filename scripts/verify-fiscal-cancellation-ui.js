const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
class Control{
 constructor(){this.events={};this.value='';this.dataset={};this.controls={};this.buttons=[];}
 addEventListener(name,fn){this.events[name]=fn;}
 querySelector(name){return this.controls[name]??=(new Control());}
 querySelectorAll(){return this.buttons;}
 set innerHTML(value){this.html=value;if(value.includes('data-select-fiscal-cancel="1"')){const b=new Control();b.dataset.selectFiscalCancel='1';this.buttons=[b];}else this.buttons=[];}
 get innerHTML(){return this.html;}
}
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/fiscal-cancellation-panel.js'),'utf8'),context);
(async()=>{
 const panel=new Control(),requests=[],note={id:1,model:'NFC-e',number:9,status:'Autorizada',key:'1'.repeat(44),protocol:'123456789012345'},data={unit:'Unidade teste',environment:'Homologacao',canCancel:true,documents:[note]};let changed=0,reject=true,release;
 const api=async(route,options)=>{requests.push({route,options});if(!options)return structuredClone(data);await new Promise(r=>release=r);if(reject)throw Error('Rejeicao simulada');return {document:{...note,status:'Cancelada',cancelProtocol:'987654321012345'}};};
 await context.window.FiscalCancellationPanel.mount(panel,{api,tenantCode:'loja-a',onChanged:()=>changed++});
 const rows=panel.querySelector('[data-fiscal-rows]');await rows.buttons[0].events.click();const area=panel.querySelector('[data-fiscal-cancel-form]'),form=area.querySelector('form');form.elements={reason:{value:'curta'}};await form.events.submit({preventDefault(){}});assert.equal(requests.length,1);
 form.elements.reason.value='Justificativa sintetica para teste';const first=form.events.submit({preventDefault(){}});await form.events.submit({preventDefault(){}});assert.equal(requests.length,2,'Duplo clique nao deve transmitir novamente');assert.equal(changed,0);release();await first;assert.match(panel.querySelector('[role="status"]').textContent,/Rejeicao/);assert.equal(changed,0);assert.match(rows.innerHTML,/Autorizada/);
 reject=false;const success=form.events.submit({preventDefault(){}});release();await success;assert.equal(changed,1);assert.match(rows.innerHTML,/Cancelamento confirmado/);assert.match(panel.querySelector('[role="status"]').textContent,/987654321012345/);assert.equal(requests[1].route,'/api/tenant/loja-a/fiscal/cancel');assert.equal(JSON.parse(requests[1].options.body).id,1);
 const limited=new Control();await context.window.FiscalCancellationPanel.mount(limited,{tenantCode:'loja-b',api:async()=>({...data,canCancel:false})});assert.equal(limited.querySelector('[data-fiscal-rows]').buttons.length,0);
 console.log('OK UI cancelamento: selecionar nota, justificar, impedir clique duplicado, preservar autorizacao na rejeicao, confirmar protocolo e respeitar permissao.');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
