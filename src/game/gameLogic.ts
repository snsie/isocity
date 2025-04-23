import { Cloud } from '../types/game';

// Game Configuration
export const TILE_BASE_WIDTH = 64;
export const TILE_BASE_HEIGHT = 64;
export const TILE_ISO_WIDTH = TILE_BASE_WIDTH;
export const TILE_ISO_HEIGHT = TILE_BASE_WIDTH / 2;
export const GRID_COLS = 10;
export const GRID_ROWS = 10;
export const SPRITE_SHEET_URL = 'https://i.imgur.com/TthFDvD.png';
export const SPRITE_COLS = 4;
export const SPRITE_ROWS = 4;
export const CLOUD_COUNT = 12;
export const TOTAL_SPRITES = SPRITE_COLS * SPRITE_ROWS;
// const TILE_HIGHLIGHT_GLOW_COLOR = '#FFFF00';
// const TILE_HIGHLIGHT_LINE_COLOR = '#FFFFFF';
// const TILE_HIGHLIGHT_LINE_WIDTH = 1;
// const TILE_HIGHLIGHT_MAX_BLUR = 8;
const TILE_HIGHLIGHT_PULSE_SPEED = 0.05;
const BUILDING_ANIM_SPEED = 0.08;
const BUILDING_ANIM_OFFSET_Y = 12;
const OBSCURING_FRONT_ALPHA_MIN = 0.3;
const OBSCURING_FRONT_MAX_DIST = 3;
const OBSCURING_BEHIND_ALPHA_MIN = 0.7;
const OBSCURING_BEHIND_MAX_DIST = 2;
const ALPHA_ANIMATION_SPEED = 0.15;

// Other constants from test.html...

interface GameState {
  isGameRunning: boolean;
  grid: Array<
    Array<{
      spriteIndex: number;
      currentAlpha: number;
      targetAlpha: number;
      isAnimating: boolean;
      animationProgress: number;
      animationType: null;
      disappearingSpriteIndex: number;
    }>
  >;
  hoveredTile: { row: number; col: number };
  clouds: Cloud[];
  pulseTime: number;
  // Add other state properties...
}
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class GameManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private state: GameState;
  private spriteSheet: HTMLImageElement;
  private animationFrameId: number | null = null;
  private canvasOriginX: number = 0;
  private canvasOriginY: number = 0;

  constructor() {
    this.state = {
      isGameRunning: false,
      grid: [],
      hoveredTile: { row: -1, col: -1 },
      clouds: [],
      pulseTime: 0,
      // Initialize other state...
    };

    this.spriteSheet = new Image();
    this.spriteSheet.src = SPRITE_SHEET_URL;
  }

  public initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // Other initialization...
  }

  public startGame() {
    console.log('Starting game...');
    if (this.state.isGameRunning) return;
    this.state.isGameRunning = true;
    this.state.grid = Array(GRID_ROWS)
      .fill(null)
      .map(() =>
        Array(GRID_COLS)
          .fill(null)
          .map(() => ({
            spriteIndex: -1,
            currentAlpha: 1.0,
            targetAlpha: 1.0,
            isAnimating: false,
            animationProgress: 0,
            animationType: null,
            disappearingSpriteIndex: -1,
          }))
      );
    this.state.hoveredTile = { row: -1, col: -1 };
    this.resizeCanvas();
    this.initializeClouds();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public stopGame() {
    this.state.isGameRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // Clean up other resources...
  }

  private gameLoop = () => {
    if (!this.state.isGameRunning) {
      this.animationFrameId = null;
      return;
    }

    this.state.pulseTime += TILE_HIGHLIGHT_PULSE_SPEED;
    const pulseFactor = (Math.sin(this.state.pulseTime) + 1) / 2;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!this.state.grid[r]?.[c]) continue;
        const tile = this.state.grid[r][c];
        if (!tile.isAnimating) {
          if (Math.abs(tile.currentAlpha - tile.targetAlpha) > 0.01) {
            tile.currentAlpha +=
              (tile.targetAlpha - tile.currentAlpha) * ALPHA_ANIMATION_SPEED;
            if (Math.abs(tile.currentAlpha - tile.targetAlpha) <= 0.01)
              tile.currentAlpha = tile.targetAlpha;
          } else if (tile.currentAlpha !== tile.targetAlpha) {
            tile.currentAlpha = tile.targetAlpha;
          }
        }
        if (tile.isAnimating) {
          tile.animationProgress += BUILDING_ANIM_SPEED;
          if (tile.animationProgress >= 1) {
            tile.animationProgress = 1;
            tile.isAnimating = false;
            if (tile.animationType === 'disappear') {
              tile.spriteIndex = -1;
              tile.disappearingSpriteIndex = -1;
            }
            tile.animationType = null;
          }
        }
      }
    }
    this.updateClouds(); // Update cloud positions
    drawGrid(pulseFactor);

    // Game loop logic from test.html...

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  public initializeGrid() {
    this.state.grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.state.grid[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.state.grid[r][c] = {
          spriteIndex: -1,
          currentAlpha: 1.0,
          targetAlpha: 1.0,
          isAnimating: false,
          animationProgress: 0,
          animationType: null,
          disappearingSpriteIndex: -1,
        };
      }
    }
    this.state.hoveredTile = { row: -1, col: -1 };
    this.state.pulseTime = 0;
  }
  public updateClouds() {
    // Ensure canvas dimensions are available for wrapping logic
    if (!this.canvas) return;

    if (this.canvas.width === 0 || this.canvas.height === 0) return;

    const minY = this.canvas.height * CLOUD_MIN_Y_FACTOR; // Calculate based on factors
    const maxY = this.canvas.height * CLOUD_MAX_Y_FACTOR;

    this.state.clouds.forEach((cloud) => {
      cloud.x += cloud.speedX;
      // Wrap around logic
      if (cloud.speedX > 0 && cloud.x - cloud.radiusX > this.canvas.width) {
        cloud.x = -cloud.radiusX;
        cloud.y = randomRange(minY, maxY); // Use new Y range on wrap
      } else if (cloud.speedX < 0 && cloud.x + cloud.radiusX < 0) {
        cloud.x = this.canvas.width + cloud.radiusX;
        cloud.y = randomRange(minY, maxY); // Use new Y range on wrap
      }
    });
  }
  public drawTile(row: number, col: number): void {
    if (!this.ctx || !this.state.grid[row]?.[col]) {
      return;
    }
    const tileData = this.state.grid[row][col];
    const spriteIndex = tileData.spriteIndex;
    const hoverAlpha = tileData.currentAlpha;
    const isBuildingAnimating = tileData.isAnimating;
    const animProgress = tileData.animationProgress;
    const animType = tileData.animationType;
    const { x: screenX, y: screenY } = this.isoToScreen(row, col);
    const hr = this.state.hoveredTile.row;
    const hc = this.state.hoveredTile.col;
    const isCurrentlyHoveredTile = row === hr && col === hc;
    const hoveredTileHasBuilding =
      hr !== -1 && hc !== -1 && this.state.grid[hr]?.[hc]?.spriteIndex !== -1;
    const buildingEffectsActive =
      hoveredTileHasBuilding && !this.isDraggingLeft && !this.isDraggingRight;
    const applyBuildingGlow = isCurrentlyHoveredTile && buildingEffectsActive;
    const orig = {
      a: this.ctx.globalAlpha,
      ss: this.ctx.strokeStyle,
      lw: this.ctx.lineWidth,
      sc: this.ctx.shadowColor,
      sb: this.ctx.shadowBlur,
      co: this.ctx.globalCompositeOperation,
      fs: this.ctx.fillStyle,
    };
    const gradient = this.ctx.createLinearGradient(
      screenX,
      screenY - TILE_ISO_HEIGHT / 2,
      screenX,
      screenY + TILE_ISO_HEIGHT / 2
    );
    gradient.addColorStop(0, this.TILE_GRADIENT_TOP_COLOR);
    gradient.addColorStop(1, this.TILE_GRADIENT_BOTTOM_COLOR);
    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = this.TILE_DEFAULT_STROKE_COLOR;
    this.ctx.lineWidth = this.TILE_DEFAULT_LINE_WIDTH;
    this.ctx.globalAlpha =
      spriteIndex !== -1 && buildingEffectsActive ? hoverAlpha : 1.0;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY + TILE_ISO_HEIGHT / 2);
    this.ctx.lineTo(screenX + TILE_ISO_WIDTH / 2, screenY);
    this.ctx.lineTo(screenX, screenY - TILE_ISO_HEIGHT / 2);
    this.ctx.lineTo(screenX - TILE_ISO_WIDTH / 2, screenY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.strokeStyle = orig.ss;
    this.ctx.lineWidth = orig.lw;
    this.ctx.globalAlpha = orig.a;
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = orig.fs;
    if (
      (spriteIndex !== -1 ||
        (isBuildingAnimating && animType === 'disappear')) &&
      this.spriteSheet?.complete
    ) {
      const indexToDraw =
        isBuildingAnimating && animType === 'disappear'
          ? tileData.disappearingSpriteIndex
          : spriteIndex;
      if (indexToDraw === -1) return;
      const spriteCoords = this.getSpriteCoords(indexToDraw);
      if (spriteCoords) {
        const destX = screenX - TILE_BASE_WIDTH / 2;
        const baseY = screenY - TILE_BASE_HEIGHT + TILE_ISO_HEIGHT / 2;
        let offsetY = 0;
        let buildingAlpha = 1.0;
        if (isBuildingAnimating) {
          if (animType === 'appear') {
            const eP = this.easeOutQuad(animProgress);
            offsetY = BUILDING_ANIM_OFFSET_Y * (1 - eP);
            buildingAlpha = animProgress;
          } else {
            const eP = this.easeInQuad(animProgress);
            offsetY = BUILDING_ANIM_OFFSET_Y * eP;
            buildingAlpha = 1.0 - animProgress;
          }
          buildingAlpha = Math.max(0, buildingAlpha);
        } else {
          buildingAlpha = buildingEffectsActive ? hoverAlpha : 1.0;
        }
        const finalDestY = baseY + offsetY;
        this.ctx.globalAlpha = buildingAlpha;
        if (
          applyBuildingGlow &&
          !(isBuildingAnimating && animType === 'disappear')
        ) {
          this.ctx.shadowColor = this.HOVER_GLOW_COLOR;
          this.ctx.shadowBlur = this.HOVER_GLOW_BLUR;
        } else {
          this.ctx.shadowColor = 'transparent';
          this.ctx.shadowBlur = 0;
        }
        this.ctx.drawImage(
          this.spriteSheet,
          spriteCoords.sx,
          spriteCoords.sy,
          TILE_BASE_WIDTH,
          TILE_BASE_HEIGHT,
          destX,
          finalDestY,
          TILE_BASE_WIDTH,
          TILE_BASE_HEIGHT
        );
        this.ctx.shadowColor = orig.sc;
        this.ctx.shadowBlur = orig.sb;
        this.ctx.globalCompositeOperation = orig.co;
        this.ctx.fillStyle = orig.fs;
        this.ctx.globalAlpha = orig.a;
      }
    }
  }

  public drawGrid(pulseFactor: number): void {
    if (!this.state.isGameRunning || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.state.grid[r]) {
          this.drawTile(r, c);
        }
      }
    }

    this.drawClouds();

    const hr = this.state.hoveredTile.row;
    const hc = this.state.hoveredTile.col;

    if (hr !== -1 && hc !== -1) {
      const { x: sX, y: sY } = this.isoToScreen(hr, hc);
      const hasB = this.state.grid[hr]?.[hc]?.spriteIndex !== -1;

      const orig = {
        ss: this.ctx.strokeStyle,
        lw: this.ctx.lineWidth,
        sc: this.ctx.shadowColor,
        sb: this.ctx.shadowBlur,
      };

      const blur = pulseFactor * TILE_HIGHLIGHT_MAX_BLUR;
      this.ctx.shadowColor = TILE_HIGHLIGHT_GLOW_COLOR;
      this.ctx.shadowBlur = blur;
      this.ctx.strokeStyle = TILE_HIGHLIGHT_LINE_COLOR;
      this.ctx.lineWidth = TILE_HIGHLIGHT_LINE_WIDTH;

      this.ctx.beginPath();
      if (hasB) {
        this.ctx.moveTo(sX - TILE_ISO_WIDTH / 2, sY);
        this.ctx.lineTo(sX, sY + TILE_ISO_HEIGHT / 2);
        this.ctx.lineTo(sX + TILE_ISO_WIDTH / 2, sY);
      } else {
        this.ctx.moveTo(sX, sY + TILE_ISO_HEIGHT / 2);
        this.ctx.lineTo(sX + TILE_ISO_WIDTH / 2, sY);
        this.ctx.lineTo(sX, sY - TILE_ISO_HEIGHT / 2);
        this.ctx.lineTo(sX - TILE_ISO_WIDTH / 2, sY);
        this.ctx.closePath();
      }
      this.ctx.stroke();

      this.ctx.strokeStyle = orig.ss;
      this.ctx.lineWidth = orig.lw;
      this.ctx.shadowColor = orig.sc;
      this.ctx.shadowBlur = orig.sb;
    }

    this.drawToolbar();

    const origFill = this.ctx.fillStyle;
    this.ctx.fillStyle = HAZE_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = origFill;
  }

  public resizeCanvas() {
    if (!this.canvas) return;

    const container = this.canvas.parentElement;
    if (!container) return;

    const availableWidth = container.clientWidth - 40;
    const availableHeight = container.clientHeight - 40;

    const requiredWidth =
      ((GRID_COLS + GRID_ROWS) * TILE_ISO_WIDTH) / 2 + TILE_ISO_WIDTH;
    const requiredHeight =
      TILE_BASE_HEIGHT +
      ((GRID_COLS + GRID_ROWS) * TILE_ISO_HEIGHT) / 2 +
      TILE_ISO_HEIGHT +
      20;

    this.canvas.width = Math.max(600, availableWidth);
    this.canvas.height = Math.max(500, availableHeight);

    // Update canvas origin for centered rendering
    const canvasOriginX = this.canvas.width / 2;
    const topMargin = 50 + 40; // TOOLBAR_HEIGHT + padding
    const canvasOriginY = Math.max(
      topMargin +
        (this.canvas.height - topMargin) / 2 -
        requiredHeight / 2 +
        TILE_BASE_HEIGHT,
      TILE_BASE_HEIGHT + 50 + 10 // TILE_BASE_HEIGHT + TOOLBAR_HEIGHT + padding
    );

    // Store these values in state or as class properties if needed for rendering
    this.canvasOriginX = canvasOriginX;
    this.canvasOriginY = canvasOriginY;
  }

  private initializeClouds() {
    if (!this.canvas) return;

    const minY = this.canvas.height * 0.25; // CLOUD_MIN_Y_FACTOR
    const maxY = this.canvas.height * 0.65; // CLOUD_MAX_Y_FACTOR

    this.state.clouds = Array<Cloud>(CLOUD_COUNT)
      .fill(null)
      .map(() => ({
        x: this.randomRange(
          -this.canvas!.width * 0.2,
          this.canvas!.width * 1.2
        ),
        y: this.randomRange(minY, maxY),
        radiusX: this.randomRange(40, 80), // CLOUD_MIN_RX, CLOUD_MAX_RX
        radiusY: this.randomRange(15, 30), // CLOUD_MIN_RY, CLOUD_MAX_RY
        opacity: this.randomRange(0.1, 0.35), // CLOUD_MIN_OPACITY, CLOUD_MAX_OPACITY
        speedX: this.randomRange(0.1, 0.4) * (Math.random() < 0.5 ? 1 : -1), // CLOUD_MIN_SPEED, CLOUD_MAX_SPEED
      }));
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

export const gameManager = new GameManager();
