class PinballGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gameOver = false;
        
        // 球的属性
        this.ball = {
            x: this.width / 2,
            y: this.height - 50,
            radius: 8,
            dx: 0,
            dy: 0,
            speed: 5
        };
        
        // 挡板属性
        this.paddle = {
            x: this.width / 2 - 60,
            y: this.height - 30,
            width: 120,
            height: 15,
            speed: 8,
            dx: 0
        };
        
        // 砖块属性
        this.bricks = [];
        this.brickRowCount = 6;
        this.brickColCount = 10;
        this.brickWidth = 75;
        this.brickHeight = 20;
        this.brickPadding = 5;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 15;
        
        // 键盘状态
        this.keys = {};
        
        // 鼠标位置
        this.mouseX = this.width / 2;
        
        this.init();
    }
    
    init() {
        this.createBricks();
        this.bindEvents();
        this.gameLoop();
    }
    
    createBricks() {
        this.bricks = [];
        for (let r = 0; r < this.brickRowCount; r++) {
            this.bricks[r] = [];
            for (let c = 0; c < this.brickColCount; c++) {
                const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                
                // 根据行数设置不同颜色和分数
                const brickColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
                
                this.bricks[r][c] = {
                    x: brickX,
                    y: brickY,
                    status: 1,
                    color: brickColors[r % brickColors.length],
                    score: (this.brickRowCount - r) * 10
                };
            }
        }
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // 空格键开始游戏
            if (e.key === ' ' && !this.gameRunning) {
                this.startGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.ball.dx = (Math.random() - 0.5) * this.ball.speed * 2;
        this.ball.dy = -this.ball.speed;
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gameOver = false;
        
        // 重置球的位置
        this.ball.x = this.width / 2;
        this.ball.y = this.height - 50;
        this.ball.dx = 0;
        this.ball.dy = 0;
        
        // 重置挡板位置
        this.paddle.x = this.width / 2 - 60;
        
        // 创建新的砖块
        this.createBricks();
        
        // 更新UI
        this.updateUI();
    }
    
    updatePaddle() {
        // 键盘控制
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.paddle.dx = -this.paddle.speed;
        } else if (this.keys['ArrowRight'] || this.keys['d']) {
            this.paddle.dx = this.paddle.speed;
        } else {
            this.paddle.dx = 0;
        }
        
        // 鼠标控制
        const paddleCenter = this.paddle.x + this.paddle.width / 2;
        if (Math.abs(this.mouseX - paddleCenter) > 5) {
            if (this.mouseX < paddleCenter) {
                this.paddle.dx = -this.paddle.speed;
            } else {
                this.paddle.dx = this.paddle.speed;
            }
        }
        
        // 更新挡板位置
        this.paddle.x += this.paddle.dx;
        
        // 边界检测
        if (this.paddle.x < 0) {
            this.paddle.x = 0;
        } else if (this.paddle.x + this.paddle.width > this.width) {
            this.paddle.x = this.width - this.paddle.width;
        }
    }
    
    updateBall() {
        if (!this.gameRunning) return;
        
        // 更新球的位置
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // 左右边界碰撞
        if (this.ball.x + this.ball.radius > this.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        
        // 上边界碰撞
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }
        
        // 下边界碰撞（失去生命）
        if (this.ball.y + this.ball.radius > this.height) {
            this.lives--;
            this.updateUI();
            
            if (this.lives === 0) {
                this.gameOver = true;
                this.gameRunning = false;
                alert(`游戏结束！你的得分：${this.score}`);
                return;
            }
            
            // 重置球的位置
            this.ball.x = this.width / 2;
            this.ball.y = this.height - 50;
            this.ball.dx = 0;
            this.ball.dy = 0;
            this.gameRunning = false;
        }
        
        // 挡板碰撞
        if (
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width
        ) {
            // 根据碰撞位置调整反弹角度
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3; // -60° 到 60°
            
            this.ball.dx = Math.sin(angle) * this.ball.speed;
            this.ball.dy = -Math.cos(angle) * this.ball.speed;
        }
        
        // 砖块碰撞
        this.collisionDetection();
    }
    
    collisionDetection() {
        for (let r = 0; r < this.brickRowCount; r++) {
            for (let c = 0; c < this.brickColCount; c++) {
                const brick = this.bricks[r][c];
                
                if (brick.status === 1) {
                    if (
                        this.ball.x > brick.x &&
                        this.ball.x < brick.x + this.brickWidth &&
                        this.ball.y > brick.y &&
                        this.ball.y < brick.y + this.brickHeight
                    ) {
                        this.ball.dy = -this.ball.dy;
                        brick.status = 0;
                        
                        // 增加分数
                        this.score += brick.score;
                        this.updateUI();
                        
                        // 检查是否所有砖块都被消除
                        this.checkWin();
                    }
                }
            }
        }
    }
    
    checkWin() {
        let allBricksDestroyed = true;
        
        for (let r = 0; r < this.brickRowCount; r++) {
            for (let c = 0; c < this.brickColCount; c++) {
                if (this.bricks[r][c].status === 1) {
                    allBricksDestroyed = false;
                    break;
                }
            }
            if (!allBricksDestroyed) break;
        }
        
        if (allBricksDestroyed) {
            this.level++;
            this.ball.speed += 0.5; // 增加球的速度
            
            // 重置球和挡板位置
            this.ball.x = this.width / 2;
            this.ball.y = this.height - 50;
            this.ball.dx = 0;
            this.ball.dy = 0;
            this.paddle.x = this.width / 2 - 60;
            
            // 创建新的砖块
            this.createBricks();
            
            // 更新UI
            this.updateUI();
            
            // 暂停游戏
            this.gameRunning = false;
            
            alert(`恭喜通过第 ${this.level - 1} 关！进入第 ${this.level} 关。`);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fill();
        this.ctx.strokeStyle = '#45a049';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    drawBricks() {
        for (let r = 0; r < this.brickRowCount; r++) {
            for (let c = 0; c < this.brickColCount; c++) {
                const brick = this.bricks[r][c];
                
                if (brick.status === 1) {
                    this.ctx.beginPath();
                    this.ctx.rect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = brick.color;
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        }
    }
    
    drawStartScreen() {
        if (!this.gameRunning && !this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('按空格键开始游戏', this.width / 2, this.height / 2);
        }
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制游戏元素
        this.drawBricks();
        this.drawPaddle();
        this.drawBall();
        
        // 绘制开始屏幕
        this.drawStartScreen();
    }
    
    gameLoop() {
        // 更新游戏状态
        this.updatePaddle();
        this.updateBall();
        
        // 渲染游戏画面
        this.render();
        
        // 循环调用
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new PinballGame();
});