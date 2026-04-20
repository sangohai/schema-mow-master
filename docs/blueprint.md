# Blueprint: schema-mow-master (v5.5 - Stable Waterfall Engine)

## 1. 核心架构：双向队列回收 (Bi-directional Row Management)
- **物理映射**：`rows[0]` 始终对应屏幕最上方，`rows[n]` 对应最下方。
- **循环算法**：当 `rows[last].y > ScreenHeight` 时，执行 `pop()` 并使用 `unshift()` 在顶部补充新行，位置参考 `rows[0].y - cellHeight`。
- **结果**：实现了零断层、低内存占用的无限滚动。

## 2. 状态机与再生逻辑 (Regrowth Protocol)
- **Tile 状态**：`FULL` (可割), `EMPTY` (空地), `REGEN` (再生中), `REVEALED` (露出道具)。
- **冲突保护**：若格位处于 `REVEALED` 状态，强制挂起 `REGEN` 计时器，直到道具被收集。

## 3. UI 规范：HUD 全屏沉浸模式
- **层级**：Canvas 铺满 100dvh。UI 采用半透明渐变背景，`absolute` 定位悬浮于 Canvas 之上。
- **交互**：UI 容器设置 `pointer-events: none`，确保用户可以划动 UI 覆盖区域内的草丛。