import { redirect } from 'next/navigation';
import { use } from 'react';

interface GroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function GroupPage({ params }: GroupPageProps) {
  const { id } = use(params);
  
  // Redirecionar para a rota em inglês para manter consistência
  redirect(`/groups/${id}`);
} 