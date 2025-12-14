// 赛车游戏

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const speedElement = document.getElementById('speed');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏设置
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
const ROAD_WIDTH = 400;
const ROAD_CENTER = CANVAS_WIDTH / 2;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 100;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 80;
const CAR_SPEED = 8;
const OBSTACLE_SPEED = 5;
const LANES = 3;
const LANE_WIDTH = ROAD_WIDTH / LANES;

// 游戏状态
let playerCar = {
    x: ROAD_CENTER - CAR_WIDTH / 2,
    y: CANVAS_HEIGHT - CAR_HEIGHT - 20,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    lane: Math.floor(LANES / 2)
};

let obstacles = [];
let keys = {};
let score = 0;
let lives = 3;
let speed = 0;
let gameSpeed = 5;
let isPaused = false;
let isGameActive = false;
let gameLoop = null;
let roadPosition = 0;
let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 1500; // 毫秒

// 初始化游戏
function initGame() {
    // 重置游戏状态
    playerCar = {
        x: ROAD_CENTER - CAR_WIDTH / 2,
        y: CANVAS_HEIGHT - CAR_HEIGHT - 20,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        lane: Math.floor(LANES / 2)
    };
    
    obstacles = [];
    score = 0;
    lives = 3;
    speed = 0;
    gameSpeed = 5;
    isPaused = false;
    isGameActive = true;
    roadPosition = 0;
    obstacleSpawnTimer = 0;
    obstacleSpawnInterval = 1500;
    
    // 更新UI
    updateUI();
    
    // 开始游戏循环
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// 绘制道路
function drawRoad() {
    // 绘制天空背景
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制路边草地
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 0, (CANVAS_WIDTH - ROAD_WIDTH) / 2, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - (CANVAS_WIDTH - ROAD_WIDTH) / 2, 0, (CANVAS_WIDTH - ROAD_WIDTH) / 2, CANVAS_HEIGHT);
    
    // 绘制道路
    ctx.fillStyle = '#34495e';
    ctx.fillRect(
        (CANVAS_WIDTH - ROAD_WIDTH) / 2,
        0,
        ROAD_WIDTH,
        CANVAS_HEIGHT
    );
    
    // 绘制道路中心线
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(ROAD_CENTER, (roadPosition % 40) - 40);
    ctx.lineTo(ROAD_CENTER, CANVAS_HEIGHT + 40);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制车道线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    for (let i = 1; i < LANES; i++) {
        const x = (CANVAS_WIDTH - ROAD_WIDTH) / 2 + i * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
}

// 绘制玩家赛车
function drawPlayerCar() {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height);
    
    // 绘制车窗
    ctx.fillStyle = '#3498db';
    ctx.fillRect(playerCar.x + 10, playerCar.y + 10, playerCar.width - 20, playerCar.height - 40);
    
    // 绘制车轮
    ctx.fillStyle = '#34495e';
    // 前轮
    ctx.fillRect(playerCar.x + 5, playerCar.y + playerCar.height - 15, 15, 15);
    ctx.fillRect(playerCar.x + playerCar.width - 20, playerCar.y + playerCar.height - 15, 15, 15);
    // 后轮
    ctx.fillRect(playerCar.x + 5, playerCar.y + 15, 15, 15);
    ctx.fillRect(playerCar.x + playerCar.width - 20, playerCar.y + 15, 15, 15);
    
    // 绘制车灯
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(playerCar.x + 5, playerCar.y + 5, 10, 10);
    ctx.fillRect(playerCar.x + playerCar.width - 15, playerCar.y + 5, 10, 10);
}

// 绘制障碍物
function drawObstacles() {
    ctx.fillStyle = '#9b59b6';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // 绘制障碍物细节
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
        ctx.fillStyle = '#9b59b6';
    });
}

// 更新玩家赛车位置
function updatePlayerCar() {
    // 根据键盘输入移动赛车
    if (keys['ArrowLeft'] && playerCar.lane > 0) {
        playerCar.lane--;
        keys['ArrowLeft'] = false;
    }
    if (keys['ArrowRight'] && playerCar.lane < LANES - 1) {
        playerCar.lane++;
        keys['ArrowRight'] = false;
    }
    
    // 更新赛车x坐标
    playerCar.x = (CANVAS_WIDTH - ROAD_WIDTH) / 2 + playerCar.lane * LANE_WIDTH + LANE_WIDTH / 2 - playerCar.width / 2;
}

// 生成障碍物
function spawnObstacle() {
    const lane = Math.floor(Math.random() * LANES);
    const obstacle = {
        x: (CANVAS_WIDTH - ROAD_WIDTH) / 2 + lane * LANE_WIDTH + LANE_WIDTH / 2 - OBSTACLE_WIDTH / 2,
        y: -OBSTACLE_HEIGHT,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT,
        lane: lane
    };
    obstacles.push(obstacle);
}

// 更新障碍物位置
function updateObstacles(deltaTime) {
    // 更新障碍物位置
    obstacles = obstacles.filter(obstacle => {
        obstacle.y += gameSpeed;
        return obstacle.y < CANVAS_HEIGHT;
    });
    
    // 生成新障碍物
    obstacleSpawnTimer += deltaTime;
    if (obstacleSpawnTimer >= obstacleSpawnInterval) {
        spawnObstacle();
        obstacleSpawnTimer = 0;
    }
}

// 检查碰撞
function checkCollisions() {
    for (const obstacle of obstacles) {
        if (
            playerCar.x < obstacle.x + obstacle.width &&
            playerCar.x + playerCar.width > obstacle.x &&
            playerCar.y < obstacle.y + obstacle.height &&
            playerCar.y + playerCar.height > obstacle.y
        ) {
            // 发生碰撞
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            } else {
                // 重置障碍物
                obstacles = [];
            }
            return;
        }
    }
}

// 更新游戏状态
function updateGame(deltaTime) {
    if (isPaused || !isGameActive) return;
    
    // 更新道路位置
    roadPosition += gameSpeed;
    
    // 更新分数
    score += Math.floor(speed / 10);
    
    // 更新速度
    speed = gameSpeed * 20;
    
    // 增加游戏难度
    gameSpeed += 0.01;
    if (obstacleSpawnInterval > 500) {
        obstacleSpawnInterval -= 0.5;
    }
    
    // 更新游戏元素
    updatePlayerCar();
    updateObstacles(deltaTime);
    checkCollisions();
    
    // 更新UI
    updateUI();
}

// 更新UI
function updateUI() {
    speedElement.textContent = Math.floor(speed);
    scoreElement.textContent = score;
    livesElement.textContent = lives;
}

// 游戏主循环
function gameLoopFunction() {
    const startTime = Date.now();
    
    // 绘制游戏元素
    drawRoad();
    drawObstacles();
    drawPlayerCar();
    
    // 更新游戏状态
    updateGame(16); // 假设60fps
    
    // 继续游戏循环
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// 游戏结束
function gameOver() {
    isGameActive = false;
    isPaused = true;
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ff073a';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('最终分数: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.fillText('最终速度: ' + Math.floor(speed) + ' km/h', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.fillText('点击重置按钮重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
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
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // 检查点击位置对应的车道
    const lane = Math.floor((x - (CANVAS_WIDTH - ROAD_WIDTH) / 2) / LANE_WIDTH);
    if (lane >= 0 && lane < LANES) {
        playerCar.lane = lane;
    }
});

// 按钮事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

// 初始化游戏
function init() {
    // 绘制初始状态
    drawRoad();
    drawPlayerCar();
    
    // 显示开始信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('赛车游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('点击开始按钮或按空格键开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.fillText('使用左右方向键或点击屏幕切换车道', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    ctx.fillText('躲避障碍物，尽可能获得高分', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    
    // 更新UI
    updateUI();
}

// 启动游戏初始化
init();