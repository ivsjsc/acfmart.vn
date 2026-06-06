# List QR Batches - Get Batch IDs for Testing
# Usage: .\list-qr-batches.ps1 -Token "eyJ..."

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "List QR Batches - Production" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Domain: https://api.acfmart.vn" -ForegroundColor Yellow
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/json"
    }

    $response = Invoke-RestMethod `
        -Uri "https://api.acfmart.vn/v1/sellers/me/qr-batches" `
        -Method GET `
        -Headers $headers

    Write-Host "✓ Successfully retrieved batches" -ForegroundColor Green
    Write-Host ""

    if ($response.data -and $response.data.Count -gt 0) {
        Write-Host "Found $($response.data.Count) batch(es):" -ForegroundColor Yellow
        Write-Host ""
        
        foreach ($batch in $response.data) {
            Write-Host "----------------------------------------" -ForegroundColor Gray
            Write-Host "Batch ID: $($batch.id)" -ForegroundColor White
            Write-Host "Status: $($batch.status)" -ForegroundColor White
            Write-Host "Created: $($batch.createdAt)" -ForegroundColor White
            if ($batch.name) {
                Write-Host "Name: $($batch.name)" -ForegroundColor White
            }
            Write-Host ""
        }

        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "To test PDF export, run:" -ForegroundColor Green
        Write-Host ".\test-qr-pdf-export.ps1 -Token `"$Token`" -BatchId `"$($response.data[0].id)`"" -ForegroundColor Yellow
    } else {
        Write-Host "No batches found." -ForegroundColor Yellow
        Write-Host "You need to create a QR batch first before testing PDF export." -ForegroundColor Yellow
    }

} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Yellow
    }
    
    exit 1
}
