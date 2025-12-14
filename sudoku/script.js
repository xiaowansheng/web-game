// 数独游戏
const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const difficultySelect = document.getElementById('difficulty-select');
const gameStatusElement = document.getElementById('game-status');
const newGameBtn = document.getElementById('new-game-btn');
const checkBtn = document.getElementById('check-btn');
const hintBtn = document.getElementById('hint-btn');
const solveBtn = document.getElementById('solve-btn');
const numberPanel = document.getElementById('number-panel');

// 游戏常量
const BOARD_SIZE = 9;
const BOX_SIZE = 3;
const DIFFICULTY_LEVELS = {
    easy: 45,    // 剩余45个数字
    medium: 35,  // 剩余35个数字
    hard: 25     // 剩余25个数字
};

// 游戏状态
let board = [];
let solution = [];
let initialBoard = [];
let selectedCell = null;
let moves = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

// 初始化游戏
function initGame() {
    // 生成数独解
    solution = generateSudoku();
    
    // 复制解作为当前棋盘
    board = solution.map(row => [...row]);
    
    // 根据难度移除数字
    const difficulty = difficultySelect.value;
    const cellsToRemove = BOARD_SIZE * BOARD_SIZE - DIFFICULTY_LEVELS[difficulty];
    removeCells(cellsToRemove);
    
    // 保存初始棋盘状态
    initialBoard = board.map(row => [...row]);
    
    // 重置游戏状态
    selectedCell = null;
    moves = 0;
    timer = 0;
    gameStarted = false;
    
    // 停止之前的计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 更新UI
    renderBoard();
    updateMoves();
    updateTimer();
    updateGameStatus(`新游戏开始！难度：${difficultySelect.options[difficultySelect.selectedIndex].text}`);
}

// 生成数独解
function generateSudoku() {
    // 创建空棋盘
    const board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    
    // 填充对角线的3x3宫格
    for (let i = 0; i < BOARD_SIZE; i += BOX_SIZE) {
        fillBox(board, i, i);
    }
    
    // 递归填充剩余格子
    solveSudoku(board);
    
    return board;
}

// 填充3x3宫格
function fillBox(board, row, col) {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    
    for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
            board[row + i][col + j] = numbers[index++];
        }
    }
}

// 打乱数组
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 解数独（递归回溯算法）
function solveSudoku(board) {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
        return true; // 找到解
    }
    
    const [row, col] = emptyCell;
    
    for (let num = 1; num <= BOARD_SIZE; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            
            if (solveSudoku(board)) {
                return true;
            }
            
            board[row][col] = 0; // 回溯
        }
    }
    
    return false; // 无解
}

// 查找空单元格
function findEmptyCell(board) {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

// 检查数字是否合法
function isValid(board, row, col, num) {
    // 检查行
    for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[row][c] === num && c !== col) {
            return false;
        }
    }
    
    // 检查列
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (board[r][col] === num && r !== row) {
            return false;
        }
    }
    
    // 检查3x3宫格
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    
    for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
            if (board[r][c] === num && (r !== row || c !== col)) {
                return false;
            }
        }
    }
    
    return true;
}

// 根据难度移除数字
function removeCells(cellsToRemove) {
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
}

// 渲染棋盘
function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const value = board[row][col];
            if (value !== 0) {
                cell.textContent = value;
                if (initialBoard[row][col] !== 0) {
                    cell.classList.add('initial');
                } else {
                    cell.classList.add('user-input');
                }
            }
            
            // 添加点击事件
            cell.addEventListener('click', () => selectCell(row, col));
            
            gameBoard.appendChild(cell);
        }
    }
    
    // 如果有选中的单元格，高亮显示
    if (selectedCell) {
        const { row, col } = selectedCell;
        highlightCell(row, col);
    }
}

// 选择单元格
function selectCell(row, col) {
    // 如果是初始数字，不能修改
    if (initialBoard[row][col] !== 0) {
        return;
    }
    
    // 开始计时
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // 更新选中单元格
    selectedCell = { row, col };
    
    // 渲染棋盘和高亮
    renderBoard();
}

// 高亮选中的单元格
function highlightCell(row, col) {
    // 移除之前的高亮
    document.querySelectorAll('.cell.selected, .cell.highlight').forEach(cell => {
        cell.classList.remove('selected', 'highlight');
    });
    
    // 高亮选中单元格
    const selectedCellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (selectedCellElement) {
        selectedCellElement.classList.add('selected');
    }
}

// 开始计时器
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

// 更新计时器显示
function updateTimer() {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

// 更新步数
function updateMoves() {
    movesElement.textContent = moves;
}

// 更新游戏状态
function updateGameStatus(message) {
    const statusContent = gameStatusElement.querySelector('p');
    statusContent.textContent = message;
}

// 设置单元格值
function setCellValue(value) {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // 如果是初始数字，不能修改
    if (initialBoard[row][col] !== 0) {
        return;
    }
    
    // 如果值没有变化，不增加步数
    if (board[row][col] === value) {
        return;
    }
    
    // 更新棋盘
    board[row][col] = value;
    moves++;
    
    // 更新UI
    renderBoard();
    updateMoves();
    
    // 检查游戏是否完成
    if (isGameComplete()) {
        endGame();
    }
}

// 检查游戏是否完成
function isGameComplete() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === 0) {
                return false;
            }
        }
    }
    return true;
}

// 结束游戏
function endGame() {
    // 停止计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 检查是否正确
    if (isCorrect()) {
        updateGameStatus(`恭喜完成！用时：${timerElement.textContent}，步数：${moves}`);
    } else {
        updateGameStatus('游戏完成，但答案有错误');
    }
}

// 检查答案是否正确
function isCorrect() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }
    return true;
}

// 检查当前答案
function checkAnswer() {
    let hasError = false;
    
    // 移除之前的错误标记
    document.querySelectorAll('.cell.error, .cell.correct').forEach(cell => {
        cell.classList.remove('error', 'correct');
    });
    
    // 检查每个单元格
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cellElement && initialBoard[row][col] === 0) {
                if (board[row][col] === 0) {
                    // 空单元格不标记
                    continue;
                } else if (board[row][col] === solution[row][col]) {
                    cellElement.classList.add('correct');
                } else {
                    cellElement.classList.add('error');
                    hasError = true;
                }
            }
        }
    }
    
    if (hasError) {
        updateGameStatus('答案有错误，错误单元格已标记为红色');
    } else {
        updateGameStatus('当前答案正确！');
    }
}

// 显示提示
function showHint() {
    // 如果有选中的单元格且为空，直接填充正确值
    if (selectedCell) {
        const { row, col } = selectedCell;
        if (board[row][col] === 0) {
            setCellValue(solution[row][col]);
            updateGameStatus(`提示：第${row + 1}行第${col + 1}列应为${solution[row][col]}`);
            return;
        }
    }
    
    // 否则随机找一个空单元格填充
    const emptyCells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        setCellValue(solution[row][col]);
        updateGameStatus(`提示：第${row + 1}行第${col + 1}列应为${solution[row][col]}`);
    }
}

// 自动求解
function solveSudokuAutomatically() {
    // 停止计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 填充解决方案
    board = solution.map(row => [...row]);
    renderBoard();
    updateGameStatus('已自动求解完成');
}

// 开始计时器
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

// 事件监听器
newGameBtn.addEventListener('click', initGame);
checkBtn.addEventListener('click', checkAnswer);
hintBtn.addEventListener('click', showHint);
solveBtn.addEventListener('click', solveSudokuAutomatically);

// 数字面板点击事件
numberPanel.addEventListener('click', (e) => {
    if (e.target.classList.contains('number-btn')) {
        const value = e.target.textContent === '清除' ? 0 : parseInt(e.target.textContent);
        setCellValue(value);
    }
});

// 键盘事件
document.addEventListener('keydown', (e) => {
    // 数字键输入
    if (e.key >= '1' && e.key <= '9') {
        setCellValue(parseInt(e.key));
    }
    // Delete或Backspace清除
    if (e.key === 'Delete' || e.key === 'Backspace') {
        setCellValue(0);
    }
    // 方向键导航
    if (selectedCell) {
        let { row, col } = selectedCell;
        switch (e.key) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                selectCell(row, col);
                break;
            case 'ArrowDown':
                row = Math.min(BOARD_SIZE - 1, row + 1);
                selectCell(row, col);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                selectCell(row, col);
                break;
            case 'ArrowRight':
                col = Math.min(BOARD_SIZE - 1, col + 1);
                selectCell(row, col);
                break;
        }
    }
});

// 初始化游戏
initGame();