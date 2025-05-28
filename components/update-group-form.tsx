'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Upload, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/lib/supabase/schema';
import { analyzeWhatsAppChat } from '@/lib/analysis';

// Tipo para os dados do grupo
type Group = Database['public']['Tables']['groups']['Row'];
type MessageStatus = Database['public']['Tables']['messages_status']['Row'];

// Esquema de validação do formulário
const formSchema = z.object({
  name: z.string().min(3, 'O nome do grupo deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  icon: z.instanceof(File).optional(),
});

export function UpdateGroupForm({ 
  group, 
  messageStatus 
}: { 
  group: Group; 
  messageStatus?: MessageStatus 
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: group.name,
      description: group.description || '',
    },
  });

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

  // Formatar a data da última atualização
  const lastUpdated = messageStatus?.last_processed_date 
    ? new Date(messageStatus.last_processed_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Nunca';

  // Enviar atualização do grupo
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUpdating(true);
      const supabase = createClient();
      
      // Dados a serem atualizados
      const updateData: Partial<Group> = {
        name: values.name,
        description: values.description || null,
        last_updated_at: new Date().toISOString(),
      };
      
      // 1. Se tiver ícone, fazer upload para o Storage
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
          
        // Adicionar URL do ícone aos dados a serem atualizados
        updateData.icon_url = urlData.publicUrl;
      }
      
      // 2. Atualizar os dados do grupo
      const { error } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', group.id);

      if (error) throw error;
      
      toast({
        title: 'Grupo atualizado',
        description: 'As informações do grupo foram atualizadas com sucesso.',
      });
      
      setIsUpdating(false);
      router.refresh();
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast({
        title: 'Erro ao atualizar grupo',
        description: 'Ocorreu um erro ao atualizar o grupo. Tente novamente.',
        variant: 'destructive',
      });
      setIsUpdating(false);
    }
  };

  // Processar o arquivo de chat do WhatsApp
  const processWhatsAppChat = async () => {
    if (!file) return;

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
      
      // Verificar a última mensagem processada anteriormente
      let lastProcessedTimestamp = '';
      if (messageStatus?.last_message_timestamp) {
        lastProcessedTimestamp = messageStatus.last_message_timestamp;
      }
      
      // Filtrar apenas mensagens após a última processada
      let newMessages = [...messages];
      if (lastProcessedTimestamp) {
        newMessages = newMessages.filter(msg => {
          const timestampMatch = msg.match(/\[(\d{2}\/\d{2}\/\d{4}),\s(\d{2}:\d{2}:\d{2})\]/);
          if (timestampMatch) {
            const msgTimestamp = `${timestampMatch[1]} ${timestampMatch[2]}`;
            return msgTimestamp > lastProcessedTimestamp;
          }
          return false;
        });
      }
      
      // Se não houver novas mensagens
      if (newMessages.length === 0) {
        toast({
          title: 'Nenhuma mensagem nova',
          description: 'Não há novas mensagens para processar desde a última atualização.',
        });
        setIsProcessing(false);
        return;
      }
      
      // Agrupar por dia
      const byDay: Record<string, string[]> = {};
      
      let processedCount = 0;
      const totalMessages = newMessages.length;
      
      for (const msg of newMessages) {
        const match = msg.match(dateTagRegex);
        if (match) {
          const date = match[1]; // Formato: 12/04/2023
          if (!byDay[date]) {
            byDay[date] = [];
          }
          byDay[date].push(msg);
        }
        
        // Atualizar progresso
        processedCount++;
        const progress = Math.round((processedCount / totalMessages) * 40);
        setProcessingProgress(progress);
      }
      
      // Agora fazer upload dos arquivos para o Supabase
      const supabase = createClient();
      let uploadedCount = 0;
      const totalDays = Object.keys(byDay).length;
      
      for (const [date, msgs] of Object.entries(byDay)) {
        const formattedDate = date.replace(/\//g, '-'); // 12-04-2023
        const fileName = `${formattedDate}.txt`;
        
        // Criar path para ambos formatos de bucket
        const mainBucketId = 'whatsapp_messages'; // Bucket principal (com underscore)
        const backupBucketId = 'whatsapp-messages'; // Bucket de backup (com traço)
        
        const userId = (await supabase.auth.getUser()).data.user?.id || 'anonymous';
        const filePath = `${userId}/${group.id}/messages/${formattedDate}.txt`;
        
        // Verificar se o arquivo já existe
        let existingContent = '';
        let fileExists = false;
        
        // Tentar obter o arquivo existente do bucket principal
        try {
          const { data: existingFile } = await supabase
            .storage
            .from(mainBucketId)
            .getPublicUrl(filePath);
            
          if (existingFile) {
            try {
              const response = await fetch(existingFile.publicUrl);
              if (response.ok) {
                existingContent = await response.text();
                fileExists = true;
              }
            } catch (error) {
              console.error(`Erro ao ler arquivo existente de ${mainBucketId}:`, error);
            }
          }
        } catch (error) {
          console.error(`Erro ao verificar arquivo em ${mainBucketId}:`, error);
        }
        
        // Se não encontrou no bucket principal, tentar no bucket de backup
        if (!fileExists) {
          try {
            const { data: existingFile } = await supabase
              .storage
              .from(backupBucketId)
              .getPublicUrl(filePath);
              
            if (existingFile) {
              try {
                const response = await fetch(existingFile.publicUrl);
                if (response.ok) {
                  existingContent = await response.text();
                  fileExists = true;
                }
              } catch (error) {
                console.error(`Erro ao ler arquivo existente de ${backupBucketId}:`, error);
              }
            }
          } catch (error) {
            console.error(`Erro ao verificar arquivo em ${backupBucketId}:`, error);
          }
        }
        
        // Preparar o conteúdo final do arquivo
        let fileContent = '';
        if (fileExists && existingContent) {
          fileContent = existingContent + msgs.join('');
        } else {
          fileContent = msgs.join('');
        }
        
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
                group_id: group.id,
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
                  group_id: group.id,
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
          
        // Atualizar progresso
        uploadedCount++;
        const progress = 40 + Math.round((uploadedCount / totalDays) * 60);
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
            group_id: group.id,
            last_processed_date: lastDate,
            last_message_timestamp: lastMessageTimestamp,
            total_messages_count: newMessages.length + (messageStatus?.total_messages_count || 0),
            storage_bucket_id: 'whatsapp_messages'
          });
      }
      
      // Mostrar mensagem sobre análise
      toast({
        title: 'Upload concluído',
        description: 'Arquivos de chat atualizados com sucesso. Iniciando análise...',
      });
      
      try {
        // Executar análise automática para os últimos 7 dias
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        // Analisar dados para os últimos 7 dias
        await analyzeWhatsAppChat(group.id, sevenDaysAgo, today);
        
        toast({
          title: 'Análise concluída',
          description: 'Análise dos últimos 7 dias concluída com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao executar análise automática:', error);
        toast({
          title: 'Aviso',
          description: 'Arquivos de chat foram atualizados, mas houve um erro na análise automática. Os dados serão analisados quando você acessar os detalhes do grupo.',
          variant: 'destructive',
          });
      }
      
      setProcessingProgress(100);
      
      // Após 1 segundo, indicar que o processamento foi concluído
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: 'Atualização concluída',
          description: `Foram processadas ${newMessages.length} novas mensagens.`,
        });
        
        router.refresh();
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
    <div className="space-y-8">
      <Button variant="ghost" asChild className="p-0 mb-4">
        <Link href={`/groups/${group.id}`}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para o grupo
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulário de atualização de metadados */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informações do Grupo</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição opcional do grupo" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icon"
                render={() => (
                  <FormItem>
                    <FormLabel>Ícone do Grupo</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        {group.icon_url && !form.watch('icon') ? (
                          <div className="relative h-16 w-16 rounded-full overflow-hidden">
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : form.watch('icon') ? (
                          <div className="relative h-16 w-16 rounded-full overflow-hidden">
                            <Image
                              src={URL.createObjectURL(form.watch('icon') as File)}
                              alt="Novo ícone"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-2xl font-semibold">
                              {group.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('icon-update')?.click()}
                        >
                          Alterar Ícone
                        </Button>
                        <input
                          id="icon-update"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleIconUpload}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Recomendado: imagem quadrada, máximo 1MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
              
              {isUpdating && uploadProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                </div>
              )}
            </form>
          </Form>
        </Card>
        
        {/* Atualização do arquivo de chat */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Atualizar Mensagens</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              <span>Última atualização: {lastUpdated}</span>
            </div>
            
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
                  <p className="text-sm font-medium mb-1">Selecione o arquivo .txt atualizado</p>
                  <p className="text-xs text-muted-foreground mb-3">Apenas novas mensagens serão processadas</p>
                  <div className="flex justify-center">
                    <Button 
                      size="sm" 
                      onClick={() => document.getElementById('chat-update')?.click()}
                      disabled={isProcessing}
                    >
                      Selecionar Arquivo
                    </Button>
                    <input
                      id="chat-update"
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
                      ? 'Atualizando mensagens por dia...' 
                      : 'Concluindo...'}
                </p>
              </div>
            ) : (
              <Button 
                onClick={processWhatsAppChat} 
                disabled={!file}
                className="w-full"
              >
                Processar Arquivo
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
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

// Componente X para o ícone do botão de remover
const X = ({ className }: { className?: string }) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
); 