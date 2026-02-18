# Pattaya Trip 2026 - 部署指南

## 🎯 部署前檢查清單

### ✅ PWA 核心檔案
- [x] `manifest.json` - PWA 配置檔
- [x] `service-worker.js` - Service Worker (v1.0.0)
- [x] `icons/icon-192.png` - 192x192 圖示
- [x] `icons/icon-512.png` - 512x512 圖示
- [x] `offline.html` - 離線 fallback 頁面

### ✅ HTML 更新（11 個檔案）
- [x] index.html
- [x] day.html
- [x] night.html
- [x] itinerary.html
- [x] thai-helper.html
- [x] games.html
- [x] truth-or-dare.html
- [x] resources.html
- [x] sop.html
- [x] money.html
- [x] esim.html

所有檔案已包含：
- PWA manifest 連結
- theme-color meta tag
- iOS Safari 支援 meta tags
- Service Worker 註冊腳本

---

## 🚀 部署步驟

### Step 1: 本地測試（可選但建議）

```bash
# 1. 啟動本地伺服器
cd /Users/huangjingfeng/pattaya-trip-2026
python3 -m http.server 8000

# 2. 開啟瀏覽器
open http://localhost:8000

# 3. 檢查項目：
# - F12 Console 看到「✅ Service Worker 註冊成功」
# - Application > Service Workers 看到 ACTIVATED
# - Application > Manifest 資訊正確
# - Network > Offline > 重整頁面仍可瀏覽
```

### Step 2: 推送到 GitHub

```bash
# 確認所有變更已提交
git status

# 如果有未提交的變更（圖示檔案）
git add icons/ offline.html DEPLOYMENT.md
git commit -m "feat: 新增 PWA 圖示與離線頁面

- 新增 icons/icon-192.png 和 icon-512.png
- 新增 offline.html 離線 fallback 頁面
- 新增 DEPLOYMENT.md 部署指南

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 推送到遠端
git push origin main
```

### Step 3: 啟用 GitHub Pages

1. 前往 GitHub Repository Settings
2. 左側選單 > Pages
3. Source: 選擇 `main` 分支
4. 點擊 Save
5. 等待 1-2 分鐘，網站會自動部署

**預期網址**：`https://[username].github.io/pattaya-trip-2026/`

---

## 📱 實機安裝測試

### Android (Chrome)

1. 用手機 Chrome 開啟網站
2. 瀏覽器會自動顯示「新增至主畫面」提示
3. 點擊「安裝」
4. App 會出現在主畫面

### iOS (Safari)

1. 用 iPhone Safari 開啟網站
2. 點擊底部分享按鈕 (⬆️)
3. 選擇「加入主畫面」
4. 輸入名稱 > 新增
5. App 會出現在主畫面

---

## 🧪 Lighthouse PWA 測試

### 執行測試

1. Chrome DevTools > Lighthouse
2. 選擇 Categories:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ SEO
3. 點擊「Analyze page load」

### 預期分數

| 類別 | 目標 |
|------|------|
| PWA | ≥ 90 |
| Performance | ≥ 80 |
| Accessibility | ≥ 85 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

### 常見問題修正

#### 問題：Manifest 缺少 maskable icon
**解決**：在 manifest.json 加入：
```json
{
  "src": "/icons/icon-512.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "any maskable"
}
```

#### 問題：HTTPS 要求
**說明**：GitHub Pages 自動提供 HTTPS，無需額外設定

#### 問題：Service Worker 未註冊
**檢查**：
- manifest.json 路徑是否正確（`/manifest.json` 而非 `manifest.json`）
- service-worker.js 路徑是否正確
- 是否在 HTTPS 環境下（localhost 或 GitHub Pages）

---

## 🔧 故障排除

### Service Worker 未啟動

```javascript
// 在 Console 執行
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('已註冊的 SW:', registrations);
});
```

### 清除快取重新測試

```javascript
// 在 Console 執行
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  console.log('快取已清除');
});
```

### 強制更新 Service Worker

```javascript
// 在 Console 執行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
  console.log('SW 更新中...');
});
```

---

## 📊 監控與維護

### 版本更新流程

當你更新網站內容時：

1. 修改檔案內容
2. 更新 `service-worker.js` 的版本號：
   ```javascript
   const CACHE_VERSION = 'v1.0.1'; // 改為新版本
   ```
3. 提交並推送到 GitHub
4. 用戶下次訪問時會自動更新

### 使用者更新通知（選用）

可在 service-worker.js 加入：

```javascript
self.addEventListener('activate', (event) => {
  // 通知所有 clients 有新版本
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NEW_VERSION',
        version: CACHE_VERSION
      });
    });
  });
});
```

---

## 🎯 成功指標

部署成功的標準：

- ✅ 網站可透過 HTTPS 訪問
- ✅ Android 可顯示「安裝」提示
- ✅ iOS 可「加入主畫面」
- ✅ 離線狀態下可瀏覽 9/11 核心頁面
- ✅ Lighthouse PWA 分數 ≥ 90
- ✅ 泰語助手離線搜尋正常運作

---

## 📞 支援

如遇到問題，可檢查：

1. **Chrome DevTools Console** - 查看錯誤訊息
2. **Application > Service Workers** - 查看 SW 狀態
3. **Application > Manifest** - 確認 manifest 正確載入
4. **Network** - 檢查資源載入情況

---

**最後更新**：2026-02-18
**維護者**：阿峰老師（黃敬峰 / AI峰哥）
**技術棧**：PWA + Service Worker + Vanilla JS
