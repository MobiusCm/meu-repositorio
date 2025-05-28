'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, MoreHorizontal, Info, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
import { AddGroupModal } from './add-group-modal';
import { Database } from '@/lib/supabase/schema';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Tipo para os dados do grupo
type Group = Database['public']['Tables']['groups']['Row'];

export function GroupList({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeleting(true);
      const supabase = createClient();
      
      console.log('Iniciando exclusão do grupo:', groupToDelete.name);
      
      // 1. Obter os arquivos de mensagens deste grupo
      const { data: messageFiles, error: filesError } = await supabase
        .from('group_message_files')
        .select('storage_path, bucket_id, id')
        .eq('group_id', groupToDelete.id);
      
      if (filesError) {
        if (filesError.code === 'PGRST116') {
          console.log('Tabela group_message_files não existe, pulando esta etapa');
        } else {
          console.error('Erro ao buscar arquivos do grupo:', filesError);
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
      
      // Removidas as tabelas inexistentes:
      // - 'period_group_analytics' (não existe)
      // - 'member_daily_analytics' (não existe)
      // - 'messages_status' (não existe)
      
      // 3. Excluir registros relacionados ao grupo
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
      
      // 4. Finalmente, excluir o grupo
      console.log('Excluindo o registro do grupo...');
      const deleteResult = await supabase
        .from('groups')
        .delete()
        .eq('id', groupToDelete.id);
      
      const { error, status, statusText } = deleteResult;

      if (error) {
        console.error('Detalhes do erro de exclusão do grupo:', error);
        throw new Error(error.message || 'Erro ao excluir grupo');
      } else if (status >= 400) {
        throw new Error(`Erro HTTP ${status}: ${statusText}`);
      }
      
      console.log('Grupo excluído com sucesso!');
      toast({
        title: "Grupo excluído",
        description: "O grupo e todos os seus dados foram excluídos com sucesso.",
      });

      router.refresh();
    } catch (error: any) {
      // Log completo do erro para diagnóstico
      console.error('Erro ao excluir grupo - completo:', error);
      
      // Exibir mensagem de erro mais específica se disponível
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : 'Ocorreu um erro desconhecido'));
      
      toast({
        title: "Erro ao excluir grupo",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setGroupToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {groups.length} grupo{groups.length === 1 ? '' : 's'} encontrado{groups.length === 1 ? '' : 's'}
        </p>
        <Button 
          size="sm" 
          className="h-9"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Card key={group.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {group.icon_url ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-background">
                        <Image
                          src={group.icon_url}
                          alt={group.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 ring-2 ring-background flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {group.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => router.push(`/groups/${group.id}`)}>
                        <Info className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/groups/${group.id}/update`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Atualizar Dados
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => setGroupToDelete(group)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Grupo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="py-4 flex-grow">
                <div className="space-y-2">
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary/50 mr-2" />
                    {group.member_count || 0} membro{group.member_count === 1 ? '' : 's'}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="secondary" 
                  className="w-full h-9"
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  Ver Análises
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-10 bg-muted/30 rounded-lg border border-dashed text-center">
            <div className="rounded-full bg-muted/50 p-3 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum grupo encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Você ainda não cadastrou nenhum grupo. Clique no botão abaixo para adicionar seu primeiro grupo de WhatsApp.
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Grupo
            </Button>
          </div>
        )}
      </div>
      
      {isAddModalOpen && (
        <AddGroupModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo "{groupToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 