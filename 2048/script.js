// 2048游戏

// 获取DOM元素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const newGameBtn = document.getElementById('newGameBtn');

// 游戏设置
const boardSize = 4;
let score = 0;
let board = [];

// 初始化游戏
function initGame() {
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 初始化棋盘
    board = [];
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = 0;
        }
    }
    
    // 生成两个初始方块
    generateNewTile();
    generateNewTile();
    
    // 更新UI
    updateBoard();
    
    // 移除游戏结束遮罩
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
}

// 生成新方块
function generateNewTile() {
    const emptyCells = [];
    
    // 找出所有空单元格
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ x: i, y: j });
            }
        }
    }
    
    if (emptyCells.length === 0) {
        return false; // 没有空单元格
    }
    
    // 随机选择一个空单元格
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // 随机生成2或4
    board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    
    return true;
}

// 更新棋盘UI
function updateBoard() {
    // 清空棋盘
    gameBoard.innerHTML = '';
    
    // 重新渲染棋盘
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (board[i][j] !== 0) {
                cell.textContent = board[i][j];
                cell.classList.add(`cell-${board[i][j]}`);
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

// 移动方块（向上）
function moveUp() {
    let moved = false;
    
    for (let j = 0; j < boardSize; j++) {
        // 先移除空格
        const column = [];
        for (let i = 0; i < boardSize; i++) {
            if (board[i][j] !== 0) {
                column.push(board[i][j]);
            }
        }
        
        // 合并相同数字
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                score += column[i];
                column.splice(i + 1, 1);
                moved = true;
            }
        }
        
        // 补零
        while (column.length < boardSize) {
            column.push(0);
        }
        
        // 更新棋盘
        for (let i = 0; i < boardSize; i++) {
            if (board[i][j] !== column[i]) {
                board[i][j] = column[i];
                moved = true;
            }
        }
    }
    
    return moved;
}

// 移动方块（向下）
function moveDown() {
    let moved = false;
    
    for (let j = 0; j < boardSize; j++) {
        // 先移除空格
        const column = [];
        for (let i = boardSize - 1; i >= 0; i--) {
            if (board[i][j] !== 0) {
                column.push(board[i][j]);
            }
        }
        
        // 合并相同数字
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                score += column[i];
                column.splice(i + 1, 1);
                moved = true;
            }
        }
        
        // 补零
        while (column.length < boardSize) {
            column.push(0);
        }
        
        // 更新棋盘
        for (let i = 0; i < boardSize; i++) {
            if (board[boardSize - 1 - i][j] !== column[i]) {
                board[boardSize - 1 - i][j] = column[i];
                moved = true;
            }
        }
    }
    
    return moved;
}

// 移动方块（向左）
function moveLeft() {
    let moved = false;
    
    for (let i = 0; i < boardSize; i++) {
        // 先移除空格
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] !== 0) {
                row.push(board[i][j]);
            }
        }
        
        // 合并相同数字
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row.splice(j + 1, 1);
                moved = true;
            }
        }
        
        // 补零
        while (row.length < boardSize) {
            row.push(0);
        }
        
        // 更新棋盘
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] !== row[j]) {
                board[i][j] = row[j];
                moved = true;
            }
        }
    }
    
    return moved;
}

// 移动方块（向右）
function moveRight() {
    let moved = false;
    
    for (let i = 0; i < boardSize; i++) {
        // 先移除空格
        const row = [];
        for (let j = boardSize - 1; j >= 0; j--) {
            if (board[i][j] !== 0) {
                row.push(board[i][j]);
            }
        }
        
        // 合并相同数字
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row.splice(j + 1, 1);
                moved = true;
            }
        }
        
        // 补零
        while (row.length < boardSize) {
            row.push(0);
        }
        
        // 更新棋盘
        for (let j = 0; j < boardSize; j++) {
            if (board[i][boardSize - 1 - j] !== row[j]) {
                board[i][boardSize - 1 - j] = row[j];
                moved = true;
            }
        }
    }
    
    return moved;
}

// 检查游戏是否结束
function isGameOver() {
    // 检查是否有空格
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === 0) {
                return false;
            }
        }
    }
    
    // 检查是否有可合并的数字
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const current = board[i][j];
            
            // 检查右边
            if (j < boardSize - 1 && board[i][j + 1] === current) {
                return false;
            }
            
            // 检查下边
            if (i < boardSize - 1 && board[i + 1][j] === current) {
                return false;
            }
        }
    }
    
    return true;
}

// 显示游戏结束
function showGameOver() {
    // 创建游戏结束遮罩
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over show';
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <h2>游戏结束</h2>
            <p>最终分数: ${score}</p>
            <button onclick="initGame()">再来一局</button>
        </div>
    `;
    
    document.body.appendChild(gameOverDiv);
}

// 处理键盘输入
function handleKeyPress(e) {
    let moved = false;
    
    switch (e.key) {
        case 'ArrowUp':
            moved = moveUp();
            break;
        case 'ArrowDown':
            moved = moveDown();
            break;
        case 'ArrowLeft':
            moved = moveLeft();
            break;
        case 'ArrowRight':
            moved = moveRight();
            break;
        default:
            return;
    }
    
    if (moved) {
        scoreElement.textContent = score;
        generateNewTile();
        updateBoard();
        
        if (isGameOver()) {
            setTimeout(showGameOver, 500);
        }
    }
}

// 事件监听器
newGameBtn.addEventListener('click', initGame);
document.addEventListener('keydown', handleKeyPress);

// 初始化游戏
initGame();