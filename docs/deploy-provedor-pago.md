# Deploy em provedor pago

Este checklist prepara o Tortela Plus para sair do dominio gratuito e operar em provedor pago com banco separado por franquia, Central enxergando a rede e emissao fiscal protegida.

## 1. Ambiente obrigatorio

- Servidor Node.js com HTTPS ativo.
- PostgreSQL gerenciado ou servidor PostgreSQL dedicado.
- Disco persistente ou storage externo para XML, PDF fiscal, anexos e backups.
- Dominio definitivo da unidade e da Central.
- Maquina Windows fiscal por unidade quando houver emissao NF-e, NFC-e, SAT/MFe ou ACBr local.

## 2. Variaveis obrigatorias

Configure no provedor:

```text
NODE_ENV=production
PEGMA_ENV=production-paid
PEGMA_REQUIRE_PAID_PROVIDER=true
DATABASE_URL=postgresql://usuario:senha@host:5432/tortelaplus
PGSSL=require
PEGMA_ALLOWED_ORIGINS=https://app.seudominio.com.br,https://central.seudominio.com.br
PEGMA_CENTRAL_USER=admin
PEGMA_CENTRAL_PASSWORD=<senha forte com 32+ caracteres>
PEGMA_SECRET_KEY=<chave forte com 32+ caracteres>
PEGMA_PUBLIC_LINK_SECRET=<chave forte com 32+ caracteres para totem/cozinha/telao>
PEGMA_PROVIDER_TOKEN=<token forte com 32+ caracteres>
PEGMA_BACKUP_DIR=<pasta persistente ou storage externo>
```

Para fiscal em nuvem:

```text
PEGMA_ACBR_AGENT_URL=https://agente-fiscal-da-unidade
PEGMA_ACBR_AGENT_TOKEN=<token forte por unidade>
```

## 3. Validacao antes de publicar

Rode:

```text
npm run deploy:check
npm run db:verify-isolation
```

O `deploy:check` precisa retornar `ready: true`. O `db:verify-isolation` confirma que os dados de uma franquia nao atravessam para outra.

Tambem valide no navegador:

```text
/api/health
/api/deployment/readiness
```

Na Central Tortela, abra a aba **Implantacao** para conferir o mesmo diagnostico em tela: modo do banco, PostgreSQL ativo, checks de seguranca e a base separada de cada unidade.

## 4. Sequencia de publicacao paga

1. Criar banco PostgreSQL no provedor.
2. Configurar as variaveis acima.
3. Migrar dados locais, quando houver:

```text
npm run db:migrate
npm run db:verify
npm run db:verify-isolation
```

4. Subir a aplicacao em plano pago com HTTPS.
5. Conferir `/api/deployment/readiness`.
6. Testar login da Central, login da unidade e cadastro de cliente.
7. Testar pedido online, baixa de estoque e fila de cozinha.
8. Testar fiscal em homologacao antes de producao.
9. Ativar rotina de backup e restauracao.

## 5. Seguranca e LGPD aplicada

- Isolamento por schema PostgreSQL por franquia para reduzir risco de mistura de dados.
- Segredos fora do codigo por variaveis de ambiente.
- `PEGMA_SECRET_KEY` para criptografar senha de certificado e CSC fiscal.
- `PEGMA_PUBLIC_LINK_SECRET` para gerar tokens de unidade nos links de totem, cozinha e telao.
- Headers de seguranca: `nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` e origem HTTP controlada.
- Cadastro publico exige consentimento do cliente antes de gravar dados.
- Auditoria operacional e backups para rastreabilidade.

Base LGPD observada no sistema:

- Art. 6, I: finalidade, com dados usados para venda, entrega, fiscal, financeiro e relacionamento.
- Art. 6, III: minimizacao, com coleta apenas dos campos necessarios para cadastro, fiscal e entrega.
- Art. 6, VII: seguranca, com segregacao por franquia, controle de acesso e segredos protegidos.
- Art. 7, I: consentimento no cadastro publico do cliente.
- Art. 46: medidas tecnicas e administrativas para proteger dados pessoais.

## 6. O que fica para a etapa no provedor pago

- Apontar dominio final.
- Colocar certificados HTTPS e fiscal reais.
- Testar pagamento real de cartao, debito e PIX com credenciais do adquirente.
- Executar homologacao SEFAZ/prefeitura por CNPJ.
- Validar restore de backup com dados reais controlados.
