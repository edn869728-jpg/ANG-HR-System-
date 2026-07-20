# ANG HR 發布與持續開發工作紀錄

`BETA-v0.1` 與 `BETA-v0.2` 已分別固定在 `release-artifacts/ANG-HR-BETA-v0.1/`、`release-artifacts/ANG-HR-BETA-v0.2/`，後續開發不得覆蓋其目錄、ZIP 或 SHA-256。

## BETA-v0.2 發布版本定位

- 原始碼版本：`BETA-v0.2`
- 套件版本：`0.2.0`
- 發布目標：`BETA-v0.2`
- 本次是 BETA-020 方案辨識修正，不重做 v0.1 已完成的所有一般回歸。

## 已完成於原始碼

- 建立 7 個 `PLAN_PROFILES`，各自包含方案名稱、價格、額度、包含功能、鎖定功能與可用頁面。
- 企業：Business Basic／Pro／Premium 各一組臨時帳號。
- 個人：Personal Solo／Performance 各一組臨時帳號。
- 免費：Personal Lite／Business Lite 各一組驗證碼帳號。
- 登入卡片以方案名稱顯示，不再使用無法辨識的管理員 A／B、免費 A／B。
- 登入後系統列、身分選單、方案範圍卡、首頁資訊與底部導覽依目前 `planKey` 呈現。
- Personal Lite 使用精簡個人端；Business Lite 使用精簡小團隊管理端。
- Business Basic 與 Business Lite 只保留總覽、人員、排班；Basic 無設定，Business Lite 無公告。
- Personal Solo 與 Performance 均不提供設定入口。
- Business Premium 的進階報表／自訂角色／安全稽核，以及 Personal Performance 的目標 KPI／績效回饋／績效分析，已明示為方案包含但 Beta 尚未串接。

## v0.2 已完成發布工作

- smoke 已加入 7 帳號／7 planKey、角色對應、build bundle 與 fail-closed session 斷言；build、smoke 均通過。
- 已以 390×852 手機視窗逐一驗證 7 組帳號的方案名稱、額度、可用導覽及尚未串接提示。
- 已建立 `release-artifacts/ANG-HR-BETA-v0.2/`、deploy/source ZIP 與 SHA-256。
- 已推送 commit `d67fc0b` 與 tag `ANG-HR-BETA-v0.2`，公開網址為 <https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.2/>。

## 其他既有待辦

- BETA-008：壓縮日／夜背景，改善慢網路首次載入。
- BETA-009：串接意見回報的正式接收端點。
- BETA-019：將月曆箭頭、日夜切換及審核按鈕補足手機觸控尺寸。
- 正式 Auth／API／租戶隔離另案建置，不用前端假資料冒充完成。

## BETA-v0.3 自主測試與修復

- 版本：`BETA-v0.3`／套件 `0.3.0`。
- 修復 Personal Lite 首頁薪資資訊外露，未含薪資的方案只顯示不可點擊的升級提示。
- 修復 Business Basic／Lite 可從身分選單修改公司品牌；無設定權限時改為唯讀，更新函式亦拒絕 mutation。
- 對 localStorage／sessionStorage 加入安全包裝，儲存不可用時仍可開啟入口並維持當次頁面操作。
- 新增 `npm run test:release`，並強化 GitHub Pages 類子路徑、相對資源、MIME 與 HTML fallback 驗證。
- 線上 `BETA-v0.1`／`BETA-v0.2` 只用來重現與收集原版本問題，不直接覆蓋；v0.3 使用新的固定子路徑與版本標籤。

## BETA-v0.3 已完成回歸

- `npm run test:release` 通過；產物可在 GitHub Pages 類子路徑載入，JS／CSS／PNG MIME 正確且不會被 HTML fallback 冒充成功。
- Personal Lite：首頁不再顯示薪資數字、薪資卡或薪資導覽，只顯示「方案未包含」。
- Business Lite：身分選單的公司品牌資料為唯讀，無設定入口且不能繞過權限修改共享品牌。
- Business Pro 與 Personal Solo：實際登入後重新整理仍保留正確身分與方案。
- 排班：儲存草稿時員工端仍見舊班表；發布後才更新；只發布下週不會污染本週，測試結束後已還原班別。
- 請假：員工送出後只建立一筆案件，送出期間鎖定按鈕；管理端核准後員工端顯示「已核准」；空日期不會建立新案件。
- BETA-023 已用載入前將 localStorage／sessionStorage getter 強制改為拋出 `SecurityError` 的臨時瀏覽器測試頁完成回歸：入口正常、Business Lite 可登入、可登出，重新整理回到入口且無白畫面；測試頁未納入發布產物。
- BETA-024：背景上滑提示依目前卡片顯示且維持 absolute，不進入卡片排版；所有收合卡片隱藏重複的展開文字；展開介紹移除兩顆重複快速按鈕，完成動畫後高度由 410px 自適應內容，手機實測內容無溢出。

## BETA-v0.3 發布定位（待手動推送）

- 預定網址（尚未確認上線）：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.3/>。
- 本機發布 commit：`2ac3870f5e84840fd5c0c81ff01b3ed524796cec`。
- Git tag：`ANG-HR-BETA-v0.3`（本機已建立，尚未推送）。
- 發布目錄與 ZIP 使用 `release-artifacts/ANG-HR-BETA-v0.3/` 命名；v0.1／v0.2 產物與線上路徑保持不變。
- 手動推送後須確認遠端 commit／tag、`beta/v0.3/` 顯示 `BETA-v0.3`，並完成公開載入與主控台檢查。

## DEVELOPMENT-v0.4 後續工作

- BETA-008、BETA-009、BETA-019 及正式後端整合維持未修／延後處理，不因 v0.3 發布而標示完成。


## ONLINE-v0.6.0 整理

- 將前端顯示版本與 npm 套件版本更新為 v0.6.0／0.6.0。
- 將 GAS v0.6.0 擴充納入乾淨系統包。
- 建立標準 Vite 建置與可直接雙擊的單一 HTML 版本。
- 單一 HTML 內嵌 CSS、JavaScript、日夜背景與開場影片，不依賴 assets 資料夾。
