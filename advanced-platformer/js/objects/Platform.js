// 平台对象
class Platform {
    constructor(scene, x, y, width = 100, height = 20) {
        this.scene = scene;
        this.sprite = scene.physics.add.staticSprite(x, y, 'platform');
        this.sprite.setScale(width / 100, height / 20);
        this.sprite.refreshBody();
    }

    // 可以添加平台的特殊功能，如移动、旋转等
    makeMoving(x1, x2, speed = 50) {
        this.sprite.body.immovable = false;
        this.scene.tweens.add({
            targets: this.sprite,
            x: { from: x1, to: x2 },
            duration: (Math.abs(x2 - x1) / speed) * 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }

    makeRotating(speed = 0.01) {
        this.sprite.body.immovable = true;
        this.scene.tweens.add({
            targets: this.sprite,
            angle: 360,
            duration: Math.abs(360 / speed),
            ease: 'Linear',
            repeat: -1
        });
    }
}