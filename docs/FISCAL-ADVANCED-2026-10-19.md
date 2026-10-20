# DIFAL, IPI, monofasia e créditos — RTC-2026-10-19-ADV.1

Os parâmetros ficam no cadastro do produto, aba Impostos, por empresa. Abrir a tela não cria regras nem altera cadastros. Nenhuma migração de produtos, vendas, estoques ou configurações faz parte desta publicação.

## Recursos implementados e testados

- NF-e com IPI percentual ou por unidade, enquadramento legal, tributação/não tributação, preço incluído/acrescido e totalizadores. O IPI compõe a base ICMS nas operações destinadas a consumidor final/não contribuinte. Simples Nacional (inclusive CRT 2) e MEI não destacam IPI próprio neste fluxo. Devolução de IPI não usa o grupo de IPI próprio.
- DIFAL de NF-e interestadual ao consumidor final não contribuinte, base única, alíquotas explicitamente configuradas, FCP destino, fundamento, UF e vigência. Para consumidor final contribuinte, calcula responsabilidade informativa do destinatário (base única ou dupla configurada) sem preencher indevidamente ICMSUFDest. Revenda a contribuinte não gera DIFAL consumidor final. Simples/MEI não destaca DIFAL EC87 para não contribuinte. Operação interna permanece sem DIFAL mesmo quando o produto possui uma regra para venda interestadual.
- ICMS monofásico CST 02, 15, 53 e 61. Código ANP, conversão da unidade comercial, origens, mistura, diferimento e retenção. Alíquotas selecionadas pela data na tabela oficial importada (40 combustíveis, 151 períodos de alíquotas); divergência informada é bloqueada. NFC-e permite CST 61; os demais casos especiais usam NF-e.
- IBS/CBS CST 620, cClassTrib 620001/620002/620004/620005/620006: grupos próprios, retenção atual e anterior, métodos ad rem/ad valorem por tributo, diferença de biocombustível com índice oficial vigente. Anteriormente retido não é cobrado novamente. Alíquotas IBS/CBS não são inventadas: exigem parâmetro explícito, fundamento e vigência. Testes usam valores fictícios claramente identificados.
- Tabela oficial de 13 códigos de crédito presumido com indicadores, modelos e datas. Créditos de operação validados por classificação/fundamento, componente IBS/CBS, base por unidade, dedução IBS permitida, condição suspensiva e totalizadores separados. Cenários automatizados: bens móveis usados (04) e incentivo automotivo CBS (05). Código 06 segue o mesmo mecanismo, com classificação específica. Não há apropriação automática de crédito só porque um percentual foi preenchido.
- Prévia HTTP protegida retorna XML e resumo de impostos; não grava notas nem operações. Documento criado pela tela pode ser revisado em **Conferir impostos**. Total/pagamentos precisam corresponder ao valor efetivamente cobrado; IPI acrescido não altera uma venda já paga para forçar a conferência.

## Limites que continuam explícitos

Esta versão não significa cobertura irrestrita de todas as operações de todos os regimes. Permanecem bloqueados: solicitações de crédito por evento (211110 e outros eventos), notas específicas de transferência/ajuste de competência/ZFM, cClassTrib monofásicos 620003/620007, devolução de IPI, ICMS-ST novo e outras operações especiais ainda sem implementação validada. Uma operação bloqueada não é substituída por uma tributação genérica nem tem o imposto silenciosamente descartado.

O pacote local de evento 211110 encontrado usa leiaute antigo (gCredPres/vBC/gIBS/gCBS) e diverge do leiaute da NT 2025.002 v1.52 (gCredPresOper/vBCCredPres). Ele não foi usado para afirmar compatibilidade com o fluxo novo. Os créditos destinados a evento continuam com mensagem de bloqueio.

Não foi transmitida nota/evento real. Validação XSD confirma estrutura de infNFe e DPS, não assinatura, credenciamento, autorização SEFAZ ou habilitação a benefícios. Certificado A1, CSC, agente fiscal e homologação real por empresa continuam necessários. TIPI e benefícios individuais não são inferidos pelo NCM; enquadramento e alíquotas devem ser configurados conforme a operação.

## Fontes oficiais

- [Documentos NF-e / SVRS](https://dfe-portal.svrs.rs.gov.br/Nfe/Documentos): NT 2025.002 v1.52, IT 2025.002 v1.70, tabelas e esquemas. Arquivos importados possuem SHA-256 nos JSONs de referência.
- [Pacote de esquemas PL_010f](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=8ITFuBLltXs=).
- [DIFAL e tipos de base — Goiás](https://orientacaotributaria.economia.go.gov.br/spo-web/perguntasfrequentes/perguntafrequente/20489).
- [Simples e DIFAL — consulta SP 34088/2026](https://legislacao.fazenda.sp.gov.br/Paginas/RC34088_2026.aspx).
- [Resolução CGSN 140, compilada](https://normas.receita.fazenda.gov.br/sijut2consulta/normas.receisulta/link.action?idAto=92278&visao=compilado): destaque de tributos próprios do Simples.
- [MOC NF-e 7](https://hom.nfe.fazenda.gov.br/PORTAL/exibirArquivo.aspx?conteudo=DQFCIFUzszw%3D): composição e ordem dos grupos IPI/ICMSUFDest.

## Verificação

Testes executados em cópias/arquivos temporários e empresas fictícias, sem DATABASE_URL de produção. Incluem cálculos conhecidos, XML oficial, erros de configuração, vigências, CRT/modelo, preservação dos objetos recebidos, API HTTP, negação de acesso cruzado, hash dos arquivos de clientes fictícios, leitura/gravação dos controles da tela e regressão operacional. A comparação de dados reais antes/depois da implantação é somente de leitura e exclui logs de auditoria e tabelas oficiais compartilhadas.
