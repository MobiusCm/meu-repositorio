'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Brain,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Star,
  Heart,
  Calculator,
  Code,
  Play,
  ArrowRight,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Globe,
  Eye,
  Award,
  Flame,
  Shield
} from 'lucide-react';
import Link from 'next/link';

// Seções da documentação
const DOCUMENTATION_SECTIONS = [
  {
    id: 'introduction',
    title: 'Introdução aos Smart Insights',
    icon: Brain,
    description: 'Entenda o que são e como funcionam os Smart Insights'
  },
  {
    id: 'getting-started',
    title: 'Começando',
    icon: Play,
    description: 'Primeiros passos para criar seu primeiro insight'
  },
  {
    id: 'variables',
    title: 'Variáveis Disponíveis',
    icon: BarChart3,
    description: 'Todas as métricas que você pode usar em suas fórmulas'
  },
  {
    id: 'periods',
    title: 'Períodos de Tempo',
    icon: Clock,
    description: 'Como usar diferentes períodos temporais em suas análises'
  },
  {
    id: 'operators',
    title: 'Operadores e Lógica',
    icon: Calculator,
    description: 'Operadores matemáticos e lógicos para construir fórmulas'
  },
  {
    id: 'templates',
    title: 'Templates Prontos',
    icon: Lightbulb,
    description: 'Exemplos práticos e templates para inspiração'
  },
  {
    id: 'best-practices',
    title: 'Boas Práticas',
    icon: Star,
    description: 'Dicas para criar insights eficazes e úteis'
  },
  {
    id: 'examples',
    title: 'Exemplos Avançados',
    icon: Zap,
    description: 'Casos de uso complexos e fórmulas sofisticadas'
  }
];

export default function SmartInsightsDocPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Toast notification would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg mb-6">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Insights
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Documentação Completa
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Aprenda a criar insights inteligentes e personalizados para monitorar e analisar 
            a performance da sua comunidade com precisão e flexibilidade total.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/admin/insights">
                <Brain className="h-5 w-5 mr-2" />
                Criar Meu Primeiro Insight
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/admin/insights/custom">
                <Eye className="h-5 w-5 mr-2" />
                Ver Insights Existentes
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegação */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Índice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DOCUMENTATION_SECTIONS.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{section.title}</div>
                        <div className="text-xs text-muted-foreground">{section.description}</div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Introdução */}
            {activeSection === 'introduction' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Brain className="h-8 w-8 text-blue-600" />
                      O que são Smart Insights?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-lg text-muted-foreground">
                      Smart Insights são <strong>regras inteligentes personalizáveis</strong> que monitoram 
                      automaticamente a atividade da sua comunidade e alertam quando condições específicas 
                      são atendidas. Eles transformam dados brutos em informações acionáveis.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-green-900 dark:text-green-100">Automático</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Monitoramento contínuo sem intervenção manual
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <CardContent className="p-4 text-center">
                          <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Personalizável</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Crie regras específicas para suas necessidades
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                        <CardContent className="p-4 text-center">
                          <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Acionável</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Insights que levam a ações concretas
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Como Funcionam?</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                            <span className="text-blue-600 font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">Você define as condições</h4>
                            <p className="text-muted-foreground">
                              Usando variáveis, operadores e períodos de tempo para criar uma fórmula lógica
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                            <span className="text-blue-600 font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">O sistema monitora continuamente</h4>
                            <p className="text-muted-foreground">
                              Avalia suas condições em tempo real conforme novos dados chegam
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                            <span className="text-blue-600 font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">Você recebe alertas inteligentes</h4>
                            <p className="text-muted-foreground">
                              Notificações personalizadas quando suas condições são atendidas
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-6 w-6 text-amber-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                          Exemplo Prático
                        </h3>
                        <p className="text-amber-800 dark:text-amber-200 mb-3">
                          "Quero ser notificado quando meu grupo tiver mais de 50% de crescimento em mensagens 
                          nos últimos 7 dias E a taxa de participação for maior que 70%"
                        </p>
                        <code className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 px-3 py-2 rounded text-sm">
                          message_growth_rate_last_7_days &gt; 50 && participation_rate_last_7_days &gt; 70
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Começando */}
            {activeSection === 'getting-started' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Play className="h-8 w-8 text-green-600" />
                      Seus Primeiros Passos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6">
                      <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                          Escolha um Template ou Comece do Zero
                        </h3>
                        <p className="mb-4 text-muted-foreground">
                          Para começar rapidamente, use um dos nossos templates prontos. Para mais controle, 
                          crie do zero definindo nome, descrição e ícone.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">🚀 Recomendado: Templates</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Comece com exemplos testados e personalize conforme necessário
                              </p>
                              <Button size="sm" className="w-full">
                                Ver Templates Disponíveis
                              </Button>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">🎨 Personalizado</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Controle total desde o início para necessidades específicas
                              </p>
                              <Button size="sm" variant="outline" className="w-full">
                                Criar do Zero
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                          Construa sua Fórmula
                        </h3>
                        <p className="mb-4 text-muted-foreground">
                          Use nosso construtor visual ou digite diretamente. Combine variáveis, 
                          operadores e períodos para criar a lógica perfeita.
                        </p>
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                          <h4 className="font-semibold mb-2">Exemplo de Construção:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Variável</Badge>
                              <code>active_members_last_7_days</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Operador</Badge>
                              <code>&gt;</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Valor</Badge>
                              <code>20</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Lógica</Badge>
                              <code>&&</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Condição 2</Badge>
                              <code>participation_rate &gt; 60</code>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                          Teste e Ajuste
                        </h3>
                        <p className="mb-4 text-muted-foreground">
                          Use dados reais para testar sua fórmula antes de ativar. 
                          Veja se os resultados fazem sentido e ajuste conforme necessário.
                        </p>
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900 dark:text-green-100">
                              Teste Bem-sucedido
                            </span>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Sua fórmula seria ativada com os dados atuais: 
                            <code className="ml-2 bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                              Resultado: true
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Variáveis Disponíveis */}
            {activeSection === 'variables' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <BarChart3 className="h-8 w-8 text-indigo-600" />
                      Variáveis Disponíveis
                    </CardTitle>
                    <CardDescription>
                      Todas as métricas que você pode usar para criar suas fórmulas inteligentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Básicas</TabsTrigger>
                        <TabsTrigger value="growth">Crescimento</TabsTrigger>
                        <TabsTrigger value="quality">Qualidade</TabsTrigger>
                        <TabsTrigger value="advanced">Avançadas</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid gap-4">
                          {[
                            {
                              name: 'total_messages',
                              label: 'Total de Mensagens',
                              description: 'Número total de mensagens enviadas no período',
                              example: '1,547 mensagens',
                              type: 'Contador',
                              periods: ['Hoje', 'Últimos 7 dias', 'Últimos 30 dias']
                            },
                            {
                              name: 'active_members',
                              label: 'Membros Ativos',
                              description: 'Membros que enviaram pelo menos uma mensagem',
                              example: '28 membros',
                              type: 'Contador',
                              periods: ['Hoje', 'Últimos 7 dias', 'Últimos 30 dias']
                            },
                            {
                              name: 'participation_rate',
                              label: 'Taxa de Participação',
                              description: 'Percentual de membros que participaram ativamente',
                              example: '62%',
                              type: 'Percentual',
                              periods: ['Hoje', 'Últimos 7 dias', 'Últimos 30 dias']
                            }
                          ].map((variable, index) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="font-semibold text-lg">{variable.label}</h3>
                                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {variable.name}
                                    </code>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline">{variable.type}</Badge>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Ex: {variable.example}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-muted-foreground mb-3">{variable.description}</p>
                                <div>
                                  <span className="text-sm font-medium">Períodos disponíveis:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {variable.periods.map(period => (
                                      <Badge key={period} variant="secondary" className="text-xs">
                                        {period}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Outras abas... */}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Templates */}
            {activeSection === 'templates' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Lightbulb className="h-8 w-8 text-amber-600" />
                      Templates Prontos
                    </CardTitle>
                    <CardDescription>
                      Exemplos testados e prontos para usar ou personalizar conforme sua necessidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {[
                        {
                          name: 'Crescimento Explosivo',
                          description: 'Detecta crescimento excepcional comparado ao histórico',
                          icon: TrendingUp,
                          complexity: 'Iniciante',
                          category: 'Crescimento',
                          formula: 'message_growth_rate_last_7_days > 50 && momentum_score > 80',
                          explanation: 'Ativa quando há mais de 50% de crescimento nos últimos 7 dias E o momentum está alto',
                          useCase: 'Identificar quando estratégias de engajamento estão funcionando excepcionalmente bem',
                          color: 'green'
                        },
                        {
                          name: 'Comunidade Vibrante',
                          description: 'Identifica comunidades com alta qualidade de interação',
                          icon: Heart,
                          complexity: 'Intermediário',
                          category: 'Engajamento',
                          formula: 'participation_rate_last_30_days > 70 && quality_score > 75 && diversity_index > 0.6',
                          explanation: 'Ativa quando há alta participação, qualidade e diversidade nas discussões',
                          useCase: 'Reconhecer comunidades saudáveis e usar como modelo para outras',
                          color: 'pink'
                        },
                        {
                          name: 'Alerta de Declínio',
                          description: 'Detecta sinais precoces de declínio preocupante',
                          icon: AlertTriangle,
                          complexity: 'Intermediário',
                          category: 'Alertas',
                          formula: 'engagement_trend == -1 && retention_rate < 60',
                          explanation: 'Ativa quando há tendência negativa e baixa retenção',
                          useCase: 'Intervir rapidamente quando a comunidade mostra sinais de declínio',
                          color: 'amber'
                        }
                      ].map((template, index) => {
                        const IconComponent = template.icon;
                        return (
                          <Card key={index} className={`border-l-4 border-l-${template.color}-500`}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/30`}>
                                  <IconComponent className={`h-6 w-6 text-${template.color}-600`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold">{template.name}</h3>
                                    <Badge variant="outline">{template.complexity}</Badge>
                                    <Badge variant="secondary">{template.category}</Badge>
                                  </div>
                                  <p className="text-muted-foreground mb-4">{template.description}</p>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-semibold mb-2">Fórmula:</h4>
                                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 relative">
                                        <code className="text-sm font-mono">{template.formula}</code>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="absolute top-2 right-2"
                                          onClick={() => copyToClipboard(template.formula, template.name)}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Como funciona:</h4>
                                      <p className="text-sm text-muted-foreground">{template.explanation}</p>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Caso de uso:</h4>
                                      <p className="text-sm text-muted-foreground">{template.useCase}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 mt-4">
                                    <Button size="sm">
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      Usar Template
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Code className="h-4 w-4 mr-2" />
                                      Personalizar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Outras seções seriam implementadas de forma similar... */}
          </div>
        </div>
      </div>
    </div>
  );
} 