$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and ($_.CommandLine -match 'test.sqlite' -or $_.CommandLine -match 'testAllModules.js' -or $_.CommandLine -match 'tests/testAllModules.js') }
if ($procs) {
  foreach ($p in $procs) {
    Write-Output ("Killing PID: {0} - {1}" -f $p.ProcessId, $p.CommandLine)
    try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
  }
} else {
  Write-Output 'no-locking-process-found'
}
Try {
  Remove-Item -LiteralPath 'E:\sigap-malut\backend\tests\test.sqlite' -Force -ErrorAction Stop
  Write-Output 'deleted'
} Catch {
  Write-Output 'delete-failed'
}
npm --prefix backend test
