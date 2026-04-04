export class UIManager {
    constructor(game) {
        this.game = game;
        this.scoreEl = document.getElementById('score-value');
        this.levelEl = document.getElementById('level-name');
        this.modal = new bootstrap.Modal(document.getElementById('game-modal'));
        this.modalText = document.getElementById('modal-content-text');
        this.actionBtn = document.getElementById('modal-action-btn');
        
        document.getElementById('modal-share-btn').onclick = (e) => {
            e.target.blur();
            this.share();
        };
    }

    refresh(score, levelName) {
        this.scoreEl.textContent = score;
        this.levelEl.textContent = levelName;
    }

    showWin(isFinal = false) {
        this.modalText.innerHTML = isFinal 
            ? `<h3>最终得分: ${this.game.score}</h3>完成所有收割任务！`
            : `<h3>当前得分: ${this.game.score}</h3>准备好收割下一块草坪了吗？`;
        
        this.actionBtn.textContent = isFinal ? "重新开始" : "下一关";
        this.actionBtn.onclick = (e) => {
            e.target.blur();
            this.modal.hide();
            setTimeout(() => {
                isFinal ? location.reload() : this.game.nextLevel();
            }, 300);
        };
        this.modal.show();
    }

    share() {
        const text = `Emoji Mow Master 割草太解压了！我拿了 ${this.game.score} 分！🌿🚜`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    }
}