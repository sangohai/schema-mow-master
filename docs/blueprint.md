# Blueprint: schema-mow-master (v3.0 - Canvas 引擎版)

## 1. 渲染管线：60FPS 实时重绘 (Real-time Pipeline)
- **机制**：由 `requestAnimationFrame` 驱动的 `tick()` 主循环。
- **高清适配**：引入 `devicePixelRatio (DPR)` 缩放算法，自动适配 Retina/高分屏，解决 Emoji 模糊问题。
- **性能优化**：全量位图渲染，跳过 DOM 布局计算，渲染延迟降至 1ms 级。

## 2. 平滑算法：线性插值 (Linear Interpolation / Lerp)
- **逻辑位置 (Logic Pos)**：由网格索引 (x, y) 决定，呈离散跳变。
- **视觉位置 (Visual Pos)**：由公式 `V = V + (Target - V) * Factor` 驱动。
- **参数 Factor**：设定为 `0.25`。
- **效果**：推土机在格间移动时产生连贯的平移轨迹，彻底消除“瞬移感”。

## 3. 操控协议：1:1 物理步进同步
- **输入层**：物理步进累加器捕获手指位移。
- **同步率**：手指移动一格的物理宽度，指令即入队。
- **指令缓冲**：支持 3 级 Input Buffer，确保快速划动时不丢指令。