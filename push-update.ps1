# WuJu59Web 一键更新：提交并推送到 GitHub（网站会自动更新）
$ErrorActionPreference = 'Stop'

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host ''
    Write-Host '还没有配置 GitHub 远程仓库，先做一次：'
    Write-Host '  1) 打开你的 GitHub 仓库页面，点绿色 Code 按钮，复制 HTTPS 地址'
    Write-Host '     （形如 https://github.com/你的用户名/WuJu59Web.git）'
    Write-Host "  2) 在 WuJu59Web 文件夹里运行："
    Write-Host '     git remote add origin <你的仓库地址>'
    Write-Host '  3) 再运行一次本脚本'
    Write-Host ''
    exit 1
}

git add -A
git commit -m "update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

Write-Host ''
Write-Host '已推送 ✓  GitHub Pages 会在 1-3 分钟内自动更新'
