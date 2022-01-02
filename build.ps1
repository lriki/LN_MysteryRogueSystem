Copy-Item plugin-package.json package.json -Force

if (-not (Test-Path "node_modules")) {
    npm install
}

npm run build
