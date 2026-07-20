# ANG HR BETA-v0.3 朋友測試說明

## 這一版可以測什麼

這是 **手機優先的前端 Beta／流程 Demo**。可以測試頁面、導航、排班、請假、審核、人員、公告、設定、手動打卡與薪資示範流程；不是正式上線版。

> 請只輸入虛構測試資料。不要輸入真實身分證、薪資、醫療文件、公司機密或任何個資。

## 測試網址

- 預定線上測試網址（尚未確認上線）：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.3/>
- 若要自行架站，可改用交付的 `ANG-HR-BETA-v0.3-deploy.zip`。
- 收到手動發布完成通知前，請勿使用預定網址開始正式朋友測試。
- 畫面必須顯示 `BETA-v0.3`；若顯示 `BETA-v0.1`、`BETA-v0.2` 或其他版本，請停止測試並回報網址與截圖。
- `BETA-v0.1` 與 `BETA-v0.2` 是固定舊版，仍供舊回報對版，不會被 v0.3 覆蓋。

## 臨時測試帳號

以下全部都是固定假資料，只能用於 `BETA-v0.3`。本版入口接受 7 組「一帳號一方案」臨時資料。企業與個人方案共用臨時密碼 `AngBeta#2026`，入口會核對「帳號＋Email＋臨時密碼」；點選方案卡會自動帶入這三欄，也可以手動輸入。免費方案使用固定驗證碼 `123456`。

### 企業方案（3 組）

| 測試方案 | 入口 | 管理帳號 | Email | 臨時密碼 |
|---|---|---|---|---|
| Business Basic | 企業用戶 | `ANG-BETA-BASIC` | `basic@ang-beta.test` | `AngBeta#2026` |
| Business Pro | 企業用戶 | `ANG-BETA-PRO` | `pro@ang-beta.test` | `AngBeta#2026` |
| Business Premium | 企業用戶 | `ANG-BETA-PREMIUM` | `premium@ang-beta.test` | `AngBeta#2026` |

### 個人方案（2 組）

| 測試方案 | 入口 | 登入帳號 | 對應人員編號 | Email | 臨時密碼 |
|---|---|---|---|---|---|
| Personal Solo | 個人用戶 | `ANG-SOLO-01` | `ANG0601` | `solo@ang-beta.test` | `AngBeta#2026` |
| Personal Performance | 個人用戶 | `ANG-PERFORMANCE-01` | `ANG0602` | `performance@ang-beta.test` | `AngBeta#2026` |

### 免費方案（2 組）

| 測試方案 | 入口 | 測試識別碼 | Email | 固定驗證碼 |
|---|---|---|---|---|
| Personal Lite | 免費用戶 | `FREE-PERSONAL-LITE` | `personal-lite@ang-beta.test` | `123456` |
| Business Lite | 免費用戶 | `FREE-BUSINESS-LITE` | `business-lite@ang-beta.test` | `123456` |

- 免費流程不會真的寄信，畫面取得測試碼後直接輸入 `123456`。
- Google 與 LINE 登入尚未串接，Beta 內已停用。
- 目前入口不是正式帳密系統，沒有帳號鎖定、停權、方案到期、登入嘗試限制或 Token 驗證；它只負責把測試者帶到指定角色工作區。
- 前端工作區依方案分流：三種 Business 與 Free Business Lite 進入各自可用功能不同的管理端；Personal Solo、Personal Performance 與 Free Personal Lite 進入個人／員工端。切換帳號時一律返回入口重新登入；這不等同正式伺服器權限隔離。
- 7 組方案帳號仍共用目前瀏覽器的本機 Demo 資料，不代表已完成獨立帳戶、正式訂閱、公司租戶或跨裝置同步。

## 方案差異檢查

| 方案 | Beta 目前可用範圍 | 未包含／尚未串接 |
|---|---|---|
| Business Basic | 總覽、人員、排班 | 不含設定、請假審核、公告互動、薪資管理、多分店 |
| Business Pro | 最多 3 店、審核、排班、設定、公告、人員、薪資 | 跨店自訂角色、進階分析 |
| Business Premium | 最多 10 店；總覽、審核、排班、設定、公告、人員、薪資 | 方案包含進階報表、自訂角色、安全稽核，但 Beta 尚未串接 |
| Personal Solo | 個人首頁、排班／請假、打卡、薪資、上傳 | 不含設定入口、目標 KPI、績效評核 |
| Personal Performance | Solo 目前可用導覽，不含設定入口 | 方案包含目標 KPI、績效回饋、績效分析，但 Beta 尚未串接 |
| Personal Lite | 個人首頁、基礎工時、手動打卡 | 薪資明細、資料上傳、績效功能 |
| Business Lite | 總覽、人員、排班 | 不含公告、設定、請假審核、薪資管理、多分店 |


## 建議測試流程

1. 逐一使用 7 組臨時帳號，確認方案名稱、價格、額度、包含功能與底部導覽符合上方矩陣。
2. 比較 Business Basic／Pro／Premium，確認 Basic 只有總覽／人員／排班；Pro 才出現審核／設定／公告／薪資；Premium 顯示進階項目「方案包含但 Beta 尚未串接」。
3. 比較 Personal Solo／Performance，確認兩者都沒有設定入口，Performance 的 KPI／回饋／分析標為「方案包含但 Beta 尚未串接」；比較兩種 Lite，確認 Personal Lite 進個人端、Business Lite 進只有總覽／人員／排班的精簡管理端。
4. 以個人帳號開啟身分選單，確認只能返回入口切換臨時帳號，不能直接進完整企業管理端。
5. 使用 Business Pro 或 Premium 登入，新增一位虛構員工並查看人員列表。
6. 建立排班，只按「儲存草稿」；個人／員工端不應看到草稿。
7. 管理員發布班表，再切換個人端查看本週／下週班表。
8. 以 Personal Solo 或 Performance 送出一筆請假申請。
9. 返回入口，以 Business Pro 或 Premium 登入，在審核中心核准或退回。
10. 再回相同個人帳號，確認請假狀態同步。
11. 測試「手動測試打卡」，確認文字明確標示未驗證 NFC／定位。
12. 重新整理頁面，確認同一分頁仍保持目前測試身分與方案。
13. 登出後確認回到入口。
14. 測試日光／暗夜模式、上下滑動、卡片展開收合與左右滑動。

## 資料限制

- 所有資料只保存在目前瀏覽器，不會同步到朋友的其他手機。
- 測試帳號、Email、密碼與驗證碼皆為公開的固定假資料；不可拿來保護任何真實資料。
- 不可輸入真實姓名、電話、地址、身分證號、銀行帳號、薪資、醫療資訊、公司機密或正式登入密碼。
- 清除瀏覽器網站資料會刪除全部測試紀錄。
- 檔案上傳只保存檔名與分類，不會傳送實體檔案。
- 薪資、工時、定位與部分公告資料含示範值。

## 回報格式

請提供：

1. 版本：`BETA-v0.3`
2. 裝置與瀏覽器
3. 使用方案：Business Basic／Pro／Premium、Personal Solo／Performance、Personal Lite／Business Lite
4. 操作步驟
5. 預期結果
6. 實際結果
7. 截圖或錄影
8. 是否每次都會發生

收到回報後會加入 `BETA_ISSUE_TRACKER.md`，保留發現來源並依 P0～P3 分級。
