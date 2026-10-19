# Suporte a múltiplas empresas e regimes

Versão RTC-2026-10-19-MULTI. Cada empresa possui configuração independente; não existe regime global definido pelo cliente importado.

| Regime | CRT | ICMS na NF-e/NFC-e | NFS-e nacional |
| --- | --- | --- | --- |
| Simples Nacional | 1 | CSOSN | Optante ME/EPP |
| Simples: excesso de sublimite | 2 | CST do regime normal | Optante ME/EPP, com apuração de ISS configurável |
| MEI | 4 | CSOSN e CFOP específicos do MEI | Optante MEI, código 2 |
| Lucro Presumido | 3 | CST do regime normal | Não optante |
| Lucro Real | 3 | CST do regime normal | Não optante |
| Lucro Arbitrado | 3 | CST do regime normal | Não optante |

O CRT pode ser automático pelo regime. Uma combinação manual incompatível é rejeitada, sem transformar MEI em regime normal nem aplicar CSOSN ao CRT 2. O regime de apuração municipal da NFS-e é separado do CRT de ICMS. A implementação não apura IRPJ/CSLL ou entrega ECF/ECD.

## Correções desta versão

- Abertura de telas deixa de criar regras fiscais nos clientes. Regras devem ser cadastradas explicitamente. A atualização não migra, exclui ou reclassifica dados dos clientes.
- Cadastro da empresa e das regras contempla os seis regimes e CRT 1/2/3/4. Seleção da regra verifica regime, CRT, UF e vigência. Produto possui CST e CSOSN separados; o NCM é conferido por item.
- ICMS do CRT 2 é calculado como regime normal, preservando o enquadramento federal do Simples. MEI recebe validações específicas de CSOSN/CFOP/origem por modelo, conforme NT 2024.001 v1.20.
- Implementação de ICMS CST 51 (diferimento), 60 (ST anteriormente retido), 90, CSOSN 500/900 e FCP próprio para os CST implementados. CST 00/20/40/41/50 e CSOSN 101/102/103/300/400 continuam disponíveis conforme o modelo e destinatário.
- Dados monetários de ST anteriormente retido no cadastro do produto são por unidade; são multiplicados pela quantidade. Dados explícitos no item do documento representam o total daquele item. Base, alíquota e valor retidos precisam vir do documento de origem; não são presumidos. FCP próprio integra a conferência dos totais e é excluído da base RTC.
- Destinatário contribuinte informa sua IE; consumidor final é tratado separadamente. Créditos de CSOSN 101 não são aceitos indiscriminadamente para não contribuintes.
- DPS do Simples/MEI em 2026 pode omitir IBS/CBS quando não aplicável. Se o grupo for informado, passa pelas respectivas validações. CRT 3 e vigência posterior são tratados pela política fiscal da empresa.
- NFC-e fora de SP exige as URLs oficiais de consulta/QR Code configuradas para a UF e ambiente, além do CSC. Não há reaproveitamento automático das URLs de outro cliente.

## Limites e homologação

Suporte ao regime não significa suporte automático a toda atividade econômica ou operação especial. Permanecem bloqueados nesta implementação: cobrança nova de ICMS-ST (CST 10/30/70 e CSOSN 201/202/203), IPI, DIFAL interestadual, exportação/importação, monofasia, Imposto Seletivo, créditos especiais de IBS/CBS, compras governamentais, notas de ajuste/crédito/débito e NFS-e municipal. Não foi removido bloqueio para emitir XML sem cálculo correto. Preços líquidos opcionais, split payment e evento 110300 seguem dependendo dos esquemas oficiais compatíveis e da homologação do agente.

A1, CSC, IE, credenciamento, município/provedor, URLs, regras fiscais e classificações são próprios de cada empresa. Nenhum certificado, senha ou enquadramento de um cliente foi copiado para outro. Autorização SEFAZ/município e DANFE exigem homologação real por empresa/UF/provedor. Os testes locais não constituem autorização fiscal, nem comprovam todas as regras de negócio da SEFAZ.

## Verificação reproduzível

`npm run verify:fiscal-multi-company` testa 79 XMLs sintéticos para seis regimes, seis UFs, 2026/2027 e homologação/produção, além de rejeições e isolamento. A CBS usada nos testes futuros é fictícia e não é recomendação de alíquota. As URLs NFC-e dos fixtures são de teste; nenhum documento foi transmitido.

`scripts/verify-fiscal-regimes-api.js` inicia servidor com banco de arquivos em diretório temporário novo e seis empresas fictícias. Confere prévias válidas, erro 422, acesso cruzado negado e integridade dos arquivos das empresas antes/depois da prévia. Nunca usa o banco de produção.

Com `RTC_XML_OUTPUT` apontando para uma pasta temporária, os testes exportam fixtures. `python scripts/verify-fiscal-xsd.py <pasta>` valida conteúdo infNFe e DPS nos esquemas oficiais incorporados. Assinatura/QR e autorização não fazem parte dessa validação estrutural.

## Fontes

- [CRT e MEI — NT 2024.001](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=kIiniiSkpKc%3D)
- [Documentação e esquemas NF-e](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=04BIflQt1aY%3D)
- [Documentação nacional NFS-e RTC](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc)
- [Tabela de classificações e vigências](https://dfe-portal.svrs.rs.gov.br/Nfe/Documentos)
