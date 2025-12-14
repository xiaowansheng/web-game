// 太空侵略者游戏

// 获取DOM元素
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// 游戏设置
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 40;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 2;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 11;
const ENEMY_SPACING = 60;
const ENEMY_TOP_MARGIN = 80;

// 游戏状态
let player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    bullets: []
};

let enemies = [];
let enemyBullets = [];
let keys = {};
let score = 0;
let lives = 3;
let level = 1;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let enemyDirection = 1; // 1 向右，-1 向左
let enemyDropDistance = 20;
let gameSpeed = 60; // 帧率

// 初始化游戏
function initGame() {
    // 重置游戏状态
    player = {
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - 60,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: PLAYER_SPEED,
        bullets: []
    };
    
    enemies = [];
    enemyBullets = [];
    score = 0;
    lives = 3;
    level = 1;
    enemyDirection = 1;
    enemyDropDistance = 20;
    isPaused = false;
    isGameOver = false;
    
    // 更新UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    
    // 生成敌人
    generateEnemies();
    
    // 移除游戏结束遮罩
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
    
    // 重置按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = '暂停';
}

// 生成敌人
function generateEnemies() {
    enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
            enemies.push({
                x: col * ENEMY_SPACING + 50,
                y: row * ENEMY_SPACING + ENEMY_TOP_MARGIN,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                speed: ENEMY_SPEED + level * 0.5,
                alive: true,
                color: row === 0 ? '#ff6b6b' : row <= 2 ? '#4ecdc4' : '#45b7aa',
                points: row === 0 ? 30 : row <= 2 ? 20 : 10
            });
        }
    }
}

// 绘制玩家飞船
function drawPlayer() {
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 绘制飞船细节
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 15, player.y - 10, 20, 10);
    ctx.fillRect(player.x + 10, player.y, 30, 5);
}

// 绘制敌人
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制敌人细节
            ctx.fillStyle = '#fff';
            ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
            ctx.fillRect(enemy.x + 30, enemy.y + 5, 5, 5);
            ctx.fillRect(enemy.x + 10, enemy.y + 20, 20, 5);
        }
    });
}

// 绘制子弹
function drawBullets() {
    // 玩家子弹
    ctx.fillStyle = '#ff6b6b';
    player.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // 敌人子弹
    ctx.fillStyle = '#fff';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// 绘制背景
function drawBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制星星背景
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        ctx.fillRect(x, y, 1, 1);
    }
}

// 更新玩家位置
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < CANVAS_WIDTH - player.width) {
        player.x += player.speed;
    }
}

// 更新玩家子弹
function updatePlayerBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.y -= BULLET_SPEED;
        
        // 移除超出屏幕的子弹
        if (bullet.y < -BULLET_HEIGHT) {
            player.bullets.splice(index, 1);
        }
    });
}

// 更新敌人子弹
function updateEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.y += BULLET_SPEED;
        
        // 移除超出屏幕的子弹
        if (bullet.y > CANVAS_HEIGHT) {
            enemyBullets.splice(index, 1);
        }
    });
}

// 更新敌人位置
function updateEnemies() {
    let shouldDrop = false;
    
    // 检查是否需要改变方向
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.alive) {
            if (enemy.x + enemy.width > CANVAS_WIDTH || enemy.x < 0) {
                shouldDrop = true;
                break;
            }
        }
    }
    
    // 改变方向并下降
    if (shouldDrop) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += enemyDropDistance;
            }
        });
    }
    
    // 移动敌人
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.x += enemy.speed * enemyDirection;
        }
    });
    
    // 随机生成敌人子弹
    if (Math.random() < 0.02 * level) {
        const aliveEnemies = enemies.filter(enemy => enemy.alive);
        if (aliveEnemies.length > 0) {
            const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({
                x: randomEnemy.x + randomEnemy.width / 2 - BULLET_WIDTH / 2,
                y: randomEnemy.y + randomEnemy.height,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT
            });
        }
    }
}

// 检测碰撞
function checkCollisions() {
    // 玩家子弹与敌人碰撞
    player.bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (enemy.alive &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // 击中敌人
                enemy.alive = false;
                player.bullets.splice(bulletIndex, 1);
                score += enemy.points;
                scoreElement.textContent = score;
                
                // 检查是否所有敌人都被消灭
                if (enemies.every(enemy => !enemy.alive)) {
                    nextLevel();
                }
            }
        });
    });
    
    // 敌人子弹与玩家碰撞
    enemyBullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            // 击中玩家
            enemyBullets.splice(bulletIndex, 1);
            lives--;
            livesElement.textContent = lives;
            
            if (lives <= 0) {
                gameOver();
            }
        }
    });
    
    // 敌人与玩家碰撞
    enemies.forEach(enemy => {
        if (enemy.alive &&
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            
            // 游戏结束
            gameOver();
        }
        
        // 敌人到达底部
        if (enemy.y + enemy.height > CANVAS_HEIGHT) {
            gameOver();
        }
    });
}

// 玩家射击
function shoot() {
    if (player.bullets.length < 3) {
        player.bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT
        });
    }
}

// 下一关
function nextLevel() {
    level++;
    levelElement.textContent = level;
    generateEnemies();
    
    // 增加游戏难度
    enemies.forEach(enemy => {
        enemy.speed = ENEMY_SPEED + level * 0.5;
    });
}

// 游戏主循环
function gameLoopFunction() {
    if (isPaused || isGameOver) return;
    
    // 清除画布
    drawBackground();
    
    // 更新游戏状态
    updatePlayer();
    updatePlayerBullets();
    updateEnemies();
    updateEnemyBullets();
    checkCollisions();
    
    // 绘制游戏元素
    drawPlayer();
    drawEnemies();
    drawBullets();
}

// 开始游戏
function startGame() {
    initGame();
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // 游戏主循环
    function loop() {
        gameLoopFunction();
        gameLoop = requestAnimationFrame(loop);
    }
    loop();
    
    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = false;
}

// 暂停游戏
function pauseGame() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // 创建游戏结束遮罩
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over show';
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <h2>游戏结束</h2>
            <p>最终分数: ${score}</p>
            <p>等级: ${level}</p>
            <p>剩余生命: ${lives}</p>
            <div>
                <button onclick="startGame()">再来一局</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(gameOverDiv);
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 键盘事件监听器
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && !isPaused && !isGameOver) {
        e.preventDefault();
        shoot();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 按钮事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);

// 初始化游戏
function init() {
    drawBackground();
    drawPlayer();
    drawEnemies();
    pauseBtn.disabled = true;
}

// 启动游戏初始化
init();