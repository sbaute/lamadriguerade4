# Script de PowerShell para optimizar y comprimir el logo de La Madriguera
Add-Type -AssemblyName System.Drawing

$originalPath = "src/assets/logo.jpg"
$tempPath = "src/assets/logo_optimized.jpg"

if (Test-Path $originalPath) {
    Write-Host "Cargando logo original..." -ForegroundColor Cyan
    $img = [System.Drawing.Image]::FromFile($originalPath)
    
    # Redimensionar a 600x600px (suficiente para un logo redondo de 300px)
    $newWidth = 600
    $newHeight = 600
    $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($newImg)
    
    # Calidad alta de renderizado para no perder nitidez
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
    
    # Limpiar recursos del lector original
    $img.Dispose()
    $graphics.Dispose()
    
    # Configurar compresor JPEG a calidad 80% (excelente balance peso/calidad)
    $jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80)
    
    # Guardar imagen optimizada
    $newImg.Save($tempPath, $jpegEncoder, $encoderParams)
    $newImg.Dispose()
    
    # Reemplazar archivo original
    Remove-Item $originalPath -Force
    Rename-Item $tempPath -NewName "logo.jpg"
    
    $originalSize = (Get-Item "src/assets/logo.jpg").Length
    $originalSizeKB = [Math]::Round($originalSize / 1KB, 2)
    
    Write-Host "¡Logo optimizado con éxito! 🎉" -ForegroundColor Green
    Write-Host "Nuevo tamaño del archivo: $originalSizeKB KB" -ForegroundColor Yellow
} else {
    Write-Host "No se encontró el archivo src/assets/logo.jpg" -ForegroundColor Red
}
