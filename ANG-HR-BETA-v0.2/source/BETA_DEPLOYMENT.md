# ANG HR BETA-v0.2 部署說明

## 已發布的固定線上測試版

- 線上網址：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.2/>
- Git commit：`d67fc0b`
- Git tag：`ANG-HR-BETA-v0.2`
- GitHub Pages 路徑：`beta/v0.2/`

此路徑固定保留給朋友回報對版；後續開發版不得直接覆蓋。

## 手動部署包

使用 `release-artifacts/ANG-HR-BETA-v0.2/ANG-HR-BETA-v0.2-deploy.zip`。解壓後根目錄會直接包含：

```text
index.html
assets/
ang-entry-bg-day.png
ang-entry-bg-night.png
```

可部署至 Cloudflare Pages、Netlify、Vercel 靜態站、GitHub Pages 子路徑或一般靜態主機：

1. 建立獨立的 `ANG-HR-BETA-v0.2` 測試站或版本子目錄。
2. 將 ZIP 解壓後的內容完整上傳。
3. 不需要建置指令；發布目錄就是解壓後根目錄。
4. 確認 `index.html`、`assets/` 與兩張背景圖片皆回傳 200。
5. 開啟頁面，確認顯示 `BETA-v0.2`。

本版以 Vite `base=./` 建置，因此可放在網域根目錄或 GitHub Pages 專案子路徑。

## 本機預覽

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory .\release-artifacts\ANG-HR-BETA-v0.2\site
```

本機網址：`http://127.0.0.1:8123/`

## 快取與資料限制

- 專案沒有 Service Worker。
- JS／CSS 使用內容雜湊檔名。
- 若入口仍顯示舊版本，請重新整理或清除該站點快取。
- 測試資料只在目前瀏覽器 `localStorage`，不是正式後端帳號或跨裝置資料。

## 舊版保留

`BETA-v0.1` 仍固定在 `release-artifacts/ANG-HR-BETA-v0.1/`；其 ZIP、SHA-256 與舊回報不得被 v0.2 覆蓋。
