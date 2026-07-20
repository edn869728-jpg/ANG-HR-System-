# ANG HR BETA-v0.2 Release Manifest

- 目標應用版本：`BETA-v0.2`
- 目前工作原始碼：`BETA-v0.2`
- 目標套件版本：`0.2.0`
- 目標版本標籤名稱：`ANG-HR-BETA-v0.2`
- 發布狀態：**已凍結並發布線上朋友測試版**
- 發布類型：前端流程與方案差異 Demo／朋友測試版
- 資料層：瀏覽器 `localStorage`（Demo 資料）＋分頁 `sessionStorage`（目前臨時身分），無正式 API
- 線上測試網址：<https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.2/>
- Git commit：`d67fc0b`
- Git tag：`ANG-HR-BETA-v0.2`

## 版本隔離

- `BETA-v0.1` 已固定保存在 `release-artifacts/ANG-HR-BETA-v0.1/`，其 site、source、ZIP 與 SHA-256 不得覆蓋。
- v0.1 測試回報仍歸在 v0.1；v0.2 新增「一帳號一方案」辨識與方案限定導覽，回報必須標明 v0.2。
- v0.2 使用獨立的 `release-artifacts/ANG-HR-BETA-v0.2/`、ZIP 名稱、SHA-256 與固定子路徑，不會覆蓋 v0.1。

## BETA-v0.2 臨時方案身分

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
- v0.2 入口只接受上列 7 組固定臨時資料；沒有正式帳號鎖定、停權、方案到期、訂閱查核或 Token 驗證。
- 方案名稱、額度、可用導覽及鎖定提示由前端 Demo 分流；這不等同伺服器端方案授權或權限隔離。
- Business Basic 與 Business Lite 的 Beta 可用頁面都只有總覽、人員、排班；Basic 無設定，Business Lite 另不提供公告。
- Personal Solo／Performance 均不提供設定入口。
- Business Premium 的進階報表、自訂角色、安全稽核，以及 Personal Performance 的目標 KPI、績效回饋、績效分析，皆為方案包含但 Beta 尚未串接。
- 7 組方案帳號仍共用瀏覽器本機 Demo 資料，尚未提供獨立帳戶、正式公司租戶與跨裝置同步。
- 嚴禁輸入真實個資、真實薪資、醫療資訊、公司機密、付款資料或任何正式密碼。

## v0.2 已完成交付物

- `ANG-HR-BETA-v0.2-deploy.zip`：可部署靜態網站。
- `ANG-HR-BETA-v0.2-source.zip`：固定原始碼快照，不含 `node_modules`、`.git`、`dist` 與建置快取。
- `SHA256SUMS.txt`：v0.2 兩個 ZIP 的 SHA-256 校驗值。
- `RELEASE_INFO.txt`：v0.2 build、smoke、7 方案定向回歸與凍結資訊。

`npm run build`、`npm run test:smoke`、390×852 手機視窗的 7 方案定向回歸及線上實際載入均已通過；公開頁面可讀到 `BETA-v0.2`，驗證時瀏覽器主控台錯誤為 0。
