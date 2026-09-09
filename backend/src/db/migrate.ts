import dotenv from 'dotenv'
dotenv.config()

import { db } from './pool'

async function migrate() {
  console.log('🗄️ Running database migrations...')

  await db(`
    CREATE TABLE IF NOT EXISTS users (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      xp         INTEGER DEFAULT 0,
      level      INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await db(`
    DO $$ BEGIN
      CREATE TYPE investment_type AS ENUM (
        'CDB','CDI','SELIC','POUPANCA','TESOURO_DIRETO','ACOES','FII','CRIPTO','OUTRO'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `)

  await db(`
    CREATE TABLE IF NOT EXISTS investments (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
      type         investment_type NOT NULL,
      name         TEXT NOT NULL,
      amount       NUMERIC(15,2) NOT NULL,
      rate         NUMERIC(8,4),
      rate_index   TEXT,
      rate_percent NUMERIC(5,2),
      started_at   DATE NOT NULL,
      due_at       DATE,
      institution  TEXT,
      notes        TEXT,
      is_active    BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await db(`
    CREATE TABLE IF NOT EXISTS xp_events (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
      action      TEXT NOT NULL,
      xp_gained   INTEGER NOT NULL,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await db(`
    CREATE TABLE IF NOT EXISTS achievements (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
      key         TEXT NOT NULL,
      unlocked_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, key)
    )
  `)

  await db(`CREATE INDEX IF NOT EXISTS idx_inv_user ON investments(user_id)`)
  await db(`CREATE INDEX IF NOT EXISTS idx_xp_user  ON xp_events(user_id)`)

  console.log('✅ Migrations completed successfully!')
  process.exit(0)
}

migrate().catch((e) => {
  console.error('❌ Migration failed:', e)
  process.exit(1)
})