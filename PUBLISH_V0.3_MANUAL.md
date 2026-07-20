# ANG HR BETA-v0.3 手動發布

目前狀態：BETA-v0.3 已建置、測試、凍結與建立本機發布提交，但執行環境的 GitHub 上傳額度限制阻止了遠端 push。

## 最短方式：使用部署 ZIP

部署檔：

`release-artifacts/ANG-HR-BETA-v0.3/ANG-HR-BETA-v0.3-deploy.zip`

1. 解壓 ZIP。
2. 在 `edn869728-jpg/ANG-99-HR-System` 的 `main` 分支建立新資料夾 `beta/v0.3/`。
3. 把 ZIP 內所有檔案放入 `beta/v0.3/`，包含 `.nojekyll`、`assets/`、`index.html`、兩張背景圖與版本資訊。
4. 不要修改或刪除 `beta/v0.2/`。
5. Commit 訊息使用 `Publish ANG HR BETA-v0.3`。
6. 建立標籤 `ANG-HR-BETA-v0.3`。

預定網址：

`https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.3/`

## Git 指令方式

在乾淨的 `main` 分支副本執行：

```powershell
New-Item -ItemType Directory -Path beta\v0.3
Expand-Archive -LiteralPath 'ANG-HR-BETA-v0.3-deploy.zip' -DestinationPath beta\v0.3
git add -- beta/v0.3
git diff --cached --name-only
git commit -m 'Publish ANG HR BETA-v0.3'
git tag -a ANG-HR-BETA-v0.3 -m 'ANG HR BETA-v0.3'
git push --atomic origin HEAD:main refs/tags/ANG-HR-BETA-v0.3
```

在 `git diff --cached --name-only` 階段，若看到 `beta/v0.3/` 以外的檔案，請停止，不要推送。

## 上線確認

- 頁面可以開啟且不是白畫面。
- 頁首或登入後版本顯示 `BETA-v0.3`。
- `beta/v0.2/` 原網址仍可開啟。
- 若仍看到舊內容，使用無痕視窗或在網址後加 `?v=20260718-v03`。
