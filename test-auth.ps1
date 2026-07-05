# OBOOK Authentication Testing Script for PowerShell
# Run this to verify signup and login functionality

Write-Host "=== OBOOK Authentication Testing ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verify server is running
Write-Host "Test 1: Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api" -ErrorAction Stop
    Write-Host "✓ Server is running" -ForegroundColor Green
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "✗ Server is not responding. Make sure Node.js server is running!" -ForegroundColor Red
    exit
}
Write-Host ""

# Test 2: Test Signup
Write-Host "Test 2: Testing Signup Endpoint..." -ForegroundColor Yellow
$signupData = @{
    username = "testuser"
    email = "testuser@example.com"
    password = "TestPassword123"
    confirmPassword = "TestPassword123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/signup" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $signupData `
        -ErrorAction Stop
    Write-Host "✓ Signup successful" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json)
} catch {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($errorResponse)
    $error = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "✗ Signup failed:" -ForegroundColor Red
    Write-Host $error
}
Write-Host ""

# Test 3: Test Login
Write-Host "Test 3: Testing Login Endpoint..." -ForegroundColor Yellow
$loginData = @{
    email = "testuser@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $loginData `
        -SessionVariable session `
        -ErrorAction Stop
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json)
} catch {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($errorResponse)
    $error = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "✗ Login failed:" -ForegroundColor Red
    Write-Host $error
}
Write-Host ""

# Test 4: Test Posts API
Write-Host "Test 4: Testing Posts API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/posts" `
        -Headers @{"Content-Type" = "application/json"} `
        -ErrorAction Stop
    Write-Host "✓ Posts API working" -ForegroundColor Green
    $posts = $response.Content | ConvertFrom-Json
    Write-Host "Found $($posts.Count) posts"
} catch {
    Write-Host "✗ Posts API failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
