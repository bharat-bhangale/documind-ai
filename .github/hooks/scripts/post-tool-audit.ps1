$inputJson = [Console]::In.ReadToEnd()
$auditDir = Join-Path $PSScriptRoot "..\..\..\logs"
$auditFile = Join-Path $auditDir "agent-tool-audit.log"

if (-not (Test-Path -LiteralPath $auditDir)) {
  New-Item -ItemType Directory -Path $auditDir | Out-Null
}

$timestamp = Get-Date -Format "o"
"[$timestamp] Tool completed. Payload size: $($inputJson.Length)" | Add-Content -LiteralPath $auditFile

exit 0

