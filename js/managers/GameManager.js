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
        this.isReady = false;

        // 响应式监听
        window.addEventListener('resize', () => {
            if (this.levels[this.currentLevelIdx]) {
                const lv = this.levels[this.currentLevelIdx];
                this.canvas.resize(lv.cols, lv.rows);
                this.syncVisualPos(); // 缩放后立即重置推土机位置
            }
        });

        this.tick();
    }

    async init() {
        const res = await fetch('./data/levels.json');
        this.levels = await res.json();
        this.loadLevel(0);
        this.isReady = true;
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        const lv = this.levels[idx];
        this.player = { x: lv.startX, y: lv.startY };
        this.canvas.resize(lv.cols, lv.rows);
        this.syncVisualPos();
        this.ui.refresh(this.score, lv.name);
    }

    syncVisualPos() {
        this.visualPos = { 
            x: this.player.x * this.canvas.grid.cellW, 
            y: this.player.y * this.canvas.grid.cellH 
        };
    }

    tick() {
        if (this.isReady && this.levels[this.currentLevelIdx]) {
            this.updateVisuals();
            this.canvas.render({
                visualPos: this.visualPos,
                rotation: this.rotation
            }, this.levels[this.currentLevelIdx]);
        }
        requestAnimationFrame(() => this.tick());
    }

    updateVisuals() {
        const targetX = this.player.x * this.canvas.grid.cellW;
        const targetY = this.player.y * this.canvas.grid.cellH;
        
        const dx = targetX - this.visualPos.x;
        const dy = targetY - this.visualPos.y;

        // 提升插值系数至 0.3，减少跟手延迟感
        if (Math.abs(dx) < 0.1) this.visualPos.x = targetX;
        else this.visualPos.x += dx * 0.3;

        if (Math.abs(dy) < 0.1) this.visualPos.y = targetY;
        else this.visualPos.y += dy * 0.3;
    }

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

        // 更新朝向
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
            }, 90); // 移动节奏调优
        } else {
            this.isMoving = false;
            this.inputQueue = [];
        }
    }
    
    nextLevel() { this.loadLevel(this.currentLevelIdx + 1); }
}