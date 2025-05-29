import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { VerifiedInsight } from './InsightRegistry';
import { Shield, Settings, Info, AlertCircle } from 'lucide-react';

interface VerifiedInsightConfigProps {
  open: boolean;
  onClose: () => void;
  insight: VerifiedInsight | null;
  onSave: (insightId: string, config: InsightConfig) => Promise<boolean>;
}

interface InsightConfig {
  enabled: boolean;
  threshold: number;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

const defaultConfig: InsightConfig = {
  enabled: true,
  threshold: 0,
  notifications: {
    email: false,
    push: false,
    inApp: true
  },
  frequency: 'daily'
};

export function VerifiedInsightConfig({ 
  open, 
  onClose, 
  insight, 
  onSave 
}: VerifiedInsightConfigProps) {
  const [config, setConfig] = useState<InsightConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (insight) {
      // Configurar valores iniciais baseados no insight
      setConfig({
        enabled: insight.enabled,
        threshold: insight.formula.threshold,
        notifications: {
          email: false,
          push: false,
          inApp: true
        },
        frequency: 'daily'
      });
    }
  }, [insight]);

  const handleSave = async () => {
    if (!insight) return;

    setLoading(true);
    try {
      const success = await onSave(insight.id, config);
      if (success) {
        toast({
          title: 'Configuração salva',
          description: `As configurações do insight "${insight.title}" foram atualizadas.`,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getThresholdInfo = (insightId: string) => {
    switch (insightId) {
      case 'participation_decline':
        return {
          label: 'Limite de Declínio (%)',
          description: 'Percentual mínimo de declínio para disparar o alerta',
          min: 5,
          max: 80,
          step: 5,
          unit: '%'
        };
      case 'activity_peak':
        return {
          label: 'Multiplicador de Pico',
          description: 'Quantas vezes acima da média para considerar um pico',
          min: 1.5,
          max: 10,
          step: 0.5,
          unit: 'x'
        };
      case 'member_concentration':
        return {
          label: 'Concentração Máxima (%)',
          description: 'Percentual máximo de mensagens dos top 3 membros',
          min: 40,
          max: 90,
          step: 5,
          unit: '%'
        };
      case 'growth_acceleration':
        return {
          label: 'Taxa de Crescimento (%)',
          description: 'Percentual mínimo de crescimento semanal',
          min: 10,
          max: 100,
          step: 5,
          unit: '%'
        };
      default:
        return {
          label: 'Valor Limite',
          description: 'Valor limite para disparar o insight',
          min: 0,
          max: 100,
          step: 1,
          unit: ''
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!insight) return null;

  const thresholdInfo = getThresholdInfo(insight.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Configurar Insight Verificado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Insight */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{insight.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50"
                >
                  <Shield className="h-3 w-3" />
                  Verificado
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {insight.priority}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Precisão:</span>
                <span className="ml-2 font-medium">{insight.metadata.accuracy}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <span className="ml-2 font-medium">{insight.category}</span>
              </div>
            </div>
          </div>

          {/* Configuração de Ativação */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Insight Ativo</Label>
                <p className="text-xs text-muted-foreground">
                  Ativar ou desativar este insight
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => 
                  setConfig(prev => ({ ...prev, enabled }))
                }
              />
            </div>
          </div>

          {/* Configuração de Threshold */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                {thresholdInfo.label}
                <Info className="h-3 w-3 text-muted-foreground" />
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                {thresholdInfo.description}
              </p>
              
              <div className="space-y-3">
                <Slider
                  value={[config.threshold]}
                  onValueChange={([value]) => 
                    setConfig(prev => ({ ...prev, threshold: value }))
                  }
                  min={thresholdInfo.min}
                  max={thresholdInfo.max}
                  step={thresholdInfo.step}
                  className="w-full"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {thresholdInfo.min}{thresholdInfo.unit}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.threshold}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          threshold: Number(e.target.value) 
                        }))
                      }
                      min={thresholdInfo.min}
                      max={thresholdInfo.max}
                      step={thresholdInfo.step}
                      className="w-20 h-7 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">
                      {thresholdInfo.unit}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {thresholdInfo.max}{thresholdInfo.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações de Notificação */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Notificações</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm">Email</span>
                  <p className="text-xs text-muted-foreground">
                    Receber alertas por email
                  </p>
                </div>
                <Switch
                  checked={config.notifications.email}
                  onCheckedChange={(email) => 
                    setConfig(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, email }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm">Push</span>
                  <p className="text-xs text-muted-foreground">
                    Notificações push no navegador
                  </p>
                </div>
                <Switch
                  checked={config.notifications.push}
                  onCheckedChange={(push) => 
                    setConfig(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, push }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm">No App</span>
                  <p className="text-xs text-muted-foreground">
                    Mostrar notificações dentro do app
                  </p>
                </div>
                <Switch
                  checked={config.notifications.inApp}
                  onCheckedChange={(inApp) => 
                    setConfig(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, inApp }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Frequência de Verificação */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Frequência de Verificação</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'realtime', label: 'Tempo Real' },
                { value: 'hourly', label: 'A cada hora' },
                { value: 'daily', label: 'Diariamente' },
                { value: 'weekly', label: 'Semanalmente' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={config.frequency === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => 
                    setConfig(prev => ({ 
                      ...prev, 
                      frequency: option.value as InsightConfig['frequency']
                    }))
                  }
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Importante:</strong> As configurações afetam apenas os parâmetros de sensibilidade. 
              A lógica principal do insight não pode ser alterada por questões de precisão.
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 