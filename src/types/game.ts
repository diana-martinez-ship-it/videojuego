export type CharacterId =
  | 'mama_lucha'
  | 'catrina'
  | 'catrin'
  | 'taquero'
  | 'mascara'
  | 'zorro_negro'
  | 'dafne'
  | 'gato_sombra'
  | 'conde_vampiro'
  | 'momia_sacerdotisa'
  | 'guardian_ancestral';

export type StageId = 'aurrera' | 'mercado' | 'muertos' | 'sayulita' | 'anubis_temple';

export type ActionState =
  | 'idle'
  | 'walk_forward'
  | 'walk_backward'
  | 'crouch'
  | 'jump'
  | 'punch'
  | 'kick'
  | 'special'
  | 'super'
  | 'block'
  | 'hit'
  | 'knockdown'
  | 'victory'
  | 'defeat';

export interface MoveInfo {
  name: string;
  command: string;
  description: string;
  damage: number;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  alias: string;
  quote: string;
  bio: string;
  themeColor: string;
  accentColor: string;
  stats: {
    speed: number;    // 1-5
    power: number;    // 1-5
    range: number;    // 1-5
    defense: number;  // 1-5
  };
  portrait: string; // inline SVG or image path
  moves: {
    light: MoveInfo;
    heavy: MoveInfo;
    special: MoveInfo;
    super: MoveInfo;
  };
}

export interface StageDef {
  id: StageId;
  name: string;
  location: string;
  description: string;
  bannerColor: string;
  ambientFlavor: string;
  hasMamaLuchaBanner: boolean;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  isHeavy: boolean;
  isSpecial?: boolean;
}

export interface Projectile {
  id: number;
  owner: 1 | 2;
  characterId: CharacterId;
  type:
    | 'carrito'
    | 'cempasuchil'
    | 'sombrero'
    | 'taco_pina'
    | 'tope'
    | 'espada_z'
    | 'surfboard'
    | 'shuriken'
    | 'murcielagos'
    | 'anubis_fire'
    | 'roca';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  frame: number;
  duration: number;
  returning?: boolean; // for sombrero
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'petal' | 'spark' | 'smoke' | 'star' | 'confetti';
  rotation: number;
  vRot: number;
}

export interface FighterState {
  id: 1 | 2;
  charDef: CharacterDef;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = right, -1 = left
  isGrounded: boolean;
  health: number;
  maxHealth: number;
  superMeter: number; // 0 to 100
  state: ActionState;
  stateTimer: number; // frames in current state
  currentHitbox: Hitbox | null;
  isBlocking: boolean;
  comboCount: number;
  roundsWon: number;
  hitFlashTimer: number;
}

export type GameMode = 'arcade' | 'versus_cpu' | 'versus_p2' | 'training';

export type GamePhase =
  | 'title'
  | 'char_select'
  | 'stage_select'
  | 'loading'
  | 'intro'
  | 'fighting'
  | 'round_end'
  | 'match_end';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  punch: boolean;
  kick: boolean;
  special: boolean;
  super: boolean;
}
