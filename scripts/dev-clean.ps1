Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
Write-Host "Limpando portas ocupadas..." -ForegroundColor Yellow

# Função para finalizar processos em uma porta específica
function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "Verificando porta $Port..." -ForegroundColor Gray
    
    try {
        # Buscar processos usando a porta
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            Write-Host "Finalizando processos na porta $Port..." -ForegroundColor Red
            
            foreach ($connection in $connections) {
                $processId = $connection.OwningProcess
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "Finalizando processo: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                        Write-Host "Processo $processId finalizado com sucesso" -ForegroundColor Green
                    }
                }
                catch {
                    Write-Host "Erro ao finalizar processo $processId" -ForegroundColor Red
                }
            }
        }
        else {
            Write-Host "Porta $Port está livre" -ForegroundColor Green
        }
    }
    catch {
        # Fallback para netstat se Get-NetTCPConnection falhar
        Write-Host "Usando método alternativo para porta $Port..." -ForegroundColor Yellow
        
        $netstatOutput = netstat -ano | Select-String ":$Port\s"
        
        if ($netstatOutput) {
            Write-Host "Finalizando processos na porta $Port..." -ForegroundColor Red
            
            $processIds = $netstatOutput | ForEach-Object {
                if ($_.Line -match "\s+(\d+)$") {
                    $matches[1]
                }
            } | Sort-Object -Unique
            
            foreach ($processId in $processIds) {
                if ($processId -and $processId -ne "0") {
                    try {
                        taskkill /PID $processId /F 2>$null | Out-Null
                        Write-Host "Processo $processId finalizado" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "Erro ao finalizar processo $processId" -ForegroundColor Red
                    }
                }
            }
        }
        else {
            Write-Host "Porta $Port está livre" -ForegroundColor Green
        }
    }
}

# Limpar portas comuns do Next.js e algumas extras
$ports = @(3000, 3001, 3009, 3010, 4000, 5000)

foreach ($port in $ports) {
    Stop-ProcessOnPort -Port $port
}

# Aguardar um momento para garantir que as portas sejam liberadas
Start-Sleep -Seconds 2

# Encontrar uma porta disponível
$availablePort = 3000
$maxPort = 3020

for ($testPort = 3000; $testPort -le $maxPort; $testPort++) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $testPort)
        $listener.Start()
        $listener.Stop()
        $availablePort = $testPort
        break
    }
    catch {
        continue
    }
}

Write-Host "Definindo porta disponível: $availablePort" -ForegroundColor Cyan
$env:PORT = $availablePort.ToString()

Write-Host "Iniciando Next.js na porta $availablePort..." -ForegroundColor Green
npm run dev 