class Minesweeper {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.minesCount = 10;
        this.board = [];
        this.cells = [];
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateMinesCount();
        this.updateTimer();
    }
    
    createBoard() {
        // 初始化游戏板
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0
                };
            }
        }
        
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // 设置网格布局
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 30px)`;
        
        this.cells = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加鼠标事件
                cell.addEventListener('click', (e) => this.handleLeftClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                
                gameBoard.appendChild(cell);
                this.cells.push(cell);
            }
        }
    }
    
    bindEvents() {
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        
        // 难度选择
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.setDifficulty(difficulty);
            });
        });
    }
    
    handleLeftClick(event, row, col) {
        if (this.gameOver) return;
        
        // 如果是首次点击，生成地雷
        if (!this.gameStarted) {
            this.generateMines(row, col);
            this.calculateAdjacentMines();
            this.startTimer();
            this.gameStarted = true;
        }
        
        // 揭开格子
        this.revealCell(row, col);
        
        // 检查游戏胜利
        this.checkWin();
    }
    
    handleRightClick(event, row, col) {
        event.preventDefault();
        if (this.gameOver) return;
        
        const cell = this.board[row][col];
        
        // 不能标记已揭开的格子
        if (cell.isRevealed) return;
        
        // 切换标记状态
        cell.isFlagged = !cell.isFlagged;
        
        if (cell.isFlagged) {
            this.flaggedCount++;
        } else {
            this.flaggedCount--;
        }
        
        // 更新UI
        this.updateCellUI(row, col);
        this.updateMinesCount();
    }
    
    generateMines(safeRow, safeCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.minesCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 确保不在首次点击的格子及其周围放置地雷
            if ((row === safeRow && col === safeCol) || 
                Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1) {
                continue;
            }
            
            if (!this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }
    
    calculateAdjacentMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine) continue;
                
                let count = 0;
                
                // 检查周围8个格子
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        
                        const r = row + dr;
                        const c = col + dc;
                        
                        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                            if (this.board[r][c].isMine) {
                                count++;
                            }
                        }
                    }
                }
                
                this.board[row][col].adjacentMines = count;
            }
        }
    }
    
    revealCell(row, col) {
        // 检查边界
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return;
        }
        
        const cell = this.board[row][col];
        
        // 如果格子已揭开或已标记，返回
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        // 揭开格子
        cell.isRevealed = true;
        this.revealedCount++;
        
        // 更新UI
        this.updateCellUI(row, col);
        
        // 如果是地雷，游戏结束
        if (cell.isMine) {
            this.gameOver = true;
            this.stopTimer();
            this.revealAllMines();
            this.showGameOver('游戏结束！你踩到了地雷。');
            return;
        }
        
        // 如果周围没有地雷，递归揭开相邻格子
        if (cell.adjacentMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    this.revealCell(row + dr, col + dc);
                }
            }
        }
    }
    
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMine) {
                    cell.isRevealed = true;
                    this.updateCellUI(row, col);
                }
            }
        }
    }
    
    updateCellUI(row, col) {
        const cell = this.board[row][col];
        const cellElement = this.cells[row * this.cols + col];
        
        // 重置类名
        cellElement.className = 'cell';
        
        if (cell.isRevealed) {
            cellElement.classList.add('revealed');
            
            if (cell.isMine) {
                cellElement.classList.add('mine');
            } else if (cell.adjacentMines > 0) {
                cellElement.classList.add(`number-${cell.adjacentMines}`);
                cellElement.textContent = cell.adjacentMines;
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flagged');
        }
    }
    
    checkWin() {
        // 计算需要揭开的格子数量
        const totalCells = this.rows * this.cols;
        const safeCells = totalCells - this.minesCount;
        
        if (this.revealedCount === safeCells) {
            this.gameOver = true;
            this.stopTimer();
            this.showGameOver(`恭喜你！扫雷成功！用时 ${this.timer} 秒。`);
        }
    }
    
    showGameOver(message) {
        setTimeout(() => {
            alert(message);
        }, 100);
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        document.getElementById('timer').textContent = this.timer;
    }
    
    updateMinesCount() {
        const remainingMines = this.minesCount - this.flaggedCount;
        document.getElementById('mines-count').textContent = remainingMines;
    }
    
    setDifficulty(difficulty) {
        const settings = this.difficulties[difficulty];
        
        this.rows = settings.rows;
        this.cols = settings.cols;
        this.minesCount = settings.mines;
        
        // 更新难度按钮状态
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // 重新初始化游戏
        this.createBoard();
        this.renderBoard();
        this.updateMinesCount();
        this.updateTimer();
    }
    
    restart() {
        // 重新初始化游戏
        this.createBoard();
        this.renderBoard();
        this.updateMinesCount();
        this.updateTimer();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});