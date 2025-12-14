// 剪刀石头布游戏
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const roundElement = document.getElementById('round');
const gameMessageElement = document.getElementById('game-message');
const playerResultElement = document.getElementById('player-result');
const computerResultElement = document.getElementById('computer-result');
const resetBtn = document.getElementById('reset-btn');
const choiceButtons = document.querySelectorAll('.choice[data-choice]');

// 游戏状态
let playerScore = 0;
let computerScore = 0;
let round = 1;
let gameEnded = false;

// 手势图标映射
const choiceIcons = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
};

// 手势文本映射
const choiceTexts = {
    rock: '石头',
    paper: '布',
    scissors: '剪刀'
};

// 游戏规则：key 击败 value
const rules = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
};

// 初始化游戏
function initGame() {
    playerScore = 0;
    computerScore = 0;
    round = 1;
    gameEnded = false;
    updateScore();
    updateRound();
    updateGameMessage('游戏开始！选择你的手势', 'win');
    resetResults();
    enableButtons();
}

// 更新分数
function updateScore() {
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

// 更新回合
function updateRound() {
    roundElement.textContent = round;
}

// 更新游戏消息
function updateGameMessage(message, type) {
    gameMessageElement.textContent = message;
    gameMessageElement.className = `game-message ${type}`;
}

// 重置结果显示
function resetResults() {
    playerResultElement.querySelector('.result-icon').textContent = '?';
    playerResultElement.querySelector('.result-text').textContent = '选择你的手势';
    computerResultElement.querySelector('.result-icon').textContent = '?';
    computerResultElement.querySelector('.result-text').textContent = '等待选择';
}

// 禁用按钮
function disableButtons() {
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
}

// 启用按钮
function enableButtons() {
    choiceButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
}

// 高亮选择
function highlightChoice(choice) {
    choiceButtons.forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-choice="${choice}"]`).classList.add('selected');
}

// 生成电脑选择
function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

// 显示结果
function showResults(playerChoice, computerChoice) {
    // 更新玩家结果
    playerResultElement.querySelector('.result-icon').textContent = choiceIcons[playerChoice];
    playerResultElement.querySelector('.result-text').textContent = `你选择了${choiceTexts[playerChoice]}`;
    
    // 更新电脑结果
    computerResultElement.querySelector('.result-icon').textContent = choiceIcons[computerChoice];
    computerResultElement.querySelector('.result-text').textContent = `电脑选择了${choiceTexts[computerChoice]}`;
}

// 判定胜负
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    } else if (rules[playerChoice] === computerChoice) {
        return 'player';
    } else {
        return 'computer';
    }
}

// 处理游戏结束
function checkGameEnd() {
    if (playerScore >= 5 || computerScore >= 5) {
        gameEnded = true;
        const winner = playerScore >= 5 ? '玩家' : '电脑';
        updateGameMessage(`${winner}获胜！游戏结束！`, winner === 'player' ? 'win' : 'lose');
        disableButtons();
    }
}

// 处理玩家选择
function handlePlayerChoice(playerChoice) {
    if (gameEnded) return;
    
    // 高亮选择
    highlightChoice(playerChoice);
    
    // 禁用按钮防止重复点击
    disableButtons();
    
    // 生成电脑选择
    const computerChoice = getComputerChoice();
    
    // 显示结果
    showResults(playerChoice, computerChoice);
    
    // 判定胜负
    const winner = determineWinner(playerChoice, computerChoice);
    
    // 更新分数和消息
    if (winner === 'player') {
        playerScore++;
        updateGameMessage(`你赢了这回合！${choiceTexts[playerChoice]}击败了${choiceTexts[computerChoice]}`, 'win');
    } else if (winner === 'computer') {
        computerScore++;
        updateGameMessage(`你输了这回合！${choiceTexts[computerChoice]}击败了${choiceTexts[playerChoice]}`, 'lose');
    } else {
        updateGameMessage(`平局！你们都选择了${choiceTexts[playerChoice]}`, 'draw');
    }
    
    // 更新分数
    updateScore();
    
    // 检查游戏是否结束
    checkGameEnd();
    
    // 如果游戏未结束，准备下一回合
    if (!gameEnded) {
        round++;
        updateRound();
        
        // 延迟重置结果，准备下一回合
        setTimeout(() => {
            resetResults();
            enableButtons();
        }, 1500);
    }
}

// 事件监听器
choiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const choice = btn.dataset.choice;
        handlePlayerChoice(choice);
    });
});

resetBtn.addEventListener('click', initGame);

// 键盘支持
document.addEventListener('keydown', (e) => {
    if (gameEnded) return;
    
    switch(e.key.toLowerCase()) {
        case '1':
        case 'r':
            handlePlayerChoice('rock');
            break;
        case '2':
        case 'p':
            handlePlayerChoice('paper');
            break;
        case '3':
        case 's':
            handlePlayerChoice('scissors');
            break;
        case ' ':
            if (gameEnded) {
                initGame();
            }
            break;
    }
});

// 初始化游戏
initGame();