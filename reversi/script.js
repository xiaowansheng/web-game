// 黑白棋游戏
const gameBoard = document.getElementById('game-board');
const blackScoreElement = document.getElementById('black-score');
const whiteScoreElement = document.getElementById('white-score');
const currentPlayerElement = document.getElementById('current-player');
const gameStatusElement = document.getElementById('game-status');
const newGameBtn = document.getElementById('new-game-btn');
const undoBtn = document.getElementById('undo-btn');
const passBtn = document.getElementById('pass-btn');

// 游戏常量
const BOARD_SIZE = 8;
const BLACK = 'black';
const WHITE = 'white';
const EMPTY = 'empty';

// 游戏状态
let board = [];
let currentPlayer = BLACK;
let blackScore = 2;
let whiteScore = 2;
let gameHistory = [];
let gameOver = false;

// 方向数组：上下左右，以及四个对角线
const directions = [
    [-1, 0],   // 上
    [1, 0],    // 下
    [0, -1],   // 左
    [0, 1],    // 右
    [-1, -1],  // 左上
    [-1, 1],   // 右上
    [1, -1],   // 左下
    [1, 1]     // 右下
];

// 初始化棋盘
function initBoard() {
    // 创建空棋盘
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    
    // 初始棋子位置
    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;
    
    // 重置游戏状态
    currentPlayer = BLACK;
    blackScore = 2;
    whiteScore = 2;
    gameHistory = [];
    gameOver = false;
    
    // 保存初始状态
    saveGameState();
    
    // 更新UI
    renderBoard();
    updateScore();
    updateCurrentPlayer();
    updateGameStatus('黑棋先下，点击空白格子放置棋子');
}

// 渲染棋盘
function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = `cell ${board[row][col]}`;
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 检查是否为合法落子位置
            if (isValidMove(row, col, currentPlayer) && !gameOver) {
                cell.classList.add('valid-move');
                cell.addEventListener('click', () => makeMove(row, col));
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

// 更新分数
function updateScore() {
    blackScoreElement.textContent = blackScore;
    whiteScoreElement.textContent = whiteScore;
}

// 更新当前玩家
function updateCurrentPlayer() {
    currentPlayerElement.textContent = currentPlayer === BLACK ? '黑棋' : '白棋';
}

// 更新游戏状态
function updateGameStatus(message) {
    const statusContent = gameStatusElement.querySelector('p');
    statusContent.textContent = message;
}

// 保存游戏状态
function saveGameState() {
    // 深拷贝棋盘
    const boardCopy = board.map(row => [...row]);
    gameHistory.push({
        board: boardCopy,
        currentPlayer: currentPlayer,
        blackScore: blackScore,
        whiteScore: whiteScore,
        gameOver: gameOver
    });
}

// 撤销功能
function undoMove() {
    if (gameHistory.length <= 1) {
        updateGameStatus('无法撤销初始状态');
        return;
    }
    
    // 移除当前状态
    gameHistory.pop();
    
    // 恢复上一个状态
    const previousState = gameHistory[gameHistory.length - 1];
    board = previousState.board.map(row => [...row]);
    currentPlayer = previousState.currentPlayer;
    blackScore = previousState.blackScore;
    whiteScore = previousState.whiteScore;
    gameOver = previousState.gameOver;
    
    // 更新UI
    renderBoard();
    updateScore();
    updateCurrentPlayer();
    updateGameStatus('已撤销上一步');
}

// 检查是否为合法落子位置
function isValidMove(row, col, player) {
    // 检查位置是否为空
    if (board[row][col] !== EMPTY) {
        return false;
    }
    
    // 检查八个方向
    for (const [dr, dc] of directions) {
        if (checkDirection(row, col, dr, dc, player)) {
            return true;
        }
    }
    
    return false;
}

// 检查特定方向是否可以翻转棋子
function checkDirection(row, col, dr, dc, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    let r = row + dr;
    let c = col + dc;
    let hasOpponent = false;
    
    // 检查是否有连续的对方棋子
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === opponent) {
            hasOpponent = true;
            r += dr;
            c += dc;
        } else if (board[r][c] === player) {
            // 找到己方棋子，返回true
            return hasOpponent;
        } else {
            // 遇到空白格，返回false
            return false;
        }
    }
    
    return false;
}

// 翻转特定方向的棋子
function flipDirection(row, col, dr, dc, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    let r = row + dr;
    let c = col + dc;
    const flippedPositions = [];
    
    // 收集要翻转的棋子位置
    while (board[r][c] === opponent) {
        flippedPositions.push({row: r, col: c});
        r += dr;
        c += dc;
    }
    
    // 翻转棋子
    for (const pos of flippedPositions) {
        board[pos.row][pos.col] = player;
    }
    
    return flippedPositions.length;
}

// 落子
function makeMove(row, col) {
    if (gameOver) {
        updateGameStatus('游戏已结束，点击新游戏重新开始');
        return;
    }
    
    // 检查是否为合法落子
    if (!isValidMove(row, col, currentPlayer)) {
        updateGameStatus('非法落子位置');
        return;
    }
    
    // 保存当前状态
    saveGameState();
    
    // 放置棋子
    board[row][col] = currentPlayer;
    
    // 翻转八个方向的棋子
    let flippedCount = 0;
    for (const [dr, dc] of directions) {
        if (checkDirection(row, col, dr, dc, currentPlayer)) {
            flippedCount += flipDirection(row, col, dr, dc, currentPlayer);
        }
    }
    
    // 更新分数
    if (currentPlayer === BLACK) {
        blackScore += 1 + flippedCount;
        whiteScore -= flippedCount;
    } else {
        whiteScore += 1 + flippedCount;
        blackScore -= flippedCount;
    }
    
    // 切换玩家
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    
    // 检查当前玩家是否有合法落子
    let hasValidMove = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (isValidMove(r, c, currentPlayer)) {
                hasValidMove = true;
                break;
            }
        }
        if (hasValidMove) break;
    }
    
    // 如果当前玩家没有合法落子，切换回另一个玩家
    if (!hasValidMove) {
        const originalPlayer = currentPlayer;
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        
        // 检查另一个玩家是否有合法落子
        hasValidMove = false;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (isValidMove(r, c, currentPlayer)) {
                    hasValidMove = true;
                    break;
                }
            }
            if (hasValidMove) break;
        }
        
        if (!hasValidMove) {
            // 双方都没有合法落子，游戏结束
            gameOver = true;
            const winner = blackScore > whiteScore ? '黑棋' : whiteScore > blackScore ? '白棋' : '平局';
            updateGameStatus(`游戏结束！${winner}获胜！`);
        } else {
            updateGameStatus(`${originalPlayer}无合法落子，${currentPlayer === BLACK ? '黑棋' : '白棋'}继续`);
        }
    } else {
        updateGameStatus(`${currentPlayer === BLACK ? '黑棋' : '白棋'}的回合`);
    }
    
    // 更新UI
    renderBoard();
    updateScore();
    updateCurrentPlayer();
}

// 跳过回合
function passTurn() {
    if (gameOver) {
        updateGameStatus('游戏已结束');
        return;
    }
    
    // 检查当前玩家是否有合法落子
    let hasValidMove = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (isValidMove(r, c, currentPlayer)) {
                hasValidMove = true;
                break;
            }
        }
        if (hasValidMove) break;
    }
    
    if (hasValidMove) {
        updateGameStatus('当前玩家有合法落子，不能跳过');
        return;
    }
    
    // 保存当前状态
    saveGameState();
    
    // 切换玩家
    const originalPlayer = currentPlayer;
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    
    // 检查新玩家是否有合法落子
    hasValidMove = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (isValidMove(r, c, currentPlayer)) {
                hasValidMove = true;
                break;
            }
        }
        if (hasValidMove) break;
    }
    
    if (!hasValidMove) {
        // 双方都没有合法落子，游戏结束
        gameOver = true;
        const winner = blackScore > whiteScore ? '黑棋' : whiteScore > blackScore ? '白棋' : '平局';
        updateGameStatus(`游戏结束！${winner}获胜！`);
    } else {
        updateGameStatus(`${originalPlayer}跳过回合，${currentPlayer === BLACK ? '黑棋' : '白棋'}继续`);
    }
    
    // 更新UI
    renderBoard();
    updateCurrentPlayer();
}

// 新游戏
function newGame() {
    initBoard();
    updateGameStatus('黑棋先下，点击空白格子放置棋子');
}

// 初始化游戏
initBoard();

// 事件监听器
newGameBtn.addEventListener('click', newGame);
undoBtn.addEventListener('click', undoMove);
passBtn.addEventListener('click', passTurn);