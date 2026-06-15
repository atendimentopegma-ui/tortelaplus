# Implantacao do Pegma Plus

## Objetivo

Este roteiro prepara o Pegma Plus para sair do prototipo local e virar SaaS hospedado, com Central do provedor separada do sistema do cliente.

## Passos obrigatorios

1. Publicar dois dominios:
   - `app.pegmaplus.com.br` para clientes.
   - `central.pegmaplus.com.br` para o provedor.
2. Substituir arquivos JSON por banco de dados real.
   - Banco central para clientes, planos, licencas, terminais e usuarios do provedor.
   - Banco separado por cliente para operacao ERP.
3. Colocar autenticacao em backend com token seguro, expiracao e permissao por perfil.
4. Criar armazenamento de arquivos para fotos de produtos, XML, DANFE, backups e anexos.
5. Contratar ou implementar servico fiscal homologado:
   - NF-e modelo 55.
   - NFC-e modelo 65.
   - NFS-e por municipio ou padrao nacional quando aplicavel.
6. Implementar certificado digital A1/A3 por empresa.
7. Parametrizar regras fiscais por UF, regime, CFOP, CST/CSOSN, NCM, IBS, CBS e vigencia.
8. Implantar rotina de backup automatico por cliente.
9. Implantar monitoramento:
   - API online.
   - Erros fiscais.
   - Fila offline.
   - Terminais ativos.
   - Licencas vencendo.
10. Homologar cada UF/municipio antes de liberar emissao em producao.

## Regra de seguranca

Nenhuma consulta operacional pode acontecer sem tenant validado. Cada cliente deve acessar apenas o proprio banco.

## Estado atual

No prototipo local, a separacao ja esta simulada em:

```text
data/provider-state.json
data/tenants/<codigo-do-cliente>.json
```

O servidor local expõe:

```text
http://localhost:4173
http://localhost:4173/central-saas.html
```

## Hospedagem inicial gratuita

Para os primeiros ajustes online, use:

1. **Neon Free** para PostgreSQL. Crie o banco e copie a connection string para `DATABASE_URL`.
2. **Render Free** para a API/web. O arquivo `render.yaml` ja declara o servico e as variaveis obrigatorias.
3. Configure no Render: `DATABASE_URL`, `PEGMA_SECRET_KEY`, `PEGMA_CENTRAL_USER` e `PEGMA_CENTRAL_PASSWORD`.
4. Execute `npm run db:migrate` uma vez com a `DATABASE_URL` configurada.
5. Valide em `/api/health` se a persistencia aparece como `postgresql-schema-per-tenant`.

O cadastro da conta e a publicacao exigem o login do proprietario no Neon, Render e repositorio Git. Esses acessos nao podem ser criados automaticamente pelo projeto.

## Servico fiscal na hospedagem

O ACBrLib incluido usa DLLs Windows e nao executa dentro do Render Linux. A aplicacao web pode ficar no Render, mas a emissao real deve chamar um servico fiscal Windows privado com ACBr, certificado e acesso aos webservices oficiais. Nunca exponha diretamente a porta do ACBrMonitor na internet.
