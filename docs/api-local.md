# API local inicial

Esta API existe para aproximar o prototipo do modelo SaaS final. Ela roda com:

```text
node server.js
```

## Links

```text
Sistema do cliente: http://localhost:4173
Central SaaS:        http://localhost:4173/central-saas.html
Saude da API:        http://localhost:4173/api/health
```

## Persistencia

Os dados sao gravados em:

```text
data/provider-state.json
data/tenants/<codigo-do-cliente>.json
data/storage/<codigo-do-cliente>/<categoria>/<arquivo>
```

O diretorio do banco local pode ser alterado por variavel de ambiente:

```text
PEGMA_DB_DIR=C:\pegmaplus-data
```

Se `DATABASE_URL` existir no ambiente, a API sinaliza `external-database-configured` no `/api/health`. A ligacao com Postgres/MySQL real deve usar a mesma camada de persistencia, mantendo banco central separado dos bancos dos clientes.

No produto final, esse arquivo sera substituido por:

- banco central do provedor;
- banco separado por cliente;
- auditoria de login, licenca, terminais e alteracoes.

O arquivo antigo `data/app-state.json` fica apenas como migracao local se ja existir. O servidor le esse arquivo uma vez e cria a estrutura separada.

## Endpoints iniciais

- `GET /api/health`: verifica se a API esta ativa.
- `GET /api/provider`: retorna somente dados da Central SaaS.
- `POST /api/provider`: grava somente dados da Central SaaS.
- `GET /api/tenant/<codigo-do-cliente>/state`: retorna a base operacional isolada de um cliente.
- `POST /api/tenant/<codigo-do-cliente>/state`: grava a base operacional isolada de um cliente.
- `GET /api/tenants`: lista clientes SaaS.
- `POST /api/tenants`: cadastra cliente SaaS.
- `POST /api/auth/login`: valida cliente na Central SaaS, cria sessao e ocupa um terminal.
- `POST /api/auth/ping`: mantem a sessao ativa enquanto o sistema esta aberto.
- `POST /api/auth/logout`: encerra sessao e libera o terminal.
- `POST /api/tenant/<codigo-do-cliente>/users`: cadastra usuario do cliente com senha em hash e perfil de permissao.
- `POST /api/tenant/<codigo-do-cliente>/files`: armazena foto, XML, DANFE ou anexo no espaco isolado do cliente.
- `POST /api/tenant/<codigo-do-cliente>/fiscal/transmit`: envia documento para o adaptador fiscal.
- `POST /api/tenant/<codigo-do-cliente>/fiscal/cancel`: cancela documento no adaptador fiscal.
- `GET /api/tenant/<codigo-do-cliente>/fiscal/provider-status`: valida a prontidao do provedor, certificado e dados fiscais.
- `POST /api/licenses/counter`: gera contra-senha.
- `POST /api/licenses/expire`: simula vencimento de licenca.
- `POST /api/licenses/redeem`: valida contra-senha e renova licenca.

Os endpoints antigos `GET /api/state` e `POST /api/state` continuam apenas por compatibilidade temporaria com prototipos anteriores.

## Observacao

As rotas operacionais do cliente exigem sessao Bearer gerada no login. A Central SaaS pode exigir token de provedor quando a variavel `PEGMA_PROVIDER_TOKEN` estiver configurada.

Exemplo:

```text
Authorization: Bearer <sessionId>
X-Provider-Token: <token-do-provedor>
```

## Usuarios e permissoes

Cada cliente possui seus usuarios dentro da propria base isolada. A senha nao e salva em texto puro; a API grava `passwordHash` usando PBKDF2. O sistema do cliente recebe apenas dados publicos do usuario, sem o hash.

Perfis iniciais:

- Administrador
- Gerente
- Caixa
- Fiscal
- Financeiro
- Estoque
- Vendedor

Cada usuario pode receber permissoes personalizadas. O backend valida essas permissoes na sessao, portanto ocultar um menu no navegador nao e a unica protecao.

## Migracao PostgreSQL

Com `DATABASE_URL` configurada:

```text
npm run db:migrate
npm run db:verify
```

A verificacao confirma a Central, o schema exclusivo de cada cliente e as quantidades das colecoes principais, evitando mistura de dados.

## Arquivos

O upload usa JSON com conteudo em `data:` URL ou base64:

```json
{
  "category": "produtos",
  "filename": "foto.jpg",
  "mimeType": "image/jpeg",
  "content": "data:image/jpeg;base64,..."
}
```

A API retorna uma URL local:

```text
/storage/<cliente>/<categoria>/<arquivo>
```

No SaaS real, essa camada deve ir para armazenamento de objetos, por exemplo S3, Azure Blob, Cloudflare R2 ou storage do proprio provedor.

## Adaptador fiscal

A transmissao fiscal passa pelo endpoint:

```text
POST /api/tenant/<codigo-do-cliente>/fiscal/transmit
```

O motor fiscal definido para o Pegma Plus e o Projeto ACBr. O servidor conecta ao ACBrMonitor por TCP para diagnosticar disponibilidade e executar comandos fiscais.

Variaveis previstas:

```text
PEGMA_ACBR_HOST=127.0.0.1
PEGMA_ACBR_PORT=3436
```

Se o ACBrMonitor estiver indisponivel, a transmissao e bloqueada com erro claro. O sistema nao gera mais protocolo ficticio como se fosse autorizacao.

Para producao fiscal real ainda e obrigatorio instalar e configurar ACBrMonitor/ACBrLib no servidor fiscal, certificado digital, assinatura XML, homologacao por UF/municipio e rotinas de eventos.

### Motor fiscal ACBr

O cadastro inicial utiliza `ACBrLib` como motor fiscal gratuito de homologacao, executado de forma isolada pelo bridge do Pegma Plus. `ACBrMonitor` permanece como alternativa configuravel.

O motor local padrao e uma copia isolada da ACBrLibNFe em `runtime/fiscal`. O servidor inicia o bridge como processo separado e informa seu PID no endpoint `provider-status`.

Campos configuraveis:

- motor fiscal ACBr;
- host e porta apenas quando for usado ACBrMonitor externo;
- certificado, credenciamento e configuracao dos autorizadores reais;
- certificado A1 e validade;
- responsavel fiscal;
- ambiente de homologacao ou producao.

Sem ACBr conectado e certificado real, a transmissao fica bloqueada e nao declara autorizacao oficial. O endpoint `provider-status` informa exatamente o que falta antes de transmitir com credenciais reais.

## NFS-e separada de NF-e/NFC-e

A NFS-e possui tela propria no modulo Fiscal. Ela nao deve ser tratada como NF-e de mercadoria, porque exige campos especificos de servico:

- municipio de prestacao e codigo IBGE;
- item da lista de servicos da LC 116;
- codigo municipal do servico;
- NBS quando aplicavel;
- CNAE;
- ISS, retencao de ISS e exigibilidade;
- discriminacao do servico;
- DANFSe, nao DANFE.

O XML local inclui esses dados para homologacao interna. Para producao, a integracao deve validar o leiaute contra a documentacao tecnica vigente do Portal Nacional NFS-e, XSDs, anexos de dominio, regras municipais e notas tecnicas publicadas.

## Parametrizacao fiscal

As regras fiscais ficam em `state.fiscalRules`, separadas por cliente. Cada regra considera regime tributario, UF, municipio, modelo fiscal, operacao, CFOP, CST/CSOSN, NCM, CEST, origem, PIS/COFINS, ICMS, FCP, MVA, classificacoes IBS/CBS, IBS por UF e municipio, CBS federal, credito presumido, reducao de base, ano de transicao, imposto seletivo, servico municipal e vigencia.

O sistema seleciona a regra ativa pela combinacao:

```text
modelo + regime + UF + vigencia
```

No ambiente real, essas regras precisam ser revisadas por contador ou consultoria fiscal por UF, municipio, ramo de atividade, NCM/servico e enquadramento da empresa.

## PDV e caixa

O PDV agora trabalha com abertura e fechamento de caixa, sangria, suprimento, venda em espera, recuperacao de venda e multiplas formas de pagamento:

- Dinheiro
- PIX
- Cartao debito
- Cartao credito
- Crediario

As entradas e saidas financeiras sao gravadas em `state.cash`. Vendas no crediario geram contas a receber em aberto. Cada venda PDV gera uma NFC-e em fila fiscal, pronta para transmissao pelo adaptador.
