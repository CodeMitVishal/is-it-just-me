# Runs the publisher (tools\run-publish.cmd → node tools\publish.js) every 15 minutes
# while you are logged in to Windows. Free alternative to the GitHub Actions schedule.
# Only runs when this PC is on. No admin rights needed.
#
#   Install:  powershell -ExecutionPolicy Bypass -File tools\schedule-windows.ps1
#   Remove:   powershell -ExecutionPolicy Bypass -File tools\schedule-windows.ps1 -Remove
#   Status:   schtasks /Query /TN IsItJustMe-Publish /V /FO LIST
#   Logs:     data\publish.log  (ignored by git)
#
# Uses schtasks.exe: the ScheduledTasks PowerShell cmdlets create an "indefinite repetition"
# value that some newer Windows builds reject (error 0x80041318).
param([switch]$Remove, [ValidateRange(5, 1439)][int]$Minutes = 15)

$TaskName = 'IsItJustMe-Publish'

if ($Remove) {
    schtasks /Delete /TN $TaskName /F | Out-Null
    Write-Host "Removed scheduled task '$TaskName'."
    return
}

$Runner = (Resolve-Path (Join-Path $PSScriptRoot 'run-publish.cmd')).Path
Get-Command node -ErrorAction Stop | Out-Null   # fail early if Node.js is missing

schtasks /Create /TN $TaskName /TR "`"$Runner`"" /SC MINUTE /MO $Minutes /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw "schtasks failed with exit code $LASTEXITCODE" }

Write-Host "Scheduled '$TaskName': every $Minutes minutes -> $Runner"
Write-Host "Log file: $(Join-Path (Split-Path $Runner -Parent | Split-Path -Parent) 'data\publish.log')"
