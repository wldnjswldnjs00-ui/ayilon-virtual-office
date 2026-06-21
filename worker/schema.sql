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
