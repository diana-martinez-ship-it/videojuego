/**
 * LUCHA CALLEJERA - MODO BEAT 'EM UP / CALLEJERO (ESTILO FINAL FIGHT)
 * 8-way pseudo-3D belt scroller with wave progression ("GO ->"),
 * urban Mexican parallax background, breakable barrels, food pickups, and boss fight!
 */

import { soundManager } from '../audio/soundManager';
import { CharacterDef, FloatingCombatText, InputState, Particle } from '../types/game';
import { spawnHitSparks } from './physics';

export const BEAT_CANVAS_WIDTH = 960;
export const BEAT_CANVAS_HEIGHT = 540;
export const STREET_MIN_Z = 330;
export const STREET_MAX_Z = 490;
export const STAGE_LENGTH = 2400;

export interface BeatEmUpFighter {
  charDef: CharacterDef;
  x: number;
  z: number; // depth on street (330 to 490)
  y: number; // elevation above ground (0 = on ground, >0 = jumping)
  vx: number;
  vz: number;
  vy: number;
  facing: 1 | -1;
  health: number;
  maxHealth: number;
  superMeter: number;
  state: 'idle' | 'walk' | 'jump' | 'attack1' | 'attack2' | 'finisher' | 'jump_kick' | 'grab' | 'throw' | 'special' | 'hit' | 'knockdown';
  stateTimer: number;
  comboStep: number;
  comboResetTimer: number;
  hitFlashTimer: number;
  score: number;
  grabbedEnemy: BeatEmUpEnemyEntity | null;
}

export interface BeatEmUpEnemyEntity {
  id: number;
  type: 'cholo' | 'calavera' | 'maton' | 'boss';
  name: string;
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  facing: 1 | -1;
  health: number;
  maxHealth: number;
  state: 'idle' | 'walk' | 'attack' | 'hit' | 'knockdown' | 'grabbed';
  stateTimer: number;
  hitFlashTimer: number;
  cooldownTimer: number;
  color: string;
}

export interface StreetItem {
  id: number;
  type: 'tacos' | 'refresco' | 'barril';
  x: number;
  z: number;
  health: number; // for breakable barrel
  collected: boolean;
}

export class BeatEmUpEngine {
  public player: BeatEmUpFighter;
  public enemies: BeatEmUpEnemyEntity[] = [];
  public items: StreetItem[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingCombatText[] = [];
  public cameraX: number = 0;
  public screenShake: number = 0;
  
  // Progression: 3 sectors
  public currentSector: number = 1;
  public sectorLockX: number = 700; // camera cannot pass until wave defeated
  public waveCleared: boolean = false;
  public goArrowTimer: number = 0;
  public bossSpawned: boolean = false;
  public victory: boolean = false;
  public gameOver: boolean = false;
  private animTimer: number = 0;
  private nextEntityId: number = 1;

  constructor(playerChar: CharacterDef) {
    this.player = {
      charDef: playerChar,
      x: 100,
      z: 410,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      facing: 1,
      health: 120,
      maxHealth: 120,
      superMeter: 30,
      state: 'idle',
      stateTimer: 0,
      comboStep: 0,
      comboResetTimer: 0,
      hitFlashTimer: 0,
      score: 0,
      grabbedEnemy: null,
    };

    this.spawnSector1();
  }

  // --- SECTOR SPAWNERS ---
  private spawnSector1() {
    this.currentSector = 1;
    this.sectorLockX = 650;
    this.waveCleared = false;
    this.enemies = [
      this.createEnemy('cholo', 'Malandro Beto', 450, 360, '#ef4444'),
      this.createEnemy('cholo', 'Cholo El Chicles', 580, 430, '#f97316'),
      this.createEnemy('calavera', 'Calavera Callejera', 620, 380, '#a855f7'),
    ];
    this.items = [
      { id: this.nextEntityId++, type: 'barril', x: 380, z: 350, health: 15, collected: false },
      { id: this.nextEntityId++, type: 'tacos', x: 500, z: 440, health: 1, collected: false },
    ];
  }

  private spawnSector2() {
    this.currentSector = 2;
    this.sectorLockX = 1400;
    this.waveCleared = false;
    soundManager.announce('¡OLEADA DOS!');
    this.enemies = [
      this.createEnemy('calavera', 'Esqueleto Mariachi', 1050, 350, '#9333ea'),
      this.createEnemy('calavera', 'Esqueleto Veloz', 1150, 440, '#a855f7'),
      this.createEnemy('cholo', 'Cholo Navajas', 1220, 390, '#dc2626'),
      this.createEnemy('maton', 'El Gordito Peligroso', 1300, 420, '#ea580c'),
    ];
    this.items.push(
      { id: this.nextEntityId++, type: 'barril', x: 980, z: 370, health: 15, collected: false },
      { id: this.nextEntityId++, type: 'refresco', x: 1250, z: 460, health: 1, collected: false }
    );
  }

  private spawnSector3Boss() {
    this.currentSector = 3;
    this.sectorLockX = STAGE_LENGTH - BEAT_CANVAS_WIDTH;
    this.waveCleared = false;
    this.bossSpawned = true;
    this.screenShake = 1.5;
    soundManager.announce('¡JEFE: EL GRAN BRONCO!');
    soundManager.playKO();

    this.enemies = [
      this.createEnemy('boss', '★ JEFE: EL GRAN BRONCO ★', 2050, 410, '#b91c1c', 220),
      this.createEnemy('cholo', 'Guardaespaldas 1', 1900, 360, '#ef4444'),
      this.createEnemy('calavera', 'Guardaespaldas 2', 1980, 450, '#7e22ce'),
    ];
    this.items.push(
      { id: this.nextEntityId++, type: 'tacos', x: 1850, z: 350, health: 1, collected: false },
      { id: this.nextEntityId++, type: 'refresco', x: 2150, z: 460, health: 1, collected: false }
    );
  }

  private createEnemy(
    type: 'cholo' | 'calavera' | 'maton' | 'boss',
    name: string,
    x: number,
    z: number,
    color: string,
    customHp?: number
  ): BeatEmUpEnemyEntity {
    const hp = customHp ?? (type === 'boss' ? 200 : type === 'maton' ? 75 : type === 'calavera' ? 50 : 40);
    return {
      id: this.nextEntityId++,
      type,
      name,
      x,
      z,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      facing: -1,
      health: hp,
      maxHealth: hp,
      state: 'idle',
      stateTimer: 0,
      hitFlashTimer: 0,
      cooldownTimer: Math.floor(Math.random() * 30),
      color,
    };
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#facc15', fontSize: number = 18) {
    this.floatingTexts.push({
      id: this.nextEntityId++,
      text,
      x,
      y,
      vy: -1.8,
      alpha: 1.0,
      color,
      fontSize,
    });
  }

  // --- MAIN 60FPS TICK ---
  public update(inputs: InputState) {
    this.animTimer += 0.03;
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 0.06);

    if (this.gameOver || this.victory) return;

    // 1. Update Player
    this.updatePlayer(inputs);

    // 2. Update Enemies AI & Physics
    this.updateEnemies();

    // 3. Update Breakables & Pickups
    this.updateItems();

    // 4. Update Camera Scrolling
    this.updateCamera();

    // 5. Update Sector Waves progression
    this.updateSectors();

    // 6. Update Particles & Floating Text
    this.updateEffects();
  }

  private updatePlayer(inp: InputState) {
    const p = this.player;
    p.stateTimer++;
    if (p.hitFlashTimer > 0) p.hitFlashTimer--;
    if (p.comboResetTimer > 0) {
      p.comboResetTimer--;
      if (p.comboResetTimer === 0) p.comboStep = 0;
    }

    // Gravity for Jump
    if (p.y > 0 || p.vy !== 0) {
      p.y += p.vy;
      p.vy -= 0.8; // gravity
      if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.state = 'idle';
        p.stateTimer = 0;
        soundManager.playWhoosh();
      }
    }

    // Knockdown recovery
    if (p.state === 'knockdown') {
      if (p.stateTimer > 35) {
        p.state = 'idle';
        p.stateTimer = 0;
      }
      return;
    }

    // Hit stun
    if (p.state === 'hit') {
      if (p.stateTimer > 15) {
        p.state = 'idle';
        p.stateTimer = 0;
      }
      return;
    }

    // Attack state durations
    if (p.state === 'attack1' || p.state === 'attack2' || p.state === 'finisher' || p.state === 'jump_kick') {
      const maxFrames = p.state === 'finisher' ? 22 : 15;
      if (p.stateTimer >= 5 && p.stateTimer <= 9) {
        this.checkPlayerAttackCollision();
      }
      if (p.stateTimer > maxFrames) {
        p.state = 'idle';
        p.stateTimer = 0;
      }
      return;
    }

    if (p.state === 'throw') {
      if (p.stateTimer === 8 && p.grabbedEnemy) {
        // Slam enemy!
        const enemy = p.grabbedEnemy;
        enemy.state = 'knockdown';
        enemy.stateTimer = 0;
        enemy.health -= 35;
        enemy.vx = p.facing * 12;
        enemy.vy = 8;
        this.screenShake = 1.2;
        soundManager.playKO();
        this.addFloatingText('¡CATORRAZO!', enemy.x, enemy.z - 60, '#f97316', 22);
        p.grabbedEnemy = null;
      }
      if (p.stateTimer > 20) {
        p.state = 'idle';
        p.stateTimer = 0;
      }
      return;
    }

    if (p.state === 'special') {
      if (p.stateTimer >= 6 && p.stateTimer <= 18) {
        this.checkPlayerSpecialCollision();
      }
      if (p.stateTimer > 28) {
        p.state = 'idle';
        p.stateTimer = 0;
      }
      return;
    }

    // --- Neutral Player Inputs ---
    // Super / Special attack (L or Space)
    if (inp.special && p.superMeter >= 25) {
      p.superMeter -= 25;
      p.state = 'special';
      p.stateTimer = 0;
      p.vx = 0;
      p.vz = 0;
      soundManager.playSpecial();
      this.screenShake = 0.8;
      this.addFloatingText('¡SUPER GOLPE!', p.x, p.z - 70, '#facc15', 20);
      return;
    }

    // Jump
    if (inp.up && p.y === 0 && !inp.down && !inp.punch && !inp.kick && inp.super) {
      p.vy = 13.5;
      p.state = 'jump';
      p.stateTimer = 0;
      soundManager.playWhoosh();
      return;
    }

    // Jump Attack
    if (p.y > 0 && (inp.punch || inp.kick)) {
      p.state = 'jump_kick';
      p.stateTimer = 0;
      soundManager.playKick(true);
      return;
    }

    // Check Close Grapple / Throw
    const nearbyEnemy = this.enemies.find(
      e => e.health > 0 && Math.abs(e.x - p.x) < 45 && Math.abs(e.z - p.z) < 22 && e.state !== 'knockdown'
    );

    if (nearbyEnemy && inp.punch && (p.facing === 1 ? inp.right : inp.left)) {
      // Execute Wrestling Throw!
      p.state = 'throw';
      p.stateTimer = 0;
      p.grabbedEnemy = nearbyEnemy;
      nearbyEnemy.state = 'grabbed';
      nearbyEnemy.stateTimer = 0;
      soundManager.playWhoosh();
      return;
    }

    // Normal Combo Punch / Kick
    if (inp.punch || inp.kick) {
      if (p.comboStep === 0) {
        p.state = 'attack1';
        p.comboStep = 1;
      } else if (p.comboStep === 1) {
        p.state = 'attack2';
        p.comboStep = 2;
      } else {
        p.state = 'finisher';
        p.comboStep = 0;
      }
      p.stateTimer = 0;
      p.comboResetTimer = 40;
      p.vx = 0;
      p.vz = 0;
      soundManager.playPunch(p.state === 'finisher');
      return;
    }

    // 8-Direction Belt-Scroller Movement
    const speed = p.charDef.stats.speed * 0.7 + 3.2;
    p.vx = 0;
    p.vz = 0;

    if (inp.left) {
      p.vx = -speed;
      p.facing = -1;
    } else if (inp.right) {
      p.vx = speed;
      p.facing = 1;
    }

    if (inp.up) {
      p.vz = -speed * 0.75; // Z depth speed slightly reduced for pseudo-3D perspective
    } else if (inp.down) {
      p.vz = speed * 0.75;
    }

    p.x += p.vx;
    p.z += p.vz;

    // Street Boundaries
    const minX = Math.max(0, this.cameraX);
    const maxX = this.waveCleared ? STAGE_LENGTH - 60 : Math.min(this.cameraX + BEAT_CANVAS_WIDTH - 60, this.sectorLockX);
    p.x = Math.max(minX + 20, Math.min(maxX, p.x));
    p.z = Math.max(STREET_MIN_Z, Math.min(STREET_MAX_Z, p.z));

    p.state = (p.vx !== 0 || p.vz !== 0) ? 'walk' : 'idle';
  }

  private checkPlayerAttackCollision() {
    const p = this.player;
    const hitReach = p.state === 'finisher' ? 75 : 60;
    const hitDamage = p.state === 'finisher' ? 24 : p.state === 'attack2' ? 14 : 10;
    const isHeavy = p.state === 'finisher' || p.state === 'jump_kick';

    for (const enemy of this.enemies) {
      if (enemy.health <= 0 || enemy.state === 'knockdown') continue;

      // Check X and Z plane proximity
      const dx = (enemy.x - p.x) * p.facing;
      const dz = Math.abs(enemy.z - p.z);

      if (dx > 0 && dx < hitReach && dz < 26) {
        // Hit connected!
        enemy.health -= hitDamage;
        enemy.hitFlashTimer = 6;
        p.score += hitDamage * 25;
        p.superMeter = Math.min(100, p.superMeter + 6);

        // Spawn hitsparks
        this.particles.push(...spawnHitSparks(enemy.x, enemy.z - 45 - enemy.y, false));
        soundManager.playPunch(isHeavy);

        if (enemy.health <= 0) {
          enemy.state = 'knockdown';
          enemy.stateTimer = 0;
          enemy.vx = p.facing * 8;
          enemy.vy = 6;
          this.screenShake = 1.0;
          soundManager.playKO();
          this.addFloatingText('¡K.O.!', enemy.x, enemy.z - 65, '#dc2626', 24);
        } else if (isHeavy) {
          enemy.state = 'knockdown';
          enemy.stateTimer = 0;
          enemy.vx = p.facing * 7;
          enemy.vy = 4;
          this.screenShake = 0.6;
          this.addFloatingText('¡CRÍTICO!', enemy.x, enemy.z - 60, '#facc15', 18);
        } else {
          enemy.state = 'hit';
          enemy.stateTimer = 0;
          enemy.vx = p.facing * 3;
          this.addFloatingText('¡TOMA!', enemy.x, enemy.z - 55, '#fef08a', 15);
        }
      }
    }

    // Check breakable items (crates, barrels)
    for (const item of this.items) {
      if (item.collected || item.type !== 'barril') continue;
      const dx = Math.abs(item.x - p.x);
      const dz = Math.abs(item.z - p.z);
      if (dx < 60 && dz < 25) {
        item.health -= hitDamage;
        soundManager.playPunch(true);
        this.particles.push(...spawnHitSparks(item.x, item.z - 25, false));
        if (item.health <= 0) {
          item.collected = true;
          // Spawn food drop!
          this.items.push({
            id: this.nextEntityId++,
            type: Math.random() < 0.5 ? 'tacos' : 'refresco',
            x: item.x,
            z: item.z,
            health: 1,
            collected: false,
          });
          this.addFloatingText('¡ROTO!', item.x, item.z - 40, '#f97316', 16);
        }
      }
    }
  }

  private checkPlayerSpecialCollision() {
    const p = this.player;
    for (const enemy of this.enemies) {
      if (enemy.health <= 0 || enemy.state === 'knockdown') continue;
      const dist = Math.hypot(enemy.x - p.x, (enemy.z - p.z) * 1.5);
      if (dist < 110) {
        enemy.health -= 38;
        enemy.hitFlashTimer = 8;
        enemy.state = 'knockdown';
        enemy.stateTimer = 0;
        enemy.vx = (enemy.x > p.x ? 1 : -1) * 9;
        enemy.vy = 7;
        p.score += 750;
        this.screenShake = 1.2;
        this.particles.push(...spawnHitSparks(enemy.x, enemy.z - 50, false));
        this.addFloatingText('¡DESASTRE TOTAL!', enemy.x, enemy.z - 70, '#f43f5e', 22);
      }
    }
  }

  private updateEnemies() {
    const p = this.player;

    for (const enemy of this.enemies) {
      if (enemy.health <= 0) {
        if (enemy.y > 0 || enemy.vy !== 0) {
          enemy.y += enemy.vy;
          enemy.vy -= 0.8;
          enemy.x += enemy.vx;
          if (enemy.y <= 0) {
            enemy.y = 0;
            enemy.vy = 0;
            enemy.vx = 0;
          }
        }
        continue;
      }

      enemy.stateTimer++;
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer--;
      if (enemy.cooldownTimer > 0) enemy.cooldownTimer--;

      // Gravity if airborne
      if (enemy.y > 0 || enemy.vy !== 0) {
        enemy.y += enemy.vy;
        enemy.vy -= 0.8;
        enemy.x += enemy.vx;
        if (enemy.y <= 0) {
          enemy.y = 0;
          enemy.vy = 0;
          enemy.vx = 0;
        }
      }

      if (enemy.state === 'knockdown') {
        if (enemy.stateTimer > 45) {
          enemy.state = 'idle';
          enemy.stateTimer = 0;
        }
        continue;
      }

      if (enemy.state === 'hit') {
        if (enemy.stateTimer > 12) {
          enemy.state = 'idle';
          enemy.stateTimer = 0;
        }
        continue;
      }

      if (enemy.state === 'attack') {
        if (enemy.stateTimer === 8) {
          // Check if attack hits player
          const dx = Math.abs(p.x - enemy.x);
          const dz = Math.abs(p.z - enemy.z);
          if (dx < 50 && dz < 24 && p.state !== 'knockdown') {
            const dmg = enemy.type === 'boss' ? 22 : enemy.type === 'maton' ? 16 : 10;
            p.health -= dmg;
            p.hitFlashTimer = 8;
            this.screenShake = 0.7;
            this.particles.push(...spawnHitSparks(p.x, p.z - 50, false));
            soundManager.playPunch(true);

            if (p.health <= 0) {
              p.state = 'knockdown';
              p.stateTimer = 0;
              this.gameOver = true;
              soundManager.announce('¡HAS SIDO DERROTADO!');
            } else if (dmg >= 16) {
              p.state = 'knockdown';
              p.stateTimer = 0;
              p.vx = enemy.facing * 6;
              p.vy = 4;
            } else {
              p.state = 'hit';
              p.stateTimer = 0;
            }
          }
        }
        if (enemy.stateTimer > 18) {
          enemy.state = 'idle';
          enemy.stateTimer = 0;
          enemy.cooldownTimer = 25 + Math.floor(Math.random() * 20);
        }
        continue;
      }

      // Enemy AI Locomotion & Targeting
      const targetX = p.x + (enemy.x > p.x ? 45 : -45);
      const targetZ = p.z;
      const speed = enemy.type === 'boss' ? 2.6 : enemy.type === 'calavera' ? 3.0 : 2.2;

      enemy.facing = p.x > enemy.x ? 1 : -1;

      const dx = targetX - enemy.x;
      const dz = targetZ - enemy.z;

      if (Math.abs(dx) > 10) {
        enemy.x += Math.sign(dx) * speed;
      }
      if (Math.abs(dz) > 6) {
        enemy.z += Math.sign(dz) * (speed * 0.75);
      }

      // Check attack trigger
      if (Math.abs(p.x - enemy.x) < 55 && Math.abs(p.z - enemy.z) < 20 && enemy.cooldownTimer === 0 && p.state !== 'knockdown') {
        enemy.state = 'attack';
        enemy.stateTimer = 0;
        soundManager.playWhoosh();
      } else {
        enemy.state = (Math.abs(dx) > 10 || Math.abs(dz) > 6) ? 'walk' : 'idle';
      }
    }
  }

  private updateItems() {
    const p = this.player;

    for (const item of this.items) {
      if (item.collected || item.type === 'barril') continue;
      const dx = Math.abs(item.x - p.x);
      const dz = Math.abs(item.z - p.z);

      if (dx < 35 && dz < 20) {
        item.collected = true;
        soundManager.playCoin();

        if (item.type === 'tacos') {
          p.health = Math.min(p.maxHealth, p.health + 40);
          p.score += 200;
          this.addFloatingText('+40 HP (TACOS)', p.x, p.z - 60, '#22c55e', 18);
        } else if (item.type === 'refresco') {
          p.superMeter = Math.min(100, p.superMeter + 50);
          p.score += 300;
          this.addFloatingText('+50 SUPER (REFRESCO)', p.x, p.z - 60, '#38bdf8', 18);
        }
      }
    }
  }

  private updateCamera() {
    const targetCamX = this.player.x - 320;
    const maxCamX = this.waveCleared ? STAGE_LENGTH - BEAT_CANVAS_WIDTH : Math.min(STAGE_LENGTH - BEAT_CANVAS_WIDTH, this.sectorLockX - BEAT_CANVAS_WIDTH + 80);
    this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX + (targetCamX - this.cameraX) * 0.08));
  }

  private updateSectors() {
    const aliveEnemies = this.enemies.filter(e => e.health > 0);

    if (aliveEnemies.length === 0) {
      if (!this.waveCleared) {
        this.waveCleared = true;
        this.goArrowTimer = 0;
        soundManager.playCoin();

        if (this.currentSector === 3 && this.bossSpawned) {
          this.victory = true;
          soundManager.announce('¡VICTORIA TOTAL! ¡EL BARRIO ES NUESTRO!');
          return;
        }
      }

      this.goArrowTimer++;

      // Advance to next sector when player walks past sector boundary
      if (this.currentSector === 1 && this.player.x >= 750) {
        this.spawnSector2();
      } else if (this.currentSector === 2 && this.player.x >= 1500) {
        this.spawnSector3Boss();
      }
    }
  }

  private updateEffects() {
    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
      if (part.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.022;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- RENDERING PIPELINE ---
  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Screen Shake
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake * 10;
      const sy = (Math.random() - 0.5) * this.screenShake * 10;
      ctx.translate(sx, sy);
    }

    // 1. Multi-Layer Parallax Background
    this.renderParallaxBackground(ctx);

    // 2. Isometric Depth Sort (Entities sorted by Z coordinate so nearer entities draw over deeper ones)
    const renderList: Array<{ type: 'player' | 'enemy' | 'item'; entity: any; z: number }> = [];

    renderList.push({ type: 'player', entity: this.player, z: this.player.z });
    for (const e of this.enemies) {
      renderList.push({ type: 'enemy', entity: e, z: e.z });
    }
    for (const item of this.items) {
      if (!item.collected) {
        renderList.push({ type: 'item', entity: item, z: item.z });
      }
    }

    renderList.sort((a, b) => a.z - b.z);

    // Render sorted entities
    for (const item of renderList) {
      if (item.type === 'player') {
        this.renderPlayer(ctx, this.player);
      } else if (item.type === 'enemy') {
        this.renderEnemy(ctx, item.entity as BeatEmUpEnemyEntity);
      } else if (item.type === 'item') {
        this.renderItem(ctx, item.entity as StreetItem);
      }
    }

    // 3. Particles
    this.renderParticles(ctx);

    // 4. Floating Text Alerts
    this.renderFloatingTexts(ctx);

    // 5. "GO ->" Flashing Arcade Arrow Prompt
    if (this.waveCleared && !this.victory && !this.gameOver) {
      this.renderGoPrompt(ctx);
    }

    ctx.restore();
  }

  // --- URBAN MEXICAN PARALLAX BACKGROUND ---
  private renderParallaxBackground(ctx: CanvasRenderingContext2D) {
    const cam = this.cameraX;

    // Layer 1: Night Sky (Fixed / 0.05x scroll)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
    skyGrad.addColorStop(0, '#0f0c1b');
    skyGrad.addColorStop(0.6, '#281736');
    skyGrad.addColorStop(1, '#4a154b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, BEAT_CANVAS_WIDTH, 320);

    // Full Moon
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(800 - (cam * 0.03) % 960, 80, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Layer 2: Distant City Skyline Silhouettes (0.15x scroll)
    ctx.fillStyle = '#181124';
    for (let x = -100; x < STAGE_LENGTH; x += 110) {
      const screenX = x - cam * 0.15;
      const height = 90 + ((x * 47) % 70);
      ctx.fillRect(screenX, 220 - height, 95, height + 100);
      // Small yellow lit windows
      ctx.fillStyle = '#fef08a';
      for (let w = 0; w < 3; w++) {
        for (let row = 0; row < 4; row++) {
          if ((x + w + row) % 3 === 0) {
            ctx.fillRect(screenX + 15 + w * 25, 230 - height + 15 + row * 20, 8, 10);
          }
        }
      }
      ctx.fillStyle = '#181124';
    }

    // Layer 3: Street-level Mexican Buildings & Taco Stands (0.4x scroll)
    for (let x = -150; x < STAGE_LENGTH; x += 280) {
      const screenX = x - cam * 0.4;
      // Building facade
      const colors = ['#831843', '#701a75', '#1e293b', '#064e3b', '#7c2d12'];
      ctx.fillStyle = colors[Math.abs(x) % colors.length];
      ctx.fillRect(screenX, 130, 260, 190);

      // Neon Sign
      ctx.fillStyle = '#facc15';
      ctx.font = '900 11px "Rubik Mono One", monospace';
      const signs = ['BODEGA AURRERA', 'TACOS DON CHENCHO', 'ARENA MÉXICO', 'PULQUERÍA LA GLORIA', 'LOTERÍA'];
      const signText = signs[Math.abs(x / 280) % signs.length];
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillText(signText, screenX + 20, 160);
      ctx.shadowBlur = 0;

      // Papel picado garlands hanging
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenX, 175);
      ctx.quadraticCurveTo(screenX + 130, 195, screenX + 260, 175);
      ctx.stroke();

      const papelColors = ['#ec4899', '#ea580c', '#16a34a', '#facc15', '#06b6d4'];
      for (let p = 20; p < 240; p += 35) {
        ctx.fillStyle = papelColors[p % papelColors.length];
        ctx.fillRect(screenX + p, 185, 18, 14);
      }
    }

    // Layer 4: Sidewalk Curb & Asphalt Street Floor (1.0x scroll)
    // Sidewalk
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(0, 310, BEAT_CANVAS_WIDTH, 25);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(0, 332, BEAT_CANVAS_WIDTH, 4); // Curb highlight

    // Asphalt Floor with perspective
    const streetGrad = ctx.createLinearGradient(0, 336, 0, BEAT_CANVAS_HEIGHT);
    streetGrad.addColorStop(0, '#1c1917');
    streetGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = streetGrad;
    ctx.fillRect(0, 336, BEAT_CANVAS_WIDTH, BEAT_CANVAS_HEIGHT - 336);

    // Street markings & dashed lane lines (scrolling 1.0x)
    ctx.fillStyle = '#eab308';
    for (let x = 0; x < STAGE_LENGTH; x += 140) {
      const screenX = x - cam;
      ctx.fillRect(screenX, 415, 60, 6);
    }
  }

  // --- ENTITY RENDERERS ---
  private renderPlayer(ctx: CanvasRenderingContext2D, p: BeatEmUpFighter) {
    const screenX = p.x - this.cameraX;
    const groundY = p.z;
    const shadowY = groundY;
    const bodyY = groundY - p.y;

    // 1. Dynamic Ground Shadow
    const shadowScale = Math.max(0.3, 1 - p.y / 150);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(screenX, shadowY, 32 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fighter Body Sprite / Procedural 16-Bit
    ctx.save();
    ctx.translate(screenX, bodyY);
    if (p.facing === -1) ctx.scale(-1, 1);

    const isFlashing = p.hitFlashTimer > 0;
    const t = this.animTimer * 8;
    const bob = p.state === 'walk' ? Math.sin(t) * 4 : Math.sin(t * 0.5) * 2;

    // Feet / Boots
    ctx.fillStyle = isFlashing ? '#ffffff' : '#f59e0b';
    ctx.fillRect(-18, -12 + (p.state === 'walk' ? Math.cos(t) * 6 : 0), 14, 12);
    ctx.fillRect(4, -12 - (p.state === 'walk' ? Math.cos(t) * 6 : 0), 14, 12);

    // Legs / Pants
    ctx.fillStyle = isFlashing ? '#ffffff' : p.charDef.themeColor;
    ctx.fillRect(-16, -38, 12, 28);
    ctx.fillRect(4, -38, 12, 28);

    // Torso / Wrestling Costume
    ctx.fillStyle = isFlashing ? '#ffffff' : p.charDef.themeColor;
    ctx.fillRect(-18, -75 + bob, 36, 40);

    // Belt / Gold Buckle
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-18, -42 + bob, 36, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -44 + bob, 12, 10);

    // Cape (if Mamá Lucha or Zorro Negro)
    if (p.charDef.id === 'mama_lucha' || p.charDef.id === 'zorro_negro') {
      ctx.fillStyle = p.charDef.id === 'mama_lucha' ? '#facc15' : '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-16, -72 + bob);
      ctx.lineTo(-35 - (p.vx * 3), -35 + bob);
      ctx.lineTo(-12, -40 + bob);
      ctx.closePath();
      ctx.fill();
    }

    // Head / Mask
    ctx.fillStyle = isFlashing ? '#ffffff' : '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -90 + bob, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eyes / Mask Cutouts
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(4, -94 + bob, 6, 4);

    // Attack Arms animation
    if (p.state === 'attack1' || p.state === 'attack2' || p.state === 'finisher') {
      ctx.fillStyle = isFlashing ? '#ffffff' : '#f59e0b';
      // Extended punching fist
      ctx.fillRect(10, -68 + bob, 34, 14);
      // Boxing glove
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(46, -61 + bob, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.state === 'jump_kick') {
      // Extended flying leg
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(10, -25, 38, 14);
    } else {
      // Guard stance
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(14, -65 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, e: BeatEmUpEnemyEntity) {
    const screenX = e.x - this.cameraX;
    const shadowY = e.z;
    const bodyY = e.z - e.y;

    // Shadow
    const shadowScale = Math.max(0.2, 1 - e.y / 150);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(screenX, shadowY, (e.type === 'boss' ? 44 : 26) * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(screenX, bodyY);
    if (e.facing === -1) ctx.scale(-1, 1);

    const isFlashing = e.hitFlashTimer > 0;
    const t = this.animTimer * 7;
    const bob = e.state === 'walk' ? Math.sin(t) * 3 : 0;
    const scale = e.type === 'boss' ? 1.4 : e.type === 'maton' ? 1.2 : 1.0;

    ctx.scale(scale, scale);

    // Body based on enemy type
    if (e.type === 'boss') {
      // BOSS: El Gran Bronco (Rudo con cuernos de toro y capa negra)
      ctx.fillStyle = isFlashing ? '#ffffff' : '#18181b';
      ctx.fillRect(-22, -80 + bob, 44, 46); // Massive torso

      // Gold bull horns on head
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-16, -98 + bob);
      ctx.lineTo(-30, -118 + bob);
      ctx.lineTo(-12, -104 + bob);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(16, -98 + bob);
      ctx.lineTo(30, -118 + bob);
      ctx.lineTo(12, -104 + bob);
      ctx.closePath();
      ctx.fill();

      // Mask
      ctx.fillStyle = isFlashing ? '#ffffff' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(0, -96 + bob, 20, 0, Math.PI * 2);
      ctx.fill();

      // Glowing red eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(4, -98 + bob, 6, 4);

      // Heavy Arms
      ctx.fillStyle = isFlashing ? '#ffffff' : '#b91c1c';
      if (e.state === 'attack') {
        ctx.fillRect(15, -72 + bob, 40, 16);
      } else {
        ctx.fillRect(12, -70 + bob, 16, 26);
      }
    } else if (e.type === 'calavera') {
      // Calavera / Esqueleto
      ctx.fillStyle = isFlashing ? '#ffffff' : '#e2e8f0';
      // Spine & ribs
      ctx.fillRect(-8, -65 + bob, 16, 30);
      for (let r = 0; r < 4; r++) {
        ctx.fillRect(-14, -62 + r * 7 + bob, 28, 3);
      }
      // Skull
      ctx.beginPath();
      ctx.arc(0, -78 + bob, 14, 0, Math.PI * 2);
      ctx.fill();
      // Eye sockets
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(2, -80 + bob, 4, 4);
    } else {
      // Cholo Callejero / Malandro
      ctx.fillStyle = isFlashing ? '#ffffff' : e.color;
      ctx.fillRect(-14, -68 + bob, 28, 36); // Sleeveless shirt
      // Head
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, -78 + bob, 14, 0, Math.PI * 2);
      ctx.fill();
      // Bandana / Paliacate
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-14, -86 + bob, 28, 8);
    }

    ctx.restore();

    // Overhead Health Bar
    if (e.health > 0) {
      const barW = e.type === 'boss' ? 70 : 44;
      const barX = screenX - barW / 2;
      const barY = bodyY - (e.type === 'boss' ? 140 : 100);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, 6);
      ctx.fillStyle = e.type === 'boss' ? '#ef4444' : '#f59e0b';
      ctx.fillRect(barX, barY, (barW * e.health) / e.maxHealth, 4);

      // Name label
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(e.name, screenX, barY - 3);
    }
  }

  private renderItem(ctx: CanvasRenderingContext2D, item: StreetItem) {
    const screenX = item.x - this.cameraX;
    const y = item.z;

    if (item.type === 'barril') {
      // Breakable Wooden Barrel
      ctx.fillStyle = '#78350f';
      ctx.fillRect(screenX - 16, y - 36, 32, 36);
      // Metal bands
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(screenX - 16, y - 30, 32, 4);
      ctx.fillRect(screenX - 16, y - 10, 32, 4);
    } else if (item.type === 'tacos') {
      // Tacos de Canasta
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(screenX, y - 12, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#16a34a'; // cilantro
      ctx.fillRect(screenX - 6, y - 14, 12, 4);
      // Glow
      ctx.fillStyle = '#22c55e';
      ctx.font = '700 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TACOS', screenX, y - 24);
    } else {
      // Refresco en Bolsa con Popote
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(screenX - 8, y - 22, 16, 20);
      // Popote
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenX, y - 22);
      ctx.lineTo(screenX + 6, y - 32);
      ctx.stroke();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const sx = p.x - this.cameraX;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sx, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const ft of this.floatingTexts) {
      const sx = ft.x - this.cameraX;
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `900 ${ft.fontSize}px "Rubik Mono One", "Press Start 2P", sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, sx, ft.y);
    }
    ctx.restore();
  }

  private renderGoPrompt(ctx: CanvasRenderingContext2D) {
    const isVisible = Math.floor(this.goArrowTimer / 12) % 2 === 0;
    if (!isVisible) return;

    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = '900 24px "Rubik Mono One", "Press Start 2P", sans-serif';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 18;
    ctx.textAlign = 'right';
    ctx.fillText('¡AVANZA!  GO ➔➔', BEAT_CANVAS_WIDTH - 30, 240);
    ctx.restore();
  }
}
