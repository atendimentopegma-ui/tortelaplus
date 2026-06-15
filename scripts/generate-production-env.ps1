param([string]$Output = ".env.production")

$ErrorActionPreference = "Stop"
function Secret([int]$bytes = 32) {
  $buffer = New-Object byte[] $bytes
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  $generator.GetBytes($buffer)
  $generator.Dispose()
  return [Convert]::ToBase64String($buffer).Replace("+", "-").Replace("/", "_").TrimEnd("=")
}

$content = @"
NODE_ENV=production
PORT=4173
DATABASE_URL=COLE_AQUI_A_URL_DO_NEON
PGSSL=require
PEGMA_SECRET_KEY=$(Secret 48)
PEGMA_CENTRAL_USER=admin
PEGMA_CENTRAL_PASSWORD=$(Secret 24)
PEGMA_PROVIDER_TOKEN=$(Secret 48)
PEGMA_SESSION_TTL_MINUTES=480
PEGMA_BACKUP_INTERVAL_MINUTES=360
PEGMA_BACKUP_RETENTION_DAYS=30
"@
Set-Content -LiteralPath $Output -Value $content -Encoding UTF8
Write-Host "Arquivo criado: $Output"
