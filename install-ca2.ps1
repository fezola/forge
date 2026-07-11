$env:Path += ";C:\Users\hp\framer\forge"
mkcert -install 2>&1 | Out-File -FilePath "C:\Users\hp\framer\forge\mkcert-install2.log"
mkcert localhost 127.0.0.1 ::1 2>&1 | Out-File -FilePath "C:\Users\hp\framer\forge\mkcert-cert2.log"
