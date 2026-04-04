// 极简 Service Worker 确保 PWA 可安装
const CACHE_NAME = 'mow-v1';

self.addEventListener('install', (event) => {
    console.log('MowMaster Service Worker Installed');
});

self.addEventListener('fetch', (event) => {
    // 策略：网络优先。确保你修改代码后刷新能立即看到效果
    event.respondWith(fetch(event.request));
});