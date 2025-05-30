'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, ArrowRight, Check, Loader2, Camera } from 'lucide-react';
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
import Image from 'next/image';

// Esquema de validação do formulário
const formSchema = z.object({
  name: z.string().min(3, 'O nome do grupo deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  memberCount: z.number().min(0, 'O número de membros deve ser positivo').optional(),
  icon: z.instanceof(File).optional(),
});

export function AddGroupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  // Estado para controlar as etapas
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [messagesByDay, setMessagesByDay] = useState<Record<string, string[]>>({});
  const { toast } = useToast();
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Configuração do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      memberCount: 0,
    },
  });

  // Progresso para próxima etapa
  const nextStep = () => {
    if (currentStep < 1) {
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
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, GIF ou WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setIconFile(file);
    form.setValue('icon', file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setIconPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    form.setValue('icon', undefined);
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
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
          description: values.description || null,
          member_count: values.memberCount || null,
        })
        .select()
        .single();

      if (error) throw error;
      setGroupId(group.id);

      // 2. Se tiver ícone, fazer upload para o Storage
      if (values.icon) {
        const fileExt = values.icon.name.split('.').pop();
        const fileName = `${group.id}-${Date.now()}.${fileExt}`;
        const filePath = `groups/${fileName}`;
        
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
            upsert: false,
          });

        if (uploadError) {
          console.error('Erro no upload do ícone:', uploadError);
          throw new Error(`Falha no upload do ícone: ${uploadError.message || 'Erro desconhecido'}`);
        }
        
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

  // Renderizar etapa 1 - Informações básicas do grupo
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Upload className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Criar Novo Grupo</h3>
        <p className="text-sm text-muted-foreground">
          Informe os dados básicos do grupo de WhatsApp
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-4">
          {/* Upload de Foto */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Foto do Grupo</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {iconPreview ? (
                  <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-background">
                    <Image
                      src={iconPreview}
                      alt="Preview da foto do grupo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Foto
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF ou WebP. Máximo 5MB.
                </p>
              </div>
            </div>
            
            <input
              ref={iconInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleIconUpload}
              className="hidden"
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Grupo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Família Silva" {...field} />
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
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memberCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Total de Membros</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Ex: 25"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress > 0 ? `${uploadProgress}%` : 'Criando...'}
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 0 ? 'Novo Grupo' : 'Upload de Mensagens'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 0 
              ? 'Insira as informações básicas do grupo'
              : 'Faça upload do arquivo de chat exportado do WhatsApp'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Etapa 1: Informações do Grupo */}
          {currentStep === 0 && renderStep1()}

          {/* Etapa 2: Upload de Chat */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Upload de Mensagens</h3>
                <p className="text-sm text-muted-foreground">
                  Faça upload do arquivo de chat exportado do WhatsApp
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="chat-file"
                  />
                  <label htmlFor="chat-file" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">
                      {file ? file.name : 'Clique para selecionar o arquivo de chat'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Arquivo .txt exportado do WhatsApp
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    Voltar
                  </Button>
                  <Button
                    onClick={processWhatsAppChat}
                    disabled={!file || isProcessing}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {processingProgress}%
                      </>
                    ) : (
                      <>
                        Processar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={processingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {processingProgress < 20 && 'Analisando mensagens...'}
                      {processingProgress >= 20 && processingProgress < 50 && 'Fazendo upload dos arquivos...'}
                      {processingProgress >= 50 && 'Executando análise dos dados...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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