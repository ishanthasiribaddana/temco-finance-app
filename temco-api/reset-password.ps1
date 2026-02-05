$body = @{
    password = "test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/temco-api/api/debug/reset-password/ishantha@gmail.com" -Method POST -ContentType "application/json" -Body $body
$response | ConvertTo-Json
