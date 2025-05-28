import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UpdateChatForm } from '@/components/update-chat-form';

interface UpdateGroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateGroupPage({ params }: UpdateGroupPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Buscar detalhes do grupo
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !group) {
    console.error('Erro ao buscar grupo:', error);
    notFound();
  }
  
  return (
    <div className="container mx-auto py-6">
      <UpdateChatForm group={group} />
    </div>
  );
} 