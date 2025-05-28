# 🚀 Scripts de Desenvolvimento

Este diretório contém scripts para resolver problemas de portas e facilitar o desenvolvimento.

## 📋 Scripts Disponíveis

### 1. `dev-clean.ps1`
**Inicia o servidor limpando portas automaticamente**

```bash
npm run dev:clean
```

**O que faz:**
- 🧹 Limpa automaticamente as portas 3000, 3001 e 3010
- 🎯 Define a porta fixa como 3009
- 🚀 Inicia o Next.js na porta 3009

### 2. `kill-port.ps1`
**Mata processos em uma porta específica**

```bash
npm run kill-port 3010
```

**Exemplo de uso:**
```bash
# Matar processos na porta 3010
npm run kill-port 3010

# Matar processos na porta 3000
npm run kill-port 3000
```

### 3. Scripts NPM Adicionais

```bash
# Desenvolvimento normal
npm run dev

# Desenvolvimento com limpeza automática (RECOMENDADO)
npm run dev:clean

# Desenvolvimento na porta 3009 (sem limpeza)
npm run dev:3009
```

## 🎯 Porta Padrão

O projeto agora usa a **porta 3009** como padrão para evitar conflitos.

**URLs de acesso:**
- 🌐 Local: `http://localhost:3009`
- 🔗 Rede: `http://192.168.x.x:3009`

## 🛠️ Solução de Problemas

### Erro "EADDRINUSE"
Se ainda encontrar erro de porta ocupada:

1. **Solução Automática (Recomendada):**
   ```bash
   npm run dev:clean
   ```

2. **Solução Manual:**
   ```bash
   npm run kill-port 3009
   npm run dev:3009
   ```

### Permissões PowerShell
Se encontrar erro de execução de script:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎉 Benefícios

- ✅ **Sem mais conflitos de porta**
- ✅ **Inicialização automática e limpa**
- ✅ **Porta fixa e previsível (3009)**
- ✅ **Scripts inteligentes e visuais**
- ✅ **Compatibilidade total com Windows**

## 📝 Notas

- Os scripts são otimizados para Windows PowerShell
- A porta 3009 foi escolhida por ser menos comum
- Todos os scripts incluem feedback visual colorido
- Erros são tratados graciosamente 