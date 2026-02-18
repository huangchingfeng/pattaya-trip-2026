#!/usr/bin/env python3
"""
批次為 HTML 檔案新增 PWA meta tags
"""

import re
from pathlib import Path

# PWA meta tags 模板
PWA_META_TAGS = '''  <meta name="description" content="芭達雅旅遊攻略，支援離線瀏覽！">

  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#ff00ff">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Pattaya 2026">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">

'''

# Service Worker 註冊腳本
SW_SCRIPT = '''
  <!-- Service Worker 註冊 -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker 註冊成功:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Service Worker 註冊失敗:', error);
          });
      });
    }
  </script>
'''

# 需要更新的檔案（排除 index.html, day.html, night.html, thai-helper.html 已更新）
FILES_TO_UPDATE = [
    'itinerary.html',
    'games.html',
    'sop.html',
    'money.html',
    'esim.html',
    'resources.html',
    'truth-or-dare.html'
]

def add_pwa_meta_to_file(filepath: Path):
    """為單個檔案新增 PWA meta tags"""
    print(f"正在處理: {filepath.name}")

    content = filepath.read_text(encoding='utf-8')

    # 1. 如果已經有 PWA meta，跳過
    if 'manifest.json' in content:
        print(f"  → 已包含 PWA meta，跳過")
        return

    # 2. 在 </title> 後插入 PWA meta tags
    content = re.sub(
        r'(</title>)',
        r'\1\n' + PWA_META_TAGS,
        content,
        count=1
    )

    # 3. 在 </body> 前插入 SW 註冊腳本
    if 'serviceWorker' not in content:
        content = re.sub(
            r'(</body>)',
            SW_SCRIPT + r'\1',
            content,
            count=1
        )

    # 寫回檔案
    filepath.write_text(content, encoding='utf-8')
    print(f"  → ✅ 更新完成")

def main():
    base_dir = Path(__file__).parent

    print("🚀 開始批次更新 HTML 檔案...\n")

    for filename in FILES_TO_UPDATE:
        filepath = base_dir / filename
        if filepath.exists():
            add_pwa_meta_to_file(filepath)
        else:
            print(f"⚠️ 檔案不存在: {filename}")

    print("\n✅ 批次更新完成！")

if __name__ == '__main__':
    main()
