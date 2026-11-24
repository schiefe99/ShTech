-- ============================================================
-- SCHEMA — a estrutura do banco (as "tabelas").
-- Roda toda vez que o servidor sobe; "IF NOT EXISTS" faz com que
-- tabelas que já existem não sejam recriadas (os dados ficam).
--
-- "order" está entre aspas porque ORDER é palavra reservada do SQL
-- (ORDER BY). Com aspas, o SQLite entende que é nome de coluna.
--
-- Listas e objetos (benefits, features, limits) são guardados como
-- texto JSON. Booleanos viram 0/1 (o SQLite não tem tipo boolean).
-- ============================================================

CREATE TABLE IF NOT EXISTS characters (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  bodyColor   TEXT,
  eyeColor    TEXT NOT NULL,
  shirtColor  TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,
  tagline     TEXT,
  intro       TEXT,
  benefits    TEXT          -- JSON: [{ title, text }]
);

-- Falas de cada personagem. FOREIGN KEY liga ao personagem;
-- ON DELETE CASCADE: apagou o personagem → apaga as falas dele.
CREATE TABLE IF NOT EXISTS lines (
  id           TEXT PRIMARY KEY,
  characterId  TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  "order"      INTEGER NOT NULL DEFAULT 0,
  type         TEXT NOT NULL CHECK (type IN ('askName', 'question', 'cta')),
  text         TEXT NOT NULL,
  placeholder  TEXT,
  ctaLabel     TEXT,
  ctaHref      TEXT
);

CREATE TABLE IF NOT EXISTS demos (
  id              TEXT PRIMARY KEY,
  characterId     TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  "order"         INTEGER NOT NULL DEFAULT 0,
  title           TEXT NOT NULL,
  niche           TEXT,
  url             TEXT,
  thumbnail       TEXT,
  description     TEXT,
  features        TEXT,      -- JSON: ['...', '...']
  inSubscription  INTEGER NOT NULL DEFAULT 0,  -- 0/1
  accent          TEXT
);

CREATE TABLE IF NOT EXISTS plans (
  id           TEXT PRIMARY KEY,
  "order"      INTEGER NOT NULL DEFAULT 0,
  type         TEXT NOT NULL CHECK (type IN ('subscription', 'project')),
  name         TEXT NOT NULL,
  tagline      TEXT,
  price        REAL,         -- NULL = "Sob consulta"
  pricePrefix  TEXT,
  period       TEXT,
  features     TEXT,         -- JSON
  limits       TEXT,         -- JSON
  highlight    INTEGER NOT NULL DEFAULT 0,  -- 0/1
  ctaLabel     TEXT
);

-- Índices: deixam rápido o "WHERE characterId = ?"
CREATE INDEX IF NOT EXISTS idx_lines_character ON lines(characterId);
CREATE INDEX IF NOT EXISTS idx_demos_character ON demos(characterId);
