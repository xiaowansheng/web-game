// 收集品对象
class Collectible {
    constructor(scene, x, y, type = 'collectible') {
        this.scene = scene;
        this.type = type;
        this.sprite = scene.physics.add.sprite(x, y, type);
        this.sprite.setBounce(0.5);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setScale(0.8);
        
        // 添加旋转动画
        scene.tweens.add({
            targets: this.sprite,
            rotation: 2 * Math.PI,
            duration: 2000,
            ease: 'Linear',
            repeat: -1
        });
    }

    // 收集效果
    collect(player) {
        // 根据收集品类型给予不同效果
        switch(this.type) {
            case 'collectible':
                globalScore += 100;
                break;
            case 'powerup':
                playerPower++;
                globalScore += 500;
                break;
            default:
                globalScore += 100;
        }
        
        updateUI();
        
        // 播放收集音效
        // this.scene.sound.play('collect');
        
        // 销毁收集品
        this.sprite.destroy();
    }
}