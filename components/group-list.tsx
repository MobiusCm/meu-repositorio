'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Plus, 
  MoreHorizontal, 
  Info, 
  Trash2, 
  Edit, 
  Users, 
  Calendar,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Activity,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { EditGroupModal } from './edit-group-modal';
import { Database } from '@/lib/supabase/schema';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Tipo para os dados da comunidade
type Group = Database['public']['Tables']['groups']['Row'];
type ViewMode = 'grid' | 'list';

interface GroupListProps {
  groups: Group[];
  viewMode?: ViewMode;
}

// Configuração das plataformas com ícones SVG limpos
const PLATFORM_CONFIG = {
  whatsapp: { 
    label: 'WhatsApp', 
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>
    )
  },
  discord: { 
    label: 'Discord', 
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    )
  },
  telegram: { 
    label: 'Telegram', 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    )
  },
  instagram: { 
    label: 'Instagram', 
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
};

export function GroupList({ groups, viewMode = 'grid' }: GroupListProps) {
  const router = useRouter();
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeleting(true);
      const supabase = createClient();
      
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se a comunidade pertence ao usuário antes de excluir
      const { data: groupCheck, error: checkError } = await supabase
        .from('groups')
        .select('id, user_id')
        .eq('id', groupToDelete.id)
        .eq('user_id', user.id)
        .single();
        
      if (checkError || !groupCheck) {
        throw new Error('Comunidade não encontrada ou você não tem permissão para excluí-la');
      }
      
      console.log('Iniciando exclusão da comunidade:', groupToDelete.name);
      
      // 1. Obter os arquivos de mensagens desta comunidade
      const { data: messageFiles, error: filesError } = await supabase
        .from('group_message_files')
        .select('storage_path, bucket_id, id')
        .eq('group_id', groupToDelete.id);
      
      if (filesError) {
        if (filesError.code === 'PGRST116') {
          console.log('Tabela group_message_files não existe, pulando esta etapa');
        } else {
          console.error('Erro ao buscar arquivos da comunidade:', filesError);
        }
      } else {
        console.log(`Encontrados ${messageFiles?.length || 0} arquivos para excluir`);
        
        // 2. Excluir arquivos do Storage, se existirem
        if (messageFiles && messageFiles.length > 0) {
          const buckets = new Set(messageFiles.map(file => file.bucket_id));
          
          for (const bucket of buckets) {
            const bucketFiles = messageFiles
              .filter(file => file.bucket_id === bucket)
              .map(file => file.storage_path);
              
            if (bucketFiles.length > 0) {
              try {
                // Excluir em lotes de até 100 arquivos (limitação do Supabase)
                for (let i = 0; i < bucketFiles.length; i += 100) {
                  const batch = bucketFiles.slice(i, i + 100);
                  const { error: deleteStorageError } = await supabase
                    .storage
                    .from(bucket)
                    .remove(batch);
                    
                  if (deleteStorageError) {
                    console.error(`Erro ao excluir arquivos do bucket ${bucket}:`, deleteStorageError);
                  }
                }
              } catch (error) {
                console.error(`Erro ao excluir arquivos do bucket ${bucket}:`, error);
              }
            }
          }
          
          // 2.1 Excluir registros dos arquivos de mensagens
          try {
            const fileIds = messageFiles.map(file => file.id);
            for (let i = 0; i < fileIds.length; i += 100) {
              const batch = fileIds.slice(i, i + 100);
              const { error: deleteFileRecordsError } = await supabase
                .from('group_message_files')
                .delete()
                .in('id', batch);
                
              if (deleteFileRecordsError) {
                console.error('Erro ao excluir registros de arquivos:', deleteFileRecordsError);
              }
            }
          } catch (error) {
            console.error('Erro ao excluir registros de arquivos de mensagens:', error);
          }
        }
      }
      
      // Lista de tabelas para limpar, em ordem de dependência
      const tablesToClean = [
        'daily_analytics',      // ✓ Confirmado - existe
        'group_analytics',      // ✓ Confirmado - existe
        'member_profiles',      // ✓ Confirmado - existe
        'group_members',        // ✓ Confirmado - existe
        'group_message_files'   // ✓ Confirmado - existe
      ];
      
      // 3. Excluir registros relacionados à comunidade
      for (const table of tablesToClean) {
        try {
          console.log(`Limpando dados da tabela ${table}...`);
          
          // Verificar se a tabela existe
          const { error: checkError } = await supabase
            .from(table)
            .select('count(*)', { count: 'exact', head: true })
            .limit(0);
            
          if (checkError) {
            if (checkError.code === 'PGRST116') {
              console.log(`Tabela ${table} não existe, pulando.`);
              continue;
            } else {
              console.warn(`Erro ao verificar a tabela ${table}:`, checkError);
            }
          }
          
          // Se chegou aqui, a tabela existe, então tentar excluir
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq('group_id', groupToDelete.id);
            
          if (deleteError) {
            console.error(`Erro ao excluir registros da tabela ${table}:`, deleteError);
          } else {
            console.log(`Registros da tabela ${table} excluídos com sucesso`);
          }
        } catch (error) {
          console.error(`Erro ao processar tabela ${table}:`, error);
          // Continuar com as próximas tabelas mesmo se esta falhar
        }
      }
      
      // 4. Finalmente, excluir a comunidade (com verificação de segurança adicional)
      console.log('Excluindo o registro da comunidade...');
      const deleteResult = await supabase
        .from('groups')
        .delete()
        .eq('id', groupToDelete.id)
        .eq('user_id', user.id); // SEGURANÇA: Garantir que só exclui se for do usuário
      
      const { error, status, statusText } = deleteResult;

      if (error) {
        console.error('Detalhes do erro de exclusão da comunidade:', error);
        throw new Error(error.message || 'Erro ao excluir comunidade');
      } else if (status >= 400) {
        throw new Error(`Erro HTTP ${status}: ${statusText}`);
      }
      
      console.log('Comunidade excluída com sucesso!');
      toast({
        title: "Comunidade excluída",
        description: "A comunidade e todos os seus dados foram excluídos com sucesso.",
      });

      router.refresh();
    } catch (error: any) {
      // Log completo do erro para diagnóstico
      console.error('Erro ao excluir comunidade - completo:', error);
      
      // Exibir mensagem de erro mais específica se disponível
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : 'Ocorreu um erro desconhecido'));
      
      toast({
        title: "Erro ao excluir comunidade",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setGroupToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <Plus className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Nenhuma comunidade encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Você ainda não cadastrou nenhuma comunidade. Comece criando sua primeira comunidade para unlock insights poderosos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Componente de Card Individual - sem animações desnecessárias
  const GroupCard = ({ group }: { group: Group }) => {
    const platform = group.platform || 'whatsapp';
    const platformInfo = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG] || PLATFORM_CONFIG.whatsapp;
    
    return (
      <Card 
        className="group cursor-pointer transition-colors hover:bg-muted/50 border-border"
        onClick={() => router.push(`/groups/${group.id}`)}
      >
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative">
                {group.icon_url ? (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={group.icon_url}
                      alt={group.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-base font-semibold text-primary">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Informações Principais */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate leading-tight mb-2">
                  {group.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium px-2 py-1 border",
                    platformInfo.borderColor,
                    platformInfo.color,
                    platformInfo.bgColor
                  )}
                >
                  <div className="mr-1.5">{platformInfo.icon}</div>
                  {platformInfo.label}
                </Badge>
              </div>
            </div>
            
            {/* Menu de Ações - Corrigido */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-muted/80 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/groups/${group.id}`);
                  }}
                  className="cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Análises
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupToEdit(group);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/groups/${group.id}/update`);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Atualizar Dados
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete(group);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        {/* Conteúdo */}
        <CardContent className="pt-0 space-y-5">
          {/* Descrição */}
          <div className="h-11 overflow-hidden">
            {group.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {group.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic leading-relaxed">
                Nenhuma descrição fornecida
              </p>
            )}
          </div>
          
          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Membros</p>
                <p className="text-sm font-semibold">{group.member_count || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                <Calendar className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Criado</p>
                <p className="text-sm font-semibold">{formatDate(group.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Botão de Ação Principal */}
          <div className="pt-1">
            <Button 
              className="w-full justify-between bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 cursor-pointer"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/groups/${group.id}`);
              }}
            >
              <div className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Análises
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Componente de Item de Lista - layout corrigido
  const GroupListItem = ({ group }: { group: Group }) => {
    const platform = group.platform || 'whatsapp';
    const platformInfo = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG] || PLATFORM_CONFIG.whatsapp;
    
    return (
      <Card 
        className="cursor-pointer transition-colors hover:bg-muted/30"
        onClick={() => router.push(`/groups/${group.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {group.icon_url ? (
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={group.icon_url}
                      alt={group.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-base truncate">
                    {group.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 border flex-shrink-0",
                      platformInfo.borderColor,
                      platformInfo.color,
                      platformInfo.bgColor
                    )}
                  >
                    <div className="mr-1">{platformInfo.icon}</div>
                    {platformInfo.label}
                  </Badge>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Métricas e Ações */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Métricas */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.member_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="whitespace-nowrap">{formatDate(group.created_at)}</span>
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/groups/${group.id}`);
                  }}
                  className="cursor-pointer whitespace-nowrap"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Ver Análises
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToEdit(group);
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/groups/${group.id}/update`);
                      }}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Atualizar Dados
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(group);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Renderização baseada no modo de visualização */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <GroupListItem key={group.id} group={group} />
          ))}
        </div>
      )}
      
      {/* Modal de edição */}
      {groupToEdit && (
        <EditGroupModal
          isOpen={!!groupToEdit}
          onClose={() => setGroupToEdit(null)}
          group={groupToEdit}
        />
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comunidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a comunidade <strong>"{groupToDelete?.name}"</strong>? 
              Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 