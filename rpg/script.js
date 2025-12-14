// 角色扮演游戏
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const hpElement = document.getElementById('hp');
const maxHpElement = document.getElementById('max-hp');
const mpElement = document.getElementById('mp');
const maxMpElement = document.getElementById('max-mp');
const levelElement = document.getElementById('level');
const expElement = document.getElementById('exp');
const maxExpElement = document.getElementById('max-exp');
const goldElement = document.getElementById('gold');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const gameMessages = document.getElementById('game-messages');

// 游戏状态
let gameRunning = true;
let score = 0;

// 角色对象
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 5,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    level: 1,
    exp: 0,
    gold: 0,
    direction: 'right',
    color: '#4CAF50',
    attacking: false,
    attackCooldown: 0,
    skillCooldowns: [0, 0, 0]
};

// 键盘状态
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
    '1': false,
    '2': false,
    '3': false
};

// 敌人数组
let enemies = [];
// 宝石数组
let gems = [];
// 攻击数组
let attacks = [];

// 游戏设置
const ENEMY_SPAWN_RATE = 0.02;
const GEM_SPAWN_RATE = 0.01;
const ENEMY_SPEED = 2;
const GEM_VALUE = 10;
const ATTACK_DURATION = 30;
const SKILL_COOLDOWNS = [0, 100, 150]; // 技能冷却时间（帧）

// 初始化游戏
function initGame() {
    score = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.exp = 0;
    player.level = 1;
    player.gold = 0;
    player.attackCooldown = 0;
    player.skillCooldowns = [0, 0, 0];
    
    enemies = [];
    gems = [];
    attacks = [];
    
    updateUI();
    draw();
    
    // 添加初始消息
    addMessage('游戏开始！使用WASD或方向键移动，空格键攻击，数字键1-3使用技能。');
}

// 更新UI
function updateUI() {
    hpElement.textContent = player.hp;
    maxHpElement.textContent = player.maxHp;
    mpElement.textContent = player.mp;
    maxMpElement.textContent = player.maxMp;
    levelElement.textContent = player.level;
    expElement.textContent = player.exp;
    maxExpElement.textContent = player.maxExp;
    goldElement.textContent = player.gold;
    scoreElement.textContent = score;
}

// 添加游戏消息
function addMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    gameMessages.appendChild(messageElement);
    
    // 保持最多5条消息
    if (gameMessages.children.length > 5) {
        gameMessages.removeChild(gameMessages.firstChild);
    }
    
    // 滚动到底部
    gameMessages.scrollTop = gameMessages.scrollHeight;
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = player.color;
    
    // 根据方向绘制不同朝向的玩家
    if (player.attacking) {
        // 攻击动画
        ctx.fillRect(player.x, player.y - 10, player.width + 10, player.height + 10);
    } else {
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // 绘制角色眼睛
    ctx.fillStyle = '#fff';
    if (player.direction === 'right') {
        ctx.fillRect(player.x + 30, player.y + 10, 5, 5);
        ctx.fillRect(player.x + 30, player.y + 25, 5, 5);
    } else {
        ctx.fillRect(player.x + 5, player.y + 10, 5, 5);
        ctx.fillRect(player.x + 5, player.y + 25, 5, 5);
    }
}

// 绘制敌人
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 绘制敌人眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
    });
}

// 绘制宝石
function drawGems() {
    gems.forEach(gem => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(gem.x + gem.width / 2, gem.y + gem.height / 2, gem.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 绘制攻击效果
function drawAttacks() {
    attacks.forEach(attack => {
        ctx.fillStyle = attack.color;
        ctx.fillRect(attack.x, attack.y, attack.width, attack.height);
    });
}

// 绘制游戏
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    // 绘制城堡（终点）
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(canvas.width - 150, canvas.height - 150, 100, 100);
    
    drawGems();
    drawEnemies();
    drawAttacks();
    drawPlayer();
}

// 生成敌人
function spawnEnemy() {
    if (Math.random() < ENEMY_SPAWN_RATE && enemies.length < 10) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // 上
                x = Math.random() * canvas.width;
                y = -50;
                break;
            case 1: // 右
                x = canvas.width + 50;
                y = Math.random() * canvas.height;
                break;
            case 2: // 下
                x = Math.random() * canvas.width;
                y = canvas.height + 50;
                break;
            case 3: // 左
                x = -50;
                y = Math.random() * canvas.height;
                break;
        }
        
        enemies.push({
            x: x,
            y: y,
            width: 30,
            height: 30,
            speed: ENEMY_SPEED,
            hp: 30 + player.level * 5
        });
    }
}

// 生成宝石
function spawnGem() {
    if (Math.random() < GEM_SPAWN_RATE && gems.length < 5) {
        gems.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 80) + 30,
            width: 20,
            height: 20,
            collected: false
        });
    }
}

// 移动玩家
function movePlayer() {
    let moved = false;
    
    if (keys.up && player.y > 0) {
        player.y -= player.speed;
        moved = true;
    }
    if (keys.down && player.y < canvas.height - player.height) {
        player.y += player.speed;
        moved = true;
    }
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
        player.direction = 'left';
        moved = true;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.direction = 'right';
        moved = true;
    }
    
    return moved;
}

// 移动敌人
function moveEnemies() {
    enemies.forEach(enemy => {
        // 朝向玩家移动
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
    });
}

// 移动攻击
function moveAttacks() {
    attacks.forEach(attack => {
        attack.x += attack.velocityX;
        attack.y += attack.velocityY;
        attack.duration--;
    });
    
    // 移除过期攻击
    attacks = attacks.filter(attack => attack.duration > 0);
}

// 攻击逻辑
function handleAttacks() {
    // 普通攻击
    if (keys.space && player.attackCooldown === 0) {
        player.attacking = true;
        player.attackCooldown = 50;
        
        // 创建攻击
        const attack = {
            x: player.direction === 'right' ? player.x + player.width : player.x - 20,
            y: player.y,
            width: 30,
            height: 20,
            color: '#FF6B6B',
            velocityX: player.direction === 'right' ? 10 : -10,
            velocityY: 0,
            duration: ATTACK_DURATION,
            damage: 20 + player.level * 5
        };
        
        attacks.push(attack);
        addMessage('使用普通攻击！');
    }
    
    // 技能1：普通攻击（无消耗）
    if (keys['1'] && player.skillCooldowns[0] === 0) {
        // 已包含在普通攻击中
    }
    
    // 技能2：火球术（消耗MP）
    if (keys['2'] && player.skillCooldowns[1] === 0 && player.mp >= 10) {
        player.mp -= 10;
        player.skillCooldowns[1] = SKILL_COOLDOWNS[1];
        
        const attack = {
            x: player.direction === 'right' ? player.x + player.width : player.x - 20,
            y: player.y,
            width: 40,
            height: 30,
            color: '#FF9800',
            velocityX: player.direction === 'right' ? 12 : -12,
            velocityY: 0,
            duration: ATTACK_DURATION + 10,
            damage: 40 + player.level * 10
        };
        
        attacks.push(attack);
        addMessage('使用火球术！造成大量伤害！');
    }
    
    // 技能3：治疗术（消耗MP）
    if (keys['3'] && player.skillCooldowns[2] === 0 && player.mp >= 15) {
        player.mp -= 15;
        player.skillCooldowns[2] = SKILL_COOLDOWNS[2];
        
        // 治疗效果
        const healAmount = 30 + player.level * 15;
        player.hp = Math.min(player.hp + healAmount, player.maxHp);
        
        addMessage(`使用治疗术！恢复了${healAmount}点生命值！`);
    }
    
    // 更新冷却时间
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    
    for (let i = 0; i < player.skillCooldowns.length; i++) {
        if (player.skillCooldowns[i] > 0) {
            player.skillCooldowns[i]--;
        }
    }
    
    if (player.attacking && player.attackCooldown < 25) {
        player.attacking = false;
    }
}

// 碰撞检测
function checkCollisions() {
    // 玩家与敌人碰撞
    enemies.forEach((enemy, enemyIndex) => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // 玩家受伤
            player.hp -= 10;
            addMessage('被敌人攻击！失去10点生命值！');
            
            // 击退玩家
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                player.x += (dx / distance) * 50;
                player.y += (dy / distance) * 50;
            }
            
            // 检查玩家是否死亡
            if (player.hp <= 0) {
                gameOver();
            }
        }
    });
    
    // 攻击与敌人碰撞
    attacks.forEach((attack, attackIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                attack.x < enemy.x + enemy.width &&
                attack.x + attack.width > enemy.x &&
                attack.y < enemy.y + enemy.height &&
                attack.y + attack.height > enemy.y
            ) {
                // 敌人受伤
                enemy.hp -= attack.damage;
                
                if (enemy.hp <= 0) {
                    // 敌人死亡，获得经验和金币
                    const expGained = 50 + player.level * 10;
                    const goldGained = 10 + player.level * 5;
                    
                    player.exp += expGained;
                    player.gold += goldGained;
                    score += 100;
                    
                    addMessage(`击败敌人！获得${expGained}经验和${goldGained}金币！`);
                    
                    // 移除敌人
                    enemies.splice(enemyIndex, 1);
                    
                    // 检查升级
                    checkLevelUp();
                }
            }
        });
    });
    
    // 玩家与宝石碰撞
    gems.forEach((gem, gemIndex) => {
        if (
            player.x < gem.x + gem.width &&
            player.x + player.width > gem.x &&
            player.y < gem.y + gem.height &&
            player.y + player.height > gem.y
        ) {
            // 收集宝石
            player.gold += GEM_VALUE;
            score += 50;
            
            addMessage(`收集到宝石！获得${GEM_VALUE}金币！`);
            
            // 移除宝石
            gems.splice(gemIndex, 1);
        }
    });
}

// 检查升级
function checkLevelUp() {
    const expRequired = player.level * 100;
    
    if (player.exp >= expRequired) {
        player.level++;
        player.exp -= expRequired;
        player.maxHp += 20;
        player.maxMp += 10;
        player.hp = player.maxHp;
        player.mp = player.maxMp;
        
        addMessage(`升级了！现在是${player.level}级！生命值和魔法值已满！`);
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    addMessage(`游戏结束！最终分数: ${score}`);
    alert(`游戏结束！\n最终分数: ${score}\n等级: ${player.level}\n金币: ${player.gold}`);
}

// 添加消息
function addMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    gameMessages.appendChild(messageElement);
    
    // 保持最多5条消息
    if (gameMessages.children.length > 5) {
        gameMessages.removeChild(gameMessages.firstChild);
    }
    
    // 滚动到底部
    gameMessages.scrollTop = gameMessages.scrollHeight;
}

// 游戏循环
function gameLoop() {
    if (!gameRunning) return;
    
    // 更新游戏状态
    spawnEnemy();
    spawnGem();
    movePlayer();
    moveEnemies();
    handleAttacks();
    moveAttacks();
    checkCollisions();
    
    // 更新UI
    updateUI();
    
    // 绘制游戏
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ') keys.space = true;
    if (['1', '2', '3'].includes(e.key)) keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.up = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.down = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = false;
    if (e.key === ' ') keys.space = false;
    if (['1', '2', '3'].includes(e.key)) keys[e.key] = false;
});

// 按钮事件
restartBtn.addEventListener('click', () => {
    gameRunning = true;
    initGame();
    gameLoop();
});

// 初始化游戏
initGame();

// 开始游戏循环
requestAnimationFrame(gameLoop);