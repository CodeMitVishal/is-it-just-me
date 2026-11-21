# Runs `node tools/publish.js` every 15 minutes while you are logged in to Windows.
# Free alternative to the GitHub Actions schedule. Only runs when this PC is on.
#
#   Install:  powershell -ExecutionPolicy Bypass -File tools\schedule-windows.ps1
#   Remove:   powershell -ExecutionPolicy Bypass -File tools\schedule-windows.ps1 -Remove
#   Logs:     data\publish.log  (ignored by git)
param([switch]$Remove, [int]$Minutes = 15)

$TaskName = 'IsItJustMe-Publish'
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if ($Remove) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Removed scheduled task '$TaskName'."
    return
}

$Node = (Get-Command node -ErrorAction Stop).Source
$Log = Join-Path $Repo 'data\publish.log'
# cmd.exe is used only to redirect output into the log file.
$Arguments = "/c `"`"$Node`" `"$Repo\tools\publish.js`" >> `"$Log`" 2>&1`""

$Action    = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument $Arguments -WorkingDirectory $Repo
$Trigger   = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes $Minutes)
$Settings  = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
               -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Force | Out-Null
Write-Host "Scheduled '$TaskName': every $Minutes minutes from $Repo"
Write-Host "Log file: $Log"
