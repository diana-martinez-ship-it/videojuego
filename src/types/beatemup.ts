/**
 * Types and interfaces for the Beat 'Em Up ("belt-scroller" pseudo-3D) engine
 * of "LUCHA CALLEJERA".
 */

export type EntityFacing = 1 | -1; // 1 = right, -1 = left

export type PlayerAction =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'attack1' // Jab
  | 'attack2' // Cross
  | 'attack3' // Hook / Slash
  | 'attack4' // Finisher uppercut / Flying slam
  | 'jump_attack'
  | 'special' // 360 desperation spin
  | 'hit'
  | 'knockdown'
  | 'defeat';

export type EnemyType = 'cholo' | 'rudo' | 'gato_punk' | 'maton_aurrera';

export type EnemyAction =
  | 'spawn'
  | 'patrol'
  | 'approach'
  | 'windup'
  | 'attack'
  | 'hit'
  | 'knockdown'
  | 'getup'
  | 'defeat';

export interface PseudoBox {
  x: number;
  y: number; // Ground depth
  z: number; // Elevation
  width: number;
  height: number;
  depth: number; // Y-tolerance
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  scale: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface HitSpark {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'ring' | 'star' | 'dust';
  vx?: number;
  vy?: number;
}

export interface BeatEmUpPlayer {
  x: number;
  y: number; // Ground position (e.g. 300 to 490)
  z: number; // Jump height (0 = on ground)
  vx: number;
  vy: number;
  vz: number;
  facing: EntityFacing;
  action: PlayerAction;
  actionTimer: number;
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  comboCount: number;
  comboTimer: number;
  attackCooldown: number;
  invulnerableTimer: number;
  isGrounded: boolean;
  name: string;
  portrait: string;
}

export interface BeatEmUpEnemy {
  id: number;
  type: EnemyType;
  name: string;
  x: number;
  y: number; // Ground depth
  z: number;
  vx: number;
  vy: number;
  vz: number;
  facing: EntityFacing;
  action: EnemyAction;
  actionTimer: number;
  health: number;
  maxHealth: number;
  walkSpeed: number;
  attackCooldown: number;
  windupTimer: number;
  invulnerableTimer: number;
  colorTheme: string;
  scoreValue: number;
  targetYOffset: number; // Flanking offset around player
}

export interface StreetItem {
  id: number;
  type: 'guacal' | 'taco_stand' | 'trash_bin' | 'cempasuchil_altar';
  x: number;
  y: number;
  broken: boolean;
  itemInside?: 'taco_heal' | 'trophy_points';
}

export interface WaveDef {
  waveNumber: number;
  cameraLockX: number;
  enemies: {
    type: EnemyType;
    spawnXOffset: number;
    spawnY: number;
  }[];
}
