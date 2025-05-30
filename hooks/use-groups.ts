"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/schema';

type Group = Database['public']['Tables']['groups']['Row'];

interface UseGroupsReturn {
  groups: Group[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: supabaseError } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setGroups(data || []);
    } catch (err) {
      console.error('Erro ao buscar grupos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups
  };
} 
 