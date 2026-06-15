param(
  [string]$StartupName = "PegmaPlusFiscalAgent",
  [string]$NodePath = "C:\Program Files\nodejs\node.exe",
  [string]$ProjectPath = (Split-Path -Parent $PSScriptRoot),
  [string]$AgentToken = $env:PEGMA_AGENT_TOKEN
)

$ErrorActionPreference = "Stop"
$ProjectPath = (Resolve-Path $ProjectPath).Path
$AgentPath = Join-Path $ProjectPath "fiscal-agent.js"
if (-not (Test-Path $NodePath)) { throw "Node.js nao encontrado em $NodePath" }
if (-not (Test-Path $AgentPath)) { throw "Agente fiscal nao encontrado em $AgentPath" }
if (-not $AgentToken) { throw "Informe PEGMA_AGENT_TOKEN antes de instalar o agente." }

[Environment]::SetEnvironmentVariable("PEGMA_AGENT_TOKEN", $AgentToken, "User")
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$command = "`"$NodePath`" `"$AgentPath`""
New-Item -Path $runKey -Force | Out-Null
Set-ItemProperty -Path $runKey -Name $StartupName -Value $command

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -like "*fiscal-agent.js*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
$env:PEGMA_AGENT_TOKEN = $AgentToken
Start-Process -FilePath $NodePath -ArgumentList $AgentPath -WorkingDirectory $ProjectPath -WindowStyle Hidden
Write-Host "Agente fiscal iniciado e configurado para abrir com o Windows: $StartupName"
