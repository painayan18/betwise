import type { Member, MemberBalance, DebtEntry, BalancesResponse, RawBetParticipation } from './types';

// Profit per member: pure won - staked, independent of who fronted the money.
function computeMemberBalances(
  rows: RawBetParticipation[],
  allMembers: Member[]
): MemberBalance[] {
  const map = new Map<number, { staked: number; won: number }>();
  for (const m of allMembers) map.set(m.id, { staked: 0, won: 0 });

  for (const row of rows) {
    const n = row.participant_count;
    const costShare = row.total_cost / n;
    const winShare = row.total_winnings / n;
    const entry = map.get(row.member_id);
    if (!entry) continue;
    entry.staked += costShare;
    entry.won += winShare;
  }

  return allMembers.map((member) => {
    const { staked, won } = map.get(member.id)!;
    return { member, net_balance: won - staked, total_staked: staked, total_won: won };
  });
}

// Cash-flow debts: who needs to pay whom to settle up for fronted costs / received winnings.
// Only applies to bets that have a placed_by — the placer paid the full cost upfront
// and received the full winnings, so:
//   - Each non-placer owes the placer their cost share
//   - The placer owes each non-placer their win share
function computeDebtBalances(
  rows: RawBetParticipation[],
  allMembers: Member[]
): Map<number, number> {
  const debtMap = new Map<number, number>();
  for (const m of allMembers) debtMap.set(m.id, 0);

  for (const row of rows) {
    if (!row.placed_by) continue; // no placer = everyone managed their own stake

    const n = row.participant_count;
    const costShare = row.total_cost / n;
    const winShare = row.total_winnings / n;
    const cur = debtMap.get(row.member_id) ?? 0;

    if (row.is_placer) {
      // Placer fronted the full cost → (n-1) others each owe them costShare
      // Placer received the full winnings → they owe (n-1) others each winShare
      debtMap.set(row.member_id, cur + (costShare - winShare) * (n - 1));
    } else {
      // Non-placer: owes placer their costShare, is owed their winShare back
      debtMap.set(row.member_id, cur + (winShare - costShare));
    }
  }

  return debtMap;
}

function simplifyDebts(
  debtMap: Map<number, number>,
  allMembers: Member[]
): DebtEntry[] {
  // Work in integer cents to avoid floating-point drift
  const credits: Array<{ member: Member; amount: number }> = [];
  const debits: Array<{ member: Member; amount: number }> = [];

  for (const member of allMembers) {
    const rounded = Math.round((debtMap.get(member.id) ?? 0) * 100);
    if (rounded > 0) credits.push({ member, amount: rounded });
    if (rounded < 0) debits.push({ member, amount: -rounded });
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
      result.push({ from: debit.member, to: credit.member, amount: settled / 100 });
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
  const debtMap = computeDebtBalances(rows, allMembers);
  const debts = simplifyDebts(debtMap, allMembers);
  return { member_balances, debts };
}
