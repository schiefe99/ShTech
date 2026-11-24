# server — API da SHTECH (Node + Express + SQLite)

## Rodar

```bash
cd server
npm install
npm run dev      # sobe em http://localhost:3001 e reinicia ao salvar
```

Na primeira vez o banco (`shtech.db`) é criado e populado com os seeds do front.
Para apagar tudo e recarregar os seeds: `npm run seed`.

Deixe **dois terminais** abertos: um com `server` (`npm run dev`) e outro com `client` (`npm run dev`).

## Estrutura

```
src/
├── index.js                    → sobe o Express, registra rotas e trata erros
├── db.js                       → abre o SQLite e aplica o schema
├── schema.sql                  → as tabelas
├── seed.js                     → popula o banco com client/src/data/*.seed.js
├── repositories/
│   ├── createRepository.js     → fábrica: o ÚNICO lugar com SQL
│   └── index.js                → repositórios de cada tabela (+ falas)
└── routes/
    └── createCrudRouter.js     → fábrica: as 5 rotas REST + validação
```

Caminho de uma requisição: `fetch (front) → rota (valida) → repositório (SQL) → SQLite`.

## Rotas

| Método | Rota                         | O que faz                     | Resposta |
| ------ | ---------------------------- | ----------------------------- | -------- |
| GET    | /api/characters              | lista (com as falas)          | 200      |
| GET    | /api/characters/:id          | busca um                      | 200/404  |
| POST   | /api/characters              | cria                          | 201/400/409 |
| PATCH  | /api/characters/:id          | atualiza só os campos enviados | 200/400/404 |
| DELETE | /api/characters/:id          | apaga (falas e demos juntas)  | 204/404  |

O mesmo vale para `/api/demos` (filtro: `?characterId=luma`) e `/api/plans`.
Extras: `GET /api/health` e `POST /api/reset` (volta para o seed).

## Testar sem o front

No terminal (PowerShell):

```powershell
curl.exe http://localhost:3001/api/demos?characterId=kart
curl.exe -X PATCH -H "Content-Type: application/json" -d '{\"price\":197}' http://localhost:3001/api/plans/assinatura
```

Ou instale a extensão **Thunder Client** / **REST Client** no VS Code.
