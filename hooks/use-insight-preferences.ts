'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface InsightPreference {
  id: string;
  user_id: string;
  group_id: string;
  insight_type: string;
  enabled: boolean;
  custom_threshold: Record<string, any>;
  notification_settings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UseInsightPreferencesReturn {
  preferences: InsightPreference[];
  loading: boolean;
  error: string | null;
  
  // Funções de gerenciamento
  toggleInsight: (insightType: string, groupId: string, enabled: boolean) => Promise<boolean>;
  updateThreshold: (insightType: string, groupId: string, threshold: Record<string, any>) => Promise<boolean>;
  updateNotifications: (insightType: string, groupId: string, notifications: Partial<InsightPreference['notification_settings']>) => Promise<boolean>;
  getPreference: (insightType: string, groupId: string) => InsightPreference | null;
  isInsightEnabled: (insightType: string, groupId: string) => boolean;
  bulkToggle: (updates: Array<{insightType: string; groupId: string; enabled: boolean}>) => Promise<boolean>;
  
  // Funções de query
  fetchPreferences: (groupId?: string) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

export function useInsightPreferences(): UseInsightPreferencesReturn {
  const [preferences, setPreferences] = useState<InsightPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Buscar preferências do usuário
  const fetchPreferences = async (groupId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('insight_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPreferences(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar preferências';
      setError(errorMessage);
      console.error('Erro ao buscar preferências:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ativar/Desativar insight
  const toggleInsight = async (insightType: string, groupId: string, enabled: boolean): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: upsertError } = await supabase
        .from('insight_preferences')
        .upsert({
          user_id: user.id,
          group_id: groupId,
          insight_type: insightType,
          enabled: enabled
        }, {
          onConflict: 'user_id,group_id,insight_type'
        });

      if (upsertError) {
        throw upsertError;
      }

      // Atualizar estado local
      setPreferences(prev => {
        const existingIndex = prev.findIndex(
          p => p.insight_type === insightType && p.group_id === groupId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], enabled };
          return updated;
        } else {
          // Criar nova preferência no estado local
          const newPreference: InsightPreference = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            group_id: groupId,
            insight_type: insightType,
            enabled,
            custom_threshold: {},
            notification_settings: { email: false, push: false, inApp: true },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return [newPreference, ...prev];
        }
      });

      toast({
        title: enabled ? 'Insight ativado' : 'Insight desativado',
        description: `${insightType} foi ${enabled ? 'ativado' : 'desativado'} com sucesso.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar insight';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Atualizar threshold customizado
  const updateThreshold = async (
    insightType: string,
    groupId: string,
    threshold: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: upsertError } = await supabase
        .from('insight_preferences')
        .upsert({
          user_id: user.id,
          group_id: groupId,
          insight_type: insightType,
          custom_threshold: threshold
        }, {
          onConflict: 'user_id,group_id,insight_type'
        });

      if (upsertError) {
        throw upsertError;
      }

      // Atualizar estado local
      setPreferences(prev => {
        const existingIndex = prev.findIndex(
          p => p.insight_type === insightType && p.group_id === groupId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], custom_threshold: threshold };
          return updated;
        }

        return prev;
      });

      toast({
        title: 'Threshold atualizado',
        description: 'Configurações personalizadas salvas com sucesso.',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar threshold';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Atualizar configurações de notificação
  const updateNotifications = async (
    insightType: string,
    groupId: string,
    notifications: Partial<InsightPreference['notification_settings']>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar configuração atual
      const existing = preferences.find(
        p => p.insight_type === insightType && p.group_id === groupId
      );

      const updatedNotifications = {
        ...existing?.notification_settings || { email: false, push: false, inApp: true },
        ...notifications
      };

      const { error: upsertError } = await supabase
        .from('insight_preferences')
        .upsert({
          user_id: user.id,
          group_id: groupId,
          insight_type: insightType,
          notification_settings: updatedNotifications
        }, {
          onConflict: 'user_id,group_id,insight_type'
        });

      if (upsertError) {
        throw upsertError;
      }

      // Atualizar estado local
      setPreferences(prev => {
        const existingIndex = prev.findIndex(
          p => p.insight_type === insightType && p.group_id === groupId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            notification_settings: updatedNotifications
          };
          return updated;
        }

        return prev;
      });

      toast({
        title: 'Notificações atualizadas',
        description: 'Configurações de notificação salvas com sucesso.',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar notificações';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Buscar preferência específica
  const getPreference = (insightType: string, groupId: string): InsightPreference | null => {
    return preferences.find(
      p => p.insight_type === insightType && p.group_id === groupId
    ) || null;
  };

  // Verificar se insight está ativado
  const isInsightEnabled = (insightType: string, groupId: string): boolean => {
    const preference = getPreference(insightType, groupId);
    return preference?.enabled ?? true; // Por padrão, insights estão ativados
  };

  // Ativação/desativação em lote
  const bulkToggle = async (
    updates: Array<{insightType: string; groupId: string; enabled: boolean}>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const upsertData = updates.map(update => ({
        user_id: user.id,
        group_id: update.groupId,
        insight_type: update.insightType,
        enabled: update.enabled
      }));

      const { error: bulkError } = await supabase
        .from('insight_preferences')
        .upsert(upsertData, {
          onConflict: 'user_id,group_id,insight_type'
        });

      if (bulkError) {
        throw bulkError;
      }

      // Refresh preferences after bulk update
      await fetchPreferences();

      toast({
        title: 'Alterações salvas',
        description: `${updates.length} insights foram atualizados com sucesso.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer alterações em lote';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Recarregar preferências
  const refreshPreferences = async () => {
    await fetchPreferences();
  };

  // Carregar preferências na inicialização
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    toggleInsight,
    updateThreshold,
    updateNotifications,
    getPreference,
    isInsightEnabled,
    bulkToggle,
    fetchPreferences,
    refreshPreferences
  };
} 