# ANG HR BETA-v0.1 Release Manifest

- 應用版本：`BETA-v0.1`
- 套件版本：`0.1.0`
- 版本標籤名稱：`ANG-HR-BETA-v0.1`
- Git commit／annotated tag：**待補**（目前執行環境拒絕 `.git` 寫入；本次以固定目錄、原始碼 ZIP 與 SHA-256 作為不可混淆快照）
- 發布類型：前端流程 Demo／朋友測試版
- 資料層：瀏覽器 `localStorage`（Demo 資料）＋分頁 `sessionStorage`（目前臨時身分），無正式 API
- 固定站點：`http://192.168.0.242:8125/`（同一 Wi-Fi）
- 開發站點：`http://192.168.0.242:8124/`（會持續變動，不供朋友對版）

## 臨時測試身分

| 角色 | 帳號／識別碼 | Email | 臨時密碼／驗證碼 |
|---|---|---|---|
| 企業管理員 A | `ANG-BETA-ADM01` | `admin01@ang-beta.test` | `AngBeta#2026` |
| 企業管理員 B | `ANG-BETA-ADM02` | `admin02@ang-beta.test` | `AngBeta#2026` |
| 員工／個人 A | `ANG0601` | `employee01@ang-beta.test` | `AngBeta#2026` |
| 員工／個人 B | `ANG0602` | `employee02@ang-beta.test` | `AngBeta#2026` |
| 免費用戶 A | `FREE-BETA-01` | `free01@ang-beta.test` | 驗證碼 `123456` |
| 免費用戶 B | `FREE-BETA-02` | `free02@ang-beta.test` | 驗證碼 `123456` |

- 以上全部為公開固定假資料，只供 Beta 角色與流程測試。
- 此版入口只接受上列 6 組固定臨時資料，沒有正式帳號鎖定、停權、方案到期或 Token 驗證。前端工作區依角色分流，員工／個人／免費用戶不可由介面直接進入管理端；這不等同伺服器端權限隔離。
- 同角色兩組帳號共用瀏覽器本機 Demo 工作區，尚未提供獨立帳戶與跨裝置同步。
- 嚴禁輸入真實個資、真實薪資、醫療資訊、公司機密、付款資料或任何正式密碼。

## 交付物

- `ANG-HR-BETA-v0.1-deploy.zip`：可部署靜態網站。
- `ANG-HR-BETA-v0.1-source.zip`：固定原始碼快照，不含 `node_modules`、`.git`、`dist` 與建置快取。
- `SHA256SUMS.txt`：兩個 ZIP 的 SHA-256 校驗值。

實際快照狀態、測試結果與 SHA-256 會寫入凍結版 artifact 目錄的 `RELEASE_INFO.txt`；Git commit／tag 未完成時不得宣稱已完成。
