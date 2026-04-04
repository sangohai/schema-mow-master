/**
 * @typedef {Object} GameState
 * @property {Array<Array<string>>} grid - 二维阵列存储 Emoji
 * @property {{x: number, y: number}} player - 拖拉机坐标
 * @property {number} score - 积分
 */

export const CONFIG = {
    cols: 5,  // 减少一半网格
    rows: 9, 
    assets: {
        grass: "🌿",
        tractor: "🚜",
        empty: "🟫", // 割草后的填充，也可以换成 "🍂" 或保持原样
        gold: "✨"
    },
    swipeThreshold: 40 // 触发移动所需的拖拽像素
};

export const state = {
    grid: [],
    player: { x: 0, y: 0 },
    score: 0,
    isPlaying: false
};


/**
 * 初始化网格数据
 */
export function initData() {
    state.grid = Array.from({ length: CONFIG.rows }, () => 
        Array.from({ length: CONFIG.cols }, () => CONFIG.assets.grass)
    );
    state.player = { x: 0, y: 0 };
    state.score = 0;
    // 起点设为空地
    state.grid[0][0] = CONFIG.assets.empty;
}