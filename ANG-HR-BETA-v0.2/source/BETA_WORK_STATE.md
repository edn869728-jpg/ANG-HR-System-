# ANG HR Beta 工作狀態（避免重複執行）

更新時間：2026-07-18（Asia/Taipei）

## BETA-v0.1 已固定，不覆蓋

- v0.1 的 6 組 A／B 臨時帳號、build、smoke、請假回歸、排班回歸、deploy/source ZIP 與 SHA-256 已完成。
- 固定位置：`release-artifacts/ANG-HR-BETA-v0.1/`。
- v0.1 的 site、source、ZIP、SHA-256 與既有測試回報保持原樣；不得拿 v0.2 成品覆蓋。
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
- v0.1 artifact 維持原樣；後續 DEVELOPMENT-v0.3 不得覆蓋 v0.2 固定版本。
