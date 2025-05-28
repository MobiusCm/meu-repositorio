'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

export default function MemberInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Insights</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada dos membros dos seus grupos de WhatsApp
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">987</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8% this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Members
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3 rotate-180" />
              -3% this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">79.9%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2.1% this month
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta seção está sendo desenvolvida e em breve terá análises detalhadas dos membros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidades planejadas:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Perfis detalhados de membros</li>
            <li>Análise de comportamento e padrões</li>
            <li>Ranking de participação</li>
            <li>Identificação de influenciadores</li>
            <li>Histórico de atividade</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 