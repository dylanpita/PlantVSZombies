// Game Description:
// This is a game where the player must place shapes on a grid to defend against incoming circles.
// The player earns points by destroying circles and can purchase new shapes to place on the grid.

// Constants
const canvas = document.querySelector('.canvas'); // The canvas element
const ctx = canvas.getContext('2d'); // The 2D drawing context of the canvas
const gridWidth = 12; // The width of the grid in cells
const gridHeight = 6; // The height of the grid in cells
const cellSize = 50; // The size of each cell in pixels
const buttonWidth = 200; // The width of the button in pixels
const buttonHeight = 50; // The height of the button in pixels
const circleRadius = 20; // The radius of the circles in pixels
const circleSpeed = 1; // The speed of the circles in pixels per frame
const shapeSize = 100; // The size of the shapes in pixels
const shapeSpeed = 2; // The speed of the shapes in pixels per frame

// Game state
let gameOver = false; // Whether the game is over
let circles = []; // The list of circles
let shapes = []; // The list of shapes
let selectedShape = null; // The currently selected shape
let projectiles = []; // The list of projectiles
let enemySpawnInterval = null; // The interval for spawning enemies
let points = 200; // The player's points

// Initialize canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Calculate grid and button positions
const gridX = (canvas.width - gridWidth * cellSize) / 2; // The x position of the grid
const gridY = (canvas.height - gridHeight * cellSize) / 2; // The y position of the grid
const buttonX = (canvas.width - buttonWidth) / 2; // The x position of the button
const buttonY = gridY - buttonHeight - 20; // The y position of the button

// Drawing functions
/**
 * Draws the grid on the canvas.
 * The grid is drawn with lines to separate the cells.
 */
function drawGrid() {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridWidth; i++) {
    ctx.beginPath();
    ctx.moveTo(gridX + i * cellSize, gridY);
    ctx.lineTo(gridX + i * cellSize, gridY + gridHeight * cellSize);
    ctx.stroke();
  }
  for (let i = 0; i <= gridHeight; i++) {
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + i * cellSize);
    ctx.lineTo(gridX + gridWidth * cellSize, gridY + i * cellSize);
    ctx.stroke();
  }
}

/**
 * Draws the shapes on the canvas.
 * The shapes are drawn as rounded squares with a diamond or square inside.
 */
function drawShapes() {
  // Rounded square with diamond
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(gridX, gridY + gridHeight * cellSize + 20, shapeSize, shapeSize, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(gridX + shapeSize / 2, gridY + gridHeight * cellSize + shapeSize / 1.45 + 30);
  ctx.lineTo(gridX + shapeSize / 2 + 30, gridY + gridHeight * cellSize + shapeSize / 1.45);
  ctx.lineTo(gridX + shapeSize / 2, gridY + gridHeight * cellSize + shapeSize / 1.45 - 30);
  ctx.lineTo(gridX + shapeSize / 2 - 30, gridY + gridHeight * cellSize + shapeSize / 1.45);
  ctx.fill();

  // Rounded square with square
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(gridX + shapeSize + 20, gridY + gridHeight * cellSize + 20, shapeSize, shapeSize, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'blue';
  ctx.fillRect(gridX + shapeSize + 20 + shapeSize / 4, gridY + gridHeight * cellSize + 20 + shapeSize / 4, shapeSize / 2, shapeSize / 2);

  // Draw point costs
  ctx.fillStyle = 'black';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('100 points', gridX + shapeSize / 2, gridY + gridHeight * cellSize + shapeSize + 20);
  ctx.fillText('50 points', gridX + shapeSize + 20 + shapeSize / 2, gridY + gridHeight * cellSize + shapeSize + 20);
}

/**
 * Draws the button on the canvas.
 * The button is drawn as a green rectangle with white text.
 */
function drawButton() {
  ctx.fillStyle = 'green';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Start Game', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

/**
 * Draws the circles on the canvas.
 * The circles are drawn as black circles.
 */
function drawCircles() {
  for (let i = 0; i < circles.length; i++) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(circles[i].x, circles[i].y, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Draws the projectiles on the canvas.
 * The projectiles are drawn as red circles.
 */
function drawProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(projectiles[i].x, projectiles[i].y, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Draws the placed shapes on the canvas.
 * The shapes are drawn as diamonds or squares.
 */
function drawPlacedShapes() {
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].type === 'diamond') {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(shapes[i].x - 20, shapes[i].y);
      ctx.lineTo(shapes[i].x, shapes[i].y - 20);
      ctx.lineTo(shapes[i].x + 20, shapes[i].y);
      ctx.lineTo(shapes[i].x, shapes[i].y + 20);
      ctx.fill();
    } else if (shapes[i].type === 'square') {
      ctx.fillStyle = 'blue';
      if (shapes[i].hits === 0) {
        ctx.fillRect(shapes[i].x - cellSize / 4, shapes[i].y - cellSize / 4, cellSize / 2, cellSize / 2);
      } else if (shapes[i].hits === 1) {
        ctx.fillRect(shapes[i].x - cellSize / 4, shapes[i].y - cellSize / 8, cellSize / 2, cellSize / 4);
      }
    }
  }
}

/**
 * Draws the points on the canvas.
 * The points are drawn as black text.
 */
function drawPoints() {
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`Points: ${points}`, gridX + gridWidth * cellSize, gridY - 20);
}

/**
 * Draws the game over message on the canvas.
 * The game over message is drawn as red text.
 */
function drawGameOver() {
  ctx.fillStyle = 'red';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// Update function
/**
 * Updates the game state.
 * This function updates the positions of the circles and projectiles, checks for collisions, and updates the points.
 */
function update() {
  if (gameOver) return;
  for (let i = 0; i < circles.length; i++) {
    circles[i].x -= circleSpeed;
    if (circles[i].x < gridX) {
      gameOver = true;
    }
  }
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].x += shapeSpeed;
    if (projectiles[i].x > gridX + gridWidth * cellSize) {
      projectiles.splice(i, 1);
      i--;
    } else {
      for (let j = 0; j < circles.length; j++) {
        if (distance(projectiles[i].x, projectiles[i].y, circles[j].x, circles[j].y) < circleRadius * 2) {
          circles.splice(j, 1);
          projectiles.splice(i, 1);
          i--;
          points += 50;
          break;
        }
      }
    }
  }
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].type === 'diamond') {
      for (let j = 0; j < circles.length; j++) {
        if (circles[j].x < shapes[i].x + cellSize && circles[j].x > shapes[i].x && circles[j].y === shapes[i].y) {
          shapes.splice(i, 1);
          i--;
          break;
        }
      }
    } else if (shapes[i].type === 'square') {
      for (let j = 0; j < circles.length; j++) {
        if (circles[j].x < shapes[i].x + cellSize && circles[j].x > shapes[i].x && circles[j].y === shapes[i].y) {
          shapes[i].hits++;
          circles.splice(j, 1);
          j--;
          points += 50;
          if (shapes[i].hits === 2) {
            shapes.splice(i, 1);
            i--;
            break;
          }
        }
      }
    }
  }
}

// Helper function to calculate distance between two points
/**
 * Calculates the distance between two points.
 * This function uses the Pythagorean theorem to calculate the distance between two points.
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 * @return {number} The distance between the two points.
 */
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Main game loop
/**
 * The main game loop.
 * This function updates the game state and draws the game on the canvas.
 */
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawShapes();
  drawButton();
  drawCircles();
  drawProjectiles();
  drawPlacedShapes();
  drawPoints();
  if (gameOver) {
    drawGameOver();
  }
  update();
  requestAnimationFrame(gameLoop);
}

// Event listeners
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Check if the button was clicked
  if (x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
    // Reset the game
    gameOver = false;
    circles = [];
    shapes = [];
    selectedShape = null;
    projectiles = [];
    points = 200;
    clearInterval(enemySpawnInterval);
    enemySpawnInterval = setInterval(() => {
      const row = Math.floor(Math.random() * gridHeight);
      const speed = Math.random() * 2 + 1;
      circles.push({ x: gridX + gridWidth * cellSize, y: gridY + row * cellSize + cellSize / 2, speed });
    }, 3000);
  } else if (x >= gridX && x <= gridX + shapeSize && y >= gridY + gridHeight * cellSize + 20 && y <= gridY + gridHeight * cellSize + shapeSize + 20) {
    // Select diamond shape
    selectedShape = 'diamond';
  } else if (x >= gridX + shapeSize + 20 && x <= gridX + shapeSize * 2 + 20 && y >= gridY + gridHeight * cellSize + 20 && y <= gridY + gridHeight * cellSize + shapeSize + 20) {
    // Select square shape
    selectedShape = 'square';
  } else if (selectedShape && x >= gridX && x <= gridX + gridWidth * cellSize && y >= gridY && y <= gridY + gridHeight * cellSize) {
    // Place shape
    const row = Math.floor((y - gridY) / cellSize);
    const col = Math.floor((x - gridX) / cellSize);
    const existingShape = shapes.find(shape => shape.x === gridX + col * cellSize + cellSize / 2 && shape.y === gridY + row * cellSize + cellSize / 2);
    if (!existingShape) {
      if (selectedShape === 'diamond' && points >= 100) {
        points -= 100;
        shapes.push({ type: selectedShape, x: gridX + col * cellSize + cellSize / 2, y: gridY + row * cellSize + cellSize / 2, hits: 0 });
        // Shoot projectiles every 3 seconds
        const projectileInterval = setInterval(() => {
          const shape = shapes.find(shape => shape.x === gridX + col * cellSize + cellSize / 2 && shape.y === gridY + row * cellSize + cellSize / 2);
          if (!shape) {
            clearInterval(projectileInterval);
          } else {
            projectiles.push({ x: gridX + col * cellSize + cellSize / 2, y: gridY + row * cellSize + cellSize / 2 });
          }
        }, 3000);
        // Shoot projectile immediately
        projectiles.push({ x: gridX + col * cellSize + cellSize / 2, y: gridY + row * cellSize + cellSize / 2 });
      } else if (selectedShape === 'square' && points >= 50) {
        points -= 50;
        shapes.push({ type: selectedShape, x: gridX + col * cellSize + cellSize / 2, y: gridY + row * cellSize + cellSize / 2, hits: 0 });
      }
      selectedShape = null;
    }
  }
});

gameLoop();
