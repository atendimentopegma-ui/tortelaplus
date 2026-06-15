# Implantacao dos passos 1 a 15

## Provedores escolhidos para a fase gratuita

- Aplicacao e Central SaaS: Render Free, usando os dois servicos definidos em `render.yaml`.
- PostgreSQL: Neon Free, pois nao possui limite de tempo e atende os testes iniciais.
- PIX e boleto: API real configuravel. Para o piloto, a primeira opcao indicada e Mercado Pago.
- WhatsApp: WhatsApp Cloud API oficial da Meta.
- Agente fiscal: Windows deste projeto, com ACBr isolado e inicializacao automatica.

## Situacao

1. Hospedagem escolhida: Render Free. Estrutura pronta.
2. Banco escolhido: Neon Free. Depende da criacao da conta e da `DATABASE_URL`.
3. URLs separadas: prontas no `render.yaml`; serao geradas pelo Render na publicacao.
4. Migracao: pronta por `npm run db:migrate`; depende da `DATABASE_URL`.
5. Agente fiscal Windows: instalado para iniciar com o Windows.
6. Acesso remoto do agente: deve usar HTTPS/VPN e depende da conta/rede escolhida.
7. Dados reais da empresa: campos prontos; preenchimento depende do titular.
8. Certificado A1: cofre criptografado pronto; certificado e senha dependem do titular.
9. SEFAZ, CSC e ID CSC: campos e validacoes prontos; dados dependem do credenciamento.
10. NFS-e: configuracao municipal/nacional pronta; dados dependem do municipio/provedor.
11. Homologacao fiscal: motores e fluxos prontos; emissao depende dos dados dos itens 7 a 10.
12. Equipamentos: configuracao serial e impressao pronta; validacao depende dos modelos fisicos.
13. PIX, boleto e WhatsApp: conectores reais configuraveis prontos; dependem das credenciais.
14. Regras fiscais e Reforma Tributaria: pacote versionado pronto; validacao depende do contador.
15. Cliente piloto: base tecnica pronta; teste real depende dos dados, equipamentos e credenciais.

## Publicacao

1. Criar conta no Neon e copiar a URL PostgreSQL para `DATABASE_URL`.
2. Criar um repositorio privado e enviar a pasta do projeto.
3. No Render, criar um Blueprint usando `render.yaml`.
4. Informar as mesmas credenciais e chaves nos dois servicos.
5. Executar `npm run db:migrate` e depois `npm run db:verify`.
6. Executar `npm run implantation:status` para conferir pendencias.

O arquivo `.env.production` foi gerado com senhas fortes. Ele nao deve ser enviado ao repositorio.
