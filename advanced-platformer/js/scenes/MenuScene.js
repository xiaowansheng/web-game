// 菜单场景
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // 设置背景
        this.cameras.main.setBackgroundColor('#000022');

        // 添加标题
        let title = this.add.text(this.cameras.main.centerX, 150, '高级平台跳跃游戏', {
            font: '48px Arial',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // 添加副标题
        let subtitle = this.add.text(this.cameras.main.centerX, 220, '使用方向键移动，空格键跳跃，X键射击', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        subtitle.setOrigin(0.5);

        // 开始游戏按钮
        let startButton = this.add.text(this.cameras.main.centerX, 300, '开始游戏', {
            font: '32px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            resetGame();
            this.scene.start('GameScene');
        });
        startButton.on('pointerover', () => {
            startButton.setFill('#ffff00');
        });
        startButton.on('pointerout', () => {
            startButton.setFill('#00ff00');
        });

        // 继续游戏按钮
        let continueButton = this.add.text(this.cameras.main.centerX, 360, '继续游戏', {
            font: '32px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2
        });
        continueButton.setOrigin(0.5);
        continueButton.setInteractive();
        continueButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        continueButton.on('pointerover', () => {
            continueButton.setFill('#ffff00');
        });
        continueButton.on('pointerout', () => {
            continueButton.setFill('#00ff00');
        });

        // 退出按钮
        let exitButton = this.add.text(this.cameras.main.centerX, 420, '退出游戏', {
            font: '32px Arial',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 2
        });
        exitButton.setOrigin(0.5);
        exitButton.setInteractive();
        exitButton.on('pointerdown', () => {
            // 在浏览器环境中，退出游戏通常意味着返回上一页或关闭标签
            window.close();
        });
        exitButton.on('pointerover', () => {
            exitButton.setFill('#ffff00');
        });
        exitButton.on('pointerout', () => {
            exitButton.setFill('#ff0000');
        });

        // 添加动画效果
        this.tweens.add({
            targets: title,
            y: 160,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }
}