# Upotreba:  .\postavi-domen.ps1 -Domen https://www.tvojdomen.rs
param([Parameter(Mandatory=$true)][string]$Domen)
$Domen=$Domen.TrimEnd('/')
if($Domen -notmatch '^https://[^/\s]+\.[^/\s]+$'){ Write-Error 'Domen mora biti u obliku https://www.primer.rs'; exit 1 }
$dir=Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8=New-Object Text.UTF8Encoding $false
$h=Join-Path $dir 'index.html'; $t=[IO.File]::ReadAllText($h)
$t=$t.Replace('<!-- DOMEN-BLOK-POCETAK','').Replace('DOMEN-BLOK-KRAJ -->','').Replace('__DOMEN__',$Domen)
[IO.File]::WriteAllText($h,$t,$utf8)
$r=Join-Path $dir 'robots.txt'; [IO.File]::WriteAllText($r,([IO.File]::ReadAllText($r).Replace('# Sitemap:','Sitemap:').Replace('__DOMEN__',$Domen)),$utf8)
$s=Join-Path $dir 'sitemap.xml'; [IO.File]::WriteAllText($s,([IO.File]::ReadAllText($s).Replace('__DOMEN__',$Domen)),$utf8)
Write-Host "Gotovo. Domen postavljen: $Domen"