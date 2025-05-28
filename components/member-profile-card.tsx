'use client';

import { useState, useEffect } from 'react';
import { User, FileText, Clock, MessageSquare, Image, Type, AlertCircle, Check, Loader2, Brain, BookOpen, List, Settings, Heart, ThumbsDown, Info, MessageCircle, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { profileMember, getMemberProfile } from '@/lib/member-profiler';
import { analyzeMemberMessages, AIAnalysis } from '@/lib/ai-analysis';

interface MemberProfileCardProps {
  groupId: string;
  memberName: string;
  memberColor: string;
  messageCount: number;
  wordCount: number;
  mediaCount: number;
  isProfiled: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

interface Analysis {
  identificacao: {
    nome: string;
    total_mensagens_analisadas: number;
    resumo_geral: string;
  };
  comportamento_e_personalidade: {
    topicos_frequentes: string[];
    estilo_de_escrita: string;
    tom_de_comunicacao: string;
    padroes_de_humor: string;
    nivel_prolixidade: string;
    uso_emojis: string;
    participacao_polemicas: string;
    horarios_atividade: string[];
    frases_caracteristicas: string[];
  };
  preferencias_e_opinioes: {
    gosta_de: string[];
    nao_gosta_de: string[];
    preferencias_explicitas: string[];
    posicionamentos: string[];
  };
  outros: {
    informacoes_adicionais: string[];
    dados_aleatorios: string[];
  };
}

interface MemberProfile {
  id: string;
  group_id: string;
  member_name: string;
  phone_number: string | null;
  profile_created_at: string;
  last_profiling_date: string;
  total_messages: number;
  total_words: number;
  total_media: number;
  profile_data: any;
  messages_file_path: string;
  ai_analysis: AIAnalysis | null;
  ai_analysis_date: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
  icon_url?: string;
  real_name?: string | null;
  anotacoes?: string | null;
}

type ProfileStatus = 'not_profiled' | 'pending' | 'processing' | 'completed' | 'error';

export function MemberProfileCard({
  groupId,
  memberName,
  memberColor,
  messageCount,
  wordCount,
  mediaCount,
  isProfiled,
  onClose,
  onRefresh
}: MemberProfileCardProps) {
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('perfil');
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('not_profiled');
  const [realName, setRealName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [anotacoes, setAnotacoes] = useState('');
  const [editingRealName, setEditingRealName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  
  useEffect(() => {
    if (isProfiled) {
      loadProfileData();
    } else {
      setLoading(false);
      setProfileStatus('not_profiled');
    }
  }, [isProfiled, groupId, memberName]);
  
  const loadProfileData = async () => {
    if (!isProfiled) return;
    
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('group_id', groupId)
        .eq('member_name', memberName)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setMemberProfile(data);
        setProfileStatus(data.status);
        setPhoneNumber(data.phone_number || '');
        setRealName(data.real_name || '');
        setAnotacoes(data.anotacoes || '');
        
        // Carregar a análise de IA
        if (data.ai_analysis) {
          setAnalysis(data.ai_analysis);
        }
        
        // Verificar se há uma foto de perfil
        if (data.icon_url) {
          try {
            const { data: imageData } = await supabase
              .storage
              .from('profile_pictures')
              .getPublicUrl(data.icon_url);
              
            if (imageData?.publicUrl) {
              setProfilePicture(imageData.publicUrl);
            }
          } catch (imageError) {
            console.error('Erro ao carregar imagem:', imageError);
          }
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar os dados do perfil do membro.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadMessagesContent = async () => {
    if (!memberProfile?.messages_file_path) return;
    
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .storage
        .from('member_messages')
        .download(memberProfile.messages_file_path);
      
      if (error) throw error;
      
      const content = await data.text();
      setMessageContent(content);
      
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar mensagens',
        description: 'Não foi possível carregar o histórico de mensagens deste membro.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFicharMembro = async () => {
    try {
      setProcessing(true);
      
      // Usar a função de lib/member-profiler em vez de chamar diretamente a RPC
      const result = await profileMember(groupId, memberName);
      
      if (result.success) {
        // Atualizar status e mostrar feedback
        toast({
          title: 'Membro fichado com sucesso',
          description: 'O processamento foi iniciado e pode levar alguns minutos.',
        });
        
        // Atualizar o status para pending
        setProfileStatus('pending');
        
        // Notificar o componente pai para atualizar a lista
        onRefresh();
        
        // Iniciar polling para verificar atualização do status
        startStatusPolling();
      } else {
        throw new Error(result.message || 'Erro ao fichar membro');
      }
    } catch (error) {
      console.error('Erro ao fichar membro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao fichar membro',
        description: error instanceof Error ? error.message : 'Não foi possível iniciar o processo de fichamento.'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleAnalyzeMember = async () => {
    if (!memberProfile) return;
    
    try {
      setAnalyzing(true);
      
      // Chamar o serviço de análise da IA
      const result = await analyzeMemberMessages(memberProfile.id, memberProfile.member_name);
      
      if (result.success) {
        toast({
          title: 'Análise concluída com sucesso',
          description: 'O perfil comportamental foi gerado e está disponível na aba Análise.'
        });
        
        // Recarregar o perfil para obter a análise atualizada
        loadProfileData();
        
        // Mudar para a aba de análise
        setActiveTab('analise');
      } else {
        throw new Error(result.message || 'Erro ao analisar membro');
      }
    } catch (error) {
      console.error('Erro ao analisar membro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na análise',
        description: error instanceof Error ? error.message : 'Não foi possível realizar a análise comportamental.'
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Função para verificar periodicamente o status do processamento
  const startStatusPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const profile = await getMemberProfile(groupId, memberName);
        
        if (profile) {
          setMemberProfile(profile as MemberProfile);
          setProfileStatus(profile.status);
          
          // Se o processamento foi concluído ou falhou, parar o polling
          if (profile.status === 'completed' || profile.status === 'error') {
            clearInterval(pollInterval);
            
            if (profile.status === 'completed') {
              toast({
                title: 'Processamento concluído',
                description: 'O fichamento do membro foi concluído com sucesso.'
              });
            } else if (profile.status === 'error') {
              toast({
                variant: 'destructive',
                title: 'Erro no processamento',
                description: 'Ocorreu um erro ao processar o fichamento.'
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        clearInterval(pollInterval);
      }
    }, 5000); // Verificar a cada 5 segundos
    
    // Limpar o intervalo após 2 minutos para evitar polling infinito
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);
  };
  
  // Carregar conteúdo das mensagens quando o dialog de mensagens for aberto
  useEffect(() => {
    if (showAllMessages) {
      loadMessagesContent();
    }
  }, [showAllMessages]);
  
  // Função para fazer upload de foto de perfil
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !memberProfile) return;
    
    try {
      setUploadingPhoto(true);
      const file = e.target.files[0];
      const supabase = createClient();
      
      // Criar um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberProfile.id}_${Date.now()}.${fileExt}`;
      const filePath = `${groupId}/${fileName}`;
      
      // Fazer upload para o bucket
      const { error: uploadError } = await supabase
        .storage
        .from('profile_pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Atualizar o perfil com a URL da nova foto
      const { error: updateError } = await supabase
        .from('member_profiles')
        .update({
          icon_url: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberProfile.id);
        
      if (updateError) throw updateError;
      
      // Obter a URL pública da imagem
      const { data: urlData } = await supabase
        .storage
        .from('profile_pictures')
        .getPublicUrl(filePath);
        
      if (urlData?.publicUrl) {
        setProfilePicture(urlData.publicUrl);
      }
      
      toast({
        title: 'Foto atualizada',
        description: 'A foto de perfil foi atualizada com sucesso.'
      });
      
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar foto',
        description: 'Não foi possível fazer o upload da imagem.'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Função para alternar a expansão de uma seção
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Componente para exibir texto que pode ser expandido
  const ExpandableText = ({ text, id, maxLength = 150 }: { text: string, id: string, maxLength?: number }) => {
    const isExpanded = expandedSections[id] || false;
    const shouldTruncate = text.length > maxLength;
    
    if (!shouldTruncate) return <p className="text-sm">{text}</p>;
    
    return (
      <div>
        <p className="text-sm">
          {isExpanded ? text : `${text.substring(0, maxLength)}...`}
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => toggleSection(id)} 
          className="mt-1 h-6 text-xs text-muted-foreground hover:text-primary"
        >
          {isExpanded ? "Mostrar menos" : "Mostrar mais"}
        </Button>
      </div>
    );
  };

  // Função para renderizar o status do perfil
  const renderProfileStatus = () => {
    switch (profileStatus) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
            <Check className="h-3 w-3 mr-1" />
            Fichado
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processando
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-medium">
            <User className="h-3 w-3 mr-1" />
            Não fichado
          </Badge>
        );
    }
  };
  
  const renderAnalysisContent = () => {
    if (!memberProfile?.ai_analysis) {
      return (
        <div className="flex flex-col items-center justify-center py-10 px-6 bg-muted/20 rounded-2xl text-center">
          <Brain className="h-20 w-20 text-muted-foreground mb-5 opacity-80" />
          <h3 className="text-xl font-medium mb-4">Análise de IA não disponível</h3>
          <p className="text-base text-muted-foreground mb-8 max-w-md">
            Clique no botão abaixo para gerar uma análise comportamental detalhada usando inteligência artificial.
          </p>
          <Button 
            onClick={handleAnalyzeMember}
            disabled={analyzing || profileStatus !== 'completed'}
            className="py-6 px-8 text-base"
            size="lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="mr-3 h-5 w-5" />
                Análise do Oráculo
              </>
            )}
          </Button>
        </div>
      );
    }
    
    const analysis = memberProfile.ai_analysis;
    
    return (
      <Tabs defaultValue="identificacao" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="identificacao" className="text-sm">
            <User className="h-4 w-4 mr-2" />
            Identidade
          </TabsTrigger>
          <TabsTrigger value="comportamento" className="text-sm">
            <Brain className="h-4 w-4 mr-2" />
            Comportamento
          </TabsTrigger>
          <TabsTrigger value="preferencias" className="text-sm">
            <Heart className="h-4 w-4 mr-2" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="outros" className="text-sm">
            <Info className="h-4 w-4 mr-2" />
            Outros
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Identificação */}
        <TabsContent value="identificacao">
          <div className="p-6 rounded-xl bg-card shadow-sm">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Nome</h3>
                <p className="text-base">{analysis?.identificacao?.nome || 'Não disponível'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total de mensagens analisadas</h3>
                <p className="text-base">{analysis?.identificacao?.total_mensagens_analisadas || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumo geral</h3>
                <ExpandableText 
                  text={analysis?.identificacao?.resumo_geral || 'Não disponível'} 
                  id="resumo_geral"
                  maxLength={300}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Comportamento */}
        <TabsContent value="comportamento">
          <div className="p-6 rounded-xl bg-card shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tópicos frequentes</h3>
              <div className="flex flex-wrap gap-2">
                {analysis?.comportamento_e_personalidade?.topicos_frequentes?.map((topico: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {topico}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Estilo de escrita</h3>
                <p className="text-base">{analysis?.comportamento_e_personalidade?.estilo_de_escrita || 'Não disponível'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tom de comunicação</h3>
                <p className="text-base">{analysis?.comportamento_e_personalidade?.tom_de_comunicacao || 'Não disponível'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Padrões de humor</h3>
                <p className="text-base">{analysis?.comportamento_e_personalidade?.padroes_de_humor || 'Não disponível'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Nível de prolixidade</h3>
                <p className="text-base">{analysis?.comportamento_e_personalidade?.nivel_prolixidade || 'Não disponível'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Uso de emojis</h3>
                <p className="text-base">{analysis?.comportamento_e_personalidade?.uso_emojis || 'Não disponível'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Participação em polêmicas</h3>
                <p className="text-base">{analysis?.comportamento_e_personalidade?.participacao_polemicas || 'Não disponível'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Horários de atividade</h3>
              <div className="flex flex-wrap gap-2">
                {analysis?.comportamento_e_personalidade?.horarios_atividade?.map((horario: string, i: number) => (
                  <Badge key={i} variant="outline">
                    {horario}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Frases características</h3>
              <div className="space-y-2">
                {analysis?.comportamento_e_personalidade?.frases_caracteristicas?.map((frase: string, i: number) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                    {frase}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Preferências */}
        <TabsContent value="preferencias">
          <div className="p-6 rounded-xl bg-card shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Gosta de</h3>
              <div className="flex flex-wrap gap-2">
                {analysis?.preferencias_e_opinioes?.gosta_de?.map((item: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Não gosta de</h3>
              <div className="flex flex-wrap gap-2">
                {analysis?.preferencias_e_opinioes?.nao_gosta_de?.map((item: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Preferências explícitas</h3>
              <div className="space-y-2">
                {analysis?.preferencias_e_opinioes?.preferencias_explicitas?.map((item: string, i: number) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Posicionamentos</h3>
              <div className="flex flex-wrap gap-2">
                {analysis?.preferencias_e_opinioes?.posicionamentos?.map((item: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Outros Dados */}
        <TabsContent value="outros">
          <div className="p-6 rounded-xl bg-card shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Informações adicionais</h3>
              <div className="space-y-2">
                {analysis?.outros?.informacoes_adicionais?.map((info: string, i: number) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg">
                    <ExpandableText text={info} id={`info_${i}`} maxLength={200} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Dados aleatórios</h3>
              <div className="space-y-2">
                {analysis?.outros?.dados_aleatorios?.map((dado: string, i: number) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-lg">
                    <ExpandableText text={dado} id={`dado_${i}`} maxLength={200} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  // Função para renderizar o diálogo de visualização de mensagens
  const renderMessagesDialog = () => {
    return (
      <Dialog open={showAllMessages} onOpenChange={setShowAllMessages}>
        <DialogContent className="sm:max-w-4xl">
          <DialogTitle>Mensagens de {memberName}</DialogTitle>
          <DialogDescription>
            Histórico completo de mensagens enviadas no grupo
          </DialogDescription>
          
          <ScrollArea className="h-[60vh] mt-4 p-4 border rounded-md">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : messageContent ? (
              <div className="space-y-4">
                {messageContent.split('\n\n').map((block, index) => {
                  // Ignorar linhas de cabeçalho e resumo
                  if (block.startsWith('Todas as mensagens de') || 
                      block.startsWith('Total de mensagens:') ||
                      block.startsWith('Total de palavras:') ||
                      block.startsWith('Total de mídias:') ||
                      block.startsWith('---') ||
                      block.includes('Fim das mensagens')) {
                    return null;
                  }
                  
                  // Dividir em data e conteúdo da mensagem
                  const timestampMatch = block.match(/\[(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2})\]/);
                  const timestamp = timestampMatch ? timestampMatch[1] : '';
                  const messageText = block.replace(/\[(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2})\]/, '').trim();
                  
                  if (!messageText) return null;
                  
                  return (
                    <div key={index} className="relative flex flex-col max-w-[80%] ml-auto bg-primary text-primary-foreground p-3 rounded-lg">
                      {timestamp && (
                        <span className="text-xs opacity-80 mb-1">{timestamp}</span>
                      )}
                      <p className="whitespace-pre-wrap break-words">{messageText}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                Nenhuma mensagem encontrada
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Função para salvar informações editadas do membro
  const saveProfileInfo = async (field: 'phone_number' | 'real_name' | 'anotacoes', value: string) => {
    if (!memberProfile) return;
    
    try {
      setSavingInfo(true);
      const supabase = createClient();
      
      const updateData: Record<string, string> = {
        [field]: value,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('member_profiles')
        .update(updateData)
        .eq('id', memberProfile.id);
        
      if (error) throw error;
      
      // Atualizar estado local
      setMemberProfile(prev => prev ? {...prev, [field]: value} : null);
      
      toast({
        title: 'Informação atualizada',
        description: 'Os dados do perfil foram atualizados com sucesso.'
      });
      
      // Resetar estados de edição
      if (field === 'phone_number') setEditingPhone(false);
      if (field === 'real_name') setEditingRealName(false);
      
    } catch (error) {
      console.error('Erro ao atualizar informação:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações.'
      });
    } finally {
      setSavingInfo(false);
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-[1000px] max-h-[85vh] overflow-auto rounded-2xl shadow-2xl bg-background relative">
          {/* Cabeçalho com foto de perfil */}
          <div className="relative h-40 bg-gradient-to-br from-primary/80 via-primary/50 to-primary/10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 rounded-full bg-background/20 hover:bg-background/40 text-white z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="absolute -bottom-12 left-0 right-0 flex items-end px-8 pb-4">
              <div className="flex items-end">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-background p-1.5 shadow-xl">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt={memberName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="flex items-center justify-center w-full h-full rounded-full"
                        style={{ backgroundColor: memberColor }}
                      >
                        <span className="text-4xl font-bold text-white">
                          {memberName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload overlay */}
                  {memberProfile && (
                    <label 
                      htmlFor="profilePictureUpload" 
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8" />
                          <span className="sr-only">Alterar foto</span>
                        </>
                      )}
                    </label>
                  )}
                  
                  <input 
                    id="profilePictureUpload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfilePictureUpload} 
                    disabled={uploadingPhoto || !memberProfile} 
                  />
                </div>
                
                <div className="ml-6 mb-4">
                  <h1 className="text-2xl font-semibold text-white">{memberName}</h1>
                  <div className="mt-2">
                    {renderProfileStatus()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Corpo do card com estatísticas */}
          <div className="p-8 pt-16">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 shadow-sm">
                <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-xs text-muted-foreground font-medium">Mensagens</span>
                <span className="text-2xl font-semibold mt-1">{memberProfile?.total_messages || messageCount}</span>
              </div>
              
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 shadow-sm">
                <Type className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-xs text-muted-foreground font-medium">Palavras</span>
                <span className="text-2xl font-semibold mt-1">{memberProfile?.total_words || wordCount}</span>
              </div>
              
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 shadow-sm">
                <Image className="h-8 w-8 text-orange-500 mb-2" />
                <span className="text-xs text-muted-foreground font-medium">Mídias</span>
                <span className="text-2xl font-semibold mt-1">{memberProfile?.total_media || mediaCount}</span>
              </div>
            </div>
            
            {/* Abas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-11 rounded-lg">
                <TabsTrigger 
                  value="perfil" 
                  className="text-sm rounded-l-lg"
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger 
                  value="analise" 
                  className="text-sm"
                  disabled={!memberProfile?.ai_analysis && profileStatus !== 'completed'}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Análise IA
                </TabsTrigger>
                <TabsTrigger 
                  value="anotacoes" 
                  className="text-sm rounded-r-lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Anotações
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo das abas */}
              <TabsContent value="perfil" className="mt-0 p-0">
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-card shadow-sm">
                    <h2 className="text-lg font-medium mb-4">Detalhes do Perfil</h2>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground">Nome real:</span>
                        {editingRealName ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={realName}
                              onChange={(e) => setRealName(e.target.value)}
                              className="px-2 py-1 text-sm rounded-md border mr-2 w-48"
                              placeholder="Nome real do membro"
                              disabled={savingInfo}
                            />
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => saveProfileInfo('real_name', realName)}
                              disabled={savingInfo}
                              className="h-7 px-2"
                            >
                              {savingInfo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setEditingRealName(false);
                                setRealName(memberProfile?.real_name || '');
                              }}
                              disabled={savingInfo}
                              className="h-7 px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-medium">{memberProfile?.real_name || 'Não informado'}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditingRealName(true)} 
                              className="ml-2 h-7 px-2"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <span className="text-muted-foreground">Telefone:</span>
                        {editingPhone ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="px-2 py-1 text-sm rounded-md border mr-2 w-48"
                              placeholder="Ex: +55 11 99999-9999"
                              disabled={savingInfo}
                            />
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => saveProfileInfo('phone_number', phoneNumber)}
                              disabled={savingInfo}
                              className="h-7 px-2"
                            >
                              {savingInfo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setEditingPhone(false);
                                setPhoneNumber(memberProfile?.phone_number || '');
                              }}
                              disabled={savingInfo}
                              className="h-7 px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-medium">{memberProfile?.phone_number || 'Não informado'}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditingPhone(true)} 
                              className="ml-2 h-7 px-2"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {memberProfile && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <span className="text-muted-foreground">Fichado em:</span>
                            <span className="font-medium">
                              {format(new Date(memberProfile.profile_created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                          
                          {memberProfile.last_profiling_date && (
                            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                              <span className="text-muted-foreground">Última análise:</span>
                              <span className="font-medium">
                                {format(new Date(memberProfile.last_profiling_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resto do conteúdo da aba perfil */}
                  {profileStatus === 'completed' && memberProfile ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        size="default"
                        onClick={() => setShowAllMessages(true)}
                        className="py-5 text-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ver Todas as Mensagens
                      </Button>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant={memberProfile.ai_analysis ? "outline" : "default"}
                              size="default"
                              onClick={handleAnalyzeMember}
                              disabled={analyzing}
                              className="py-5 text-sm"
                            >
                              {analyzing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Analisando...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-2" />
                                  {memberProfile.ai_analysis ? 'Reanalisar Perfil' : 'Oráculo Analysis'}
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-foreground text-background p-2 rounded-lg border-none text-xs">
                            <p>Analisa as mensagens com IA para gerar um perfil comportamental detalhado</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-muted/10 rounded-2xl text-center">
                      <FileText className="h-20 w-20 text-muted-foreground mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">Perfil não fichado</h3>
                      <p className="text-lg text-muted-foreground max-w-md mb-10">
                        {profileStatus === 'pending' || profileStatus === 'processing' 
                          ? 'Perfil em processamento. Aguarde a conclusão da análise.'
                          : 'Este membro ainda não foi fichado. Clique no botão abaixo para iniciar a análise detalhada.'}
                      </p>
                      
                      {(profileStatus === 'not_profiled' || profileStatus === 'error') && (
                        <Button 
                          size="lg"
                          onClick={handleFicharMembro}
                          disabled={processing}
                          className="p-8 text-lg h-auto"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <User className="h-6 w-6 mr-3" />
                              Realizar Fichamento
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Conteúdo da aba Análise IA */}
              <TabsContent value="analise" className="mt-0 p-0">
                {memberProfile?.ai_analysis ? (
                  <Tabs defaultValue="identificacao" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="identificacao" className="text-sm">
                        <User className="h-4 w-4 mr-2" />
                        Identidade
                      </TabsTrigger>
                      <TabsTrigger value="comportamento" className="text-sm">
                        <Brain className="h-4 w-4 mr-2" />
                        Comportamento
                      </TabsTrigger>
                      <TabsTrigger value="preferencias" className="text-sm">
                        <Heart className="h-4 w-4 mr-2" />
                        Preferências
                      </TabsTrigger>
                      <TabsTrigger value="outros" className="text-sm">
                        <Info className="h-4 w-4 mr-2" />
                        Outros
                      </TabsTrigger>
                    </TabsList>

                    {/* Aba de Identificação */}
                    <TabsContent value="identificacao">
                      <div className="p-6 rounded-xl bg-card shadow-sm">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Nome</h3>
                            <p className="text-base">{analysis?.identificacao?.nome || 'Não disponível'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total de mensagens analisadas</h3>
                            <p className="text-base">{analysis?.identificacao?.total_mensagens_analisadas || 0}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumo geral</h3>
                            <ExpandableText 
                              text={analysis?.identificacao?.resumo_geral || 'Não disponível'} 
                              id="resumo_geral"
                              maxLength={300}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba de Comportamento */}
                    <TabsContent value="comportamento">
                      <div className="p-6 rounded-xl bg-card shadow-sm space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Tópicos frequentes</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis?.comportamento_e_personalidade?.topicos_frequentes?.map((topico: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {topico}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Estilo de escrita</h3>
                          <p className="text-base">{analysis?.comportamento_e_personalidade?.estilo_de_escrita || 'Não disponível'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tom de comunicação</h3>
                          <p className="text-base">{analysis?.comportamento_e_personalidade?.tom_de_comunicacao || 'Não disponível'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Padrões de humor</h3>
                          <p className="text-base">{analysis?.comportamento_e_personalidade?.padroes_de_humor || 'Não disponível'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Nível de prolixidade</h3>
                          <p className="text-base">{analysis?.comportamento_e_personalidade?.nivel_prolixidade || 'Não disponível'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Uso de emojis</h3>
                          <p className="text-base">{analysis?.comportamento_e_personalidade?.uso_emojis || 'Não disponível'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Participação em polêmicas</h3>
                          <p className="text-base">{analysis?.comportamento_e_personalidade?.participacao_polemicas || 'Não disponível'}</p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba de Preferências */}
                    <TabsContent value="preferencias">
                      <div className="p-6 rounded-xl bg-card shadow-sm space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Gosta de</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis?.preferencias_e_opinioes?.gosta_de?.map((item: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Não gosta de</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis?.preferencias_e_opinioes?.nao_gosta_de?.map((item: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Preferências explícitas</h3>
                          <div className="space-y-2">
                            {analysis?.preferencias_e_opinioes?.preferencias_explicitas?.map((item: string, i: number) => (
                              <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Posicionamentos</h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis?.preferencias_e_opinioes?.posicionamentos?.map((item: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Aba de Outros Dados */}
                    <TabsContent value="outros">
                      <div className="p-6 rounded-xl bg-card shadow-sm space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Informações adicionais</h3>
                          <div className="space-y-2">
                            {analysis?.outros?.informacoes_adicionais?.map((info: string, i: number) => (
                              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                <ExpandableText text={info} id={`info_${i}`} maxLength={200} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Dados aleatórios</h3>
                          <div className="space-y-2">
                            {analysis?.outros?.dados_aleatorios?.map((dado: string, i: number) => (
                              <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                <ExpandableText text={dado} id={`dado_${i}`} maxLength={200} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6 bg-muted/10 rounded-2xl text-center">
                    <Brain className="h-20 w-20 text-muted-foreground mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">Análise não disponível</h3>
                    <p className="text-lg text-muted-foreground max-w-md mb-10">
                      Este membro ainda não possui uma análise de IA. Clique no botão "Oráculo Analysis" na aba Perfil para gerar uma análise detalhada.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Conteúdo da aba Anotações */}
              <TabsContent value="anotacoes" className="mt-0 p-0">
                {profileStatus === 'completed' && memberProfile ? (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-card shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Anotações sobre o membro</h2>
                        <Button 
                          size="sm" 
                          onClick={() => saveProfileInfo('anotacoes', anotacoes)}
                          disabled={savingInfo}
                          className="h-8"
                        >
                          {savingInfo ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              <span className="text-xs">Salvando...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-2" />
                              <span className="text-xs">Salvar</span>
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-3">
                          Use este espaço para registrar informações relevantes, observações pessoais ou detalhes importantes sobre este membro.
                        </p>
                        
                        <textarea
                          value={anotacoes}
                          onChange={(e) => setAnotacoes(e.target.value)}
                          className="w-full h-[300px] p-3 text-sm rounded-lg border border-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Adicione suas anotações aqui..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6 bg-muted/10 rounded-2xl text-center">
                    <FileText className="h-20 w-20 text-muted-foreground mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">Anotações não disponíveis</h3>
                    <p className="text-lg text-muted-foreground max-w-md mb-10">
                      Você precisa fichar este membro antes de poder adicionar anotações.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Rodapé com botões */}
            <div className="mt-8 pt-4 border-t flex justify-between">
              {profileStatus === 'completed' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadProfileData}
                  disabled={loading}
                  className="px-4"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {loading ? 'Carregando...' : 'Atualizar Perfil'}
                </Button>
              ) : (
                <div></div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
                className="px-4"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {renderMessagesDialog()}
    </>
  );
} 