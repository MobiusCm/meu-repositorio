param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "🔍 Verificando processos na porta $Port..." -ForegroundColor Yellow

# Buscar processos usando a porta
$processes = netstat -ano | findstr ":$Port"

if ($processes) {
    Write-Host "📋 Processos encontrados na porta $Port:" -ForegroundColor Cyan
    $processes | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    # Extrair PIDs únicos
    $pids = $processes | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Sort-Object -Unique
    
    foreach ($pid in $pids) {
        try {
            Write-Host "💀 Finalizando processo PID: $pid..." -ForegroundColor Red
            taskkill /PID $pid /F | Out-Null
            Write-Host "✅ Processo $pid finalizado com sucesso!" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Erro ao finalizar processo $pid: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ Nenhum processo encontrado na porta $Port" -ForegroundColor Green
}

Write-Host "🎉 Porta $Port liberada!" -ForegroundColor Green 