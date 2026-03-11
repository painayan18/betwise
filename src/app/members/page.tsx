'use client';

import { useMembers } from '@/hooks/useMembers';
import { useBets } from '@/hooks/useBets';
import { useBalances } from '@/hooks/useBalances';
import { AddMemberForm } from '@/components/members/AddMemberForm';
import { MemberList } from '@/components/members/MemberList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MembersPage() {
  const { members, isLoading, mutateMembers } = useMembers();
  const { mutateBets } = useBets();
  const { mutateBalances } = useBalances();

  async function handleDelete(id: number) {
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    mutateMembers();
    mutateBets();
    mutateBalances();
  }

  function handleSuccess() {
    mutateMembers();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-100">Members</h1>
      <AddMemberForm onSuccess={handleSuccess} />
      {isLoading ? <LoadingSpinner /> : (
        <MemberList members={members} onDelete={handleDelete} />
      )}
    </div>
  );
}
