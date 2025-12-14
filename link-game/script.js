class LinkGame {
    constructor() {
        this.board = [];
        this.rows = 6;
        this.cols = 8;
        this.cards = [];
        this.firstCard = null;
        this.secondCard = null;
        this.score = 0;
        this.time = 60;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = null;
        this.patterns = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🍍', '🥝', '🥭', '🍈', '🍒'];
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
    }
    
    createBoard() {
        // 创建卡片数组，每种图案出现两次
        const patternCount = (this.rows * this.cols) / 2;
        const selectedPatterns = this.patterns.slice(0, patternCount);
        const boardPatterns = [...selectedPatterns, ...selectedPatterns];
        
        // 随机打乱图案
        this.shuffleArray(boardPatterns);
        
        // 创建网格
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                this.board[row][col] = {
                    pattern: boardPatterns[index],
                    row: row,
                    col: col,
                    flipped: false,
                    matched: false
                };
            }
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        this.cards = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.row = row;
                card.dataset.col = col;
                
                card.addEventListener('click', () => this.handleCardClick(row, col));
                
                gameBoard.appendChild(card);
                this.cards.push(card);
            }
        }
        
        this.updateScore();
        this.updateTime();
    }
    
    handleCardClick(row, col) {
        if (this.gameOver) return;
        
        if (!this.gameStarted) {
            this.startGame();
            this.gameStarted = true;
        }
        
        const card = this.board[row][col];
        
        // 检查卡片是否已经翻转或匹配
        if (card.flipped || card.matched) return;
        
        // 检查是否已经选择了两张卡片
        if (this.firstCard && this.secondCard) return;
        
        // 翻转卡片
        this.flipCard(row, col);
        
        // 记录选中的卡片
        if (!this.firstCard) {
            this.firstCard = { row, col };
        } else {
            this.secondCard = { row, col };
            this.checkMatch();
        }
    }
    
    flipCard(row, col) {
        const card = this.board[row][col];
        card.flipped = true;
        
        const cardElement = this.cards[row * this.cols + col];
        cardElement.classList.add('flipped');
        cardElement.textContent = card.pattern;
    }
    
    unflipCard(row, col) {
        const card = this.board[row][col];
        card.flipped = false;
        
        const cardElement = this.cards[row * this.cols + col];
        cardElement.classList.remove('flipped');
        cardElement.textContent = '';
    }
    
    checkMatch() {
        const { row: r1, col: c1 } = this.firstCard;
        const { row: r2, col: c2 } = this.secondCard;
        
        const card1 = this.board[r1][c1];
        const card2 = this.board[r2][c2];
        
        // 检查图案是否相同
        if (card1.pattern === card2.pattern && this.canConnect(r1, c1, r2, c2)) {
            // 匹配成功
            this.matchCards(r1, c1, r2, c2);
        } else {
            // 匹配失败，翻转回去
            setTimeout(() => {
                this.unflipCard(r1, c1);
                this.unflipCard(r2, c2);
                this.firstCard = null;
                this.secondCard = null;
            }, 1000);
        }
    }
    
    canConnect(r1, c1, r2, c2) {
        // 检查直线连接
        if (this.checkStraightLine(r1, c1, r2, c2)) {
            return true;
        }
        
        // 检查一次转弯连接
        if (this.checkOneTurn(r1, c1, r2, c2)) {
            return true;
        }
        
        // 检查两次转弯连接
        if (this.checkTwoTurns(r1, c1, r2, c2)) {
            return true;
        }
        
        return false;
    }
    
    checkStraightLine(r1, c1, r2, c2) {
        // 同一行
        if (r1 === r2) {
            const minCol = Math.min(c1, c2);
            const maxCol = Math.max(c1, c2);
            
            for (let col = minCol + 1; col < maxCol; col++) {
                if (!this.isCellEmpty(r1, col)) {
                    return false;
                }
            }
            return true;
        }
        
        // 同一列
        if (c1 === c2) {
            const minRow = Math.min(r1, r2);
            const maxRow = Math.max(r1, r2);
            
            for (let row = minRow + 1; row < maxRow; row++) {
                if (!this.isCellEmpty(row, c1)) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }
    
    checkOneTurn(r1, c1, r2, c2) {
        // 检查两个转折点
        return this.checkTurnPoint(r1, c1, r2, c2, r1, c2) || this.checkTurnPoint(r1, c1, r2, c2, r2, c1);
    }
    
    checkTurnPoint(r1, c1, r2, c2, tr, tc) {
        if (this.isCellEmpty(tr, tc)) {
            return this.checkStraightLine(r1, c1, tr, tc) && this.checkStraightLine(tr, tc, r2, c2);
        }
        return false;
    }
    
    checkTwoTurns(r1, c1, r2, c2) {
        // 检查所有可能的两次转弯路径
        for (let row = 0; row < this.rows; row++) {
            if (this.isCellEmpty(row, c1) && this.checkOneTurn(r1, c1, row, c1) && this.checkOneTurn(row, c1, r2, c2)) {
                return true;
            }
        }
        
        for (let col = 0; col < this.cols; col++) {
            if (this.isCellEmpty(r1, col) && this.checkOneTurn(r1, c1, r1, col) && this.checkOneTurn(r1, col, r2, c2)) {
                return true;
            }
        }
        
        return false;
    }
    
    isCellEmpty(row, col) {
        // 检查单元格是否超出边界
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return false;
        }
        
        const cell = this.board[row][col];
        return cell.matched;
    }
    
    matchCards(r1, c1, r2, c2) {
        // 标记卡片为匹配
        this.board[r1][c1].matched = true;
        this.board[r2][c2].matched = true;
        
        // 更新卡片样式
        const cardElement1 = this.cards[r1 * this.cols + c1];
        const cardElement2 = this.cards[r2 * this.cols + c2];
        
        cardElement1.classList.add('matched');
        cardElement2.classList.add('matched');
        
        // 增加分数
        this.score += 10;
        this.updateScore();
        
        // 重置选中的卡片
        this.firstCard = null;
        this.secondCard = null;
        
        // 检查游戏是否结束
        this.checkGameEnd();
    }
    
    checkGameEnd() {
        // 检查是否所有卡片都已匹配
        const allMatched = this.board.every(row => {
            return row.every(cell => cell.matched);
        });
        
        if (allMatched) {
            this.gameOver = true;
            clearInterval(this.timer);
            alert(`游戏胜利！你的得分：${this.score}`);
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.timer = setInterval(() => {
            this.time--;
            this.updateTime();
            
            if (this.time <= 0) {
                this.gameOver = true;
                clearInterval(this.timer);
                alert(`时间到！游戏结束。你的得分：${this.score}`);
            }
        }, 1000);
    }
    
    restart() {
        // 重置游戏状态
        clearInterval(this.timer);
        this.firstCard = null;
        this.secondCard = null;
        this.score = 0;
        this.time = 60;
        this.gameStarted = false;
        this.gameOver = false;
        
        // 重新创建游戏板
        this.createBoard();
        this.renderBoard();
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateTime() {
        document.getElementById('time').textContent = this.time;
    }
    
    bindEvents() {
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => this.restart());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new LinkGame();
});