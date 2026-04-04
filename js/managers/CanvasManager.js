export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        // 关键：alpha: false 提高性能并彻底消除“背景透出导致的暗沉感”
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.grid = { cols: 6, rows: 10, cellW: 0, cellH: 0 };
    }

    /**
     * 核心：高精度画布适配
     */
    resize(cols, rows) {
        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;

        // 确保容器尺寸已稳定
        const w = wrapper.clientWidth || window.innerWidth;
        const h = wrapper.clientHeight || window.innerHeight;

        // 锁定 6:10 比例并预留 10% 的安全边距
        const scale = Math.min((w - 40) / cols, (h - 120) / rows);
        const logicalW = Math.floor(cols * scale);
        const logicalH = Math.floor(rows * scale);

        this.canvas.width = logicalW * this.dpr;
        this.canvas.height = logicalH * this.dpr;
        this.canvas.style.width = `${logicalW}px`;
        this.canvas.style.height = `${logicalH}px`;

        // 关键：每次 Resize 必须彻底重置变换矩阵
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.grid = { cols, rows, cellW: scale, cellH: scale };
    }

    /**
     * 核心渲染：每一帧都是从白纸开始，确保没有残留遮罩
     */
    render(gameState, levelData) {
        const { ctx, grid } = this;
        if (!grid.cellW || !levelData) return;

        // 1. 彻底涂抹背景：使用明亮的青苔绿 (消除“暗沉感”)
        ctx.fillStyle = "#5a824e"; 
        ctx.fillRect(0, 0, grid.cols * grid.cellW, grid.rows * grid.cellH);

        // 2. 绘制地块与图标
        const map = levelData.map;
        for (let y = 0; y < grid.rows; y++) {
            for (let x = 0; x < grid.cols; x++) {
                const px = Math.floor(x * grid.cellW);
                const py = Math.floor(y * grid.cellH);
                const cw = Math.ceil(grid.cellW);
                const ch = Math.ceil(grid.cellH);

                // 绘制地块：未割草为浅色，割过为深色
                ctx.fillStyle = map[y][x] === 0 ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)";
                ctx.fillRect(px + 3, py + 3, cw - 6, ch - 6);

                // 绘制静态物品
                const item = map[y][x];
                if (item === 1) this.drawText("🌿", px, py, 0.65);
                if (item === 2) this.drawText("🪨", px, py, 0.6);
                if (item === "E") this.drawText("🏁", px, py, 0.6);
            }
        }

        // 3. 绘制动态推土机
        this.drawTractor(gameState);
    }

    drawText(emoji, x, y, scale) {
        const size = Math.floor(this.grid.cellW * scale);
        this.ctx.font = `bold ${size}px sans-serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(emoji, x + this.grid.cellW/2, y + this.grid.cellH/2 + 4);
    }

    drawTractor(state) {
        const { ctx, grid } = this;
        const { visualPos, rotation } = state;

        // 像素对齐：解决模糊和透明感的终极方案
        const tx = Math.round(visualPos.x + grid.cellW / 2);
        const ty = Math.round(visualPos.y + grid.cellH / 2);

        ctx.save();
        ctx.translate(tx, ty);

        // 处理方向翻转
        if (rotation.flipX) ctx.scale(-1, 1);
        ctx.rotate(rotation.angle * Math.PI / 180);

        const size = Math.floor(grid.cellW * 0.9);
        ctx.font = `bold ${size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // 增加白色微光：确保图标在任何背景下都清晰不透明
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "white";
        ctx.fillText("🚜", 0, 0);
        
        ctx.restore();
    }
}