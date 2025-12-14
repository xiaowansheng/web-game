// 炸弹人游戏

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const bombsElement = document.getElementById('bombs');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏设置
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 40;
const MAP_WIDTH = CANVAS_WIDTH / TILE_SIZE;
const MAP_HEIGHT = CANVAS_HEIGHT / TILE_SIZE;
const PLAYER_SIZE = TILE_SIZE;
const BOMB_SIZE = TILE_SIZE / 2;
const EXPLOSION_RANGE = 3;
const EXPLOSION_DURATION = 300; // 毫秒
const BOMB_DELAY = 2000; // 毫秒
const PLAYER_SPEED = 3;
const ENEMY_SPEED = 2;
const ENEMY_COUNT = 3;

// 方向常量
const DIRECTION = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// 地图单元格类型
const CELL_TYPE = {
    EMPTY: 0,
    WALL: 1,
    BRICK: 2,
    PLAYER: 3,
    ENEMY: 4,
    BOMB: 5,
    EXPLOSION: 6,
    EXIT: 7
};

// 游戏状态
let player = {
    x: TILE_SIZE,
    y: TILE_SIZE,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    direction: DIRECTION.RIGHT,
    speed: PLAYER_SPEED
};

let map = [];
let bombs = [];
let explosions = [];
let enemies = [];
let keys = {};
let score = 0;
let lives = 3;
let level = 1;
let maxBombs = 1;
let currentBombs = 0;
let isPaused = false;
let isGameActive = false;
let gameLoop = null;
let exitPos = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 };

// 初始化游戏
function initGame() {
    // 重置游戏状态
    player = {
        x: TILE_SIZE,
        y: TILE_SIZE,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        direction: DIRECTION.RIGHT,
        speed: PLAYER_SPEED
    };
    
    map = [];
    bombs = [];
    explosions = [];
    enemies = [];
    score = 0;
    lives = 3;
    level = 1;
    maxBombs = 1;
    currentBombs = 0;
    isPaused = false;
    isGameActive = true;
    exitPos = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 };
    
    // 生成地图
    generateMap();
    
    // 生成敌人
    generateEnemies();
    
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
    // 初始化空白地图
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // 边界墙
            if (x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) {
                map[y][x] = CELL_TYPE.WALL;
            } else if (x % 2 === 1 && y % 2 === 1) {
                // 内部不可破坏的墙
                map[y][x] = CELL_TYPE.WALL;
            } else if (Math.random() < 0.7 && !(x === 1 && y === 1) && !(x === 2 && y === 1) && !(x === 1 && y === 2)) {
                // 随机生成砖块
                map[y][x] = CELL_TYPE.BRICK;
            } else {
                map[y][x] = CELL_TYPE.EMPTY;
            }
        }
    }
    
    // 设置出口位置
    map[exitPos.y][exitPos.x] = CELL_TYPE.EXIT;
}

// 生成敌人
function generateEnemies() {
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (map[y][x] !== CELL_TYPE.EMPTY);
        
        enemies.push({
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            direction: Math.floor(Math.random() * 4),
            speed: ENEMY_SPEED,
            lastMove: Date.now(),
            moveDelay: 500 + Math.random() * 500
        });
    }
}

// 绘制地图
function drawMap() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tileType = map[y][x];
            const screenX = x * TILE_SIZE;
            const screenY = y * TILE_SIZE;
            
            switch (tileType) {
                case CELL_TYPE.EMPTY:
                    ctx.fillStyle = '#2c3e50';
                    break;
                case CELL_TYPE.WALL:
                    ctx.fillStyle = '#34495e';
                    break;
                case CELL_TYPE.BRICK:
                    ctx.fillStyle = '#8b4513';
                    break;
                case CELL_TYPE.EXIT:
                    ctx.fillStyle = '#f1c40f';
                    break;
                default:
                    ctx.fillStyle = '#2c3e50';
            }
            
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            
            // 绘制网格线
            ctx.strokeStyle = '#1a252f';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制玩家眼睛
    ctx.fillStyle = '#fff';
    const eyeSize = 6;
    if (player.direction === DIRECTION.UP) {
        ctx.fillRect(player.x + player.width / 4, player.y + eyeSize, eyeSize, eyeSize);
        ctx.fillRect(player.x + player.width * 3 / 4 - eyeSize, player.y + eyeSize, eyeSize, eyeSize);
    } else if (player.direction === DIRECTION.RIGHT) {
        ctx.fillRect(player.x + player.width - eyeSize * 2, player.y + player.height / 4, eyeSize, eyeSize);
        ctx.fillRect(player.x + player.width - eyeSize * 2, player.y + player.height * 3 / 4 - eyeSize, eyeSize, eyeSize);
    } else if (player.direction === DIRECTION.DOWN) {
        ctx.fillRect(player.x + player.width / 4, player.y + player.height - eyeSize * 2, eyeSize, eyeSize);
        ctx.fillRect(player.x + player.width * 3 / 4 - eyeSize, player.y + player.height - eyeSize * 2, eyeSize, eyeSize);
    } else {
        ctx.fillRect(player.x + eyeSize, player.y + player.height / 4, eyeSize, eyeSize);
        ctx.fillRect(player.x + eyeSize, player.y + player.height * 3 / 4 - eyeSize, eyeSize, eyeSize);
    }
}

// 绘制炸弹
function drawBombs() {
    bombs.forEach(bomb => {
        const timeLeft = bomb.delay - (Date.now() - bomb.placedAt);
        const progress = timeLeft / bomb.delay;
        
        // 炸弹主体
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(bomb.x + TILE_SIZE / 2, bomb.y + TILE_SIZE / 2, BOMB_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // 炸弹倒计时指示器
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(timeLeft / 1000), bomb.x + TILE_SIZE / 2, bomb.y + TILE_SIZE / 2 + 4);
        
        // 闪烁效果
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
        ctx.beginPath();
        ctx.arc(bomb.x + TILE_SIZE / 2, bomb.y + TILE_SIZE / 2, BOMB_SIZE * progress, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 绘制爆炸效果
function drawExplosions() {
    explosions.forEach(explosion => {
        const timeLeft = explosion.duration - (Date.now() - explosion.startTime);
        const progress = timeLeft / explosion.duration;
        
        ctx.fillStyle = `rgba(255, 165, 0, ${progress})`;
        explosion.parts.forEach(part => {
            ctx.fillRect(part.x * TILE_SIZE, part.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });
    });
}

// 绘制敌人
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 绘制敌人眼睛
        ctx.fillStyle = '#fff';
        const eyeSize = 6;
        if (enemy.direction === DIRECTION.UP) {
            ctx.fillRect(enemy.x + enemy.width / 4, enemy.y + eyeSize, eyeSize, eyeSize);
            ctx.fillRect(enemy.x + enemy.width * 3 / 4 - eyeSize, enemy.y + eyeSize, eyeSize, eyeSize);
        } else if (enemy.direction === DIRECTION.RIGHT) {
            ctx.fillRect(enemy.x + enemy.width - eyeSize * 2, enemy.y + enemy.height / 4, eyeSize, eyeSize);
            ctx.fillRect(enemy.x + enemy.width - eyeSize * 2, enemy.y + enemy.height * 3 / 4 - eyeSize, eyeSize, eyeSize);
        } else if (enemy.direction === DIRECTION.DOWN) {
            ctx.fillRect(enemy.x + enemy.width / 4, enemy.y + enemy.height - eyeSize * 2, eyeSize, eyeSize);
            ctx.fillRect(enemy.x + enemy.width * 3 / 4 - eyeSize, enemy.y + enemy.height - eyeSize * 2, eyeSize, eyeSize);
        } else {
            ctx.fillRect(enemy.x + eyeSize, enemy.y + enemy.height / 4, eyeSize, eyeSize);
            ctx.fillRect(enemy.x + eyeSize, enemy.y + enemy.height * 3 / 4 - eyeSize, eyeSize, eyeSize);
        }
    });
}

// 更新玩家位置
function updatePlayer() {
    let newX = player.x;
    let newY = player.y;
    
    if (keys['KeyW'] || keys['ArrowUp']) {
        newY -= player.speed;
        player.direction = DIRECTION.UP;
    } else if (keys['KeyD'] || keys['ArrowRight']) {
        newX += player.speed;
        player.direction = DIRECTION.RIGHT;
    } else if (keys['KeyS'] || keys['ArrowDown']) {
        newY += player.speed;
        player.direction = DIRECTION.DOWN;
    } else if (keys['KeyA'] || keys['ArrowLeft']) {
        newX -= player.speed;
        player.direction = DIRECTION.LEFT;
    }
    
    // 边界检查
    newX = Math.max(0, Math.min(CANVAS_WIDTH - player.width, newX));
    newY = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, newY));
    
    // 碰撞检测
    if (!checkCollision(newX, newY, player.width, player.height)) {
        player.x = newX;
        player.y = newY;
    }
    
    // 检查是否到达出口
    checkExit();
}

// 放置炸弹
function placeBomb() {
    if (currentBombs >= maxBombs) return;
    
    // 计算炸弹的网格位置
    const gridX = Math.floor(player.x / TILE_SIZE);
    const gridY = Math.floor(player.y / TILE_SIZE);
    
    // 检查位置是否可以放置炸弹
    if (map[gridY][gridX] === CELL_TYPE.EMPTY || map[gridY][gridX] === CELL_TYPE.PLAYER) {
        const bomb = {
            x: gridX * TILE_SIZE,
            y: gridY * TILE_SIZE,
            gridX: gridX,
            gridY: gridY,
            delay: BOMB_DELAY,
            placedAt: Date.now(),
            range: EXPLOSION_RANGE
        };
        
        bombs.push(bomb);
        currentBombs++;
        map[gridY][gridX] = CELL_TYPE.BOMB;
        
        // 炸弹爆炸计时器
        setTimeout(() => explodeBomb(bomb), BOMB_DELAY);
    }
}

// 炸弹爆炸
function explodeBomb(bomb) {
    // 从地图中移除炸弹
    map[bomb.gridY][bomb.gridX] = CELL_TYPE.EMPTY;
    currentBombs--;
    
    // 计算爆炸范围
    const explosionParts = [];
    
    // 中心位置
    explosionParts.push({ x: bomb.gridX, y: bomb.gridY });
    
    // 四个方向的爆炸范围
    const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 1, dy: 0 },  // 右
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }   // 左
    ];
    
    directions.forEach(dir => {
        for (let i = 1; i <= bomb.range; i++) {
            const x = bomb.gridX + dir.dx * i;
            const y = bomb.gridY + dir.dy * i;
            
            // 检查边界
            if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
                break;
            }
            
            const cellType = map[y][x];
            
            // 添加到爆炸部分
            explosionParts.push({ x: x, y: y });
            
            // 如果碰到墙或砖块，停止该方向的爆炸
            if (cellType === CELL_TYPE.WALL) {
                break;
            } else if (cellType === CELL_TYPE.BRICK) {
                // 破坏砖块
                map[y][x] = CELL_TYPE.EMPTY;
                // 有几率生成奖励
                if (Math.random() < 0.3) {
                    // 这里可以添加奖励生成逻辑
                }
                break;
            }
        }
    });
    
    // 创建爆炸效果
    const explosion = {
        parts: explosionParts,
        startTime: Date.now(),
        duration: EXPLOSION_DURATION
    };
    explosions.push(explosion);
    
    // 检查爆炸是否击中敌人或玩家
    checkExplosionCollision(explosionParts);
    
    // 移除爆炸效果
    setTimeout(() => {
        explosions = explosions.filter(e => e !== explosion);
    }, EXPLOSION_DURATION);
}

// 更新炸弹和爆炸
function updateBombs() {
    // 移除过期的炸弹
    bombs = bombs.filter(bomb => Date.now() - bomb.placedAt < bomb.delay);
}

// 更新爆炸效果
function updateExplosions() {
    // 移除过期的爆炸
    explosions = explosions.filter(explosion => Date.now() - explosion.startTime < explosion.duration);
}

// 检查碰撞
function checkCollision(x, y, width, height) {
    const startX = Math.floor(x / TILE_SIZE);
    const startY = Math.floor(y / TILE_SIZE);
    const endX = Math.ceil((x + width) / TILE_SIZE);
    const endY = Math.ceil((y + height) / TILE_SIZE);
    
    for (let mapY = startY; mapY < endY; mapY++) {
        for (let mapX = startX; mapX < endX; mapX++) {
            if (mapY >= 0 && mapY < MAP_HEIGHT && mapX >= 0 && mapX < MAP_WIDTH) {
                const cell = map[mapY][mapX];
                if (cell === CELL_TYPE.WALL || cell === CELL_TYPE.BRICK || cell === CELL_TYPE.BOMB) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// 检查爆炸碰撞
function checkExplosionCollision(explosionParts) {
    // 检查玩家是否被击中
    const playerGridX = Math.floor(player.x / TILE_SIZE);
    const playerGridY = Math.floor(player.y / TILE_SIZE);
    
    for (const part of explosionParts) {
        if (part.x === playerGridX && part.y === playerGridY) {
            // 玩家被击中
            lives--;
            updateUI();
            if (lives <= 0) {
                gameOver();
            } else {
                // 重置玩家位置
                player.x = TILE_SIZE;
                player.y = TILE_SIZE;
            }
            break;
        }
    }
    
    // 检查敌人是否被击中
    enemies = enemies.filter(enemy => {
        const enemyGridX = Math.floor(enemy.x / TILE_SIZE);
        const enemyGridY = Math.floor(enemy.y / TILE_SIZE);
        
        for (const part of explosionParts) {
            if (part.x === enemyGridX && part.y === enemyGridY) {
                // 敌人被击中
                score += 100;
                updateUI();
                return false;
            }
        }
        return true;
    });
    
    // 如果所有敌人都被消灭，显示出口
    if (enemies.length === 0) {
        map[exitPos.y][exitPos.x] = CELL_TYPE.EXIT;
    }
}

// 更新敌人
function updateEnemies() {
    enemies.forEach(enemy => {
        if (Date.now() - enemy.lastMove < enemy.moveDelay) return;
        
        let newX = enemy.x;
        let newY = enemy.y;
        
        // 随机移动方向
        if (Math.random() < 0.2) {
            enemy.direction = Math.floor(Math.random() * 4);
        }
        
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
        
        // 边界检查
        newX = Math.max(0, Math.min(CANVAS_WIDTH - enemy.width, newX));
        newY = Math.max(0, Math.min(CANVAS_HEIGHT - enemy.height, newY));
        
        // 碰撞检测
        if (!checkCollision(newX, newY, enemy.width, enemy.height)) {
            enemy.x = newX;
            enemy.y = newY;
            enemy.lastMove = Date.now();
        } else {
            // 改变方向
            enemy.direction = Math.floor(Math.random() * 4);
            enemy.lastMove = Date.now();
        }
        
        // 检查是否碰到玩家
        if (checkPlayerEnemyCollision(enemy)) {
            lives--;
            updateUI();
            if (lives <= 0) {
                gameOver();
            } else {
                // 重置玩家位置
                player.x = TILE_SIZE;
                player.y = TILE_SIZE;
            }
        }
    });
}

// 检查玩家和敌人碰撞
function checkPlayerEnemyCollision(enemy) {
    return (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
    );
}

// 生成敌人
function generateEnemies() {
    enemies = [];
    for (let i = 0; i < ENEMY_COUNT; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (map[y][x] !== CELL_TYPE.EMPTY || (x === 1 && y === 1));
        
        enemies.push({
            x: x * TILE_SIZE,
            y: y * TILE_SIZE,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            direction: Math.floor(Math.random() * 4),
            speed: ENEMY_SPEED,
            lastMove: Date.now(),
            moveDelay: 500 + Math.random() * 500
        });
    }
}

// 检查是否到达出口
function checkExit() {
    const playerGridX = Math.floor(player.x / TILE_SIZE);
    const playerGridY = Math.floor(player.y / TILE_SIZE);
    
    if (playerGridX === exitPos.x && playerGridY === exitPos.y) {
        // 进入下一关
        level++;
        updateUI();
        generateMap();
        generateEnemies();
        player.x = TILE_SIZE;
        player.y = TILE_SIZE;
        
        // 增加难度
        maxBombs = Math.min(3, Math.floor(level / 2) + 1);
    }
}

// 更新UI
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    bombsElement.textContent = maxBombs - currentBombs;
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
    drawMap();
    drawPlayer();
    drawBombs();
    drawExplosions();
    drawEnemies();
    
    // 更新游戏状态
    updatePlayer();
    updateBombs();
    updateExplosions();
    updateEnemies();
    
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
    
    // 空格键放置炸弹
    if (e.code === 'Space') {
        e.preventDefault();
        if (isGameActive && !isPaused) {
            placeBomb();
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
    drawPlayer();
    
    // 显示开始信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#3498db';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('炸弹人游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('点击开始按钮或按空格键开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText('使用WASD或方向键移动', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText('空格键放置炸弹', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.fillText('炸掉敌人和障碍物，到达终点', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    
    // 更新UI
    updateUI();
}

// 启动游戏初始化
init();