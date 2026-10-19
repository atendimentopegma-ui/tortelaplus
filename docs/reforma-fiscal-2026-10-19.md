# Revisão fiscal — 19/10/2026

Esta revisão foi ampliada pela versão MULTI. Consulte [Suporte a múltiplas empresas e regimes](suporte-regimes-tributarios.md) para os CRT 1/2/3/4, ICMS-ST anteriormente retido, FCP, diferimento do ICMS e as limitações atuais. O texto abaixo registra a primeira etapa da revisão.

Esta versão corrige os quatro erros reproduzidos na auditoria: diferimento indevido no CST 000, precedência incorreta da CBS do produto, bases de ICMS/PIS/COFINS sem desconto e alíquotas estaduais/municipais incorretas em 2027. A conferência dos totalizadores utiliza a soma independente dos itens. O preço de venda em 2027 é tratado como inclusivo de IBS/CBS; esses tributos não são somados novamente ao total cobrado.

## Campos e regras

- Tabela oficial IT 2025.002 v1.70: 18 CST e 173 classificações, modelos, vigências e indicadores. As datas vêm da planilha oficial, com origem e SHA-256 registrados. O servidor não aceita substituir a tabela canônica por uma versão enviada pelo navegador.
- Reduções IBS e CBS separadas; diferimentos IBS UF, IBS municipal e CBS separados. Grupos obrigatórios são gerados mesmo quando seu percentual é zero; grupos proibidos pelo CST são rejeitados.
- Ano de vigência da CBS explícito: uma alíquota de 2026 não é prorrogada automaticamente para 2027. As taxas futuras devem ser confirmadas com a legislação aplicável.
- Finalidade, chave e número do item original na devolução; CFOP de entrada validado. Após a ativação, a referência é por item. Sem pagamento usa código 90 e valor zero.
- Campos opcionais de preço líquido, transação vinculada, CNPJ do recebedor e CNPJ base do PSP. Split usa o subconjunto oficial IT 2026.001 v1.01: 15, 17, 18, 20, 23, 24. IDs duplicados são rejeitados.
- DPS nacional 1.01: código nacional do serviço, CST/cClassTrib, cIndOp, endereço exigido pela operação e diferimentos. Tabela oficial de 26 indicadores de operação incorporada.
- Prévia protegida no servidor valida e gera o XML antes de inserir o documento na fila. A prévia não grava venda nem documento fiscal.

## Limites que permanecem bloqueados

Não é uma certificação universal de conformidade. O emissor de varejo não transmite enquadramentos especiais sem implementação validada: monofasia, crédito presumido, transferência/estorno de créditos, ajustes, compras governamentais, notas de crédito/débito, Imposto Seletivo, CRT 2/4, ICMS-ST e operações interestaduais com DIFAL. NFS-e municipal e situações especiais do ISS exigem o emissor do município. Os campos que já existiam para esses regimes não serão ignorados silenciosamente.

O pacote oficial NF-e disponível nesta revisão é PL_010f_v1.04, de 31/08/2026. Ele contém vItem e DFeReferenciado, mas ainda não contém os campos opcionais de preços líquidos e gPgtoVinc. Esses campos podem ser preparados na prévia, porém sua transmissão fica bloqueada até a atualização oficial dos esquemas e do agente ACBr. O evento 110300 também permanece bloqueado sem o esquema específico instalado. A disponibilização da especificação não é prova de homologação do agente.

As datas de ativação das alterações NT 2025.002 v1.52 / 2026.008 são 26/10/2026 em homologação e 16/11/2026 em produção, conforme aviso do Portal NF-e de 05/10/2026. A obrigação legal de informar tributos é separada da ativação da rejeição UB12-10, ainda futura em produção. Nenhuma transmissão real foi executada nesta revisão.

## Verificação

17 grupos da suíte operacional, incluindo caixa diário, PDV, permissões, estoque, financeiro e navegação. A suíte fiscal inclui 17 cenários de sucesso e rejeição, os quatro defeitos originais, adulteração de total, vigência, devolução, split, esquemas incompatíveis e arredondamento por item.

Validação XSD oficial do conteúdo infNFe para NF-e e NFC-e, incluindo redução, diferimento e isenção; DPS nacional validada integralmente sem assinatura. Assinatura, QR Code assinado, DANFE e autorização SEFAZ não são comprovados por esses testes e exigem homologação com o agente, A1, CSC e credenciamento reais. Não foram criadas vendas de teste em produção. Os produtos importados com NCM ou classificação pendentes continuam exigindo revisão tributária; nenhuma classificação foi inventada.

## Fontes oficiais

- [Tabelas e notas técnicas SVRS](https://dfe-portal.svrs.rs.gov.br/Nfe/Documentos)
- [Ativação prorrogada — Portal NF-e](https://www.nfe.fazenda.gov.br/portal/informe.aspx?AspxAutoDetectCookieSupport=1&Informe=p51cQJEX57A%3D&ehCTG=false)
- [Pacote oficial PL_010f](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=8ITFuBLltXs=)
- [Tabela split payment IT 2026.001](https://dfe-portal.svrs.rs.gov.br/Dfe/Documentos)
- [NFS-e nacional RTC](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc)
- [Esquemas NFS-e RTC](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/producao-restrita/esquemas-nfse-rtc-v1-01-20260727.zip)
