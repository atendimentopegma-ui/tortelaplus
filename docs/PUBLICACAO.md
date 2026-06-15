# Publicacao do Pegma Plus

## Aplicacao web e banco

1. Crie um PostgreSQL e configure `DATABASE_URL`.
2. Configure `PEGMA_SECRET_KEY`, `PEGMA_CENTRAL_USER` e `PEGMA_CENTRAL_PASSWORD`.
3. Execute `npm run db:migrate` para migrar a base local existente.
4. Execute `npm run db:verify` para conferir os schemas isolados.
5. Publique o servico Node usando `node server.js` ou o `Dockerfile`.
6. Use o `render.yaml` para publicar a aplicacao e a Central SaaS em URLs separadas com HTTPS.
7. Configure uma rotina externa para `npm run db:backup`.

## Motor fiscal

O ACBrLib utilizado pelo projeto exige Windows. Na hospedagem web, mantenha um agente fiscal Windows privado conectado ao servidor e nunca exponha diretamente a porta do ACBr na internet.

Inicie o agente com `npm run agent`, configure `PEGMA_AGENT_TOKEN` e publique-o somente por HTTPS/VPN. Nas configuracoes de cada cliente, grave a URL e o mesmo token no cofre fiscal.

O agente atende NF-e, NFC-e, NFS-e, cancelamento, consulta, inutilizacao, eventos, distribuicao DF-e, contingencia e DANFE/DANFCE/DANFSe.

## Antes de producao

- Trocar todas as senhas iniciais.
- Configurar certificado A1 e segredos fiscais.
- Configurar credenciamento SEFAZ, CSC e provedores municipais.
- Definir `PEGMA_SESSION_TTL_MINUTES`.
- Confirmar backup do PostgreSQL no provedor contratado.
- Validar emissao em homologacao antes de alterar o ambiente para producao.
