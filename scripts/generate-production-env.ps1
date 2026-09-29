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
TORTELAPLUS_ENV=production-paid
TORTELAPLUS_REQUIRE_PAID_PROVIDER=true
DATABASE_URL=COLE_AQUI_A_URL_DO_NEON
PGSSL=require
TORTELAPLUS_ALLOWED_ORIGINS=https://tortelaplus-app.onrender.com,https://tortelaplus-rede.onrender.com
TORTELAPLUS_SECRET_KEY=$(Secret 48)
TORTELAPLUS_PUBLIC_LINK_SECRET=$(Secret 48)
TORTELAPLUS_CENTRAL_USER=admin
TORTELAPLUS_CENTRAL_PASSWORD=$(Secret 24)
TORTELAPLUS_PROVIDER_TOKEN=$(Secret 48)
TORTELAPLUS_BACKUP_DIR=COLE_AQUI_A_PASTA_OU_STORAGE_DE_BACKUP
TORTELAPLUS_SESSION_TTL_MINUTES=480
TORTELAPLUS_BACKUP_INTERVAL_MINUTES=360
TORTELAPLUS_BACKUP_RETENTION_DAYS=30
"@
Set-Content -LiteralPath $Output -Value $content -Encoding UTF8
Write-Host "Arquivo criado: $Output"
