import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL environment variable is not set');
    _sql = neon(url);
  }
  return _sql;
}

export async function initSchema(): Promise<void> {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS bets (
      id SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      placed_by VARCHAR(255),
      total_cost DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      total_winnings DECIMAL(10,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      settled_at TIMESTAMP
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS bet_participants (
      bet_id INTEGER REFERENCES bets(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      PRIMARY KEY (bet_id, member_id)
    )
  `;
}
