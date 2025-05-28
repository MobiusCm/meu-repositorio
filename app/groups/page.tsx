'use client';

import { useEffect, useState } from 'react';
import { GroupList } from '@/components/group-list';
import { EmptyState } from '@/components/empty-state';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/schema';
import { Loader2 } from 'lucide-react';

type Group = Database['public']['Tables']['groups']['Row'];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setGroups(data || []);
      } catch (err) {
        console.error('Erro ao buscar grupos:', err);
        setError('Erro ao carregar grupos');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Carregando grupos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus grupos de WhatsApp e visualize análises detalhadas
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus grupos de WhatsApp e visualize análises detalhadas
          </p>
        </div>
      </div>
      
      {groups && groups.length > 0 ? (
        <GroupList groups={groups} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
} 