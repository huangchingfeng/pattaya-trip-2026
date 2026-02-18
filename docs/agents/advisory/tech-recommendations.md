# 技術建議清單
**Technology Recommendations**

## 🎯 核心建議

### 1. Service Worker 實作建議

**推薦方案：手寫 Vanilla Service Worker**

```javascript
// 建議的 Service Worker 結構

const CACHE_VERSION = 'v1';
const CACHE_NAME = `pattaya-2026-${CACHE_VERSION}`;

// 預快取資源
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/day.html',
  '/night.html',
  // ... 其他頁面
];

// Install: 預快取核心資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_URLS);
    })
  );
  self.skipWaiting(); // 立即啟用新 SW
});

// Activate: 清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // 立即控制所有頁面
});

// Fetch: 策略 - Network First (fallback Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功取得網路回應 → 更新快取
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        // 網路失敗 → 使用快取
        return caches.match(event.request);
      })
  );
});
```

---

### 2. manifest.json 完整建議

```json
{
  "name": "芭達雅之旅 2026 - 白天行程、夜生活、泰語助手",
  "short_name": "Pattaya 2026",
  "description": "你的芭達雅旅遊全攻略：白天景點、夜生活指南、泰語小幫手、派對遊戲，支援離線使用！",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#ff00ff",
  "background_color": "#0a0a0f",
  "lang": "zh-TW",
  "dir": "ltr",
  "categories": ["travel", "lifestyle", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
}
```

**必要欄位**：
- ✅ `name`, `short_name`
- ✅ `start_url`
- ✅ `display: standalone`
- ✅ `icons` (至少 192x192, 512x512)

**建議欄位**：
- `theme_color` - 狀態列顏色
- `background_color` - 啟動畫面背景
- `description` - 在安裝提示中顯示
- `categories` - 幫助搜尋引擎分類

---

### 3. HTML meta tags 建議

**在所有 11 個 HTML 的 `<head>` 中加入**：

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color (Android 狀態列) -->
<meta name="theme-color" content="#ff00ff">

<!-- iOS Safari 支援 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Pattaya 2026">
<link rel="apple-touch-icon" href="/icons/icon-192.png">

<!-- Windows Tiles -->
<meta name="msapplication-TileColor" content="#0a0a0f">
<meta name="msapplication-TileImage" content="/icons/icon-512.png">

<!-- PWA 描述（SEO + 分享） -->
<meta name="description" content="芭達雅旅遊全攻略 - 白天行程、夜生活、泰語助手、派對遊戲，支援離線使用！">
```

**需要修改的頁面**：
- ✅ `index.html`
- ✅ `day.html`
- ✅ `night.html`
- ✅ `itinerary.html`
- ✅ `thai-helper.html`
- ✅ `games.html`
- ✅ `truth-or-dare.html`
- ✅ `resources.html`
- ✅ `sop.html`
- ✅ `esim.html`
- ✅ `money.html`

---

### 4. PWA 安裝提示建議

**問題**：iOS Safari 不支援 `beforeinstallprompt` API

**解決方案**：自訂安裝引導 UI

```javascript
// pwa-install.js

// 偵測 iOS Safari
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 偵測是否已安裝（在主畫面開啟）
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// 顯示安裝提示
function showInstallPrompt() {
  if (isStandalone()) return; // 已安裝，不顯示

  if (isIOS()) {
    // iOS: 顯示自訂引導（圖示 + 文字說明）
    showIOSInstallGuide();
  } else {
    // Android/Desktop: 使用原生 API
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      const installBtn = document.getElementById('install-btn');
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', () => {
        e.prompt();
      });
    });
  }
}

// iOS 安裝引導 UI
function showIOSInstallGuide() {
  const guideHTML = `
    <div id="ios-install-guide" style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 20px;
      border-radius: 16px;
      z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    ">
      <p style="margin: 0 0 12px;">
        📱 安裝到主畫面：點擊「分享」圖示 <span style="font-size: 1.5em;">⎙</span>，
        然後選擇「加入主畫面」
      </p>
      <button onclick="document.getElementById('ios-install-guide').remove()" style="
        background: #ff00ff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: bold;
      ">知道了</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', guideHTML);
}

// 頁面載入後執行
window.addEventListener('load', showInstallPrompt);
```

---

### 5. 離線 Fallback 頁面建議

**建立 `offline.html`**（當快取失效時顯示）：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>離線模式 - Pattaya 2026</title>
  <style>
    body {
      font-family: 'Noto Sans TC', sans-serif;
      background: #0a0a0f;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    h1 { font-size: 2rem; margin-bottom: 16px; color: #ff00ff; }
    p { color: rgba(255,255,255,0.8); line-height: 1.6; }
    a { color: #00ffff; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div>
    <h1>📡 目前離線</h1>
    <p>你正處於離線模式，部分內容可能無法載入。</p>
    <p>請檢查網路連線，或瀏覽已快取的頁面。</p>
    <p><a href="/">返回首頁</a></p>
  </div>
</body>
</html>
```

**在 Service Worker 中使用**：

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功 → 更新快取
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        // 網路失敗 → 嘗試快取
        return caches.match(event.request).then((cachedResponse) => {
          // 如果快取也沒有 → 顯示離線頁面
          return cachedResponse || caches.match('/offline.html');
        });
      })
  );
});
```

---

### 6. 快取版本管理建議

**問題**：如何通知用戶有新版本？

**解決方案**：實作更新提示

```javascript
// 在主要 JS 中監聽 SW 更新
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 有新版本可用
          showUpdateNotification();
        }
      });
    });
  });
}

function showUpdateNotification() {
  const updateHTML = `
    <div id="update-notification" style="
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: #ff00ff;
      color: white;
      padding: 16px;
      border-radius: 12px;
      z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    ">
      <p style="margin: 0 0 12px;">🎉 有新版本可用！</p>
      <button onclick="location.reload()" style="
        background: white;
        color: #ff00ff;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: bold;
      ">立即更新</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', updateHTML);
}
```

---

### 7. 圖示設計建議

**簡化方案**：使用 Emoji + 純色背景

**工具推薦**：
1. **線上工具**：[favicon.io](https://favicon.io/favicon-generator/)
2. **Figma**：自己設計
3. **簡易方案**：使用 Canvas API 生成

**最簡單的方法（純程式碼生成）**：

```javascript
// 生成 PWA 圖示（使用 Canvas）
function generateIcon(size, emoji) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 背景色（漸層）
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#ff00ff');
  gradient.addColorStop(1, '#00ffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Emoji
  ctx.font = `${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toDataURL('image/png');
}

// 生成 192x192 和 512x512 圖示
const icon192 = generateIcon(192, '🏖️');
const icon512 = generateIcon(512, '🏖️');
```

**建議 Emoji**：
- 🏖️ 沙灘（通用）
- 🌴 椰子樹（熱帶風）
- 🌅 夕陽（芭達雅特色）
- 🎉 派對（夜生活）

---

### 8. 測試檢查清單

| 測試項目 | 工具 | 目標 |
|---------|------|------|
| PWA 完整性 | Lighthouse | 90+ 分 |
| 離線功能 | Chrome DevTools (Offline mode) | 所有頁面可離線瀏覽 |
| 安裝流程 | 實機測試 (Android) | 可順利安裝 |
| iOS 支援 | iPhone Safari | 可加入主畫面 |
| 快取更新 | 修改內容後重新整理 | 顯示更新提示 |
| Service Worker | Application > Service Workers | 狀態為 Activated |
| manifest.json | Application > Manifest | 無錯誤 |

**推薦測試工具**：
- Chrome DevTools > Application
- Lighthouse (PWA Audit)
- BrowserStack (多裝置測試)

---

### 9. 部署建議

**推薦平台：GitHub Pages**

**優點**：
- ✅ 免費
- ✅ 自動 HTTPS（PWA 必須）
- ✅ 支援自訂網域
- ✅ 部署簡單（git push 即可）

**部署步驟**：
```bash
# 1. 推送到 GitHub
git add .
git commit -m "feat: 新增 PWA 功能"
git push origin main

# 2. 啟用 GitHub Pages
# 前往 Settings > Pages > Source: main branch

# 3. 等待部署完成（約 1-2 分鐘）
```

**替代方案**：
- Netlify（更快部署）
- Vercel（支援 Serverless Functions）
- Cloudflare Pages（全球 CDN）

---

### 10. 效能優化建議

**當前優勢**：
- ✅ 內嵌 CSS/JS（減少 HTTP 請求）
- ✅ 無大型圖片（主要靠 CSS 樣式）

**建議優化**：
1. **字型優化**：
   ```html
   <!-- 加入 font-display: swap -->
   <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">
   ```

2. **延遲載入 Swiper**（僅 night.html 需要）：
   ```html
   <script defer src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
   ```

3. **預連接 CDN**：
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://cdn.jsdelivr.net">
   ```

---

## ✅ 總結建議

### 必須實作（Phase 1）
1. ✅ 建立 `manifest.json`
2. ✅ 建立 `service-worker.js`（基礎快取）
3. ✅ 在所有 HTML 加入 PWA meta tags
4. ✅ 註冊 Service Worker

### 建議實作（Phase 2）
1. ⭐ 實作離線 Fallback
2. ⭐ 實作更新提示
3. ⭐ 生成 PWA 圖示

### 可選實作（Phase 3）
1. 🌟 iOS 安裝引導 UI
2. 🌟 效能優化（preconnect, defer）
3. 🌟 截圖（manifest screenshots）

---

**技術建議者**：技術顧問 (Technical Consultant)
**最後更新**：2026-02-18
