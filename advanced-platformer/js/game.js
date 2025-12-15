// 游戏主配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        PreloadScene,
        MenuScene,
        GameScene,
        BossScene,
        GameOverScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 游戏全局变量
let game;
let globalScore = 0;
let globalLives = 3;
let currentLevel = 1;
let playerLevel = 1;
let playerPower = 1;

// 创建游戏实例
game = new Phaser.Game(config);

// 更新UI显示
function updateUI() {
    document.getElementById('score').textContent = `分数: ${globalScore}`;
    document.getElementById('lives').textContent = `生命值: ${globalLives}`;
    document.getElementById('level').textContent = `关卡: ${currentLevel}`;
}

// 重置游戏状态
function resetGame() {
    globalScore = 0;
    globalLives = 3;
    currentLevel = 1;
    playerLevel = 1;
    playerPower = 1;
    updateUI();
}