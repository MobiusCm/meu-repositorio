# Script simples para finalizar processos em portas específicas
param(
    [int[]]$Ports = @(3000, 3001, 3009, 3010, 4000, 5000)
)

Write-Host "Finalizando processos nas portas: $($Ports -join ', ')" -ForegroundColor Cyan

foreach ($port in $Ports) {
    Write-Host "Verificando porta $port..." -ForegroundColor Yellow
    
    # Usar netstat para encontrar processos
    $output = cmd /c "netstat -ano | findstr :$port"
    
    if ($output) {
        $lines = $output -split "`n" | Where-Object { $_ -match ":$port\s" }
        
        foreach ($line in $lines) {
            if ($line -match "\s+(\d+)\s*$") {
                $processId = $matches[1]
                
                if ($processId -and $processId -ne "0") {
                    try {
                        Write-Host "Finalizando processo PID: $processId na porta $port" -ForegroundColor Red
                        cmd /c "taskkill /PID $processId /F" 2>$null | Out-Null
                        Write-Host "✓ Processo $processId finalizado" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "✗ Erro ao finalizar processo $processId" -ForegroundColor Red
                    }
                }
            }
        }
    }
    else {
        Write-Host "✓ Porta $port está livre" -ForegroundColor Green
    }
}

Write-Host "Limpeza concluída!" -ForegroundColor Cyan 