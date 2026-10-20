# Fluxos fiscais especiais — RTC-2026-10-19-SPECIAL.1

Esta publicação implementa os casos de software que ficaram bloqueados na versão ADV.1. Não altera regras, produtos, estoques, vendas ou configurações de clientes na implantação.

## Crédito e manifestações por evento

Na tela **Fiscal → NF-e**, o formulário **Créditos e manifestações — eventos RTC** permite conferir sem transmitir e, em ação separada, enviar:

| Evento | Uso implementado | Autor conferido contra o XML original |
|---|---|---|
| 211110 | Solicitação de apropriação pelo destinatário ou correção de crédito de operação pelo emitente | Destinatário ou emitente |
| 112110 | Declaração de quitação integral para crédito sujeito a essa condição | Emitente |
| 211128 | Aceite do débito decorrente de nota de crédito | Destinatário |
| 212110 | Aceite/recusa da transferência de IBS em sucessão | Sucessora destinatária |
| 212120 | Aceite/recusa da transferência de CBS em sucessão | Sucessora destinatária |

O XML autorizado precisa estar importado ou corresponder a uma nota própria autorizada. A conferência verifica chave/modelo, CNPJ do emitente na chave, protocolo/status, ambiente, autor, itens, duplicidade, base, indicadores e vigências de cada tributo. O evento 211110 aceita somente códigos e modelos previstos na tabela oficial; não transforma um crédito de CT-e em crédito de NF-e. A correção do emitente respeita a classificação e o indicador do documento original.

Os valores são calculados a partir da base e dos percentuais, com duas casas para valores monetários e até quatro para percentuais. Não há crédito automático em 2026 quando a tabela prevê 2027/2029. A quitação exige declaração explícita, fundamento, código aplicável e referência do comprovante; não gera entrada de caixa. Os aceites verificam finalidade/tipo/classificação da nota original.

Prévia não escreve documentos ou eventos. O envio exige permissão `fiscal_transmit`, mantém sequência por tipo e chave e grava o protocolo/retorno. Retorno 136 (sem vínculo) não é tratado como solicitação vinculada com sucesso. Registrar uma solicitação não equivale à aprovação do crédito na apuração assistida. Não é lançado saldo financeiro ou crédito contábil automaticamente.

## Notas escriturais

O formulário separado **Notas de ajuste, transferência, estorno e ZFM** cria documentos independentes de vendas. O item escritural usa quantidade 1, preço comercial zero, NCM sem produto (00), CFOP de entrada/saída conforme finalidade/UF e valores tributários totais explícitos.

| cClassTrib | Finalidade e tipo | Grupo |
|---|---|---|
| 800001 | Débito 05 — sucessão | gTransfCred |
| 800002 | Débito 01 — associado/cooperativa | gTransfCred |
| 811001 | Débito 02 — saídas imunes/isentas | gAjusteCompet |
| 811002 | Débito 03 — notas não processadas | gAjusteCompet |
| 811003 | Débito 08 — desenquadramento Simples | gAjusteCompet |
| 810001 | Crédito 02 — saldo devedor ZFM | gCredPresIBSZFM |
| 410030 | Débito 07 — estorno por perda | gEstornoCred |
| 620007 | Débito 07 — perda monofásica | gIBSCBSMono sem destaque próprio |

Não são incluídos indevidamente ICMS, PIS, COFINS, IPI ou pagamento nesses registros escriturais. Não se cria venda fictícia nem movimento de estoque para gerar a nota. Competência futura, CPF, valores comerciais ou campos tributários incompatíveis são rejeitados. NF-e de crédito é entrada; a de débito é saída.

O crédito ZFM tipo 02 fica disponível para emissão somente a partir de 2029, exige estabelecimento AM, inscrição SUFRAMA, destinatário próprio, competência, saldo e fundamento. Calcula 55%, 75%, 90,25% ou 100% conforme o tipo legal. A validação cadastral local não substitui a habilitação da empresa ao benefício perante os órgãos competentes.

## Monofasia e IPI devolvido

- **620003:** responsabilidade de retenção por terceiro, com CNPJ/fundamento nas informações complementares e sem destacar tributo monofásico próprio ou retido indevidamente. A tabela oficial determina ausência dos grupos próprios/retidos nessa classificação.
- **620007:** registro de perda no fluxo de débito 07, com chave original e motivo, sem cobrança de monofasia própria. A movimentação física de perda deve ser registrada no estoque pelo fluxo operacional apropriado; emitir nota não duplica essa movimentação.
- **IPI devolvido:** grupo `impostoDevol/pDevol/IPI/vIPIDevol`, calculado com quantidade/IPI do item original, chave e número do item referenciado. Bloqueia quantidade superior à original e destaque simultâneo de IPI próprio. O usuário informa se o preço já inclui IPI ou se este deve ser acrescido; os totais e o preço XML são conferidos pelo servidor. Empresas que devam destacar IPI próprio na devolução continuam utilizando a configuração de IPI própria aplicável, sem somar o grupo de devolvido simultaneamente.

## Esquemas e fontes

- [Pacote oficial de eventos RTC v1.40, publicado em 27/07/2026](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=kp0SXLu%2BZdI%3D). Copiado sem modificar o leiaute, em `runtime/fiscal/Schemas/RTCEvents`; os eventos utilizados também ficam na raiz para o agente ACBr. O arquivo compartilhado antigo de tipos básicos foi preservado na raiz para não remover tipos usados por outros serviços.
- [Aviso oficial do pacote](https://www.nfe.fazenda.gov.br/portal/informe.aspx?AspxAutoDetectCookieSupport=1&Informe=Yoev2q1EJeY%3D&ehCTG=false).
- NT 2025.002 v1.52, regras B25 e grupos UB, tabelas IT 2025.002 v1.70 e indicadores oficiais já fixados no projeto.
- [MOC 7 — NCM sem produto e leiaute](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=J%2BI%2Bv4eN00E%3D).

## Verificação e limite operacional

Testes de cálculo, XML, interface e API HTTP executados em empresas fictícias, arquivos temporários e agente simulado em localhost. Cobrem autorização/acesso cruzado, sequência, protocolo, rejeições, prévia sem escrita e preservação de vendas/estoque/caixa. Nos testes de eventos futuros, o relógio é alterado somente no processo filho isolado, nunca no computador ou em produção.

A validação XSD abrange `infNFe`, DPS e a parte específica `detEvento`; não confirma assinatura ou autorização real. Para envio real, cada empresa precisa de certificado, agente ACBr atualizado, credenciamento e parâmetros aplicáveis. O agente verifica o leiaute atualizado do 211110 antes de enviá-lo. Não houve emissão/evento em produção durante esta implantação. Os testes não atestam cobertura universal de toda operação tributária fora dos casos listados.
