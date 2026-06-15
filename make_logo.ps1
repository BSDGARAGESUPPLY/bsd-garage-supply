Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Dvirn\Downloads\Logo.png.png"
$dst = "C:\Users\Dvirn\Desktop\website foldfer\client\public\logo.png"

$bmp = New-Object System.Drawing.Bitmap($src)
$w = $bmp.Width
$h = $bmp.Height
Write-Host "Image: ${w}x${h}"

# Convert to 32bpp ARGB working copy
$work = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($work)
$g.DrawImage($bmp, 0, 0, $w, $h)
$g.Dispose()
$bmp.Dispose()

# Lock bits
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$data = $work.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = $stride * $h
$buf = New-Object byte[] $bytes
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $bytes)

# Flood fill from borders: mark near-white connected pixels transparent
# BGRA layout: index = y*stride + x*4  => B,G,R,A
$threshold = 232
$visited = New-Object 'bool[]' ($w * $h)
$queue = New-Object System.Collections.Generic.Queue[int]

# seed border pixels
for ($x = 0; $x -lt $w; $x++) {
  foreach ($y in @(0, ($h - 1))) {
    $queue.Enqueue($y * $w + $x)
  }
}
for ($y = 0; $y -lt $h; $y++) {
  foreach ($x in @(0, ($w - 1))) {
    $queue.Enqueue($y * $w + $x)
  }
}

$cleared = 0
while ($queue.Count -gt 0) {
  $p = $queue.Dequeue()
  if ($visited[$p]) { continue }
  $visited[$p] = $true
  $px = $p % $w
  $py = [math]::Floor($p / $w)
  $bi = $py * $stride + $px * 4
  $b = $buf[$bi]; $gg = $buf[$bi + 1]; $r = $buf[$bi + 2]
  if ($r -ge $threshold -and $gg -ge $threshold -and $b -ge $threshold) {
    # make transparent
    $buf[$bi + 3] = 0
    $cleared++
    # enqueue neighbors
    if ($px -gt 0)        { $queue.Enqueue($p - 1) }
    if ($px -lt ($w - 1)) { $queue.Enqueue($p + 1) }
    if ($py -gt 0)        { $queue.Enqueue($p - $w) }
    if ($py -lt ($h - 1)) { $queue.Enqueue($p + $w) }
  }
}

Write-Host "Cleared $cleared background pixels"

[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $data.Scan0, $bytes)
$work.UnlockBits($data)

# Crop to non-transparent bounds to trim whitespace
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $a = $buf[$y * $stride + $x * 4 + 3]
    if ($a -gt 10) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$pad = 12
$minX = [math]::Max(0, $minX - $pad); $minY = [math]::Max(0, $minY - $pad)
$maxX = [math]::Min($w - 1, $maxX + $pad); $maxY = [math]::Min($h - 1, $maxY + $pad)
$cw = $maxX - $minX + 1; $ch = $maxY - $minY + 1
Write-Host "Crop box: ${cw}x${ch} at ($minX,$minY)"

$cropped = New-Object System.Drawing.Bitmap($cw, $ch, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$cg = [System.Drawing.Graphics]::FromImage($cropped)
$cropRect = New-Object System.Drawing.Rectangle($minX, $minY, $cw, $ch)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cw, $ch)
$cg.DrawImage($work, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$cg.Dispose()

$cropped.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
$work.Dispose()

Write-Host "Saved transparent logo to $dst"
Write-Host "Size: $([math]::Round((Get-Item $dst).Length/1KB)) KB"