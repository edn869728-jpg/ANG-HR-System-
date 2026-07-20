# ANG HR Beta Changelog

## BETA-v0.2（已發布）

### 已完成於 BETA-v0.2 原始碼

- **BETA-020：方案帳號辨識。** 原本 v0.1 的 6 組帳號只標成 A／B，測試者無法知道各自代表哪個方案；v0.2 改為 7 組「一帳號一方案」臨時資料。
- 企業方案分為 Business Basic、Business Pro、Business Premium，分別使用 `ANG-BETA-BASIC`、`ANG-BETA-PRO`、`ANG-BETA-PREMIUM`。
- 個人方案分為 Personal Solo、Personal Performance，分別使用 `ANG-SOLO-01`、`ANG-PERFORMANCE-01`，並對應人員編號 `ANG0601`、`ANG0602`。
- 免費方案分為 Personal Lite、Business Lite，分別使用 `FREE-PERSONAL-LITE`、`FREE-BUSINESS-LITE`；Personal Lite 進精簡個人端，Business Lite 進精簡管理端。
- 登入後顯示目前方案、價格、公司／工作區額度、人員額度、包含功能及未包含功能。
- 底部導覽與首頁快捷操作依方案過濾：Business Basic 與 Business Lite 只保留總覽／人員／排班；Basic 不提供設定，Business Lite 不提供公告。
- Personal Solo／Performance 都不提供設定入口。
- Business Premium 的進階報表／自訂角色／安全稽核，以及 Personal Performance 的 KPI／績效回饋／績效分析，顯示為「方案包含但 Beta 尚未串接」，不以假按鈕冒充完成。

### 已完成回歸測試

- 已逐一登入 7 組帳號，核對帳號、Email、密碼／驗證碼、方案名稱、額度與工作區。
- 已比較 Business Basic／Pro／Premium、Personal Solo／Performance 及兩種 Lite 的導覽、鎖定與尚未串接提示。
- 已驗證未知或舊 session 不會再退回 Business Pro，方案與角色不一致時採 fail-closed。
- 已完成 `npm run build`、`npm run test:smoke`、390×852 手機視窗定向回歸及公開網址載入檢查。

### 發布狀態

- `BETA-v0.1` 凍結目錄與 ZIP 保留不變，v0.2 不覆蓋 v0.1。
- v0.2 已建立獨立 deploy/source ZIP 與 SHA-256，並發布至 <https://edn869728-jpg.github.io/ANG-99-HR-System/beta/v0.2/>。
- Git commit：`d67fc0b`；版本標籤：`ANG-HR-BETA-v0.2`。

## BETA-v0.1

### 已修復

- **BETA-010：** 測試登入現在必須輸入正確的固定帳號與 Email，空白與錯誤資料不能進入。
- **BETA-011：** 員工測試身分不能再直接切換至管理端。
- **BETA-012：** 個人用戶登入正確進入員工端；企業用戶進入管理端。
- **BETA-015：** 同一分頁重新整理會保留 Demo 測試身分；登出會清除該分頁身分。
- **BETA-013：** 已完成員工請假 → 管理員核准 → 員工查看結果的跨角色回歸。
- **BETA-014：** 已完成班表草稿不可見、發布後可見的跨角色回歸。
- **BETA-017：** 本週與下週班表改為各自草稿、各自發布，不再連帶公開另一週內容。
- **BETA-018：** 請假日期改為必填並加入送出鎖與唯一 ID，避免空日期及快速連點重複案件。

以上登入、角色切換、個人導向與重新整理狀態已完成瀏覽器回歸測試。

### 新增或完成

- 提供每個角色各兩組固定假資料：企業管理員 2 組、員工／個人 2 組、免費用戶 2 組；管理員與員工使用一致的臨時密碼規則，免費用戶使用固定測試碼。
- 補充 Beta 入口政策：入口不是正式帳密系統、不鎖死正式帳號規則，但員工／個人／免費角色仍不可進入管理端。
- 測試文件明確禁止輸入真實敏感資料，並註明同角色兩組帳號目前共用本機 Demo 工作區。
- 管理端新增清楚的排班入口、分店篩選、主要班表、臨時調整、草稿與發布。
- 員工端新增本週／下週班表、每日班別、工時摘要與請假入口。
- 兩組員工臨時帳號分別顯示 `ANG0601` 與 `ANG0602`；新建立的人員仍不會自動取得可登入帳號。
- 入口、系統列與測試文件顯示固定版本 `BETA-v0.1`。
- 未串接功能改為明確 Demo／尚未串接提示，不再顯示假成功。

### 尚未修復

- **BETA-001、002：** 本版明確定位為 local-only 前端 Demo；正式 Auth、Token、帳號鎖定／停權、API、伺服器權限、租戶隔離與跨裝置同步尚未整合。
- **BETA-003：** 人員管理新增的員工尚未連接正式邀請／開通帳號流程。
- **BETA-016：** 同角色的兩組臨時帳號目前只用於角色入口測試，尚未建立各自獨立的使用者資料空間。
- **BETA-005、006、007：** 正式薪資引擎、NFC／QR／定位與後端排程尚未整合。
- **BETA-008：** 背景圖片仍需進一步壓縮。
- **BETA-019：** 部分次要控制仍小於建議的 44px 手機觸控尺寸，列入 BETA-v0.2 待處理項目。

### 需要重新測試

- 員工請假 → 管理員審核 → 員工查看結果。
- 管理排班草稿不可見、發布後員工可見。
- 手機寬度下的底部導航、表單、鍵盤與上下滑動。
