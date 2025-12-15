# Flappy Bird

A classic Flappy Bird game implemented with HTML5 Canvas, JavaScript, and CSS.

## Game Description

Flappy Bird is a simple yet addictive game where you control a bird by tapping or pressing space to make it flap its wings. Navigate through the pipes without hitting them or the ground. Try to get the highest score possible!

## Features

- Classic Flappy Bird gameplay
- Smooth animations and physics
- Score tracking with local storage for high scores
- Pause and resume functionality
- Responsive design
- Beautiful graphics with sky, clouds, and sun
- Game over and pause screens

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for running the local server)

### Installation

1. Clone or download this repository
2. Navigate to the `flappy-bird` directory
3. Install dependencies (if any) using pnpm:

```bash
pnpm install
```

### Running the Game

You can run the game in two ways:

#### Method 1: Using Python HTTP Server

```bash
pnpm run dev
```

or

```bash
python -m http.server 8080
```

Then open your browser and navigate to `http://localhost:8080`

#### Method 2: Directly opening the HTML file

Simply open the `index.html` file in your web browser.

## How to Play

1. Click the "Start Game" button to begin
2. Press the **Space** key or **Click** anywhere on the screen to make the bird flap its wings
3. Navigate through the green pipes without hitting them
4. Avoid hitting the ground or ceiling
5. Try to get the highest score possible
6. Click "Pause" to pause the game, and "Resume" to continue
7. When the game is over, click or press Space to play again

## Game Controls

- **Space Bar**: Make the bird flap its wings
- **Mouse Click**: Make the bird flap its wings
- **Start Button**: Start a new game
- **Pause/Resume Button**: Pause or resume the game

## Project Structure

```
flappy-bird/
├── index.html          # Main HTML file
├── style.css           # Game styles
├── script.js           # Game logic
├── package.json        # Project configuration
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Structure of the game
- **CSS3**: Styling and animations
- **JavaScript**: Game logic and physics
- **HTML5 Canvas**: Graphics rendering
- **pnpm**: Package management

## Development

### Adding New Features

If you want to contribute or add new features to the game, feel free to modify the following files:

- `index.html`: Change the game structure
- `style.css`: Modify the game appearance
- `script.js`: Add new game mechanics or features

### Game Constants

You can adjust the game difficulty by modifying the constants at the top of `script.js`:

- `GRAVITY`: Gravity strength
- `JUMP_STRENGTH`: How high the bird jumps
- `PIPE_SPEED`: Speed of the pipes
- `PIPE_GAP`: Gap between pipes

## Browser Compatibility

This game is compatible with all modern web browsers that support HTML5 Canvas and ES6 JavaScript.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by the original Flappy Bird game by Dong Nguyen
- Built with vanilla JavaScript for maximum compatibility
- Uses HTML5 Canvas for smooth graphics rendering

Enjoy playing Flappy Bird!