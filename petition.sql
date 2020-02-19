-- DROP TABLE IF EXISTS signatures;
-- CREATE TABLE signatures (
--
-- id SERIAL PRIMARY KEY,
--
-- first VARCHAR NOT NULL CHECK (first != ''),
-- last VARCHAR NOT NULL CHECK (last != ''),
-- sig VARCHAR NOT NULL CHECK (sig != '')
-- );

DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      -- get rid of first and last!
      sig TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
