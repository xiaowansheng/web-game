class FroggerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.tileSize = 40;
        this.gridCols = this.canvas.width / this.tileSize;
        this.gridRows = this.canvas.height / this.tileSize;
        
        this.player = {
            x: Math.floor(this.gridCols / 2) * this.tileSize,
            y: (this.gridRows - 1) * this.tileSize,
            width: this.tileSize - 10,
            height: this.tileSize - 10,
            speed: this.tileSize
        };
        
        this.cars = [];
        this.logs = [];
        this.obstacles = [];
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        
        this.carSpeed = 2 + this.level * 0.5;
        this.logSpeed = 1 + this.level * 0.3;
        
        this.initGame();
        this.bindEvents();
        this.gameLoop();
    }
    
    initGame() {
        this.generateCars();
        this.generateLogs();
        this.generateObstacles();
    }
    
    generateCars() {
        this.cars = [];
        const carRows = [1, 2, 3, 4];
        
        carRows.forEach(row => {
            const direction = row % 2 === 0 ? 1 : -1;
            const count = 3 + Math.floor(this.level / 2);
            
            for (let i = 0; i < count; i++) {
                this.cars.push({
                    x: i * (this.canvas.width / count) + Math.random() * 100,
                    y: row * this.tileSize,
                    width: this.tileSize * 1.5,
                    height: this.tileSize - 5,
                    speed: this.carSpeed * direction,
                    color: `hsl(${Math.random() * 360}, 70%, 50%)`
                });
            }
        });
    }
    
    generateLogs() {
        this.logs = [];
        const logRows = [6, 7, 8, 9];
        
        logRows.forEach(row => {
            const direction = row % 2 === 0 ? 1 : -1;
            const count = 2 + Math.floor(this.level / 3);
            
            for (let i = 0; i < count; i++) {
                this.logs.push({
                    x: i * (this.canvas.width / count) + Math.random() * 150,
                    y: row * this.tileSize,
                    width: this.tileSize * 2,
                    height: this.tileSize - 5,
                    speed: this.logSpeed * direction,
                    color: '#8B4513'
                });
            }
        });
    }
    
    generateObstacles() {
        this.obstacles = [];
        // 生成一些随机障碍物
        for (let i = 0; i < 5; i++) {
            this.obstacles.push({
                x: Math.random() * (this.canvas.width - this.tileSize),
                y: (11 + Math.floor(Math.random() * 3)) * this.tileSize,
                width: this.tileSize,
                height: this.tileSize,
                color: '#228B22'
            });
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }
    
    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;
        
        switch (e.key) {
            case 'ArrowUp':
                this.player.y = Math.max(0, this.player.y - this.player.speed);
                break;
            case 'ArrowDown':
                this.player.y = Math.min((this.gridRows - 1) * this.tileSize, this.player.y + this.player.speed);
                break;
            case 'ArrowLeft':
                this.player.x = Math.max(0, this.player.x - this.player.speed);
                break;
            case 'ArrowRight':
                this.player.x = Math.min((this.gridCols - 1) * this.tileSize, this.player.x + this.player.speed);
                break;
        }
        
        this.checkCollisions();
        this.checkWin();
    }
    
    startGame() {
        this.gameState = 'playing';
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    checkCollisions() {
        // 检查与汽车碰撞
        for (const car of this.cars) {
            if (this.isColliding(this.player, car)) {
                this.loseLife();
                return;
            }
        }
        
        // 检查与障碍物碰撞
        for (const obstacle of this.obstacles) {
            if (this.isColliding(this.player, obstacle)) {
                this.loseLife();
                return;
            }
        }
        
        // 检查是否在水上（没有在日志上）
        const isInWater = this.player.y >= 6 * this.tileSize && this.player.y <= 9 * this.tileSize;
        const isOnLog = this.logs.some(log => this.isColliding(this.player, log));
        
        if (isInWater && !isOnLog) {
            this.loseLife();
            return;
        }
        
        // 如果在日志上，随日志移动
        for (const log of this.logs) {
            if (this.isColliding(this.player, log)) {
                this.player.x += log.speed;
                // 防止从边缘掉落
                if (this.player.x < 0 || this.player.x > this.canvas.width - this.player.width) {
                    this.loseLife();
                    return;
                }
                break;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkWin() {
        if (this.player.y === 0) {
            this.score += 100 * this.level;
            this.nextLevel();
        }
    }
    
    nextLevel() {
        this.level++;
        this.carSpeed = 2 + this.level * 0.5;
        this.logSpeed = 1 + this.level * 0.3;
        this.resetPlayer();
        this.initGame();
    }
    
    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameState = 'gameOver';
        } else {
            this.resetPlayer();
        }
    }
    
    resetPlayer() {
        this.player.x = Math.floor(this.gridCols / 2) * this.tileSize;
        this.player.y = (this.gridRows - 1) * this.tileSize;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新汽车位置
        for (const car of this.cars) {
            car.x += car.speed;
            
            // 汽车出界后重新生成
            if (car.speed > 0 && car.x > this.canvas.width) {
                car.x = -car.width;
            } else if (car.speed < 0 && car.x < -car.width) {
                car.x = this.canvas.width;
            }
        }
        
        // 更新日志位置
        for (const log of this.logs) {
            log.x += log.speed;
            
            // 日志出界后重新生成
            if (log.speed > 0 && log.x > this.canvas.width) {
                log.x = -log.width;
            } else if (log.speed < 0 && log.x < -log.width) {
                log.x = this.canvas.width;
            }
        }
        
        this.checkCollisions();
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制汽车
        for (const car of this.cars) {
            this.drawCar(car);
        }
        
        // 绘制日志
        for (const log of this.logs) {
            this.drawLog(log);
        }
        
        // 绘制障碍物
        for (const obstacle of this.obstacles) {
            this.drawObstacle(obstacle);
        }
        
        // 绘制玩家
        this.drawPlayer();
        
        // 绘制游戏状态
        if (this.gameState === 'paused') {
            this.drawPaused();
        } else if (this.gameState === 'gameOver') {
            this.drawGameOver();
        }
    }
    
    drawBackground() {
        // 绘制天空
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.canvas.width, 5 * this.tileSize);
        
        // 绘制道路
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.tileSize, this.canvas.width, 4 * this.tileSize);
        
        // 绘制道路标线
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        for (let y = this.tileSize + this.tileSize / 2; y < 5 * this.tileSize; y += this.tileSize) {
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
        
        // 绘制河流
        this.ctx.fillStyle = '#1e90ff';
        this.ctx.fillRect(0, 6 * this.tileSize, this.canvas.width, 4 * this.tileSize);
        
        // 绘制河岸
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 5 * this.tileSize, this.canvas.width, this.tileSize);
        this.ctx.fillRect(0, 10 * this.tileSize, this.canvas.width, this.tileSize);
        
        // 绘制草地
        this.ctx.fillStyle = '#32cd32';
        this.ctx.fillRect(0, 11 * this.tileSize, this.canvas.width, 4 * this.tileSize);
    }
    
    drawCar(car) {
        this.ctx.fillStyle = car.color;
        this.ctx.fillRect(car.x, car.y, car.width, car.height);
        
        // 绘制车轮
        this.ctx.fillStyle = '#000';
        const wheelRadius = 8;
        this.ctx.beginPath();
        this.ctx.arc(car.x + 10, car.y + car.height - wheelRadius, wheelRadius, 0, Math.PI * 2);
        this.ctx.arc(car.x + car.width - 10, car.y + car.height - wheelRadius, wheelRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawLog(log) {
        this.ctx.fillStyle = log.color;
        this.ctx.fillRect(log.x, log.y, log.width, log.height);
        
        // 绘制日志纹理
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let x = log.x; x < log.x + log.width; x += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, log.y);
            this.ctx.lineTo(x, log.y + log.height);
            this.ctx.stroke();
        }
    }
    
    drawObstacle(obstacle) {
        this.ctx.fillStyle = obstacle.color;
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 绘制青蛙眼睛
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + 10, this.player.y + 10, 5, 0, Math.PI * 2);
        this.ctx.arc(this.player.x + this.player.width - 10, this.player.y + 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x + 12, this.player.y + 10, 2, 0, Math.PI * 2);
        this.ctx.arc(this.player.x + this.player.width - 8, this.player.y + 10, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText(`Level: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new FroggerGame();
});