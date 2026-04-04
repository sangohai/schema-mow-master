export class MapManager {
    constructor() {
        this.types = {
            0: { content: "", walkable: true },
            1: { content: "🌿", walkable: true },
            2: { content: "🪨", walkable: false },
            "E": { content: "🏁", walkable: true }
        };
    }

    /**
     * 核心渲染逻辑：自动识别 Emoji 或 图片路径
     * 为未来的像素图片素材做准备
     */
    getContentHTML(content) {
        if (!content) return "";
        // 判断是否为图片路径 (png, jpg, svg, gif)
        if (typeof content === 'string' && content.match(/\.(png|jpg|gif|svg)$/)) {
            return `<img src="${content}" class="sprite-node" draggable="false">`;
        }
        // 否则渲染为标准化的 Emoji 容器
        return `<span class="sprite-node emoji-text">${content}</span>`;
    }

    render(config, container) {
        container.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
        
        // 初始化推土机容器
        container.innerHTML = `<div id="tractor">${this.getContentHTML("🚜")}</div>`;
        
        config.map.forEach((row, y) => {
            row.forEach((cellData, x) => {
                const div = document.createElement('div');
                div.className = 'grid-cell';
                div.id = `cell-${x}-${y}`;
                div.innerHTML = this.getContentHTML(this.types[cellData].content);
                container.appendChild(div);
            });
        });
    }

    updateCell(x, y, newValue) {
        const el = document.getElementById(`cell-${x}-${y}`);
        if (el) {
            el.innerHTML = this.getContentHTML(this.types[newValue].content);
            el.classList.add('cell-mown');
        }
    }

    getTile(config, x, y) {
        if (x < 0 || x >= config.cols || y < 0 || y >= config.rows) return null;
        const val = config.map[y][x];
        return { val, ...this.types[val] };
    }
}