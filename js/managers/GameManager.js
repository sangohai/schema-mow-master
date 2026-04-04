import { CanvasManager } from './CanvasManager.js';
import { UIManager } from './UIManager.js';

export class GameManager {
    constructor() {
        this.canvas = new CanvasManager('game-canvas');
        this.ui = new UIManager(this);
        this.score = 0;
        this.currentLevelIdx = 0;
        this.levels = [];
        this.player = { x: 0, y: 0 };
        this.visualPos = { x: 0, y: 0 };
        this.rotation = { angle: 0, flipX: false };
        this.isMoving = false;
        this.inputQueue = [];
        this.state = 'LOADING'; // 状态机：LOADING | PLAYING | WON

        this.init();
        this.loop(); // 启动唯一的渲染循环
    }

    async init() {
        try {
            // 适配 GitHub Pages 的相对路径加载
            const res = await fetch('./data/levels.json');
            this.levels = await res.json();
            this.loadLevel(0);
            this.state = 'PLAYING';
            
            window.addEventListener('resize', () => this.handleResize());
        } catch (e) {
            console.error("加载关卡失败:", e);
        }
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        const lv = this.levels[idx];
        this.player = { x: lv.startX, y: lv.startY };
        this.canvas.resize(lv.cols, lv.rows);
        this.visualPos = { 
            x: this.player.x * this.canvas.grid.cellW, 
            y: this.player.y * this.canvas.grid.cellH 
        };
        this.ui.refresh(this.score, lv.name);
    }

    handleResize() {
        const lv = this.levels[this.currentLevelIdx];
        if (lv) {
            this.canvas.resize(lv.cols, lv.rows);
            // 重新同步像素坐标
            this.visualPos = { 
                x: this.player.x * this.canvas.grid.cellW, 
                y: this.player.y * this.canvas.grid.cellH 
            };
        }
    }

    loop() {
        if (this.state === 'PLAYING') {
            this.updateVisuals();
            this.canvas.render({
                visualPos: this.visualPos,
                rotation: this.rotation
            }, this.levels[this.currentLevelIdx]);
        }
        requestAnimationFrame(() => this.loop());
    }

    updateVisuals() {
        const targetX = this.player.x * this.canvas.grid.cellW;
        const targetY = this.player.y * this.canvas.grid.cellH;
        // 丝滑跟随系数
        this.visualPos.x += (targetX - this.visualPos.x) * 0.3;
        this.visualPos.y += (targetY - this.visualPos.y) * 0.3;
    }

    // enqueueMove, processQueue, nextLevel 等逻辑保持之前版本...
    enqueueMove(dir) {
        if (this.inputQueue.length < 3) this.inputQueue.push(dir);
        this.processQueue();
    }

    processQueue() {
        if (this.isMoving || this.inputQueue.length === 0) return;
        this.isMoving = true;
        const dir = this.inputQueue.shift();
        const lv = this.levels[this.currentLevelIdx];
        let nx = this.player.x, ny = this.player.y;

        if (dir === 'UP') ny--; else if (dir === 'DOWN') ny++;
        else if (dir === 'LEFT') nx--; else if (dir === 'RIGHT') nx++;

        // 方向翻转逻辑
        if (dir === 'LEFT') this.rotation = { angle: 0, flipX: false };
        if (dir === 'RIGHT') this.rotation = { angle: 0, flipX: true };
        if (dir === 'UP') this.rotation = { angle: 90, flipX: false };
        if (dir === 'DOWN') this.rotation = { angle: -90, flipX: false };

        const val = lv.map[ny]?.[nx];
        if (val !== undefined && val !== 2) {
            this.player = { x: nx, y: ny };
            if (val === 1) {
                this.score += 10;
                lv.map[ny][nx] = 0;
                this.ui.refresh(this.score, lv.name);
                if (navigator.vibrate) navigator.vibrate(10);
            }
            setTimeout(() => {
                this.isMoving = false;
                if (val === 'E') {
                    this.inputQueue = [];
                    this.ui.showWin(this.currentLevelIdx === this.levels.length - 1);
                } else this.processQueue();
            }, 85);
        } else {
            this.isMoving = false;
            this.inputQueue = [];
        }
    }

    nextLevel() { this.loadLevel(this.currentLevelIdx + 1); }
}