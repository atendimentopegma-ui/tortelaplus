function assertRtcSchemaSupport(xml, schemaDirectory) {
  const fs=require('fs'),path=require('path');
  const layout=fs.readFileSync(path.join(schemaDirectory,'leiauteNFe_v4.00.xsd'),'utf8');
  for(const field of ['vUnComLiq','vProdLiq','vProdLiqTot','gPgtoVinc']) {
    if(xml.includes('<'+field)&&!layout.includes('name="'+field+'"'))throw Error('Schema oficial instalado ainda nao suporta '+field+'. Atualize o pacote oficial e o agente ACBr antes de transmitir.');
  }
}
module.exports={assertRtcSchemaSupport};
