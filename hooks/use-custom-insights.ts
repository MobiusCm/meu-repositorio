'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface CustomInsight {
  id: string;
  user_id: string;
  name: string;
  description: string;
  formula: {
    expression: string;
    type: string;
  };
  variables: string[];
  conditions: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number | [number, number];
  }>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomInsightData {
  name: string;
  description: string;
  formula: {
    expression: string;
    type: string;
  };
  variables: string[];
  conditions: Array<{
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    value: number | [number, number];
  }>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

export interface UseCustomInsightsReturn {
  insights: CustomInsight[];
  loading: boolean;
  error: string | null;
  
  // Funções CRUD
  createInsight: (data: CreateCustomInsightData) => Promise<boolean>;
  updateInsight: (id: string, data: Partial<CreateCustomInsightData>) => Promise<boolean>;
  deleteInsight: (id: string) => Promise<boolean>;
  toggleInsight: (id: string, enabled: boolean) => Promise<boolean>;
  
  // Funções de busca
  fetchInsights: () => Promise<void>;
  getInsightById: (id: string) => CustomInsight | null;
  getInsightsByCategory: (category: string) => CustomInsight[];
  
  // Funções de execução
  testInsight: (insight: CustomInsight, testData: Record<string, any>) => Promise<{
    result: any;
    triggered: boolean;
    conditionResults: boolean[];
  }>;
  
  // Funções de análise
  getInsightStats: () => {
    total: number;
    enabled: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };

  // Função de salvamento
  saveCustomInsight: (formula: any, groupId: string) => Promise<boolean>;
}

export function useCustomInsights(): UseCustomInsightsReturn {
  const [insights, setInsights] = useState<CustomInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Buscar insights customizados
  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: fetchError } = await supabase
        .from('custom_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setInsights(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar insights customizados';
      setError(errorMessage);
      console.error('Erro ao buscar insights:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar insight customizado
  const createInsight = async (data: CreateCustomInsightData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: newInsight, error: createError } = await supabase
        .from('custom_insights')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          formula: data.formula,
          variables: data.variables,
          conditions: data.conditions,
          priority: data.priority,
          category: data.category,
          enabled: true
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Atualizar estado local
      setInsights(prev => [newInsight, ...prev]);

      toast({
        title: 'Insight criado',
        description: `"${data.name}" foi criado com sucesso.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar insight';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Atualizar insight customizado
  const updateInsight = async (id: string, data: Partial<CreateCustomInsightData>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: updatedInsight, error: updateError } = await supabase
        .from('custom_insights')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setInsights(prev => prev.map(insight => 
        insight.id === id ? updatedInsight : insight
      ));

      toast({
        title: 'Insight atualizado',
        description: 'As alterações foram salvas com sucesso.',
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

  // Deletar insight customizado
  const deleteInsight = async (id: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: deleteError } = await supabase
        .from('custom_insights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Atualizar estado local
      const deletedInsight = insights.find(i => i.id === id);
      setInsights(prev => prev.filter(insight => insight.id !== id));

      toast({
        title: 'Insight excluído',
        description: `"${deletedInsight?.name}" foi excluído com sucesso.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir insight';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Ativar/Desativar insight
  const toggleInsight = async (id: string, enabled: boolean): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: updateError } = await supabase
        .from('custom_insights')
        .update({ enabled })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setInsights(prev => prev.map(insight => 
        insight.id === id ? { ...insight, enabled } : insight
      ));

      const insightName = insights.find(i => i.id === id)?.name || 'Insight';
      toast({
        title: enabled ? 'Insight ativado' : 'Insight desativado',
        description: `"${insightName}" foi ${enabled ? 'ativado' : 'desativado'} com sucesso.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do insight';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Buscar insight por ID
  const getInsightById = (id: string): CustomInsight | null => {
    return insights.find(insight => insight.id === id) || null;
  };

  // Buscar insights por categoria
  const getInsightsByCategory = (category: string): CustomInsight[] => {
    return insights.filter(insight => insight.category === category);
  };

  // Testar insight com dados simulados
  const testInsight = async (
    insight: CustomInsight, 
    testData: Record<string, any>
  ): Promise<{
    result: any;
    triggered: boolean;
    conditionResults: boolean[];
  }> => {
    try {
      // Substituir variáveis na expressão
      let expression = insight.formula.expression;
      
      // Validar se todas as variáveis necessárias estão presentes
      const missingVariables = insight.variables.filter(variable => 
        !(variable in testData)
      );
      
      if (missingVariables.length > 0) {
        throw new Error(`Variáveis ausentes: ${missingVariables.join(', ')}`);
      }

      // Substituir variáveis pelos valores
      Object.entries(testData).forEach(([key, value]) => {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), value.toString());
      });

      // Avaliar expressão (em produção usaria um parser mais seguro)
      const result = eval(expression);
      
      // Verificar condições
      const conditionResults = insight.conditions.map(condition => {
        const value = condition.field === 'result' ? result : testData[condition.field];
        
        switch (condition.operator) {
          case 'gt': return value > (condition.value as number);
          case 'lt': return value < (condition.value as number);
          case 'gte': return value >= (condition.value as number);
          case 'lte': return value <= (condition.value as number);
          case 'eq': return value === condition.value;
          case 'between': 
            const [min, max] = condition.value as [number, number];
            return value >= min && value <= max;
          default: return false;
        }
      });

      const triggered = conditionResults.every(Boolean);

      return {
        result,
        triggered,
        conditionResults
      };

    } catch (err) {
      throw new Error(`Erro ao testar insight: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  // Obter estatísticas dos insights
  const getInsightStats = () => {
    const total = insights.length;
    const enabled = insights.filter(i => i.enabled).length;
    
    const byCategory = insights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = insights.reduce((acc, insight) => {
      acc[insight.priority] = (acc[insight.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      enabled,
      byCategory,
      byPriority
    };
  };

  // Salvar insight customizado
  const saveCustomInsight = async (formula: any, groupId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('custom_insights')
        .insert({
          name: formula.name,
          description: formula.description,
          formula_expression: formula.expression,
          formula_variables: formula.variables,
          conditions: formula.conditions,
          category: formula.category,
          priority: formula.priority,
          group_id: groupId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          enabled: true,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Recarregar insights
      await fetchInsights();

      return true;
    } catch (error) {
      console.error('Erro ao salvar insight customizado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar insights na inicialização
  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    createInsight,
    updateInsight,
    deleteInsight,
    toggleInsight,
    fetchInsights,
    getInsightById,
    getInsightsByCategory,
    testInsight,
    getInsightStats,
    saveCustomInsight
  };
} 