class AirplaneBattleGame {
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
        this.keys = {};
        
        // 游戏对象
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        
        // 游戏参数
        this.bulletSpeed = 8;
        this.enemyBulletSpeed = 5;
        this.enemySpeed = 2;
        this.enemySpawnRate = 1000;
        this.lastEnemySpawn = 0;
        this.maxEnemies = 5;
        
        this.init();
    }
    
    init() {
        this.createPlayer();
        this.bindEvents();
        this.gameLoop();
        this.updateUI();
    }
    
    createPlayer() {
        this.player = {
            x: this.width / 2 - 25,
            y: this.height - 70,
            width: 50,
            height: 60,
            speed: 5,
            bulletCooldown: 0,
            maxBulletCooldown: 300
        };
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // 空格键发射子弹
            if (e.key === ' ' && this.gameRunning) {
                e.preventDefault();
                this.fireBullet();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 开始按钮
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gameOver = false;
        
        // 禁用开始按钮
        document.getElementById('start-btn').disabled = true;
    }
    
    restartGame() {
        // 重置游戏状态
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gameOver = false;
        
        // 清空游戏对象
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        
        // 重新创建玩家
        this.createPlayer();
        
        // 重置游戏参数
        this.enemySpeed = 2;
        this.enemySpawnRate = 1000;
        this.maxEnemies = 5;
        
        // 更新UI
        this.updateUI();
        
        // 启用开始按钮
        document.getElementById('start-btn').disabled = false;
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.handleInput();
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateEnemyBullets();
        this.updateParticles();
        this.spawnEnemy();
        this.checkCollisions();
        this.checkLevelComplete();
    }
    
    handleInput() {
        // 玩家移动
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y += this.player.speed;
        }
        
        // 限制玩家在画布内
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.height - this.player.height, this.player.y));
        
        // 自动发射子弹
        if (this.keys[' ']) {
            this.fireBullet();
        }
    }
    
    updatePlayer() {
        // 玩家冷却时间
        if (this.player.bulletCooldown > 0) {
            this.player.bulletCooldown -= 16;
        }
    }
    
    fireBullet() {
        // 检查冷却时间
        if (this.player.bulletCooldown > 0) return;
        
        // 创建子弹
        const bullet = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: this.bulletSpeed
        };
        
        this.bullets.push(bullet);
        this.player.bulletCooldown = this.player.maxBulletCooldown;
    }
    
    updateBullets() {
        // 更新子弹位置
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            // 移除超出屏幕的子弹
            if (bullet.y < -bullet.height) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    spawnEnemy() {
        // 检查是否可以生成敌人
        if (this.enemies.length >= this.maxEnemies) return;
        
        // 检查生成时间间隔
        const now = Date.now();
        if (now - this.lastEnemySpawn < this.enemySpawnRate) return;
        
        // 生成敌人
        const enemy = {
            x: Math.random() * (this.width - 50),
            y: -60,
            width: 50,
            height: 60,
            speed: this.enemySpeed,
            health: 1,
            lastShot: 0
        };
        
        this.enemies.push(enemy);
        this.lastEnemySpawn = now;
    }
    
    updateEnemies() {
        // 更新敌人位置
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed;
            
            // 敌人射击
            if (Math.random() < 0.01) {
                this.fireEnemyBullet(enemy);
            }
            
            // 移除超出屏幕的敌人
            if (enemy.y > this.height) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    fireEnemyBullet(enemy) {
        // 创建敌人子弹
        const bullet = {
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 10,
            speed: this.enemyBulletSpeed
        };
        
        this.enemyBullets.push(bullet);
    }
    
    updateEnemyBullets() {
        // 更新敌人子弹位置
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.y += bullet.speed;
            
            // 移除超出屏幕的子弹
            if (bullet.y > this.height) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        // 更新粒子效果
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.dy += 0.2;
            particle.life--;
            particle.alpha -= 0.02;
            
            if (particle.life <= 0 || particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // 子弹与敌人碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    // 击中敌人
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 10;
                    this.updateUI();
                    break;
                }
            }
        }
        
        // 敌人子弹与玩家碰撞
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (this.checkCollision(bullet, this.player)) {
                // 击中玩家
                this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                this.enemyBullets.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                // 检查游戏结束
                if (this.lives <= 0) {
                    this.endGame();
                }
            }
        }
        
        // 敌人与玩家碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.checkCollision(enemy, this.player)) {
                // 玩家与敌人碰撞
                this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                // 检查游戏结束
                if (this.lives <= 0) {
                    this.endGame();
                }
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y) {
        // 创建爆炸效果
        for (let i = 0; i < 10; i++) {
            const particle = {
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                life: 30,
                alpha: 1,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`
            };
            
            this.particles.push(particle);
        }
    }
    
    checkLevelComplete() {
        // 检查是否消灭所有敌人
        if (this.enemies.length === 0 && this.bullets.length === 0 && this.enemyBullets.length === 0) {
            // 升级
            this.level++;
            this.enemySpeed += 0.5;
            this.enemySpawnRate = Math.max(500, this.enemySpawnRate - 100);
            this.maxEnemies = Math.min(10, this.maxEnemies + 1);
            this.updateUI();
            
            // 显示升级信息
            setTimeout(() => {
                alert(`恭喜你通过第 ${this.level - 1} 关！进入第 ${this.level} 关。`);
            }, 100);
        }
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        // 启用开始按钮
        document.getElementById('start-btn').disabled = false;
        
        // 显示游戏结束信息
        setTimeout(() => {
            alert(`游戏结束！你的得分：${this.score}`);
        }, 100);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景星星
        this.drawBackground();
        
        // 绘制玩家
        this.drawPlayer();
        
        // 绘制子弹
        this.drawBullets();
        
        // 绘制敌人
        this.drawEnemies();
        
        // 绘制敌人子弹
        this.drawEnemyBullets();
        
        // 绘制粒子
        this.drawParticles();
    }
    
    drawBackground() {
        // 绘制星空背景
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制星星
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.width;
            const y = (Date.now() * 0.01 + i * 0.5) % this.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        // 绘制玩家飞机
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 绘制飞机细节
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.player.x + 15, this.player.y + 10, 20, 40);
        this.ctx.fillRect(this.player.x + 10, this.player.y + 20, 30, 20);
        
        // 绘制机翼
        this.ctx.fillStyle = '#2196F3';
        this.ctx.fillRect(this.player.x - 10, this.player.y + 20, 10, 20);
        this.ctx.fillRect(this.player.x + this.player.width, this.player.y + 20, 10, 20);
    }
    
    drawBullets() {
        // 绘制玩家子弹
        this.ctx.fillStyle = '#FFEB3B';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    drawEnemies() {
        // 绘制敌人飞机
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = '#f44336';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 绘制敌人细节
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(enemy.x + 15, enemy.y + 10, 20, 40);
            this.ctx.fillRect(enemy.x + 10, enemy.y + 20, 30, 20);
        });
    }
    
    drawEnemyBullets() {
        // 绘制敌人子弹
        this.ctx.fillStyle = '#ff5722';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    drawParticles() {
        // 绘制粒子效果
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 4, 4);
            this.ctx.restore();
        });
    }
    
    gameLoop() {
        // 更新游戏状态
        this.update();
        
        // 渲染游戏画面
        this.render();
        
        // 循环调用
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new AirplaneBattleGame();
});