import { GameManager } from './managers/GameManager.js';

const game = new GameManager();
game.init();

const canvas = document.getElementById('game-canvas');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');

let touchBase = { x: 0, y: 0 };
let moveAccumulator = { x: 0, y: 0 };

startBtn.onclick = () => startScreen.classList.add('d-none');

canvas.addEventListener('touchstart', (e) => {
    touchBase = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    moveAccumulator = { x: 0, y: 0 };
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (startScreen.offsetParent !== null) return;
    e.preventDefault();

    const cur = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const dx = cur.x - touchBase.x;
    const dy = cur.y - touchBase.y;

    moveAccumulator.x += dx;
    moveAccumulator.y += dy;

    // 获取画布当前格子的物理尺寸
    const step = game.canvas.grid.cellW;

    if (Math.abs(moveAccumulator.x) >= step) {
        const dir = moveAccumulator.x > 0 ? 'RIGHT' : 'LEFT';
        game.enqueueMove(dir);
        moveAccumulator.x -= (moveAccumulator.x > 0 ? step : -step);
    }
    
    if (Math.abs(moveAccumulator.y) >= step) {
        const dir = moveAccumulator.y > 0 ? 'DOWN' : 'UP';
        game.enqueueMove(dir);
        moveAccumulator.y -= (moveAccumulator.y > 0 ? step : -step);
    }

    touchBase = cur;
}, { passive: false });