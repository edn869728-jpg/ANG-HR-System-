# ANG HR BETA-v0.2 發布準備工作紀錄

`BETA-v0.1` 已固定在 `release-artifacts/ANG-HR-BETA-v0.1/`，後續開發不得覆蓋該目錄、ZIP 或 SHA-256。

## 發布準備定位

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
