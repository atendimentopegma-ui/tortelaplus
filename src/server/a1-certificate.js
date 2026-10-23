const fs=require('fs'),path=require('path'),crypto=require('crypto');
const MAX_A1_BYTES=2*1024*1024;
function validateCertificate(file){
 if(!file||typeof file!=='object'||Array.isArray(file)||Object.keys(file).some(k=>!['fileName','content','sha256'].includes(k)))throw Error('Arquivo A1 inválido.');
 const name=String(file.fileName||'');if(!/\.(pfx|p12)$/i.test(name)||name.length>120||/[\/\\\x00-\x1f]/.test(name))throw Error('Selecione um arquivo .pfx ou .p12.');
 const content=file.content;if(typeof content!=='string'||content.length>Math.ceil(MAX_A1_BYTES/3)*4||!content.length||content.length%4||!/^[A-Za-z0-9+/]+={0,2}$/.test(content))throw Error('Conteúdo do certificado inválido ou maior que 2 MB.');
 const bytes=Buffer.from(content,'base64');if(bytes.length>MAX_A1_BYTES||bytes.toString('base64')!==content)throw Error('Conteúdo do certificado inválido.');
 let offset=1;if(bytes[0]!==0x30)throw Error('O arquivo não possui estrutura PKCS#12.');const length=bytes[offset++];if(length&0x80){const size=length&0x7f;if(!size||size>4)throw Error('Estrutura PKCS#12 inválida.');let total=0;for(let i=0;i<size;i++)total=total*256+bytes[offset++];if(total!==bytes.length-offset)throw Error('Certificado incompleto.');}else if(length!==bytes.length-offset)throw Error('Certificado incompleto.');
 if(bytes[offset]!==2||bytes[offset+1]!==1||bytes[offset+2]!==3||bytes[offset+3]!==0x30)throw Error('O arquivo não possui estrutura PKCS#12 versão 3.');
 const sha256=crypto.createHash('sha256').update(bytes).digest('hex');if(file.sha256&&file.sha256!==sha256)throw Error('Integridade do certificado inválida.');return {fileName:name,content,sha256};
}
function installCertificate(tenantDir,file){const certificate=validateCertificate(file),directory=path.join(path.resolve(tenantDir),'certificates');fs.mkdirSync(directory,{recursive:true,mode:0o700});const target=path.join(directory,certificate.sha256+'.pfx');if(!fs.existsSync(target)||crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')!==certificate.sha256)fs.writeFileSync(target,Buffer.from(certificate.content,'base64'),{mode:0o600});return target;}
module.exports={MAX_A1_BYTES,validateCertificate,installCertificate};
