$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot
Get-Content '.env.local' | ForEach-Object {
  if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
    $name = $matches[1]
    $value = $matches[2] -replace '^"|"$', ''
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
}
Set-Location 'packages\db'
pnpm exec drizzle-kit migrate --config=drizzle.config.ts
