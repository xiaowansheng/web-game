// 平台跳跃游戏
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const coinsElement = document.getElementById('coins');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 游戏设置
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const COIN_SIZE = 20;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;

// 游戏状态
let player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    velX: 0,
    velY: 0,
    onGround: false,
    canJump: true
};

let platforms = [];
let coins = [];
let keys = {};
let score = 0;
let lives = 3;
let coinsCollected = 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;

// 初始化平台
function initPlatforms() {
    platforms = [];
    
    // 地面
    platforms.push({
        x: 0,
        y: CANVAS_HEIGHT - PLATFORM_HEIGHT,
        width: CANVAS_WIDTH,
        height: PLATFORM_HEIGHT
    });
    
    // 随机平台
    for (let i = 0; i < 10; i++) {
        platforms.push({
            x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
            y: CANVAS_HEIGHT - 100 - i * 50,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT
        });
    }
}

// 初始化金币
function initCoins() {
    coins = [];
    for (let i = 0; i < 5; i++) {
        coins.push({
            x: Math.random() * (CANVAS_WIDTH - COIN_SIZE),
            y: Math.random() * (CANVAS_HEIGHT - 100),
            width: COIN_SIZE,
            height: COIN_SIZE,
            collected: false
        });
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制玩家眼睛
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 32, player.y + 10, 8, 8);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 12, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 34, player.y + 12, 4, 4);
}

// 绘制平台
function drawPlatforms() {
    ctx.fillStyle = '#4CAF50';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// 绘制金币
function drawCoins() {
    ctx.fillStyle = '#ffd700';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + COIN_SIZE / 2, coin.y + COIN_SIZE / 2, COIN_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// 更新玩家
function updatePlayer() {
    if (isPaused || isGameOver) return;
    
    // 应用重力
    player.velY += GRAVITY;
    
    // 水平移动
    player.x += player.velX;
    
    // 边界检查
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > CANVAS_WIDTH) {
        player.x = CANVAS_WIDTH - player.width;
    }
    
    // 垂直移动
    player.y += player.velY;
    
    // 平台碰撞检测
    player.onGround = false;
    platforms.forEach(platform => {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.velY > 0
        ) {
            player.y = platform.y - player.height;
            player.velY = 0;
            player.onGround = true;
            player.canJump = true;
        }
    });
    
    // 金币收集检测
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x + player.width > coin.x &&
            player.x < coin.x + coin.width &&
            player.y + player.height > coin.y &&
            player.y < coin.y + coin.height) {
            
            coin.collected = true;
            coinsCollected++;
            score += 10;
            coinsElement.textContent = coinsCollected;
            scoreElement.textContent = score;
        }
    });
    
    // 游戏结束条件
    if (player.y > CANVAS_HEIGHT) {
        lives--;
        livesElement.textContent = lives;
        
        if (lives <= 0) {
            gameOver();
        } else {
            resetPlayer();
        }
    }
    
    // 胜利条件
    if (player.y < 50) {
        // 可以添加胜利逻辑
    }
}

// 重置玩家位置
function resetPlayer() {
    player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = CANVAS_HEIGHT - 100;
    player.velX = 0;
    player.velY = 0;
    player.onGround = false;
    player.canJump = true;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制背景
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制元素
    drawPlatforms();
    drawCoins();
    drawPlayer();
    
    // 游戏结束显示
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = '24px Arial';
        ctx.fillText('最终分数: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    }
}

// 游戏主循环
function gameLoopFunction() {
    updatePlayer();
    drawGame();
    requestAnimationFrame(gameLoopFunction);
}

// 开始游戏
function startGame() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    lives = 3;
    coinsCollected = 0;
    
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    coinsElement.textContent = coinsCollected;
    
    initPlatforms();
    initCoins();
    resetPlayer();
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// 暂停游戏
function pauseGame() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    isPaused = true;
}

// 键盘控制
function handleKeyDown(e) {
    keys[e.key] = true;
    
    // 跳跃
    if (e.key === ' ' && player.canJump) {
        player.velY = JUMP_FORCE;
        player.canJump = false;
    }
    
    // 左右移动
    if (e.key === 'ArrowLeft') {
        player.velX = -PLAYER_SPEED;
    } else if (e.key === 'ArrowRight') {
        player.velX = PLAYER_SPEED;
    }
    
    // 下键加速下落
    if (e.key === 'ArrowDown') {
        player.velY += 2;
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
    
    // 停止左右移动
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.velX = 0;
    }
}

// 事件监听器
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);

// 初始化游戏
function init() {
    initPlatforms();
    initCoins();
    drawGame();
}

// 启动游戏初始化
init();