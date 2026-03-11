import type { Member, MemberBalance, DebtEntry, BalancesResponse, RawBetParticipation } from './types';

function computeMemberBalances(
  rows: RawBetParticipation[],
  allMembers: Member[]
): MemberBalance[] {
  const balanceMap = new Map<number, { staked: number; won: number }>();
  for (const m of allMembers) {
    balanceMap.set(m.id, { staked: 0, won: 0 });
  }

  for (const row of rows) {
    const costShare = row.total_cost / row.participant_count;
    const winShare = row.status === 'won' ? row.total_winnings / row.participant_count : 0;
    const entry = balanceMap.get(row.member_id);
    if (entry) {
      entry.staked += costShare;
      entry.won += winShare;
    }
  }

  return allMembers.map((member) => {
    const { staked, won } = balanceMap.get(member.id)!;
    return {
      member,
      net_balance: won - staked,
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
