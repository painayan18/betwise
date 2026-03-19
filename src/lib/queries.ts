import { getDb } from './db';
import type { Bet, Member, CreateBetRequest, SettleBetRequest, RawBetParticipation } from './types';

// ── Members ──────────────────────────────────────────────────────────────────

export async function getAllMembers(): Promise<Member[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, created_at::text FROM members ORDER BY created_at ASC
  `;
  return rows as Member[];
}

export async function createMember(name: string): Promise<Member> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO members (name) VALUES (${name})
    RETURNING id, name, created_at::text
  `;
  return rows[0] as Member;
}

export async function deleteMember(id: number): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM members WHERE id = ${id}`;
}

// ── Bets ──────────────────────────────────────────────────────────────────────

export async function getAllBets(): Promise<Bet[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      b.id,
      b.description,
      b.placed_by,
      b.total_cost::float AS total_cost,
      b.status,
      b.total_winnings::float AS total_winnings,
      b.notes,
      b.created_at::text,
      b.settled_at::text,
      b.placed_at::text,
      COALESCE(
        json_agg(
          json_build_object('id', m.id, 'name', m.name, 'created_at', m.created_at::text)
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS participants
    FROM bets b
    LEFT JOIN bet_participants bp ON b.id = bp.bet_id
    LEFT JOIN members m ON bp.member_id = m.id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `;
  return rows as unknown as Bet[];
}

export async function getBetById(id: number): Promise<Bet | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      b.id,
      b.description,
      b.placed_by,
      b.total_cost::float AS total_cost,
      b.status,
      b.total_winnings::float AS total_winnings,
      b.notes,
      b.created_at::text,
      b.settled_at::text,
      b.placed_at::text,
      COALESCE(
        json_agg(
          json_build_object('id', m.id, 'name', m.name, 'created_at', m.created_at::text)
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) AS participants
    FROM bets b
    LEFT JOIN bet_participants bp ON b.id = bp.bet_id
    LEFT JOIN members m ON bp.member_id = m.id
    WHERE b.id = ${id}
    GROUP BY b.id
  `;
  return rows.length > 0 ? (rows[0] as unknown as Bet) : null;
}

export async function createBet(data: CreateBetRequest): Promise<Bet> {
  const sql = getDb();
  const betRows = await sql`
    INSERT INTO bets (description, placed_by, total_cost, notes, placed_at)
    VALUES (${data.description}, ${data.placed_by}, ${data.total_cost}, ${data.notes}, ${data.placed_at ?? null})
    RETURNING id
  `;
  const betId = betRows[0].id as number;

  for (const memberId of data.participant_ids) {
    await sql`
      INSERT INTO bet_participants (bet_id, member_id) VALUES (${betId}, ${memberId})
    `;
  }

  return getBetById(betId) as Promise<Bet>;
}

export async function updateBet(
  id: number,
  data: Partial<{ description: string; placed_by: string | null; total_cost: number; total_winnings: number; notes: string | null; placed_at: string | null }>
): Promise<Bet> {
  const sql = getDb();
  if (data.description !== undefined) {
    await sql`UPDATE bets SET description = ${data.description} WHERE id = ${id}`;
  }
  if ('placed_by' in data) {
    await sql`UPDATE bets SET placed_by = ${data.placed_by ?? null} WHERE id = ${id}`;
  }
  if (data.total_cost !== undefined) {
    await sql`UPDATE bets SET total_cost = ${data.total_cost} WHERE id = ${id}`;
  }
  if (data.total_winnings !== undefined) {
    await sql`UPDATE bets SET total_winnings = ${data.total_winnings} WHERE id = ${id}`;
  }
  if ('notes' in data) {
    await sql`UPDATE bets SET notes = ${data.notes ?? null} WHERE id = ${id}`;
  }
  if ('placed_at' in data) {
    await sql`UPDATE bets SET placed_at = ${data.placed_at ?? null} WHERE id = ${id}`;
  }
  return getBetById(id) as Promise<Bet>;
}

export async function settleBet(id: number, data: SettleBetRequest): Promise<Bet> {
  const sql = getDb();
  const winnings = data.total_winnings ?? 0;
  await sql`
    UPDATE bets
    SET status = ${data.status}, total_winnings = ${winnings}, settled_at = NOW()
    WHERE id = ${id}
  `;
  return getBetById(id) as Promise<Bet>;
}

export async function deleteBet(id: number): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM bets WHERE id = ${id}`;
}

export async function updateParticipants(betId: number, memberIds: number[]): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM bet_participants WHERE bet_id = ${betId}`;
  for (const memberId of memberIds) {
    await sql`
      INSERT INTO bet_participants (bet_id, member_id) VALUES (${betId}, ${memberId})
    `;
  }
}

// ── Balances raw data ─────────────────────────────────────────────────────────

export async function getRawBalanceData(): Promise<RawBetParticipation[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      m.id AS member_id,
      m.name AS member_name,
      b.total_cost::float AS total_cost,
      b.status,
      b.total_winnings::float AS total_winnings,
      b.placed_by,
      (b.placed_by IS NOT NULL AND b.placed_by = m.name) AS is_placer,
      COUNT(*) OVER (PARTITION BY b.id)::int AS participant_count
    FROM bet_participants bp
    JOIN members m ON bp.member_id = m.id
    JOIN bets b ON bp.bet_id = b.id
    WHERE b.status IN ('won', 'lost')
  `;
  return rows as RawBetParticipation[];
}
