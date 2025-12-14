// 记忆翻牌游戏

// 获取DOM元素
const gameBoard = document.getElementById('game-board');
const movesElement = document.getElementById('moves');
const matchesElement = document.getElementById('matches');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverElement = document.getElementById('game-over');
const finalMovesElement = document.getElementById('final-moves');
const finalTimeElement = document.getElementById('final-time');
const playAgainBtn = document.getElementById('play-again');

// 游戏设置
const symbols = ['🎮', '🎯', '🎨', '🎪', '🎭', '🎪', '🎮', '🎯', '🎨', '🎭', '🎲', '🎲'];
const cardCount = symbols.length;

// 游戏状态
let cards = [];
let flippedCards = [];
let matches = 0;
let moves = 0;
let time = 0;
let timer = null;
let isGameActive = false;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    cards = [];
    flippedCards = [];
    matches = 0;
    moves = 0;
    time = 0;
    isGameActive = true;
    
    // 更新UI
    movesElement.textContent = moves;
    matchesElement.textContent = matches;
    timeElement.textContent = time;
    gameOverElement.classList.remove('show');
    
    // 清空游戏板
    gameBoard.innerHTML = '';
    
    // 生成卡片
    generateCards();
    
    // 开始计时
    startTimer();
}

// 生成卡片
function generateCards() {
    // 创建卡片数组
    const cardSymbols = [...symbols];
    
    // 洗牌算法
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 打乱卡片
    shuffle(cardSymbols);
    
    // 创建卡片元素
    for (let i = 0; i < cardCount; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.symbol = cardSymbols[i];
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
        cards.push(card);
    }
}

// 翻牌功能
function flipCard() {
    if (!isGameActive) return;
    
    const card = this;
    
    // 检查是否可以翻牌
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    // 检查是否已经翻了两张牌
    if (flippedCards.length >= 2) {
        return;
    }
    
    // 翻牌
    card.classList.add('flipped');
    card.textContent = card.dataset.symbol;
    
    // 添加到已翻牌列表
    flippedCards.push(card);
    
    // 检查是否翻了两张牌
    if (flippedCards.length === 2) {
        moves++;
        movesElement.textContent = moves;
        
        // 检查匹配
        setTimeout(checkMatch, 1000);
    }
}

// 检查匹配
function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        // 匹配成功
        card1.classList.add('matched');
        card2.classList.add('matched');
        matches++;
        matchesElement.textContent = matches;
        
        // 检查游戏是否结束
        if (matches === cardCount / 2) {
            gameOver();
        }
    } else {
        // 匹配失败，翻回去
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
    }
    
    // 清空已翻牌列表
    flippedCards = [];
}

// 开始计时
function startTimer() {
    if (timer) {
        clearInterval(timer);
    }
    
    time = 0;
    timeElement.textContent = time;
    
    timer = setInterval(() => {
        time++;
        timeElement.textContent = time;
    }, 1000);
}

// 停止计时
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// 游戏结束
function gameOver() {
    isGameActive = false;
    stopTimer();
    
    // 更新游戏结束UI
    finalMovesElement.textContent = moves;
    finalTimeElement.textContent = time;
    gameOverElement.classList.add('show');
}

// 重置游戏
function resetGame() {
    stopTimer();
    initGame();
}

// 事件监听器
startBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

// 初始化游戏
initGame();