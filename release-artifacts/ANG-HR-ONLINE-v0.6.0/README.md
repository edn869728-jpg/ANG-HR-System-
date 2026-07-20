# ANG HR ONLINE v0.6.0 Release Manifest

- 顯示版本：`v0.6.0`
- npm 套件版本：`0.6.0`
- 建置日期：`2026-07-21`
- 標準建置：`dist/`
- 單一 HTML：`standalone/ANG-HR-v0.6.0-單一HTML.html`
- GAS 擴充：`GAS/V060_Backend.js`
- GAS 部署說明：`GAS/V060_升級說明.txt`

## 單一 HTML 內容

單檔版已內嵌編譯後 CSS、JavaScript、兩張日夜背景及兩支開場影片，因此可直接雙擊開啟，不需要 `assets/` 或本機伺服器。

## 已執行檢查

- `npm run test:release`
- Vite production build
- 7 組固定測試帳號矩陣
- 單一登入與角色防繞過檢查
- GitHub Pages 子路徑與 MIME 檢查
- 兩張背景與兩支 MP4 建置一致性
- 單檔 HTML 本機資源引用清除
- 內嵌 JavaScript `node --check` 語法檢查

## 部署提醒

前端單檔版與 GAS 後端是不同部署項目。`V060_Backend.js` 要在 Apps Script 重新部署 Web App 新版本後才會生效。
