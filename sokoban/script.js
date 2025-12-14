// 推箱子游戏
const gameBoard = document.getElementById('game-board');
const levelElement = document.getElementById('level');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const gameStatusElement = document.getElementById('game-status');
const newGameBtn = document.getElementById('new-game-btn');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const levelList = document.getElementById('level-list');

// 游戏常量
const TILE_TYPES = {
    WALL: '#',
    FLOOR: '.',
    PLAYER: '@',
    BOX: '$',
    GOAL: 'o',
    PLAYER_ON_GOAL: '+',
    BOX_ON_GOAL: '*'
};

// 关卡数据
const LEVELS = [
    // 关卡1
    [
        '########',
        '#......#',
        '#.####.#',
        '#.#..#.#',
        '#.#$@#.#',
        '#.# ##.#',
        '#...o.#',
        '########'
    ],
    // 关卡2
    [
        '########',
        '#......#',
        '#.##$#.#',
        '#.#  #.#',
        '#.##@#.#',
        '#..o##.#',
        '#......#',
        '########'
    ],
    // 关卡3
    [
        '########',
        '#......#',
        '#.##$##.#',
        '#.#$ $#.#',
        '#.# @#.#',
        '#.o o##.#',
        '#......#',
        '########'
    ],
    // 关卡4
    [
        '########',
        '#......#',
        '#.##$#.#',
        '#.#$ $#.#',
        '#.# @#.#',
        '#.o##o##',
        '#......#',
        '########'
    ],
    // 关卡5
    [
        '#########',
        '#.......#',
        '#.#####.#',
        '#.#   #.#',
        '#.# $ $#.#',
        '#.#$@$#.#',
        '#.#   #.#',
        '#.o o o.#',
        '#########'
    ]
];

// 游戏状态
let currentLevel = 0;
let board = [];
let playerPos = { row: 0, col: 0 };
let moves = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

// 初始化游戏
function initGame() {
    loadLevel(currentLevel);
    updateLevelSelector();
    updateGameStatus('使用WASD或方向键移动，将箱子推到目标位置');
}

// 加载关卡
function loadLevel(levelIndex) {
    // 停止之前的计时器
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 重置游戏状态
    currentLevel = levelIndex;
    moves = 0;
    timer = 0;
    gameStarted = false;
    
    // 加载关卡数据
    const levelData = LEVELS[levelIndex];
    board = [];
    
    // 解析关卡数据
    for (let row = 0; row < levelData.length; row++) {
        board[row] = [];
        for (let col = 0; col < levelData[row].length; col++) {
            const char = levelData[row][col];
            board[row][col] = char;
            
            // 找到玩家位置
            if (char === TILE_TYPES.PLAYER || char === TILE_TYPES.PLAYER_ON_GOAL) {
                playerPos = { row, col };
            }
        }
    }
    
    // 更新UI
    renderBoard();
    updateLevel();
    updateMoves();
    updateTimer();
    updateGameStatus(`第${currentLevel + 1}关开始！使用方向键移动`);
}

// 渲染棋盘
function renderBoard() {
    // 清空棋盘
    gameBoard.innerHTML = '';
    
    // 设置网格大小
    const rows = board.length;
    const cols = board[0].length;
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 50px)`;
    
    // 渲染每个单元格
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const tile = board[row][col];
            
            // 设置单元格类型
            switch (tile) {
                case TILE_TYPES.WALL:
                    cell.classList.add('wall');
                    break;
                case TILE_TYPES.FLOOR:
                    cell.classList.add('floor');
                    break;
                case TILE_TYPES.GOAL:
                    cell.classList.add('goal');
                    break;
                case TILE_TYPES.PLAYER:
                    cell.classList.add('floor', 'player');
                    break;
                case TILE_TYPES.BOX:
                    cell.classList.add('floor', 'box');
                    break;
                case TILE_TYPES.PLAYER_ON_GOAL:
                    cell.classList.add('goal', 'player', 'on-goal');
                    break;
                case TILE_TYPES.BOX_ON_GOAL:
                    cell.classList.add('goal', 'box', 'on-goal');
                    break;
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

// 更新关卡显示
function updateLevel() {
    levelElement.textContent = currentLevel + 1;
}

// 更新步数
function updateMoves() {
    movesElement.textContent = moves;
}

// 更新计时器
function updateTimer() {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

// 更新游戏状态
function updateGameStatus(message) {
    const statusContent = gameStatusElement.querySelector('p');
    statusContent.textContent = message;
}

// 更新关卡选择器
function updateLevelSelector() {
    levelList.innerHTML = '';
    
    for (let i = 0; i < LEVELS.length; i++) {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = i + 1;
        button.dataset.level = i;
        
        if (i === currentLevel) {
            button.classList.add('current');
        }
        
        button.addEventListener('click', () => loadLevel(i));
        levelList.appendChild(button);
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

// 检查位置是否在边界内
function isInBounds(row, col) {
    return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

// 检查位置是否可以移动到
function isWalkable(row, col) {
    return board[row][col] === TILE_TYPES.FLOOR || board[row][col] === TILE_TYPES.GOAL;
}

// 检查位置是否是箱子
function isBox(row, col) {
    return board[row][col] === TILE_TYPES.BOX || board[row][col] === TILE_TYPES.BOX_ON_GOAL;
}

// 检查位置是否是目标
function isGoal(row, col) {
    return board[row][col] === TILE_TYPES.GOAL || board[row][col] === TILE_TYPES.PLAYER_ON_GOAL || board[row][col] === TILE_TYPES.BOX_ON_GOAL;
}

// 移动玩家
function movePlayer(dx, dy) {
    // 开始计时
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    const newRow = playerPos.row + dx;
    const newCol = playerPos.col + dy;
    
    // 检查新位置是否在边界内
    if (!isInBounds(newRow, newCol)) {
        return false;
    }
    
    if (isWalkable(newRow, newCol)) {
        // 直接移动到新位置
        moveTo(newRow, newCol);
        moves++;
        updateMoves();
        checkWin();
        return true;
    } else if (isBox(newRow, newCol)) {
        // 检查箱子后面的位置
        const boxNewRow = newRow + dx;
        const boxNewCol = newCol + dy;
        
        if (isInBounds(boxNewRow, boxNewCol) && isWalkable(boxNewRow, boxNewCol)) {
            // 移动箱子
            moveBox(newRow, newCol, boxNewRow, boxNewCol);
            // 移动玩家
            moveTo(newRow, newCol);
            moves++;
            updateMoves();
            checkWin();
            return true;
        }
    }
    
    return false;
}

// 移动玩家到新位置
function moveTo(newRow, newCol) {
    const oldRow = playerPos.row;
    const oldCol = playerPos.col;
    
    // 检查原来的位置是否是目标
    const wasOnGoal = isGoal(oldRow, oldCol);
    
    // 更新原来的位置
    if (wasOnGoal) {
        board[oldRow][oldCol] = TILE_TYPES.GOAL;
    } else {
        board[oldRow][oldCol] = TILE_TYPES.FLOOR;
    }
    
    // 更新新位置
    if (isGoal(newRow, newCol)) {
        board[newRow][newCol] = TILE_TYPES.PLAYER_ON_GOAL;
    } else {
        board[newRow][newCol] = TILE_TYPES.PLAYER;
    }
    
    // 更新玩家位置
    playerPos = { row: newRow, col: newCol };
    
    // 重新渲染
    renderBoard();
}

// 移动箱子
function moveBox(fromRow, fromCol, toRow, toCol) {
    // 检查目标位置是否是目标
    const isToGoal = isGoal(toRow, toCol);
    
    // 更新箱子目标位置
    if (isToGoal) {
        board[toRow][toCol] = TILE_TYPES.BOX_ON_GOAL;
    } else {
        board[toRow][toCol] = TILE_TYPES.BOX;
    }
    
    // 更新原来的位置
    const wasFromGoal = isGoal(fromRow, fromCol);
    if (wasFromGoal) {
        board[fromRow][fromCol] = TILE_TYPES.GOAL;
    } else {
        board[fromRow][fromCol] = TILE_TYPES.FLOOR;
    }
}

// 检查是否获胜
function checkWin() {
    // 检查是否所有箱子都在目标位置
    let allBoxesOnGoals = true;
    
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === TILE_TYPES.BOX) {
                allBoxesOnGoals = false;
                break;
            }
        }
        if (!allBoxesOnGoals) break;
    }
    
    if (allBoxesOnGoals) {
        // 停止计时器
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        updateGameStatus(`恭喜通关！用时：${timerElement.textContent}，步数：${moves}`);
    }
}

// 重置关卡
function resetLevel() {
    loadLevel(currentLevel);
    updateGameStatus('关卡已重置');
}

// 下一关
function nextLevel() {
    if (currentLevel < LEVELS.length - 1) {
        loadLevel(currentLevel + 1);
        updateGameStatus(`进入第${currentLevel + 1}关！`);
    } else {
        updateGameStatus('恭喜完成所有关卡！');
    }
}

// 显示提示
function showHint() {
    updateGameStatus('提示：尝试将箱子从不同角度推动');
}

// 键盘事件处理
function handleKeyDown(e) {
    let moved = false;
    
    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            moved = movePlayer(-1, 0);
            break;
        case 's':
        case 'arrowdown':
            moved = movePlayer(1, 0);
            break;
        case 'a':
        case 'arrowleft':
            moved = movePlayer(0, -1);
            break;
        case 'd':
        case 'arrowright':
            moved = movePlayer(0, 1);
            break;
    }
    
    if (moved) {
        updateGameStatus(`已移动 ${moves} 步`);
    }
}

// 事件监听器
newGameBtn.addEventListener('click', initGame);
resetBtn.addEventListener('click', resetLevel);
hintBtn.addEventListener('click', showHint);
nextLevelBtn.addEventListener('click', nextLevel);
document.addEventListener('keydown', handleKeyDown);

// 初始化游戏
initGame();