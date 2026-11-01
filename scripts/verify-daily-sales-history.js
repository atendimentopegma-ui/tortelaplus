const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const report=require('../src/daily-sales-report'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),today='2026-11-01';
const sale=(id,date,total,status='Fechado')=>({id,type:'PDV',date,soldAt:date+'T16:00:00Z',total,status,customer:'Consumidor Final',payment:'PIX',payments:[{method:'PIX',value:total}],items:[{id:1,description:'TORTELA TESTE',qty:1,price:total}]});
const state={settings:{tenantCode:'loja-teste',company:'Tortela'},products:[],sales:[sale(1,today,25),sale(2,'2026-10-03',30),sale(3,'2026-10-02',99),sale(4,'2026-11-02',99),sale(5,'2026-10-31',40,'Cancelado')]};
(async()=>{
 const period=report.last30Days(today);assert.deepEqual(period,{from:'2026-10-03',to:today});assert.deepEqual(report.last30Days('2026-03-01'),{from:'2026-01-31',to:'2026-03-01'});
 const result=report.build(state,period);assert.equal(result.count,2);assert.equal(result.total,55);assert.equal(result.rows.length,3);assert.equal(report.flavors(state,period)[0].qty,2);
 assert(report.spreadsheet(state,period).includes('2026-10-03 a 2026-11-01'));assert(!report.documentHtml(state,period).includes('[object Object]'));assert(report.documentHtml(state,period).includes('DO PERÍODO'));assert(Buffer.from(report.pdf(state,period)).toString('latin1').includes('03/10/2026 a 01/11/2026'));
 const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'block'}),page=await context.newPage(),source=fs.readFileSync(path.join(root,'src/app.js'),'utf8'),summary=source.slice(source.indexOf('async function openDailySalesSummary(){'));
 await page.route('https://history.invalid/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body><button id="daily-sales-summary">Resumo de vendas do dia</button></body>'}));await page.goto('https://history.invalid/');
 await page.addStyleTag({content:fs.readFileSync(path.join(root,'src/daily-sales-report.css'),'utf8')});await page.addScriptTag({content:fs.readFileSync(path.join(root,'src/daily-sales-report.js'),'utf8')});
 await page.evaluate(state=>{window.state=state;window.byId=id=>document.getElementById(id);window.syncChain=Promise.resolve();window.hasPendingLocalChanges=()=>false;window.apiOnline=false;window.sessionId='';window.cashBusinessDay=()=>'2026-11-01';},state);
 await page.addScriptTag({content:summary});await page.evaluate(()=>openDailySalesSummary());
 assert.equal(await page.locator('[data-summary-date]').inputValue(),today);assert.equal(await page.locator('.ds-sale').count(),1);
 await page.locator('[data-period="recent"]').click();assert.equal(await page.locator('.ds-sale').count(),3);assert((await page.locator('.ds-title').innerText()).includes('03/10/2026 a 01/11/2026'));
 const download=page.waitForEvent('download');await page.locator('[data-pdf]').click();assert((await download).suggestedFilename().includes('2026-10-03_a_2026-11-01'));
 await page.locator('[data-view="flavors"]').click();await page.locator('[data-summary-date]').fill('2026-10-03');await page.locator('[data-summary-date]').dispatchEvent('change');assert.equal(await page.locator('.ds-sale').count(),1);assert(await page.locator('[data-flavors]').isVisible());
 await page.locator('[data-period="today"]').click();assert.equal(await page.locator('[data-summary-date]').inputValue(),today);
 await page.locator('[data-close]').click();await page.evaluate(()=>openDailySalesSummary());assert.equal(await page.locator('[data-period="today"]').getAttribute('aria-pressed'),'true');
 fs.mkdirSync(path.join(root,'outputs'),{recursive:true});await page.screenshot({path:path.join(root,'outputs/daily-history-30.png')});
 console.log('OK: abre em hoje; 30 dias inclusivos; seleciona um dia; totais/canceladas/sabores; PDF e planilha usam período; reabrir retorna a hoje.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
