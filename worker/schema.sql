CREATE TABLE IF NOT EXISTS feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  agent_code TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_team TEXT NOT NULL,
  msg TEXT NOT NULL,
  is_ai INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS memory (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}'
);

INSERT OR IGNORE INTO memory (key, value) VALUES ('keywords', '{}');
INSERT OR IGNORE INTO memory (key, value) VALUES ('xp', '0');
INSERT OR IGNORE INTO memory (key, value) VALUES ('agent_xp', '{}');
INSERT OR IGNORE INTO memory (key, value) VALUES ('cmds', '[]');

-- Trading tables
CREATE TABLE IF NOT EXISTS trades (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy    TEXT    NOT NULL,
  symbol      TEXT    NOT NULL,
  side        TEXT    NOT NULL,
  usdt_size   REAL    NOT NULL,
  base_qty    REAL    NOT NULL,
  entry_price REAL    NOT NULL,
  exit_price  REAL,
  sl_price    REAL    NOT NULL,
  tp_price    REAL    NOT NULL,
  pnl_usdt    REAL,
  status      TEXT    NOT NULL DEFAULT 'open',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  closed_at   INTEGER
);

CREATE TABLE IF NOT EXISTS signals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy    TEXT    NOT NULL,
  symbol      TEXT    NOT NULL,
  signal      TEXT    NOT NULL,
  price       REAL    NOT NULL,
  confidence  REAL    NOT NULL,
  reason      TEXT    NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
