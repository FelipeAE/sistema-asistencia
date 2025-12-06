$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Sistema Asistencia Casino.lnk")
$Shortcut.TargetPath = "C:\Users\fiae\sistema-asistencia\IniciarSistema.bat"
$Shortcut.WorkingDirectory = "C:\Users\fiae\sistema-asistencia"
$Shortcut.Description = "Iniciar Sistema de Asistencia Casino"
$Shortcut.Save()
Write-Host "Acceso directo creado en el escritorio!"
