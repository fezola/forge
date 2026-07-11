$rootCAPath = "$env:LOCALAPPDATA\mkcert\rootCA.pem"
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($rootCAPath)
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
$store.Add($cert)
$store.Close()
Write-Output "Installed: $($cert.Subject)"
