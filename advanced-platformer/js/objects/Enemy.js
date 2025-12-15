// 敌人对象
class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setScale(1.2);
        this.direction = 1;
        this.moveTimer = 0;
        this.moveDuration = 100;
    }

    update() {
        // 简单的AI移动
        this.moveTimer++;
        
        if (this.moveTimer < this.moveDuration) {
            this.sprite.setVelocityX(50 * this.direction);
        } else if (this.moveTimer < this.moveDuration * 2) {
            this.sprite.setVelocityX(-50 * this.direction);
        } else {
            this.moveTimer = 0;
            this.direction *= -1;
        }
        
        // 检测边缘
        let rayCast = this.scene.physics.raycast(this.sprite.x + (50 * this.direction), this.sprite.y, this.sprite.x + (50 * this.direction), this.sprite.y + 100);
        if (!rayCast) {
            this.direction *= -1;
            this.moveTimer = 0;
        }
    }
}