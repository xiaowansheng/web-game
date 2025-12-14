class Match3Game {
    constructor() {
        this.rows = 8;
        this.cols = 8;
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.selectedTile = null;
        this.gameRunning = true;
        this.gameOver = false;
        
        this.patterns = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🍍', '🥝', '🥭'];
        this.targetScore = 1000;
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateUI();
    }
    
    createBoard() {
        // 创建游戏板
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // 随机生成图案，确保初始没有匹配
                let pattern;
                do {
                    pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
                } while (this.hasInitialMatch(row, col, pattern));
                
                this.board[row][col] = {
                    pattern: pattern,
                    matched: false,
                    row: row,
                    col: col
                };
            }
        }
    }
    
    hasInitialMatch(row, col, pattern) {
        // 检查横向是否有匹配
        if (col >= 2) {
            if (this.board[row][col-1] && this.board[row][col-2] && 
                this.board[row][col-1].pattern === pattern && 
                this.board[row][col-2].pattern === pattern) {
                return true;
            }
        }
        
        // 检查纵向是否有匹配
        if (row >= 2) {
            if (this.board[row-1] && this.board[row-1][col] && 
                this.board[row-2] && this.board[row-2][col] && 
                this.board[row-1][col].pattern === pattern && 
                this.board[row-2][col].pattern === pattern) {
                return true;
            }
        }
        
        return false;
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                tile.textContent = this.board[row][col].pattern;
                
                tile.addEventListener('click', () => this.handleTileClick(row, col));
                
                gameBoard.appendChild(tile);
            }
        }
    }
    
    bindEvents() {
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }
    
    handleTileClick(row, col) {
        if (this.gameOver) return;
        
        const tile = this.board[row][col];
        
        if (!this.selectedTile) {
            // 选择第一个方块
            this.selectedTile = { row, col };
            this.highlightTile(row, col);
        } else {
            // 选择第二个方块
            const selectedRow = this.selectedTile.row;
            const selectedCol = this.selectedTile.col;
            
            // 检查是否是相邻方块
            if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
                // 交换方块
                this.swapTiles(selectedRow, selectedCol, row, col);
                
                // 检查是否有匹配
                if (this.checkMatches()) {
                    // 有匹配，减少步数
                    this.moves--;
                    this.updateUI();
                    
                    // 处理匹配
                    this.processMatches();
                } else {
                    // 没有匹配，交换回来
                    this.swapTiles(row, col, selectedRow, selectedCol);
                }
            }
            
            // 取消选择
            this.clearSelection();
        }
    }
    
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    swapTiles(row1, col1, row2, col2) {
        // 交换数据
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
        
        // 更新DOM
        const tile1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const tile2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        tile1.textContent = this.board[row1][col1].pattern;
        tile2.textContent = this.board[row2][col2].pattern;
    }
    
    highlightTile(row, col) {
        const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        tile.classList.add('selected');
    }
    
    clearSelection() {
        this.selectedTile = null;
        document.querySelectorAll('.tile.selected').forEach(tile => {
            tile.classList.remove('selected');
        });
    }
    
    checkMatches() {
        let hasMatch = false;
        
        // 检查横向匹配
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 2; col++) {
                const pattern = this.board[row][col].pattern;
                if (pattern === this.board[row][col+1].pattern && pattern === this.board[row][col+2].pattern) {
                    hasMatch = true;
                    for (let i = 0; i < 3; i++) {
                        this.board[row][col+i].matched = true;
                    }
                }
            }
        }
        
        // 检查纵向匹配
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows - 2; row++) {
                const pattern = this.board[row][col].pattern;
                if (pattern === this.board[row+1][col].pattern && pattern === this.board[row+2][col].pattern) {
                    hasMatch = true;
                    for (let i = 0; i < 3; i++) {
                        this.board[row+i][col].matched = true;
                    }
                }
            }
        }
        
        return hasMatch;
    }
    
    processMatches() {
        // 计算匹配的方块数量
        let matchedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].matched) {
                    matchedCount++;
                }
            }
        }
        
        // 增加分数
        this.score += matchedCount * 10;
        
        // 显示匹配动画
        this.showMatchAnimation();
        
        // 移除匹配的方块
        setTimeout(() => {
            this.removeMatchedTiles();
            
            // 方块下落
            this.dropTiles();
            
            // 填充新方块
            this.fillEmptyTiles();
            
            // 检查是否还有匹配
            if (this.checkMatches()) {
                // 连锁反应
                this.processMatches();
            } else {
                // 检查游戏状态
                this.checkGameStatus();
            }
        }, 500);
    }
    
    showMatchAnimation() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].matched) {
                    const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    tile.classList.add('matched');
                }
            }
        }
    }
    
    removeMatchedTiles() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].matched) {
                    this.board[row][col] = null;
                }
            }
        }
    }
    
    dropTiles() {
        // 从下往上，从左到右处理每一列
        for (let col = 0; col < this.cols; col++) {
            let emptyRow = this.rows - 1;
            
            // 从底部开始，将非空方块下移
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    if (emptyRow !== row) {
                        this.board[emptyRow][col] = this.board[row][col];
                        this.board[row][col] = null;
                    }
                    emptyRow--;
                }
            }
        }
    }
    
    fillEmptyTiles() {
        // 填充空方块
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = {
                        pattern: this.patterns[Math.floor(Math.random() * this.patterns.length)],
                        matched: false,
                        row: row,
                        col: col
                    };
                }
            }
        }
        
        // 重新渲染棋盘
        this.renderBoard();
    }
    
    checkGameStatus() {
        // 检查是否达到目标分数
        if (this.score >= this.targetScore) {
            // 过关
            this.level++;
            this.moves += 20;
            this.targetScore += 2000;
            this.updateUI();
            alert(`恭喜你通过第 ${this.level - 1} 关！`);
        } else if (this.moves <= 0) {
            // 游戏结束
            this.gameOver = true;
            alert(`游戏结束！你的得分：${this.score}`);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('moves').textContent = this.moves;
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.selectedTile = null;
        this.gameRunning = true;
        this.gameOver = false;
        this.targetScore = 1000;
        
        this.createBoard();
        this.renderBoard();
        this.updateUI();
    }
    
    highlightTile(row, col) {
        const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        tile.classList.add('selected');
    }
    
    clearSelection() {
        this.selectedTile = null;
        document.querySelectorAll('.tile.selected').forEach(tile => {
            tile.classList.remove('selected');
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Match3Game();
});