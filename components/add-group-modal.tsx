'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { analyzeWhatsAppChat } from '@/lib/analysis';

// Esquema de validação do formulário
const formSchema = z.object({
  name: z.string().min(3, 'O nome do grupo deve ter pelo menos 3 caracteres'),
  icon: z.instanceof(File).optional(),
});

export function AddGroupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  // Estado para controlar as etapas
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [messagesByDay, setMessagesByDay] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // Progresso para próxima etapa
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Voltar para etapa anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Função para lidar com o upload do ícone
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const iconFile = e.target.files[0];
      form.setValue('icon', iconFile);
    }
  };

  // Função para lidar com o upload do arquivo de chat
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const chatFile = e.target.files[0];
      setFile(chatFile);
    }
  };

  // Enviar etapa 1 - Criação do grupo
  const onSubmitStep1 = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      const supabase = createClient();
      
      // 1. Criar novo grupo no Supabase
      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name: values.name,
        })
        .select()
        .single();

      if (error) throw error;
      setGroupId(group.id);

      // 2. Se tiver ícone, fazer upload para o Storage
      if (values.icon) {
        const fileExt = values.icon.name.split('.').pop();
        const filePath = `group-icons/${group.id}.${fileExt}`;
        
        // Simular progresso de upload
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval);
              return 95;
            }
            return prev + 5;
          });
        }, 100);

        const { error: uploadError } = await supabase
          .storage
          .from('group-icons')
          .upload(filePath, values.icon, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;
        clearInterval(interval);
        setUploadProgress(100);

        // Obter URL pública do ícone
        const { data: urlData } = supabase
          .storage
          .from('group-icons')
          .getPublicUrl(filePath);

        // Atualizar o grupo com o URL do ícone
        await supabase
          .from('groups')
          .update({ icon_url: urlData.publicUrl })
          .eq('id', group.id);
      }

      setIsUploading(false);
      nextStep();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: 'Erro ao criar grupo',
        description: 'Ocorreu um erro ao criar o grupo. Tente novamente.',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  // Processar o arquivo de chat do WhatsApp
  const processWhatsAppChat = async () => {
    if (!file || !groupId) return;

    try {
      setIsProcessing(true);
      setProcessingProgress(0);

      // Ler o conteúdo do arquivo
      const content = await file.text();
      
      // Regex para mensagens do WhatsApp
      const msgBlockRegex = /\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\][\s\S]*?(?=\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\]|$)/g;
      const dateTagRegex = /\[(\d{2}\/\d{2}\/\d{4})/;
      
      // Encontrar todas as mensagens
      const messages = content.match(msgBlockRegex) || [];
      
      // Agrupar por dia
      const byDay: Record<string, string[]> = {};
      
      let processedCount = 0;
      const totalMessages = messages.length;
      
      // Atualizar progresso para refletir que temos 3 etapas:
      // 1. Processamento inicial (20%)
      // 2. Upload dos arquivos (30%)
      // 3. Análise dos dados (50%)
      
      toast({
        title: 'Processando arquivo',
        description: 'Organizando mensagens por data...',
      });
      
      for (const msg of messages) {
        const match = msg.match(dateTagRegex);
        if (match) {
          const date = match[1]; // Formato: 12/04/2023
          if (!byDay[date]) {
            byDay[date] = [];
          }
          byDay[date].push(msg);
        }
        
        // Atualizar progresso - primeira etapa é 20% do total
        processedCount++;
        const progress = Math.round((processedCount / totalMessages) * 20);
        setProcessingProgress(progress);
      }
      
      setMessagesByDay(byDay);
      
      // Agora fazer upload dos arquivos para o Supabase
      const supabase = createClient();
      let uploadedCount = 0;
      const totalDays = Object.keys(byDay).length;
      
      toast({
        title: 'Fazendo upload dos arquivos',
        description: `Carregando arquivos para ${totalDays} dias...`,
      });
      
      for (const [date, msgs] of Object.entries(byDay)) {
        const formattedDate = date.replace(/\//g, '-'); // 12-04-2023
        const fileName = `${formattedDate}.txt`;
        
        // Criar path para ambos formatos de bucket
        const mainBucketId = 'whatsapp_messages'; // Bucket principal (com underscore)
        const backupBucketId = 'whatsapp-messages'; // Bucket de backup (com traço)
        
        const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
        const filePath = `${userId}/${groupId}/messages/${formattedDate}.txt`;
        const fileContent = msgs.join('');
        
        // Criar Blob a partir do conteúdo
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const fileSize = blob.size;
        
        // Tentar fazer upload no bucket principal
        let uploadSuccess = false;
        let uploadError = null;
        
        try {
          const { error } = await supabase
            .storage
            .from(mainBucketId)
            .upload(filePath, blob, {
              cacheControl: '3600',
              upsert: true,
            });
            
          if (!error) {
            uploadSuccess = true;
            
            // Registrar arquivo na tabela group_message_files
            const dateParts = date.split('/');
            const sqlFormattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Formato YYYY-MM-DD para SQL
            
            await supabase
              .from('group_message_files')
              .upsert({
                group_id: groupId,
                storage_path: filePath,
                file_date: sqlFormattedDate,
                file_size: fileSize,
                message_count: msgs.length,
                bucket_id: mainBucketId,
                updated_at: new Date().toISOString()
              });
          } else {
            uploadError = error;
            console.error(`Erro ao fazer upload para bucket principal (${mainBucketId}) - ${fileName}:`, error);
          }
        } catch (error) {
          console.error(`Exceção ao fazer upload para bucket principal (${mainBucketId}):`, error);
          uploadError = error;
        }
        
        // Se falhou no bucket principal, tentar no bucket de backup
        if (!uploadSuccess) {
          try {
            const { error } = await supabase
              .storage
              .from(backupBucketId)
              .upload(filePath, blob, {
                cacheControl: '3600',
                upsert: true,
              });
              
            if (!error) {
              uploadSuccess = true;
              
              // Registrar arquivo na tabela group_message_files com bucket de backup
              const dateParts = date.split('/');
              const sqlFormattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Formato YYYY-MM-DD para SQL
              
              await supabase
                .from('group_message_files')
                .upsert({
                  group_id: groupId,
                  storage_path: filePath,
                  file_date: sqlFormattedDate,
                  file_size: fileSize,
                  message_count: msgs.length,
                  bucket_id: backupBucketId,
                  updated_at: new Date().toISOString()
                });
            } else {
              console.error(`Erro ao fazer upload para bucket de backup (${backupBucketId}) - ${fileName}:`, error);
              toast({
                title: 'Erro ao fazer upload do arquivo',
                description: `Não foi possível fazer upload do arquivo ${fileName}. Por favor, tente novamente.`,
                variant: 'destructive',
              });
            }
          } catch (error) {
            console.error(`Exceção ao fazer upload para bucket de backup (${backupBucketId}):`, error);
          }
        }
          
        // Atualizar progresso - segunda etapa é 30% do total (20% a 50%)
        uploadedCount++;
        const progress = 20 + Math.round((uploadedCount / totalDays) * 30);
        setProcessingProgress(progress);
      }
      
      // Após todos os uploads, registrar a mensagem mais recente
      const lastDate = Object.keys(byDay).sort().pop();
      if (lastDate) {
        const lastMessages = byDay[lastDate];
        const lastMessage = lastMessages[lastMessages.length - 1];
        
        // Extrair o timestamp da última mensagem
        const timestampMatch = lastMessage.match(/\[\d{2}\/\d{2}\/\d{4},\s(\d{2}:\d{2}:\d{2})\]/);
        const lastMessageTimestamp = timestampMatch ? `${lastDate} ${timestampMatch[1]}` : lastDate;
        
        // Atualizar o status de mensagens
        await supabase
          .from('messages_status')
          .upsert({
            group_id: groupId,
            last_processed_date: lastDate,
            last_message_timestamp: lastMessageTimestamp,
            total_messages_count: messages.length,
            storage_bucket_id: 'whatsapp_messages' // Registrar qual bucket contém as mensagens
          });
      }
      
      // Configurar progresso para 50% antes de iniciar a análise
      setProcessingProgress(50);
      
      // Mostrar mensagem sobre análise
      toast({
        title: 'Iniciando análise',
        description: 'Arquivos carregados com sucesso. Analisando dados...',
      });
      
      try {
        // Executar análise automática para os últimos 7 dias
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        // Analisar dados para os últimos 7 dias - terceira etapa é 50% restantes (50% a 100%)
        // Configurar um intervalo para simular o progresso da análise
        const analysisInterval = setInterval(() => {
          setProcessingProgress((prev) => {
            if (prev >= 95) {
              clearInterval(analysisInterval);
              return 95;
            }
            return prev + 1;
          });
        }, 100);
        
        // Analisar cada dia individualmente
        const dayPromises = Object.keys(byDay).map(async (date) => {
          // Converter para formato de data JavaScript
          const dateParts = date.split('/');
          const startDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          
          // Adicionar 1 dia para incluir mensagens até o final do dia
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          
          // Analisar este dia específico
          return analyzeWhatsAppChat(groupId, startDate, endDate);
        });
        
        // Aguardar todas as análises
        await Promise.all(dayPromises);
        
        // E também fazer análise consolidada dos últimos 7 dias para ter visão global
        await analyzeWhatsAppChat(groupId, sevenDaysAgo, today);
        
        // Limpar o intervalo caso ainda esteja rodando
        clearInterval(analysisInterval);
        
        // Definir progresso como 100%
        setProcessingProgress(100);
        
        toast({
          title: 'Análise concluída',
          description: 'Análise dos dados concluída com sucesso! Redirecionando para detalhes do grupo...',
        });
      } catch (error) {
        console.error('Erro ao executar análise inicial:', error);
        toast({
          title: 'Aviso',
          description: 'Arquivos de chat foram carregados, mas houve um erro na análise. Os dados serão analisados quando você acessar os detalhes do grupo.',
          variant: 'destructive',
        });
        
        // Mesmo com erro, definir como 100% e continuar
      setProcessingProgress(100);
      }
      
      // Após 1 segundo, redirecionar para a página do grupo
      setTimeout(() => {
        setIsProcessing(false);
        router.push(`/groups/${groupId}`);
        router.refresh();
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao processar arquivo de chat:', error);
      toast({
        title: 'Erro ao processar o arquivo',
        description: 'Ocorreu um erro ao processar o arquivo de chat. Tente novamente.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 0 
              ? 'Adicionar Novo Grupo' 
              : currentStep === 1 
                ? 'Upload de Ícone (Opcional)' 
                : 'Upload do Arquivo de Chat'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {currentStep === 0 
              ? 'Formulário para adicionar um novo grupo de WhatsApp' 
              : currentStep === 1 
                ? 'Upload de um ícone opcional para o grupo' 
                : 'Upload do arquivo de chat do WhatsApp para análise'}
          </DialogDescription>
        </DialogHeader>

        {/* Etapa 1: Nome do Grupo */}
        {currentStep === 0 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Grupo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                </div>
              )}
            </form>
          </Form>
        )}

        {/* Etapa 2: Upload de Ícone (Opcional) */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Escolha um ícone para o grupo (opcional)</p>
                  <p className="text-xs text-muted-foreground mb-3">Recomendado: imagem quadrada, máximo 1MB</p>
                  <div className="flex justify-center">
                    <Button size="sm" onClick={() => document.getElementById('icon-upload')?.click()}>
                      Selecionar Imagem
                    </Button>
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconUpload}
                    />
                  </div>
                </div>
              </div>
              {form.watch('icon') && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                    <img
                      src={URL.createObjectURL(form.watch('icon') as File)}
                      alt="Ícone"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Voltar
              </Button>
              <Button onClick={nextStep}>
                {form.watch('icon') ? 'Continuar' : 'Pular esta etapa'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 3: Upload do arquivo de chat */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Como exportar o chat do WhatsApp:</h3>
              <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                <li>Abra o grupo no WhatsApp</li>
                <li>Toque nos três pontos no canto superior direito</li>
                <li>Selecione "Mais" e depois "Exportar conversa"</li>
                <li>Escolha "SEM MÍDIA"</li>
                <li>Salve ou compartilhe o arquivo .txt</li>
              </ol>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Arraste o arquivo .txt do WhatsApp</p>
                  <p className="text-xs text-muted-foreground mb-3">Ou clique para selecionar manualmente</p>
                  <div className="flex justify-center">
                    <Button size="sm" onClick={() => document.getElementById('chat-upload')?.click()} disabled={isProcessing}>
                      Selecionar Arquivo
                    </Button>
                    <input
                      id="chat-upload"
                      type="file"
                      accept=".txt"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
              {file && !isProcessing && (
                <div className="mt-4 p-2 bg-muted rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="rounded bg-primary/10 p-1 mr-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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

            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processando arquivo de chat...</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {processingProgress < 40 
                    ? 'Analisando mensagens...' 
                    : processingProgress < 95 
                      ? 'Salvando mensagens por dia...' 
                      : 'Concluindo...'}
                </p>
              </div>
            ) : (
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Voltar
                </Button>
                <Button 
                  onClick={processWhatsAppChat} 
                  disabled={!file || !groupId}
                >
                  Processar Arquivo
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Componente FileText para o ícone do arquivo
const FileText = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
); 