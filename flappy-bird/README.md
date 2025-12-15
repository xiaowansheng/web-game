# 飞鸟游戏 (Flappy Bird)

使用HTML5 Canvas、JavaScript和CSS实现的经典Flappy Bird游戏。

## 游戏介绍

Flappy Bird是一款简单却令人上瘾的游戏，你可以通过点击屏幕或按空格键来控制小鸟扇动翅膀。在管道之间穿梭，不要撞到管道或地面。尽可能获得最高分！

## 游戏特色

- 经典的Flappy Bird游戏玩法
- 流畅的动画和物理效果
- 分数跟踪系统，支持本地存储最高分
- 暂停和继续功能
- 响应式设计
- 精美的图形，包括天空、云和太阳
- 游戏结束和暂停画面

## 开始游戏

### 前置条件

- 现代Web浏览器（Chrome、Firefox、Safari、Edge）
- Python 3（用于运行本地服务器）

### 安装说明

1. 克隆或下载此仓库
2. 导航到 `flappy-bird` 目录
3. 使用pnpm安装依赖（如果有）：

```bash
pnpm install
```

### 运行游戏

你可以通过两种方式运行游戏：

#### 方法1：使用Python HTTP服务器

```bash
pnpm run dev
```

或

```bash
python -m http.server 8080
```

然后打开浏览器并导航到 `http://localhost:8080`

#### 方法2：直接打开HTML文件

只需在Web浏览器中打开 `index.html` 文件即可。

## 如何游戏

1. 点击 "Start Game" 按钮开始游戏
2. 按 **空格键** 或 **点击屏幕任意位置** 让小鸟扇动翅膀
3. 在绿色管道之间穿梭，不要撞到它们
4. 避免撞到地面或天花板
5. 尝试获得尽可能高的分数
6. 点击 "Pause" 暂停游戏，点击 "Resume" 继续游戏
7. 游戏结束时，点击屏幕或按空格键重新开始

## 游戏控制

- **空格键**：让小鸟扇动翅膀
- **鼠标点击**：让小鸟扇动翅膀
- **开始按钮**：开始新游戏
- **暂停/继续按钮**：暂停或继续游戏

## 项目结构

```
flappy-bird/
├── index.html          # 主HTML文件
├── style.css           # 游戏样式
├── script.js           # 游戏逻辑
├── package.json        # 项目配置
└── README.md           # 此文件
```

## 技术栈

- **HTML5**：游戏结构
- **CSS3**：样式和动画
- **JavaScript**：游戏逻辑和物理效果
- **HTML5 Canvas**：图形渲染
- **pnpm**：包管理

## 开发说明

### 添加新功能

如果你想为游戏贡献或添加新功能，可以修改以下文件：

- `index.html`：更改游戏结构
- `style.css`：修改游戏外观
- `script.js`：添加新的游戏机制或功能

### 游戏常量

你可以通过修改 `script.js` 顶部的常量来调整游戏难度：

- `GRAVITY`：重力强度
- `JUMP_STRENGTH`：小鸟跳跃的高度
- `PIPE_SPEED`：管道的移动速度
- `PIPE_GAP`：管道之间的间隙

## 浏览器兼容性

这款游戏兼容所有支持HTML5 Canvas和ES6 JavaScript的现代Web浏览器。

## 许可证

本项目是开源的，采用 [MIT许可证](LICENSE)。

## 致谢

- 灵感来源于Dong Nguyen的原始Flappy Bird游戏
- 使用原生JavaScript构建，以获得最大的兼容性
- 使用HTML5 Canvas实现流畅的图形渲染

享受Flappy Bird游戏！