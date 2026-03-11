export type BetStatus = 'pending' | 'won' | 'lost';

export interface Member {
  id: number;
  name: string;
  created_at: string;
}

export interface Bet {
  id: number;
  description: string;
  placed_by: string | null;
  total_cost: number;
  status: BetStatus;
  total_winnings: number;
  notes: string | null;
  created_at: string;
  settled_at: string | null;
  participants: Member[];
}

export interface MemberBalance {
  member: Member;
  net_balance: number;
  total_staked: number;
  total_won: number;
}

export interface DebtEntry {
  from: Member;
  to: Member;
  amount: number;
}

export interface BalancesResponse {
  member_balances: MemberBalance[];
  debts: DebtEntry[];
}

export interface CreateBetRequest {
  description: string;
  placed_by: string | null;
  total_cost: number;
  notes: string | null;
  participant_ids: number[];
}

export interface SettleBetRequest {
  status: 'won' | 'lost';
  total_winnings: number;
}

export interface RawBetParticipation {
  member_id: number;
  member_name: string;
  total_cost: number;
  status: BetStatus;
  total_winnings: number;
  participant_count: number;
  placed_by: string | null;
  is_placer: boolean;
}
