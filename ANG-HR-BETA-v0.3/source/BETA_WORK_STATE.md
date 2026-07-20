# ANG HR Beta 工作狀態（避免重複執行）

更新時間：2026-07-18（Asia/Taipei）

## BETA-v0.1 已固定，不覆蓋

- v0.1 的 6 組 A／B 臨時帳號、build、smoke、請假回歸、排班回歸、deploy/source ZIP 與 SHA-256 已完成。
- 固定位置：`release-artifacts/ANG-HR-BETA-v0.1/`。
- v0.1 的 site、source、ZIP、SHA-256 與既有測試回報保持原樣；不得拿任何後續版本成品覆蓋。
- 不重跑 v0.1 六帳號登入、完整請假流程或完整排班流程，除非收到明確的 v0.1 問題回報。

## BETA-v0.2 新增範圍

- 工作原始碼與發布版本：`BETA-v0.2`。
- BETA-020：把無法辨識方案的 A／B 帳號改成 7 組「一帳號一方案」。
- 企業 3 種：Business Basic、Business Pro、Business Premium。
- 個人 2 種：Personal Solo、Personal Performance。
- 免費 2 種：Personal Lite、Business Lite。
- 各帳號顯示自己的方案名稱、價格、公司／工作區額度、人員額度、包含功能、未包含功能與可用導覽。
- Personal Lite 進精簡個人端；Business Lite 進精簡管理端，兩者不再共用相同入口結果。
- Business Basic／Business Lite 只保留總覽、人員、排班；Basic 無設定，Business Lite 無公告。
- Personal Solo／Performance 均無設定入口。
- Premium 的進階報表／自訂角色／安全稽核與 Performance 的 KPI／回饋／分析標為方案包含但 Beta 尚未串接。

## v0.2 已完成的新定向工作

- 已逐一登入 7 組方案帳號，驗證帳號、Email、密碼／驗證碼與方案對應。
- 已比較 3 種 Business、2 種 Personal、2 種 Free 的導覽、額度與鎖定提示。
- 已驗證 session 採 fail-closed，登出／切換後不沿用前一帳號方案。
- 已執行一次 v0.2 build 與 smoke，均通過。
- 已建立新的 `release-artifacts/ANG-HR-BETA-v0.2/`、deploy/source ZIP、SHA-256 與獨立測試網址。

## v0.2 發布結果

- 固定網址：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.2/>。
- Git commit：`d67fc0b`；版本標籤：`ANG-HR-BETA-v0.2`。
- 公開頁面已驗證顯示 `BETA-v0.2`，瀏覽器主控台錯誤為 0。
- v0.1／v0.2 artifact 均維持原樣；後續版本不得覆蓋 v0.2 固定版本。

## BETA-v0.3 凍結範圍

- 工作原始碼已凍結為 `BETA-v0.3`，套件版本 `0.3.0`；線上 `BETA-v0.1`／`BETA-v0.2` 及其 ZIP、SHA-256 維持凍結。
- 已新增並修復 BETA-021：Personal Lite 首頁不得曝光薪資數字；手機實際登入後已確認薪資金額與薪資導覽均不顯示，改為方案未包含提示。
- 已新增並修復 BETA-022：Business Basic／Lite 不得繞過設定修改公司品牌；原始碼已改唯讀並加 mutation guard，Business Lite 實際登入回歸通過。
- 已新增並修復 BETA-023：Storage 被封鎖時不可白畫面；原始碼已加入安全讀寫／刪除，並以載入前強制拋出 `SecurityError` 的瀏覽器測試頁完成開啟、登入、登出與重新整理回歸。
- 朋友測試說明補充：點選企業／個人方案卡會自動帶入帳號、Email 與臨時密碼三欄；免費方案則使用 Email 驗證碼流程。
- 發布檢查改用 `npm run test:release`，強制先 build 再 smoke；smoke 新增子路徑、MIME 與 HTML fallback 檢查。
- `npm run test:release` 已通過：build、7 組方案帳號斷言、GitHub Pages 類子路徑、相對資源與 MIME 檢查均正常。
- BETA-013／014／015／017／018 已使用現行方案帳號完成回歸：請假送出與核准同步、排班草稿不可見、發布後可見、跨週不互相污染、重新整理保留身分、空日期不建立案件且連續送出只建立一筆。
- BETA-024 已完成：上滑三箭頭與「展開卡片」只保留為背景 absolute 疊加層；收合卡片內不再重複顯示文字，介紹面板移除重複的「登入系統／查看方案」按鈕並縮短為內容所需高度。
- BETA-v0.3 的目前 P1 修正與核心回歸已完成，使用獨立版本路徑，不覆蓋 v0.1／v0.2。

## BETA-v0.3 發布定位（待手動推送）

- 預定網址（尚未確認上線）：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.3/>。
- 本機發布 commit：`2ac3870f5e84840fd5c0c81ff01b3ed524796cec`；版本標籤：`ANG-HR-BETA-v0.3`（本機已建立，尚未推送）。
- 發布產物使用獨立的 `release-artifacts/ANG-HR-BETA-v0.3/`、deploy/source ZIP 與 SHA-256；不得改寫 v0.1／v0.2 目錄。
- 遠端 push 尚未完成；手動推送後須確認遠端 `main` 與 tag，再確認公開頁面顯示 `BETA-v0.3`。

## DEVELOPMENT-v0.4 後續工作線

- BETA-008：背景圖片壓縮仍未排定。
- BETA-009：意見與聯絡仍待正式接收端。
- BETA-019：部分次要控制仍未補足 44px 手機觸控尺寸。
- 正式 Auth、API、公司租戶隔離、跨裝置同步、薪資引擎、NFC／QR／定位及後端排程仍未整合，不得標示為已完成。
