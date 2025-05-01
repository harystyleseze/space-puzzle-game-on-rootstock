import { Grid, Position, GameObjects, LevelConfig } from "@/types/game";

const GRID_SIZE = 80;
const GRID_OFFSET_X = 100;
const GRID_OFFSET_Y = 100;

export class PathValidator {
  static isValidMove(
    x: number,
    y: number,
    grid: Grid,
    gridSize: [number, number]
  ): boolean {
    const [width, height] = gridSize;
    return (
      0 <= x && x < width && 0 <= y && y < height && grid[y][x] !== 4 // 4 is asteroid
    );
  }

  static getNeighbors(
    x: number,
    y: number,
    grid: Grid,
    gridSize: [number, number],
    teleporters: Map<string, Position>
  ): Position[] {
    const moves = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    const neighbors: Position[] = [];

    // Normal moves
    for (const [dx, dy] of moves) {
      const newX = x + dx;
      const newY = y + dy;
      if (this.isValidMove(newX, newY, grid, gridSize)) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    // Teleporter moves
    const key = `${x},${y}`;
    if (teleporters.has(key)) {
      neighbors.push(teleporters.get(key)!);
    }

    return neighbors;
  }

  static findPathToKeys(
    start: Position,
    keys: Position[],
    grid: Grid,
    gridSize: [number, number],
    teleporters: Map<string, Position>
  ): boolean {
    const keysSet = new Set(keys.map((k) => `${k.x},${k.y}`));
    const visited = new Set<string>();
    const queue: Array<[Position, Set<string>]> = [[start, new Set()]];

    while (queue.length > 0) {
      const [pos, collected] = queue.shift()!;
      const posKey = `${pos.x},${pos.y}`;

      if (visited.has(posKey)) continue;
      visited.add(posKey);

      if (keysSet.has(posKey)) {
        collected.add(posKey);
        if (collected.size === keysSet.size) return true;
      }

      for (const nextPos of this.getNeighbors(
        pos.x,
        pos.y,
        grid,
        gridSize,
        teleporters
      )) {
        const nextPosKey = `${nextPos.x},${nextPos.y}`;
        if (!visited.has(nextPosKey)) {
          queue.push([nextPos, new Set(collected)]);
        }
      }
    }

    return false;
  }

  static validateLevel(
    grid: Grid,
    keys: Position[],
    portal: Position,
    teleporters: Map<string, Position>,
    gridSize: [number, number]
  ): boolean {
    const start: Position = { x: 0, y: 2 };

    // Check if all keys are reachable
    if (!this.findPathToKeys(start, keys, grid, gridSize, teleporters)) {
      return false;
    }

    // Check if portal is reachable after collecting all keys
    const portalGrid = grid.map((row) => [...row]);
    for (let y = 0; y < portalGrid.length; y++) {
      for (let x = 0; x < portalGrid[y].length; x++) {
        if (portalGrid[y][x] === 5) {
          // 5 is barrier
          portalGrid[y][x] = 0;
        }
      }
    }

    // Check path to portal from any position
    for (let y = 0; y < gridSize[1]; y++) {
      for (let x = 0; x < gridSize[0]; x++) {
        if (this.isValidMove(x, y, portalGrid, gridSize)) {
          if (
            this.findPathToKeys(
              { x, y },
              [portal],
              portalGrid,
              gridSize,
              teleporters
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

export class GameEngine {
  private grid: Grid;
  private gameObjects: GameObjects;
  private pathValidator: PathValidator;

  constructor() {
    this.grid = [];
    this.gameObjects = this.createInitialGameObjects();
    this.pathValidator = new PathValidator();
  }

  private createInitialGameObjects(): GameObjects {
    return {
      spaceship: {
        x: GRID_OFFSET_X,
        y: GRID_OFFSET_Y + 2 * GRID_SIZE,
        width: 64,
        height: 64,
        gridX: 0,
        gridY: 2,
        vel: 5,
      },
      keys: [],
      portals: [],
      barriers: [],
      asteroids: [],
      teleporters: [],
      bokoharams: [], // Initialize empty bokoharams array
    };
  }

  generateLevel(config: LevelConfig): GameObjects {
    const {
      numKeys,
      numBarriers,
      numAsteroids,
      numTeleporters,
      level,
      gridSize,
    } = config;

    // Add numBokoharams with a default of 0 if not provided
    const numBokoharams = config.numBokoharams || 0;

    const maxAttempts = 50;

    // Scale difficulty based on level
    const difficultyConfig = {
      numKeys: Math.min(2 + Math.floor(level / 2), 6), // Start with 2 keys, max 6
      numBarriers: Math.min(2 + Math.floor(level / 2), 6), // Scale barriers with keys
      numAsteroids: Math.min(1 + Math.floor(level / 3), 4), // Gradually increase obstacles
      numTeleporters: Math.min(1 + Math.floor(level / 4), 3), // Add more teleporter pairs gradually
    };

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      this.grid = Array(5)
        .fill(0)
        .map(() => Array(6).fill(0));
      this.gameObjects = this.createInitialGameObjects();

      // Place spaceship and portal strategically
      this.grid[2][0] = 1; // Spaceship always starts in the middle-left

      // Place portal based on level
      const portalY = level % 2 === 0 ? 1 : 3; // Alternate portal position
      this.grid[portalY][5] = 2;
      this.gameObjects.portals.push({
        x: GRID_OFFSET_X + 5 * GRID_SIZE,
        y: GRID_OFFSET_Y + portalY * GRID_SIZE,
        width: 64,
        height: 64,
        gridX: 5,
        gridY: portalY,
        active: false,
      });

      // Available colors for visual clarity
      const colors = [
        "#FF0000", // Red
        "#00FF00", // Green
        "#0000FF", // Blue
        "#FFFF00", // Yellow
        "#FF00FF", // Magenta
        "#00FFFF", // Cyan
      ];

      // Create key-barrier pairs with matching colors
      for (let i = 0; i < difficultyConfig.numKeys; i++) {
        const color = colors[i % colors.length];
        let keyPlaced = false;
        let barrierPlaced = false;

        // Strategic key placement
        for (let attempt = 0; attempt < 20 && !keyPlaced; attempt++) {
          // Place keys more towards the left side in early levels
          const maxX = Math.min(3 + Math.floor(level / 2), 5);
          const x = Math.floor(Math.random() * maxX) + 1;
          const y = Math.floor(Math.random() * 5);

          if (this.grid[y][x] === 0) {
            this.grid[y][x] = 3;
            this.gameObjects.keys.push({
              x: GRID_OFFSET_X + x * GRID_SIZE + 20,
              y: GRID_OFFSET_Y + y * GRID_SIZE + 20,
              width: 30,
              height: 30,
              gridX: x,
              gridY: y,
              collected: false,
              color,
            });
            keyPlaced = true;
          }
        }

        // Strategic barrier placement
        for (let attempt = 0; attempt < 20 && !barrierPlaced; attempt++) {
          // Place barriers more towards the right side
          const minX = Math.max(2, Math.floor(level / 2));
          const x = Math.floor(Math.random() * (5 - minX)) + minX;
          const y = Math.floor(Math.random() * 5);

          if (this.grid[y][x] === 0) {
            this.grid[y][x] = 5;
            this.gameObjects.barriers.push({
              x: GRID_OFFSET_X + x * GRID_SIZE,
              y: GRID_OFFSET_Y + y * GRID_SIZE,
              width: 64,
              height: 64,
              gridX: x,
              gridY: y,
              color,
            });
            barrierPlaced = true;
          }
        }
      }

      // Strategic teleporter placement
      for (let i = 0; i < difficultyConfig.numTeleporters; i++) {
        const color = i === 0 ? "#00FFFF" : "#FF00FF";
        let firstPos: Position | null = null;

        // Place first teleporter more towards the left
        for (let attempt = 0; attempt < 20; attempt++) {
          const x = Math.floor(Math.random() * 3) + 1;
          const y = Math.floor(Math.random() * 5);
          if (this.grid[y][x] === 0) {
            this.grid[y][x] = 6;
            firstPos = { x, y };
            this.gameObjects.teleporters.push({
              x: GRID_OFFSET_X + x * GRID_SIZE,
              y: GRID_OFFSET_Y + y * GRID_SIZE,
              width: 64,
              height: 64,
              gridX: x,
              gridY: y,
              pairId: i,
              color,
            });
            break;
          }
        }

        // Place second teleporter more towards the right
        if (firstPos) {
          for (let attempt = 0; attempt < 20; attempt++) {
            const x = Math.floor(Math.random() * 2) + 3; // Right side of grid
            const y = Math.floor(Math.random() * 5);
            if (this.grid[y][x] === 0) {
              this.grid[y][x] = 6;
              this.gameObjects.teleporters.push({
                x: GRID_OFFSET_X + x * GRID_SIZE,
                y: GRID_OFFSET_Y + y * GRID_SIZE,
                width: 64,
                height: 64,
                gridX: x,
                gridY: y,
                pairId: i,
                color,
              });
              break;
            }
          }
        }
      }

      // Strategic asteroid placement to create challenging paths
      for (let i = 0; i < difficultyConfig.numAsteroids; i++) {
        for (let attempt = 0; attempt < 20; attempt++) {
          // Place asteroids more in the middle to create interesting paths
          const x = Math.floor(Math.random() * 3) + 2;
          const y = Math.floor(Math.random() * 5);
          if (this.grid[y][x] === 0) {
            this.grid[y][x] = 4;
            this.gameObjects.asteroids.push({
              x: GRID_OFFSET_X + x * GRID_SIZE,
              y: GRID_OFFSET_Y + y * GRID_SIZE,
              width: 64,
              height: 64,
              gridX: x,
              gridY: y,
            });
            break;
          }
        }
      }

      // Validate level is solvable
      const teleporterMap = new Map<string, Position>();
      for (let i = 0; i < this.gameObjects.teleporters.length - 1; i += 2) {
        const t = this.gameObjects.teleporters[i];
        const pair = this.gameObjects.teleporters[i + 1];
        if (t && pair) {
          teleporterMap.set(`${t.gridX},${t.gridY}`, {
            x: pair.gridX,
            y: pair.gridY,
          });
          teleporterMap.set(`${pair.gridX},${pair.gridY}`, {
            x: t.gridX,
            y: t.gridY,
          });
        }
      }

      if (
        PathValidator.validateLevel(
          this.grid,
          this.gameObjects.keys.map((k) => ({ x: k.gridX, y: k.gridY })),
          { x: 5, y: portalY },
          teleporterMap,
          [6, 5]
        )
      ) {
        // Generate Bokoharam enemies (only for level 4 and above)
        if (level >= 4 && numBokoharams > 0) {
          const bokoharams = [];
          for (let i = 0; i < numBokoharams; i++) {
            let gridX, gridY;
            do {
              gridX = Math.floor(Math.random() * (gridSize[0] - 1)) + 1; // Avoid leftmost column
              gridY = Math.floor(Math.random() * gridSize[1]);
            } while (
              this.grid[gridY][gridX] !== 0 || // Ensure cell is empty
              (gridX === 0 && gridY === 2) || // Avoid spaceship start position
              (gridX === gridSize[0] - 1 && (gridY === 1 || gridY === 3)) // Avoid portal positions
            );

            this.grid[gridY][gridX] = 6; // Mark as Bokoharam
            bokoharams.push({
              x: GRID_OFFSET_X + gridX * GRID_SIZE,
              y: GRID_OFFSET_Y + gridY * GRID_SIZE,
              width: 64,
              height: 64,
              gridX,
              gridY,
            });
          }
          this.gameObjects.bokoharams = bokoharams;
        }
        return this.gameObjects;
      }
    }

    // If we couldn't generate a valid level, try with slightly easier settings
    return this.generateLevel({
      ...config,
      numAsteroids: Math.max(1, difficultyConfig.numAsteroids - 1),
      numTeleporters: Math.max(1, difficultyConfig.numTeleporters - 1),
    });
  }

  checkMove(newX: number, newY: number): boolean {
    if (newX < 0 || newX > 5 || newY < 0 || newY > 4) {
      return false;
    }

    return this.grid[newY][newX] !== 4;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getGameObjects(): GameObjects {
    return this.gameObjects;
  }
}
