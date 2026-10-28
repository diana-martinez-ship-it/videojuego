import { CharacterDef, FighterState, Particle, Projectile, StageDef } from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 960;
  private height: number = 540;
  private muertosBgImg: HTMLImageElement | null = null;
  private muertosBgLoaded: boolean = false;
  private sayulitaBgImg: HTMLImageElement | null = null;
  private sayulitaBgLoaded: boolean = false;
  private anubisBgImg: HTMLImageElement | null = null;
  private anubisBgLoaded: boolean = false;

  // Background animation counters
  private animTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;

    // Load reference images
    this.muertosBgImg = new Image();
    this.muertosBgImg.src = '/assets/aistudio/image_a1cbb0ba.png';
    this.muertosBgImg.onload = () => {
      this.muertosBgLoaded = true;
    };

    this.sayulitaBgImg = new Image();
    this.sayulitaBgImg.src = '/assets/aistudio/image_5eba59d0.png';
    this.sayulitaBgImg.onload = () => {
      this.sayulitaBgLoaded = true;
    };

    this.anubisBgImg = new Image();
    this.anubisBgImg.src = '/assets/aistudio/image_754e64a5.png';
    this.anubisBgImg.onload = () => {
      this.anubisBgLoaded = true;
    };
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  public render(
    stage: StageDef,
    p1: FighterState,
    p2: FighterState,
    projectiles: Projectile[],
    particles: Particle[],
    screenShake: number,
    superFreeze: boolean,
    superChar: CharacterDef | null,
    mamaLuchaIntroProgress: number = 0 // 0 to 1 for intro swoop
  ) {
    const ctx = this.ctx;
    this.animTimer += 0.03;

    ctx.save();

    // Screen Shake offset
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 12;
      const shakeY = (Math.random() - 0.5) * screenShake * 12;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Render Stage Background
    if (stage.id === 'muertos') {
      this.renderMuertosStage(ctx);
    } else if (stage.id === 'aurrera') {
      this.renderAurreraStage(ctx, mamaLuchaIntroProgress);
    } else if (stage.id === 'sayulita') {
      this.renderSayulitaStage(ctx);
    } else if (stage.id === 'anubis_temple') {
      this.renderAnubisStage(ctx);
    } else {
      this.renderMercadoStage(ctx);
    }

    // 2. Render Projectiles
    this.renderProjectiles(ctx, projectiles);

    // 3. Render Fighters Shadows
    this.renderShadow(ctx, p1);
    this.renderShadow(ctx, p2);

    // 4. Render Fighters
    this.renderFighter(ctx, p1);
    this.renderFighter(ctx, p2);

    // 5. Render Particles (Cempasúchil petals, sparks, dust)
    this.renderParticles(ctx, particles);

    // 6. Super Move Screen Darkening / Freeze Effect
    if (superFreeze && superChar) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, this.width, this.height);

      // Super Kanji / Banner flash across screen
      ctx.fillStyle = superChar.accentColor;
      ctx.font = '900 32px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = superChar.themeColor;
      ctx.shadowBlur = 20;
      ctx.fillText(superChar.moves.super.name, this.width / 2, this.height * 0.35);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // --- STAGE: DÍA DE MUERTOS PLAZA ---
  private renderMuertosStage(ctx: CanvasRenderingContext2D) {
    if (this.muertosBgLoaded && this.muertosBgImg) {
      // Draw reference pixel art background with subtle ambient lighting
      ctx.drawImage(this.muertosBgImg, 0, 0, this.width, this.height);

      // Animated glowing candle lights on the ofrenda
      const candlePositions = [
        { x: this.width * 0.44, y: this.height * 0.60 },
        { x: this.width * 0.48, y: this.height * 0.58 },
        { x: this.width * 0.52, y: this.height * 0.62 },
        { x: this.width * 0.37, y: this.height * 0.64 },
        { x: this.width * 0.58, y: this.height * 0.65 },
        { x: this.width * 0.08, y: this.height * 0.56 }, // lantern
        { x: this.width * 0.94, y: this.height * 0.57 }, // pillar candle
      ];

      candlePositions.forEach((cp, idx) => {
        const flicker = Math.sin(this.animTimer * 5 + idx * 2.3) * 0.2 + 0.8;
        const rad = 14 * flicker;
        const grad = ctx.createRadialGradient(cp.x, cp.y, 2, cp.x, cp.y, rad);
        grad.addColorStop(0, 'rgba(255, 220, 100, 0.5)');
        grad.addColorStop(1, 'rgba(255, 120, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle atmospheric blue-purple vignette
      const vig = ctx.createLinearGradient(0, 0, 0, this.height);
      vig.addColorStop(0, 'rgba(40, 20, 70, 0.15)');
      vig.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(20, 10, 0, 0.25)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      // Fallback procedural night plaza
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  // --- STAGE: BODEGA AURRERA ---
  private renderAurreraStage(ctx: CanvasRenderingContext2D, mamaLuchaIntro: number) {
    const w = this.width;
    const h = this.height;

    // Supermarket ceiling & lights
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, w, h);

    // Ceiling trusses (industrial beams)
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 4;
    for (let x = 0; x < w; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 60, 60);
      ctx.lineTo(x + 120, 0);
      ctx.stroke();
    }

    // Fluorescent shop lights (glowing white rectangles)
    for (let x = 80; x < w; x += 220) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 15;
      ctx.fillRect(x, 18, 120, 10);
      ctx.shadowBlur = 0;
    }

    // Upper Wall - Iconic Bodega Aurrera Green Banner
    ctx.fillStyle = '#15803d'; // Aurrera green
    ctx.fillRect(0, 60, w, 70);

    // Yellow stripe
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 130, w, 12);

    // "BODEGA AURRERA" Text & Precios Bajos
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Rubik Mono One", "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BODEGA AURRERA', w * 0.5, 102);

    ctx.fillStyle = '#facc15';
    ctx.font = '700 11px "Press Start 2P", monospace';
    ctx.fillText('★ LA CAMPEONA DE LOS PRECIOS BAJOS ★', w * 0.5, 124);

    // Papel picado garlands strung across supermarket ceiling
    this.drawPapelPicadoRow(ctx, 45, w);

    // Supermarket Shelves (Aisles) in background
    const floorY = h * 0.72;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 142, w, floorY - 142);

    // Draw Aisle Shelves
    const shelfWidth = 140;
    for (let sx = 20; sx < w; sx += shelfWidth + 40) {
      // Shelf frame
      ctx.fillStyle = '#bbf7d0'; // soft green frame
      ctx.fillRect(sx, 160, shelfWidth, floorY - 160);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(sx, 155, shelfWidth, 8);

      // Aisle sign hanging: "Pasillo 4", "Oferta", etc.
      ctx.fillStyle = '#facc15';
      ctx.fillRect(sx + shelfWidth * 0.2, 142, shelfWidth * 0.6, 16);
      ctx.fillStyle = '#000000';
      ctx.font = '700 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PASILLO $' + ((sx % 5) + 1), sx + shelfWidth * 0.5, 153);

      // Rows of grocery items on shelves
      for (let sy = 175; sy < floorY - 30; sy += 38) {
        ctx.fillStyle = '#4b5563'; // metal shelf
        ctx.fillRect(sx + 5, sy + 25, shelfWidth - 10, 4);

        // Boxes & Cans: Frijoles, Jabón Zote, Maseca, Choco Milk
        const colors = ['#dc2626', '#f97316', '#22c55e', '#3b82f6', '#ec4899', '#eab308'];
        for (let ix = 0; ix < 5; ix++) {
          const itemColor = colors[(ix + sx) % colors.length];
          ctx.fillStyle = itemColor;
          ctx.fillRect(sx + 10 + ix * 24, sy + 6, 18, 19);

          // Little label line
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx + 12 + ix * 24, sy + 12, 14, 4);
        }

        // Yellow price tag on shelf edge
        ctx.fillStyle = '#facc15';
        ctx.fillRect(sx + 20, sy + 26, 26, 9);
        ctx.fillStyle = '#000000';
        ctx.font = '700 7px monospace';
        ctx.fillText('$18', sx + 33, sy + 33);
      }
    }

    // Día de Muertos Altar at the Supermarket Cashier
    this.drawSupermarketOfrenda(ctx, w * 0.48, floorY);

    // Floor: polished supermarket white tiles with yellow border
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(0, floorY, w, h - floorY);

    // Tile grid lines
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    for (let ty = floorY; ty < h; ty += 28) {
      ctx.beginPath();
      ctx.moveTo(0, ty);
      ctx.lineTo(w, ty);
      ctx.stroke();
    }
    for (let tx = 0; tx < w; tx += 48) {
      ctx.beginPath();
      ctx.moveTo(tx, floorY);
      ctx.lineTo(tx, h);
      ctx.stroke();
    }

    // Scattered cempasúchil petals on the supermarket floor
    this.drawFloorPetals(ctx, floorY, w, h, 24);

    // MAMÁ LUCHA HEROIC FLYBY / ALWAYS OPENS MAMÁ LUCHA!
    this.renderMamaLuchaHeroicPresence(ctx, w, h, mamaLuchaIntro);
  }

  // --- STAGE: MERCADO DE ABASTOS ---
  private renderMercadoStage(ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = this.height;

    // Market warehouse background (warm terracotta and brick)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, w, h);

    // Brick wall pattern
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    for (let by = 0; by < h * 0.6; by += 20) {
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(w, by);
      ctx.stroke();
    }

    // Market ceiling beams & corrugated metal roof
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, w, 55);

    // Grand market banner: "MERCADO DE ABASTOS"
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(w * 0.25, 45, w * 0.5, 36);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.25, 45, w * 0.5, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px "Rubik Mono One", "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MERCADO DE ABASTOS', w * 0.5, 70);

    // Multiple rows of Papel Picado
    this.drawPapelPicadoRow(ctx, 35, w);
    this.drawPapelPicadoRow(ctx, 88, w);

    // Hanging Mexican 7-pointed star Piñatas swinging
    this.drawPinata(ctx, w * 0.15, 110, '#ec4899', '#facc15', Math.sin(this.animTimer * 1.5) * 0.08);
    this.drawPinata(ctx, w * 0.85, 110, '#06b6d4', '#f97316', Math.cos(this.animTimer * 1.5) * 0.08);

    const floorY = h * 0.72;

    // Market Stalls with striped Mexican awnings
    const stallWidth = 220;
    const stallPositions = [w * 0.05, w * 0.38, w * 0.72];
    const stallThemes = [
      { name: 'FRUTERÍA "LA BENDICIÓN"', awning: ['#dc2626', '#ffffff'] },
      { name: 'OFRENDA Y CEMPASÚCHIL', awning: ['#ea580c', '#facc15'] },
      { name: 'TACOS & CARNITAS', awning: ['#16a34a', '#ffffff'] },
    ];

    stallPositions.forEach((pos, idx) => {
      const theme = stallThemes[idx];
      // Striped awning
      const numStripes = 8;
      const stripeW = stallWidth / numStripes;
      for (let s = 0; s < numStripes; s++) {
        ctx.fillStyle = theme.awning[s % 2];
        ctx.beginPath();
        ctx.moveTo(pos + s * stripeW, 130);
        ctx.lineTo(pos + (s + 1) * stripeW, 130);
        ctx.lineTo(pos + (s + 1) * stripeW - 10, 168);
        ctx.lineTo(pos + s * stripeW - 10, 168);
        ctx.closePath();
        ctx.fill();
      }

      // Stall sign
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(pos, 168, stallWidth - 10, 20);
      ctx.fillStyle = '#fef08a';
      ctx.font = '700 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(theme.name, pos + (stallWidth - 10) / 2, 182);

      // Wooden display table
      ctx.fillStyle = '#b45309';
      ctx.fillRect(pos, 188, stallWidth - 10, floorY - 188);

      // Wooden crates (guacales) with produce
      if (idx === 0) {
        // Avocados & Tomatoes
        this.drawGuacal(ctx, pos + 10, floorY - 70, 70, 40, '#15803d', 'AGUACATE HASS');
        this.drawGuacal(ctx, pos + 90, floorY - 70, 70, 40, '#dc2626', 'JITOMATE');
      } else if (idx === 1) {
        // Altar de Muertos inside Mercado
        this.drawMarketAltar(ctx, pos + 15, floorY);
      } else {
        // Taquería trompo de pastor & comal
        this.drawTrompo(ctx, pos + 40, floorY - 80);
      }
    });

    // Floor: Cobblestone market floor with cempasúchil petals
    ctx.fillStyle = '#57534e';
    ctx.fillRect(0, floorY, w, h - floorY);

    // Cobblestone stones
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.5;
    for (let cy = floorY; cy < h; cy += 22) {
      for (let cx = (cy % 44 === 0 ? 0 : 25); cx < w; cx += 50) {
        ctx.strokeRect(cx + 2, cy + 2, 46, 18);
      }
    }

    // Carpeting of orange cempasúchil petals
    this.drawFloorPetals(ctx, floorY, w, h, 38);
  }

  // --- STAGE: PLAYA SAYULITA ---
  private renderSayulitaStage(ctx: CanvasRenderingContext2D) {
    if (this.sayulitaBgLoaded && this.sayulitaBgImg) {
      ctx.drawImage(this.sayulitaBgImg, 0, 0, this.width, this.height);

      // Sunset water shimmer animation
      const shimmerY = this.height * 0.58;
      ctx.fillStyle = 'rgba(255, 230, 150, 0.15)';
      for (let s = 0; s < 5; s++) {
        const sx = this.width * 0.45 + Math.sin(this.animTimer * 4 + s) * 35;
        const sy = shimmerY + s * 8;
        ctx.fillRect(sx, sy, 35 - s * 4, 2);
      }
    } else {
      // Procedural sunset ocean
      const w = this.width;
      const h = this.height;
      const sunset = ctx.createLinearGradient(0, 0, 0, h * 0.7);
      sunset.addColorStop(0, '#581c87');
      sunset.addColorStop(0.5, '#ea580c');
      sunset.addColorStop(1, '#fde047');
      ctx.fillStyle = sunset;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // --- STAGE: TEMPLO DE ANUBIS ---
  private renderAnubisStage(ctx: CanvasRenderingContext2D) {
    if (this.anubisBgLoaded && this.anubisBgImg) {
      ctx.drawImage(this.anubisBgImg, 0, 0, this.width, this.height);

      // Flickering brazier torches
      const brazierPositions = [
        { x: this.width * 0.09, y: this.height * 0.53 },
        { x: this.width * 0.51, y: this.height * 0.53 },
        { x: this.width * 0.96, y: this.height * 0.53 },
      ];

      brazierPositions.forEach((bp, idx) => {
        const flicker = Math.sin(this.animTimer * 6 + idx * 2.1) * 0.25 + 0.75;
        const rad = 22 * flicker;
        const grad = ctx.createRadialGradient(bp.x, bp.y, 3, bp.x, bp.y, rad);
        grad.addColorStop(0, 'rgba(255, 220, 80, 0.6)');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Procedural desert night temple
      const w = this.width;
      const h = this.height;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, w, h);
    }
  }

  // --- MAMÁ LUCHA HEROIC FLYBY / BANNER ---
  private renderMamaLuchaHeroicPresence(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    introProgress: number
  ) {
    // Flying Mamá Lucha across the upper background
    // If introProgress > 0, she zooms across with a big speech balloon
    const cycle = (this.animTimer * 0.4) % 1;
    const flyProgress = introProgress > 0 ? (1 - introProgress) : cycle;
    const flyX = w * 1.15 - flyProgress * (w * 1.3);
    const flyY = 78 + Math.sin(this.animTimer * 4) * 8;

    ctx.save();
    ctx.translate(flyX, flyY);

    // Speed lines behind Mamá Lucha
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(30 + i * 15, -10 + i * 8);
      ctx.lineTo(80 + i * 20, -10 + i * 8);
      ctx.stroke();
    }

    // Yellow superhero cape fluttering
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.quadraticCurveTo(35 + Math.sin(this.animTimer * 6) * 10, -20, 60, -8);
    ctx.quadraticCurveTo(30, 10, -5, 5);
    ctx.closePath();
    ctx.fill();

    // Body (Green luchadora suit)
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Red belt
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-8, -2, 16, 4);

    // Head (Green Mask with "M")
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(-16, -6, 11, 0, Math.PI * 2);
    ctx.fill();

    // White Hair Bun on top
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-18, -17, 7, 0, Math.PI * 2);
    ctx.fill();

    // Mask eye slits
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-22, -8, 5, 3);
    ctx.fillRect(-14, -8, 5, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-20, -7, 2, 2);
    ctx.fillRect(-13, -7, 2, 2);

    // Yellow superhero boots
    ctx.fillStyle = '#facc15';
    ctx.fillRect(10, -3, 14, 6);

    // Forward punching fist
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-26, 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Flying speech comic balloon: "¡LLEGARON LOS PRECIOS BAJOS!"
    if (flyX > 50 && flyX < w - 100) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-140, -42, 130, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Pointer tail
      ctx.beginPath();
      ctx.moveTo(-25, -24);
      ctx.lineTo(-12, -14);
      ctx.lineTo(-15, -24);
      ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.font = '900 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('¡PRECIOS BAJOS!', -75, -26);
    }

    ctx.restore();
  }

  // --- PAPEL PICADO BANNER ROW ---
  private drawPapelPicadoRow(ctx: CanvasRenderingContext2D, y: number, w: number) {
    const colors = ['#ec4899', '#f97316', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];
    const flagW = 28;
    const flagH = 22;

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    for (let x = 10; x < w; x += flagW + 8) {
      const col = colors[Math.floor(x / (flagW + 8)) % colors.length];
      const flutter = Math.sin(this.animTimer * 3 + x * 0.05) * 3;

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + flagW, y);
      ctx.lineTo(x + flagW + flutter, y + flagH);
      // Scalloped bottom
      ctx.lineTo(x + flagW * 0.75, y + flagH - 4);
      ctx.lineTo(x + flagW * 0.5, y + flagH);
      ctx.lineTo(x + flagW * 0.25, y + flagH - 4);
      ctx.lineTo(x + flutter, y + flagH);
      ctx.closePath();
      ctx.fill();

      // Cutout skull/diamond holes in papel picado
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + flagW * 0.4, y + 6, 6, 6);
      ctx.fillRect(x + flagW * 0.25, y + 14, 4, 3);
      ctx.fillRect(x + flagW * 0.65, y + 14, 4, 3);
    }
  }

  // --- PIÑATA (7 PICOS) ---
  private drawPinata(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    bodyColor: string,
    coneColor: string,
    angle: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Hanging string
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Central sphere
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // 7 cones of the star piñata
    const numCones = 7;
    for (let c = 0; c < numCones; c++) {
      const a = (c * (Math.PI * 2)) / numCones;
      const coneLen = 22;
      const tipX = Math.cos(a) * coneLen;
      const tipY = Math.sin(a) * coneLen;
      const baseA1 = a - 0.25;
      const baseA2 = a + 0.25;

      ctx.fillStyle = coneColor;
      ctx.beginPath();
      ctx.moveTo(Math.cos(baseA1) * 14, Math.sin(baseA1) * 14);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(Math.cos(baseA2) * 14, Math.sin(baseA2) * 14);
      ctx.closePath();
      ctx.fill();

      // Ribbon streamer on tips
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX * 1.4, tipY * 1.4 + 5);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- OFRENDA / ALTAR DE MUERTOS AT SUPERMARKET ---
  private drawSupermarketOfrenda(ctx: CanvasRenderingContext2D, cx: number, floorY: number) {
    // 3-tiered altar
    const tierWidths = [120, 85, 55];
    const tierHeights = [18, 16, 16];
    let ty = floorY - 18;

    for (let i = 0; i < 3; i++) {
      const tw = tierWidths[i];
      const th = tierHeights[i];
      ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#facc15';
      ctx.fillRect(cx - tw / 2, ty, tw, th);

      // Candles on tiers
      const candleCount = 3 - i;
      for (let c = 0; c < candleCount; c++) {
        const candleX = cx - tw / 2 + 15 + c * (tw / (candleCount + 0.5));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(candleX, ty - 10, 4, 10);
        // Flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(candleX + 2, ty - 12, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ty -= th;
    }

    // Top arch with cempasúchil flowers
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, ty + 10, 24, Math.PI, 0);
    ctx.stroke();

    // Sugar Skull at center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, ty + 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(cx - 3, ty + 4, 2, 2);
    ctx.fillRect(cx + 1, ty + 4, 2, 2);
  }

  private drawMarketAltar(ctx: CanvasRenderingContext2D, cx: number, floorY: number) {
    this.drawSupermarketOfrenda(ctx, cx + 90, floorY);
  }

  private drawGuacal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    produceColor: string,
    label: string
  ) {
    // Wooden slats
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Produce mounds
    ctx.fillStyle = produceColor;
    for (let px = x + 6; px < x + w - 6; px += 10) {
      ctx.beginPath();
      ctx.arc(px, y + 6, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wooden slat gaps
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 2, y + h * 0.35, w - 4, 3);
    ctx.fillRect(x + 2, y + h * 0.7, w - 4, 3);

    // Price tag sign
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + w * 0.1, y + h - 14, w * 0.8, 12);
    ctx.fillStyle = '#000000';
    ctx.font = '700 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label.slice(0, 9), x + w * 0.5, y + h - 5);
  }

  private drawTrompo(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Trompo stand pole
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x + 22, y - 20, 6, 80);

    // Meat cone (pork trompo with achiote red)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 10);
    ctx.lineTo(x + 45, y + 10);
    ctx.lineTo(x + 30, y + 65);
    ctx.lineTo(x + 20, y + 65);
    ctx.closePath();
    ctx.fill();

    // Grilled ridges
    ctx.fillStyle = '#991b1b';
    for (let r = y + 18; r < y + 60; r += 8) {
      ctx.fillRect(x + 12, r, 26, 3);
    }

    // Pineapple on top
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 16, y - 6, 18, 16);
    // Green leaves
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 22, y - 16, 6, 10);
  }

  private drawFloorPetals(
    ctx: CanvasRenderingContext2D,
    floorY: number,
    w: number,
    h: number,
    count: number
  ) {
    const colors = ['#ea580c', '#f97316', '#facc15', '#fbbf24'];
    for (let i = 0; i < count; i++) {
      // Deterministic spread
      const px = ((i * 73 + 17) % w);
      const py = floorY + ((i * 37) % (h - floorY - 15)) + 6;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(px, py, 4, 2, (i * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- FIGHTER SHADOW ---
  private renderShadow(ctx: CanvasRenderingContext2D, f: FighterState) {
    const groundY = this.height * 0.78;
    const shadowScale = Math.max(0.3, 1 - (groundY - (f.y + f.height)) / 200);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(f.x + f.width / 2, groundY, (f.width * 0.6) * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- FIGHTER RENDERING (SPRITE / PROCEDURAL 16-BIT RETRO) ---
  private renderFighter(ctx: CanvasRenderingContext2D, f: FighterState) {
    ctx.save();

    // Flash white/red when hit
    const isFlashing = f.hitFlashTimer > 0;

    // Flip horizontally based on facing direction
    ctx.translate(f.x + f.width / 2, f.y + f.height);
    if (f.facing === -1) {
      ctx.scale(-1, 1);
    }

    const t = this.animTimer * 6;
    const idleBob = f.state === 'idle' ? Math.sin(t) * 3 : 0;

    // Delegate rendering to fighter character design
    switch (f.charDef.id) {
      case 'mama_lucha':
        this.drawMamaLuchaFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'catrina':
        this.drawCatrinaFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'catrin':
        this.drawCatrinFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'taquero':
        this.drawTaqueroFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'zorro_negro':
        this.drawZorroFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'dafne':
        this.drawDafneFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'gato_sombra':
        this.drawGatoSombraFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'conde_vampiro':
        this.drawCondeVampiroFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'momia_sacerdotisa':
        this.drawMomiaSacerdotisaFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'guardian_ancestral':
        this.drawGuardianAncestralFighter(ctx, f, idleBob, isFlashing);
        break;
      case 'mascara':
      default:
        this.drawMascaraFighter(ctx, f, idleBob, isFlashing);
        break;
    }

    // Draw Hitbox indicator in training mode if needed
    if (f.isBlocking) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(20, -50, 32, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- MAMÁ LUCHA FIGHTER SPRITE ---
  private drawMamaLuchaFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const green = flash ? '#ffffff' : '#15803d';
    const darkGreen = flash ? '#ffffff' : '#14532d';
    const yellow = flash ? '#ffffff' : '#facc15';
    const red = flash ? '#ff0000' : '#dc2626';

    const isAttacking = f.state === 'punch' || f.state === 'kick' || f.state === 'special' || f.state === 'super';
    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const isKnocked = f.state === 'knockdown' || f.state === 'defeat';

    if (isKnocked) {
      // Knocked down on floor
      ctx.rotate(-Math.PI * 0.45);
    }

    const crouchOffset = isCrouch ? 22 : 0;

    // Fluttering Yellow Cape
    ctx.fillStyle = yellow;
    ctx.beginPath();
    ctx.moveTo(-15, -75 + crouchOffset);
    ctx.quadraticCurveTo(-45 - Math.sin(this.animTimer * 8) * 8, -60, -35, -20);
    ctx.lineTo(-10, -50 + crouchOffset);
    ctx.closePath();
    ctx.fill();

    // Boots (Yellow)
    ctx.fillStyle = yellow;
    if (isKick) {
      // High flying kick
      ctx.fillRect(10, -35, 18, 35);
      ctx.fillRect(18, -75, 45, 18); // extended kicking leg
    } else {
      ctx.fillRect(-18, -25, 14, 25);
      ctx.fillRect(4, -25, 14, 25);
    }

    // Body / Luchadora Costume (Green)
    ctx.fillStyle = green;
    ctx.beginPath();
    ctx.roundRect(-20, -78 + crouchOffset + bob, 40, 56 - crouchOffset * 0.5, 8);
    ctx.fill();

    // Red superhero belt with golden buckle
    ctx.fillStyle = red;
    ctx.fillRect(-20, -42 + crouchOffset + bob, 40, 9);
    ctx.fillStyle = yellow;
    ctx.fillRect(-6, -42 + crouchOffset + bob, 12, 9);

    // Emblem "M" on chest
    ctx.fillStyle = yellow;
    ctx.font = '900 14px "Rubik Mono One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M', 0, -58 + crouchOffset + bob);

    // Arms
    ctx.fillStyle = darkGreen;
    if (isPunch) {
      // Extended punching arm with yellow boxing glove / fist
      ctx.fillRect(-15, -72 + bob, 20, 14);
      ctx.fillStyle = yellow;
      ctx.beginPath();
      ctx.arc(38, -65 + bob, 14, 0, Math.PI * 2); // huge punch
      ctx.fill();
    } else if (f.state === 'special') {
      // Pushing shopping cart stance
      ctx.fillRect(-10, -68 + bob, 35, 14);
      ctx.fillStyle = yellow;
      ctx.fillRect(25, -70 + bob, 10, 18);
    } else {
      // Classic luchadora guard stance
      ctx.fillRect(-18, -68 + crouchOffset + bob, 12, 24);
      ctx.fillRect(8, -72 + crouchOffset + bob, 14, 24);
      ctx.fillStyle = yellow;
      ctx.beginPath();
      ctx.arc(-12, -45 + crouchOffset + bob, 7, 0, Math.PI * 2);
      ctx.arc(15, -50 + crouchOffset + bob, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head (Green Luchadora Mask)
    ctx.fillStyle = green;
    ctx.beginPath();
    ctx.arc(0, -90 + crouchOffset + bob, 16, 0, Math.PI * 2);
    ctx.fill();

    // White Hair Bun on top of mask
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -107 + crouchOffset + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // Mask eye holes (White with dark eye)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(6, -91 + crouchOffset + bob, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(7, -92 + crouchOffset + bob, 3, 3);

    // Red mask nose bridge flame
    ctx.fillStyle = red;
    ctx.fillRect(-1, -95 + crouchOffset + bob, 3, 7);

    // Special move aura
    if (f.state === 'special' || f.state === 'super') {
      ctx.strokeStyle = yellow;
      ctx.lineWidth = 3;
      ctx.shadowColor = yellow;
      ctx.shadowBlur = 15;
      ctx.strokeRect(-25, -112 + crouchOffset, 50, 115);
      ctx.shadowBlur = 0;
    }
  }

  // --- LA CATRINA FIGHTER SPRITE ---
  private drawCatrinaFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const black = flash ? '#ffffff' : '#0f172a';
    const orange = flash ? '#ffffff' : '#ea580c';
    const pink = flash ? '#ffffff' : '#ec4899';
    const bone = flash ? '#ffffff' : '#f8fafc';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 20 : 0;

    // Traditional Mexican ruffled skirt (black with vibrant floral embroidery)
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.moveTo(-16, -55 + crouchOffset + bob);
    ctx.lineTo(16, -55 + crouchOffset + bob);
    ctx.lineTo(26, -15);
    ctx.lineTo(-26, -15);
    ctx.closePath();
    ctx.fill();

    // Embroidered cempasúchil & rose borders on skirt
    ctx.fillStyle = orange;
    ctx.fillRect(-26, -20, 52, 5);
    ctx.fillStyle = pink;
    ctx.fillRect(-24, -13, 48, 4);

    // Boots / High heels
    ctx.fillStyle = black;
    if (isKick) {
      // Extended kick with marigold flare
      ctx.fillRect(-8, -35, 14, 35);
      ctx.fillStyle = bone;
      ctx.fillRect(10, -78, 50, 16);
      ctx.fillStyle = orange;
      ctx.beginPath();
      ctx.arc(60, -70, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-14, -15, 10, 15);
      ctx.fillRect(4, -15, 10, 15);
    }

    // Torso (Embroidered corset with calavera bones)
    ctx.fillStyle = black;
    ctx.fillRect(-14, -80 + crouchOffset + bob, 28, 28);
    ctx.fillStyle = bone;
    // Rib cage pattern
    for (let r = 0; r < 3; r++) {
      ctx.fillRect(-8, -75 + r * 6 + crouchOffset + bob, 16, 2);
    }

    // Arms
    ctx.fillStyle = bone;
    if (isPunch) {
      ctx.fillRect(5, -74 + bob, 45, 10);
      // Cempasúchil claw flare
      ctx.fillStyle = orange;
      ctx.beginPath();
      ctx.arc(48, -69 + bob, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-16, -72 + crouchOffset + bob, 8, 22);
      ctx.fillRect(8, -70 + crouchOffset + bob, 10, 22);
    }

    // Head (Calavera Sugar Skull)
    ctx.fillStyle = bone;
    ctx.beginPath();
    ctx.arc(0, -92 + crouchOffset + bob, 14, 0, Math.PI * 2);
    ctx.fill();

    // Calavera eye sockets (Black with pink dots)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(4, -92 + crouchOffset + bob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pink;
    ctx.fillRect(3, -93 + crouchOffset + bob, 2, 2);

    // Fiery red / mahogany long hair
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-12, -94 + crouchOffset + bob);
    ctx.lineTo(-24, -60 + crouchOffset + bob);
    ctx.lineTo(-12, -75 + crouchOffset + bob);
    ctx.fill();

    // Crown of Cempasúchil Flowers on head
    const flowerX = [-10, -3, 5, 12];
    flowerX.forEach(fx => {
      ctx.fillStyle = orange;
      ctx.beginPath();
      ctx.arc(fx, -106 + crouchOffset + bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fx, -106 + crouchOffset + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // --- EL CATRÍN FIGHTER SPRITE ---
  private drawCatrinFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const suitBlack = flash ? '#ffffff' : '#09090b';
    const gold = flash ? '#ffffff' : '#eab308';
    const red = flash ? '#ff0000' : '#b91c1c';
    const bone = flash ? '#ffffff' : '#f8fafc';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isSpecial = f.state === 'special';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Pants (Black mariachi trousers with gold botonaduras down sides)
    ctx.fillStyle = suitBlack;
    if (isKick) {
      ctx.fillRect(-15, -45, 14, 45);
      ctx.fillRect(0, -70, 52, 16);
      ctx.fillStyle = gold;
      ctx.fillRect(48, -72, 8, 20); // shiny spur
    } else {
      ctx.fillRect(-18, -48 + crouchOffset, 14, 48 - crouchOffset);
      ctx.fillRect(4, -48 + crouchOffset, 14, 48 - crouchOffset);
      // Gold side buttons
      ctx.fillStyle = gold;
      for (let b = -42 + crouchOffset; b < -5; b += 9) {
        ctx.fillRect(-19, b, 2, 4);
        ctx.fillRect(16, b, 2, 4);
      }
    }

    // Red sash belt
    ctx.fillStyle = red;
    ctx.fillRect(-16, -54 + crouchOffset + bob, 32, 8);
    // Sash tail
    ctx.fillRect(6, -46 + crouchOffset + bob, 6, 20);

    // Charro Jacket & White shirt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -82 + crouchOffset + bob, 16, 28);
    // Red bowtie (moño)
    ctx.fillStyle = red;
    ctx.fillRect(-8, -84 + crouchOffset + bob, 16, 7);

    // Jacket sides
    ctx.fillStyle = suitBlack;
    ctx.fillRect(-18, -82 + crouchOffset + bob, 10, 28);
    ctx.fillRect(8, -82 + crouchOffset + bob, 10, 28);
    // Gold embroidery on lapels
    ctx.fillStyle = gold;
    ctx.fillRect(-10, -78 + crouchOffset + bob, 2, 20);
    ctx.fillRect(8, -78 + crouchOffset + bob, 2, 20);

    // Arms
    ctx.fillStyle = suitBlack;
    if (isPunch) {
      ctx.fillRect(2, -76 + bob, 44, 12);
      ctx.fillStyle = bone;
      ctx.fillRect(46, -76 + bob, 10, 10);
    } else {
      ctx.fillRect(-18, -76 + crouchOffset + bob, 10, 24);
      ctx.fillRect(8, -76 + crouchOffset + bob, 12, 24);
    }

    // Skull Head
    ctx.fillStyle = bone;
    ctx.beginPath();
    ctx.arc(0, -94 + crouchOffset + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    // Eye socket
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(5, -94 + crouchOffset + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Sombrero Charro (If not currently thrown in special attack)
    if (!isSpecial) {
      ctx.fillStyle = suitBlack;
      // Wide brim
      ctx.beginPath();
      ctx.ellipse(0, -106 + crouchOffset + bob, 42, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Gold trim around brim
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sombrero crown
      ctx.fillStyle = suitBlack;
      ctx.beginPath();
      ctx.roundRect(-16, -125 + crouchOffset + bob, 32, 22, [8, 8, 0, 0]);
      ctx.fill();
      ctx.fillStyle = gold;
      ctx.fillRect(-16, -108 + crouchOffset + bob, 32, 4);
    }
  }

  // --- DON CHENCHO (EL TAQUERO) FIGHTER SPRITE ---
  private drawTaqueroFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const red = flash ? '#ffffff' : '#b91c1c';
    const white = flash ? '#ffffff' : '#f8fafc';
    const apron = flash ? '#ffffff' : '#e2e8f0';
    const skin = flash ? '#ffffff' : '#d97706';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Pants
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-16, -42 + crouchOffset, 14, 42 - crouchOffset);
    ctx.fillRect(4, -42 + crouchOffset, 14, 42 - crouchOffset);

    // Red taquero shirt
    ctx.fillStyle = red;
    ctx.fillRect(-18, -80 + crouchOffset + bob, 36, 40);

    // White Apron with taco salsa stains!
    ctx.fillStyle = apron;
    ctx.fillRect(-14, -72 + crouchOffset + bob, 28, 48 - crouchOffset);
    // Salsa stains on apron
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-4, -58 + crouchOffset + bob, 6, 8);
    ctx.fillStyle = '#16a34a'; // salsa verde
    ctx.fillRect(4, -45 + crouchOffset + bob, 5, 5);

    // Head & Chef band / Red bandana
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -92 + crouchOffset + bob, 15, 0, Math.PI * 2);
    ctx.fill();

    // Mustache
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(5, -88 + crouchOffset + bob, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red bandana / White taquero hat
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.roundRect(-16, -114 + crouchOffset + bob, 32, 18, [6, 6, 2, 2]);
    ctx.fill();

    // Taquero Cleaver (Cuchillo taquero)
    if (isPunch) {
      ctx.fillStyle = skin;
      ctx.fillRect(5, -74 + bob, 30, 10);
      // Big shiny metal cleaver
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(35, -85 + bob, 24, 28);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(35, -85 + bob, 5, 28);
    } else {
      ctx.fillStyle = skin;
      ctx.fillRect(8, -72 + crouchOffset + bob, 12, 24);
      // Cleaver held upward
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(16, -92 + crouchOffset + bob, 14, 22);
    }
  }

  // --- SANTO PLATEADO (LUCHADOR) FIGHTER SPRITE ---
  private drawMascaraFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const silver = flash ? '#ffffff' : '#e2e8f0';
    const silverDark = flash ? '#ffffff' : '#94a3b8';
    const cape = flash ? '#ffffff' : '#0284c7';
    const skin = flash ? '#ffffff' : '#f59e0b';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Fluttering Silver/Blue Cape
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-12, -75 + crouchOffset);
    ctx.lineTo(-38, -15);
    ctx.lineTo(-6, -45 + crouchOffset);
    ctx.closePath();
    ctx.fill();

    // Silver Boots
    ctx.fillStyle = silver;
    ctx.fillRect(-16, -28 + crouchOffset, 12, 28 - crouchOffset);
    ctx.fillRect(4, -28 + crouchOffset, 12, 28 - crouchOffset);

    // Trunks / Calzón de Lucha (Blue/Silver)
    ctx.fillStyle = cape;
    ctx.fillRect(-16, -44 + crouchOffset + bob, 32, 18);

    // Bare athletic torso
    ctx.fillStyle = skin;
    ctx.fillRect(-15, -78 + crouchOffset + bob, 30, 34);

    // Arms with silver wristbands
    ctx.fillStyle = skin;
    if (isPunch) {
      ctx.fillRect(4, -74 + bob, 40, 12);
      ctx.fillStyle = silver;
      ctx.fillRect(30, -75 + bob, 12, 14);
    } else {
      ctx.fillRect(-18, -72 + crouchOffset + bob, 10, 24);
      ctx.fillRect(8, -72 + crouchOffset + bob, 10, 24);
      ctx.fillStyle = silver;
      ctx.fillRect(-18, -55 + crouchOffset + bob, 10, 8);
      ctx.fillRect(8, -55 + crouchOffset + bob, 10, 8);
    }

    // Legendary Silver Mask
    ctx.fillStyle = silver;
    ctx.beginPath();
    ctx.arc(0, -92 + crouchOffset + bob, 15, 0, Math.PI * 2);
    ctx.fill();

    // Eye slits
    ctx.fillStyle = silverDark;
    ctx.beginPath();
    ctx.ellipse(5, -92 + crouchOffset + bob, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, -93 + crouchOffset + bob, 3, 2);
  }

  // --- EL ZORRO NEGRO FIGHTER SPRITE ---
  private drawZorroFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const black = flash ? '#ffffff' : '#09090b';
    const capeRed = flash ? '#ffffff' : '#b91c1c';
    const silver = flash ? '#ffffff' : '#e2e8f0';
    const skin = flash ? '#ffffff' : '#f59e0b';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isSpecial = f.state === 'special';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Fluttering Crimson Cape
    ctx.fillStyle = capeRed;
    ctx.beginPath();
    ctx.moveTo(-10, -78 + crouchOffset);
    ctx.quadraticCurveTo(-45 - Math.sin(this.animTimer * 7) * 10, -50, -32, -10);
    ctx.lineTo(-4, -45 + crouchOffset);
    ctx.closePath();
    ctx.fill();

    // Black Vigilante Boots
    ctx.fillStyle = black;
    if (isKick) {
      ctx.fillRect(-15, -45, 14, 45);
      ctx.fillRect(2, -72, 48, 16);
    } else {
      ctx.fillRect(-16, -35 + crouchOffset, 12, 35 - crouchOffset);
      ctx.fillRect(4, -35 + crouchOffset, 12, 35 - crouchOffset);
    }

    // Black Trousers & Red Sash Belt
    ctx.fillStyle = black;
    ctx.fillRect(-16, -55 + crouchOffset + bob, 32, 24);
    ctx.fillStyle = capeRed;
    ctx.fillRect(-16, -54 + crouchOffset + bob, 32, 7);
    // Sash ribbons
    ctx.fillRect(4, -47 + crouchOffset + bob, 6, 18);

    // Torso (Muscular black vigilante tunic with V-neck)
    ctx.fillStyle = black;
    ctx.fillRect(-15, -82 + crouchOffset + bob, 30, 28);
    // Open chest skin
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(-4, -82 + crouchOffset + bob);
    ctx.lineTo(4, -82 + crouchOffset + bob);
    ctx.lineTo(0, -70 + crouchOffset + bob);
    ctx.closePath();
    ctx.fill();

    // Arms & Rapier Sword
    ctx.fillStyle = black;
    if (isPunch || isSpecial) {
      // Rapid rapier lunge
      ctx.fillRect(2, -74 + bob, 35, 10);
      // Shining silver rapier blade
      ctx.fillStyle = silver;
      ctx.fillRect(37, -72 + bob, 46, 3);
      // Sword guard (golden/silver cup)
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(37, -71 + bob, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-18, -74 + crouchOffset + bob, 10, 22);
      ctx.fillRect(8, -74 + crouchOffset + bob, 12, 22);
      // Sword angled down in hand
      ctx.fillStyle = silver;
      ctx.fillRect(16, -65 + crouchOffset + bob, 30, 3);
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(16, -64 + crouchOffset + bob, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head with Black Mask
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -92 + crouchOffset + bob, 14, 0, Math.PI * 2);
    ctx.fill();

    // Black Domino Mask
    ctx.fillStyle = black;
    ctx.fillRect(-14, -98 + crouchOffset + bob, 28, 9);
    // Eye slit
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -95 + crouchOffset + bob, 4, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, -95 + crouchOffset + bob, 2, 3);

    // Cordobés Flat Hat (Black with red ribbon)
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.ellipse(0, -104 + crouchOffset + bob, 38, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-16, -118 + crouchOffset + bob, 32, 16);
    ctx.fillStyle = capeRed;
    ctx.fillRect(-16, -107 + crouchOffset + bob, 32, 4);
  }

  // --- DAFNE (SAYULITA) FIGHTER SPRITE ---
  private drawDafneFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const purple = flash ? '#ffffff' : '#7c3aed';
    const green = flash ? '#ffffff' : '#22c55e';
    const lilac = flash ? '#ffffff' : '#c084fc';
    const hair = flash ? '#ffffff' : '#ea580c';
    const skin = flash ? '#ffffff' : '#fed7aa';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Lilac Heeled Boots
    ctx.fillStyle = lilac;
    if (isKick) {
      ctx.fillRect(-12, -40, 12, 40);
      ctx.fillStyle = skin;
      ctx.fillRect(0, -74, 48, 14);
      ctx.fillStyle = lilac;
      ctx.fillRect(40, -78, 16, 18);
    } else {
      ctx.fillRect(-14, -20 + crouchOffset, 10, 20 - crouchOffset);
      ctx.fillRect(4, -20 + crouchOffset, 10, 20 - crouchOffset);
      // Bare legs
      ctx.fillStyle = skin;
      ctx.fillRect(-14, -42 + crouchOffset, 10, 22);
      ctx.fillRect(4, -42 + crouchOffset, 10, 22);
    }

    // Purple Mini-Dress
    ctx.fillStyle = purple;
    ctx.beginPath();
    ctx.moveTo(-16, -75 + crouchOffset + bob);
    ctx.lineTo(16, -75 + crouchOffset + bob);
    ctx.lineTo(22, -42 + crouchOffset + bob);
    ctx.lineTo(-22, -42 + crouchOffset + bob);
    ctx.closePath();
    ctx.fill();

    // Lilac dress hem trim
    ctx.fillStyle = lilac;
    ctx.fillRect(-22, -43 + crouchOffset + bob, 44, 4);

    // Green Ascot / Scarf around neck
    ctx.fillStyle = green;
    ctx.fillRect(-12, -77 + crouchOffset + bob, 24, 6);
    // Scarf knot & tails
    ctx.beginPath();
    ctx.moveTo(-4, -74 + crouchOffset + bob);
    ctx.lineTo(6, -60 + crouchOffset + bob);
    ctx.lineTo(0, -60 + crouchOffset + bob);
    ctx.fill();

    // Arms
    ctx.fillStyle = skin;
    if (isPunch) {
      ctx.fillRect(4, -72 + bob, 42, 9);
      ctx.fillStyle = lilac;
      ctx.fillRect(38, -73 + bob, 8, 11);
    } else {
      ctx.fillRect(-16, -70 + crouchOffset + bob, 8, 22);
      ctx.fillRect(8, -70 + crouchOffset + bob, 10, 22);
      ctx.fillStyle = lilac;
      ctx.fillRect(-16, -54 + crouchOffset + bob, 8, 6);
      ctx.fillRect(8, -54 + crouchOffset + bob, 10, 6);
    }

    // Head & Face
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -90 + crouchOffset + bob, 13, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(4, -92 + crouchOffset + bob, 3, 3);

    // Flowing Ginger Hair & Lavender Headband
    ctx.fillStyle = hair;
    // Hair bangs
    ctx.fillRect(-14, -98 + crouchOffset + bob, 28, 8);
    // Long hair back
    ctx.beginPath();
    ctx.moveTo(-14, -94 + crouchOffset + bob);
    ctx.lineTo(-24, -60 + crouchOffset + bob);
    ctx.lineTo(-10, -70 + crouchOffset + bob);
    ctx.fill();

    // Lavender Headband
    ctx.fillStyle = lilac;
    ctx.fillRect(-14, -98 + crouchOffset + bob, 28, 4);
  }

  // --- GATO SOMBRA FIGHTER SPRITE ---
  private drawGatoSombraFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const black = flash ? '#ffffff' : '#09090b';
    const armorRed = flash ? '#ffffff' : '#dc2626';
    const greenEye = flash ? '#ffffff' : '#22c55e';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Swishing Black Tail behind
    ctx.strokeStyle = black;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-14, -45 + crouchOffset);
    ctx.quadraticCurveTo(-38 - Math.sin(this.animTimer * 8) * 8, -60, -28, -80);
    ctx.stroke();

    // Fluttering Red Ninja Cape
    ctx.fillStyle = armorRed;
    ctx.beginPath();
    ctx.moveTo(-10, -78 + crouchOffset);
    ctx.lineTo(-44, -20);
    ctx.lineTo(-8, -48 + crouchOffset);
    ctx.closePath();
    ctx.fill();

    // Black Ninja Legs & Red Armor Greaves
    ctx.fillStyle = black;
    if (isKick) {
      ctx.fillRect(-14, -40, 12, 40);
      ctx.fillRect(2, -72, 46, 16);
      ctx.fillStyle = armorRed;
      ctx.fillRect(20, -74, 28, 18);
    } else {
      ctx.fillRect(-16, -35 + crouchOffset, 12, 35 - crouchOffset);
      ctx.fillRect(4, -35 + crouchOffset, 12, 35 - crouchOffset);
      ctx.fillStyle = armorRed;
      ctx.fillRect(-16, -24 + crouchOffset, 12, 14);
      ctx.fillRect(4, -24 + crouchOffset, 12, 14);
    }

    // Torso with Crimson Segmented Armor Plates
    ctx.fillStyle = black;
    ctx.fillRect(-16, -80 + crouchOffset + bob, 32, 45 - crouchOffset * 0.5);
    // Red Armor Plates
    ctx.fillStyle = armorRed;
    ctx.fillRect(-18, -78 + crouchOffset + bob, 36, 12);
    ctx.fillRect(-16, -64 + crouchOffset + bob, 32, 10);
    ctx.fillRect(-14, -52 + crouchOffset + bob, 28, 8);

    // Arms with red samurai shoulder pads
    ctx.fillStyle = armorRed;
    ctx.fillRect(-22, -82 + crouchOffset + bob, 10, 12);
    ctx.fillRect(12, -82 + crouchOffset + bob, 10, 12);

    ctx.fillStyle = black;
    if (isPunch) {
      ctx.fillRect(4, -74 + bob, 42, 12);
      ctx.fillStyle = greenEye;
      ctx.fillRect(42, -76 + bob, 8, 16); // claw spark
    } else {
      ctx.fillRect(-18, -72 + crouchOffset + bob, 10, 22);
      ctx.fillRect(8, -72 + crouchOffset + bob, 12, 22);
    }

    // Black Cat Ninja Head with Pointy Ears
    ctx.fillStyle = black;
    ctx.beginPath();
    ctx.arc(0, -94 + crouchOffset + bob, 16, 0, Math.PI * 2);
    ctx.fill();

    // Pointy Cat Ears
    ctx.beginPath();
    ctx.moveTo(-16, -98 + crouchOffset + bob);
    ctx.lineTo(-24, -125 + crouchOffset + bob);
    ctx.lineTo(-6, -106 + crouchOffset + bob);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(16, -98 + crouchOffset + bob);
    ctx.lineTo(24, -125 + crouchOffset + bob);
    ctx.lineTo(6, -106 + crouchOffset + bob);
    ctx.fill();

    // Glowing Green Angular Cat Eyes
    ctx.fillStyle = greenEye;
    ctx.shadowColor = greenEye;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(2, -96 + crouchOffset + bob);
    ctx.lineTo(15, -99 + crouchOffset + bob);
    ctx.lineTo(12, -92 + crouchOffset + bob);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Grinning Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -86 + crouchOffset + bob, 12, 5);
    ctx.fillStyle = black;
    ctx.fillRect(8, -86 + crouchOffset + bob, 2, 5);
    ctx.fillRect(12, -86 + crouchOffset + bob, 2, 5);
  }

  // --- CONDE CILINDRO FIGHTER SPRITE ---
  private drawCondeVampiroFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const white = flash ? '#ffffff' : '#f1f5f9';
    const darkSuit = flash ? '#ffffff' : '#09090b';
    const capeRed = flash ? '#ffffff' : '#b91c1c';
    const gold = flash ? '#ffffff' : '#eab308';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 16 : 0;

    // Dracula Cape with Red Inner Lining
    ctx.fillStyle = darkSuit;
    ctx.beginPath();
    ctx.moveTo(-16, -82 + crouchOffset);
    ctx.lineTo(-48, -15);
    ctx.lineTo(-6, -45 + crouchOffset);
    ctx.closePath();
    ctx.fill();

    // Red inner lining
    ctx.fillStyle = capeRed;
    ctx.beginPath();
    ctx.moveTo(-12, -80 + crouchOffset);
    ctx.lineTo(-44, -15);
    ctx.lineTo(-8, -45 + crouchOffset);
    ctx.closePath();
    ctx.fill();

    // High pointed vampire collar
    ctx.fillStyle = darkSuit;
    ctx.beginPath();
    ctx.moveTo(-20, -78 + crouchOffset + bob);
    ctx.lineTo(-32, -104 + crouchOffset + bob);
    ctx.lineTo(-14, -88 + crouchOffset + bob);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(18, -78 + crouchOffset + bob);
    ctx.lineTo(28, -104 + crouchOffset + bob);
    ctx.lineTo(12, -88 + crouchOffset + bob);
    ctx.fill();

    // Pointed Vampiric Boots
    ctx.fillStyle = darkSuit;
    if (isKick) {
      ctx.fillRect(-12, -38, 12, 38);
      ctx.fillRect(2, -68, 48, 16);
      ctx.fillStyle = gold;
      ctx.fillRect(44, -70, 8, 20);
    } else {
      ctx.fillRect(-14, -28 + crouchOffset, 10, 28 - crouchOffset);
      ctx.fillRect(4, -28 + crouchOffset, 10, 28 - crouchOffset);
      // Gold boot tips
      ctx.fillStyle = gold;
      ctx.fillRect(-18, -8, 6, 8);
      ctx.fillRect(10, -8, 6, 8);
    }

    // Cylindrical White Body
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.roundRect(-16, -92 + crouchOffset + bob, 32, 65 - crouchOffset * 0.5, [14, 14, 6, 6]);
    ctx.fill();

    // Black Trunks with Gold Trim & Calavera Skull Buckle
    ctx.fillStyle = darkSuit;
    ctx.fillRect(-18, -48 + crouchOffset + bob, 36, 18);
    ctx.fillStyle = gold;
    ctx.fillRect(-18, -49 + crouchOffset + bob, 36, 3);
    // Skull Buckle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -40 + crouchOffset + bob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3, -41 + crouchOffset + bob, 2, 2);
    ctx.fillRect(1, -41 + crouchOffset + bob, 2, 2);

    // Big Cartoon Vampiric Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -80 + crouchOffset + bob, 7, 0, Math.PI * 2);
    ctx.arc(8, -80 + crouchOffset + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, -80 + crouchOffset + bob, 3, 0, Math.PI * 2);
    ctx.arc(10, -80 + crouchOffset + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eyebrows
    ctx.fillStyle = '#000000';
    ctx.fillRect(-6, -90 + crouchOffset + bob, 8, 3);
    ctx.fillRect(4, -92 + crouchOffset + bob, 10, 3);

    // White Arms with black wristguards
    ctx.fillStyle = white;
    if (isPunch) {
      ctx.fillRect(4, -68 + bob, 42, 10);
      ctx.fillStyle = darkSuit;
      ctx.fillRect(36, -70 + bob, 10, 14);
    } else {
      ctx.fillRect(-20, -68 + crouchOffset + bob, 8, 22);
      ctx.fillRect(10, -68 + crouchOffset + bob, 10, 22);
      ctx.fillStyle = darkSuit;
      ctx.fillRect(10, -52 + crouchOffset + bob, 10, 6);
    }
  }

  // --- MOMIA SACERDOTISA FIGHTER SPRITE ---
  private drawMomiaSacerdotisaFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const gold = flash ? '#ffffff' : '#facc15';
    const purple = flash ? '#ffffff' : '#581c87';
    const wraps = flash ? '#ffffff' : '#fef3c7';
    const skin = flash ? '#ffffff' : '#fed7aa';
    const hair = flash ? '#ffffff' : '#d97706';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 18 : 0;

    // Legs with bandages
    ctx.fillStyle = skin;
    if (isKick) {
      ctx.fillRect(-12, -40, 12, 40);
      ctx.fillRect(0, -74, 50, 14);
      // Bandage wraps on kicking leg
      ctx.fillStyle = wraps;
      for (let b = 10; b < 45; b += 8) {
        ctx.fillRect(b, -75, 4, 16);
      }
    } else {
      ctx.fillRect(-14, -38 + crouchOffset, 10, 38 - crouchOffset);
      ctx.fillRect(4, -38 + crouchOffset, 10, 38 - crouchOffset);
      // Mummy wraps
      ctx.fillStyle = wraps;
      for (let b = -34 + crouchOffset; b < -5; b += 8) {
        ctx.fillRect(-15, b, 12, 3);
        ctx.fillRect(3, b, 12, 3);
      }
    }

    // Purple Egyptian Warrior Wrap & Gold Ankh Belt
    ctx.fillStyle = purple;
    ctx.fillRect(-16, -58 + crouchOffset + bob, 32, 22);
    // Gold Ankh Belt
    ctx.fillStyle = gold;
    ctx.fillRect(-16, -58 + crouchOffset + bob, 32, 5);
    // Ankh symbol
    ctx.beginPath();
    ctx.arc(0, -50 + crouchOffset + bob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1, -48 + crouchOffset + bob, 3, 10);
    ctx.fillRect(-4, -45 + crouchOffset + bob, 9, 2);

    // Bare athletic midriff with bandage crosses
    ctx.fillStyle = skin;
    ctx.fillRect(-14, -76 + crouchOffset + bob, 28, 18);
    ctx.fillStyle = wraps;
    ctx.fillRect(-12, -72 + crouchOffset + bob, 24, 3);

    // Purple & Gold Top
    ctx.fillStyle = purple;
    ctx.fillRect(-14, -82 + crouchOffset + bob, 28, 10);
    ctx.fillStyle = gold;
    ctx.fillRect(-14, -84 + crouchOffset + bob, 28, 3);

    // Arms with mummy bandages
    ctx.fillStyle = skin;
    if (isPunch) {
      ctx.fillRect(4, -74 + bob, 42, 10);
      ctx.fillStyle = gold;
      ctx.fillRect(38, -76 + bob, 12, 14); // gold claw
    } else {
      ctx.fillRect(-18, -72 + crouchOffset + bob, 10, 22);
      ctx.fillRect(8, -72 + crouchOffset + bob, 12, 22);
      // Bandages on arms
      ctx.fillStyle = wraps;
      ctx.fillRect(-18, -62 + crouchOffset + bob, 10, 3);
      ctx.fillRect(8, -62 + crouchOffset + bob, 12, 3);
    }

    // Head, Hair & Egyptian Headpiece
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -92 + crouchOffset + bob, 13, 0, Math.PI * 2);
    ctx.fill();

    // Blonde Hair bob
    ctx.fillStyle = hair;
    ctx.fillRect(-14, -98 + crouchOffset + bob, 28, 8);
    ctx.beginPath();
    ctx.moveTo(-14, -94 + crouchOffset + bob);
    ctx.lineTo(-20, -75 + crouchOffset + bob);
    ctx.lineTo(-10, -80 + crouchOffset + bob);
    ctx.fill();

    // Eye with Egyptian Kohl eyeliner
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, -93 + crouchOffset + bob, 6, 3);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(5, -93 + crouchOffset + bob, 2, 2);
  }

  // --- GUARDIÁN ANCESTRAL FIGHTER SPRITE ---
  private drawGuardianAncestralFighter(
    ctx: CanvasRenderingContext2D,
    f: FighterState,
    bob: number,
    flash: boolean
  ) {
    const stone = flash ? '#ffffff' : '#d6d3d1';
    const stoneDark = flash ? '#ffffff' : '#78716c';
    const sashRed = flash ? '#ffffff' : '#991b1b';
    const gold = flash ? '#ffffff' : '#eab308';

    const isPunch = f.state === 'punch';
    const isKick = f.state === 'kick';
    const isCrouch = f.state === 'crouch';
    const crouchOffset = isCrouch ? 16 : 0;

    // Stone Legs & Mummy Wraps
    ctx.fillStyle = stone;
    if (isKick) {
      ctx.fillRect(-12, -45, 12, 45);
      ctx.fillRect(2, -72, 48, 18);
    } else {
      ctx.fillRect(-16, -45 + crouchOffset, 12, 45 - crouchOffset);
      ctx.fillRect(4, -45 + crouchOffset, 12, 45 - crouchOffset);
      // Stone band lines
      ctx.fillStyle = stoneDark;
      ctx.fillRect(-16, -25 + crouchOffset, 12, 4);
      ctx.fillRect(4, -25 + crouchOffset, 12, 4);
    }

    // Red & Gold Ceremonial Loincloth
    ctx.fillStyle = sashRed;
    ctx.fillRect(-16, -56 + crouchOffset + bob, 32, 22);
    ctx.fillStyle = gold;
    ctx.fillRect(-16, -56 + crouchOffset + bob, 32, 5);

    // Monolithic Gaunt Ribs & Torso
    ctx.fillStyle = stone;
    ctx.fillRect(-14, -85 + crouchOffset + bob, 28, 32);
    // Rib horizontal grooves
    ctx.fillStyle = stoneDark;
    for (let r = -80 + crouchOffset + bob; r < -58 + crouchOffset + bob; r += 6) {
      ctx.fillRect(-10, r, 20, 2);
    }

    // Arms
    ctx.fillStyle = stone;
    if (isPunch) {
      ctx.fillRect(4, -76 + bob, 46, 14);
      ctx.fillStyle = stoneDark;
      ctx.fillRect(40, -78 + bob, 14, 18); // huge stone fist
    } else {
      ctx.fillRect(-18, -76 + crouchOffset + bob, 10, 24);
      ctx.fillRect(8, -76 + crouchOffset + bob, 12, 24);
    }

    // Blocky / Cubic Monolith Head
    ctx.fillStyle = stone;
    ctx.fillRect(-12, -114 + crouchOffset + bob, 24, 28);
    // Dark carved eye slit
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, -104 + crouchOffset + bob, 8, 4);
    ctx.fillStyle = gold;
    ctx.fillRect(4, -103 + crouchOffset + bob, 3, 2);
    // Carved mouth line
    ctx.fillStyle = stoneDark;
    ctx.fillRect(-2, -94 + crouchOffset + bob, 12, 3);
  }

  // --- PROJECTILES RENDERING ---
  private renderProjectiles(ctx: CanvasRenderingContext2D, projs: Projectile[]) {
    projs.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'carrito') {
        // MAMÁ LUCHA'S SHOPPING CART!
        const w = p.width;
        const h = p.height;

        // Metal wire basket
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.strokeRect(-w / 2, -h / 2, w, h * 0.75);

        // Wire grid lines inside cart
        ctx.lineWidth = 1;
        for (let gx = -w / 2 + 8; gx < w / 2; gx += 10) {
          ctx.beginPath();
          ctx.moveTo(gx, -h / 2);
          ctx.lineTo(gx, h * 0.25);
          ctx.stroke();
        }

        // Cart handle
        ctx.fillStyle = '#15803d'; // green handle
        ctx.fillRect(-w / 2 - 8, -h / 2 - 6, 8, 14);

        // Groceries flying in cart (Zote, Maseca, Frijoles)
        ctx.fillStyle = '#ec4899'; // pink Zote soap
        ctx.fillRect(-w / 2 + 6, -h / 2 + 4, 14, 10);
        ctx.fillStyle = '#dc2626'; // red beans can
        ctx.fillRect(-w / 2 + 22, -h / 2 + 2, 12, 14);
        ctx.fillStyle = '#facc15'; // yellow corn flour
        ctx.fillRect(-w / 2 + 36, -h / 2 + 5, 14, 12);

        // Wheels
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(-w / 2 + 10, h / 2 - 4, 6, 0, Math.PI * 2);
        ctx.arc(w / 2 - 10, h / 2 - 4, 6, 0, Math.PI * 2);
        ctx.fill();

        // Speed trail
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.fillRect(p.vx > 0 ? -w / 2 - 30 : w / 2, -h / 2 + 5, 30, h * 0.6);
      } else if (p.type === 'cempasuchil') {
        // CATRINA'S FLOWER TORBELLINO
        const spin = this.animTimer * 12;
        ctx.rotate(spin);

        // Glowing center
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Petals spinning around
        const numPetals = 8;
        for (let i = 0; i < numPetals; i++) {
          const a = (i * Math.PI * 2) / numPetals;
          ctx.fillStyle = i % 2 === 0 ? '#ea580c' : '#facc15';
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * 16, Math.sin(a) * 16, 12, 6, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      } else if (p.type === 'sombrero') {
        // CATRÍN'S SPINNING SOMBRERO BOOMERANG
        const spin = this.animTimer * 16;
        ctx.rotate(spin);

        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'taco_pina') {
        // TAQUERO'S FLYING PINEAPPLE WITH CHILI
        const spin = this.animTimer * 10;
        ctx.rotate(spin);

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red chili powder dusting
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-6, -4, 12, 8);
      } else if (p.type === 'tope') {
        // SANTO'S HEADBUTT DIVE
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'espada_z') {
        // ZORRO NEGRO: GLOWING 'Z' SLASH OF JUSTICE
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        // Draw Z
        ctx.moveTo(-18, -18);
        ctx.lineTo(18, -18);
        ctx.lineTo(-18, 18);
        ctx.lineTo(18, 18);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -18);
        ctx.lineTo(18, -18);
        ctx.lineTo(-18, 18);
        ctx.lineTo(18, 18);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (p.type === 'surfboard') {
        // DAFNE: SPINNING SAYULITA SURFBOARD
        const spin = this.animTimer * 12;
        ctx.rotate(spin);
        // Surfboard shape
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Yellow center racing stripe
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-28, -3, 56, 6);
        // Hibiscus pink flower dot
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(8, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'shuriken') {
        // GATO SOMBRA: GREEN SHADOW NINJA STAR
        const spin = this.animTimer * 18;
        ctx.rotate(spin);
        ctx.fillStyle = '#09090b';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
          ctx.lineTo(Math.cos(a + 0.39) * 6, Math.sin(a + 0.39) * 6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (p.type === 'murcielagos') {
        // CONDE CILINDRO: FLAPPING VAMPIRE BATS
        const flap = Math.sin(this.animTimer * 20) * 10;
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;

        // Bat 1
        ctx.beginPath();
        ctx.ellipse(-10, -5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-24, -15 + flap);
        ctx.lineTo(-14, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(4, -15 + flap);
        ctx.lineTo(-6, 0);
        ctx.fill();
        ctx.stroke();

        // Bat 2
        ctx.beginPath();
        ctx.ellipse(12, 6, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(12, 6);
        ctx.lineTo(0, -2 - flap);
        ctx.lineTo(8, 10);
        ctx.lineTo(12, 6);
        ctx.lineTo(24, -2 - flap);
        ctx.lineTo(16, 10);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'anubis_fire') {
        // SACERDOTISA: ANUBIS SACRED FIRE
        const spin = this.animTimer * 10;
        ctx.rotate(spin);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'roca') {
        // GUARDIÁN ANCESTRAL: CARVED GLYPH MONOLITH
        const spin = this.animTimer * 6;
        ctx.rotate(spin);
        ctx.fillStyle = '#78716c';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 10;
        ctx.strokeRect(-18, -14, 36, 28);
        ctx.fillRect(-18, -14, 36, 28);
        // Glyph
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    });
  }

  // --- PARTICLES (CEMPASÚCHIL, SPARKS, DUST) ---
  private renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      if (p.type === 'petal') {
        // Cempasúchil flower petal drifting
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'spark') {
        // Hit spark star
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.type === 'smoke') {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}
