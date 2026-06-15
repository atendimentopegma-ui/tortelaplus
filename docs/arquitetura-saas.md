# Arquitetura SaaS do Pegma Plus

## Objetivo

O Pegma Plus deve funcionar como sistema online hospedado pelo provedor. O cliente acessa pelo navegador com login e senha, sem instalacao local obrigatoria. A central do provedor cria clientes, libera usuarios, define quantidade de terminais e controla bloqueio/liberacao.

A central do provedor deve ter acesso separado do sistema do cliente. No prototipo local:

```text
central-saas.html
```

No produto real:

```text
https://central.pegmaplus.com.br
```

O cliente acessa outro endereco:

```text
https://app.pegmaplus.com.br
```

## Central do provedor

A central deve permitir:

- Cadastrar cliente/empresa.
- Definir CNPJ/CPF, nome fantasia, UF, municipio e regime tributario.
- Criar login administrador do cliente.
- Definir plano contratado.
- Definir quantidade maxima de terminais simultaneos.
- Bloquear, liberar, suspender ou cancelar cliente.
- Ver terminais ativos, ultimo acesso, IP, navegador/dispositivo e usuario.
- Resetar senha e forcar desconexao de terminal.
- Controlar modulos liberados: PDV, NF-e, NFC-e, NFS-e, estoque, financeiro, multiempresa, relatorios.

## Isolamento de dados

Os bancos de dados dos clientes nao podem se misturar. Existem duas formas seguras:

1. Banco separado por cliente
   - Melhor isolamento.
   - Mais simples para backup/restauracao individual.
   - Ideal para ERP fiscal e financeiro.

2. Mesmo banco com schema separado por cliente
   - Tambem seguro se bem implementado.
   - Exige cuidado maior em toda consulta.

Para este projeto, a recomendacao inicial e **banco separado por cliente**.

No prototipo local essa separacao ja foi aplicada em arquivos fisicos diferentes:

```text
data/provider-state.json
data/tenants/cliente-exemplo.json
data/tenants/<codigo-do-cliente>.json
```

O arquivo `provider-state.json` guarda apenas dados da central: clientes, planos, limite de terminais, status e licencas. Os arquivos dentro de `data/tenants` guardam somente a operacao daquele cliente: pessoas, produtos, estoque, vendas, compras, financeiro, fiscal e configuracoes da empresa.

Endpoints locais usados:

```text
GET  /api/provider
POST /api/provider
GET  /api/tenant/<codigo-do-cliente>/state
POST /api/tenant/<codigo-do-cliente>/state
```

No produto em nuvem, esses arquivos devem ser substituidos por bancos separados por cliente, mantendo a mesma regra: a Central SaaS nao grava dados operacionais do cliente, e o sistema do cliente nao grava cadastro/licenca global do provedor.

## Login e limite de terminais

Ao fazer login:

1. Usuario informa codigo do cliente, usuario e senha.
2. Central valida se o cliente esta ativo.
3. Central valida o plano e modulos liberados.
4. Central verifica terminais ativos.
5. Se o limite foi atingido, bloqueia novo acesso ou solicita liberar um terminal.
6. Sistema entrega ao navegador somente os dados daquele cliente.

No prototipo local, esse controle ja existe na API:

```text
POST /api/auth/login
POST /api/auth/ping
POST /api/auth/logout
```

O login ocupa um terminal do cliente, respeitando `maxTerminals`. O logout libera esse terminal. Enquanto o sistema esta aberto, o navegador envia um ping periodico para manter a sessao viva. Sessoes antigas sem atividade expiram automaticamente para evitar bloqueio permanente quando um computador e desligado incorretamente.

## Contra-senha de licenca

O sistema deve ter controle de licenca por prazo definido pelo provedor.

Fluxo previsto:

1. Na Central SaaS, o provedor define para cada cliente:
   - senha-base da licenca;
   - prazo de renovacao, por exemplo 30, 45, 60 ou 90 dias;
   - quantidade de terminais;
   - status do contrato.
2. Quando a licenca vence, o sistema do cliente bloqueia a operacao e exibe uma senha/desafio.
3. O cliente informa essa senha/desafio ao provedor.
4. O provedor entra na Central SaaS, seleciona o cliente, digita a senha/desafio e gera a contra-senha.
5. O cliente digita a contra-senha no sistema.
6. Se a contra-senha for valida, o sistema volta a funcionar pelo prazo determinado.

No produto final, a contra-senha deve ser gerada no backend da Central SaaS, com algoritmo seguro, auditoria, data/hora, usuario do provedor, cliente, terminal e IP.

Regras importantes:

- A contra-senha deve valer apenas para aquele cliente e aquele desafio.
- A senha-base nunca deve ser exibida para o cliente.
- O sistema deve registrar toda liberacao.
- A liberacao nao pode misturar dados de clientes.
- O provedor deve poder revogar ou bloquear uma licenca mesmo antes do vencimento.

## Sem instalar no cliente

O cliente deve acessar por URL, por exemplo:

```text
https://app.pegmaplus.com.br
```

Pode ser instalado como PWA opcional no computador ou tablet, mas sem instalador obrigatorio. O PDV pode funcionar offline no navegador e sincronizar quando a internet voltar.

## Offline com seguranca

- O PDV armazena vendas locais em fila quando sem internet.
- A fila pertence ao cliente e ao terminal autenticado.
- Quando a internet volta, sincroniza com o banco do cliente.
- Documento fiscal em contingencia deve seguir regra da UF e do tipo de documento.

## Camadas recomendadas

- Frontend web/PWA: interface da retaguarda e PDV.
- API central: login, clientes, licencas, terminais e permissoes.
- API do cliente: operacao ERP, estoque, financeiro, vendas, compras e fiscal.
- Banco central: clientes, planos, usuarios provedores, licencas e auditoria.
- Banco por cliente: dados operacionais, fiscais e financeiros de cada cliente.
- Servico fiscal: NF-e, NFC-e, NFS-e, certificado, XML, DANFE, contingencia e eventos.

## Regra principal

Toda operacao deve carregar um `tenantId` validado pela central. Nenhuma consulta ou gravacao pode ocorrer sem o contexto do cliente autenticado.
