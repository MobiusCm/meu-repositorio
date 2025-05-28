'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Gere e baixe relatórios detalhados dos seus grupos de WhatsApp
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Weekly Summary</span>
            </CardTitle>
            <CardDescription>
              Resumo semanal de atividades dos grupos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Monthly Analytics</span>
            </CardTitle>
            <CardDescription>
              Análise completa do mês anterior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Custom Report</span>
            </CardTitle>
            <CardDescription>
              Relatório personalizado por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            O sistema de relatórios está sendo desenvolvido e em breve estará disponível.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidades planejadas:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Relatórios automáticos semanais e mensais</li>
            <li>Exportação em PDF, Excel e CSV</li>
            <li>Relatórios personalizados por período</li>
            <li>Análises comparativas entre grupos</li>
            <li>Gráficos e visualizações avançadas</li>
            <li>Agendamento de relatórios por email</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 