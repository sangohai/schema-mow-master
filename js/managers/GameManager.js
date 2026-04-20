import { CanvasManager } from './CanvasManager.js';
import { UIManager } from './UIManager.js';

export class GameManager {
    constructor() {
        this.canvas = new CanvasManager('game-canvas');
        this.ui = new UIManager(this);
        this.score = 0;
        this.currentLevelIdx = 0;
        this.levels = [];
        this.rows = []; 
        this.mission = {}; 
        
        // 核心状态控制
        this.state = 'LOADING'; 
        this.isGameStarted = false; // 控制是否滚动的开关

        this.init();
    }

    async init() {
        try {
            const res = await fetch('./data/levels.json');
            this.levels = await res.json();
            // 立即渲染第一屏静态画面
            setTimeout(() => {
                this.startLevel(0);
                this.tick(); // 开启渲染，但不滚动
            }, 300);
        } catch (e) { console.error(e); }
    }

    /**
     * 点击“开始收割”按钮调用的方法
     */
    startGame() {
        this.isGameStarted = true;
        this.state = 'PLAYING';
        this.levelStartTime = Date.now();
        // 隐藏封面
        document.getElementById('start-screen').classList.add('d-none');
    }

    startLevel(idx) {
        this.currentLevelIdx = idx;
        const lv = this.levels[idx];
        this.score = 0;
        this.rows = [];
        this.mission = {};
        
        this.canvas.resize(lv.cols);
        
        // 初始化任务 UI ... (保持原有代码)
        const dock = document.getElementById('task-list');
        dock.innerHTML = '';
        lv.targets.forEach(t => {
            this.mission[t.id] = { ...t, current: 0 };
            const li = document.createElement('li');
            li.id = `task-${t.id}`;
            li.className = 'task-item';
            li.innerHTML = `${t.emoji}<span class="badge bg-danger task-badge">${t.goal}</span>`;
            dock.appendChild(li);
        });

        const cellH = this.canvas.grid.cellH;
        const canvasH = this.canvas.canvas.height / this.canvas.dpr;
        
        // --- 核心修复：从上往下物理排序填充 ---
        // 预留 2 行在屏幕上方，其余铺满全屏
        let currentY = -cellH * 2; 
        while (currentY < canvasH) {
            const newRow = this.createRowObject(currentY);
            this.rows.push(newRow); // 使用 push，保证 rows[0] 是最上面的
            currentY += cellH;
        }
        
        this.state = 'READY';
        this.ui.refresh(this.score, lv.name);
    }

    createRowObject(yPos) {
        const lv = this.levels[this.currentLevelIdx];
        const newRow = { y: yPos, tiles: [] };
        for (let i = 0; i < lv.cols; i++) {
            const rand = Math.random();
            let type = (rand < 0.1) ? 'flower' : (rand < 0.2 ? 'empty' : 'grass');
            newRow.tiles.push({
                type,
                emoji: type === 'flower' ? '🌸' : (type === 'empty' ? '' : '🌿'),
                state: type === 'empty' ? 'EMPTY' : 'FULL',
                growth: 1.0,
                treasure: Math.random() > 0.94 ? 'gem' : null,
                treasureEmoji: '💎',
                revealed: false
            });
        }
        return newRow;
    }

    tick() {
        this.canvas.render(this.rows);

        if (this.isGameStarted && this.state === 'PLAYING') {
            const lv = this.levels[this.currentLevelIdx];
            const cellH = this.canvas.grid.cellH;
            const canvasH = this.canvas.canvas.height / this.canvas.dpr;

            // 1. 所有行向下滚动
            this.rows.forEach(r => r.y += lv.scrollSpeed);

            // 2. 回收底部，生成顶部 (物理对齐逻辑)
            // 检查数组中物理位置最后一行（最下方）
            const bottomRow = this.rows[this.rows.length - 1];
            if (bottomRow && bottomRow.y > canvasH) {
                this.rows.pop(); // 移除最下面的一行
                
                // 在最上面补一行：坐标是当前第一行的 y 减去一行高度
                const topRowY = this.rows[0].y;
                const newRow = this.createRowObject(topRowY - cellH);
                this.rows.unshift(newRow); // 插入到数组开头
            }

            // 3. 再生逻辑
            this.rows.forEach(r => r.tiles.forEach(t => {
                if (t.state === 'REGEN' && !t.revealed) {
                    t.growth += 0.003; 
                    if (t.growth >= 1) { t.state = 'FULL'; t.growth = 1; }
                }
            }));
        }
        requestAnimationFrame(() => this.tick());
    }

    handleSwipe(clientX, clientY) {
        // 没点开始前，不允许割草
        if (!this.isGameStarted || this.state !== 'PLAYING') return;
        
        const rect = this.canvas.canvas.getBoundingClientRect();
        const cx = clientX - rect.left;
        const cy = clientY - rect.top;
        const { grid } = this.canvas;

        this.rows.forEach(row => {
            if (cy >= row.y && cy <= row.y + grid.cellH) {
                const col = Math.floor(cx / grid.cellW);
                const tile = row.tiles[col];
                if (tile && tile.state === 'FULL') {
                    this.collect(tile, cx, cy);
                } else if (tile && tile.revealed) {
                    this.collectTreasure(tile, cx, cy);
                }
            }
        });
    }

    collect(tile, x, y) {
        const tid = tile.type === 'flower' ? 'flower' : 'grass';
        const task = this.mission[tid];
        if (task) {
            if (task.current < task.goal) {
                task.current++;
                this.updateDock(tid);
            }
            this.score += task.baseScore;
        }

        // 露出宝藏但不立刻收集分数，等待玩家划过
        if (tile.treasure && !tile.revealed) {
            tile.revealed = true;
            // 此时不设置 REGEN 状态，保持 revealed
        } else {
            tile.state = 'REGEN';
            tile.growth = 0;
        }

        this.ui.refresh(this.score, this.levels[this.currentLevelIdx].name);
        this.canvas.createParticles(x, y);
        if (navigator.vibrate) navigator.vibrate(8);
        this.checkWin();
    }

    collectTreasure(tile, x, y) {
        tile.revealed = false; // 移除宝藏
        tile.state = 'REGEN';  // 开始再生草
        tile.growth = 0;
        
        if (this.mission['gem']) {
            this.mission['gem'].current++;
            this.updateDock('gem');
            this.score += this.mission['gem'].baseScore;
            this.ui.refresh(this.score, this.levels[this.currentLevelIdx].name);
        }
        this.canvas.createParticles(x, y);
        if (navigator.vibrate) navigator.vibrate(12);
        this.checkWin();
    }

    updateDock(id) {
        const item = this.mission[id];
        const el = document.getElementById(`task-${id}`);
        if (el) {
            const badge = el.querySelector('.badge');
            const rem = item.goal - item.current;
            if (rem <= 0) {
                badge.innerHTML = '✓';
                badge.className = 'badge bg-success task-badge';
            } else badge.innerText = rem;
        }
    }

    checkWin() {
        if (Object.values(this.mission).every(t => t.current >= t.goal)) {
            this.state = 'WON';
            this.calculateFinalScore();
            this.ui.showWin(this.currentLevelIdx === this.levels.length - 1);
        }
    }

    calculateFinalScore() {
        const duration = (Date.now() - this.levelStartTime) / 1000;
        const lv = this.levels[this.currentLevelIdx];
        let multiplier = 1.0;
        for (let bonus of lv.timeBonuses) {
            if (duration <= bonus.limit) { multiplier = bonus.mult; break; }
        }
        if (multiplier > 1.0) this.score = Math.floor(this.score * multiplier);
    }

    nextLevel() { this.startLevel(this.currentLevelIdx + 1); }
}