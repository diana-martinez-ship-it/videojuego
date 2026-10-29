import { soundManager } from '../audio/soundManager';
import { CharacterDef, FighterState, Hitbox, InputState, Particle, Projectile } from '../types/game';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 410;

export function createFighter(
  id: 1 | 2,
  charDef: CharacterDef,
  startX: number,
  facing: 1 | -1
): FighterState {
  return {
    id,
    charDef,
    x: startX,
    y: GROUND_Y - 110,
    vx: 0,
    vy: 0,
    width: 65,
    height: 110,
    facing,
    isGrounded: true,
    health: 100,
    maxHealth: 100,
    superMeter: 0,
    state: 'idle',
    stateTimer: 0,
    currentHitbox: null,
    isBlocking: false,
    comboCount: 0,
    roundsWon: 0,
    hitFlashTimer: 0,
  };
}

export function spawnCempasuchilPetals(count: number): Particle[] {
  const petals: Particle[] = [];
  const colors = ['#ea580c', '#f97316', '#facc15', '#fbbf24', '#c2410c'];
  for (let i = 0; i < count; i++) {
    petals.push({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (GROUND_Y + 50),
      vx: 0.4 + Math.random() * 0.8,
      vy: 0.2 + Math.random() * 0.6,
      life: 200 + Math.random() * 200,
      maxLife: 400,
      size: 3 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'petal',
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05,
    });
  }
  return petals;
}

export function spawnHitSparks(x: number, y: number, isBlocked: boolean = false): Particle[] {
  const sparks: Particle[] = [];
  const count = isBlocked ? 6 : 14;
  const colors = isBlocked
    ? ['#38bdf8', '#7dd3fc', '#ffffff']
    : ['#facc15', '#f97316', '#dc2626', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 12 + Math.random() * 8,
      maxLife: 20,
      size: isBlocked ? 4 : 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'spark',
      rotation: Math.random() * Math.PI,
      vRot: 0.2,
    });
  }
  return sparks;
}

export class PhysicsEngine {
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public screenShake: number = 0;
  public hitstopTimer: number = 0;
  public nextProjectileId: number = 1;

  constructor() {
    this.particles = spawnCempasuchilPetals(45);
  }

  public resetArena() {
    this.projectiles = [];
    this.particles = spawnCempasuchilPetals(45);
    this.screenShake = 0;
    this.hitstopTimer = 0;
  }

  public update(
    p1: FighterState,
    p2: FighterState,
    input1: InputState,
    input2: InputState,
    onSuperFired?: (f: FighterState) => void,
    onHitCombo?: (attacker: FighterState, hits: number) => void
  ) {
    // Hitstop freeze (for impactful punch feel)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer--;
      return;
    }

    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.05) this.screenShake = 0;
    }

    // 1. Update facing directions (fighters turn to face each other unless attacking)
    if (p1.state === 'idle' || p1.state === 'walk_forward' || p1.state === 'walk_backward') {
      p1.facing = p1.x < p2.x ? 1 : -1;
    }
    if (p2.state === 'idle' || p2.state === 'walk_forward' || p2.state === 'walk_backward') {
      p2.facing = p2.x < p1.x ? 1 : -1;
    }

    // 2. Update individual fighters
    this.updateFighter(p1, input1, p2, onSuperFired);
    this.updateFighter(p2, input2, p1, onSuperFired);

    // 3. Collision between fighters (pushbox)
    this.resolveFighterPushbox(p1, p2);

    // 4. Hitbox vs Hurtbox detection
    this.checkHitbox(p1, p2, onHitCombo);
    this.checkHitbox(p2, p1, onHitCombo);

    // 5. Update projectiles
    this.updateProjectiles(p1, p2, onHitCombo);

    // 6. Update particles
    this.updateParticles();
  }

  private updateFighter(
    f: FighterState,
    inp: InputState,
    opponent: FighterState,
    onSuperFired?: (f: FighterState) => void
  ) {
    f.stateTimer++;

    if (f.hitFlashTimer > 0) {
      f.hitFlashTimer--;
    }

    // Cannot act during hitstun, knockdown, victory or defeat
    // Cannot act during hitstun, knockdown, wakeup, throw, grabbed, victory or defeat
    if (
      f.state === 'hit' ||
      f.state === 'knockdown' ||
      f.state === 'wakeup' ||
      f.state === 'throw' ||
      f.state === 'grabbed' ||
      f.state === 'victory' ||
      f.state === 'defeat'
    ) {
      if (f.state === 'hit' && f.stateTimer > 14) {
        f.state = 'idle';
        f.stateTimer = 0;
      } else if (f.state === 'knockdown') {
        if (f.isGrounded && f.stateTimer > 35) {
          f.state = 'wakeup';
          f.stateTimer = 0;
        }
      } else if (f.state === 'wakeup') {
        if (f.stateTimer > 12) {
          f.state = 'idle';
          f.stateTimer = 0;
        }
      } else if (f.state === 'throw') {
        if (f.stateTimer === 8) {
          opponent.state = 'knockdown';
          opponent.stateTimer = 0;
          opponent.health = Math.max(0, opponent.health - 22);
          opponent.vx = f.facing * 8;
          opponent.vy = -6;
          f.superMeter = Math.min(100, f.superMeter + 15);
          this.screenShake = 1.3;
          soundManager.playKO();
          this.particles.push(...spawnHitSparks(opponent.x + opponent.width / 2, opponent.y + 40, false));
        }
        if (f.stateTimer > 24) {
          f.state = 'idle';
          f.stateTimer = 0;
        }
      } else if (f.state === 'grabbed') {
        f.vx = 0;
        if (f.stateTimer > 24) {
          f.state = 'idle';
          f.stateTimer = 0;
        }
      }
      this.applyGravity(f);
      return;
    }

    // Checking blocking stance: holding backwards while opponent is attacking
    const movingAway = (f.facing === 1 && inp.left) || (f.facing === -1 && inp.right);
    const opponentAttacking =
      opponent.state === 'punch' ||
      opponent.state === 'heavy_punch' ||
      opponent.state === 'kick' ||
      opponent.state === 'special' ||
      opponent.state === 'super' ||
      this.projectiles.some(p => p.owner !== f.id);

    f.isBlocking = movingAway && opponentAttacking && f.isGrounded;

    // Movement speeds based on character stats
    const baseSpeed = 3.6 + (f.charDef.stats.speed - 3) * 0.6;

    // Handle Attack Inputs if in neutral states
    const canAttack = f.state === 'idle' || f.state === 'walk_forward' || f.state === 'walk_backward' || f.state === 'crouch';

    if (canAttack) {
      // Close Grapple / Throw (Frente + Golpe a corta distancia)
      const movingForward = (f.facing === 1 && inp.right) || (f.facing === -1 && inp.left);
      const isClose = Math.abs(f.x - opponent.x) < 55 && f.isGrounded && opponent.isGrounded && opponent.state !== 'knockdown' && opponent.state !== 'wakeup';

      if ((inp.throw || (movingForward && inp.punch)) && isClose) {
        f.state = 'throw';
        f.stateTimer = 0;
        f.vx = 0;
        opponent.state = 'grabbed';
        opponent.stateTimer = 0;
        opponent.vx = 0;
        soundManager.playWhoosh();
        return;
      }

      if (inp.super && f.superMeter >= 100) {
        // SUPER MOVE ACTIVATION!
        f.superMeter = 0;
        f.state = 'super';
        f.stateTimer = 0;
        f.vx = 0;
        soundManager.playSuper();
        this.hitstopTimer = 18;
        this.screenShake = 1.2;
        if (onSuperFired) onSuperFired(f);
        this.spawnSpecialAttack(f);
        return;
      }

      if (inp.special) {
        // SPECIAL MOVE ACTIVATION
        f.state = 'special';
        f.stateTimer = 0;
        f.vx = 0;
        soundManager.playSpecial();
        this.spawnSpecialAttack(f);
        return;
      }

      // Heavy Punch
      if (inp.heavyPunch) {
        f.state = 'heavy_punch';
        f.stateTimer = 0;
        f.vx = 0;
        soundManager.playWhoosh();
        return;
      }

      if (inp.punch) {
        f.state = 'punch';
        f.stateTimer = 0;
        f.vx = 0;
        soundManager.playWhoosh();
        return;
      }

      if (inp.kick) {
        f.state = 'kick';
        f.stateTimer = 0;
        f.vx = 0;
        soundManager.playWhoosh();
        return;
      }

      // Jump
      if (inp.up && f.isGrounded) {
        f.vy = -14.5;
        f.isGrounded = false;
        f.state = 'jump';
        soundManager.playWhoosh();
      }

      // Crouch
      if (inp.down && f.isGrounded) {
        f.state = 'crouch';
        f.vx = 0;
        return;
      }
    }

    // Walking / Neutral controls
    if (f.state === 'idle' || f.state === 'walk_forward' || f.state === 'walk_backward') {
      if (inp.left) {
        f.vx = -baseSpeed;
        f.state = f.facing === 1 ? 'walk_backward' : 'walk_forward';
      } else if (inp.right) {
        f.vx = baseSpeed;
        f.state = f.facing === 1 ? 'walk_forward' : 'walk_backward';
      } else {
        f.vx = 0;
        f.state = 'idle';
      }
    }

    // Attack state durations
    if (f.state === 'punch') {
      // Hitbox active on frames 4 - 8
      if (f.stateTimer >= 4 && f.stateTimer <= 8) {
        f.currentHitbox = {
          x: f.facing === 1 ? f.x + f.width : f.x - 45,
          y: f.y + 25,
          width: 45,
          height: 35,
          damage: f.charDef.moves.light.damage,
          knockbackX: f.facing * 4,
          knockbackY: -2,
          isHeavy: false,
        };
      } else {
        f.currentHitbox = null;
      }

      if (f.stateTimer > 14) {
        f.state = 'idle';
        f.stateTimer = 0;
        f.currentHitbox = null;
      }
    } else if (f.state === 'heavy_punch') {
      // Hitbox active on frames 5 - 10
      if (f.stateTimer >= 5 && f.stateTimer <= 10) {
        f.currentHitbox = {
          x: f.facing === 1 ? f.x + f.width : f.x - 55,
          y: f.y + 20,
          width: 55,
          height: 40,
          damage: f.charDef.moves.light.damage + 7,
          knockbackX: f.facing * 7,
          knockbackY: -4,
          isHeavy: true,
        };
      } else {
        f.currentHitbox = null;
      }

      if (f.stateTimer > 20) {
        f.state = 'idle';
        f.stateTimer = 0;
        f.currentHitbox = null;
      }
    } else if (f.state === 'kick') {
      // Hitbox active on frames 5 - 11
      if (f.stateTimer >= 5 && f.stateTimer <= 11) {
        f.currentHitbox = {
          x: f.facing === 1 ? f.x + f.width : f.x - 55,
          y: f.y + 35,
          width: 55,
          height: 45,
          damage: f.charDef.moves.heavy.damage,
          knockbackX: f.facing * 7,
          knockbackY: -4,
          isHeavy: true,
        };
      } else {
        f.currentHitbox = null;
      }

      if (f.stateTimer > 20) {
        f.state = 'idle';
        f.stateTimer = 0;
        f.currentHitbox = null;
      }
    } else if (f.state === 'special') {
      // Special finishes after 26 frames
      if (f.stateTimer > 26) {
        f.state = 'idle';
        f.stateTimer = 0;
      }
    } else if (f.state === 'super') {
      // Super finishes after 48 frames
      if (f.stateTimer > 48) {
        f.state = 'idle';
        f.stateTimer = 0;
      }
    }

    this.applyGravity(f);
  }

  private spawnSpecialAttack(f: FighterState) {
    const isSuper = f.state === 'super';
    const charId = f.charDef.id;

    if (charId === 'mama_lucha') {
      // MAMÁ LUCHA'S SHOPPING CART PROJECTILE / SPEED DIVE!
      soundManager.playCarritoRattle();
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'carrito',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: GROUND_Y - 45,
        vx: f.facing * (isSuper ? 14 : 9),
        vy: 0,
        width: 58,
        height: 42,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 90,
      });
    } else if (charId === 'catrina') {
      // LA CATRINA'S CEMPASÚCHIL PROJECTILE
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'cempasuchil',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 40,
        vx: f.facing * (isSuper ? 11 : 7),
        vy: 0,
        width: 44,
        height: 44,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 100,
      });
    } else if (charId === 'catrin') {
      // EL CATRÍN'S SOMBRERO BOOMERANG
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'sombrero',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 35,
        vx: f.facing * 10,
        vy: 0,
        width: 60,
        height: 24,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 80,
        returning: false,
      });
    } else if (charId === 'taquero') {
      // TAQUERO'S FLYING PINEAPPLE
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'taco_pina',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 30,
        vx: f.facing * 8,
        vy: -2,
        width: 32,
        height: 26,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 85,
      });
    } else if (charId === 'zorro_negro') {
      // EL ZORRO NEGRO: CUTTING 'Z' BLADE WAVE!
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'espada_z',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 35,
        vx: f.facing * (isSuper ? 13 : 9),
        vy: 0,
        width: 48,
        height: 48,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 90,
      });
    } else if (charId === 'dafne') {
      // DAFNE SAYULITA: SPINNING SURFBOARD
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'surfboard',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: GROUND_Y - 35,
        vx: f.facing * (isSuper ? 11 : 8),
        vy: 0,
        width: 55,
        height: 25,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 95,
      });
    } else if (charId === 'gato_sombra') {
      // GATO SOMBRA: GREEN SHADOW SHURIKEN
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'shuriken',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 35,
        vx: f.facing * (isSuper ? 14 : 10),
        vy: 0,
        width: 36,
        height: 36,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 85,
      });
    } else if (charId === 'conde_vampiro') {
      // CONDE CILINDRO: FLYING BATS SWARM
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'murcielagos',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 25,
        vx: f.facing * (isSuper ? 12 : 8),
        vy: 0,
        width: 42,
        height: 32,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 90,
      });
    } else if (charId === 'momia_sacerdotisa') {
      // SACERDOTISA: ANUBIS SACRED FIRE
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'anubis_fire',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: f.y + 38,
        vx: f.facing * (isSuper ? 12 : 8),
        vy: 0,
        width: 44,
        height: 44,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 95,
      });
    } else if (charId === 'guardian_ancestral') {
      // GUARDIÁN ANCESTRAL: ROLLING CARVED MONOLITH
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'roca',
        x: f.facing === 1 ? f.x + f.width + 10 : f.x - 10,
        y: GROUND_Y - 40,
        vx: f.facing * (isSuper ? 9 : 6),
        vy: 0,
        width: 48,
        height: 40,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 100,
      });
    } else {
      // SANTO'S FLYING HEADBUTT DIVE
      this.projectiles.push({
        id: this.nextProjectileId++,
        owner: f.id,
        characterId: charId,
        type: 'tope',
        x: f.facing === 1 ? f.x + f.width : f.x,
        y: f.y + 45,
        vx: f.facing * 12,
        vy: 0,
        width: 52,
        height: 30,
        damage: isSuper ? f.charDef.moves.super.damage : f.charDef.moves.special.damage,
        frame: 0,
        duration: 40,
      });
    }
  }

  private applyGravity(f: FighterState) {
    f.x += f.vx;
    f.y += f.vy;

    // Apply arena wall boundaries
    if (f.x < 30) f.x = 30;
    if (f.x + f.width > CANVAS_WIDTH - 30) f.x = CANVAS_WIDTH - 30 - f.width;

    // Gravity
    if (!f.isGrounded) {
      f.vy += 0.8;
      if (f.y + f.height >= GROUND_Y) {
        f.y = GROUND_Y - f.height;
        f.vy = 0;
        f.isGrounded = true;
        if (f.state === 'jump') {
          f.state = 'idle';
        }
      }
    } else {
      f.y = GROUND_Y - f.height;
    }
  }

  private resolveFighterPushbox(p1: FighterState, p2: FighterState) {
    // Prevent overlapping through each other on ground
    const p1Center = p1.x + p1.width / 2;
    const p2Center = p2.x + p2.width / 2;
    const dist = Math.abs(p1Center - p2Center);
    const minDist = (p1.width + p2.width) * 0.45;

    if (dist < minDist && p1.isGrounded && p2.isGrounded) {
      const push = (minDist - dist) / 2;
      if (p1Center < p2Center) {
        p1.x -= push;
        p2.x += push;
      } else {
        p1.x += push;
        p2.x -= push;
      }
    }
  }

  private checkHitbox(
    attacker: FighterState,
    defender: FighterState,
    onHitCombo?: (attacker: FighterState, hits: number) => void
  ) {
    if (!attacker.currentHitbox) return;
    const hb = attacker.currentHitbox;

    // Check collision between attacker's hitbox and defender's body
    const hitX = hb.x < defender.x + defender.width && hb.x + hb.width > defender.x;
    const hitY = hb.y < defender.y + defender.height && hb.y + hb.height > defender.y;

    if (
      hitX &&
      hitY &&
      defender.state !== 'knockdown' &&
      defender.state !== 'defeat' &&
      defender.state !== 'wakeup' &&
      defender.state !== 'grabbed'
    ) {
      // Hit connected!
      attacker.currentHitbox = null; // consume hitbox so it only hits once

      const isBlocked = defender.isBlocking;
      const damage = isBlocked ? Math.max(1, Math.round(hb.damage * 0.15)) : hb.damage;

      defender.health = Math.max(0, defender.health - damage);
      defender.hitFlashTimer = 6;

      // Super meter build
      attacker.superMeter = Math.min(100, attacker.superMeter + (isBlocked ? 4 : 12));
      defender.superMeter = Math.min(100, defender.superMeter + (isBlocked ? 2 : 7));

      if (isBlocked) {
        soundManager.playBlock();
        this.particles.push(...spawnHitSparks(hb.x + hb.width / 2, hb.y + hb.height / 2, true));
        defender.vx = hb.knockbackX * 0.4;
      } else {
        if (hb.isHeavy) {
          soundManager.playKick(true);
          this.screenShake = 0.8;
          this.hitstopTimer = 6;
        } else {
          soundManager.playPunch(false);
          this.screenShake = 0.3;
          this.hitstopTimer = 3;
        }

        this.particles.push(...spawnHitSparks(hb.x + hb.width / 2, hb.y + hb.height / 2, false));

        // Combo counter
        attacker.comboCount++;
        if (onHitCombo) onHitCombo(attacker, attacker.comboCount);

        // Apply knockback
        defender.vx = hb.knockbackX;
        defender.vy = hb.knockbackY;
        if (hb.knockbackY < 0) {
          defender.isGrounded = false;
        }

        if (defender.health <= 0) {
          defender.state = 'defeat';
          defender.stateTimer = 0;
          soundManager.playKO();
        } else {
          defender.state = hb.isHeavy ? 'knockdown' : 'hit';
          defender.stateTimer = 0;
        }
      }
    }
  }

  private updateProjectiles(
    p1: FighterState,
    p2: FighterState,
    onHitCombo?: (attacker: FighterState, hits: number) => void
  ) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.frame++;

      // Sombrero Boomerang reverse flight
      if (p.type === 'sombrero') {
        if (p.frame > 35 && !p.returning) {
          p.returning = true;
          p.vx = -p.vx;
        }
      }

      // Check collision with defender
      const defender = p.owner === 1 ? p2 : p1;
      const attacker = p.owner === 1 ? p1 : p2;

      const hit =
        p.x + p.width / 2 > defender.x &&
        p.x - p.width / 2 < defender.x + defender.width &&
        p.y + p.height / 2 > defender.y &&
        p.y - p.height / 2 < defender.y + defender.height;

      if (hit && defender.state !== 'knockdown' && defender.state !== 'defeat') {
        const isBlocked = defender.isBlocking;
        const damage = isBlocked ? Math.round(p.damage * 0.2) : p.damage;

        defender.health = Math.max(0, defender.health - damage);
        defender.hitFlashTimer = 7;

        attacker.superMeter = Math.min(100, attacker.superMeter + (isBlocked ? 5 : 15));
        defender.superMeter = Math.min(100, defender.superMeter + (isBlocked ? 3 : 10));

        if (isBlocked) {
          soundManager.playBlock();
          this.particles.push(...spawnHitSparks(p.x, p.y, true));
        } else {
          soundManager.playPunch(true);
          this.screenShake = 0.9;
          this.hitstopTimer = 5;
          this.particles.push(...spawnHitSparks(p.x, p.y, false));

          attacker.comboCount++;
          if (onHitCombo) onHitCombo(attacker, attacker.comboCount);

          defender.vx = (p.vx > 0 ? 1 : -1) * 7;
          defender.vy = -3;
          defender.isGrounded = false;
          defender.state = defender.health <= 0 ? 'defeat' : 'knockdown';
          defender.stateTimer = 0;
          if (defender.health <= 0) soundManager.playKO();
        }

        this.projectiles.splice(i, 1);
        continue;
      }

      // Remove offscreen projectiles
      if (p.x < -100 || p.x > CANVAS_WIDTH + 100 || p.frame > p.duration) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;
      p.life--;

      if (p.type === 'petal') {
        // Natural fluttering sway
        p.vx = 0.5 + Math.sin(p.rotation) * 0.8;
        p.vy = 0.4 + Math.cos(p.rotation) * 0.3;

        // Wrap around arena
        if (p.x > CANVAS_WIDTH + 20) p.x = -20;
        if (p.y > GROUND_Y + 40) p.y = -10;
      } else {
        // Hit spark gravity
        p.vy += 0.25;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  }
}

// --- INTELLIGENT ARCADE CPU AI CONTROLLER ---
export function calculateCpuInput(
  cpu: FighterState,
  player: FighterState,
  projectiles: Projectile[],
  difficulty: 'facil' | 'normal' | 'bravo'
): InputState {
  const dist = Math.abs((cpu.x + cpu.width / 2) - (player.x + player.width / 2));
  const incomingProjectile = projectiles.find(p => p.owner !== cpu.id);

  const inp: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    punch: false,
    kick: false,
    special: false,
    super: false,
  };

  const isLeftOfPlayer = cpu.x < player.x;

  // React to incoming projectiles: jump over or block
  if (incomingProjectile) {
    const projDist = Math.abs(incomingProjectile.x - cpu.x);
    if (projDist < 160) {
      if (Math.random() < (difficulty === 'bravo' ? 0.9 : 0.6)) {
        inp.up = true; // jump over projectile
        return inp;
      } else {
        // Block
        if (isLeftOfPlayer) inp.left = true;
        else inp.right = true;
        return inp;
      }
    }
  }

  // Super move execution when full
  if (cpu.superMeter >= 100 && dist < 220) {
    const triggerChance = difficulty === 'bravo' ? 0.08 : difficulty === 'normal' ? 0.04 : 0.01;
    if (Math.random() < triggerChance) {
      inp.super = true;
      return inp;
    }
  }

  // Close range combat
  if (dist < 85) {
    // Player is attacking -> high chance of blocking on normal/bravo
    if (player.state === 'punch' || player.state === 'kick' || player.state === 'special') {
      const blockProb = difficulty === 'bravo' ? 0.8 : difficulty === 'normal' ? 0.5 : 0.2;
      if (Math.random() < blockProb) {
        if (isLeftOfPlayer) inp.left = true;
        else inp.right = true;
        return inp;
      }
    }

    // Offensive options in close range
    const roll = Math.random();
    if (roll < 0.12) {
      inp.punch = true;
    } else if (roll < 0.22) {
      inp.kick = true;
    } else if (roll < 0.27) {
      inp.special = true;
    } else if (roll < 0.35) {
      // Crouch poke
      inp.down = true;
      inp.kick = true;
    } else if (roll < 0.45 && difficulty !== 'facil') {
      // Back step
      if (isLeftOfPlayer) inp.left = true;
      else inp.right = true;
    }
  } else if (dist < 260) {
    // Mid range: approach or shoot special projectile
    const roll = Math.random();
    if (roll < 0.05) {
      inp.special = true; // fire special projectile (carrito, cempasúchil, etc.)
    } else if (roll < 0.6) {
      // Advance towards player
      if (isLeftOfPlayer) inp.right = true;
      else inp.left = true;
    } else if (roll < 0.7 && cpu.isGrounded) {
      // Jump in attack
      inp.up = true;
      if (isLeftOfPlayer) inp.right = true;
      else inp.left = true;
    }
  } else {
    // Far range: walk towards player
    if (isLeftOfPlayer) inp.right = true;
    else inp.left = true;

    if (Math.random() < 0.03) {
      inp.special = true; // long range projectile
    }
  }

  return inp;
}
