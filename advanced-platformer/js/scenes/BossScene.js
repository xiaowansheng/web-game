// Boss战场景
class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');
        this.bossHealth = 100;
        this.bossMaxHealth = 100;
    }

    create() {
        // 设置背景
        this.cameras.main.setBackgroundColor('#220000');

        // 创建平台
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(8, 1.6).refreshBody();
        this.platforms.create(100, 400, 'platform').setScale(2, 1).refreshBody();
        this.platforms.create(700, 400, 'platform').setScale(2, 1).refreshBody();
        this.platforms.create(400, 300, 'platform').setScale(3, 1).refreshBody();

        // 创建玩家
        this.player = new Player(this, 100, 450);

        // 创建Boss
        this.boss = new Boss(this, 700, 200);

        // 创建子弹组
        this.bullets = this.physics.add.group();
        this.bossBullets = this.physics.add.group();

        // 设置碰撞检测
        this.physics.add.collider(this.player.sprite, this.platforms);
        this.physics.add.collider(this.boss.sprite, this.platforms);
        this.physics.add.collider(this.bullets, this.platforms, (bullet) => {
            bullet.destroy();
        });
        this.physics.add.collider(this.bossBullets, this.platforms, (bullet) => {
            bullet.destroy();
        });

        // 玩家与Boss碰撞
        this.physics.add.collider(this.player.sprite, this.boss.sprite, (player, boss) => {
            this.player.hit();
        });

        // 玩家子弹与Boss碰撞
        this.physics.add.overlap(this.bullets, this.boss.sprite, (bullet, boss) => {
            bullet.destroy();
            this.bossHealth -= playerPower * 10;
            this.updateBossHealth();
            
            if (this.bossHealth <= 0) {
                this.boss.defeat();
                this.time.delayedCall(2000, () => {
                    this.scene.start('GameOverScene', { won: true });
                });
            }
        });

        // Boss子弹与玩家碰撞
        this.physics.add.overlap(this.bossBullets, this.player.sprite, (bullet, player) => {
            bullet.destroy();
            this.player.hit();
        });

        // 键盘控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Boss血条
        this.bossHealthBar = this.add.graphics();
        this.updateBossHealth();

        // Boss标题
        this.bossTitle = this.add.text(this.cameras.main.centerX, 50, '最终Boss', {
            font: '40px Arial',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 3
        });
        this.bossTitle.setOrigin(0.5);
    }

    update() {
        // 更新玩家
        this.player.update(this.cursors, this.spaceKey);
        
        // 射击
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.player.shoot(this.bullets);
        }
        
        // 更新Boss
        if (this.bossHealth > 0) {
            this.boss.update(this.player.sprite, this.bossBullets);
        }
        
        // 检查玩家是否掉落
        if (this.player.sprite.y > this.cameras.main.height) {
            this.player.loseLife();
            if (globalLives <= 0) {
                this.scene.start('GameOverScene');
            } else {
                this.scene.restart();
            }
        }
    }

    updateBossHealth() {
        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000, 1);
        this.bossHealthBar.fillRect(100, 20, this.bossHealth * 6, 20);
        this.bossHealthBar.lineStyle(2, 0xffffff);
        this.bossHealthBar.strokeRect(100, 20, this.bossMaxHealth * 6, 20);
    }
}