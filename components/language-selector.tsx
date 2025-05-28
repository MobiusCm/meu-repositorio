'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Language, getTranslation } from '@/lib/translations';

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    // Carregar idioma salvo do localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    } else {
      // Detectar idioma do navegador
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.startsWith('en')) {
        setLanguage('en');
      } else {
        setLanguage('pt');
      }
    }
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Atualizar o atributo lang do HTML
    document.documentElement.lang = newLanguage === 'pt' ? 'pt-BR' : 'en';
    
    // Callback para componente pai
    onLanguageChange?.(newLanguage);
    
    // Recarregar a página para aplicar as traduções
    window.location.reload();
  };

  const t = (key: string) => getTranslation(language, key);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('general.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('pt')}
          className={language === 'pt' ? 'bg-accent' : ''}
        >
          🇧🇷 Português
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          🇺🇸 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 