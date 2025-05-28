export type Language = 'pt' | 'en';

export interface Translations {
  // Navegação
  navigation: {
    dashboard: string;
    groupAnalytics: string;
    memberInsights: string;
    reports: string;
    settings: string;
    closeMenu: string;
    openMenu: string;
    toggleTheme: string;
  };

  // Cabeçalho
  header: {
    whatsappInsights: string;
    notifications: string;
    markAllAsRead: string;
    viewAllNotifications: string;
  };

  // Dashboard
  dashboard: {
    welcomeBack: string;
    overview: string;
    totalGroups: string;
    totalMessages: string;
    activeMembers: string;
    engagementRate: string;
    messageActivity: string;
    memberGrowth: string;
    topGroups: string;
    recentActivity: string;
    smartInsights: string;
    quickStats: string;
    newGroup: string;
    refreshData: string;
    dailyAverage: string;
    messagesPerDay: string;
    activityPeak: string;
    messagesInOneDay: string;
    activeGroups: string;
    ofGroups: string;
    thisMonth: string;
    inSelectedPeriod: string;
    totalHistoric: string;
    calculatedDynamically: string;
    noDataAvailable: string;
    last7Days: string;
    last15Days: string;
    last30Days: string;
    allPeriod: string;
    customPeriod: string;
    selectPeriod: string;
    apply: string;
    period: string;
    until: string;
    days: string;
    showingDataFromAllPeriod: string;
  };

  // Autenticação
  auth: {
    enterYourAccount: string;
    email: string;
    password: string;
    forgotPassword: string;
    login: string;
    loggingIn: string;
    testLogin: string;
    development: string;
    loginSuccessful: string;
    welcomeBack: string;
    loginError: string;
    unexpectedError: string;
    testLoginPerformed: string;
    welcome: string;
    testAccountCreated: string;
    loginWithCredentials: string;
    errorCreatingTestAccount: string;
    errorInTestLogin: string;
    logout: string;
    logoutPerformed: string;
    disconnectedSuccessfully: string;
    logoutError: string;
    errorDisconnecting: string;
  };

  // Grupos
  groups: {
    backToDashboard: string;
    updateChat: string;
    analyzing: string;
    analyzingMessages: string;
    totalMessages: string;
    activeMembers: string;
    analyzedPeriod: string;
    overview: string;
    members: string;
    statistics: string;
    oracle: string;
    dailyActivity: string;
    messagesSentPerDay: string;
    activeMembersPerDay: string;
    activityByHour: string;
    messageDistributionThroughoutDay: string;
    participantsWhoSentMessages: string;
    searchByName: string;
    msgs: string;
    profiled: string;
    details: string;
    viewProfile: string;
    words: string;
    perMsg: string;
    mediaSent: string;
    activityByMember: string;
    messagesPerDayTop5: string;
    noActiveMemberFound: string;
    messageDistribution: string;
    activityComparisonBetweenMembers: string;
    generalStatistics: string;
    analysisGroupSummary: string;
    dailyAverage: string;
    analyzedDays: string;
    totalWords: string;
    totalMedia: string;
    analysisPeriod: string;
    start: string;
    end: string;
    wordsPerMessage: string;
    averageWordsPerMessage: string;
    oracleAnalysis: string;
    askQuestionsAboutGroupData: string;
    askQuestionAboutGroup: string;
    consultOracle: string;
    processing: string;
    exampleQuestions: string;
    whoAreMostActiveMembers: string;
    whatTimesGroupMostActive: string;
    anyBehaviorPatternInGroup: string;
    averageWordsPerMessageMembers: string;
  };

  // Membros
  members: {
    memberProfile: string;
    identity: string;
    behavior: string;
    preferences: string;
    others: string;
    name: string;
    totalAnalyzedMessages: string;
    generalSummary: string;
    notAvailable: string;
    frequentTopics: string;
    writingStyle: string;
    communicationTone: string;
    humorPatterns: string;
    verbosityLevel: string;
    emojiUsage: string;
    controversyParticipation: string;
    activityHours: string;
    characteristicPhrases: string;
    likes: string;
    dislikes: string;
    explicitPreferences: string;
    positions: string;
    additionalInformation: string;
    randomData: string;
    loadingProfile: string;
    errorLoadingProfile: string;
    couldNotLoadProfile: string;
    profileNotFound: string;
    createProfile: string;
    creatingProfile: string;
    profileCreated: string;
    profileCreatedSuccessfully: string;
    errorCreatingProfile: string;
    couldNotCreateProfile: string;
    analyzing: string;
    analyzingMember: string;
    analysisCompleted: string;
    analysisCompletedSuccessfully: string;
    errorInAnalysis: string;
    couldNotAnalyzeMember: string;
    close: string;
    notes: string;
    addNotes: string;
    saveNotes: string;
    notesUpdated: string;
    notesUpdatedSuccessfully: string;
    errorUpdatingNotes: string;
    couldNotUpdateNotes: string;
  };

  // Notificações
  notifications: {
    newMessageProcessed: string;
    newMemberIdentified: string;
    analysisCompleted: string;
    minutesAgo: string;
    hourAgo: string;
    hoursAgo: string;
  };

  // Formulários
  forms: {
    loading: string;
    redirecting: string;
    error: string;
    success: string;
    information: string;
    noDataFoundForPeriod: string;
    errorLoadingData: string;
    couldNotLoadDashboardData: string;
    errorLoadingStatistics: string;
    couldNotAnalyzeDataForPeriod: string;
    connectionError: string;
    checkInternet: string;
    errorProcessingMemberData: string;
    invalidFormat: string;
    accessDenied: string;
    noPermissionToAccessData: string;
    dataNotFound: string;
    noDataAvailableForPeriod: string;
  };

  // Geral
  general: {
    user: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    refresh: string;
    loading: string;
    noData: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    open: string;
    show: string;
    hide: string;
    more: string;
    less: string;
    all: string;
    none: string;
    select: string;
    clear: string;
    reset: string;
    copy: string;
    paste: string;
    cut: string;
    undo: string;
    redo: string;
    help: string;
    about: string;
    version: string;
    settings: string;
    profile: string;
    account: string;
    preferences: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    auto: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    navigation: {
      dashboard: 'Dashboard',
      groupAnalytics: 'Análise de Grupos',
      memberInsights: 'Insights de Membros',
      reports: 'Relatórios',
      settings: 'Configurações',
      closeMenu: 'Fechar menu',
      openMenu: 'Abrir menu',
      toggleTheme: 'Alternar tema',
    },
    header: {
      whatsappInsights: 'WhatsApp Insights',
      notifications: 'Notificações',
      markAllAsRead: 'Marcar todas como lidas',
      viewAllNotifications: 'Ver todas as notificações',
    },
    dashboard: {
      welcomeBack: 'Bem-vindo de volta, Usuário!',
      overview: 'Aqui está uma visão geral da atividade dos seus grupos de WhatsApp.',
      totalGroups: 'Total de Grupos',
      totalMessages: 'Total de Mensagens',
      activeMembers: 'Membros Ativos',
      engagementRate: 'Taxa de Engajamento',
      messageActivity: 'Atividade de Mensagens',
      memberGrowth: 'Crescimento de Membros',
      topGroups: 'Principais Grupos',
      recentActivity: 'Atividade Recente',
      smartInsights: 'Insights Inteligentes',
      quickStats: 'Estatísticas Rápidas',
      newGroup: 'Novo Grupo',
      refreshData: 'Atualizar Dados',
      dailyAverage: 'Média Diária',
      messagesPerDay: 'mensagens por dia',
      activityPeak: 'Pico de Atividade',
      messagesInOneDay: 'mensagens em um dia',
      activeGroups: 'Grupos Ativos',
      ofGroups: 'de {total} grupos',
      thisMonth: '+2 este mês',
      inSelectedPeriod: 'No período selecionado',
      totalHistoric: 'Total histórico',
      calculatedDynamically: 'Calculado dinamicamente',
      noDataAvailable: 'Nenhum dado disponível para o período selecionado',
      last7Days: 'Últimos 7 dias',
      last15Days: 'Últimos 15 dias',
      last30Days: 'Últimos 30 dias',
      allPeriod: 'Todo o período',
      customPeriod: 'Período personalizado',
      selectPeriod: 'Selecionar período',
      apply: 'Aplicar',
      period: 'Período',
      until: 'até',
      days: 'dias',
      showingDataFromAllPeriod: 'Exibindo dados de todo o período disponível',
    },
    auth: {
      enterYourAccount: 'Entre na sua conta',
      email: 'Email',
      password: 'Senha',
      forgotPassword: 'Esqueceu a senha?',
      login: 'Entrar',
      loggingIn: 'Entrando...',
      testLogin: 'Login de Teste (Desenvolvimento)',
      development: 'Desenvolvimento',
      loginSuccessful: 'Login realizado com sucesso',
      welcomeBack: 'Bem-vindo de volta!',
      loginError: 'Erro ao fazer login',
      unexpectedError: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      testLoginPerformed: 'Login de teste realizado',
      welcome: 'Bem-vindo!',
      testAccountCreated: 'Conta de teste criada',
      loginWithCredentials: 'Faça login com test@example.com / 123456',
      errorCreatingTestAccount: 'Erro ao criar conta de teste',
      errorInTestLogin: 'Erro no login de teste',
      logout: 'Logout',
      logoutPerformed: 'Logout realizado',
      disconnectedSuccessfully: 'Você foi desconectado com sucesso.',
      logoutError: 'Erro ao fazer logout',
      errorDisconnecting: 'Ocorreu um erro ao tentar desconectar.',
    },
    groups: {
      backToDashboard: 'Voltar ao Dashboard',
      updateChat: 'Atualizar Chat',
      analyzing: 'Analisando...',
      analyzingMessages: 'Analisando mensagens para o período selecionado...',
      totalMessages: 'Total de Mensagens',
      activeMembers: 'Membros Ativos',
      analyzedPeriod: 'Período Analisado',
      overview: 'Visão Geral',
      members: 'Membros',
      statistics: 'Estatísticas',
      oracle: 'Oráculo',
      dailyActivity: 'Atividade Diária',
      messagesSentPerDay: 'Mensagens enviadas por dia no grupo',
      activeMembersPerDay: 'Quantidade de membros ativos por dia',
             activityByHour: 'Atividade por Hora do Dia',
       messageDistributionThroughoutDay: 'Distribuição de mensagens ao longo do dia',
       participantsWhoSentMessages: 'Lista de participantes que enviaram mensagens',
      searchByName: 'Buscar por nome...',
      msgs: 'msgs',
      profiled: 'Fichado',
      details: 'Detalhes',
      viewProfile: 'Ver Ficha',
      words: 'palavras',
      perMsg: 'por msg',
      mediaSent: 'mídias enviadas',
      activityByMember: 'Atividade por Membro',
      messagesPerDayTop5: 'Mensagens por dia dos 5 membros mais ativos',
      noActiveMemberFound: 'Nenhum membro ativo encontrado no período selecionado',
      messageDistribution: 'Distribuição de Mensagens',
      activityComparisonBetweenMembers: 'Comparação de atividade entre membros',
      generalStatistics: 'Estatísticas Gerais',
      analysisGroupSummary: 'Resumo da análise do grupo',
      dailyAverage: 'Média Diária',
      analyzedDays: 'Dias Analisados',
      totalWords: 'Total de Palavras',
      totalMedia: 'Total de Mídias',
      analysisPeriod: 'Período de Análise',
      start: 'Início',
      end: 'Fim',
      wordsPerMessage: 'Palavras por Mensagem',
      averageWordsPerMessage: 'Média de palavras por mensagem enviada',
      oracleAnalysis: 'Oráculo de Análise',
      askQuestionsAboutGroupData: 'Faça perguntas sobre os dados do grupo e receba insights com IA',
      askQuestionAboutGroup: 'Faça uma pergunta sobre os dados do seu grupo...',
      consultOracle: 'Consultar Oráculo',
      processing: 'Processando...',
      exampleQuestions: 'Exemplos de perguntas que você pode fazer:',
      whoAreMostActiveMembers: 'Quem são os membros mais ativos do grupo?',
      whatTimesGroupMostActive: 'Em quais horários o grupo está mais ativo?',
      anyBehaviorPatternInGroup: 'Há algum padrão de comportamento no grupo?',
      averageWordsPerMessageMembers: 'Qual a média de palavras por mensagem dos membros?',
    },
    members: {
      memberProfile: 'Perfil do Membro',
      identity: 'Identidade',
      behavior: 'Comportamento',
      preferences: 'Preferências',
      others: 'Outros',
      name: 'Nome',
      totalAnalyzedMessages: 'Total de mensagens analisadas',
      generalSummary: 'Resumo geral',
      notAvailable: 'Não disponível',
      frequentTopics: 'Tópicos frequentes',
      writingStyle: 'Estilo de escrita',
      communicationTone: 'Tom de comunicação',
      humorPatterns: 'Padrões de humor',
      verbosityLevel: 'Nível de prolixidade',
      emojiUsage: 'Uso de emojis',
      controversyParticipation: 'Participação em polêmicas',
      activityHours: 'Horários de atividade',
      characteristicPhrases: 'Frases características',
      likes: 'Gosta de',
      dislikes: 'Não gosta de',
      explicitPreferences: 'Preferências explícitas',
      positions: 'Posicionamentos',
      additionalInformation: 'Informações adicionais',
      randomData: 'Dados aleatórios',
      loadingProfile: 'Carregando perfil...',
      errorLoadingProfile: 'Erro ao carregar perfil',
      couldNotLoadProfile: 'Não foi possível carregar o perfil.',
      profileNotFound: 'Perfil não encontrado',
      createProfile: 'Criar Perfil',
      creatingProfile: 'Criando perfil...',
      profileCreated: 'Perfil criado',
      profileCreatedSuccessfully: 'Perfil criado com sucesso.',
      errorCreatingProfile: 'Erro ao criar perfil',
      couldNotCreateProfile: 'Não foi possível criar o perfil.',
      analyzing: 'Analisando...',
      analyzingMember: 'Analisando membro...',
      analysisCompleted: 'Análise concluída',
      analysisCompletedSuccessfully: 'Análise concluída com sucesso.',
      errorInAnalysis: 'Erro na análise',
      couldNotAnalyzeMember: 'Não foi possível analisar o membro.',
      close: 'Fechar',
      notes: 'Anotações',
      addNotes: 'Adicionar anotações',
      saveNotes: 'Salvar anotações',
      notesUpdated: 'Anotações atualizadas',
      notesUpdatedSuccessfully: 'Anotações atualizadas com sucesso.',
      errorUpdatingNotes: 'Erro ao atualizar anotações',
      couldNotUpdateNotes: 'Não foi possível atualizar as anotações.',
    },
    notifications: {
      newMessageProcessed: 'Nova mensagem processada',
      newMemberIdentified: 'Novo membro identificado',
      analysisCompleted: 'Análise concluída',
      minutesAgo: 'minutos atrás',
      hourAgo: 'hora atrás',
      hoursAgo: 'horas atrás',
    },
    forms: {
      loading: 'Carregando...',
      redirecting: 'Redirecionando...',
      error: 'Erro',
      success: 'Sucesso',
      information: 'Informação',
      noDataFoundForPeriod: 'Não foram encontrados dados para o período selecionado.',
      errorLoadingData: 'Erro ao carregar dados',
      couldNotLoadDashboardData: 'Não foi possível carregar os dados do dashboard.',
      errorLoadingStatistics: 'Erro ao carregar estatísticas',
      couldNotAnalyzeDataForPeriod: 'Não foi possível analisar os dados para o período selecionado.',
      connectionError: 'Erro de conexão ao tentar buscar os dados. Verifique sua internet.',
      checkInternet: 'Verifique sua conexão com a internet.',
      errorProcessingMemberData: 'Erro ao processar os dados de membros. Formato inválido.',
      invalidFormat: 'Formato inválido.',
      accessDenied: 'Você não tem permissão para acessar estes dados.',
      noPermissionToAccessData: 'Sem permissão para acessar os dados.',
      dataNotFound: 'Não há dados disponíveis para o período selecionado.',
      noDataAvailableForPeriod: 'Nenhum dado disponível para o período.',
    },
    general: {
      user: 'Usuário',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Salvar',
      edit: 'Editar',
      delete: 'Excluir',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      download: 'Baixar',
      upload: 'Enviar',
      refresh: 'Atualizar',
      loading: 'Carregando',
      noData: 'Sem dados',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      yes: 'Sim',
      no: 'Não',
      ok: 'OK',
      close: 'Fechar',
      open: 'Abrir',
      show: 'Mostrar',
      hide: 'Ocultar',
      more: 'Mais',
      less: 'Menos',
      all: 'Todos',
      none: 'Nenhum',
      select: 'Selecionar',
      clear: 'Limpar',
      reset: 'Redefinir',
      copy: 'Copiar',
      paste: 'Colar',
      cut: 'Recortar',
      undo: 'Desfazer',
      redo: 'Refazer',
      help: 'Ajuda',
      about: 'Sobre',
      version: 'Versão',
      settings: 'Configurações',
      profile: 'Perfil',
      account: 'Conta',
      preferences: 'Preferências',
      language: 'Idioma',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Escuro',
      auto: 'Automático',
    },
  },
  en: {
    navigation: {
      dashboard: 'Dashboard',
      groupAnalytics: 'Group Analytics',
      memberInsights: 'Member Insights',
      reports: 'Reports',
      settings: 'Settings',
      closeMenu: 'Close menu',
      openMenu: 'Open menu',
      toggleTheme: 'Toggle theme',
    },
    header: {
      whatsappInsights: 'WhatsApp Insights',
      notifications: 'Notifications',
      markAllAsRead: 'Mark all as read',
      viewAllNotifications: 'View all notifications',
    },
    dashboard: {
      welcomeBack: 'Welcome Back, User!',
      overview: 'Here\'s an overview of your WhatsApp groups activity.',
      totalGroups: 'Total Groups',
      totalMessages: 'Total Messages',
      activeMembers: 'Active Members',
      engagementRate: 'Engagement Rate',
      messageActivity: 'Message Activity',
      memberGrowth: 'Member Growth',
      topGroups: 'Top Groups',
      recentActivity: 'Recent Activity',
      smartInsights: 'Smart Insights',
      quickStats: 'Quick Stats',
      newGroup: 'New Group',
      refreshData: 'Refresh Data',
      dailyAverage: 'Daily Average',
      messagesPerDay: 'messages per day',
      activityPeak: 'Activity Peak',
      messagesInOneDay: 'messages in one day',
      activeGroups: 'Active Groups',
      ofGroups: 'of {total} groups',
      thisMonth: '+2 this month',
      inSelectedPeriod: 'In selected period',
      totalHistoric: 'Total historic',
      calculatedDynamically: 'Calculated dynamically',
      noDataAvailable: 'No data available for the selected period',
      last7Days: 'Last 7 days',
      last15Days: 'Last 15 days',
      last30Days: 'Last 30 days',
      allPeriod: 'All period',
      customPeriod: 'Custom period',
      selectPeriod: 'Select period',
      apply: 'Apply',
      period: 'Period',
      until: 'until',
      days: 'days',
      showingDataFromAllPeriod: 'Showing data from all available period',
    },
    auth: {
      enterYourAccount: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      login: 'Sign In',
      loggingIn: 'Signing in...',
      testLogin: 'Test Login (Development)',
      development: 'Development',
      loginSuccessful: 'Login successful',
      welcomeBack: 'Welcome back!',
      loginError: 'Login error',
      unexpectedError: 'An unexpected error occurred. Please try again.',
      testLoginPerformed: 'Test login performed',
      welcome: 'Welcome!',
      testAccountCreated: 'Test account created',
      loginWithCredentials: 'Login with test@example.com / 123456',
      errorCreatingTestAccount: 'Error creating test account',
      errorInTestLogin: 'Error in test login',
      logout: 'Logout',
      logoutPerformed: 'Logout performed',
      disconnectedSuccessfully: 'You have been successfully disconnected.',
      logoutError: 'Logout error',
      errorDisconnecting: 'An error occurred while trying to disconnect.',
    },
    groups: {
      backToDashboard: 'Back to Dashboard',
      updateChat: 'Update Chat',
      analyzing: 'Analyzing...',
      analyzingMessages: 'Analyzing messages for the selected period...',
      totalMessages: 'Total Messages',
      activeMembers: 'Active Members',
      analyzedPeriod: 'Analyzed Period',
      overview: 'Overview',
      members: 'Members',
      statistics: 'Statistics',
      oracle: 'Oracle',
      dailyActivity: 'Daily Activity',
      messagesSentPerDay: 'Messages sent per day in the group',
      activeMembersPerDay: 'Number of active members per day',
             activityByHour: 'Activity by Hour of Day',
       messageDistributionThroughoutDay: 'Message distribution throughout the day',
       participantsWhoSentMessages: 'List of participants who sent messages',
      searchByName: 'Search by name...',
      msgs: 'msgs',
      profiled: 'Profiled',
      details: 'Details',
      viewProfile: 'View Profile',
      words: 'words',
      perMsg: 'per msg',
      mediaSent: 'media sent',
      activityByMember: 'Activity by Member',
      messagesPerDayTop5: 'Messages per day from top 5 most active members',
      noActiveMemberFound: 'No active member found in the selected period',
      messageDistribution: 'Message Distribution',
      activityComparisonBetweenMembers: 'Activity comparison between members',
      generalStatistics: 'General Statistics',
      analysisGroupSummary: 'Group analysis summary',
      dailyAverage: 'Daily Average',
      analyzedDays: 'Analyzed Days',
      totalWords: 'Total Words',
      totalMedia: 'Total Media',
      analysisPeriod: 'Analysis Period',
      start: 'Start',
      end: 'End',
      wordsPerMessage: 'Words per Message',
      averageWordsPerMessage: 'Average words per message sent',
      oracleAnalysis: 'Oracle Analysis',
      askQuestionsAboutGroupData: 'Ask questions about group data and receive AI insights',
      askQuestionAboutGroup: 'Ask a question about your group data...',
      consultOracle: 'Consult Oracle',
      processing: 'Processing...',
      exampleQuestions: 'Example questions you can ask:',
      whoAreMostActiveMembers: 'Who are the most active members of the group?',
      whatTimesGroupMostActive: 'What times is the group most active?',
      anyBehaviorPatternInGroup: 'Is there any behavior pattern in the group?',
      averageWordsPerMessageMembers: 'What is the average words per message of members?',
    },
    members: {
      memberProfile: 'Member Profile',
      identity: 'Identity',
      behavior: 'Behavior',
      preferences: 'Preferences',
      others: 'Others',
      name: 'Name',
      totalAnalyzedMessages: 'Total analyzed messages',
      generalSummary: 'General summary',
      notAvailable: 'Not available',
      frequentTopics: 'Frequent topics',
      writingStyle: 'Writing style',
      communicationTone: 'Communication tone',
      humorPatterns: 'Humor patterns',
      verbosityLevel: 'Verbosity level',
      emojiUsage: 'Emoji usage',
      controversyParticipation: 'Controversy participation',
      activityHours: 'Activity hours',
      characteristicPhrases: 'Characteristic phrases',
      likes: 'Likes',
      dislikes: 'Dislikes',
      explicitPreferences: 'Explicit preferences',
      positions: 'Positions',
      additionalInformation: 'Additional information',
      randomData: 'Random data',
      loadingProfile: 'Loading profile...',
      errorLoadingProfile: 'Error loading profile',
      couldNotLoadProfile: 'Could not load profile.',
      profileNotFound: 'Profile not found',
      createProfile: 'Create Profile',
      creatingProfile: 'Creating profile...',
      profileCreated: 'Profile created',
      profileCreatedSuccessfully: 'Profile created successfully.',
      errorCreatingProfile: 'Error creating profile',
      couldNotCreateProfile: 'Could not create profile.',
      analyzing: 'Analyzing...',
      analyzingMember: 'Analyzing member...',
      analysisCompleted: 'Analysis completed',
      analysisCompletedSuccessfully: 'Analysis completed successfully.',
      errorInAnalysis: 'Error in analysis',
      couldNotAnalyzeMember: 'Could not analyze member.',
      close: 'Close',
      notes: 'Notes',
      addNotes: 'Add notes',
      saveNotes: 'Save notes',
      notesUpdated: 'Notes updated',
      notesUpdatedSuccessfully: 'Notes updated successfully.',
      errorUpdatingNotes: 'Error updating notes',
      couldNotUpdateNotes: 'Could not update notes.',
    },
    notifications: {
      newMessageProcessed: 'New message processed',
      newMemberIdentified: 'New member identified',
      analysisCompleted: 'Analysis completed',
      minutesAgo: 'minutes ago',
      hourAgo: 'hour ago',
      hoursAgo: 'hours ago',
    },
    forms: {
      loading: 'Loading...',
      redirecting: 'Redirecting...',
      error: 'Error',
      success: 'Success',
      information: 'Information',
      noDataFoundForPeriod: 'No data found for the selected period.',
      errorLoadingData: 'Error loading data',
      couldNotLoadDashboardData: 'Could not load dashboard data.',
      errorLoadingStatistics: 'Error loading statistics',
      couldNotAnalyzeDataForPeriod: 'Could not analyze data for the selected period.',
      connectionError: 'Connection error when trying to fetch data. Check your internet.',
      checkInternet: 'Check your internet connection.',
      errorProcessingMemberData: 'Error processing member data. Invalid format.',
      invalidFormat: 'Invalid format.',
      accessDenied: 'You do not have permission to access this data.',
      noPermissionToAccessData: 'No permission to access data.',
      dataNotFound: 'No data available for the selected period.',
      noDataAvailableForPeriod: 'No data available for the period.',
    },
    general: {
      user: 'User',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      refresh: 'Refresh',
      loading: 'Loading',
      noData: 'No data',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      open: 'Open',
      show: 'Show',
      hide: 'Hide',
      more: 'More',
      less: 'Less',
      all: 'All',
      none: 'None',
      select: 'Select',
      clear: 'Clear',
      reset: 'Reset',
      copy: 'Copy',
      paste: 'Paste',
      cut: 'Cut',
      undo: 'Undo',
      redo: 'Redo',
      help: 'Help',
      about: 'About',
      version: 'Version',
      settings: 'Settings',
      profile: 'Profile',
      account: 'Account',
      preferences: 'Preferences',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
    },
  },
};

export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback para português se a chave não existir
      value = translations.pt;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Retorna a chave se não encontrar tradução
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
} 