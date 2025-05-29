import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { GroupAnalysisData } from '@/components/insights/utils/DataProcessor';
import { 
  InsightRegistry, 
  VerifiedInsight, 
  VerifiedInsightData, 
  InsightPreference 
} from '@/components/insights/types/InsightRegistry';

interface VerifiedInsightsState {
  insights: VerifiedInsight[];
  preferences: InsightPreference[];
  activeInsights: VerifiedInsightData[];
  loading: boolean;
  error: string | null;
}

export function useVerifiedInsights() {
  const { toast } = useToast();
  const [state, setState] = useState<VerifiedInsightsState>({
    insights: [],
    preferences: [],
    activeInsights: [],
    loading: true,
    error: null
  });

  // Carregar insights verificados (estáticos)
  useEffect(() => {
    const insights = InsightRegistry.getVerifiedInsights();
    setState(prev => ({
      ...prev,
      insights,
      loading: false
    }));
  }, []);

  // Carregar preferências do usuário (localStorage para insights verificados)
  const loadPreferences = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Para insights verificados, usar localStorage como backup
      const storedPreferences = localStorage.getItem(`verified_insights_preferences_${user.id}`);
      
      if (storedPreferences) {
        const preferences: InsightPreference[] = JSON.parse(storedPreferences);
        setState(prev => ({ ...prev, preferences }));
      } else {
        // Criar preferências padrão
        const { data: groups } = await supabase.from('groups').select('id, name');
        
        if (groups) {
          const defaultPreferences: InsightPreference[] = [];
          
          for (const group of groups) {
            for (const insight of InsightRegistry.getVerifiedInsights()) {
              defaultPreferences.push({
                id: `${user.id}_${group.id}_${insight.id}`,
                userId: user.id,
                groupId: group.id,
                insightId: insight.id,
                enabled: insight.priority !== 'low', // Ativar apenas insights de prioridade média ou alta
                lastModified: new Date()
              });
            }
          }
          
          localStorage.setItem(`verified_insights_preferences_${user.id}`, JSON.stringify(defaultPreferences));
          setState(prev => ({ ...prev, preferences: defaultPreferences }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro ao carregar preferências de insights' 
      }));
    }
  }, []);

  // Salvar preferências
  const savePreferences = useCallback(async (preferences: InsightPreference[]) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      localStorage.setItem(`verified_insights_preferences_${user.id}`, JSON.stringify(preferences));
      setState(prev => ({ ...prev, preferences }));
      
      toast({
        title: 'Preferências salvas',
        description: 'Suas configurações de insights foram atualizadas.'
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas preferências.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Atualizar preferência específica
  const updatePreference = useCallback(async (
    groupId: string, 
    insightId: string, 
    updates: Partial<InsightPreference>
  ) => {
    const newPreferences = state.preferences.map(pref => {
      if (pref.groupId === groupId && pref.insightId === insightId) {
        return { ...pref, ...updates, lastModified: new Date() };
      }
      return pref;
    });
    
    await savePreferences(newPreferences);
  }, [state.preferences, savePreferences]);

  // Obter insights ativos para um grupo
  const getActiveInsightsForGroup = useCallback((groupData: GroupAnalysisData): VerifiedInsightData[] => {
    const activeInsights = InsightRegistry.getActiveInsightsForGroup(groupData);
    
    // Filtrar baseado nas preferências do usuário
    return activeInsights.filter(insight => 
      InsightRegistry.shouldDisplayInsight(insight, state.preferences)
    );
  }, [state.preferences]);

  // Verificar se um insight está habilitado para um grupo
  const isInsightEnabled = useCallback((groupId: string, insightId: string): boolean => {
    const preference = state.preferences.find(p => 
      p.groupId === groupId && p.insightId === insightId
    );
    return preference?.enabled ?? true;
  }, [state.preferences]);

  // Obter threshold customizado para um insight
  const getCustomThreshold = useCallback((groupId: string, insightId: string): number | undefined => {
    const preference = state.preferences.find(p => 
      p.groupId === groupId && p.insightId === insightId
    );
    return preference?.threshold;
  }, [state.preferences]);

  // Resetar preferências para padrão
  const resetToDefaults = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      localStorage.removeItem(`verified_insights_preferences_${user.id}`);
      await loadPreferences();
      
      toast({
        title: 'Preferências resetadas',
        description: 'Todas as configurações foram restauradas para o padrão.'
      });
    } catch (error) {
      console.error('Erro ao resetar preferências:', error);
      toast({
        title: 'Erro ao resetar',
        description: 'Não foi possível resetar as configurações.',
        variant: 'destructive'
      });
    }
  }, [loadPreferences, toast]);

  // Carregar preferências ao montar
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    // Estado
    insights: state.insights,
    preferences: state.preferences,
    activeInsights: state.activeInsights,
    loading: state.loading,
    error: state.error,
    
    // Funções
    updatePreference,
    savePreferences,
    getActiveInsightsForGroup,
    isInsightEnabled,
    getCustomThreshold,
    resetToDefaults,
    loadPreferences
  };
} 