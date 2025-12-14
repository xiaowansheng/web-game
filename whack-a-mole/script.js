class WhackAMoleGame {
    constructor() {
        this.holes = 15;
        this.score = 0;
        this.time = 60;
        this.hits = 0;
        this.totalClicks = 0;
        this.accuracy = 100;
        this.gameRunning = false;
        this.gameOver = false;
        this.moleTimer = null;
        this.gameTimer = null;
        this.activeMoles = new Set();
        
        this.moleShowTime = 1000; // 地鼠显示时间（毫秒）
        this.moleHideTime = 500; // 地鼠隐藏时间（毫秒）
        this.maxActiveMoles = 1;
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.bindEvents();
        this.updateUI();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.holes; i++) {
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.dataset.holeId = i;
            
            const mole = document.createElement('div');
            mole.className = 'mole';
            mole.dataset.holeId = i;
            
            mole.addEventListener('click', () => this.hitMole(i));
            hole.addEventListener('click', (e) => {
                if (e.target === hole) {
                    this.missedClick();
                }
            });
            
            hole.appendChild(mole);
            gameBoard.appendChild(hole);
        }
    }
    
    bindEvents() {
        // 开始按钮
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gameOver = false;
        
        // 禁用开始按钮
        document.getElementById('start-btn').disabled = true;
        
        // 开始游戏计时器
        this.startGameTimer();
        
        // 开始生成地鼠
        this.startMoleGeneration();
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.time--;
            this.updateUI();
            
            if (this.time <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    startMoleGeneration() {
        const generateMole = () => {
            if (!this.gameRunning) return;
            
            // 检查是否可以生成新地鼠
            if (this.activeMoles.size < this.maxActiveMoles) {
                // 随机选择一个没有地鼠的洞
                let holeId;
                do {
                    holeId = Math.floor(Math.random() * this.holes);
                } while (this.activeMoles.has(holeId));
                
                // 显示地鼠
                this.showMole(holeId);
            }
            
            // 随着时间推移，增加地鼠生成速度
            const delay = Math.max(300, 1000 - (60 - this.time) * 10);
            this.moleTimer = setTimeout(generateMole, delay);
        };
        
        generateMole();
    }
    
    showMole(holeId) {
        const mole = document.querySelector(`.mole[data-hole-id="${holeId}"]`);
        mole.classList.add('active');
        this.activeMoles.add(holeId);
        
        // 设置地鼠隐藏时间
        setTimeout(() => {
            this.hideMole(holeId);
        }, this.moleShowTime);
    }
    
    hideMole(holeId) {
        const mole = document.querySelector(`.mole[data-hole-id="${holeId}"]`);
        mole.classList.remove('active');
        this.activeMoles.delete(holeId);
    }
    
    hitMole(holeId) {
        if (!this.gameRunning) return;
        
        // 检查地鼠是否存在
        if (this.activeMoles.has(holeId)) {
            // 增加分数
            this.score += 10;
            this.hits++;
            this.totalClicks++;
            
            // 播放击中动画
            const mole = document.querySelector(`.mole[data-hole-id="${holeId}"]`);
            mole.classList.add('hit');
            
            setTimeout(() => {
                mole.classList.remove('hit');
            }, 500);
            
            // 隐藏地鼠
            this.hideMole(holeId);
            
            // 更新准确率
            this.calculateAccuracy();
            
            // 更新UI
            this.updateUI();
        }
    }
    
    missedClick() {
        if (!this.gameRunning) return;
        
        // 点击空白区域，扣分
        this.score = Math.max(0, this.score - 5);
        this.totalClicks++;
        
        // 更新准确率
        this.calculateAccuracy();
        
        // 更新UI
        this.updateUI();
    }
    
    calculateAccuracy() {
        if (this.totalClicks === 0) {
            this.accuracy = 100;
        } else {
            this.accuracy = Math.round((this.hits / this.totalClicks) * 100);
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        // 清除计时器
        clearInterval(this.gameTimer);
        clearTimeout(this.moleTimer);
        
        // 隐藏所有地鼠
        this.activeMoles.forEach(holeId => {
            this.hideMole(holeId);
        });
        
        // 启用开始按钮
        document.getElementById('start-btn').disabled = false;
        
        // 显示游戏结束信息
        setTimeout(() => {
            alert(`游戏结束！\n最终分数：${this.score}\n击中次数：${this.hits}\n准确率：${this.accuracy}%`);
        }, 100);
    }
    
    restartGame() {
        // 停止当前游戏
        if (this.gameRunning) {
            this.endGame();
        }
        
        // 重置游戏状态
        this.score = 0;
        this.time = 60;
        this.hits = 0;
        this.totalClicks = 0;
        this.accuracy = 100;
        this.gameRunning = false;
        this.gameOver = false;
        this.activeMoles.clear();
        this.moleShowTime = 1000;
        this.maxActiveMoles = 1;
        
        // 隐藏所有地鼠
        document.querySelectorAll('.mole').forEach(mole => {
            mole.classList.remove('active', 'hit');
        });
        
        // 更新UI
        this.updateUI();
        
        // 启用开始按钮
        document.getElementById('start-btn').disabled = false;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.time;
        document.getElementById('hits').textContent = this.hits;
        document.getElementById('accuracy').textContent = `${this.accuracy}%`;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new WhackAMoleGame();
});