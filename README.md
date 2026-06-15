# Pegma Plus

Primeira base do projeto ERP moderno Pegma Plus, feita como aplicacao web com retaguarda, PDV, Central SaaS separada e API local inicial.

## Como abrir agora

Use preferencialmente com o servidor local, que executa a mesma aplicacao preparada para hospedagem:

```text
node server.js
```

Depois acesse:

```text
Sistema do cliente: http://localhost:4173
Central SaaS:        http://localhost:4173/central-saas.html
```

Tambem e possivel abrir direto os arquivos `index.html` e `central-saas.html`, mas nesse modo os dados ficam no armazenamento local do navegador. Com `node server.js`, a API grava a Central em `data/provider-state.json` e cada cliente em `data/tenants/<codigo-do-cliente>.json`.

Se o PowerShell bloquear `npm`, use `node server.js` diretamente.

## O que ja existe

- Login com selecao de usuario e empresa.
- Sistema do cliente separado da Central SaaS.
- Central SaaS em link proprio.
- API local inicial para clientes, licencas, contra-senha e estado do SaaS.
- Retaguarda separada do PDV.
- Painel com faturamento, contas e alerta automatico de estoque minimo.
- Painel com alertas de titulos atrasados, lotes vencendo e documentos fiscais pendentes.
- Cadastro de pessoas com busca de CEP via ViaCEP quando houver internet.
- Validacao de CPF/CNPJ, email, CEP, UF e bloqueio de documentos duplicados.
- Cadastro de produtos com abas para dados, impostos, composicao, grade/lote, promocao, balanca e tabelas.
- Validacao de codigo de barras, NCM, custos e composicao com custo automatico dos componentes.
- Estoque e producao com baixa automatica de materia-prima por composicao.
- Compras com leitura de XML, chave de acesso, conferencia de totais, estoque e financeiro.
- Vendas e orcamentos com varios itens e conversao de orcamento em pedido.
- PDV com resumo de fechamento por pagamentos, suprimentos, sangrias e diferenca.
- Contas a pagar, contas a receber e livro caixa.
- Financeiro com identificacao e totalizacao de titulos atrasados.
- Fiscal separado com fila de NF-e, NFC-e e NFS-e, tentativas, ultimo erro e reprocessamento.
- Relatorios previstos para produtos, vendas, financeiro e operacao.
- Indicador de prontidao para iniciar a implantacao com cliente piloto.
- Auditoria operacional, backup/restauracao e snapshot por cliente na Central SaaS.
- Controle de modulos contratados, bloqueio/liberacao de cliente e liberacao de terminais ativos.
- Service worker para cache offline quando executado via servidor local.
- ACBrLibNFe e ACBrLibNFSe executados em processos proprios dentro de `runtime/fiscal`, sem compartilhar arquivos ou processo com outros projetos.

## Decisao tecnica

Esta versao usa HTML, CSS e JavaScript no navegador e backend Node.js. O backend ja possui autenticacao, isolamento por cliente e suporte a PostgreSQL; sem `DATABASE_URL`, os arquivos JSON sao usados apenas como contingencia local de desenvolvimento.

## Motor fiscal isolado

Ao iniciar `node server.js`, o Pegma Plus inicia sob demanda sua propria copia do bridge ACBrLib:

```text
runtime/fiscal/ACBrLib/ACBrNFe64.dll
runtime/fiscal/ACBrLib/ACBrNFSe64.dll
runtime/fiscal/Bridge/ProdutoFiscal.AcbrLibBridge.exe
runtime/fiscal/ACBrLib/ACBrLib.ini
```

Schemas, XMLs, PDFs, logs e certificados tambem ficam sob `runtime/fiscal`. O arquivo de configuracao distribuido nao possui certificado nem senha de outro projeto.

O motor gratuito escolhido para homologacao e o Projeto ACBr com ACBrLib. NF-e/NFC-e sao geradas no leiaute 4.00 e seguem o fluxo real de carregar, assinar, validar e transmitir. O modulo tambem conecta consulta, inutilizacao, CC-e, distribuicao DF-e, manifestacao, contingencia NFC-e, cancelamento e PDF oficial. A NFS-e usa a ACBrLibNFSe separada, com configuracao por municipio/provedor e operacoes de emissao, consulta, cancelamento e DANFSe.

O sistema nao cria autorizacao, chave ou protocolo ficticio. A resposta somente e marcada como autorizada quando o motor fiscal retorna autorizacao/protocolo. A liberacao em producao ainda exige certificado, credenciamento, dados reais e homologacao aceita pela SEFAZ ou prefeitura.

Quando o backend SaaS estiver hospedado fora do Windows, configure em cada cliente a URL HTTPS e o token do agente fiscal Windows. O servidor valida `GET /health` e encaminha transmissao, cancelamento, consulta, inutilizacao, eventos, distribuicao DF-e, contingencia e documentos auxiliares ao agente. Respostas sem autorizacao ou protocolo nao sao aceitas como emissao concluida.

Inicie o agente separado na maquina Windows:

```text
PEGMA_AGENT_TOKEN=um-token-longo-e-seguro
npm run agent
```

O agente deve ficar protegido por HTTPS/VPN. Ele utiliza somente a copia ACBr deste projeto e nao compartilha processo com outros sistemas.

## Financeiro, relatorios e monitoramento

- O financeiro possui plano de contas, parcelas, baixa parcial com juros/desconto e conciliacao por conta.
- Relatorios podem ser exportados em CSV ou abertos para impressao/geracao de PDF pelo navegador.
- A Central SaaS permite redefinir senha de usuario, liberar terminais e acompanhar sessoes, backups e pendencias fiscais por cliente.
- Regras fiscais possuem vigencia e versao; sobreposicoes exigem confirmacao explicita.

## Persistencia e Central SaaS

- Sem `DATABASE_URL`, o servidor usa os arquivos locais somente como contingencia de desenvolvimento.
- Com `DATABASE_URL`, a Central fica no schema `public` e cada cliente recebe um schema PostgreSQL exclusivo `tenant_<codigo>`.
- Para os primeiros testes online, o PostgreSQL gratuito recomendado e o Neon Free: https://neon.com/pricing
- A migracao inicial dos JSON existentes pode ser executada com `npm run db:migrate`.
- A migracao inclui os arquivos XML, PDF, imagens e anexos armazenados por cliente.
- Depois da migracao, execute `npm run db:verify` para conferir clientes, schemas e quantidades das colecoes principais.
- Execute `npm run db:backup` com `PEGMA_BACKUP_DIR` apontando para um armazenamento externo.
- O servidor cria backups programados individuais e gerais da Central SaaS, inclui XMLs/PDFs fiscais, permite restauracao completa, aplica retencao configuravel e remove sessoes expiradas automaticamente.
- A Central SaaS monitora pendencias fiscais, titulos atrasados, estoque minimo, prontidao e periodo fechado.
- Auditorias da Central e dos clientes possuem hashes encadeados para indicar alteracoes indevidas.
- Periodos operacionais podem ser fechados em Configuracoes, bloqueando alteracoes retroativas em vendas, compras, financeiro, caixa e fiscal.
- A Central SaaS exige login administrativo, registra auditoria e nao envia senha-base de licenca ao navegador.
- Configure `PEGMA_CENTRAL_USER` e `PEGMA_CENTRAL_PASSWORD` antes da publicacao.

## Observacao fiscal importante

O sistema esta preparado conceitualmente para NF-e, NFC-e, NFS-e, DANFE, XML, certificado, contingencia e Reforma Tributaria, mas emissao fiscal real depende de:

- Credenciamento na SEFAZ e/ou prefeitura.
- Certificado digital A1/A3.
- Ambiente de homologacao e producao.
- Regras estaduais, municipais e federais.
- Notas tecnicas vigentes.
- Integracao com webservices oficiais ou provedor fiscal homologado.

Nenhum ERP deve transmitir documento fiscal real sem essa camada validada.

O diagnostico fiscal rejeita CNPJ de exemplo e exige IE/IM conforme os modelos utilizados, municipio, certificado, responsavel fiscal e CSC/ID CSC para NFC-e.

## Implantacao e recursos operacionais finais

- Execute `npm run deploy:check` antes de publicar. O comando exige PostgreSQL e credenciais reais.
- Instale o agente fiscal isolado como servico Windows com `scripts\install-fiscal-agent-service.ps1`.
- Atualize o agente preservando backup com `scripts\update-fiscal-agent.ps1 -SourcePath C:\caminho\versao-revisada`.
- Importe pacotes fiscais revisados e versionados com `npm run fiscal:rules:import -- caminho-do-pacote.json`.
- Devolucoes podem ser parciais ou totais; trocas geram credito aplicado na venda seguinte.
- O financeiro importa OFX e concilia automaticamente movimentos compativeis por data e valor.
- Estoque possui inventario por leitor, lotes, validade, producao, perdas, rendimento e saldos por deposito.
- PIX, boleto e alertas usam URLs e tokens reais configurados pelo cliente; nenhuma autorizacao e simulada.
