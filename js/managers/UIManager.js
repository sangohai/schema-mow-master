/**
 * UIManager.js
 * 负责 UI 显示、分数刷新及模态框控制
 */
export class UIManager {
    constructor(game) {
        this.game = game;
        this.scoreEl = document.getElementById('score-value');
        this.levelEl = document.getElementById('level-name');
        
        // 绑定模态框
        this.modalEl = document.getElementById('game-modal');
        this.modal = new bootstrap.Modal(this.modalEl);
        this.modalText = document.getElementById('modal-content-text');
        
        // 绑定按钮 (增加防御性检查)
        this.actionBtn = document.getElementById('modal-action-btn');
        this.shareBtn = document.getElementById('modal-share-btn');

        if (this.shareBtn) {
            this.shareBtn.onclick = (e) => {
                e.target.blur();
                this.share();
            };
        }
    }

    refresh(score, levelName) {
        if (this.scoreEl) this.scoreEl.textContent = score;
        if (this.levelEl) this.levelEl.textContent = levelName;
    }

    showWin(isFinal = false) {
        this.modalText.innerHTML = isFinal 
            ? `<h3>最终得分: ${this.game.score}</h3>感谢游玩，收割大师！`
            : `<h3>当前得分: ${this.game.score}</h3>已完成本关收集任务！`;
        
        if (this.actionBtn) {
            this.actionBtn.textContent = isFinal ? "重新开始" : "进入下一关";
            this.actionBtn.onclick = (e) => {
                e.target.blur();
                this.modal.hide();
                setTimeout(() => {
                    isFinal ? location.reload() : this.game.nextLevel();
                }, 300);
            };
        }
        this.modal.show();
    }

    share() {
        const text = `我在 #MowMaster 割草进化版中拿到了 ${this.game.score} 分！超级舒压！🌿💎`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    }
}