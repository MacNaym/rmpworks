# Run in Windows PowerShell or PowerShell 7; no GitHub Actions required.
$ErrorActionPreference='Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
function Run-Checked($Label,$Command,[string[]]$Arguments) {
 Write-Host "`n== $Label ==" -ForegroundColor Cyan
 & $Command @Arguments
 if($LASTEXITCODE -ne 0){throw "$Label failed with exit code $LASTEXITCODE"}
}
Run-Checked 'Node version' 'node' @('--version')
Run-Checked 'Install dependencies' 'npm.cmd' @('ci')
Run-Checked 'ESLint' 'npm.cmd' @('run','lint')
Run-Checked 'Anti-slop scan' 'npm.cmd' @('run','design:scan')
Run-Checked 'Next static build' 'npm.cmd' @('run','build')
Run-Checked 'Tenant resolver tests' 'node' @('tools/tenant-spike/test.mjs')
if(!(Test-Path 'out')){throw "Missing static export folder: out"}
Write-Host "`nPASS: local checks complete. Static output in .\out" -ForegroundColor Green
Write-Host 'Tenant spike is NOT included in static export.'
