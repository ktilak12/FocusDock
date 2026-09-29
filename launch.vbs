Dim objShell, fso, scriptDir
Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

objShell.CurrentDirectory = scriptDir
objShell.Environment("PROCESS")("ELECTRON_OVERRIDE_DIST_PATH") = scriptDir & "\node_modules\electron\dist"
objShell.Run Chr(34) & scriptDir & "\node_modules\electron\dist\electron.exe" & Chr(34) & " " & Chr(34) & scriptDir & "\dist\main\index.js" & Chr(34), 0, False
