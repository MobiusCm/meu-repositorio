'use client';

import { useEffect, useState } from 'react';
import { GroupList } from '@/components/group-list';
import { EmptyState } from '@/components/empty-state';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/schema';
import { 
  Loader2, 
  Search, 
  Filter, 
  X, 
  Plus, 
  ArrowUpDown, 
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  LayoutGrid,
  List,
  Activity,
  Sparkles,
  Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AddGroupModal } from '@/components/add-group-modal';
import { cn } from '@/lib/utils';

type Group = Database['public']['Tables']['groups']['Row'];
type ViewMode = 'grid' | 'list';

// Tipos de plataforma para filtros com ícones SVG
const PLATFORM_OPTIONS = [
  { 
    value: 'whatsapp', 
    label: 'WhatsApp', 
    color: 'bg-green-500', 
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>
    )
  },
  { 
    value: 'discord', 
    label: 'Discord', 
    color: 'bg-indigo-500', 
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    )
  },
  { 
    value: 'telegram', 
    label: 'Telegram', 
    color: 'bg-blue-500', 
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    )
  },
  { 
    value: 'instagram', 
    label: 'Instagram', 
    color: 'bg-pink-500', 
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
];

// Opções de ordenação
const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais Recentes', icon: Calendar },
  { value: 'name', label: 'Nome A-Z', icon: ArrowUpDown },
  { value: 'members', label: 'Mais Membros', icon: Users },
  { value: 'platform', label: 'Plataforma', icon: MessageSquare },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Estados para busca, filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const supabase = createClient();
        
        // Verificar autenticação primeiro
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw new Error('Erro de autenticação');
        }
        
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        // Buscar apenas comunidades do usuário autenticado
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setGroups(data || []);
        setFilteredGroups(data || []);
      } catch (err) {
        console.error('Erro ao buscar comunidades:', err);
        setError('Erro ao carregar comunidades');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Aplicar filtros e ordenação sempre que os critérios mudarem
  useEffect(() => {
    let filtered = groups;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por plataforma
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(group =>
        selectedPlatforms.includes(group.platform || 'whatsapp')
      );
    }

    // Ordenação
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'platform':
          return (a.platform || 'whatsapp').localeCompare(b.platform || 'whatsapp');
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredGroups(filtered);
  }, [groups, searchTerm, selectedPlatforms, sortBy]);

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPlatforms([]);
    setSortBy('recent');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm || selectedPlatforms.length > 0 || sortBy !== 'recent';

  // Contar comunidades por plataforma
  const platformCounts = PLATFORM_OPTIONS.map(platform => ({
    ...platform,
    count: groups.filter(group => (group.platform || 'whatsapp') === platform.value).length
  }));

  // Calcular estatísticas para o banner
  const totalMembers = groups.reduce((sum, group) => sum + (group.member_count || 0), 0);
  const activeCommunities = groups.filter(group => (group.member_count || 0) > 0).length;

  // Componente de loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {/* Banner skeleton */}
      <div className="h-32 bg-muted rounded-2xl animate-pulse" />
      
      {/* Search skeleton */}
      <div className="flex gap-3">
        <div className="h-12 bg-muted rounded-lg flex-1 animate-pulse" />
        <div className="h-12 bg-muted rounded-lg w-40 animate-pulse" />
      </div>
      
      {/* Controls skeleton */}
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
          <div className="h-10 bg-muted rounded-lg w-24 animate-pulse" />
        </div>
        <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-muted rounded-xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full animate-pulse" />
                <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-muted rounded-lg animate-pulse" />
                <div className="h-12 bg-muted rounded-lg animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded-lg animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Banner de erro */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-300" />
                <span className="text-sm font-medium text-red-200">Erro no Sistema</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Erro ao Carregar Comunidades</h1>
              <p className="text-lg text-red-300 max-w-2xl">{error}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="cursor-pointer"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Central de Comunidades</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Suas Comunidades
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Gerencie e analise todas as suas comunidades em diferentes plataformas.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{activeCommunities}</div>
              <div className="text-sm text-slate-300">Ativas</div>
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
              <div className="text-sm text-slate-300">Membros</div>
            </div>
            <div className="h-12 w-px bg-white/20"></div>
            <div className="text-right">
              <div className="text-2xl font-bold">{new Set(groups.map(g => g.platform || 'whatsapp')).size}</div>
              <div className="text-sm text-slate-300">Plataformas</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Busca + Botão Adicionar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidades por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base transition-shadow focus:shadow-lg"
          />
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="cursor-pointer shadow-lg hover:shadow-xl transition-shadow h-12 px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Comunidade
        </Button>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Ordenação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[140px] cursor-pointer h-10">
                <div className="flex items-center">
                  {(() => {
                    const option = SORT_OPTIONS.find(option => option.value === sortBy);
                    const Icon = option?.icon || ArrowUpDown;
                    return (
                      <>
                        <Icon className="mr-2 h-4 w-4" />
                        <span className="text-sm">{option?.label}</span>
                      </>
                    );
                  })()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      <Icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtros */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer h-10">
                <Filter className="mr-2 h-4 w-4" />
                <span className="text-sm">Filtros</span>
                {selectedPlatforms.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {selectedPlatforms.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Filtrar por plataforma</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {platformCounts.map((platform) => (
                <DropdownMenuCheckboxItem
                  key={platform.value}
                  checked={selectedPlatforms.includes(platform.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPlatforms([...selectedPlatforms, platform.value]);
                    } else {
                      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.value));
                    }
                  }}
                  disabled={platform.count === 0}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">{platform.icon}</div>
                      <span className="text-sm">{platform.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({platform.count})</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="px-3 cursor-pointer h-10"
              title="Limpar filtros"
            >
              <X className="h-4 w-4 mr-1" />
              <span className="text-sm">Limpar</span>
            </Button>
          )}
        </div>

        {/* Seletor de Visualização */}
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={cn(
              "cursor-pointer transition-all",
              viewMode === 'grid' 
                ? "shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-2 text-sm">Grade</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              "cursor-pointer transition-all",
              viewMode === 'list' 
                ? "shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <List className="h-4 w-4" />
            <span className="ml-2 text-sm">Lista</span>
          </Button>
        </div>
      </div>

      {/* Filtros ativos */}
      {(searchTerm || selectedPlatforms.length > 0) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtros ativos:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedPlatforms.map((platform) => {
            const platformInfo = PLATFORM_OPTIONS.find(p => p.value === platform);
            return (
              <Badge key={platform} variant="secondary" className="gap-1">
                <div className="text-muted-foreground">{platformInfo?.icon}</div>
                {platformInfo?.label}
                <button
                  onClick={() => setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform))}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Lista de comunidades ou estado vazio */}
      {filteredGroups && filteredGroups.length > 0 ? (
        <GroupList groups={filteredGroups} viewMode={viewMode} />
      ) : groups.length > 0 ? (
        // Tem comunidades mas nenhuma corresponde aos filtros
        <div className="text-center py-20">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Nenhuma comunidade encontrada</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Não encontramos comunidades que correspondam aos seus filtros. Tente ajustar os critérios de busca.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              size="sm"
              className="cursor-pointer"
            >
              <X className="mr-2 h-3 w-3" />
              Limpar filtros
            </Button>
          </div>
        </div>
      ) : (
        // Não tem comunidades
        <EmptyState />
      )}

      {/* Modal de adicionar */}
      {isAddModalOpen && (
        <AddGroupModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
} 