param(
  [Parameter(Mandatory = $true)][string]$SourcePath,
  [string]$ProjectPath = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$SourcePath = (Resolve-Path $SourcePath).Path
$ProjectPath = (Resolve-Path $ProjectPath).Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $ProjectPath "data\agent-update-backups\$stamp"

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -like "*fiscal-agent.js*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
New-Item -ItemType Directory -Force -Path $backup | Out-Null
Copy-Item -LiteralPath (Join-Path $ProjectPath "fiscal-agent.js") -Destination $backup
Copy-Item -LiteralPath (Join-Path $ProjectPath "runtime\fiscal") -Destination $backup -Recurse

Copy-Item -LiteralPath (Join-Path $SourcePath "fiscal-agent.js") -Destination $ProjectPath -Force
if (Test-Path (Join-Path $SourcePath "runtime\fiscal")) {
  Copy-Item -LiteralPath (Join-Path $SourcePath "runtime\fiscal\*") -Destination (Join-Path $ProjectPath "runtime\fiscal") -Recurse -Force
}
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList (Join-Path $ProjectPath "fiscal-agent.js") -WorkingDirectory $ProjectPath -WindowStyle Hidden
Write-Host "Agente fiscal atualizado. Backup: $backup"
