# PowerShell script to configure CORS for IPFS on Windows

Write-Host "==== FundChain IPFS CORS Setup Tool ====" -ForegroundColor Cyan
Write-Host "This script will configure CORS settings for your local IPFS node."
Write-Host "These settings are required for the FundChain application to interact with IPFS."
Write-Host ""

# Check if IPFS is installed
$ipfsCommand = Get-Command ipfs -ErrorAction SilentlyContinue
if ($null -eq $ipfsCommand) {
    Write-Host "❌ IPFS is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install IPFS first: https://docs.ipfs.tech/install/command-line/"
    exit 1
}

# Check if IPFS daemon is running
$ipfsRunning = $false
try {
    $null = ipfs id 2>$null
    $ipfsRunning = $true
    Write-Host "✅ IPFS daemon is running" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ IPFS daemon is not running. Some commands may fail." -ForegroundColor Yellow
    Write-Host "You can start it with: ipfs daemon"
}

Write-Host ""
Write-Host "Configuring CORS settings..." -ForegroundColor Cyan

# Set CORS headers
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[`"*`"]"
Write-Host "✅ Set Access-Control-Allow-Origin: *" -ForegroundColor Green

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[`"GET`", `"POST`", `"PUT`", `"DELETE`", `"OPTIONS`"]"
Write-Host "✅ Set Access-Control-Allow-Methods" -ForegroundColor Green

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers "[`"Authorization`", `"X-Requested-With`", `"Range`", `"Content-Type`"]"
Write-Host "✅ Set Access-Control-Allow-Headers" -ForegroundColor Green

ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers "[`"Location`", `"WWW-Authenticate`"]"
Write-Host "✅ Set Access-Control-Expose-Headers" -ForegroundColor Green

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[`"true`"]"
Write-Host "✅ Set Access-Control-Allow-Credentials" -ForegroundColor Green

Write-Host ""
Write-Host "CORS configuration complete!" -ForegroundColor Green
Write-Host ""

if ($ipfsRunning) {
    Write-Host "⚠️ Important: You need to restart the IPFS daemon for changes to take effect." -ForegroundColor Yellow
    Write-Host "Run: ipfs shutdown"
    Write-Host "Then: ipfs daemon"
}

Write-Host ""
Write-Host "To verify CORS settings, open in your browser:" -ForegroundColor Cyan
Write-Host "http://localhost:3000/ipfs-direct-test.html"
Write-Host ""
Write-Host "==== Configuration Complete ====" -ForegroundColor Cyan 