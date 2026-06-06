# Production QR PDF Export Test Script
# Usage: .\test-qr-pdf-export.ps1 -Token "eyJ..." -BatchId "batch-xxx"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$true)]
    [string]$BatchId
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QR PDF Export Production Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Domain: https://api.acfmart.vn" -ForegroundColor Yellow
Write-Host "Batch ID: $BatchId" -ForegroundColor Yellow
Write-Host ""

# Test 1: Export PDF
Write-Host "[Test 1] Exporting QR PDF..." -ForegroundColor Green
$outputFile = "qrverified-a4-test.pdf"

try {
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/pdf"
    }

    Invoke-WebRequest `
        -Uri "https://api.acfmart.vn/v1/sellers/me/qr-batches/$BatchId/print-jobs" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body '{"preset":"A4"}' `
        -OutFile $outputFile

    Write-Host "✓ PDF file downloaded: $outputFile" -ForegroundColor Green
    
    # Verify PDF header
    $bytes = [System.IO.File]::ReadAllBytes($outputFile)
    $header = [System.Text.Encoding]::ASCII.GetString($bytes[0..4])
    
    Write-Host ""
    Write-Host "[Validation] Checking PDF header..." -ForegroundColor Green
    Write-Host "First 4 bytes: $header" -ForegroundColor Yellow
    
    if ($header -eq "%PDF") {
        Write-Host "✓ VALID PDF file detected (%PDF-)" -ForegroundColor Green
        Write-Host ""
        Write-Host "File size: $($bytes.Length) bytes" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Open the PDF file and verify:" -ForegroundColor White
        Write-Host "   - QR tem render đúng" -ForegroundColor White
        Write-Host "   - Chữ 'Quét để xác thực' không lỗi font" -ForegroundColor White
        Write-Host "   - QR scan ra https://qr.acfmart.vn/verify/{publicCode}" -ForegroundColor White
    } else {
        Write-Host "✗ INVALID: Not a PDF file (expected %PDF-, got: $header)" -ForegroundColor Red
        Write-Host ""
        Write-Host "ACTION REQUIRED: Check Cloud Run logs immediately" -ForegroundColor Red
        Write-Host "gcloud logging read --limit=50 --freshness=1h" -ForegroundColor Yellow
        exit 1
    }

} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 403) {
            Write-Host ""
            Write-Host "403 Forbidden - This might be expected if:" -ForegroundColor Yellow
            Write-Host "  - Seller is not ACTIVE" -ForegroundColor White
            Write-Host "  - Cross-seller access attempt" -ForegroundColor White
        } elseif ($statusCode -eq 404) {
            Write-Host ""
            Write-Host "404 Not Found - Batch ID might not exist or wrong endpoint" -ForegroundColor Yellow
        }
    }
    
    exit 1
}
