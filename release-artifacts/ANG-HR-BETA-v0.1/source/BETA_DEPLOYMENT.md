# ANG HR BETA-v0.1 部署說明

## 部署包

使用 `ANG-HR-BETA-v0.1-deploy.zip`。解壓後根目錄會直接包含：

```text
index.html
assets/
ang-entry-bg-day.png
ang-entry-bg-night.png
```

## 靜態網站部署

可部署至 Cloudflare Pages、Netlify、Vercel 靜態站或任何網域根目錄：

1. 新建一個獨立的 `ANG-HR-BETA-v0.1` 測試站。
2. 將 ZIP 解壓後的內容上傳到網站根目錄。
3. 不需要建置指令；發布目錄就是解壓後根目錄。
4. 確認 `index.html`、`assets/` 與兩張背景圖片皆回傳 200。
5. 開啟頁面，確認顯示 `BETA-v0.1`。

目前資源使用網域根路徑，因此不要直接放在 GitHub Pages 的專案子路徑；如需 `username.github.io/ANGHR/`，應先設定 Vite `base` 再重新建置。

## 本機／同 Wi-Fi 固定測試站

```powershell
python -m http.server 8125 --bind 0.0.0.0 --directory .\release-artifacts\ANG-HR-BETA-v0.1\site
```

測試網址：`http://192.168.0.242:8125/`

`BETA-v0.1` 使用獨立凍結目錄與連接埠，不得以後續開發版覆蓋。`DEVELOPMENT-v0.2` 使用另一個目錄／網址。

## 快取

- 專案沒有 Service Worker。
- JS／CSS 使用內容雜湊檔名。
- 若入口仍顯示舊版本，請重新整理或清除該站點快取。
