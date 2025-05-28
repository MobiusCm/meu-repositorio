'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  Users,
  Home,
  MessageSquare,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LanguageSelector } from "@/components/language-selector";
import { Language, getTranslation } from "@/lib/translations";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardContent>{children}</DashboardContent>;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<Language>('pt');
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();

  // Carregar idioma do localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = (key: string) => getTranslation(language, key);
  
  // Verificar tamanho da tela para modo responsivo
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Alternar tema claro/escuro
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Realizar logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: t('auth.logoutPerformed'),
        description: t('auth.disconnectedSuccessfully'),
      });
      // Redirecionar para login após logout
      window.location.href = '/auth/login';
    } catch (error) {
      toast({
        title: t('auth.logoutError'),
        description: t('auth.errorDisconnecting'),
        variant: "destructive",
      });
    }
  };

  // Links da navegação
  const navItems = [
    {
      title: t('navigation.dashboard'),
      href: "/dashboard",
      icon: Home,
    },
    {
      title: t('navigation.groupAnalytics'),
      href: "/groups",
      icon: BarChart,
    },
    {
      title: t('navigation.memberInsights'),
      href: "/members",
      icon: Users,
    },
    {
      title: t('navigation.reports'),
      href: "/reports",
      icon: MessageSquare,
    },
    {
      title: t('navigation.settings'),
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar para desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-card/50 backdrop-blur-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo e botão de fechar para mobile */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 font-medium text-lg"
            >
              <BarChart className="h-5 w-5 text-primary" />
              <span>WADash</span>
            </Link>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">{t('navigation.closeMenu')}</span>
              </Button>
            )}
          </div>

          {/* Links de navegação */}
          <nav className="flex-1 overflow-auto p-6">
            <ul className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Perfil de usuário */}
          <div className="border-t p-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar" />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('general.user')}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || 'usuario@example.com'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Cabeçalho */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4">
            {/* Botão de menu para mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t('navigation.openMenu')}</span>
            </Button>
            <h1 className="text-xl font-medium">{t('header.whatsappInsights')}</h1>
          </div>

          {/* Ações no cabeçalho */}
          <div className="flex items-center space-x-2">
            <LanguageSelector onLanguageChange={setLanguage} />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">{t('navigation.toggleTheme')}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-[1.2rem] w-[1.2rem]" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between border-b p-4">
                  <span className="text-sm font-medium">{t('header.notifications')}</span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    {t('header.markAllAsRead')}
                  </Button>
                </div>
                <div className="max-h-80 overflow-auto">
                  <div className="border-b p-4 hover:bg-accent">
                    <p className="text-sm font-medium">{t('notifications.newMessageProcessed')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      12 {t('notifications.minutesAgo')}
                    </p>
                  </div>
                  <div className="border-b p-4 hover:bg-accent">
                    <p className="text-sm font-medium">{t('notifications.newMemberIdentified')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 {t('notifications.hourAgo')}
                    </p>
                  </div>
                  <div className="p-4 hover:bg-accent">
                    <p className="text-sm font-medium">{t('notifications.analysisCompleted')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      3 {t('notifications.hoursAgo')}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button variant="ghost" size="sm" className="w-full h-8 text-xs">
                    {t('header.viewAllNotifications')}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Área de conteúdo principal com scroll */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6 px-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para fechar o sidebar em dispositivos móveis */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 