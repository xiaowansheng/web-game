// 俄罗斯方块游戏

// 获取DOM元素
const gameCanvas = document.getElementById('gameCanvas');
const nextCanvas = document.getElementById('nextCanvas');
const ctx = gameCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 游戏设置
const COLS = 10;
const ROWS = 20;
const TILE_SIZE = 30;
const NEXT_TILE_SIZE = 24;

// 方块类型和颜色
const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

const COLORS = {
    I: '#00ffff',
    O: '#ffff00',
    T: '#8000ff',
    S: '#00ff00',
    Z: '#ff0000',
    J: '#0000ff',
    L: '#ff8000'
};

// 游戏状态
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameSpeed = 1000;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;

// 初始化游戏板
function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }
}

// 随机生成方块
function generatePiece() {
    const shapeKeys = Object.keys(SHAPES);
    const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    return {
        shape: SHAPES[randomShape],
        color: COLORS[randomShape],
        type: randomShape,
        x: Math.floor((COLS - SHAPES[randomShape][0].length) / 2),
        y: 0
    };
}

// 绘制方块
function drawPiece(piece, context, offsetX = 0, offsetY = 0, tileSize = TILE_SIZE) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                context.fillStyle = piece.color;
                context.fillRect(
                    (piece.x + c) * tileSize + offsetX,
                    (piece.y + r) * tileSize + offsetY,
                    tileSize - 1,
                    tileSize - 1
                );
                context.strokeStyle = '#333';
                context.strokeRect(
                    (piece.x + c) * tileSize + offsetX,
                    (piece.y + r) * tileSize + offsetY,
                    tileSize - 1,
                    tileSize - 1
                );
            }
        }
    }
}

// 绘制下一个方块
function drawNextPiece() {
    nextCtx.fillStyle = '#333';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * NEXT_TILE_SIZE) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * NEXT_TILE_SIZE) / 2;
        
        // 创建临时方块对象用于绘制
        const tempPiece = {
            ...nextPiece,
            x: 0,
            y: 0
        };
        
        drawPiece(tempPiece, nextCtx, offsetX, offsetY, NEXT_TILE_SIZE);
    }
}

// 绘制游戏板
function drawBoard() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // 绘制已固定的方块
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                ctx.fillStyle = board[r][c];
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
            }
        }
    }
    
    // 绘制当前方块
    if (currentPiece) {
        drawPiece(currentPiece, ctx);
    }
}

// 旋转方块
function rotatePiece(piece) {
    // 深拷贝当前方块
    const rotatedPiece = {
        ...piece,
        shape: piece.shape[0].map((_, index) => 
            piece.shape.map(row => row[index]).reverse()
        )
    };
    
    return rotatedPiece;
}

// 检查碰撞
function checkCollision(piece, offsetX = 0, offsetY = 0) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                const newX = piece.x + c + offsetX;
                const newY = piece.y + r + offsetY;
                
                // 检查边界碰撞
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                // 检查与已固定方块的碰撞
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// 固定方块到游戏板
function lockPiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                const boardRow = currentPiece.y + r;
                const boardCol = currentPiece.x + c;
                
                if (boardRow >= 0) {
                    board[boardRow][boardCol] = currentPiece.color;
                }
            }
        }
    }
    
    // 检查并消除完整行
    clearLines();
    
    // 生成新方块
    spawnNewPiece();
}

// 消除完整行
function clearLines() {
    let linesCleared = 0;
    
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell)) {
            // 移除完整行
            board.splice(r, 1);
            // 在顶部添加空行
            board.unshift(new Array(COLS).fill(0));
            // 因为移除了一行，需要重新检查当前行
            r++;
            linesCleared++;
        }
    }
    
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// 更新分数
function updateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    lines += linesCleared;
    
    // 更新等级
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
        level = newLevel;
        gameSpeed = Math.max(100, 1000 - (level - 1) * 100);
        if (gameLoop) {
            clearInterval(gameLoop);
            gameLoop = setInterval(gameLoopFunction, gameSpeed);
        }
    }
    
    // 更新UI
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// 生成新方块
function spawnNewPiece() {
    currentPiece = nextPiece || generatePiece();
    nextPiece = generatePiece();
    drawNextPiece();
    
    // 检查游戏是否结束
    if (checkCollision(currentPiece)) {
        gameOver();
    }
}

// 移动方块
function movePiece(offsetX, offsetY) {
    if (!currentPiece || isPaused || isGameOver) return;
    
    if (!checkCollision(currentPiece, offsetX, offsetY)) {
        currentPiece.x += offsetX;
        currentPiece.y += offsetY;
        return true;
    }
    
    return false;
}

// 旋转方块
function rotateCurrentPiece() {
    if (!currentPiece || isPaused || isGameOver) return;
    
    const rotated = rotatePiece(currentPiece);
    if (!checkCollision(rotated)) {
        currentPiece = rotated;
    }
}

// 游戏主循环
function gameLoopFunction() {
    if (isPaused || isGameOver) return;
    
    // 尝试向下移动方块
    if (!movePiece(0, 1)) {
        lockPiece();
    }
    
    drawBoard();
}

// 开始游戏
function startGame() {
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    gameSpeed = 1000;
    isPaused = false;
    isGameOver = false;
    
    // 初始化分数显示
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    
    // 生成初始方块
    nextPiece = generatePiece();
    spawnNewPiece();
    drawNextPiece();
    
    // 开始游戏循环
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameLoopFunction, gameSpeed);
    
    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    pauseBtn.textContent = '暂停';
    
    // 移除游戏结束遮罩
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
}

// 暂停游戏
function pauseGame() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
    
    if (!isPaused) {
        gameLoop = setInterval(gameLoopFunction, gameSpeed);
    } else {
        clearInterval(gameLoop);
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameLoop);
    startGame();
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    // 创建游戏结束遮罩
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over show';
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <h2>游戏结束</h2>
            <p>最终分数: ${score}</p>
            <p>等级: ${level}</p>
            <p>消除行数: ${lines}</p>
            <div>
                <button onclick="startGame()">再来一局</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(gameOverDiv);
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 处理键盘输入
function handleKeyPress(e) {
    if (isGameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            drawBoard();
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            drawBoard();
            break;
        case 'ArrowDown':
            if (movePiece(0, 1)) {
                drawBoard();
            }
            break;
        case 'ArrowUp':
            rotateCurrentPiece();
            drawBoard();
            break;
        case ' ': // 空格快速下落
            while (movePiece(0, 1)) {
                // 持续向下移动直到碰撞
            }
            lockPiece();
            drawBoard();
            break;
    }
}

// 事件监听器
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// 初始化游戏
initBoard();
drawBoard();
drawNextPiece();
pauseBtn.disabled = true;
resetBtn.disabled = true;