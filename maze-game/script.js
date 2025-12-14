class MazeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 迷宫参数
        this.cellSize = 20;
        this.cols = Math.floor(this.width / this.cellSize);
        this.rows = Math.floor(this.height / this.cellSize);
        
        // 游戏状态
        this.score = 0;
        this.time = 0;
        this.steps = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.timerInterval = null;
        this.keys = {};
        
        // 迷宫数据
        this.maze = [];
        this.player = {
            x: this.cellSize / 2,
            y: this.cellSize / 2,
            size: this.cellSize * 0.6
        };
        
        this.exit = {
            x: this.width - this.cellSize / 2,
            y: this.height - this.cellSize / 2
        };
        
        this.init();
    }
    
    init() {
        this.generateMaze();
        this.bindEvents();
        this.gameLoop();
        this.updateUI();
    }
    
    generateMaze() {
        // 初始化迷宫（全部为墙）
        this.maze = Array(this.rows).fill().map(() => Array(this.cols).fill(1));
        
        // 使用深度优先搜索生成迷宫
        this.dfs(0, 0);
        
        // 设置出口
        this.maze[this.rows - 1][this.cols - 1] = 0;
    }
    
    dfs(row, col) {
        // 标记当前单元格为通路
        this.maze[row][col] = 0;
        
        // 定义方向：上、右、下、左
        const directions = [
            { dr: -2, dc: 0 }, // 上
            { dr: 0, dc: 2 },  // 右
            { dr: 2, dc: 0 },  // 下
            { dr: 0, dc: -2 }  // 左
        ];
        
        // 随机打乱方向
        this.shuffleArray(directions);
        
        for (const dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            // 检查是否在边界内且未访问过
            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols && this.maze[newRow][newCol] === 1) {
                // 打通当前单元格与新单元格之间的墙
                this.maze[row + dir.dr / 2][col + dir.dc / 2] = 0;
                // 递归访问新单元格
                this.dfs(newRow, newCol);
            }
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (!this.gameRunning) {
                this.startGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 生成新迷宫按钮
        document.getElementById('generate-btn').addEventListener('click', () => this.generateNewMaze());
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        
        // 开始计时器
        this.startTimer();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.time++;
            this.updateUI();
        }, 1000);
    }
    
    generateNewMaze() {
        // 重置游戏状态
        this.score = 0;
        this.time = 0;
        this.steps = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        // 清除计时器
        clearInterval(this.timerInterval);
        
        // 重置玩家位置
        this.player.x = this.cellSize / 2;
        this.player.y = this.cellSize / 2;
        
        // 生成新迷宫
        this.generateMaze();
        
        // 更新UI
        this.updateUI();
    }
    
    restartGame() {
        // 重置游戏状态
        this.score = 0;
        this.time = 0;
        this.steps = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        // 清除计时器
        clearInterval(this.timerInterval);
        
        // 重置玩家位置
        this.player.x = this.cellSize / 2;
        this.player.y = this.cellSize / 2;
        
        // 更新UI
        this.updateUI();
    }
    
    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.handleInput();
        this.checkWin();
    }
    
    handleInput() {
        const speed = this.cellSize / 5;
        let moved = false;
        
        // 计算玩家所在的单元格
        const playerCol = Math.floor(this.player.x / this.cellSize);
        const playerRow = Math.floor(this.player.y / this.cellSize);
        
        // 上
        if (this.keys['ArrowUp'] || this.keys['w']) {
            const newY = this.player.y - speed;
            const newRow = Math.floor(newY / this.cellSize);
            
            // 检查碰撞
            if (newRow >= 0 && this.maze[newRow][playerCol] === 0) {
                this.player.y = newY;
                moved = true;
            }
        }
        
        // 下
        if (this.keys['ArrowDown'] || this.keys['s']) {
            const newY = this.player.y + speed;
            const newRow = Math.floor(newY / this.cellSize);
            
            // 检查碰撞
            if (newRow < this.rows && this.maze[newRow][playerCol] === 0) {
                this.player.y = newY;
                moved = true;
            }
        }
        
        // 左
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            const newX = this.player.x - speed;
            const newCol = Math.floor(newX / this.cellSize);
            
            // 检查碰撞
            if (newCol >= 0 && this.maze[playerRow][newCol] === 0) {
                this.player.x = newX;
                moved = true;
            }
        }
        
        // 右
        if (this.keys['ArrowRight'] || this.keys['d']) {
            const newX = this.player.x + speed;
            const newCol = Math.floor(newX / this.cellSize);
            
            // 检查碰撞
            if (newCol < this.cols && this.maze[playerRow][newCol] === 0) {
                this.player.x = newX;
                moved = true;
            }
        }
        
        // 限制玩家在画布内
        this.player.x = Math.max(0, Math.min(this.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.height, this.player.y));
        
        // 如果移动了，增加步数
        if (moved) {
            this.steps++;
            this.updateUI();
        }
    }
    
    checkWin() {
        // 检查玩家是否到达出口
        const dx = this.player.x - this.exit.x;
        const dy = this.player.y - this.exit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.cellSize) {
            this.gameOver = true;
            this.gameRunning = false;
            clearInterval(this.timerInterval);
            
            // 计算得分
            this.score = Math.max(0, 1000 - this.time * 10 - this.steps * 5);
            this.updateUI();
            
            // 显示游戏结束信息
            setTimeout(() => {
                alert(`恭喜你！成功走出迷宫！\n用时：${this.time}秒\n步数：${this.steps}\n得分：${this.score}`);
            }, 100);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.time;
        document.getElementById('steps').textContent = this.steps;
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制迷宫
        this.drawMaze();
        
        // 绘制出口
        this.drawExit();
        
        // 绘制玩家
        this.drawPlayer();
    }
    
    drawMaze() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.maze[row][col] === 1) {
                    // 绘制墙
                    this.ctx.fillStyle = '#795548';
                    this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    // 绘制通路
                    this.ctx.fillStyle = '#f5f5f5';
                    this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
                    
                    // 绘制网格线
                    this.ctx.strokeStyle = '#e0e0e0';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.strokeRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
    }
    
    drawExit() {
        // 绘制出口
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(this.exit.x, this.exit.y, this.cellSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🏁', this.exit.x, this.exit.y);
    }
    
    drawPlayer() {
        // 绘制玩家
        this.ctx.fillStyle = '#2196F3';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🧍', this.player.x, this.player.y);
    }
    
    gameLoop() {
        // 更新游戏状态
        this.update();
        
        // 渲染游戏画面
        this.render();
        
        // 循环调用
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MazeGame();
});