/**
 * 游戏核心算法模块
 * 负责手势识别与通用的位移计算
 */

/**
 * @typedef {Object} Point
 * @property {number} x - 屏幕 X 坐标
 * @property {number} y - 屏幕 Y 坐标
 */

/**
 * 将滑动位移向量转换为四个基本方向之一
 * 
 * @param {Point} start - 触碰开始坐标 (touchstart)
 * @param {Point} end - 触碰结束/移动中的坐标 (touchmove/touchend)
 * @returns {'UP'|'DOWN'|'LEFT'|'RIGHT'|null} - 返回方向字符串，若位移过小则返回 null
 */
export function getDirection(start, end) {
    // 1. 计算 X 和 Y 轴的位移差
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // 2. 取绝对值用于判定主方向
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    
    /**
     * 3. 判定阈值 (Swipe Threshold)
     * 设定 35px 可以在灵敏度与防误触之间取得平衡。
     * 对于大网格（5x9），35-40px 的滑动体验最佳。
     */
    const threshold = 35; 

    // 如果两个轴的位移都没有超过阈值，判定为无效滑动
    if (Math.max(absX, absY) < threshold) {
        return null;
    }

    /**
     * 4. 向量比较
     * 如果 X 轴位移大于 Y 轴，判定为左右移动
     * 否则判定为上下移动
     */
    if (absX > absY) {
        // dx > 0 说明向右滑动，否则向左
        return dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
        // dy > 0 说明向下滑动（屏幕坐标系 Y 向下增加），否则向上
        return dy > 0 ? 'DOWN' : 'UP';
    }
}

/**
 * 辅助函数：计算两个点之间的直线距离 (可选，用于更复杂的动效)
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number}
 */
export function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}