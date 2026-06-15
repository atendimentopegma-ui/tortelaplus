# Diretrizes fiscais iniciais

Este projeto deve tratar o modulo fiscal como camada isolada da operacao de vendas, compras e estoque. A emissao real de documentos fiscais exige credenciamento do emitente, certificado digital, serie/ambiente, autorizacao da SEFAZ ou prefeitura, homologacao e acompanhamento continuo de notas tecnicas.

## Documentos previstos

- NF-e, modelo 55, com XML, DANFE, assinatura digital, autorizacao, cancelamento, inutilizacao, carta de correcao, contingencia e eventos.
- NFC-e, modelo 65, com emissao para consumidor final, contingencia offline quando aplicavel pela UF, QR Code, cancelamento e inutilizacao.
- NFS-e, com adaptador por municipio ou padrao nacional quando disponivel para o municipio do emitente.
- Importacao de XML de compra para entrada de estoque, financeiro, conferencia fiscal e atualizacao de custo.

## Reforma tributaria

Pontos obrigatorios para o desenho do sistema em 2026:

- Campos de IBS, CBS e Imposto Seletivo devem existir em cadastro fiscal, item de venda, item de compra e XML fiscal.
- A classificacao tributaria deve ser parametrizavel por produto/servico, NCM, operacao, UF, regime tributario e natureza da operacao.
- A regra fiscal precisa ter versionamento por vigencia, para nao reprocessar documentos antigos com regra nova.
- A apuracao deve manter trilha de auditoria para facilitar conferencia contabil.

## Decisao de arquitetura

- O PDV registra venda e pagamento mesmo sem internet.
- A autorizacao fiscal fica em uma fila de sincronizacao.
- O sistema deve diferenciar venda operacional, documento fiscal autorizado e financeiro liquidado.
- Nenhuma regra fiscal deve ficar fixa na tela; tudo precisa vir de tabelas parametrizaveis e atualizaveis.

## Motor gratuito escolhido para homologacao

O motor escolhido para a primeira homologacao e o **Projeto ACBr**, usando **ACBrLib** em processo isolado dentro deste projeto. Ele nao e um provedor SaaS e nao autoriza documentos por conta propria: a autorizacao continua sendo feita pela SEFAZ ou prefeitura competente.

Arquivos instalados no projeto:

- `runtime/fiscal/ACBrLib/ACBrNFe64.dll` para NF-e e NFC-e.
- `runtime/fiscal/ACBrLib/ACBrNFSe64.dll` para NFS-e.
- `runtime/fiscal/Schemas` para os leiautes fiscais.
- `runtime/fiscal/Bridge/ProdutoFiscal.AcbrLibBridge.exe` para manter o motor separado.

## Regras de seguranca fiscal

- Chave, protocolo e status `Autorizada` somente podem ser gravados a partir do retorno real do autorizador.
- Falha de conexao nunca vira autorizacao simulada.
- Documento ainda nao transmitido pode ser descartado localmente.
- Documento autorizado somente pode ser cancelado por evento real aceito pelo autorizador.
- NF-e e NFC-e sao geradas no leiaute 4.00 e encaminhadas ao bridge ACBr para carregar, assinar, validar e transmitir.
- A DPS da NFS-e Nacional e gerada separadamente e transmitida pela ACBrLibNFSe. Para producao, o municipio/provedor utilizado deve estar homologado e com credenciais reais configuradas.

## Regimes e Reforma Tributaria

- Simples Nacional usa CRT 1 e exige CSOSN nas regras de mercadorias.
- Lucro Presumido e Lucro Real usam CRT 3 e exigem CST nas regras de mercadorias.
- Aliquotas nao sao presumidas pelo sistema: devem ser revisadas pelo contador conforme produto, operacao, UF, municipio e vigencia.
- As regras possuem CST IBS/CBS, classificacoes IBS/CBS, IBS UF, IBS municipio, CBS federal, credito presumido, reducao, Imposto Seletivo e ano de transicao.

## Pendencias para emissao real

1. Informar CNPJ, IE/IM e endereco reais do emitente.
2. Instalar certificado digital e senha no ambiente protegido.
3. Configurar CSC/ID CSC para NFC-e quando exigido pela UF.
4. Configurar o municipio/provedor da NFS-e.
5. Homologar uma NF-e e uma NFC-e completas na SEFAZ com os dados reais.
6. Homologar o adaptador NFS-e do municipio utilizado.
7. Confirmar cancelamento, inutilizacao, contingencia, distribuicao DFe/manifestacao e impressao no ambiente real.

## Implementacao atual

- NF-e modelo 55 e NFC-e modelo 65: gerador XML 4.00 no backend, sem chave/protocolo ficticio.
- ACBrLib: configuracao isolada por cliente, certificado/CSC obtidos do cofre criptografado e comandos reais de envio, cancelamento e impressao.
- Retornos: chave, protocolo e autorizacao somente sao aceitos quando vierem no retorno ACBr com codigo autorizado.
- NFS-e: DPS Nacional, adaptadores municipais configuraveis, emissao, consulta, cancelamento e DANFSe pela ACBrLibNFSe.
- Distribuicao DF-e e manifestacao do destinatario pela ACBrLib, com retornos arquivados por cliente.
- XML, retornos fiscais e PDFs oficiais sao armazenados por cliente e incluidos no backup completo.
- Importacao: leitura de XML NF-e recebido e armazenamento separado por cliente.
- Inutilizacao, cancelamento, carta de correcao e contingencia usam operacoes reais da ACBrLib e arquivam os retornos por cliente.
- As operacoes fiscais dependem da homologacao e dos parametros reais da empresa, certificado, UF e municipio antes do uso em producao.

Os campos para preenchimento no provedor ficam em `Configuracoes`: dados da empresa, IE/IM, endereco, regime, credenciamento e UF SEFAZ, certificado A1, validade, senha protegida, CSC/ID CSC e configuracao do municipio/provedor NFS-e. Senha do certificado e CSC sao criptografados no cofre fiscal quando `PEGMA_SECRET_KEY` estiver configurada.

Referencias oficiais:

- Portal Nacional da NF-e: https://www.nfe.fazenda.gov.br/portal/
- Portal Nacional da NFS-e: https://www.gov.br/nfse/
- Lei Complementar 214/2025: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm
- Projeto ACBr: https://projetoacbr.com.br/
