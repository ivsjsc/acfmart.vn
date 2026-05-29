# Resize ACF Mart icon to all Android densities
Add-Type -AssemblyName System.Drawing

$sourceImage = "acfmart-android.png"
$img = [System.Drawing.Image]::FromFile($sourceImage)

$sizes = @(
    @{dpi='mdpi'; size=48},
    @{dpi='hdpi'; size=72},
    @{dpi='xhdpi'; size=96},
    @{dpi='xxhdpi'; size=144},
    @{dpi='xxxhdpi'; size=192}
)

foreach ($item in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($img, $item.size, $item.size)
    $outputPath = "app\src\main\res\mipmap-$($item.dpi)\ic_launcher.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Created: $outputPath ($($item.size)x$($item.size))"
}

# Also create 512x512 for Play Store
$bitmap512 = New-Object System.Drawing.Bitmap($img, 512, 512)
$bitmap512.Save("play-store-icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap512.Dispose()
Write-Host "Created: play-store-icon-512x512.png (512x512)"

$img.Dispose()
Write-Host "`nDone! All icons created successfully."
