import { redirect } from 'next/navigation';
import { use } from 'react';

interface UpdateGroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UpdateGroupPage({ params }: UpdateGroupPageProps) {
  const { id } = use(params);
  
  // Redirecionar para a rota em inglês para manter consistência
  redirect(`/groups/${id}/update`);
} 