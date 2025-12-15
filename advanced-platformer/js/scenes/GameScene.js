// 游戏场景
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 设置背景
        this.cameras.main.setBackgroundColor('#001122');

        // 创建平台组
        this.platforms = this.physics.add.staticGroup();
        
        // 创建敌人组
        this.enemies = this.physics.add.group();
        
        // 创建收集品组
        this.collectibles = this.physics.add.group();
        
        // 创建子弹组
        this.bullets = this.physics.add.group();
        
        // 创建玩家
        this.player = new Player(this, 100, 450);
        
        // 加载当前关卡数据
        let levelData = this.cache.json.get(`level${currentLevel}`) || {
            platforms: [
                { x: 400, y: 568, width: 800, height: 32 },
                { x: 600, y: 400, width: 100, height: 20 },
                { x: 200, y: 300, width: 100, height: 20 },
                { x: 400, y: 200, width: 100, height: 20 },
                { x: 100, y: 100, width: 100, height: 20 }
            ],
            enemies: [
                { x: 300, y: 400 },
                { x: 500, y: 300 },
                { x: 700, y: 200 }
            ],
            collectibles: [
                { x: 300, y: 500 },
                { x: 500, y: 430 },
                { x: 200, y: 330 },
                { x: 400, y: 230 },
                { x: 100, y: 130 }
            ]
        };
        
        // 创建平台
        levelData.platforms.forEach(platform => {
            this.platforms.create(platform.x, platform.y, 'platform').setScale(platform.width / 100, platform.height / 20).refreshBody();
        });
        
        // 创建敌人
        levelData.enemies.forEach(enemy => {
            new Enemy(this, enemy.x, enemy.y);
        });
        
        // 创建收集品
        levelData.collectibles.forEach(collectible => {
            this.collectibles.create(collectible.x, collectible.y, 'collectible');
        });
        
        // 设置碰撞检测
        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.collectibles, this.platforms);
        this.physics.add.collider(this.bullets, this.platforms, (bullet) => {
            bullet.destroy();
        });
        
        // 玩家与敌人碰撞
        this.physics.add.collider(this.player.sprite, this.enemies, (player, enemy) => {
            this.player.hit();
        });
        
        // 玩家与收集品碰撞
        this.physics.add.overlap(this.player.sprite, this.collectibles, (player, collectible) => {
            collectible.destroy();
            globalScore += 100;
            updateUI();
        });
        
        // 子弹与敌人碰撞
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            enemy.destroy();
            globalScore += 500;
            updateUI();
        });
        
        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // 检查是否所有收集品都被收集
        this.checkCollectibles();
    }
    
    update() {
        // 更新玩家
        this.player.update(this.cursors, this.spaceKey);
        
        // 射击
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.player.shoot(this.bullets);
        }
        
        // 更新敌人AI
        this.enemies.children.iterate(enemy => {
            if (enemy.active) {
                enemy.update();
            }
        });
        
        // 检查玩家是否掉落
        if (this.player.sprite.y > this.cameras.main.height) {
            this.player.loseLife();
            if (globalLives <= 0) {
                this.scene.start('GameOverScene');
            } else {
                this.scene.restart();
            }
        }
        
        // 检查是否所有敌人都被消灭
        if (this.enemies.countActive(true) === 0 && this.collectibles.countActive(true) === 0) {
            currentLevel++;
            if (currentLevel > 3) {
                this.scene.start('BossScene');
            } else {
                this.scene.restart();
            }
        }
    }
    
    checkCollectibles() {
        // 每5秒检查一次是否需要生成新的收集品
        this.time.delayedCall(5000, () => {
            if (this.collectibles.countActive(true) < 3) {
                let x = Phaser.Math.Between(100, 700);
                let y = Phaser.Math.Between(100, 400);
                this.collectibles.create(x, y, 'collectible');
            }
            this.checkCollectibles();
        }, [], this);
    }
}