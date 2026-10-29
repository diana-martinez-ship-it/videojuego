import {
  BeatEmUpEnemy,
  BeatEmUpPlayer,
  FloatingText,
  HitSpark,
} from '../../types/beatemup';
import { VIEW_HEIGHT, VIEW_WIDTH } from './beatEmUpEngine';

export class BeatEmUpRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTimer: number = 0;

  // Image assets for reference & backgrounds
  private gatoRefImg: HTMLImageElement | null = null;
  private gatoRefLoaded: boolean = false;
  private muertosBgImg: HTMLImageElement | null = null;
  private muertosBgLoaded: boolean = false;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;

    // Load assets from public/assets/aistudio/
    this.gatoRefImg = new Image();
    this.gatoRefImg.src = '/assets/aistudio/image_04cb1ac2.png';
    this.gatoRefImg.onload = () => {
      this.gatoRefLoaded = true;
    };

    this.muertosBgImg = new Image();
    this.muertosBgImg.src = '/assets/aistudio/image_a1cbb0ba.png';
    this.muertosBgImg.onload = () => {
      this.muertosBgLoaded = true;
    };
  }

  public render(
    player: BeatEmUpPlayer,
    enemies: BeatEmUpEnemy[],
    floatingTexts: FloatingText[],
    hitSparks: HitSpark[],
    cameraX: number,
    screenShake: number,
    isWaveLocked: boolean,
    stageCleared: boolean
  ) {
    const ctx = this.ctx;
    this.animTimer += 0.04;

    ctx.save();

    // 1. Screen Shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 9;
      const shakeY = (Math.random() - 0.5) * screenShake * 9;
      ctx.translate(shakeX, shakeY);
    }

    // 2. Parallax Multi-layer Background
    this.renderParallaxBackground(ctx, cameraX);

    // 3. Render Ground Decals & Street Lights
    this.renderStreetPlayfield(ctx, cameraX);

    // 4. Sort Entities by Ground Y (Depth Sorting: Entities further back drawn first)
    type RenderableEntity =
      | { kind: 'player'; entity: BeatEmUpPlayer; y: number }
      | { kind: 'enemy'; entity: BeatEmUpEnemy; y: number };

    const entities: RenderableEntity[] = [
      { kind: 'player', entity: player, y: player.y },
      ...enemies.map(e => ({ kind: 'enemy' as const, entity: e, y: e.y })),
    ];

    entities.sort((a, b) => a.y - b.y);

    // 5. Draw Shadows for all entities first
    for (const item of entities) {
      if (item.kind === 'player') {
        this.renderShadow(ctx, item.entity.x - cameraX, item.entity.y, item.entity.z, 28, 12);
      } else {
        const baseSize = item.entity.type === 'maton_aurrera' ? 34 : 26;
        this.renderShadow(ctx, item.entity.x - cameraX, item.entity.y, item.entity.z, baseSize, 11);
      }
    }

    // 6. Draw Characters in Depth Order
    for (const item of entities) {
      if (item.kind === 'player') {
        this.renderPlayer(ctx, item.entity, cameraX);
      } else {
        this.renderEnemy(ctx, item.entity, cameraX);
      }
    }

    // 7. Juicy Impact Sparks & Particles
    this.renderHitSparks(ctx, hitSparks, cameraX);

    // 8. Floating Damage & Combo Text
    this.renderFloatingTexts(ctx, floatingTexts, cameraX);

    // 9. Foreground Layer (Cables, floating petals)
    this.renderForegroundLayer(ctx, cameraX);

    // 10. Wave "GO ▶▶" Navigation Prompt
    if (!isWaveLocked && !stageCleared && player.x < 3300) {
      this.renderGoPrompt(ctx);
    }

    ctx.restore();
  }

  // --- PARALLAX SCROLLING MULTI-LAYER BARRIO ---
  private renderParallaxBackground(ctx: CanvasRenderingContext2D, cameraX: number) {
    // Layer 0: Twilight Night Sky & Glowing Full Moon (cameraX * 0.08)
    const skyOffset = (cameraX * 0.08) % VIEW_WIDTH;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
    skyGrad.addColorStop(0, '#070a1a');
    skyGrad.addColorStop(0.5, '#1e1b4b');
    skyGrad.addColorStop(0.85, '#431407');
    skyGrad.addColorStop(1, '#9a3412');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIEW_WIDTH, 320);

    // Full Moon with crater detailing & golden cempasúchil glow
    const moonX = 720 - skyOffset * 0.3;
    const moonY = 85;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 70);
    moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    moonGlow.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 35; i++) {
      const sx = ((i * 67 + skyOffset * 0.5) % VIEW_WIDTH);
      const sy = (i * 29) % 180;
      const twinkle = Math.sin(this.animTimer * 4 + i) * 0.5 + 0.5;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Layer 1: Distant Colonial Silhouettes, Cathedrals & Water Tanks (cameraX * 0.22)
    const layer1Offset = (cameraX * 0.22) % 400;
    ctx.fillStyle = '#171226';
    for (let bx = -400; bx < VIEW_WIDTH + 400; bx += 380) {
      const rx = bx - layer1Offset;
      // Cathedral Tower
      ctx.fillRect(rx + 40, 110, 45, 160);
      ctx.beginPath();
      ctx.moveTo(rx + 35, 110);
      ctx.lineTo(rx + 62, 60);
      ctx.lineTo(rx + 90, 110);
      ctx.fill();
      // Cross on tower
      ctx.fillRect(rx + 60, 45, 5, 20);
      ctx.fillRect(rx + 54, 52, 17, 4);

      // Water Tank (Tinaco Rotoplas) on roof
      ctx.fillRect(rx + 160, 140, 60, 130);
      ctx.beginPath();
      ctx.arc(rx + 190, 132, 12, 0, Math.PI * 2);
      ctx.fill();

      // Rooftops
      ctx.fillRect(rx + 240, 125, 90, 145);
      ctx.fillRect(rx + 340, 150, 70, 120);
    }

    // Layer 2: Barrio Street Facades & Neon Signs (cameraX * 0.55)
    const layer2Offset = (cameraX * 0.55) % 800;
    ctx.fillStyle = '#261a22';
    for (let bx = -800; bx < VIEW_WIDTH + 800; bx += 800) {
      const rx = bx - layer2Offset;

      // Building 1: Taquería "EL PASTOR ASESINO"
      ctx.fillStyle = '#2e1c24';
      ctx.fillRect(rx + 20, 150, 220, 160);
      // Striped Awning
      for (let s = 0; s < 10; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#ef4444' : '#facc15';
        ctx.fillRect(rx + 20 + s * 22, 210, 22, 18);
      }
      // Glowing Neon Taco Sign
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.font = '900 11px monospace';
      ctx.fillText('🌮 TACOS AL PASTOR', rx + 35, 185);
      ctx.shadowBlur = 0;

      // Building 2: Arena Lucha Libre
      ctx.fillStyle = '#1e1b2e';
      ctx.fillRect(rx + 270, 130, 240, 180);
      // Arena Marquee
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.font = '900 12px "Press Start 2P", monospace';
      ctx.fillText('ARENA BARRIO', rx + 285, 165);
      ctx.shadowBlur = 0;

      // Lucha Posters on wall
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(rx + 290, 215, 30, 45);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(rx + 335, 215, 30, 45);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(rx + 380, 215, 30, 45);

      // Building 3: Bodega Aurrera Neon
      ctx.fillStyle = '#18241b';
      ctx.fillRect(rx + 540, 140, 220, 170);
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.font = '900 12px monospace';
      ctx.fillText('⚡ BODEGA AURRERA', rx + 555, 175);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#facc15';
      ctx.font = '700 9px monospace';
      ctx.fillText('¡MAMÁ LUCHA TE DEFIENDE!', rx + 560, 195);
    }
  }

  // --- PLAYFIELD STREET ASPHALT & SIDEWALK ---
  private renderStreetPlayfield(ctx: CanvasRenderingContext2D, cameraX: number) {
    const playfieldY = 300;
    const playfieldHeight = VIEW_HEIGHT - playfieldY;

    // Sidewalk Curb (Upper edge)
    ctx.fillStyle = '#44403c';
    ctx.fillRect(0, playfieldY - 14, VIEW_WIDTH, 14);

    // Hazard Stripes on curb
    const curbOffset = cameraX % 40;
    for (let cx = -40; cx < VIEW_WIDTH + 40; cx += 40) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - curbOffset, playfieldY - 14, 20, 14);
    }

    // Asphalt Road with depth gradient
    const roadGrad = ctx.createLinearGradient(0, playfieldY, 0, VIEW_HEIGHT);
    roadGrad.addColorStop(0, '#1c1917');
    roadGrad.addColorStop(0.5, '#292524');
    roadGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, playfieldY, VIEW_WIDTH, playfieldHeight);

    // Street cracks and sewer manholes
    const roadOffset = cameraX % 600;
    for (let rx = -600; rx < VIEW_WIDTH + 600; rx += 600) {
      const mx = rx - roadOffset;
      // Sewer Manhole
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(mx + 250, 410, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pedestrian Zebra Stripes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let z = 0; z < 5; z++) {
        ctx.fillRect(mx + 450 + z * 24, 340, 14, 90);
      }
    }

    // Street Lampposts with Glowing Light Cones
    const lampOffset = cameraX % 500;
    for (let lx = -500; lx < VIEW_WIDTH + 500; lx += 500) {
      const lampX = lx - lampOffset + 120;
      const lampBaseY = playfieldY - 10;

      // Wrought Iron Pole
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(lampX - 3, lampBaseY - 110, 6, 110);
      ctx.fillRect(lampX - 10, lampBaseY - 115, 20, 6);

      // Glass Lantern
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lampX - 8, lampBaseY - 125, 16, 12);

      // Translucent Golden Light Cone on asphalt
      const coneGrad = ctx.createRadialGradient(lampX, lampBaseY + 60, 10, lampX, lampBaseY + 60, 95);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
      coneGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.ellipse(lampX, lampBaseY + 60, 95, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- DYNAMIC PSEUDO-3D ELLIPTICAL SHADOW ---
  private renderShadow(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    groundY: number,
    elevationZ: number,
    baseRadiusX: number,
    baseRadiusY: number
  ) {
    // Height factor: shadow shrinks and fades as character jumps higher
    const heightFactor = Math.max(0.35, 1 - elevationZ / 140);
    const radX = baseRadiusX * heightFactor;
    const radY = baseRadiusY * heightFactor;
    const alpha = 0.45 * Math.max(0.2, 1 - elevationZ / 170);

    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(screenX, groundY, radX, radY, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- PLAYER: GATO SOMBRA (ARMORED FELINE SAMURAI) ---
  private renderPlayer(ctx: CanvasRenderingContext2D, p: BeatEmUpPlayer, cameraX: number) {
    ctx.save();
    const screenX = p.x - cameraX;
    const screenY = p.y - p.z; // Elevate by jump Z!

    ctx.translate(screenX, screenY);
    ctx.scale(p.facing, 1);

    const isFlashing = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 3) % 2 === 0;

    // Palette authentic to image_04cb1ac2.png
    const black = isFlashing ? '#ffffff' : '#0a0a0a';
    const darkArmor = isFlashing ? '#ffffff' : '#991b1b';
    const crimsonRed = isFlashing ? '#ffffff' : '#dc2626';
    const neonGreen = isFlashing ? '#ffffff' : '#22c55e';
    const goldTrim = isFlashing ? '#ffffff' : '#facc15';

    const bob = p.action === 'walk' ? Math.sin(this.animTimer * 14) * 4 : Math.sin(this.animTimer * 5) * 2;

    // Swishing Cat Tail (behind)
    ctx.strokeStyle = black;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-10, -35 + bob);
    ctx.quadraticCurveTo(-34 - Math.sin(this.animTimer * 8) * 8, -50, -22, -65);
    ctx.stroke();

    // Fluttering Crimson Ninja Cape
    ctx.fillStyle = crimsonRed;
    ctx.beginPath();
    ctx.moveTo(-8, -65 + bob);
    if (p.action === 'special') {
      // 360 cape flare
      ctx.lineTo(-45, -25);
      ctx.lineTo(45, -25);
      ctx.lineTo(15, -60);
    } else if (p.action === 'jump' || p.action === 'jump_attack') {
      // Cape flies upwards
      ctx.lineTo(-40, -85);
      ctx.lineTo(-30, -35);
    } else {
      ctx.quadraticCurveTo(-45 - Math.sin(this.animTimer * 9) * 10, -45, -28, -12);
      ctx.lineTo(-6, -38 + bob);
    }
    ctx.closePath();
    ctx.fill();

    // Legs & Greaves
    ctx.fillStyle = black;
    if (p.action === 'jump_attack') {
      // Flying kick stance
      ctx.fillRect(-12, -32, 10, 32);
      ctx.fillRect(2, -45, 38, 14);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(18, -47, 24, 16);
    } else if (p.action === 'attack3') {
      // Roundhouse kick
      ctx.fillRect(-12, -35, 11, 35);
      ctx.fillRect(2, -48, 36, 14);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(16, -50, 24, 16);
    } else {
      // Running / Stance
      const legSpread = p.action === 'walk' ? Math.sin(this.animTimer * 14) * 8 : 0;
      ctx.fillRect(-14 - legSpread, -28, 10, 28);
      ctx.fillRect(2 + legSpread, -28, 10, 28);
      // Red Armor Greaves on shins
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(-14 - legSpread, -20, 10, 14);
      ctx.fillRect(2 + legSpread, -20, 10, 14);
      ctx.fillStyle = goldTrim;
      ctx.fillRect(-14 - legSpread, -21, 10, 2);
      ctx.fillRect(2 + legSpread, -21, 10, 2);
    }

    // Torso with Segmented Crimson Armor Plates
    ctx.fillStyle = black;
    ctx.fillRect(-14, -68 + bob, 28, 38);

    // Segmented Samurai Plates (3 horizontal tier plates as in image_04cb1ac2)
    ctx.fillStyle = crimsonRed;
    ctx.fillRect(-16, -66 + bob, 32, 10);
    ctx.fillRect(-14, -54 + bob, 28, 9);
    ctx.fillRect(-12, -43 + bob, 24, 8);
    // Darker plate shade lines
    ctx.fillStyle = darkArmor;
    ctx.fillRect(-16, -57 + bob, 32, 2);
    ctx.fillRect(-14, -46 + bob, 28, 2);

    // Arms & Attacks
    ctx.fillStyle = black;
    if (p.action === 'attack1') {
      // Jab
      ctx.fillRect(4, -64 + bob, 36, 10);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(26, -66 + bob, 14, 13);
      // Green Claw Spark
      ctx.fillStyle = neonGreen;
      ctx.fillRect(38, -68 + bob, 4, 16);
    } else if (p.action === 'attack2') {
      // Cross
      ctx.fillRect(6, -62 + bob, 42, 11);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(32, -64 + bob, 16, 14);
      // Slash arc
      ctx.strokeStyle = neonGreen;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(36, -58 + bob, 16, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else if (p.action === 'attack4') {
      // Finisher Uppercut
      ctx.fillRect(4, -75 + bob, 12, 38);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(3, -88 + bob, 15, 16);
      // Fiery Dragon Trail
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(2, -100 + bob, 18, 14);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(5, -108 + bob, 12, 10);
    } else if (p.action === 'special') {
      // Special Spin dual claws
      ctx.fillRect(-28, -62 + bob, 56, 10);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(-32, -64 + bob, 12, 14);
      ctx.fillRect(20, -64 + bob, 12, 14);
      // Radial Green Ring
      ctx.strokeStyle = neonGreen;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -56 + bob, 38, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Idle / Walk Arms
      ctx.fillRect(-15, -62 + bob, 8, 20);
      ctx.fillRect(6, -62 + bob, 8, 20);
      ctx.fillStyle = crimsonRed;
      ctx.fillRect(-16, -50 + bob, 9, 10);
      ctx.fillRect(5, -50 + bob, 9, 10);
    }

    // Feline Head (Black Cat with Pointed Ears)
    ctx.fillStyle = black;
    ctx.beginPath();
    // Head Dome
    ctx.arc(0, -78 + bob, 14, 0, Math.PI * 2);
    ctx.fill();

    // Sharp Pointed Cat Ears
    ctx.beginPath();
    ctx.moveTo(-12, -82 + bob);
    ctx.lineTo(-16, -102 + bob);
    ctx.lineTo(-4, -88 + bob);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(4, -88 + bob);
    ctx.lineTo(16, -102 + bob);
    ctx.lineTo(12, -82 + bob);
    ctx.closePath();
    ctx.fill();

    // Inner Ears
    ctx.fillStyle = darkArmor;
    ctx.fillRect(-12, -94 + bob, 4, 8);
    ctx.fillRect(8, -94 + bob, 4, 8);

    // Segmented Neon Green Matrix Eyes (From image_04cb1ac2)
    ctx.fillStyle = neonGreen;
    ctx.shadowColor = neonGreen;
    ctx.shadowBlur = 8;
    // Left eye pixel block
    ctx.fillRect(-8, -82 + bob, 6, 5);
    // Right eye pixel block
    ctx.fillRect(3, -82 + bob, 6, 5);
    ctx.shadowBlur = 0;

    // Grinning White Teeth Grille
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -73 + bob, 12, 4);
    ctx.fillStyle = black;
    ctx.fillRect(-4, -73 + bob, 1, 4);
    ctx.fillRect(-1, -73 + bob, 1, 4);
    ctx.fillRect(2, -73 + bob, 1, 4);

    // Whiskers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-9, -74 + bob);
    ctx.lineTo(-18, -76 + bob);
    ctx.moveTo(9, -74 + bob);
    ctx.lineTo(18, -76 + bob);
    ctx.stroke();

    ctx.restore();
  }

  // --- ENEMIES (STREET PUNK, LUCHA RUDO, GATO PUNK, MATÓN AURRERA) ---
  private renderEnemy(ctx: CanvasRenderingContext2D, e: BeatEmUpEnemy, cameraX: number) {
    ctx.save();
    const screenX = e.x - cameraX;
    const screenY = e.y - e.z;

    ctx.translate(screenX, screenY);
    ctx.scale(e.facing, 1);

    const isHit = e.action === 'hit';
    const isKnock = e.action === 'knockdown';
    const isFlashing = e.invulnerableTimer > 0 && Math.floor(e.invulnerableTimer / 2) % 2 === 0;

    if (isKnock) {
      // Knocked back on floor
      ctx.rotate(-Math.PI * 0.42);
    } else if (isHit) {
      // Flinch
      ctx.rotate(-0.15);
    }

    const bob = e.action === 'approach' ? Math.sin(this.animTimer * 12 + e.id) * 3 : 0;

    // Windup Warning Glow
    if (e.action === 'windup') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -95, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8px monospace';
      ctx.fillText('!', -2, -92);
    }

    if (e.type === 'maton_aurrera') {
      // MINI BOSS: Big Aurrera Security Enforcer with green vest & baton
      const green = isFlashing ? '#ffffff' : '#15803d';
      const yellow = isFlashing ? '#ffffff' : '#facc15';
      const skin = isFlashing ? '#ffffff' : '#b45309';

      // Thick Legs
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-18, -32, 14, 32);
      ctx.fillRect(4, -32, 14, 32);

      // Heavy Torso with Green Aurrera Vest
      ctx.fillStyle = green;
      ctx.fillRect(-22, -74 + bob, 44, 44);
      ctx.fillStyle = yellow;
      ctx.fillRect(-22, -56 + bob, 44, 6); // Yellow reflector stripe

      // Arms & Riot Baton
      ctx.fillStyle = skin;
      if (e.action === 'attack') {
        ctx.fillRect(6, -68 + bob, 38, 12);
        // Heavy Baton
        ctx.fillStyle = '#404040';
        ctx.fillRect(34, -85 + bob, 8, 36);
      } else {
        ctx.fillRect(-24, -68 + bob, 10, 26);
        ctx.fillRect(14, -68 + bob, 10, 26);
        ctx.fillStyle = '#404040';
        ctx.fillRect(16, -55 + bob, 6, 26);
      }

      // Head & Sunglasses
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, -84 + bob, 16, 0, Math.PI * 2);
      ctx.fill();
      // Black Sunglasses
      ctx.fillStyle = '#000000';
      ctx.fillRect(-8, -88 + bob, 18, 6);
      // Security Cap
      ctx.fillStyle = green;
      ctx.fillRect(-14, -98 + bob, 28, 8);
      ctx.fillRect(-8, -94 + bob, 26, 4); // Visor
    } else if (e.type === 'rudo') {
      // LUCHA RUDO: Heavy brawler with spiked vest & orange mask
      const orange = isFlashing ? '#ffffff' : '#ea580c';
      const skin = isFlashing ? '#ffffff' : '#d97706';

      // Legs
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-15, -30, 12, 30);
      ctx.fillRect(3, -30, 12, 30);

      // Muscular Torso with Studded Vest
      ctx.fillStyle = skin;
      ctx.fillRect(-18, -70 + bob, 36, 40);
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-20, -70 + bob, 8, 38);
      ctx.fillRect(12, -70 + bob, 8, 38);

      // Arms
      ctx.fillStyle = skin;
      if (e.action === 'attack') {
        ctx.fillRect(4, -65 + bob, 34, 12);
      } else {
        ctx.fillRect(-20, -65 + bob, 8, 22);
        ctx.fillRect(12, -65 + bob, 8, 22);
      }

      // Horned Lucha Mask
      ctx.fillStyle = orange;
      ctx.beginPath();
      ctx.arc(0, -80 + bob, 14, 0, Math.PI * 2);
      ctx.fill();
      // Mask Horns
      ctx.beginPath();
      ctx.moveTo(-10, -88 + bob);
      ctx.lineTo(-14, -100 + bob);
      ctx.lineTo(-4, -90 + bob);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -88 + bob);
      ctx.lineTo(14, -100 + bob);
      ctx.lineTo(4, -90 + bob);
      ctx.fill();
    } else {
      // CHOLO / GATO PUNK: Agile street punk with switchblade / claws
      const punkColor = isFlashing ? '#ffffff' : e.colorTheme;
      const skin = isFlashing ? '#ffffff' : '#f59e0b';

      // Baggy Jeans
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-12, -28, 10, 28);
      ctx.fillRect(2, -28, 10, 28);

      // White Tank Top
      ctx.fillStyle = punkColor;
      ctx.fillRect(-14, -64 + bob, 28, 36);

      // Arms & Knife
      ctx.fillStyle = skin;
      if (e.action === 'attack') {
        ctx.fillRect(2, -60 + bob, 34, 8);
        ctx.fillStyle = '#e2e8f0'; // Blade
        ctx.fillRect(32, -61 + bob, 16, 4);
      } else {
        ctx.fillRect(-16, -60 + bob, 8, 20);
        ctx.fillRect(8, -60 + bob, 8, 20);
      }

      // Head with Bandana
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, -74 + bob, 12, 0, Math.PI * 2);
      ctx.fill();
      // Bandana
      ctx.fillStyle = punkColor;
      ctx.fillRect(-12, -82 + bob, 24, 6);
    }

    ctx.restore();
  }

  // --- JUICY HIT SPARKS & BURSTS ---
  private renderHitSparks(ctx: CanvasRenderingContext2D, hitSparks: HitSpark[], cameraX: number) {
    for (const sp of hitSparks) {
      const sx = sp.x - cameraX;
      const sy = sp.y - sp.z;

      const alpha = sp.life / sp.maxLife;
      ctx.save();
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = alpha;

      if (sp.type === 'star') {
        // Comic 4-Point Star Burst
        ctx.translate(sx, sy);
        ctx.rotate(this.animTimer * 10);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(Math.cos((i * Math.PI) / 2) * sp.size, Math.sin((i * Math.PI) / 2) * sp.size);
          ctx.lineTo(
            Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (sp.size * 0.35),
            Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (sp.size * 0.35)
          );
        }
        ctx.closePath();
        ctx.fill();
      } else if (sp.type === 'dust') {
        // Ground Dust Puff
        ctx.beginPath();
        ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Electric Neon Spark
        ctx.fillRect(sx - sp.size / 2, sy - sp.size / 2, sp.size, sp.size);
      }

      ctx.restore();
    }
  }

  // --- FLOATING DAMAGE & COMBO TEXT ---
  private renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[], cameraX: number) {
    for (const ft of texts) {
      const sx = ft.x - cameraX;
      const sy = ft.y - ft.z;
      const alpha = Math.min(1, ft.life / 20);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${Math.floor(13 * ft.scale)}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';

      // Thick black shadow outline
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, sx + 2, sy + 2);
      ctx.fillText(ft.text, sx - 2, sy - 2);

      // Glowing text
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, sx, sy);

      ctx.restore();
    }
  }

  // --- FOREGROUND (Swaying Cables & Cempasúchil Petals) ---
  private renderForegroundLayer(ctx: CanvasRenderingContext2D, cameraX: number) {
    // Overhead electrical cables
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(VIEW_WIDTH / 2, 75, VIEW_WIDTH, 35);
    ctx.stroke();

    // Floating Cempasúchil Petals
    for (let i = 0; i < 16; i++) {
      const px = ((i * 73 - cameraX * 1.25) % (VIEW_WIDTH + 100)) - 50;
      const py = (i * 37 + Math.sin(this.animTimer * 3 + i) * 20) % (VIEW_HEIGHT - 60);

      ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#ea580c';
      ctx.beginPath();
      ctx.ellipse(px, py, 6, 4, this.animTimer + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- "GO ▶▶" RETRO ARCADE NAVIGATION PROMPT ---
  private renderGoPrompt(ctx: CanvasRenderingContext2D) {
    const pulse = Math.floor(this.animTimer * 4) % 2 === 0;
    if (pulse) {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 24px "Press Start 2P", monospace';
      ctx.textAlign = 'right';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.fillText('GO ▶▶', VIEW_WIDTH - 45, 120);
      ctx.restore();
    }
  }
}
