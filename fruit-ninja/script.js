class FruitNinjaGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.score = 0;
        this.lives = 3;
        this.combo = 0;
        this.gameRunning = true;
        this.gameOver = false;
        
        // 水果和炸弹数组
        this.fruits = [];
        this.bombs = [];
        this.slices = [];
        
        // 鼠标轨迹
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false
        };
        
        this.mouseTrail = [];
        this.maxTrailLength = 10;
        
        // 生成水果的时间间隔
        this.fruitSpawnTimer = 0;
        this.fruitSpawnInterval = 1000; // 毫秒
        this.minSpawnInterval = 300;
        
        // 水果类型
        this.fruitTypes = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🍍', '🥝', '🥭'];
        
        // 游戏速度
        this.gameSpeed = 1;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.gameLoop();
    }
    
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    handleMouseDown(event) {
        this.mouse.isDown = true;
        this.updateMousePosition(event);
    }
    
    handleMouseMove(event) {
        this.updateMousePosition(event);
        
        if (this.mouse.isDown) {
            this.addToMouseTrail(this.mouse.x, this.mouse.y);
            this.checkFruitCollision();
        }
    }
    
    handleMouseUp() {
        this.mouse.isDown = false;
        this.mouseTrail = [];
        this.combo = 0;
        this.updateUI();
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            this.mouse.isDown = true;
            this.updateTouchPosition(event);
        }
    }
    
    handleTouchMove(event) {
        event.preventDefault();
        this.updateTouchPosition(event);
        
        if (this.mouse.isDown) {
            this.addToMouseTrail(this.mouse.x, this.mouse.y);
            this.checkFruitCollision();
        }
    }
    
    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
    }
    
    updateTouchPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.touches[0].clientX - rect.left;
        this.mouse.y = event.touches[0].clientY - rect.top;
    }
    
    addToMouseTrail(x, y) {
        this.mouseTrail.push({ x, y, timestamp: Date.now() });
        
        // 限制轨迹长度
        if (this.mouseTrail.length > this.maxTrailLength) {
            this.mouseTrail.shift();
        }
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.combo = 0;
        this.gameRunning = true;
        this.gameOver = false;
        
        // 清空所有数组
        this.fruits = [];
        this.bombs = [];
        this.slices = [];
        this.mouseTrail = [];
        
        // 重置生成间隔
        this.fruitSpawnInterval = 1000;
        this.gameSpeed = 1;
        
        // 更新UI
        this.updateUI();
    }
    
    spawnFruit() {
        // 随机选择水果或炸弹
        const spawnType = Math.random() < 0.8 ? 'fruit' : 'bomb'; // 80% 水果，20% 炸弹
        
        if (spawnType === 'fruit') {
            this.spawnFruitItem();
        } else {
            this.spawnBomb();
        }
    }
    
    spawnFruitItem() {
        const fruitType = this.fruitTypes[Math.floor(Math.random() * this.fruitTypes.length)];
        
        // 随机生成起始位置（屏幕底部）
        const x = Math.random() * (this.width - 100) + 50;
        const y = this.height + 50;
        
        // 随机生成速度和角度
        const angle = Math.random() * Math.PI / 4 + Math.PI / 4; // 45° 到 90°
        const speed = Math.random() * 8 + 6;
        const dx = Math.cos(angle) * speed;
        const dy = -Math.sin(angle) * speed;
        
        // 创建水果对象
        const fruit = {
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            radius: 30,
            type: fruitType,
            isSliced: false,
            gravity: 0.2,
            rotation: 0,
            rotationSpeed: Math.random() * 0.1 - 0.05
        };
        
        this.fruits.push(fruit);
    }
    
    spawnBomb() {
        // 随机生成起始位置
        const x = Math.random() * (this.width - 100) + 50;
        const y = this.height + 50;
        
        // 随机生成速度和角度
        const angle = Math.random() * Math.PI / 4 + Math.PI / 4; // 45° 到 90°
        const speed = Math.random() * 6 + 4;
        const dx = Math.cos(angle) * speed;
        const dy = -Math.sin(angle) * speed;
        
        // 创建炸弹对象
        const bomb = {
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            radius: 30,
            isSliced: false,
            gravity: 0.2,
            rotation: 0,
            rotationSpeed: Math.random() * 0.1 - 0.05
        };
        
        this.bombs.push(bomb);
    }
    
    updateFruits() {
        // 更新水果
        for (let i = this.fruits.length - 1; i >= 0; i--) {
            const fruit = this.fruits[i];
            
            if (fruit.isSliced) {
                // 水果已经被切割，移除
                this.fruits.splice(i, 1);
            } else {
                // 应用重力
                fruit.dy += fruit.gravity * this.gameSpeed;
                
                // 更新位置
                fruit.x += fruit.dx * this.gameSpeed;
                fruit.y += fruit.dy * this.gameSpeed;
                
                // 更新旋转
                fruit.rotation += fruit.rotationSpeed * this.gameSpeed;
                
                // 检查是否超出屏幕底部
                if (fruit.y > this.height + 50) {
                    this.fruits.splice(i, 1);
                    this.loseLife();
                }
            }
        }
        
        // 更新炸弹
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            
            if (bomb.isSliced) {
                // 炸弹已经被切割，移除
                this.bombs.splice(i, 1);
            } else {
                // 应用重力
                bomb.dy += bomb.gravity * this.gameSpeed;
                
                // 更新位置
                bomb.x += bomb.dx * this.gameSpeed;
                bomb.y += bomb.dy * this.gameSpeed;
                
                // 更新旋转
                bomb.rotation += bomb.rotationSpeed * this.gameSpeed;
                
                // 检查是否超出屏幕底部
                if (bomb.y > this.height + 50) {
                    this.bombs.splice(i, 1);
                }
            }
        }
        
        // 更新切片效果
        for (let i = this.slices.length - 1; i >= 0; i--) {
            const slice = this.slices[i];
            slice.x += slice.dx;
            slice.y += slice.dy;
            slice.dy += 0.2;
            slice.life--;
            
            if (slice.life <= 0) {
                this.slices.splice(i, 1);
            }
        }
    }
    
    checkFruitCollision() {
        // 检查水果碰撞
        for (let i = this.fruits.length - 1; i >= 0; i--) {
            const fruit = this.fruits[i];
            if (!fruit.isSliced && this.checkMouseTrailCollision(fruit)) {
                this.sliceFruit(fruit, i);
            }
        }
        
        // 检查炸弹碰撞
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            if (!bomb.isSliced && this.checkMouseTrailCollision(bomb)) {
                this.sliceBomb(bomb, i);
            }
        }
    }
    
    checkMouseTrailCollision(object) {
        // 检查鼠标轨迹与物体的碰撞
        for (let i = 0; i < this.mouseTrail.length - 1; i++) {
            const p1 = this.mouseTrail[i];
            const p2 = this.mouseTrail[i + 1];
            
            if (this.lineCircleCollision(p1.x, p1.y, p2.x, p2.y, object.x, object.y, object.radius)) {
                return true;
            }
        }
        return false;
    }
    
    lineCircleCollision(x1, y1, x2, y2, cx, cy, radius) {
        // 计算线段与圆的距离
        const dx = x2 - x1;
        const dy = y2 - y1;
        const a = dx * dx + dy * dy;
        
        if (a === 0) {
            // 线段是一个点
            const dist = Math.sqrt((x1 - cx) * (x1 - cx) + (y1 - cy) * (y1 - cy));
            return dist <= radius;
        }
        
        const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / a));
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;
        const dist = Math.sqrt((closestX - cx) * (closestX - cx) + (closestY - cy) * (closestY - cy));
        
        return dist <= radius;
    }
    
    sliceFruit(fruit, index) {
        // 标记水果为已切割
        fruit.isSliced = true;
        
        // 增加分数
        this.score += 10;
        this.combo++;
        
        // 如果连击数大于3，增加额外分数
        if (this.combo >= 3) {
            this.score += this.combo * 5;
        }
        
        // 创建切片效果
        this.createSliceEffect(fruit.x, fruit.y, fruit.type);
        
        // 更新UI
        this.updateUI();
    }
    
    sliceBomb(bomb, index) {
        // 标记炸弹为已切割
        bomb.isSliced = true;
        
        // 失去生命值
        this.lives--;
        this.combo = 0;
        
        // 创建爆炸效果
        this.createExplosionEffect(bomb.x, bomb.y);
        
        // 更新UI
        this.updateUI();
        
        // 检查游戏结束
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameRunning = false;
            alert(`游戏结束！你的得分：${this.score}`);
        }
    }
    
    loseLife() {
        this.lives--;
        this.combo = 0;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameRunning = false;
            alert(`游戏结束！你的得分：${this.score}`);
        }
    }
    
    createSliceEffect(x, y, type) {
        // 创建两个切片效果
        const slice1 = {
            x: x,
            y: y,
            dx: -3,
            dy: -2,
            type: type,
            life: 60
        };
        
        const slice2 = {
            x: x,
            y: y,
            dx: 3,
            dy: -2,
            type: type,
            life: 60
        };
        
        this.slices.push(slice1);
        this.slices.push(slice2);
    }
    
    createExplosionEffect(x, y) {
        // 创建爆炸效果
        for (let i = 0; i < 8; i++) {
            const slice = {
                x: x,
                y: y,
                dx: Math.cos(i * Math.PI / 4) * 5,
                dy: Math.sin(i * Math.PI / 4) * 5,
                type: '💥',
                life: 30
            };
            
            this.slices.push(slice);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('combo').textContent = this.combo;
    }
    
    drawFruits() {
        // 绘制水果
        this.fruits.forEach(fruit => {
            this.ctx.save();
            this.ctx.translate(fruit.x, fruit.y);
            this.ctx.rotate(fruit.rotation);
            
            this.ctx.font = '60px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(fruit.type, 0, 0);
            
            this.ctx.restore();
        });
        
        // 绘制炸弹
        this.bombs.forEach(bomb => {
            this.ctx.save();
            this.ctx.translate(bomb.x, bomb.y);
            this.ctx.rotate(bomb.rotation);
            
            this.ctx.font = '60px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💣', 0, 0);
            
            this.ctx.restore();
        });
        
        // 绘制切片效果
        this.slices.forEach(slice => {
            this.ctx.save();
            this.ctx.globalAlpha = slice.life / 60;
            this.ctx.translate(slice.x, slice.y);
            
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(slice.type, 0, 0);
            
            this.ctx.restore();
        });
    }
    
    drawMouseTrail() {
        if (this.mouseTrail.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouseTrail[0].x, this.mouseTrail[0].y);
        
        for (let i = 1; i < this.mouseTrail.length; i++) {
            this.ctx.lineTo(this.mouseTrail[i].x, this.mouseTrail[i].y);
        }
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // 绘制轨迹的发光效果
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制水果和炸弹
        this.drawFruits();
        
        // 绘制鼠标轨迹
        this.drawMouseTrail();
    }
    
    gameLoop() {
        if (this.gameRunning) {
            // 更新游戏状态
            this.updateFruits();
            
            // 生成新水果
            this.fruitSpawnTimer += 16; // 假设60fps
            if (this.fruitSpawnTimer >= this.fruitSpawnInterval) {
                this.spawnFruit();
                this.fruitSpawnTimer = 0;
                
                // 逐渐减少生成间隔，增加游戏难度
                if (this.fruitSpawnInterval > this.minSpawnInterval) {
                    this.fruitSpawnInterval -= 10;
                    this.gameSpeed += 0.01;
                }
            }
        }
        
        // 渲染游戏画面
        this.render();
        
        // 循环调用
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new FruitNinjaGame();
});