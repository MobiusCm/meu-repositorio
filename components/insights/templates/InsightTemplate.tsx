import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';

export interface InsightTemplateProps {
  insight: {
    id: string;
    title: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    groupId: string;
    groupName: string;
    metadata?: {
      period?: string;
    };
    trend: 'up' | 'down' | 'stable' | 'warning' | 'critical';
  };
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  showHeader?: boolean;
}

export function InsightTemplate({ insight, icon, children, actions, showHeader = true }: InsightTemplateProps) {
  const router = useRouter();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800';
    }
  };

  const getTrendColor = () => {
    switch (insight.trend) {
      case 'up': return 'text-emerald-600 dark:text-emerald-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      case 'critical': return 'text-red-700 dark:text-red-300';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getTrendIcon = () => {
    const iconClass = `h-6 w-6 ${getTrendColor()}`;
    
    switch (insight.trend) {
      case 'up': return <TrendingUp className={iconClass} />;
      case 'down': return <TrendingDown className={iconClass} />;
      case 'critical': return <AlertTriangle className={iconClass} />;
      case 'warning': return <AlertTriangle className={iconClass} />;
      case 'stable': return <Activity className={iconClass} />;
      default: return <Activity className={iconClass} />;
    }
  };

  const getPriorityBadgeVariant = () => {
    switch (insight.priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityLabel = () => {
    switch (insight.priority) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Baixo';
    }
  };

  return (
    <div className={showHeader ? 
      "max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg" :
      "w-full bg-background"
    }>
      {showHeader && (
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              {getTrendIcon()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{insight.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {insight.groupName} • {insight.metadata?.period}
              </p>
            </div>
            <Badge 
              className={`text-xs px-2 py-1 border ${getPriorityColor(insight.priority)}`}
              variant={getPriorityBadgeVariant()}
            >
              {getPriorityLabel()}
            </Badge>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className={showHeader ? "p-6" : "p-6"}>
        {children}
      </div>

      {/* Footer com Ações - apenas quando header está visível */}
      {showHeader && (
        <div className="flex items-center justify-between p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="text-xs text-slate-500 dark:text-slate-500">
            Insight gerado com dados reais do período analisado
          </div>
          
          <div className="flex items-center gap-3">
            {actions}
            <Button 
              onClick={() => router.push(`/groups/${insight.groupId}`)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Ver Grupo
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 