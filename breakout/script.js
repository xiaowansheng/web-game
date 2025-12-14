// 打砖块游戏

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏设置
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 6;
const BRICK_COLS = 12;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 20;
const PADDLE_SPEED = 8;
const BALL_SPEED = 5;

// 游戏状态
let paddle = {
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED
};

let ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BALL_RADIUS,
    dx: BALL_SPEED,
    dy: -BALL_SPEED
};

let bricks = [];
let keys = {};
let score = 0;
let level = 1;
let lives = 3;
let isPaused = false;
let isGameActive = false;
let gameLoop = null;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    paddle.y = CANVAS_HEIGHT - 40;
    
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.dx = BALL_SPEED;
    ball.dy = -BALL_SPEED;
    
    score = 0;
    level = 1;
    lives = 3;
    isPaused = false;
    isGameActive = true;
    
    // 更新UI
    scoreElement.textContent = score;
    levelElement.textContent = level;
    livesElement.textContent = lives;
    
    // 生成砖块
    generateBricks();
    
    // 开始游戏循环
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// 生成砖块
function generateBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COLS; c++) {
            bricks[r][c] = {
                x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
                y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                status: 1,
                color: getBrickColor(r)
            };
        }
    }
}

// 获取砖块颜色
function getBrickColor(row) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
    return colors[row % colors.length];
}

// 绘制挡板
function drawPaddle() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// 绘制小球
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

// 绘制砖块
function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const brick = bricks[r][c];
            if (brick.status === 1) {
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
    }
}

// 更新挡板位置
function updatePaddle() {
    if (keys['ArrowLeft'] && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (keys['ArrowRight'] && paddle.x < CANVAS_WIDTH - paddle.width) {
        paddle.x += paddle.speed;
    }
}

// 更新小球位置
function updateBall() {
    // 移动小球
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 墙壁碰撞检测
    if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    
    // 挡板碰撞检测
    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // 计算碰撞点相对于挡板中心的位置
        const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        // 根据碰撞点调整小球反弹角度
        ball.dx = hitPos * BALL_SPEED;
        ball.dy = -Math.abs(ball.dy);
    }
    
    // 底部边界检测
    if (ball.y + ball.radius > CANVAS_HEIGHT) {
        lives--;
        livesElement.textContent = lives;
        
        if (lives <= 0) {
            gameOver();
        } else {
            // 重置小球位置
            ball.x = CANVAS_WIDTH / 2;
            ball.y = CANVAS_HEIGHT / 2;
            ball.dx = BALL_SPEED;
            ball.dy = -BALL_SPEED;
        }
    }
    
    // 砖块碰撞检测
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const brick = bricks[r][c];
            if (brick.status === 1) {
                if (
                    ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height
                ) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;
                    scoreElement.textContent = score;
                    
                    // 检查是否所有砖块都被消除
                    if (checkAllBricksCleared()) {
                        level++;
                        levelElement.textContent = level;
                        generateBricks();
                        // 增加游戏难度
                        ball.dx *= 1.1;
                        ball.dy *= 1.1;
                    }
                }
            }
        }
    }
}

// 检查是否所有砖块都被消除
function checkAllBricksCleared() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            if (bricks[r][c].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// 游戏主循环
function gameLoopFunction() {
    if (isPaused || !isGameActive) {
        gameLoop = requestAnimationFrame(gameLoopFunction);
        return;
    }
    
    // 清除画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制游戏元素
    drawBricks();
    drawPaddle();
    drawBall();
    
    // 更新游戏状态
    updatePaddle();
    updateBall();
    
    // 继续游戏循环
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// 游戏结束
function gameOver() {
    isGameActive = false;
    isPaused = true;
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText('最终分数: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.fillText('最终关卡: ' + level, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    ctx.fillText('点击重置按钮重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
}

// 开始游戏
function startGame() {
    isPaused = false;
    if (!isGameActive) {
        initGame();
    }
}

// 暂停游戏
function pauseGame() {
    if (!isGameActive) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 重置游戏
function resetGame() {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    initGame();
    pauseBtn.textContent = '暂停';
}

// 键盘事件监听器
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // 空格键开始/暂停游戏
    if (e.key === ' ') {
        e.preventDefault();
        if (isGameActive) {
            pauseGame();
        } else {
            startGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 鼠标事件监听器
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.width / 2;
    
    // 限制挡板在画布内
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x > CANVAS_WIDTH - paddle.width) {
        paddle.x = CANVAS_WIDTH - paddle.width;
    }
});

// 按钮事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

// 初始化游戏
function init() {
    // 绘制初始状态
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    generateBricks();
    drawBricks();
    drawPaddle();
    drawBall();
    
    // 显示开始信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('打砖块游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText('点击开始按钮或按空格键开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
}

// 启动游戏初始化
init();