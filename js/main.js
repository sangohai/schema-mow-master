import { GameManager } from './managers/GameManager.js';

const game = new GameManager();

const canvas = document.getElementById('game-canvas');
const startBtn = document.getElementById('start-btn');

// 点击“开始收割”
startBtn.onclick = () => {
    game.startGame(); // 启动游戏逻辑
};

// 滑动监听：改为通过 game.handleSwipe 处理
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    game.handleSwipe(touch.clientX, touch.clientY);
}, { passive: false });

// PC 鼠标支持
canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) game.handleSwipe(e.clientX, e.clientY);
});