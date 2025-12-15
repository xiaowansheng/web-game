// 游戏结束场景
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
        // 设置背景
        this.cameras.main.setBackgroundColor('#000000');

        // 根据游戏结果显示不同的标题
        let titleText = data && data.won ? '恭喜你获胜了！' : '游戏结束';
        let titleColor = data && data.won ? '#00ff00' : '#ff0000';

        // 添加标题
        let title = this.add.text(this.cameras.main.centerX, 150, titleText, {
            font: '48px Arial',
            fill: titleColor,
            stroke: '#000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // 添加分数
        let scoreText = this.add.text(this.cameras.main.centerX, 220, `最终分数: ${globalScore}`, {
            font: '32px Arial',
            fill: '#ffffff'
        });
        scoreText.setOrigin(0.5);

        // 添加关卡信息
        let levelText = this.add.text(this.cameras.main.centerX, 260, `到达关卡: ${currentLevel}`, {
            font: '24px Arial',
            fill: '#ffffff'
        });
        levelText.setOrigin(0.5);

        // 重新开始按钮
        let restartButton = this.add.text(this.cameras.main.centerX, 320, '重新开始', {
            font: '32px Arial',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            resetGame();
            this.scene.start('GameScene');
        });
        restartButton.on('pointerover', () => {
            restartButton.setFill('#ffff00');
        });
        restartButton.on('pointerout', () => {
            restartButton.setFill('#00ff00');
        });

        // 返回菜单按钮
        let menuButton = this.add.text(this.cameras.main.centerX, 380, '返回菜单', {
            font: '32px Arial',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 2
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive();
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        menuButton.on('pointerover', () => {
            menuButton.setFill('#ffff00');
        });
        menuButton.on('pointerout', () => {
            menuButton.setFill('#00ffff');
        });

        // 退出游戏按钮
        let exitButton = this.add.text(this.cameras.main.centerX, 440, '退出游戏', {
            font: '32px Arial',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 2
        });
        exitButton.setOrigin(0.5);
        exitButton.setInteractive();
        exitButton.on('pointerdown', () => {
            window.close();
        });
        exitButton.on('pointerover', () => {
            exitButton.setFill('#ffff00');
        });
        exitButton.on('pointerout', () => {
            exitButton.setFill('#ff0000');
        });
    }
}