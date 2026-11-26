# Deploy da SHTECH

```
Visitante ──► Vercel (client: React)  ──fetch──►  Render (server: API + SQLite)
              shtech.vercel.app                    shtech-api.onrender.com
```

A Vercel só hospeda o **front**. A API fica no Render porque precisa de um
disco para o banco SQLite (a Vercel apaga arquivos a cada execução).

## 0. Antes de tudo: verificação de segurança

```bash
node tools/security-check.mjs
```

Só suba com **0 falha(s)**.

## 1. Senha do admin (no seu PC)

```bash
cd server
npm run hash-senha        # digita a senha escondida → grava o HASH no server/.env
```

A senha **não fica salva em lugar nenhum**: só o hash (scrypt) vai para o `.env`.
Para trocar a senha, é só rodar de novo.

## 2. API no Render

1. render.com → **New → Blueprint** → escolha o repositório (ele lê o `render.yaml`).
2. Em **Environment**, preencha, copiando do seu `server/.env`:
   - `ADMIN_PASSWORD_HASH` → o valor **sem as aspas simples**
   - `SESSION_SECRET` → idem
   - `CORS_ORIGIN` → o endereço do site na Vercel, ex.: `https://shtech.vercel.app`
     (mais de um? separe por vírgula, ex.: `https://shtech.vercel.app,https://www.shtech.com.br`)
3. Deploy. Teste: `https://SEU-APP.onrender.com/api/health` → `{"ok":true}`

> Com `NODE_ENV=production`, a API **se recusa a subir** se faltar o hash, o
> secret, ou se o CORS estiver aberto. É de propósito.

## 3. Front na Vercel

1. vercel.com → **Add New → Project** → importe o repositório.
2. **Root Directory:** `client` (o resto a Vercel detecta pelo `vercel.json`).
3. **Environment Variables:**
   - `VITE_API_URL` = `https://SEU-APP.onrender.com/api`
4. Deploy.

> Tudo que começa com `VITE_` fica **público** no navegador. Nunca coloque
> senha, hash ou secret numa variável `VITE_`.

## 4. Conferir em produção

```bash
node tools/security-check.mjs --live https://SEU-APP.onrender.com
```

Testa se as rotas de escrita recusam acesso sem login, se o CORS barra outros
sites, se o token falso é recusado e se os cabeçalhos de segurança estão lá.

## O que está protegido

| Camada | Proteção |
|---|---|
| Senha | Hash scrypt (salt + custo alto) no `.env`; comparação em tempo constante |
| Login | Token assinado (HMAC-SHA256), expira em 8h, fica no `sessionStorage` |
| Força bruta | 5 senhas erradas → IP bloqueado por 15 min |
| API | POST/PATCH/DELETE/reset só com token; GET público (o site precisa) |
| Dados | SQL só com parâmetros; links validados (bloqueia `javascript:`); cores validadas; corpo ≤ 100 kb |
| CORS | Só os endereços em `CORS_ORIGIN` |
| Cabeçalhos | CSP, X-Frame-Options, nosniff, HSTS, Referrer-Policy (API e Vercel) |
| Build | Sem sourcemaps; admin carregado à parte (lazy) |
