# Gerador de sites demo

Painel para montar, em minutos, uma prévia do site de um cliente (oficina, barbearia, salão, clínica, estética, pet shop, academia) com **agendamento online**, e mandar o link para ele ver.

- **`/`**: painel protegido por senha. Você preenche os dados do cliente (ou usa **Repaginar com IA**) e vê o site ao vivo no computador e no celular.
- **`/site?d=...`**: link público da prévia, para enviar ao cliente. Toda a configuração fica dentro do próprio link; nada é gravado em banco de dados.
- **Repaginar com IA**: cole o link do site antigo ou do Instagram do cliente. O Claude lê a página, pesquisa o negócio na web e preenche nome, contato, horários, serviços, cores e textos novos.

O agendamento da prévia é simulado: mostra horários livres e ocupados e termina com a confirmação pelo WhatsApp do negócio, mas não grava reservas.

## Publicar na Vercel

1. Em vercel.com, **Add New → Project** e importe este repositório (a Vercel detecta Next.js sozinha).
2. Em **Environment Variables**, cadastre:
   - `DEMO_PASSWORD`: a senha de acesso ao painel.
   - `ANTHROPIC_API_KEY`: chave da API da Anthropic (console.anthropic.com), usada pela IA. Cada importação tem um custo pequeno na sua conta da Anthropic.
3. **Deploy.**

## Aviso "Site perigoso" no Chrome

Endereços novos em `*.vercel.app` com tela de senha às vezes são marcados por engano pelo Google Safe Browsing. Para pedir a revisão:

1. Em search.google.com/search-console, adicione a propriedade do tipo **Prefixo do URL** com o endereço de produção do site.
2. Escolha verificar por **Tag HTML**, copie só o valor de `content` e cadastre na Vercel como `GOOGLE_SITE_VERIFICATION`. Faça um novo deploy e clique em **Verificar**.
3. Em **Segurança e ações manuais → Problemas de segurança**, clique em **Solicitar revisão**.

Também é possível avisar o erro em safebrowsing.google.com/safebrowsing/report_error. Um domínio próprio (ex.: `demos.seudominio.com.br`) evita que o problema volte.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha a senha e a chave
npm run dev
```
