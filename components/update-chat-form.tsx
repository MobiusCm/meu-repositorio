'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  Upload, 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  X,
  Calendar,
  MessageSquare,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { getLastUpdateInfo, analyzeWhatsAppChatIncremental } from '@/lib/analysis';
import { Database } from '@/lib/supabase/schema';

// Tipos
type Group = Database['public']['Tables']['groups']['Row'];

interface UpdateChatFormProps {
  group: Group;
}

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  progress: number;
  error?: string;
}

interface LastUpdateInfo {
  lastDate: Date | null;
  lastDateFormatted: string | null;
  totalDays: number;
  hasData: boolean;
}

export function UpdateChatForm({ group }: UpdateChatFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Estados
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdateInfo, setLastUpdateInfo] = useState<LastUpdateInfo>({
    lastDate: null,
    lastDateFormatted: null,
    totalDays: 0,
    hasData: false
  });
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([
    {
      id: 'upload',
      name: 'Upload do Arquivo',
      description: 'Enviando arquivo para processamento',
      completed: false,
      progress: 0
    },
    {
      id: 'analysis',
      name: 'Análise de Mensagens',
      description: 'Processando e categorizando mensagens',
      completed: false,
      progress: 0
    },
    {
      id: 'storage',
      name: 'Armazenamento',
      description: 'Salvando dados no banco',
      completed: false,
      progress: 0
    },
    {
      id: 'statistics',
      name: 'Estatísticas',
      description: 'Calculando métricas e insights',
      completed: false,
      progress: 0
    }
  ]);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState(0);
  const [processingResults, setProcessingResults] = useState<{
    daysProcessed: number;
    newMessagesCount: number;
    success: boolean;
    error?: string;
  } | null>(null);

  // Carregar informações da última atualização
  useEffect(() => {
    const loadLastUpdateInfo = async () => {
      try {
        const info = await getLastUpdateInfo(group.id);
        setLastUpdateInfo(info);
      } catch (error) {
        console.error('Erro ao carregar informações da última atualização:', error);
      }
    };

    loadLastUpdateInfo();
  }, [group.id]);

  // Função para lidar com o upload do arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const chatFile = e.target.files[0];
      
      // Validar tipo de arquivo
      if (!chatFile.name.endsWith('.txt')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione um arquivo .txt exportado do WhatsApp.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validar tamanho (máximo 50MB)
      if (chatFile.size > 50 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 50MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(chatFile);
      setProcessingResults(null);
    }
  };

  // Atualizar estágio de processamento
  const updateStage = (stageId: string, progress: number, completed: boolean = false, error?: string) => {
    setProcessingStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, progress, completed, error }
        : stage
    ));
    
    if (completed && !error) {
      setCurrentStage('');
    } else if (!completed) {
      setCurrentStage(stageId);
    }
  };

  // Processar arquivo de chat
  const processWhatsAppChat = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setOverallProgress(0);
      setProcessingResults(null);
      
      // Resetar estágios
      setProcessingStages(prev => prev.map(stage => ({
        ...stage,
        completed: false,
        progress: 0,
        error: undefined
      })));

      // Estágio 1: Upload e validação
      updateStage('upload', 10);
      
      const supabase = createClient();
      
      // Ler conteúdo do arquivo
      const content = await file.text();
      
      // Validar formato do arquivo
      const messageRegex = /\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\]/;
      if (!messageRegex.test(content)) {
        throw new Error('Formato de arquivo inválido. Certifique-se de que é um arquivo de chat exportado do WhatsApp.');
      }
      
      updateStage('upload', 50);
      
      // Processar mensagens por dia
      const msgBlockRegex = /\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\][\s\S]*?(?=\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\]|$)/g;
      const dateTagRegex = /\[(\d{2}\/\d{2}\/\d{4})/;
      
      const messages = content.match(msgBlockRegex) || [];
      
      if (messages.length === 0) {
        throw new Error('Nenhuma mensagem válida encontrada no arquivo.');
      }
      
      updateStage('upload', 80);
      
      // Determinar data de início para processamento
      let fromDate: Date;
      if (lastUpdateInfo.hasData && lastUpdateInfo.lastDate) {
        // Começar do último dia processado para reprocessar e garantir completude
        fromDate = lastUpdateInfo.lastDate;
      } else {
        // Se não há dados, processar tudo
        fromDate = new Date('2020-01-01'); // Data bem antiga para pegar tudo
      }
      
      updateStage('upload', 100, true);
      
      // Agrupar mensagens por dia
      const byDay: Record<string, string[]> = {};
      let newMessagesCount = 0;
      
      updateStage('analysis', 10);
      
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const match = msg.match(dateTagRegex);
        
        if (match) {
          const date = match[1]; // Formato: 12/04/2023
          const [day, month, year] = date.split('/');
          const msgDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          // Só processar mensagens a partir da data de início
          if (msgDate >= fromDate) {
            if (!byDay[date]) {
              byDay[date] = [];
            }
            byDay[date].push(msg);
            newMessagesCount++;
          }
        }
        
        // Atualizar progresso da análise
        const analysisProgress = Math.round((i / messages.length) * 80);
        updateStage('analysis', analysisProgress);
      }
      
      updateStage('analysis', 100, true);
      
      if (Object.keys(byDay).length === 0) {
        toast({
          title: 'Nenhuma mensagem nova',
          description: 'Não há novas mensagens para processar desde a última atualização.',
        });
        setIsProcessing(false);
        return;
      }
      
      // Estágio 3: Armazenamento
      updateStage('storage', 10);
      
      const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      let uploadedCount = 0;
      const totalDays = Object.keys(byDay).length;
      
      for (const [date, msgs] of Object.entries(byDay)) {
        const formattedDate = date.replace(/\//g, '-'); // 12-04-2023
        const filePath = `${userId}/${group.id}/messages/${formattedDate}.txt`;
        
        // Criar conteúdo do arquivo
        const fileContent = msgs.join('');
        const blob = new Blob([fileContent], { type: 'text/plain' });
        
        // Upload para o storage
        const { error: uploadError } = await supabase
          .storage
          .from('whatsapp_messages')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
          });
        
        if (uploadError) {
          console.error(`Erro ao fazer upload do arquivo ${date}:`, uploadError);
          // Tentar bucket alternativo
          await supabase
            .storage
            .from('whatsapp-messages')
            .upload(filePath, blob, {
              cacheControl: '3600',
              upsert: true,
            });
        }
        
        // Registrar arquivo na tabela
        const dateParts = date.split('/');
        const sqlFormattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        
        await supabase
          .from('group_message_files')
          .upsert({
            group_id: group.id,
            storage_path: filePath,
            file_date: sqlFormattedDate,
            file_size: blob.size,
            message_count: msgs.length,
            bucket_id: 'whatsapp_messages',
            updated_at: new Date().toISOString()
          });
        
        uploadedCount++;
        const storageProgress = Math.round((uploadedCount / totalDays) * 100);
        updateStage('storage', storageProgress);
      }
      
      updateStage('storage', 100, true);
      
      // Estágio 4: Análise estatística
      updateStage('statistics', 10);
      
      const analysisResult = await analyzeWhatsAppChatIncremental(
        group.id,
        fromDate,
        (progress, stage) => {
          updateStage('statistics', Math.round(progress));
        }
      );
      
      updateStage('statistics', 100, true);
      
      // Definir resultados
      setProcessingResults({
        daysProcessed: analysisResult.daysProcessed,
        newMessagesCount: analysisResult.newMessagesCount,
        success: analysisResult.success,
        error: analysisResult.error
      });
      
      setOverallProgress(100);
      
      if (analysisResult.success) {
        toast({
          title: 'Atualização concluída!',
          description: `Processados ${analysisResult.daysProcessed} dias com ${analysisResult.newMessagesCount} mensagens.`,
        });
        
        // Atualizar informações da última atualização
        const updatedInfo = await getLastUpdateInfo(group.id);
        setLastUpdateInfo(updatedInfo);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push(`/groups/${group.id}`);
        }, 3000);
      } else {
        throw new Error(analysisResult.error || 'Erro desconhecido na análise');
      }
      
    } catch (error) {
      console.error('Erro ao processar arquivo de chat:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      // Marcar estágio atual como erro
      if (currentStage) {
        updateStage(currentStage, 0, false, errorMessage);
      }
      
      setProcessingResults({
        daysProcessed: 0,
        newMessagesCount: 0,
        success: false,
        error: errorMessage
      });
      
      toast({
        title: 'Erro ao processar arquivo',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calcular progresso geral
  useEffect(() => {
    const completedStages = processingStages.filter(stage => stage.completed).length;
    const totalStages = processingStages.length;
    const currentStageProgress = processingStages.find(stage => stage.id === currentStage)?.progress || 0;
    
    const baseProgress = (completedStages / totalStages) * 100;
    const currentProgress = currentStage ? (currentStageProgress / totalStages) : 0;
    
    setOverallProgress(Math.min(baseProgress + currentProgress, 100));
  }, [processingStages, currentStage]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/groups/${group.id}`}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Atualizar Chat</h1>
            <p className="text-muted-foreground">{group.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da última atualização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Status Atual</span>
            </CardTitle>
            <CardDescription>
              Informações sobre os dados existentes do grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastUpdateInfo.hasData ? (
              <>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Última atualização</p>
                      <p className="text-sm text-muted-foreground">
                        {lastUpdateInfo.lastDateFormatted}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {lastUpdateInfo.totalDays} dias
                  </Badge>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O novo arquivo deve conter mensagens a partir de{' '}
                    <strong>{lastUpdateInfo.lastDateFormatted}</strong> para garantir que nenhuma mensagem seja perdida.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Este grupo ainda não possui dados processados. O arquivo será analisado completamente.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Upload do arquivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Novo Arquivo de Chat</span>
            </CardTitle>
            <CardDescription>
              Faça upload do arquivo .txt exportado do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Instruções */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Como exportar:</h4>
              <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Abra o grupo no WhatsApp</li>
                <li>Toque nos três pontos (⋮) no canto superior</li>
                <li>Selecione "Mais" → "Exportar conversa"</li>
                <li>Escolha "SEM MÍDIA"</li>
                <li>Salve o arquivo .txt</li>
              </ol>
            </div>

            {/* Área de upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Selecione o arquivo .txt</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Máximo 50MB
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => document.getElementById('chat-file')?.click()}
                    disabled={isProcessing}
                  >
                    Selecionar Arquivo
                  </Button>
                  <input
                    id="chat-file"
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </div>
              </div>
              
              {/* Arquivo selecionado */}
              {file && !isProcessing && (
                <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded bg-primary/10 p-1">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Botão de processar */}
            <Button 
              onClick={processWhatsAppChat} 
              disabled={!file || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Processar e Analisar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progresso do processamento */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processando Arquivo</span>
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso da análise em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progresso geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* Estágios detalhados */}
            <div className="space-y-4">
              {processingStages.map((stage) => (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {stage.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : stage.error ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : currentStage === stage.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stage.completed ? '100%' : `${stage.progress}%`}
                    </span>
                  </div>
                  
                  {stage.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{stage.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {!stage.completed && !stage.error && (
                    <Progress value={stage.progress} className="h-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {processingResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {processingResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>
                {processingResults.success ? 'Processamento Concluído!' : 'Erro no Processamento'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processingResults.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Dias Processados</p>
                      <p className="text-sm text-green-700">{processingResults.daysProcessed}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Novas Mensagens</p>
                      <p className="text-sm text-blue-700">{processingResults.newMessagesCount.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Redirecionando para a análise do grupo em alguns segundos...
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {processingResults.error || 'Erro desconhecido durante o processamento.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 