import type { Member, MemberBalance, DebtEntry, BalancesResponse, RawBetParticipation } from './types';

function computeMemberBalances(
  rows: RawBetParticipation[],
  allMembers: Member[]
): MemberBalance[] {
  const balanceMap = new Map<number, { balance: number; staked: number; won: number }>();
  for (const m of allMembers) {
    balanceMap.set(m.id, { balance: 0, staked: 0, won: 0 });
  }

  for (const row of rows) {
    const n = row.participant_count;
    const costShare = row.total_cost / n;
    const winShare = row.status === 'won' ? row.total_winnings / n : 0;
    const entry = balanceMap.get(row.member_id);
    if (!entry) continue;

    entry.staked += costShare;
    entry.won += winShare;

    if (row.placed_by && row.is_placer) {
      // Placer paid full cost and received full winnings.
      // They are owed cost shares from all others, and owe win shares to all others.
      const othersCount = n - 1;
      entry.balance += costShare * othersCount;  // collected from others
      entry.balance -= winShare * othersCount;   // distributed to others
    } else if (row.placed_by && !row.is_placer) {
      // Non-placer: owes their cost share to placer, is owed their win share back.
      entry.balance -= costShare;
      entry.balance += winShare;
    } else {
      // No placer set: assume everyone manages their own stake.
      entry.balance += winShare - costShare;
    }
  }

  return allMembers.map((member) => {
    const { balance, staked, won } = balanceMap.get(member.id)!;
    return {
      member,
      net_balance: balance,
      total_staked: staked,
      total_won: won,
    };
  });
}

function simplifyDebts(memberBalances: MemberBalance[]): DebtEntry[] {
  // Work in integer cents to avoid floating-point drift
  const credits: Array<{ member: Member; amount: number }> = [];
  const debits: Array<{ member: Member; amount: number }> = [];

  for (const mb of memberBalances) {
    const rounded = Math.round(mb.net_balance * 100);
    if (rounded > 0) credits.push({ member: mb.member, amount: rounded });
    if (rounded < 0) debits.push({ member: mb.member, amount: -rounded });
  }

  credits.sort((a, b) => b.amount - a.amount);
  debits.sort((a, b) => b.amount - a.amount);

  const result: DebtEntry[] = [];
  let ci = 0;
  let di = 0;

  while (ci < credits.length && di < debits.length) {
    const credit = credits[ci];
    const debit = debits[di];
    const settled = Math.min(credit.amount, debit.amount);

    if (settled > 0) {
      result.push({
        from: debit.member,
        to: credit.member,
        amount: settled / 100,
      });
    }

    credit.amount -= settled;
    debit.amount -= settled;

    if (credit.amount === 0) ci++;
    if (debit.amount === 0) di++;
  }

  return result;
}

export function computeBalances(
  rows: RawBetParticipation[],
  allMembers: Member[]
): BalancesResponse {
  const member_balances = computeMemberBalances(rows, allMembers);
  const debts = simplifyDebts(member_balances);
  return { member_balances, debts };
}
