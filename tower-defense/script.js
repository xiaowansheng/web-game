class TowerDefenseGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.score = 0;
        this.lives = 20;
        this.money = 100;
        this.wave = 1;
        this.gameRunning = true;
        this.gameOver = false;
        this.waveInProgress = false;
        
        // 网格系统
        this.gridSize = 40;
        this.rows = Math.floor(this.height / this.gridSize);
        this.cols = Math.floor(this.width / this.gridSize);
        
        // 地图数据 (0: 可建造, 1: 路径, 2: 起点, 3: 终点)
        this.map = this.generateMap();
        
        // 路径点
        this.pathPoints = this.generatePath();
        
        // 游戏对象
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        
        // 敌人生成
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1000;
        this.enemiesPerWave = 10;
        this.enemiesSpawned = 0;
        
        // 选中的塔类型
        this.selectedTowerType = null;
        
        // 塔的类型数据
        this.towerTypes = {
            basic: {
                name: '基础塔',
                cost: 50,
                damage: 10,
                range: 80,
                fireRate: 1000,
                icon: '🏹',
                color: '#4CAF50'
            },
            fire: {
                name: '火焰塔',
                cost: 100,
                damage: 20,
                range: 60,
                fireRate: 1500,
                icon: '🔥',
                color: '#FF9800',
                effect: 'fire'
            },
            ice: {
                name: '冰冻塔',
                cost: 150,
                damage: 5,
                range: 70,
                fireRate: 2000,
                icon: '❄️',
                color: '#2196F3',
                effect: 'slow',
                slowFactor: 0.5
            },
            cannon: {
                name: '加农炮',
                cost: 200,
                damage: 50,
                range: 100,
                fireRate: 2500,
                icon: '💣',
                color: '#9C27B0',
                effect: 'explosion',
                explosionRadius: 30
            }
        };
        
        // 敌人类型数据
        this.enemyTypes = {
            basic: {
                name: '基础敌人',
                health: 100,
                speed: 1,
                money: 10,
                color: '#FF5252',
                icon: '👾'
            },
            fast: {
                name: '快速敌人',
                health: 50,
                speed: 2,
                money: 15,
                color: '#FFEB3B',
                icon: '⚡'
            },
            tank: {
                name: '坦克敌人',
                health: 300,
                speed: 0.5,
                money: 30,
                color: '#795548',
                icon: '🛡️'
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.gameLoop();
    }
    
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // 塔选择事件
        document.querySelectorAll('.tower-option').forEach(option => {
            option.addEventListener('click', (e) => this.handleTowerSelection(e));
        });
        
        // 开始波次按钮
        document.getElementById('start-wave-btn').addEventListener('click', () => this.startWave());
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    generateMap() {
        // 创建地图数组
        const map = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        // 生成路径（从左侧中间到右侧中间）
        const startCol = 0;
        const startRow = Math.floor(this.rows / 2);
        const endCol = this.cols - 1;
        const endRow = Math.floor(this.rows / 2);
        
        // 设置起点和终点
        map[startRow][startCol] = 2;
        map[endRow][endCol] = 3;
        
        // 生成蛇形路径
        let currentRow = startRow;
        let currentCol = startCol;
        
        while (currentCol < endCol) {
            map[currentRow][currentCol] = 1;
            
            // 随机选择下一个方向（右、上、下）
            const directions = ['right'];
            if (currentRow > 1) directions.push('up');
            if (currentRow < this.rows - 2) directions.push('down');
            
            const direction = directions[Math.floor(Math.random() * directions.length)];
            
            if (direction === 'right') {
                currentCol++;
            } else if (direction === 'up') {
                currentRow--;
            } else if (direction === 'down') {
                currentRow++;
            }
        }
        
        // 确保终点连接
        map[currentRow][currentCol] = 1;
        
        return map;
    }
    
    generatePath() {
        // 生成路径点数组
        const pathPoints = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.map[row][col] === 1 || this.map[row][col] === 2 || this.map[row][col] === 3) {
                    pathPoints.push({
                        x: col * this.gridSize + this.gridSize / 2,
                        y: row * this.gridSize + this.gridSize / 2
                    });
                }
            }
        }
        
        return pathPoints;
    }
    
    handleCanvasClick(event) {
        if (this.gameOver || this.waveInProgress) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        // 检查是否点击了已有的塔
        const clickedTower = this.towers.find(tower => {
            const towerGridX = Math.floor(tower.x / this.gridSize);
            const towerGridY = Math.floor(tower.y / this.gridSize);
            return towerGridX === gridX && towerGridY === gridY;
        });
        
        if (clickedTower) {
            // 升级塔
            this.upgradeTower(clickedTower);
        } else if (this.selectedTowerType) {
            // 建造新塔
            this.buildTower(gridX, gridY);
        }
    }
    
    handleTowerSelection(event) {
        if (this.gameOver || this.waveInProgress) return;
        
        const option = event.currentTarget;
        const towerType = option.dataset.tower;
        const cost = parseInt(option.dataset.cost);
        
        // 检查是否有足够的金钱
        if (this.money < cost) {
            return;
        }
        
        // 移除其他选中状态
        document.querySelectorAll('.tower-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // 切换选中状态
        if (this.selectedTowerType === towerType) {
            this.selectedTowerType = null;
        } else {
            this.selectedTowerType = towerType;
            option.classList.add('selected');
        }
    }
    
    buildTower(gridX, gridY) {
        // 检查是否可以在该位置建造
        if (this.map[gridY][gridX] !== 0) {
            return;
        }
        
        const towerType = this.towerTypes[this.selectedTowerType];
        
        // 检查是否有足够的金钱
        if (this.money < towerType.cost) {
            return;
        }
        
        // 建造塔
        const tower = {
            id: Date.now(),
            type: this.selectedTowerType,
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2,
            level: 1,
            damage: towerType.damage,
            range: towerType.range,
            fireRate: towerType.fireRate,
            lastFired: 0,
            color: towerType.color,
            icon: towerType.icon,
            effect: towerType.effect,
            slowFactor: towerType.slowFactor || 1,
            explosionRadius: towerType.explosionRadius || 0
        };
        
        this.towers.push(tower);
        this.money -= towerType.cost;
        
        // 标记该位置为不可建造
        this.map[gridY][gridX] = 4; // 4表示有塔
        
        // 更新UI
        this.updateUI();
    }
    
    upgradeTower(tower) {
        // 计算升级费用
        const upgradeCost = Math.floor(this.towerTypes[tower.type].cost * tower.level * 1.5);
        
        // 检查是否有足够的金钱
        if (this.money < upgradeCost) {
            return;
        }
        
        // 升级塔
        tower.level++;
        tower.damage = Math.floor(this.towerTypes[tower.type].damage * tower.level);
        tower.range = Math.floor(this.towerTypes[tower.type].range * (1 + (tower.level - 1) * 0.1));
        
        // 扣除金钱
        this.money -= upgradeCost;
        
        // 更新UI
        this.updateUI();
    }
    
    startWave() {
        if (this.waveInProgress || this.gameOver) return;
        
        this.waveInProgress = true;
        this.enemiesSpawned = 0;
        this.enemySpawnTimer = 0;
        
        // 禁用开始波次按钮
        document.getElementById('start-wave-btn').disabled = true;
    }
    
    spawnEnemy() {
        if (this.enemiesSpawned >= this.enemiesPerWave) {
            return;
        }
        
        // 随机选择敌人类型
        const enemyTypes = Object.keys(this.enemyTypes);
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemyData = this.enemyTypes[enemyType];
        
        // 从起点生成敌人
        const startPoint = this.pathPoints[0];
        
        const enemy = {
            id: Date.now(),
            type: enemyType,
            x: startPoint.x,
            y: startPoint.y,
            health: enemyData.health * this.wave * 0.5,
            maxHealth: enemyData.health * this.wave * 0.5,
            speed: enemyData.speed,
            originalSpeed: enemyData.speed,
            money: enemyData.money,
            color: enemyData.color,
            icon: enemyData.icon,
            pathIndex: 0,
            slowTimer: 0,
            effects: []
        };
        
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }
    
    updateEnemies() {
        // 更新敌人位置
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // 检查是否到达终点
            if (enemy.pathIndex >= this.pathPoints.length - 1) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                // 检查游戏结束
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.gameRunning = false;
                    alert(`游戏结束！你的得分：${this.score}`);
                }
                continue;
            }
            
            // 应用减速效果
            if (enemy.slowTimer > 0) {
                enemy.slowTimer -= 16;
                if (enemy.slowTimer <= 0) {
                    enemy.speed = enemy.originalSpeed;
                }
            }
            
            // 移动敌人
            const targetPoint = this.pathPoints[enemy.pathIndex + 1];
            const dx = targetPoint.x - enemy.x;
            const dy = targetPoint.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemy.speed) {
                // 到达目标点，移动到下一个点
                enemy.x = targetPoint.x;
                enemy.y = targetPoint.y;
                enemy.pathIndex++;
            } else {
                // 向目标点移动
                const moveX = (dx / distance) * enemy.speed;
                const moveY = (dy / distance) * enemy.speed;
                enemy.x += moveX;
                enemy.y += moveY;
            }
        }
        
        // 检查波次是否结束
        if (this.waveInProgress && this.enemiesSpawned >= this.enemiesPerWave && this.enemies.length === 0) {
            this.waveInProgress = false;
            this.wave++;
            this.enemiesPerWave += 5;
            this.money += 50 * this.wave;
            
            // 启用开始波次按钮
            document.getElementById('start-wave-btn').disabled = false;
            
            // 更新UI
            this.updateUI();
        }
    }
    
    updateTowers() {
        // 更新塔的射击
        this.towers.forEach(tower => {
            const now = Date.now();
            
            if (now - tower.lastFired >= tower.fireRate) {
                // 寻找最近的敌人
                const target = this.findNearestEnemy(tower);
                
                if (target) {
                    // 射击敌人
                    this.fireBullet(tower, target);
                    tower.lastFired = now;
                }
            }
        });
    }
    
    findNearestEnemy(tower) {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const dx = enemy.x - tower.x;
            const dy = enemy.y - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= tower.range && distance < nearestDistance) {
                nearestEnemy = enemy;
                nearestDistance = distance;
            }
        });
        
        return nearestEnemy;
    }
    
    fireBullet(tower, enemy) {
        const bullet = {
            id: Date.now(),
            x: tower.x,
            y: tower.y,
            targetX: enemy.x,
            targetY: enemy.y,
            damage: tower.damage,
            speed: 8,
            color: tower.color,
            effect: tower.effect,
            slowFactor: tower.slowFactor,
            explosionRadius: tower.explosionRadius
        };
        
        this.bullets.push(bullet);
    }
    
    updateBullets() {
        // 更新子弹位置
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // 计算子弹方向
            const dx = bullet.targetX - bullet.x;
            const dy = bullet.targetY - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bullet.speed) {
                // 子弹命中目标
                this.handleBulletHit(bullet, bullet.targetX, bullet.targetY);
                this.bullets.splice(i, 1);
            } else {
                // 移动子弹
                const moveX = (dx / distance) * bullet.speed;
                const moveY = (dy / distance) * bullet.speed;
                bullet.x += moveX;
                bullet.y += moveY;
            }
        }
    }
    
    handleBulletHit(bullet, hitX, hitY) {
        // 查找命中的敌人
        this.enemies.forEach(enemy => {
            const dx = enemy.x - hitX;
            const dy = enemy.y - hitY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 检查是否在爆炸范围内
            const hitRange = bullet.explosionRadius || 10;
            
            if (distance <= hitRange) {
                // 造成伤害
                enemy.health -= bullet.damage;
                
                // 应用特殊效果
                if (bullet.effect === 'slow') {
                    enemy.speed = enemy.originalSpeed * bullet.slowFactor;
                    enemy.slowTimer = 2000;
                } else if (bullet.effect === 'fire') {
                    // 火焰效果：持续伤害
                    enemy.health -= bullet.damage * 0.5;
                }
                
                // 检查敌人是否死亡
                if (enemy.health <= 0) {
                    const enemyIndex = this.enemies.indexOf(enemy);
                    if (enemyIndex > -1) {
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10;
                        this.money += enemy.money;
                        this.updateUI();
                    }
                }
            }
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('money').textContent = this.money;
        document.getElementById('wave').textContent = this.wave;
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 20;
        this.money = 100;
        this.wave = 1;
        this.gameRunning = true;
        this.gameOver = false;
        this.waveInProgress = false;
        this.selectedTowerType = null;
        
        // 清空游戏对象
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        
        // 重新生成地图
        this.map = this.generateMap();
        this.pathPoints = this.generatePath();
        
        // 重置波次设置
        this.enemiesPerWave = 10;
        this.enemiesSpawned = 0;
        
        // 启用开始波次按钮
        document.getElementById('start-wave-btn').disabled = false;
        
        // 移除塔选择
        document.querySelectorAll('.tower-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // 更新UI
        this.updateUI();
    }
    
    drawMap() {
        // 绘制地图
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.gridSize;
                const y = row * this.gridSize;
                
                switch (this.map[row][col]) {
                    case 0: // 可建造区域
                        this.ctx.fillStyle = '#8BC34A';
                        break;
                    case 1: // 路径
                        this.ctx.fillStyle = '#795548';
                        break;
                    case 2: // 起点
                        this.ctx.fillStyle = '#4CAF50';
                        break;
                    case 3: // 终点
                        this.ctx.fillStyle = '#F44336';
                        break;
                    case 4: // 塔
                        this.ctx.fillStyle = '#8BC34A';
                        break;
                }
                
                this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
                
                // 绘制网格线
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(x, y, this.gridSize, this.gridSize);
            }
        }
    }
    
    drawTowers() {
        // 绘制塔
        this.towers.forEach(tower => {
            // 绘制塔的范围（仅在选中时显示）
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // 绘制塔
            this.ctx.fillStyle = tower.color;
            this.ctx.fillRect(tower.x - 15, tower.y - 15, 30, 30);
            
            // 绘制塔的图标
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(tower.icon, tower.x, tower.y);
            
            // 绘制塔的等级
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('Lv' + tower.level, tower.x + 10, tower.y - 10);
        });
    }
    
    drawEnemies() {
        // 绘制敌人
        this.enemies.forEach(enemy => {
            // 绘制敌人
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制敌人图标
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(enemy.icon, enemy.x, enemy.y);
            
            // 绘制血条
            const healthPercentage = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(enemy.x - 20, enemy.y - 25, 40, 5);
            this.ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : '#f44336';
            this.ctx.fillRect(enemy.x - 20, enemy.y - 25, 40 * healthPercentage, 5);
        });
    }
    
    drawBullets() {
        // 绘制子弹
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制地图
        this.drawMap();
        
        // 绘制塔
        this.drawTowers();
        
        // 绘制敌人
        this.drawEnemies();
        
        // 绘制子弹
        this.drawBullets();
    }
    
    gameLoop() {
        if (this.gameRunning) {
            // 生成敌人
            if (this.waveInProgress) {
                this.enemySpawnTimer += 16;
                if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                    this.spawnEnemy();
                    this.enemySpawnTimer = 0;
                }
            }
            
            // 更新游戏状态
            this.updateEnemies();
            this.updateTowers();
            this.updateBullets();
        }
        
        // 渲染游戏画面
        this.render();
        
        // 循环调用
        requestAnimationFrame(() => this.gameLoop());
    }
    
    generatePath() {
        // 从地图生成路径点
        const pathPoints = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.map[row][col] === 1 || this.map[row][col] === 2 || this.map[row][col] === 3) {
                    pathPoints.push({
                        x: col * this.gridSize + this.gridSize / 2,
                        y: row * this.gridSize + this.gridSize / 2
                    });
                }
            }
        }
        
        return pathPoints;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new TowerDefenseGame();
});