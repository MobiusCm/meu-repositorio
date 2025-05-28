'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  AlertTriangle,
  CheckCircle,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Activity,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Configurações padrão para cada tipo de insight nativo
const NATIVE_INSIGHT_CONFIGS = {
  participation_excellence: {
    name: 'Excelência de Participação',
    description: 'Define quando um grupo tem participação excepcional',
    icon: CheckCircle,
    category: 'Engajamento',
    parameters: [
      {
        key: 'min_participation_rate',
        name: 'Taxa Mínima de Participação',
        description: 'Porcentagem mínima de membros que devem estar ativos',
        type: 'percentage',
        defaultValue: 70,
        min: 30,
        max: 100,
        step: 5,
        unit: '%'
      },
      {
        key: 'min_messages_per_member',
        name: 'Mensagens Mínimas por Membro',
        description: 'Número mínimo de mensagens por membro ativo',
        type: 'number',
        defaultValue: 5,
        min: 1,
        max: 50,
        step: 1,
        unit: 'msgs'
      },
      {
        key: 'consistency_threshold',
        name: 'Threshold de Consistência',
        description: 'Nível mínimo de consistência na participação',
        type: 'percentage',
        defaultValue: 80,
        min: 50,
        max: 100,
        step: 5,
        unit: '%'
      }
    ]
  },
  participation_decline: {
    name: 'Declínio de Participação',
    description: 'Detecta quando a participação está diminuindo preocupantemente',
    icon: AlertTriangle,
    category: 'Engajamento',
    parameters: [
      {
        key: 'decline_threshold',
        name: 'Threshold de Declínio',
        description: 'Porcentagem de queda que ativa o alerta',
        type: 'percentage',
        defaultValue: 30,
        min: 10,
        max: 70,
        step: 5,
        unit: '%'
      },
      {
        key: 'min_observation_days',
        name: 'Dias Mínimos de Observação',
        description: 'Período mínimo para confirmar tendência',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 14,
        step: 1,
        unit: 'dias'
      },
      {
        key: 'critical_threshold',
        name: 'Threshold Crítico',
        description: 'Nível crítico de participação (alerta urgente)',
        type: 'percentage',
        defaultValue: 20,
        min: 5,
        max: 50,
        step: 5,
        unit: '%'
      }
    ]
  },
  activity_peak: {
    name: 'Picos de Atividade',
    description: 'Identifica quando há atividade excepcionalmente alta',
    icon: TrendingUp,
    category: 'Atividade',
    parameters: [
      {
        key: 'peak_multiplier',
        name: 'Multiplicador de Pico',
        description: 'Quantas vezes acima da média constitui um pico',
        type: 'number',
        defaultValue: 3,
        min: 1.5,
        max: 10,
        step: 0.5,
        unit: 'x'
      },
      {
        key: 'min_peak_duration',
        name: 'Duração Mínima do Pico',
        description: 'Tempo mínimo para considerar um pico válido',
        type: 'number',
        defaultValue: 1,
        min: 0.5,
        max: 6,
        step: 0.5,
        unit: 'h'
      },
      {
        key: 'exceptional_threshold',
        name: 'Threshold Excepcional',
        description: 'Múltiplo para picos verdadeiramente excepcionais',
        type: 'number',
        defaultValue: 5,
        min: 3,
        max: 15,
        step: 0.5,
        unit: 'x'
      }
    ]
  },
  growth_trend: {
    name: 'Tendência de Crescimento',
    description: 'Analisa tendências positivas de crescimento',
    icon: BarChart3,
    category: 'Crescimento',
    parameters: [
      {
        key: 'good_growth_rate',
        name: 'Taxa de Crescimento Boa',
        description: 'Crescimento considerado positivo',
        type: 'percentage',
        defaultValue: 15,
        min: 5,
        max: 100,
        step: 5,
        unit: '%'
      },
      {
        key: 'excellent_growth_rate',
        name: 'Taxa de Crescimento Excelente',
        description: 'Crescimento considerado excepcional',
        type: 'percentage',
        defaultValue: 40,
        min: 20,
        max: 200,
        step: 10,
        unit: '%'
      },
      {
        key: 'negative_threshold',
        name: 'Threshold Negativo',
        description: 'Declínio que merece atenção',
        type: 'percentage',
        defaultValue: -10,
        min: -50,
        max: -5,
        step: 5,
        unit: '%'
      }
    ]
  },
  member_concentration: {
    name: 'Concentração de Membros',
    description: 'Detecta quando poucos membros dominam as conversas',
    icon: Users,
    category: 'Distribuição',
    parameters: [
      {
        key: 'concentration_warning',
        name: 'Concentração de Alerta',
        description: 'Porcentagem de atividade dos top 3 membros que gera alerta',
        type: 'percentage',
        defaultValue: 60,
        min: 40,
        max: 90,
        step: 5,
        unit: '%'
      },
      {
        key: 'concentration_critical',
        name: 'Concentração Crítica',
        description: 'Nível crítico de concentração',
        type: 'percentage',
        defaultValue: 80,
        min: 60,
        max: 95,
        step: 5,
        unit: '%'
      },
      {
        key: 'ideal_distribution',
        name: 'Distribuição Ideal',
        description: 'Índice de diversidade considerado ideal',
        type: 'percentage',
        defaultValue: 70,
        min: 50,
        max: 90,
        step: 5,
        unit: '%'
      }
    ]
  },
  content_quality: {
    name: 'Qualidade do Conteúdo',
    description: 'Avalia a qualidade das mensagens no grupo',
    icon: MessageSquare,
    category: 'Qualidade',
    parameters: [
      {
        key: 'min_message_length',
        name: 'Comprimento Mínimo Ideal',
        description: 'Tamanho mínimo para mensagens de qualidade',
        type: 'number',
        defaultValue: 20,
        min: 5,
        max: 100,
        step: 5,
        unit: 'chars'
      },
      {
        key: 'good_media_ratio',
        name: 'Proporção Boa de Mídia',
        description: 'Porcentagem ideal de mensagens com mídia',
        type: 'percentage',
        defaultValue: 15,
        min: 5,
        max: 50,
        step: 5,
        unit: '%'
      },
      {
        key: 'conversation_depth_threshold',
        name: 'Profundidade de Conversa',
        description: 'Número ideal de mensagens por thread',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 0.5,
        unit: 'msgs'
      }
    ]
  }
};

interface NativeInsightConfiguratorProps {
  insightType: keyof typeof NATIVE_INSIGHT_CONFIGS;
  groupId: string;
  currentConfig?: Record<string, any>;
  onSave?: (config: Record<string, any>) => void;
  onCancel?: () => void;
}

export function NativeInsightConfigurator({
  insightType,
  groupId,
  currentConfig = {},
  onSave,
  onCancel
}: NativeInsightConfiguratorProps) {
  const { toast } = useToast();
  const insightConfig = NATIVE_INSIGHT_CONFIGS[insightType];
  
  const [config, setConfig] = useState<Record<string, any>>(() => {
    const initialConfig: Record<string, any> = {};
    insightConfig.parameters.forEach(param => {
      initialConfig[param.key] = currentConfig[param.key] ?? param.defaultValue;
    });
    return initialConfig;
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: currentConfig.notifications?.email ?? false,
    push: currentConfig.notifications?.push ?? false,
    inApp: currentConfig.notifications?.inApp ?? true
  });

  const updateParameter = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaultConfig: Record<string, any> = {};
    insightConfig.parameters.forEach(param => {
      defaultConfig[param.key] = param.defaultValue;
    });
    setConfig(defaultConfig);
    toast({
      title: 'Configurações restauradas',
      description: 'Todos os parâmetros foram restaurados aos valores padrão.'
    });
  };

  const handleSave = () => {
    const finalConfig = {
      ...config,
      notifications: notificationSettings
    };
    onSave?.(finalConfig);
  };

  const IconComponent = insightConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{insightConfig.name}</h3>
          <p className="text-sm text-muted-foreground">{insightConfig.description}</p>
        </div>
        <Badge variant="outline">{insightConfig.category}</Badge>
      </div>

      <Tabs defaultValue="parameters">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuração de Parâmetros</CardTitle>
              <CardDescription>
                Ajuste os thresholds para personalizar quando este insight deve ser ativado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {insightConfig.parameters.map(param => (
                <div key={param.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{param.name}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config[param.key]}
                        onChange={(e) => updateParameter(param.key, Number(e.target.value))}
                        className="w-20 h-8 text-center"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                      />
                      <span className="text-sm text-muted-foreground">{param.unit}</span>
                    </div>
                  </div>
                  
                  <div className="px-3">
                    <Slider
                      value={[config[param.key]]}
                      onValueChange={(value) => updateParameter(param.key, value[0])}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                  
                  {param.key.includes('threshold') && (
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Bom: {param.type === 'percentage' ? 'acima' : 'maior que'} {config[param.key]}{param.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Ruim: {param.type === 'percentage' ? 'abaixo' : 'menor que'} {config[param.key]}{param.unit}</span>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={resetToDefaults} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrões
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Notificação</CardTitle>
              <CardDescription>
                Configure como você deseja ser notificado quando este insight for ativado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificação no App</Label>
                    <p className="text-sm text-muted-foreground">Mostrar alertas dentro da aplicação</p>
                  </div>
                  <Switch
                    checked={notificationSettings.inApp}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, inApp: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificação por Email</Label>
                    <p className="text-sm text-muted-foreground">Enviar emails quando o insight for ativado</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificação Push</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações push no dispositivo</p>
                  </div>
                  <Switch
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          <Settings className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
} 