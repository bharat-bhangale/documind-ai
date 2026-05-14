$inputJson = [Console]::In.ReadToEnd()

$blockedPatterns = @(
  "git\s+reset\s+--hard",
  "git\s+checkout\s+--",
  "Remove-Item\s+.*-Recurse\s+.*-Force",
  "rm\s+-rf",
  "Invoke-Expression",
  "curl\s+.*\|\s*(bash|sh|pwsh|powershell)",
  "wget\s+.*\|\s*(bash|sh|pwsh|powershell)",
  "Get-ChildItem\s+Env:"
)

foreach ($pattern in $blockedPatterns) {
  if ($inputJson -match $pattern) {
    Write-Error "Blocked by DocuMind hook policy: $pattern"
    exit 1
  }
}

exit 0

