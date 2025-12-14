// 坦克大战游戏

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏设置
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TANK_SIZE = 40;
const BULLET_SIZE = 8;
const BULLET_SPEED = 10;
const TANK_SPEED = 3;
const ENEMY_SPEED = 2;
const ENEMY_COUNT = 5;
const MAP_SIZE = 20;
const CELL_SIZE = CANVAS_WIDTH / MAP_SIZE;

// 方向常量
const DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 游戏状态
let playerTank = {
    x: CANVAS_WIDTH / 2 - TANK_SIZE / 2,
    y: CANVAS_HEIGHT - TANK_SIZE - 20,
    width: TANK_SIZE,
    height: TANK_SIZE,
    direction: DIRECTION.UP,
    speed: TANK_SPEED
};

let bullets = [];
let enemyBullets = [];
let enemies = [];
let map = [];
let keys = {};
let score = 0;
let lives = 3;
let level = 1;
let isPaused = false;
let isGameActive = false;
let gameLoop = null;
let enemySpawnTimer = 0;
let enemySpawnInterval = 2000; // 毫秒

// 初始化游戏
function initGame() {
    // 重置游戏状态
    playerTank = {
        x: CANVAS_WIDTH / 2 - TANK_SIZE / 2,
        y: CANVAS_HEIGHT - TANK_SIZE - 20,
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: DIRECTION.UP,
        speed: TANK_SPEED
    };
    
    bullets = [];
    enemyBullets = [];
    enemies = [];
    score = 0;
    lives = 3;
    level = 1;
    isPaused = false;
    isGameActive = true;
    enemySpawnTimer = 0;
    enemySpawnInterval = 2000;
    
    // 生成地图
    generateMap();
    
    // 更新UI
    updateUI();
    
    // 开始游戏循环
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// 生成地图
function generateMap() {
    map = [];
    
    // 初始化空白地图
    for (let i = 0; i < MAP_SIZE; i++) {
        map[i] = [];
        for (let j = 0; j < MAP_SIZE; j++) {
            map[i][j] = 0; // 0 = 空地
        }
    }
    
    // 生成边界墙
    for (let i = 0; i < MAP_SIZE; i++) {
        map[0][i] = 1; // 1 = 不可破坏的墙
        map[MAP_SIZE - 1][i] = 1;
        map[i][0] = 1;
        map[i][MAP_SIZE - 1] = 1;
    }
    
    // 生成随机墙壁
    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        const y = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        // 避免在玩家出生点和基地附近生成墙壁
        if (x > 6 && x < 14 && y > 14) continue; // 玩家出生点
        if (x > 8 && x < 12 && y > 16) continue; // 基地附近
        map[y][x] = 2; // 2 = 可破坏的墙
    }
    
    // 生成基地
    map[18][9] = 3; // 3 = 基地
    map[18][10] = 3;
    map[19][9] = 3;
    map[19][10] = 3;
}

// 绘制地图
function drawMap() {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = map[y][x];
            switch (cell) {
                case 1: // 不可破坏的墙
                    ctx.fillStyle = '#666';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
                    break;
                case 2: // 可破坏的墙
                    ctx.fillStyle = '#8b4513';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
                    break;
                case 3: // 基地
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
                    break;
            }
        }
    }
}

// 绘制坦克
function drawTank(tank, color) {
    ctx.fillStyle = color;
    ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
    
    // 绘制炮管
    const centerX = tank.x + tank.width / 2;
    const centerY = tank.y + tank.height / 2;
    
    ctx.fillStyle = color;
    switch (tank.direction) {
        case DIRECTION.UP:
            ctx.fillRect(centerX - 2, tank.y, 4, 15);
            break;
        case DIRECTION.RIGHT:
            ctx.fillRect(tank.x + tank.width - 15, centerY - 2, 15, 4);
            break;
        case DIRECTION.DOWN:
            ctx.fillRect(centerX - 2, tank.y + tank.height - 15, 4, 15);
            break;
        case DIRECTION.LEFT:
            ctx.fillRect(tank.x, centerY - 2, 15, 4);
            break;
    }
    
    // 绘制坦克中心
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - 8, centerY - 8, 16, 16);
}

// 绘制玩家坦克
function drawPlayerTank() {
    drawTank(playerTank, '#2ecc71');
}

// 绘制敌人坦克
function drawEnemies() {
    enemies.forEach(enemy => {
        drawTank(enemy, '#e74c3c');
    });
}

// 绘制子弹
function drawBullets() {
    // 玩家子弹
    ctx.fillStyle = '#f1c40f';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE);
    });
    
    // 敌人子弹
    ctx.fillStyle = '#9b59b6';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE);
    });
}

// 更新玩家坦克
function updatePlayerTank() {
    // 根据键盘输入移动坦克
    let newX = playerTank.x;
    let newY = playerTank.y;
    
    if (keys['KeyW'] || keys['ArrowUp']) {
        newY -= playerTank.speed;
        playerTank.direction = DIRECTION.UP;
    } else if (keys['KeyD'] || keys['ArrowRight']) {
        newX += playerTank.speed;
        playerTank.direction = DIRECTION.RIGHT;
    } else if (keys['KeyS'] || keys['ArrowDown']) {
        newY += playerTank.speed;
        playerTank.direction = DIRECTION.DOWN;
    } else if (keys['KeyA'] || keys['ArrowLeft']) {
        newX -= playerTank.speed;
        playerTank.direction = DIRECTION.LEFT;
    }
    
    // 检查碰撞
    if (!checkCollision(newX, newY, playerTank.width, playerTank.height)) {
        playerTank.x = newX;
        playerTank.y = newY;
    }
}

// 生成敌人
function spawnEnemy() {
    const spawnX = [0, CANVAS_WIDTH - TANK_SIZE];
    const spawnY = [0, CANVAS_HEIGHT / 2 - TANK_SIZE / 2];
    
    const enemy = {
        x: spawnX[Math.floor(Math.random() * spawnX.length)],
        y: spawnY[Math.floor(Math.random() * spawnY.length)],
        width: TANK_SIZE,
        height: TANK_SIZE,
        direction: Math.floor(Math.random() * 4),
        speed: ENEMY_SPEED,
        shootTimer: 0,
        shootInterval: 1500 + Math.random() * 1500
    };
    enemies.push(enemy);
}

// 更新敌人
function updateEnemies(deltaTime) {
    // 更新敌人位置
    enemies = enemies.filter(enemy => {
        // 敌人AI移动
        let newX = enemy.x;
        let newY = enemy.y;
        
        // 简单AI：随机移动或向玩家方向移动
        if (Math.random() < 0.1) {
            enemy.direction = Math.floor(Math.random() * 4);
        } else {
            // 向玩家方向移动
            if (playerTank.x > enemy.x) {
                enemy.direction = DIRECTION.RIGHT;
            } else if (playerTank.x < enemy.x) {
                enemy.direction = DIRECTION.LEFT;
            } else if (playerTank.y > enemy.y) {
                enemy.direction = DIRECTION.DOWN;
            } else {
                enemy.direction = DIRECTION.UP;
            }
        }
        
        // 根据方向移动
        switch (enemy.direction) {
            case DIRECTION.UP:
                newY -= enemy.speed;
                break;
            case DIRECTION.RIGHT:
                newX += enemy.speed;
                break;
            case DIRECTION.DOWN:
                newY += enemy.speed;
                break;
            case DIRECTION.LEFT:
                newX -= enemy.speed;
                break;
        }
        
        // 检查碰撞
        if (!checkCollision(newX, newY, enemy.width, enemy.height)) {
            enemy.x = newX;
            enemy.y = newY;
        }
        
        // 敌人射击
        enemy.shootTimer += deltaTime;
        if (enemy.shootTimer >= enemy.shootInterval) {
            shootEnemyBullet(enemy);
            enemy.shootTimer = 0;
            enemy.shootInterval = 1500 + Math.random() * 1500;
        }
        
        return enemy.y < CANVAS_HEIGHT;
    });
    
    // 生成新敌人
    if (enemies.length < ENEMY_COUNT) {
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer >= enemySpawnInterval) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }
    }
}

// 玩家射击
function shootBullet() {
    const bullet = {
        x: playerTank.x + playerTank.width / 2 - BULLET_SIZE / 2,
        y: playerTank.y + playerTank.height / 2 - BULLET_SIZE / 2,
        direction: playerTank.direction
    };
    bullets.push(bullet);
}

// 敌人射击
function shootEnemyBullet(enemy) {
    const bullet = {
        x: enemy.x + enemy.width / 2 - BULLET_SIZE / 2,
        y: enemy.y + enemy.height / 2 - BULLET_SIZE / 2,
        direction: enemy.direction
    };
    enemyBullets.push(bullet);
}

// 更新子弹位置
function updateBullets() {
    // 更新玩家子弹
    bullets = bullets.filter(bullet => {
        switch (bullet.direction) {
            case DIRECTION.UP:
                bullet.y -= BULLET_SPEED;
                break;
            case DIRECTION.RIGHT:
                bullet.x += BULLET_SPEED;
                break;
            case DIRECTION.DOWN:
                bullet.y += BULLET_SPEED;
                break;
            case DIRECTION.LEFT:
                bullet.x -= BULLET_SPEED;
                break;
        }
        
        // 检查子弹碰撞
        if (checkBulletCollision(bullet, bullets.indexOf(bullet), true)) {
            return false;
        }
        
        return bullet.x > 0 && bullet.x < CANVAS_WIDTH && bullet.y > 0 && bullet.y < CANVAS_HEIGHT;
    });
    
    // 更新敌人子弹
    enemyBullets = enemyBullets.filter(bullet => {
        switch (bullet.direction) {
            case DIRECTION.UP:
                bullet.y -= BULLET_SPEED;
                break;
            case DIRECTION.RIGHT:
                bullet.x += BULLET_SPEED;
                break;
            case DIRECTION.DOWN:
                bullet.y += BULLET_SPEED;
                break;
            case DIRECTION.LEFT:
                bullet.x -= BULLET_SPEED;
                break;
        }
        
        // 检查子弹碰撞
        if (checkBulletCollision(bullet, enemyBullets.indexOf(bullet), false)) {
            return false;
        }
        
        return bullet.x > 0 && bullet.x < CANVAS_WIDTH && bullet.y > 0 && bullet.y < CANVAS_HEIGHT;
    });
}

// 检查碰撞
function checkCollision(x, y, width, height) {
    // 检查地图碰撞
    const startX = Math.floor(x / CELL_SIZE);
    const startY = Math.floor(y / CELL_SIZE);
    const endX = Math.ceil((x + width) / CELL_SIZE);
    const endY = Math.ceil((y + height) / CELL_SIZE);
    
    for (let mapY = startY; mapY < endY; mapY++) {
        for (let mapX = startX; mapX < endX; mapX++) {
            if (mapY >= 0 && mapY < MAP_SIZE && mapX >= 0 && mapX < MAP_SIZE) {
                const cell = map[mapY][mapX];
                if (cell === 1 || cell === 2 || cell === 3) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// 检查子弹碰撞
function checkBulletCollision(bullet, index, isPlayerBullet) {
    // 检查与地图碰撞
    const mapX = Math.floor(bullet.x / CELL_SIZE);
    const mapY = Math.floor(bullet.y / CELL_SIZE);
    
    if (mapY >= 0 && mapY < MAP_SIZE && mapX >= 0 && mapX < MAP_SIZE) {
        const cell = map[mapY][mapX];
        if (cell === 1) {
            // 不可破坏的墙，子弹消失
            if (isPlayerBullet) {
                bullets.splice(index, 1);
            } else {
                enemyBullets.splice(index, 1);
            }
            return true;
        } else if (cell === 2) {
            // 可破坏的墙，墙消失，子弹消失
            map[mapY][mapX] = 0;
            if (isPlayerBullet) {
                bullets.splice(index, 1);
            } else {
                enemyBullets.splice(index, 1);
            }
            return true;
        } else if (cell === 3) {
            // 基地被击中，游戏结束
            gameOver();
            return true;
        }
    }
    
    // 检查与坦克碰撞
    if (isPlayerBullet) {
        // 玩家子弹击中敌人
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + BULLET_SIZE > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + BULLET_SIZE > enemy.y
            ) {
                enemies.splice(i, 1);
                bullets.splice(index, 1);
                score += 100;
                updateUI();
                return true;
            }
        }
    } else {
        // 敌人子弹击中玩家
        if (
            bullet.x < playerTank.x + playerTank.width &&
            bullet.x + BULLET_SIZE > playerTank.x &&
            bullet.y < playerTank.y + playerTank.height &&
            bullet.y + BULLET_SIZE > playerTank.y
        ) {
            enemyBullets.splice(index, 1);
            lives--;
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            }
            return true;
        }
    }
    
    return false;
}

// 更新UI
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
}

// 游戏主循环
function gameLoopFunction() {
    const startTime = Date.now();
    
    if (isPaused || !isGameActive) {
        gameLoop = requestAnimationFrame(gameLoopFunction);
        return;
    }
    
    // 清除画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制游戏元素
    drawMap();
    drawPlayerTank();
    drawEnemies();
    drawBullets();
    
    // 更新游戏状态
    updatePlayerTank();
    updateEnemies(16);
    updateBullets();
    
    // 检查是否所有敌人都被消灭
    if (enemies.length === 0) {
        level++;
        updateUI();
        generateMap();
        enemySpawnInterval = Math.max(500, enemySpawnInterval - 100);
    }
    
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
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('最终分数: ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.fillText('最终关卡: ' + level, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
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
    keys[e.code] = true;
    
    // 空格键射击
    if (e.code === 'Space') {
        e.preventDefault();
        if (isGameActive && !isPaused) {
            shootBullet();
        }
    }
    
    // 空格键开始/暂停游戏
    if (e.code === 'Space' && !isGameActive) {
        e.preventDefault();
        startGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 按钮事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

// 初始化游戏
function init() {
    // 生成地图
    generateMap();
    
    // 绘制初始状态
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawMap();
    drawPlayerTank();
    
    // 显示开始信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#2ecc71';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('坦克大战', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('点击开始按钮或按空格键开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.fillText('使用WASD或方向键移动坦克', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
    ctx.fillText('空格键射击，保护基地', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    
    // 更新UI
    updateUI();
}

// 启动游戏初始化
init();