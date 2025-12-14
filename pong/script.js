// 乒乓球游戏
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');
const resetBtn = document.getElementById('resetBtn');

// 游戏状态
let player1Score = 0;
let player2Score = 0;

// 玩家对象
const player1 = {
    x: 20,
    y: canvas.height / 2 - 60,
    width: 15,
    height: 120,
    speed: 8,
    color: '#00ffff'
};

const player2 = {
    x: canvas.width - 35,
    y: canvas.height / 2 - 60,
    width: 15,
    height: 120,
    speed: 8,
    color: '#00ffff'
};

// 球对象
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 8,
    velocityX: 8,
    velocityY: 8,
    color: '#fff'
};

// 键盘状态
const keys = {
    w: false,
    s: false,
    up: false,
    down: false
};

// 初始化游戏
function initGame() {
    player1Score = 0;
    player2Score = 0;
    resetBall();
    updateScore();
    draw();
}

// 重置球位置
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// 更新分数
function updateScore() {
    player1ScoreElement.textContent = player1Score;
    player2ScoreElement.textContent = player2Score;
}

// 绘制玩家
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

// 绘制球
function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 绘制中线
function drawMiddleLine() {
    ctx.setLineDash([20, 20]);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// 绘制游戏
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMiddleLine();
    drawPlayer(player1);
    drawPlayer(player2);
    drawBall();
}

// 移动玩家
function movePlayers() {
    // 玩家1移动 (W/S)
    if (keys.w && player1.y > 0) {
        player1.y -= player1.speed;
    }
    if (keys.s && player1.y < canvas.height - player1.height) {
        player1.y += player1.speed;
    }
    
    // 玩家2移动 (方向键上下)
    if (keys.up && player2.y > 0) {
        player2.y -= player2.speed;
    }
    if (keys.down && player2.y < canvas.height - player2.height) {
        player2.y += player2.speed;
    }
}

// 移动球
function moveBall() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // 墙壁碰撞检测
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }
    
    // 玩家1得分 (球出右边界)
    if (ball.x + ball.radius > canvas.width) {
        player1Score++;
        updateScore();
        resetBall();
    }
    
    // 玩家2得分 (球出左边界)
    if (ball.x - ball.radius < 0) {
        player2Score++;
        updateScore();
        resetBall();
    }
    
    // 玩家碰撞检测
    if (checkCollision(ball, player1) || checkCollision(ball, player2)) {
        ball.velocityX = -ball.velocityX;
        
        // 调整球的Y方向速度，基于碰撞位置
        const player = checkCollision(ball, player1) ? player1 : player2;
        const collisionPoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        const angle = collisionPoint * Math.PI / 4; // -45度到45度
        
        ball.velocityX = ball.speed * Math.sign(ball.velocityX) * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
    }
}

// 碰撞检测
function checkCollision(ball, player) {
    return (
        ball.x - ball.radius < player.x + player.width &&
        ball.x + ball.radius > player.x &&
        ball.y - ball.radius < player.y + player.height &&
        ball.y + ball.radius > player.y
    );
}

// 游戏循环
function gameLoop() {
    movePlayers();
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
});

// 按钮事件
resetBtn.addEventListener('click', initGame);

// 初始化游戏
initGame();

// 开始游戏循环
requestAnimationFrame(gameLoop);