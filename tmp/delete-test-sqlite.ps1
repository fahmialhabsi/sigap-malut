$path = 'E:\sigap-malut\backend\tests\test.sqlite'
$deleted = $false
for ($i = 0; $i -lt 12; $i++) {
  try {
    Remove-Item -LiteralPath $path -Force -ErrorAction Stop
    Write-Output 'deleted'
    $deleted = $true
    break
  } catch {
    Write-Output ([string]::Format('retry {0}: {1}', $i, $_.Exception.Message))
    Start-Sleep -Milliseconds 500
  }
}
if (-not $deleted) { Write-Output 'delete-failed' }
