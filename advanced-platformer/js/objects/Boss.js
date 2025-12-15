// Boss对象
class Boss {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'boss');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setScale(2);
        this.attackTimer = 0;
        this.attackInterval = 150;
        this.moveTimer = 0;
        this.moveDuration = 200;
        this.direction = -1;
    }

    update(player, bulletGroup) {
        // Boss移动AI
        this.moveTimer++;
        
        if (this.moveTimer < this.moveDuration) {
            this.sprite.setVelocityX(80 * this.direction);
        } else if (this.moveTimer < this.moveDuration * 2) {
            this.sprite.setVelocityX(-80 * this.direction);
        } else {
            this.moveTimer = 0;
            this.direction *= -1;
        }
        
        // 攻击玩家
        this.attackTimer++;
        if (this.attackTimer >= this.attackInterval) {
            this.attack(player, bulletGroup);
            this.attackTimer = 0;
        }
    }

    attack(player, bulletGroup) {
        // 向玩家发射子弹
        let angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, player.x, player.y);
        let bullet = bulletGroup.create(this.sprite.x, this.sprite.y, 'bullet');
        
        // 设置子弹速度和旋转
        bullet.setVelocityX(Math.cos(angle) * 300);
        bullet.setVelocityY(Math.sin(angle) * 300);
        bullet.setRotation(angle + Math.PI / 2);
        bullet.setScale(1);
        bullet.setTint(0xff0000);
        
        // 播放射击音效
        // this.scene.sound.play('shoot');
    }

    defeat() {
        // Boss被击败的效果
        this.sprite.setTint(0x00ff00);
        this.sprite.setVelocityX(0);
        this.sprite.setVelocityY(0);
        
        // 添加爆炸效果
        // this.scene.add.particles('explosion').createEmitter({
        //     x: this.sprite.x,
        //     y: this.sprite.y,
        //     speed: { min: -100, max: 100 },
        //     angle: { min: 0, max: 360 },
        //     scale: { start: 1, end: 0 },
        //     lifespan: 1000,
        //     quantity: 100
        // });
        
        // 播放胜利音效
        // this.scene.sound.play('victory');
    }
}