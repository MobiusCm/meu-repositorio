'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Save, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/schema';
import { useRouter } from 'next/navigation';

type Group = Database['public']['Tables']['groups']['Row'];

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export function EditGroupModal({ isOpen, onClose, group }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [memberCount, setMemberCount] = useState(group.member_count || 0);
  const [iconUrl, setIconUrl] = useState(group.icon_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

    setSelectedFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setIsUploading(true);
      
      // Gerar nome único para o arquivo
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${group.id}-${Date.now()}.${fileExt}`;
      const filePath = `groups/${fileName}`;

      // Fazer upload para o bucket "group-icons"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-icons')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Falha no upload: ${uploadError.message || 'Erro desconhecido'}`);
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('group-icons')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        return urlData.publicUrl;
      }

      throw new Error('Não foi possível obter a URL da imagem');
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      
      // Melhor tratamento de erro
      let errorMessage = 'Não foi possível enviar a imagem. Tente novamente.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      toast({
        title: "Erro ao fazer upload",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validações
      if (!name.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, insira o nome do grupo",
          variant: "destructive",
        });
        return;
      }

      if (memberCount < 0) {
        toast({
          title: "Número inválido",
          description: "O número de membros não pode ser negativo",
          variant: "destructive",
        });
        return;
      }

      let finalIconUrl = iconUrl;

      // Se há uma nova imagem selecionada, fazer upload
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalIconUrl = uploadedUrl;
        } else {
          // Se falhou o upload e não há imagem anterior, sair
          if (!iconUrl) {
            return;
          }
        }
      }

      // Atualizar grupo no banco
      const { error: updateError } = await supabase
        .from('groups')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          member_count: memberCount,
          icon_url: finalIconUrl || null,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', group.id);

      if (updateError) {
        console.error('Erro ao atualizar grupo:', updateError);
        throw updateError;
      }

      toast({
        title: "Grupo atualizado",
        description: "As informações do grupo foram atualizadas com sucesso",
      });

      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIconUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentImageUrl = previewUrl || iconUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>
            Atualize as informações do grupo conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Upload de Foto */}
          <div className="space-y-3">
            <Label>Foto do Grupo</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {currentImageUrl ? (
                  <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-background">
                    <Image
                      src={currentImageUrl}
                      alt="Foto do grupo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
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
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Foto
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF ou WebP. Máximo 5MB.
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Nome do Grupo */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do grupo"
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do grupo"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Número de Membros */}
          <div className="space-y-2">
            <Label htmlFor="memberCount">Número Total de Membros</Label>
            <Input
              id="memberCount"
              type="number"
              min="0"
              max="999999"
              value={memberCount}
              onChange={(e) => setMemberCount(Number(e.target.value))}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Número total de membros no grupo do WhatsApp
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 