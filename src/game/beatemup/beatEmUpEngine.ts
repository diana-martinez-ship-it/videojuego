import {
  BeatEmUpEnemy,
  BeatEmUpPlayer,
  EnemyAction,
  EnemyType,
  FloatingText,
  HitSpark,
  PlayerAction,
  WaveDef,
} from '../../types/beatemup';
import { soundManager } from '../../audio/soundManager';

export const PLAYFIELD_MIN_Y = 310;
export const PLAYFIELD_MAX_Y = 485;
export const STAGE_LENGTH = 3600;
export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

const GRAVITY = 0.65;
const JUMP_IMPULSE = 11.5;

export class BeatEmUpEngine {
  public player: BeatEmUpPlayer;
  public enemies: BeatEmUpEnemy[] = [];
  public floatingTexts: FloatingText[] = [];
  public hitSparks: HitSpark[] = [];
  public cameraX: number = 0;
  public screenShake: number = 0;
  public currentWaveIndex: number = 0;
  public isWaveLocked: boolean = false;
  public stageCleared: boolean = false;
  public gameOver: boolean = false;

  private textIdCounter: number = 0;
  private enemyIdCounter: number = 0;
  private sparkIdCounter: number = 0;

  // Wave definitions along the urban street
  private waves: WaveDef[] = [
    {
      waveNumber: 1,
      cameraLockX: 300,
      enemies: [
        { type: 'cholo', spawnXOffset: 450, spawnY: 340 },
        { type: 'cholo', spawnXOffset: 520, spawnY: 440 },
      ],
    },
    {
      waveNumber: 2,
      cameraLockX: 950,
      enemies: [
        { type: 'cholo', spawnXOffset: 480, spawnY: 330 },
        { type: 'rudo', spawnXOffset: 550, spawnY: 410 },
        { type: 'gato_punk', spawnXOffset: -120, spawnY: 460 },
      ],
    },
    {
      waveNumber: 3,
      cameraLockX: 1750,
      enemies: [
        { type: 'gato_punk', spawnXOffset: 460, spawnY: 320 },
        { type: 'cholo', spawnXOffset: 500, spawnY: 450 },
        { type: 'rudo', spawnXOffset: 540, spawnY: 380 },
        { type: 'cholo', spawnXOffset: -150, spawnY: 360 },
      ],
    },
    {
      waveNumber: 4,
      cameraLockX: 2550,
      enemies: [
        { type: 'maton_aurrera', spawnXOffset: 500, spawnY: 390 }, // Mini-Boss!
        { type: 'gato_punk', spawnXOffset: 560, spawnY: 330 },
        { type: 'rudo', spawnXOffset: -140, spawnY: 440 },
        { type: 'cholo', spawnXOffset: 620, spawnY: 460 },
      ],
    },
  ];

  constructor(playerName: string = 'Gato Sombra') {
    this.player = {
      x: 180,
      y: 400,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: 1,
      action: 'idle',
      actionTimer: 0,
      health: 100,
      maxHealth: 100,
      lives: 3,
      score: 0,
      comboCount: 0,
      comboTimer: 0,
      attackCooldown: 0,
      invulnerableTimer: 0,
      isGrounded: true,
      name: playerName,
      portrait: 'gato_sombra',
    };

    this.checkWaveTriggers();
  }

  public resetGame() {
    this.player.x = 180;
    this.player.y = 400;
    this.player.z = 0;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.vz = 0;
    this.player.health = 100;
    this.player.lives = 3;
    this.player.score = 0;
    this.player.comboCount = 0;
    this.player.action = 'idle';
    this.cameraX = 0;
    this.currentWaveIndex = 0;
    this.isWaveLocked = false;
    this.stageCleared = false;
    this.gameOver = false;
    this.enemies = [];
    this.floatingTexts = [];
    this.hitSparks = [];
    this.checkWaveTriggers();
  }

  // --- Main Update Step (60 fps) ---
  public update(inputs: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    attack: boolean; // Z
    jump: boolean;   // X
    special: boolean; // C
  }) {
    if (this.gameOver || this.stageCleared) return;

    this.updateScreenShake();
    this.updatePlayer(inputs);
    this.updateEnemies();
    this.updateSparks();
    this.updateFloatingTexts();
    this.updateCamera();
    this.checkWaveProgression();
  }

  // --- Player Physics & Combat ---
  private updatePlayer(inputs: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    attack: boolean;
    jump: boolean;
    special: boolean;
  }) {
    const p = this.player;

    if (p.invulnerableTimer > 0) p.invulnerableTimer--;
    if (p.attackCooldown > 0) p.attackCooldown--;
    if (p.comboTimer > 0) {
      p.comboTimer--;
      if (p.comboTimer === 0) p.comboCount = 0;
    }

    // Advance current action timer
    p.actionTimer++;

    // Gravity & Jump Physics
    if (!p.isGrounded) {
      p.vz -= GRAVITY;
      p.z += p.vz;
      if (p.z <= 0) {
        p.z = 0;
        p.vz = 0;
        p.isGrounded = true;
        this.spawnLandingDust(p.x, p.y);
        if (p.action === 'jump' || p.action === 'jump_attack') {
          p.action = 'idle';
          p.actionTimer = 0;
        }
      }
    }

    // Handle Attack Input (Z)
    if (inputs.attack && p.attackCooldown === 0 && p.action !== 'hit' && p.action !== 'knockdown' && p.action !== 'defeat') {
      if (!p.isGrounded) {
        // Jump Flying Kick
        p.action = 'jump_attack';
        p.actionTimer = 0;
        p.attackCooldown = 18;
        soundManager.playWhoosh();
        this.performPlayerAttack('jump_attack', 16, 75, 30, true);
      } else if (p.action === 'idle' || p.action === 'walk') {
        // Combo Hit 1: Jab
        p.action = 'attack1';
        p.actionTimer = 0;
        p.attackCooldown = 12;
        soundManager.playWhoosh();
        this.performPlayerAttack('attack1', 8, 65, 26, false);
      } else if (p.action === 'attack1' && p.actionTimer >= 6) {
        // Combo Hit 2: Cross
        p.action = 'attack2';
        p.actionTimer = 0;
        p.attackCooldown = 13;
        soundManager.playWhoosh();
        this.performPlayerAttack('attack2', 12, 70, 26, false);
      } else if (p.action === 'attack2' && p.actionTimer >= 7) {
        // Combo Hit 3: Hook / Slash
        p.action = 'attack3';
        p.actionTimer = 0;
        p.attackCooldown = 15;
        soundManager.playWhoosh();
        this.performPlayerAttack('attack3', 15, 75, 28, false);
      } else if (p.action === 'attack3' && p.actionTimer >= 8) {
        // Combo Hit 4: Flying Finisher Uppercut
        p.action = 'attack4';
        p.actionTimer = 0;
        p.attackCooldown = 24;
        soundManager.playWhoosh();
        this.performPlayerAttack('attack4', 24, 85, 32, true);
        this.triggerScreenShake(6);
      }
    }

    // Handle Special Input (C) — Desperation Spin
    if (inputs.special && p.action !== 'special' && p.action !== 'hit' && p.action !== 'knockdown' && p.action !== 'defeat') {
      p.action = 'special';
      p.actionTimer = 0;
      p.attackCooldown = 32;
      p.invulnerableTimer = 26;

      // Small self damage cost (classic arcade beat 'em up rule)
      if (p.health > 8) {
        p.health = Math.max(1, p.health - 6);
      }

      soundManager.playSpecial();
      this.triggerScreenShake(8);
      this.addFloatingText('¡FURIA CARMESÍ!', p.x, p.y, p.z + 65, '#f43f5e', 1.3);

      // Radial 360 Hitbox
      this.performPlayerRadialSpecial(28, 105, 50);
    }

    // Handle Jump Input (X)
    if (inputs.jump && p.isGrounded && p.action !== 'hit' && p.action !== 'knockdown' && p.action !== 'defeat') {
      p.isGrounded = false;
      p.vz = JUMP_IMPULSE;
      p.action = 'jump';
      p.actionTimer = 0;
      soundManager.playWhoosh();
      this.spawnLandingDust(p.x, p.y);
    }

    // Action state transitions back to idle/walk
    const isAttacking =
      p.action === 'attack1' ||
      p.action === 'attack2' ||
      p.action === 'attack3' ||
      p.action === 'attack4' ||
      p.action === 'special';

    if (isAttacking) {
      const maxFrames =
        p.action === 'attack1' ? 14 :
        p.action === 'attack2' ? 16 :
        p.action === 'attack3' ? 18 :
        p.action === 'attack4' ? 24 : 28;

      if (p.actionTimer >= maxFrames) {
        p.action = 'idle';
        p.actionTimer = 0;
      }
    }

    if (p.action === 'hit' && p.actionTimer >= 14) {
      p.action = 'idle';
      p.actionTimer = 0;
    }

    if (p.action === 'knockdown' && p.actionTimer >= 40) {
      if (p.health <= 0) {
        p.action = 'defeat';
        this.handlePlayerDeath();
      } else {
        p.action = 'idle';
        p.actionTimer = 0;
        p.invulnerableTimer = 35; // Recovery invulnerability
      }
    }

    // Movement (8-Way pseudo-3D)
    if (p.action === 'idle' || p.action === 'walk' || p.action === 'jump') {
      const walkSpeed = 3.8;
      let moveX = 0;
      let moveY = 0;

      if (inputs.left) {
        moveX -= walkSpeed;
        p.facing = -1;
      }
      if (inputs.right) {
        moveX += walkSpeed;
        p.facing = 1;
      }
      if (inputs.up) {
        moveY -= walkSpeed * 0.72; // Isometric depth scaling
      }
      if (inputs.down) {
        moveY += walkSpeed * 0.72;
      }

      // Normalize diagonal speed
      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707;
        moveY *= 0.707;
      }

      p.x += moveX;
      p.y += moveY;

      // Update state for grounded movement
      if (p.isGrounded) {
        if (moveX !== 0 || moveY !== 0) {
          p.action = 'walk';
        } else {
          p.action = 'idle';
        }
      }

      // Constrain position to playfield & camera borders
      p.y = Math.max(PLAYFIELD_MIN_Y, Math.min(PLAYFIELD_MAX_Y, p.y));

      const minScreenX = this.cameraX + 40;
      const maxScreenX = this.isWaveLocked
        ? this.cameraX + VIEW_WIDTH - 60
        : Math.min(STAGE_LENGTH - 60, this.cameraX + VIEW_WIDTH - 60);

      p.x = Math.max(minScreenX, Math.min(maxScreenX, p.x));
    }
  }

  // --- Player Attacks Hitbox Resolution ---
  private performPlayerAttack(
    _attackType: PlayerAction,
    damage: number,
    reachX: number,
    toleranceY: number,
    isKnockdown: boolean
  ) {
    const p = this.player;
    let hitCount = 0;

    for (const enemy of this.enemies) {
      if (enemy.action === 'defeat' || enemy.action === 'knockdown') continue;

      const dx = (enemy.x - p.x) * p.facing;
      const dy = Math.abs(enemy.y - p.y);
      const dz = Math.abs(enemy.z - p.z);

      // Direction check & proximity check
      if (dx >= -10 && dx <= reachX && dy <= toleranceY && dz <= 45) {
        hitCount++;
        this.applyDamageToEnemy(enemy, damage, isKnockdown, p.facing);
      }
    }

    if (hitCount > 0) {
      p.comboCount += hitCount;
      p.comboTimer = 90; // 1.5 seconds to chain next hit
      p.score += damage * 20 * Math.max(1, p.comboCount);

      if (p.comboCount >= 2) {
        this.addFloatingText(`¡COMBO x${p.comboCount}!`, p.x + 20 * p.facing, p.y, p.z + 85, '#facc15', 1.2);
      }
    }
  }

  // 360 Radial Special Attack
  private performPlayerRadialSpecial(damage: number, radiusX: number, toleranceY: number) {
    const p = this.player;
    let hitCount = 0;

    for (const enemy of this.enemies) {
      if (enemy.action === 'defeat' || enemy.action === 'knockdown') continue;

      const dx = Math.abs(enemy.x - p.x);
      const dy = Math.abs(enemy.y - p.y);

      if (dx <= radiusX && dy <= toleranceY) {
        hitCount++;
        const knockDir = enemy.x >= p.x ? 1 : -1;
        this.applyDamageToEnemy(enemy, damage, true, knockDir);
      }
    }

    // Radial shockwave particles
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      this.hitSparks.push({
        id: this.sparkIdCounter++,
        x: p.x + Math.cos(angle) * 35,
        y: p.y + Math.sin(angle) * 15,
        z: 30,
        color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
        size: 8,
        life: 18,
        maxLife: 18,
        type: 'spark',
        vx: Math.cos(angle) * 7,
        vy: Math.sin(angle) * 3,
      });
    }

    if (hitCount > 0) {
      p.comboCount += hitCount;
      p.comboTimer = 100;
      p.score += damage * 35 * hitCount;
    }
  }

  // Apply Damage, Knockdown & FX to Enemy
  private applyDamageToEnemy(enemy: BeatEmUpEnemy, damage: number, knockdown: boolean, hitDir: number) {
    enemy.health -= damage;
    enemy.invulnerableTimer = 12;

    // Visual Juicy Sparks & Sound
    if (knockdown) {
      soundManager.playKO();
      this.triggerScreenShake(7);
      this.addFloatingText('¡CRÍTICO!', enemy.x, enemy.y, enemy.z + 70, '#ef4444', 1.4);
      this.spawnImpactBurst(enemy.x, enemy.y, enemy.z + 40, '#f97316');
    } else {
      soundManager.playPunch(damage > 12);
      this.triggerScreenShake(3);
      const hitWords = ['¡TOMA!', '¡ZAS!', '¡ÓRALE!', '¡PAM!'];
      const word = hitWords[Math.floor(Math.random() * hitWords.length)];
      this.addFloatingText(word, enemy.x, enemy.y, enemy.z + 60, '#facc15', 1.0);
      this.spawnImpactBurst(enemy.x, enemy.y, enemy.z + 40, '#facc15');
    }

    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.action = 'knockdown';
      enemy.actionTimer = 0;
      enemy.vx = hitDir * 6;
      enemy.vz = 8;
      this.player.score += enemy.scoreValue;
      this.addFloatingText(`+${enemy.scoreValue}`, enemy.x, enemy.y, enemy.z + 40, '#22c55e', 1.2);
    } else if (knockdown) {
      enemy.action = 'knockdown';
      enemy.actionTimer = 0;
      enemy.vx = hitDir * 5.5;
      enemy.vz = 7;
    } else {
      enemy.action = 'hit';
      enemy.actionTimer = 0;
      enemy.vx = hitDir * 2;
    }
  }

  // --- Enemy AI & Physics ---
  private updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.actionTimer++;

      if (e.invulnerableTimer > 0) e.invulnerableTimer--;
      if (e.attackCooldown > 0) e.attackCooldown--;

      // Airborne / Gravity physics (for knockdowns)
      if (e.z > 0 || e.vz > 0) {
        e.vz -= GRAVITY;
        e.z += e.vz;
        e.x += e.vx;
        if (e.z <= 0) {
          e.z = 0;
          e.vz = 0;
          e.vx = 0;
          this.spawnLandingDust(e.x, e.y);
        }
      }

      // Dead enemies fade out after lying down
      if (e.health <= 0 && e.action === 'knockdown' && e.actionTimer > 60) {
        e.action = 'defeat';
        this.spawnDefeatParticles(e.x, e.y);
        this.enemies.splice(i, 1);
        continue;
      }

      // Knockdown recovery
      if (e.health > 0 && e.action === 'knockdown' && e.actionTimer > 45 && e.z === 0) {
        e.action = 'getup';
        e.actionTimer = 0;
        e.invulnerableTimer = 25;
      }

      if (e.action === 'getup' && e.actionTimer > 18) {
        e.action = 'patrol';
        e.actionTimer = 0;
      }

      if (e.action === 'hit' && e.actionTimer > 12) {
        e.action = 'approach';
        e.actionTimer = 0;
      }

      // Active AI behavior
      if (e.action !== 'knockdown' && e.action !== 'defeat' && e.action !== 'hit' && e.action !== 'getup') {
        this.runEnemyAI(e);
      }

      // Constrain enemy Y to playfield
      e.y = Math.max(PLAYFIELD_MIN_Y, Math.min(PLAYFIELD_MAX_Y, e.y));
    }
  }

  private runEnemyAI(e: BeatEmUpEnemy) {
    const p = this.player;
    const targetY = p.y + e.targetYOffset;
    const dx = p.x - e.x;
    const dy = targetY - e.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    e.facing = dx >= 0 ? 1 : -1;

    // Strike Range
    const attackRangeX = 54;
    const attackRangeY = 18;

    if (absDx <= attackRangeX && absDy <= attackRangeY && e.attackCooldown === 0 && p.health > 0) {
      // Windup telegraph before strike
      if (e.action !== 'windup' && e.action !== 'attack') {
        e.action = 'windup';
        e.actionTimer = 0;
        e.windupTimer = 16;
      }
    }

    if (e.action === 'windup') {
      e.windupTimer--;
      if (e.windupTimer <= 0) {
        e.action = 'attack';
        e.actionTimer = 0;
        e.attackCooldown = 55;
        this.performEnemyAttack(e);
      }
      return;
    }

    if (e.action === 'attack') {
      if (e.actionTimer >= 20) {
        e.action = 'approach';
        e.actionTimer = 0;
      }
      return;
    }

    // Move to align with player (Y-axis alignment first, then X-axis approach)
    e.action = 'approach';
    const speed = e.walkSpeed;

    if (absDy > 10) {
      e.y += Math.sign(dy) * speed * 0.75;
    }

    if (absDx > attackRangeX - 10) {
      e.x += Math.sign(dx) * speed;
    }
  }

  private performEnemyAttack(e: BeatEmUpEnemy) {
    const p = this.player;
    soundManager.playWhoosh();

    const dx = Math.abs(p.x - e.x);
    const dy = Math.abs(p.y - e.y);
    const dz = Math.abs(p.z - e.z);

    if (dx <= 60 && dy <= 24 && dz <= 35 && p.invulnerableTimer === 0 && p.health > 0) {
      const dmg = e.type === 'maton_aurrera' ? 16 : e.type === 'rudo' ? 12 : 8;
      p.health -= dmg;
      p.invulnerableTimer = 22;
      p.comboCount = 0; // Break player combo

      soundManager.playPunch(true);
      this.triggerScreenShake(4);
      this.addFloatingText(`-${dmg}`, p.x, p.y, p.z + 65, '#f43f5e', 1.2);
      this.spawnImpactBurst(p.x, p.y, p.z + 40, '#dc2626');

      if (p.health <= 0) {
        p.health = 0;
        p.action = 'knockdown';
        p.actionTimer = 0;
        p.vz = 7;
        p.vx = -e.facing * 4;
        this.handlePlayerDeath();
      } else {
        p.action = 'hit';
        p.actionTimer = 0;
        p.vx = -e.facing * 3;
      }
    }
  }

  private handlePlayerDeath() {
    this.player.lives--;
    if (this.player.lives <= 0) {
      this.gameOver = true;
      soundManager.playKO();
      this.addFloatingText('¡GAME OVER!', this.player.x, this.player.y, this.player.z + 80, '#ef4444', 1.6);
    } else {
      // Respawn with full health
      setTimeout(() => {
        if (!this.gameOver) {
          this.player.health = this.player.maxHealth;
          this.player.action = 'idle';
          this.player.invulnerableTimer = 60;
          this.addFloatingText('¡REVIVE!', this.player.x, this.player.y, this.player.z + 70, '#38bdf8', 1.3);
        }
      }, 1500);
    }
  }

  // --- Wave Progression & Camera ---
  private checkWaveTriggers() {
    if (this.currentWaveIndex >= this.waves.length) return;

    const wave = this.waves[this.currentWaveIndex];
    if (this.player.x >= wave.cameraLockX && !this.isWaveLocked) {
      this.isWaveLocked = true;
      this.spawnWaveEnemies(wave);
    }
  }

  private spawnWaveEnemies(wave: WaveDef) {
    wave.enemies.forEach((def, idx) => {
      const spawnX = this.cameraX + (def.spawnXOffset >= 0 ? VIEW_WIDTH + def.spawnXOffset : def.spawnXOffset);
      const enemy: BeatEmUpEnemy = {
        id: this.enemyIdCounter++,
        type: def.type,
        name:
          def.type === 'maton_aurrera' ? 'Comandante Aurrera' :
          def.type === 'rudo' ? 'El Rudo del Callejón' :
          def.type === 'gato_punk' ? 'Gato Pandillero' : 'Cholo de Barrio',
        x: spawnX,
        y: def.spawnY,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        facing: -1,
        action: 'approach',
        actionTimer: 0,
        health: def.type === 'maton_aurrera' ? 120 : def.type === 'rudo' ? 55 : 35,
        maxHealth: def.type === 'maton_aurrera' ? 120 : def.type === 'rudo' ? 55 : 35,
        walkSpeed: def.type === 'gato_punk' ? 2.6 : def.type === 'cholo' ? 2.1 : 1.7,
        attackCooldown: 25 + idx * 10,
        windupTimer: 0,
        invulnerableTimer: 0,
        colorTheme: def.type === 'maton_aurrera' ? '#15803d' : def.type === 'rudo' ? '#ea580c' : '#a855f7',
        scoreValue: def.type === 'maton_aurrera' ? 2500 : def.type === 'rudo' ? 800 : 400,
        targetYOffset: (idx % 2 === 0 ? 1 : -1) * (14 + idx * 8),
      };
      this.enemies.push(enemy);
    });

    soundManager.announce('¡ATENCIÓN!');
  }

  private checkWaveProgression() {
    this.checkWaveTriggers();

    // Check if current locked wave has all enemies defeated
    if (this.isWaveLocked && this.enemies.length === 0) {
      this.isWaveLocked = false;
      this.currentWaveIndex++;

      if (this.currentWaveIndex >= this.waves.length) {
        this.stageCleared = true;
        soundManager.playGong();
        this.addFloatingText('¡ETAPA COMPLETADA!', this.player.x, this.player.y, 80, '#22c55e', 1.8);
      } else {
        soundManager.playCoin();
        this.addFloatingText('¡AVANZA! ▶▶', this.cameraX + VIEW_WIDTH / 2, 400, 70, '#facc15', 1.5);
      }
    }
  }

  private updateCamera() {
    if (this.isWaveLocked) {
      // Keep camera locked in the current combat arena
      const targetLockX = this.waves[this.currentWaveIndex]?.cameraLockX || this.cameraX;
      this.cameraX += (targetLockX - this.cameraX) * 0.1;
    } else {
      // Smoothly scroll camera as player moves forward
      const targetCameraX = Math.max(0, Math.min(STAGE_LENGTH - VIEW_WIDTH, this.player.x - VIEW_WIDTH * 0.35));
      if (targetCameraX > this.cameraX) {
        this.cameraX += (targetCameraX - this.cameraX) * 0.08;
      }
    }
  }

  // --- FX, Sparks & Floating Texts ---
  public triggerScreenShake(magnitude: number) {
    this.screenShake = Math.max(this.screenShake, magnitude);
  }

  private updateScreenShake() {
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }
  }

  public addFloatingText(text: string, x: number, y: number, z: number, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: this.textIdCounter++,
      text,
      x,
      y,
      z,
      color,
      scale,
      vy: 1.4,
      life: 45,
      maxLife: 45,
    });
  }

  private updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.z += ft.vy;
      ft.life--;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private spawnImpactBurst(x: number, y: number, z: number, color: string) {
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 5;
      this.hitSparks.push({
        id: this.sparkIdCounter++,
        x,
        y,
        z,
        color,
        size: 5 + Math.random() * 4,
        life: 14 + Math.floor(Math.random() * 6),
        maxLife: 20,
        type: i % 3 === 0 ? 'star' : 'spark',
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6,
      });
    }
  }

  private spawnLandingDust(x: number, y: number) {
    for (let i = -1; i <= 1; i += 2) {
      this.hitSparks.push({
        id: this.sparkIdCounter++,
        x: x + i * 12,
        y,
        z: 2,
        color: '#a8a29e',
        size: 6,
        life: 12,
        maxLife: 12,
        type: 'dust',
        vx: i * 2.5,
        vy: 0,
      });
    }
  }

  private spawnDefeatParticles(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.hitSparks.push({
        id: this.sparkIdCounter++,
        x,
        y,
        z: 30,
        color: ['#ea580c', '#eab308', '#ec4899', '#22c55e'][i % 4],
        size: 7,
        life: 25,
        maxLife: 25,
        type: 'star',
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 2,
      });
    }
  }

  private updateSparks() {
    for (let i = this.hitSparks.length - 1; i >= 0; i--) {
      const sp = this.hitSparks[i];
      sp.life--;
      if (sp.vx) sp.x += sp.vx;
      if (sp.vy) sp.y += sp.vy;
      if (sp.life <= 0) {
        this.hitSparks.splice(i, 1);
      }
    }
  }
}
