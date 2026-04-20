export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.grid = { cols: 6, cellW: 0, cellH: 0 };
        this.particles = [];
    }

    resize(cols) {
        const wrapper = this.canvas.parentElement;
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight; // 现在的 h 是 100% 全屏
        
        const scale = w / cols;
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.grid = { cols, cellW: scale, cellH: scale };
    }

    render(rows) {
        if (!this.grid.cellW) return;
        const { ctx, grid } = this;
        const canvasH = this.canvas.height / this.dpr;

        ctx.fillStyle = "#5a824e"; 
        ctx.fillRect(0, 0, grid.cols * grid.cellW, canvasH);

        rows.forEach((row) => {
            if (row.y < -grid.cellH || row.y > canvasH) return;

            row.tiles.forEach((tile, x) => {
                const px = Math.floor(x * grid.cellW);
                const py = Math.floor(row.y);
                
                ctx.fillStyle = "rgba(0,0,0,0.15)";
                ctx.fillRect(px + 2, py + 2, grid.cellW - 4, grid.cellH - 4);

                /**
                 * 视觉修复逻辑：
                 * 1. 如果宝藏已被露出，则不画正在再生的草，防止重叠遮挡。
                 * 2. 只有宝藏消失后，草才开始再生（由 GameManager 控制逻辑）。
                 */
                if (tile.revealed && tile.treasure) {
                    this.drawIcon(tile.treasureEmoji, px, py, 0.85);
                } else if (tile.state !== 'EMPTY') {
                    const s = tile.growth || 1;
                    this.drawIcon(tile.emoji, px, py, s * 0.7);
                }
            });
        });
        this.drawParticles();
    }

    drawIcon(emoji, x, y, scale) {
        const size = Math.floor(this.grid.cellW * scale);
        this.ctx.font = `bold ${size}px sans-serif`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(emoji, x + this.grid.cellW/2, y + this.grid.cellH/2 + 2);
    }

    createParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                life: 1.0, color: `rgba(120, ${180 + Math.random()*50}, 80, `
            });
        }
    }

    drawParticles() {
        this.particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.04;
            if (p.life <= 0) return this.particles.splice(i, 1);
            this.ctx.fillStyle = p.color + p.life + ")";
            this.ctx.fillRect(p.x, p.y, 4, 4);
        });
    }
}