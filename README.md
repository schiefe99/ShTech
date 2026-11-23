# SHTECH — site interativo

Esteira de robôs-TV em 3D, um por serviço, que conversam com o visitante.

## Estrutura

```
shtech/
├── client/                 → front-end (React + Vite + Tailwind + Three.js)
│   └── src/
│       ├── data/           → seed (dados iniciais)
│       ├── services/       → CRUD — único lugar que sabe onde os dados moram
│       ├── hooks/          → useCharacters(): ponte service ↔ React
│       ├── components/
│       │   └── three/      → Scene, TvRobot (3D)
│       └── pages/          → Home (e Admin no Dia 4)
└── server/                 → API Node + Express + SQLite (Dia 4)
```

## Fluxo dos dados

```
seed → service (CRUD) → hook useCharacters → páginas → componentes 3D
```

## Rodar

```bash
cd client
npm install
npm run dev
```

Abra http://localhost:5173

## Dica de debug

O seed é copiado para o localStorage na primeira visita.
Se mudar o seed e não ver a mudança, no console do navegador:

```js
localStorage.removeItem('shtech:characters')
```
