# B10.1 - Send exactly one authorized Resend test message from this computer.
# API key is read without echo and only kept in this PowerShell process env
# while the child Node process runs. Never paste it in ChatGPT.
$ErrorActionPreference = "Stop"
$secret = Read-Host "Incolla la chiave Resend Sending Access di rmpworks.com (non apparira a schermo)" -AsSecureString
$ptr = [IntPtr]::Zero
try {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
  $env:RESEND_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $env:RMP_TEST_SEND_APPROVED = "YES"
  & node (Join-Path $PSScriptRoot "send-resend-b10-smoke-once.mjs")
  $result = $LASTEXITCODE
} finally {
  Remove-Item Env:\RESEND_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:\RMP_TEST_SEND_APPROVED -ErrorAction SilentlyContinue
  if ($ptr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
  $secret = $null
}
exit $result
