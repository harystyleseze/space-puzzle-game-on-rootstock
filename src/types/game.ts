export interface LevelConfig {
  numKeys: number;
  numBarriers: number;
  numAsteroids: number;
  numTeleporters: number;
  numBokoharams: number;
  level: number;
  gridSize: [number, number];
  difficultyMultiplier: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  gridX: number;
  gridY: number;
}

export interface GameObject extends Position {
  width: number;
  height: number;
  gridX: number;
  gridY: number;
}

export interface SpaceshipObject extends GameObject {
  vel: number;
}

export interface KeyObject extends GameObject {
  collected: boolean;
  color: string;
}

export interface PortalObject extends GameObject {
  active: boolean;
}

export interface BarrierObject extends GameObject {
  color: string;
}

export interface TeleporterObject extends GameObject {
  pairId: number;
  color: string;
}

export type Grid = number[][];

export interface BokoharamObject extends GameObject {
  // Add any specific properties for Bokoharam
}

export interface GameObjects {
  spaceship: SpaceshipObject;
  keys: KeyObject[];
  portals: PortalObject[];
  barriers: BarrierObject[];
  asteroids: GameObject[];
  teleporters: TeleporterObject[];
  bokoharams: BokoharamObject[];
}
