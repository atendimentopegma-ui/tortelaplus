const RADIUS_KM=10;
const OUTSIDE_MESSAGE='Infelizmente ainda não temos uma Tortela próxima de você, mas em breve teremos!';
const UNKNOWN_MESSAGE='Não foi possível confirmar sua localização. Confira o CEP e o endereço e tente novamente. O pedido só será liberado após confirmar o atendimento em até 10 km.';
const text=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const street=v=>text(String(v||'').replace(/^(rua|r\.?|avenida|av\.?|travessa|alameda)\s+/i,''));
function coordinates(value){const lat=Number(value?.latitude),lon=Number(value?.longitude);return value?.latitude!==null&&value?.latitude!==undefined&&value?.longitude!==null&&value?.longitude!==undefined&&String(value.latitude).trim()!==''&&String(value.longitude).trim()!==''&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=-34&&lat<=6&&lon>=-74&&lon<=-28?{latitude:lat,longitude:lon}:null;}
function distanceKm(a,b){const x=coordinates(a),y=coordinates(b);if(!x||!y)return null;const rad=n=>n*Math.PI/180,dl=rad(y.latitude-x.latitude),dn=rad(y.longitude-x.longitude),h=Math.sin(dl/2)**2+Math.cos(rad(x.latitude))*Math.cos(rad(y.latitude))*Math.sin(dn/2)**2;return 6371.0088*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
function chooseNearest(units){return units.filter(u=>Number.isFinite(u.distanceKm)&&u.products>0).slice().sort((a,b)=>a.distanceKm-b.distanceKm||String(a.tenantCode).localeCompare(String(b.tenantCode)))[0]||null;}
function decision(unit,address){if(!address?.cep||String(address.cep).length!==8)return {available:null,message:'Informe seu CEP para consultar o atendimento em até 10 km.',distanceKm:null};if(!unit||!Number.isFinite(unit.distanceKm))return {available:false,message:UNKNOWN_MESSAGE,distanceKm:null,reason:'location_unavailable'};const available=unit.distanceKm<=RADIUS_KM;return {available,distanceKm:Math.round(unit.distanceKm*100)/100,reason:available?'within_radius':'outside_radius',message:available?`Você será atendido pela ${unit.tradeName}. Distância geográfica estimada: ${unit.distanceKm.toFixed(2).replace('.',',')} km (raio de até 10 km).`:OUTSIDE_MESSAGE};}
function createGeocoder({fetchImpl=globalThis.fetch,now=()=>Date.now(),endpoint=process.env.TORTELAPLUS_GEOCODER_URL||'https://photon.komoot.io/api/'}={}){
 const cache=new Map(),pending=new Map();let queue=Promise.resolve(),last=0;
 async function resolve(address={}){
  const cep=String(address.cep||'').replace(/\D/g,''),road=String(address.address||'').trim(),city=String(address.city||'').trim();if(cep.length!==8||!road||!city)return null;
  const key=[cep,text(road),text(address.number),text(city),text(address.uf)].join('|'),hit=cache.get(key);if(hit&&hit.expires>now())return hit.value;if(pending.has(key))return pending.get(key);
  const job=queue.then(async()=>{const pause=1000-(now()-last);if(pause>0)await new Promise(r=>setTimeout(r,pause));last=now();let value=null;try{
   const url=new URL(endpoint);url.searchParams.set('q',[road,address.number,city,address.uf,'Brasil'].filter(Boolean).join(' '));url.searchParams.set('limit','6');
   const response=await fetchImpl(url,{headers:{'User-Agent':'TortelaPlus/1.0 (https://tortelaplus.com.br)','Accept':'application/json'},signal:AbortSignal.timeout(8000)});if(response.ok){const data=await response.json();const candidates=(data.features||[]).flatMap(feature=>{const p=feature.properties||{},point=coordinates({latitude:feature.geometry?.coordinates?.[1],longitude:feature.geometry?.coordinates?.[0]});if(!point||String(p.countrycode||'').toUpperCase()!=='BR')return [];
    const roadName=street(p.street||p.name),wanted=street(road),foundCity=text(p.city||p.county),wantCity=text(city);if(!roadName||!(roadName===wanted||roadName.startsWith(wanted)||wanted.startsWith(roadName)))return [];
    if(!foundCity||!(foundCity===wantCity||foundCity.startsWith(wantCity)||wantCity.startsWith(foundCity)))return [];
    if(!['street','house','residential','building'].includes(p.type)&&!p.street)return [];
    const postal=String(p.postcode||'').replace(/\D/g,''),exactHouse=address.number&&text(p.housenumber)===text(address.number);return [{...point,precision:exactHouse?'house':'street',score:(exactHouse?100:0)+(postal===cep?30:postal.slice(0,5)===cep.slice(0,5)?10:0),source:'Photon / OpenStreetMap'}];});value=candidates.sort((a,b)=>b.score-a.score)[0]||null;}
  }catch{}if(cache.size>=2000)cache.delete(cache.keys().next().value);cache.set(key,{value,expires:now()+(value?86400000:60000)});return value;});queue=job.catch(()=>{});pending.set(key,job);try{return await job;}finally{pending.delete(key);}
 }
 return {resolve};
}
function storeAddress(tenant,state){const s=state.settings||{};return {cep:s.cep||tenant.cep||'',address:s.address||tenant.address||'',number:s.number||tenant.number||'',city:s.city||tenant.city||'',uf:s.uf||tenant.uf||''};}
function sameStreet(a,b){return street(a)===street(b);}
module.exports={sameStreet,RADIUS_KM,OUTSIDE_MESSAGE,UNKNOWN_MESSAGE,coordinates,distanceKm,chooseNearest,decision,createGeocoder,storeAddress};
