export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.grid = { cols: 6, rows: 10, cellW: 0, cellH: 0 };
    }

    /**
     * 适配沉浸式全屏的高精度 Resize
     */
    resize(cols, rows) {
        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;

        // 获取安全区域高度
        const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
        const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom')) || 0;

        // 计算可用宽度和高度（扣除安全区和 Header 大约 80px）
        const availableW = wrapper.clientWidth - 40;
        const availableH = wrapper.clientHeight - safeTop - safeBottom - 100;

        const scale = Math.min(availableW / cols, availableH / rows);
        
        const lw = Math.floor(cols * scale);
        const lh = Math.floor(rows * scale);

        this.canvas.width = lw * this.dpr;
        this.canvas.height = lh * this.dpr;
        this.canvas.style.width = `${lw}px`;
        this.canvas.style.height = `${lh}px`;

        // 核心：强制重置缩放矩阵
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.grid = { cols, rows, cellW: scale, cellH: scale };
    }

    render(gameState, mapConfig) {
        if (!this.grid.cellW) return;
        const { ctx, grid } = this;

        // 背景：使用鲜艳色彩消除暗沉
        ctx.fillStyle = "#5a824e"; 
        ctx.fillRect(0, 0, grid.cols * grid.cellW, grid.rows * grid.cellH);

        mapConfig.map.forEach((row, y) => {
            row.forEach((cellData, x) => {
                const px = Math.floor(x * grid.cellW);
                const py = Math.floor(y * grid.cellH);
                const cw = Math.ceil(grid.cellW);
                const ch = Math.ceil(grid.cellH);

                // 土地背景
                ctx.fillStyle = cellData === 0 ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)";
                ctx.fillRect(px + 3, py + 3, cw - 6, ch - 6);

                if (cellData === 1) this.drawIcon("🌿", px, py, 0.7);
                if (cellData === 2) this.drawIcon("🪨", px, py, 0.6);
                if (cellData === "E") this.drawIcon("🏁", px, py, 0.6);
            });
        });

        this.drawTractor(gameState.visualPos, gameState.rotation);
    }

    drawIcon(emoji, x, y, scale) {
        const size = Math.floor(this.grid.cellW * scale);
        this.ctx.save();
        this.ctx.font = `bold ${size}px sans-serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(emoji, x + this.grid.cellW/2, y + this.grid.cellH/2 + 3);
        this.ctx.restore();
    }

    drawTractor(pos, rotation) {
        const { ctx, grid } = this;
        // 像素对齐锁定：解决模糊与淡化感
        const tx = Math.round(pos.x + grid.cellW / 2);
        const ty = Math.round(pos.y + grid.cellH / 2);
        
        ctx.save();
        ctx.translate(tx, ty);

        if (rotation.flipX) ctx.scale(-1, 1);
        ctx.rotate(rotation.angle * Math.PI / 180);

        const size = Math.floor(grid.cellW * 0.9);
        ctx.font = `bold ${size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // 推土机对比度增强
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 8;
        ctx.fillText("🚜", 0, 0);
        
        ctx.restore();
    }
}