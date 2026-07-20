# ANG HR BETA-v0.3 Release Manifest

- 應用版本：`BETA-v0.3`
- 目前工作原始碼：`BETA-v0.3`
- 套件版本：`0.3.0`
- 版本標籤名稱：`ANG-HR-BETA-v0.3`
- 發布狀態：**已凍結／待手動推送；尚未確認線上發布**
- 發布類型：前端流程與方案差異 Demo／朋友測試版
- 資料層：瀏覽器 `localStorage`（Demo 資料）＋分頁 `sessionStorage`（目前臨時身分），無正式 API
- 預定線上測試網址（尚未確認上線）：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.3/>
- 本機發布 commit：`2ac3870f5e84840fd5c0c81ff01b3ed524796cec`
- Git tag：`ANG-HR-BETA-v0.3`（本機已建立，尚未推送）

## 版本隔離

- `BETA-v0.1` 與 `BETA-v0.2` 已分別固定保存在 `release-artifacts/ANG-HR-BETA-v0.1/`、`release-artifacts/ANG-HR-BETA-v0.2/`，其 site、source、ZIP 與 SHA-256 不得覆蓋。
- v0.1／v0.2 測試回報仍歸在原版本；v0.3 回報必須明確標示 `BETA-v0.3`。
- v0.3 使用獨立的 `release-artifacts/ANG-HR-BETA-v0.3/`、ZIP 名稱、SHA-256 與固定子路徑 `beta/v0.3/`，不會覆蓋舊版。

## BETA-v0.3 臨時方案身分

| 方案 | 工作區 | 帳號／識別碼 | Email | 臨時密碼／驗證碼 |
|---|---|---|---|---|
| Business Basic | 管理端（基礎） | `ANG-BETA-BASIC` | `basic@ang-beta.test` | `AngBeta#2026` |
| Business Pro | 管理端（完整日常營運） | `ANG-BETA-PRO` | `pro@ang-beta.test` | `AngBeta#2026` |
| Business Premium | 管理端（完整企業資格） | `ANG-BETA-PREMIUM` | `premium@ang-beta.test` | `AngBeta#2026` |
| Personal Solo | 個人／員工端 | `ANG-SOLO-01`（人員 `ANG0601`） | `solo@ang-beta.test` | `AngBeta#2026` |
| Personal Performance | 個人／員工端 | `ANG-PERFORMANCE-01`（人員 `ANG0602`） | `performance@ang-beta.test` | `AngBeta#2026` |
| Personal Lite | 免費個人端 | `FREE-PERSONAL-LITE` | `personal-lite@ang-beta.test` | 驗證碼 `123456` |
| Business Lite | 免費精簡管理端 | `FREE-BUSINESS-LITE` | `business-lite@ang-beta.test` | 驗證碼 `123456` |

- 以上全部為公開固定假資料，只供 Beta 方案、角色與流程測試。
- v0.3 入口只接受上列 7 組固定臨時資料；沒有正式帳號鎖定、停權、方案到期、訂閱查核或 Token 驗證。
- 方案名稱、額度、可用導覽及鎖定提示由前端 Demo 分流；這不等同伺服器端方案授權或權限隔離。
- Business Basic 與 Business Lite 的 Beta 可用頁面都只有總覽、人員、排班；Basic 無設定，Business Lite 另不提供公告。
- Personal Solo／Performance 均不提供設定入口。
- Business Premium 的進階報表、自訂角色、安全稽核，以及 Personal Performance 的目標 KPI、績效回饋、績效分析，皆為方案包含但 Beta 尚未串接。
- 7 組方案帳號仍共用瀏覽器本機 Demo 資料，尚未提供獨立帳戶、正式公司租戶與跨裝置同步。
- 嚴禁輸入真實個資、真實薪資、醫療資訊、公司機密、付款資料或任何正式密碼。

## v0.3 固定交付物

- `ANG-HR-BETA-v0.3-deploy.zip`：可部署靜態網站。
- `ANG-HR-BETA-v0.3-source.zip`：固定原始碼快照，不含 `node_modules`、`.git`、`dist` 與建置快取。
- `SHA256SUMS.txt`：v0.3 兩個 ZIP 的 SHA-256 校驗值。
- `RELEASE_INFO.txt`：v0.3 release test、7 方案定向回歸與凍結資訊。

凍結前的 `npm run test:release`、390×852 手機視窗 7 方案定向回歸、請假與排班跨角色流程、重新整理、重複送出、Storage 封鎖及 GitHub Pages 類子路徑檢查均已通過；公開網址實際載入與主控台檢查須在手動推送後完成。
