# 快取策略定義
**Cache Strategy Specification**

## 🎯 核心策略：Network First (Fallback to Cache)

### 為什麼選擇 Network First？

1. **保持內容新鮮** - 優先嘗試獲取最新內容
2. **離線時自動降級** - 網路失敗時使用快取
3. **簡單易維護** - 適合靜態網站
4. **符合 MVP 範圍** - 不需要複雜的快取管理

---

## 📦 快取資源清單

### 核心 HTML 頁面（9 頁）

```javascript
const CORE_PAGES = [
  '/',
  '/index.html',
  '/day.html',
  '/night.html',
  '/itinerary.html',
  '/thai-helper.html',
  '/sop.html',
  '/money.html',
  '/esim.html',
  '/games.html'
];
```

### 外部 CDN 資源

```javascript
const CDN_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
];
```

---

## 🚀 Service Worker 實作規格

### 1. 快取版本管理

```javascript
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `pattaya-2026-${CACHE_VERSION}`;
```

**更新策略**：修改版本號 → 自動清理舊快取

### 2. Install Event（預快取）

- 快取所有核心頁面
- 快取 CDN 資源
- 使用 `skipWaiting()` 立即啟用

### 3. Activate Event（清理）

- 刪除舊版本快取
- 使用 `clients.claim()` 控制所有頁面

### 4. Fetch Event（Network First）

```
請求 → 嘗試網路
     ↓ 成功 → 更新快取 → 返回
     ↓ 失敗 → 查詢快取 → 返回（或 offline.html）
```

---

**技術副總監 (Technical VP)**
**最後更新**：2026-02-18
