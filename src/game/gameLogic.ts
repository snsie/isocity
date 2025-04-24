import { Cloud } from '../types/game';
import {
  SPRITE_SHEET_URL,
  GRID_ROWS,
  GRID_COLS,
  TILE_ISO_WIDTH,
  TILE_ISO_HEIGHT,
  TILE_BASE_WIDTH,
  TILE_BASE_HEIGHT,
  TILE_HIGHLIGHT_PULSE_SPEED,
  TILE_HIGHLIGHT_MAX_BLUR,
  TILE_HIGHLIGHT_GLOW_COLOR,
  TILE_HIGHLIGHT_LINE_COLOR,
  TILE_HIGHLIGHT_LINE_WIDTH,
  CLOUD_MIN_Y_FACTOR,
  CLOUD_MAX_Y_FACTOR,
  CLOUD_COUNT,
  HAZE_COLOR,
  BUILDING_ANIM_SPEED,
  BUILDING_ANIM_OFFSET_Y,
  ALPHA_ANIMATION_SPEED,
  TOOLBAR_HEIGHT,
  BUTTON_PADDING,
  TOOLBAR_FONT,
  TOTAL_SPRITES,
  SPRITE_COLS,
  TILE_GRADIENT_TOP_COLOR,
  TILE_GRADIENT_BOTTOM_COLOR,
  TILE_DEFAULT_STROKE_COLOR,
  TILE_DEFAULT_LINE_WIDTH,
  HOVER_GLOW_BLUR,
  HOVER_GLOW_COLOR,
  TOOLBAR_TITLE_FONT,
  TOOLBAR_TEXT_COLOR,
  TOOLBAR_COLOR,
  BUTTON_HOVER_COLOR,
  BUTTON_COLOR,
  OBSCURING_FRONT_MAX_DIST, // Added import
  OBSCURING_FRONT_ALPHA_MIN, // Added import
  OBSCURING_BEHIND_MAX_DIST, // Added import
  OBSCURING_BEHIND_ALPHA_MIN, // Added import
} from '../config/gameConfig';

interface GameState {
  isGameRunning: boolean;
  grid: Array<
    Array<{
      spriteIndex: number;
      currentAlpha: number;
      targetAlpha: number;
      isAnimating: boolean;
      animationProgress: number;
      animationType: null | string;
      disappearingSpriteIndex: number;
    }>
  >;
  hoveredTile: { row: number; col: number };
  clouds: Cloud[];
  pulseTime: number;
  toolbarElements: {
    quit: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  isHoveringQuit: boolean;
  isDraggingLeft: boolean;
  isDraggingRight: boolean;
  isHoveringToolbar: boolean;
  lastDraggedTile: { row: number; col: number };
  lastHoveredTile: { row: number; col: number };
  lastClickedTile: { row: number; col: number };
  lastClickedTileSpriteIndex: number;
  lastClickedTileAlpha: number;
  lastClickedTileAnimationType: string | null;
  lastClickedTileAnimationProgress: number;
  lastClickedTileDisappearingSpriteIndex: number;
  lastClickedTileIsAnimating: boolean;
  lastClickedTileCurrentAlpha: number;
  lastClickedTileTargetAlpha: number;
  lastClickedTileIsBuilding: boolean;
  lastClickedTileIsObscured: boolean;
  lastClickedTileIsHovered: boolean;
  lastClickedTileIsSelected: boolean;
  lastClickedTileIsInToolbar: boolean;
  lastClickedTileIsInGrid: boolean;
  lastClickedTileIsInCloud: boolean;
  lastClickedTileIsInFog: boolean;
  lastClickedTileIsInShadow: boolean;
  lastClickedTileIsInLight: boolean;
  lastClickedTileIsInWater: boolean;
  lastClickedTileIsInFire: boolean;
  // Add other state properties...
}
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class GameManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  state: GameState;
  spriteSheet: HTMLImageElement;
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
      toolbarElements: {
        quit: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      },
      isHoveringQuit: false,
      isDraggingLeft: false,
      isDraggingRight: false,
      isHoveringToolbar: false,
      lastDraggedTile: { row: -1, col: -1 },
      lastHoveredTile: { row: -1, col: -1 },
      lastClickedTile: { row: -1, col: -1 },
      lastClickedTileSpriteIndex: -1,
      lastClickedTileAlpha: 1.0,
      lastClickedTileAnimationType: null,
      lastClickedTileAnimationProgress: 0,
      lastClickedTileDisappearingSpriteIndex: -1,
      lastClickedTileIsAnimating: false,
      lastClickedTileCurrentAlpha: 1.0,
      lastClickedTileTargetAlpha: 1.0,
      lastClickedTileIsBuilding: false,
      lastClickedTileIsObscured: false,
      lastClickedTileIsHovered: false,
      lastClickedTileIsSelected: false,
      lastClickedTileIsInToolbar: false,
      lastClickedTileIsInGrid: false,
      lastClickedTileIsInCloud: false,
      lastClickedTileIsInFog: false,
      lastClickedTileIsInShadow: false,
      lastClickedTileIsInLight: false,
      lastClickedTileIsInWater: false,
      lastClickedTileIsInFire: false,

      // Initialize other state properties...
      // Initialize other state...
    };

    this.spriteSheet = new Image();
    this.spriteSheet.src = SPRITE_SHEET_URL;
  }
  public isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  public updateTargetAlphas() {
    if (!this.state.isGameRunning) return; // Fixed: Use this.state
    const hr = this.state.hoveredTile.row; // Fixed: Use this.state
    const hc = this.state.hoveredTile.col; // Fixed: Use this.state
    const hasB =
      hr !== -1 && hc !== -1 && this.state.grid[hr]?.[hc]?.spriteIndex !== -1; // Fixed: Use this.state
    const active =
      hasB && !this.state.isDraggingLeft && !this.state.isDraggingRight; // Fixed: Use this.state
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!this.state.grid[r]?.[c]) continue; // Fixed: Use this.state
        let target = 1.0;
        const isH = r === hr && c === hc;
        if (active && !isH) {
          if (r >= hr && c >= hc) {
            const d = r - hr + (c - hc);
            if (d > 0 && d <= OBSCURING_FRONT_MAX_DIST)
              target = this.calculateAlpha(
                // Fixed: Use this.
                d,
                OBSCURING_FRONT_MAX_DIST,
                OBSCURING_FRONT_ALPHA_MIN
              );
          } else if (r <= hr && c <= hc) {
            const d = hr - r + (hc - c);
            if (d > 0 && d <= OBSCURING_BEHIND_MAX_DIST)
              target = this.calculateAlpha(
                // Fixed: Use this.
                d,
                OBSCURING_BEHIND_MAX_DIST,
                OBSCURING_BEHIND_ALPHA_MIN
              );
          }
        }
        this.state.grid[r][c].targetAlpha = target; // Fixed: Use this.state
      }
    }
  }
  public quitGame() {
    if (this.state.isGameRunning) {
      this.stopGame();
    }
    this.state.isHoveringQuit = false; // Fixed: Use this.state
    this.state.hoveredTile = { row: -1, col: -1 }; // Fixed: Use this.state
    this.updateTargetAlphas(); // Fixed: Use this.
  }
  // public showMessage(title, text, onConfirm) {
  //   /* ... (no changes) ... */ if (
  //     !messageBox ||
  //     !messageTitle ||
  //     !messageText ||
  //     !confirmButton ||
  //     !cancelButton
  //   ) {
  //     console.error('Message box elements missing');
  //     alert(`${title}\n${text}`);
  //     if (onConfirm) onConfirm();
  //     return;
  //   }
  //   messageTitle.textContent = title;
  //   messageText.textContent = text;
  //   messageBox.style.display = 'block';
  //   const nC = confirmButton.cloneNode(true);
  //   confirmButton.replaceWith(nC);
  //   confirmButton = nC;
  //   const nX = cancelButton.cloneNode(true);
  //   cancelButton.replaceWith(nX);
  //   cancelButton = nX;
  //   confirmButton.onclick = () => {
  //     messageBox.style.display = 'none';
  //     if (onConfirm) onConfirm();
  //   };
  //   cancelButton.onclick = () => {
  //     messageBox.style.display = 'none';
  //   };
  // }

  // public quitGame() {
  //   if (!this.state.isGameRunning) return; // Fixed: Use this.state

  //   // Ensure showMessage is available (injected or imported)
  //   this.showMessage('Quit Game?', 'Are you sure?', () => {
  //     // Fixed: Use this.showMessage (assuming it's provided)
  //     this.state.isGameRunning = false; // Fixed: Use this.state
  //     if (this.animationFrameId) {
  //       // Fixed: Use this.
  //       cancelAnimationFrame(this.animationFrameId); // Fixed: Use this.
  //       this.animationFrameId = null; // Fixed: Use this.
  //       console.log('Loop stopped.');
  //     }
  //     this.state.isDraggingLeft = false; // Fixed: Use this.state
  //     this.state.isDraggingRight = false; // Fixed: Use this.state
  //     this.state.hoveredTile = { row: -1, col: -1 }; // Fixed: Use this.state

  //     // Ensure startMenu is available and initialized
  //     if (this.startMenu) {
  //       // Fixed: Use this.startMenu
  //       this.startMenu.style.display = 'flex';
  //     } else {
  //       console.warn('startMenu element not found or initialized.');
  //     }

  //     if (this.ctx && this.canvas) {
  //       // Fixed: Use this.ctx and this.canvas
  //       this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Fixed: Use this.canvas
  //     }

  //     // Stop the music and clean up - Ensure audio elements and state are managed correctly
  //     if (
  //       this.backgroundMusic1 &&
  //       this.backgroundMusic2 &&
  //       this.backgroundMusic1.parentNode &&
  //       this.backgroundMusic2.parentNode
  //     ) {
  //       // Fixed: Use this. and check parentNode
  //       // Stop both audio tracks
  //       this.backgroundMusic1.pause(); // Fixed: Use this.
  //       this.backgroundMusic2.pause(); // Fixed: Use this.

  //       // Reset positions and volumes
  //       this.backgroundMusic1.currentTime = 0; // Fixed: Use this.
  //       this.backgroundMusic2.currentTime = 0; // Fixed: Use this.
  //       this.backgroundMusic1.volume = 0; // Fixed: Use this.
  //       this.backgroundMusic2.volume = 0; // Fixed: Use this.

  //       // Create clones to remove all event listeners
  //       const oldAudio1 = this.backgroundMusic1; // Fixed: Use this.
  //       const oldAudio2 = this.backgroundMusic2; // Fixed: Use this.
  //       const newAudio1 = oldAudio1.cloneNode(true) as HTMLAudioElement; // Added type assertion
  //       const newAudio2 = oldAudio2.cloneNode(true) as HTMLAudioElement; // Added type assertion

  //       // Replace the elements
  //       oldAudio1.parentNode.replaceChild(newAudio1, oldAudio1);
  //       oldAudio2.parentNode.replaceChild(newAudio2, oldAudio2);

  //       // Update references
  //       this.backgroundMusic1 = newAudio1; // Fixed: Use this.
  //       this.backgroundMusic2 = newAudio2; // Fixed: Use this.

  //       // Clear any active intervals
  //       if (this.audioState.fadeInInterval) {
  //         // Fixed: Use this.audioState
  //         clearInterval(this.audioState.fadeInInterval); // Fixed: Use this.audioState
  //         this.audioState.fadeInInterval = null; // Fixed: Use this.audioState
  //       }

  //       if (this.audioState.crossfadeInterval) {
  //         // Fixed: Use this.audioState
  //         clearInterval(this.audioState.crossfadeInterval); // Fixed: Use this.audioState
  //         this.audioState.crossfadeInterval = null; // Fixed: Use this.audioState
  //       }

  //       // Reset audio state
  //       this.audioState.isPlaying = false; // Fixed: Use this.audioState
  //       this.audioState.currentTrack = 1; // Fixed: Use this.audioState
  //     } else {
  //       console.warn(
  //         'Audio elements or their parent nodes not found/initialized for cleanup.'
  //       );
  //     }
  //   });
  // }
  public updateHover(screenX: number, screenY: number) {
    this.state.isHoveringQuit = this.isPointInRect(
      // Fixed: Use this.state and this.
      screenX,
      screenY,
      this.state.toolbarElements.quit
    );
    if (screenY <= TOOLBAR_HEIGHT + 5) {
      if (
        this.state.hoveredTile.row !== -1 ||
        this.state.hoveredTile.col !== -1
      ) {
        this.state.hoveredTile = { row: -1, col: -1 };
        this.updateTargetAlphas(); // Fixed: Use this.
      }
      return;
    }
    if (
      !this.state.isGameRunning || // Fixed: Use this.state
      this.state.isDraggingLeft || // Fixed: Use this.state
      this.state.isDraggingRight // Fixed: Use this.state
    )
      return;
    const { row, col } = this.screenToIso(screenX, screenY); // Fixed: Use this.
    let hoverChanged = false;
    // const oldR = this.state.hoveredTile.row; // Fixed: Use this.state
    // const oldC = this.state.hoveredTile.col; // Fixed: Use this.state
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      if (
        this.state.hoveredTile.row !== row ||
        this.state.hoveredTile.col !== col
      ) {
        // Fixed: Use this.state
        this.state.hoveredTile = { row, col }; // Fixed: Use this.state
        hoverChanged = true;
      }
    } else {
      if (
        this.state.hoveredTile.row !== -1 ||
        this.state.hoveredTile.col !== -1
      ) {
        // Fixed: Use this.state
        this.state.hoveredTile = { row: -1, col: -1 }; // Fixed: Use this.state
        hoverChanged = true;
      }
    }
    if (hoverChanged) {
      this.updateTargetAlphas(); // Fixed: Use this.
    }
  }

  public stopDragging = (event?: MouseEvent) => {
    // Added optional event parameter type
    if (!this.canvas) {
      return;
    }
    if (this.state.isDraggingLeft || this.state.isDraggingRight) {
      this.state.isDraggingLeft = false;
      this.state.isDraggingRight = false;
      this.state.lastDraggedTile = { row: -1, col: -1 };
      if (event && this.state.isGameRunning) {
        const r = this.canvas.getBoundingClientRect();
        const x = event.clientX - r.left;
        const y = event.clientY - r.top;
        this.updateHover(x, y); // Fixed: Use this.
        this.updateTargetAlphas(); // Fixed: Use this.
      }
    }
  };

  public initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // Other initialization...
  }
  public modifyTile(
    screenX: number,
    screenY: number,
    action: 'place' | 'remove'
  ) {
    // Added type for action
    if (screenY <= TOOLBAR_HEIGHT + 5) return;
    if (!this.state.isGameRunning || !this.spriteSheet?.complete) return;
    const { row, col } = this.screenToIso(screenX, screenY);
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      if (!this.state.grid[row]?.[col]) return;
      if (
        !this.state.grid[row][col].isAnimating &&
        (row !== this.state.lastDraggedTile.row ||
          col !== this.state.lastDraggedTile.col) // Fixed: Use this.state
      ) {
        const tile = this.state.grid[row][col]; // Fixed: Use this.state
        if (action === 'place') {
          if (tile.spriteIndex === -1) {
            tile.spriteIndex = Math.floor(Math.random() * TOTAL_SPRITES);
            tile.isAnimating = true;
            tile.animationProgress = 0;
            tile.animationType = 'appear';
            tile.currentAlpha = 1.0;
            tile.targetAlpha = 1.0;
          }
        } else if (action === 'remove') {
          if (tile.spriteIndex !== -1) {
            tile.isAnimating = true;
            tile.animationProgress = 0;
            tile.animationType = 'disappear';
            tile.disappearingSpriteIndex = tile.spriteIndex;
            tile.currentAlpha = 1.0;
            tile.targetAlpha = 1.0;
          }
        }
        this.state.lastDraggedTile = { row, col }; // Fixed: Use this.state
      }
    } else {
      this.state.lastDraggedTile = { row: -1, col: -1 }; // Fixed: Use this.state
    }
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
    this.drawGrid(pulseFactor);

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
      if (!this.canvas) {
        return;
      }
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
  private isoToScreen(row, col) {
    const screenX = this.canvasOriginX + (col - row) * (TILE_ISO_WIDTH / 2);
    const screenY = this.canvasOriginY + (col + row) * (TILE_ISO_HEIGHT / 2);
    return { x: screenX, y: screenY };
  }
  private screenToIso(screenX, screenY) {
    const aX = screenX - this.canvasOriginX;
    const aY = screenY - this.canvasOriginY - TILE_ISO_HEIGHT / 4;
    const tX = aX / (TILE_ISO_WIDTH / 2);
    const tY = aY / (TILE_ISO_HEIGHT / 2);
    const row = Math.round((tY - tX) / 2);
    const col = Math.round((tX + tY) / 2);
    return { row, col };
  }
  public getSpriteCoords(spriteIndex) {
    if (spriteIndex < 0 || spriteIndex >= TOTAL_SPRITES) return null;
    const sx = (spriteIndex % SPRITE_COLS) * TILE_BASE_WIDTH;
    const sy = Math.floor(spriteIndex / SPRITE_COLS) * TILE_BASE_HEIGHT;
    return { sx, sy };
  }
  public calculateAlpha(dist, maxDist, minAlpha) {
    if (dist <= 0 || maxDist <= 0) return 1.0;
    const r = Math.max(1, maxDist - 1);
    const a = minAlpha + ((1.0 - minAlpha) * (dist - 1)) / r;
    return Math.max(minAlpha, Math.min(1.0, a));
  }
  public easeOutQuad(t) {
    return t * (2 - t);
  }
  public easeInQuad(t) {
    return t * t;
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
      hoveredTileHasBuilding &&
      !this.state.isDraggingLeft &&
      !this.state.isDraggingRight;
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
    gradient.addColorStop(0, TILE_GRADIENT_TOP_COLOR);
    gradient.addColorStop(1, TILE_GRADIENT_BOTTOM_COLOR);
    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = TILE_DEFAULT_STROKE_COLOR;
    this.ctx.lineWidth = TILE_DEFAULT_LINE_WIDTH;
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
          this.ctx.shadowColor = HOVER_GLOW_COLOR;
          this.ctx.shadowBlur = HOVER_GLOW_BLUR;
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

    const origFill = this.ctx.fillStyle;
    this.ctx.fillStyle = HAZE_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = origFill;
  }
  public drawToolbar() {
    if (!this.ctx || !this.canvas) return;

    // Import these from your config if not already:
    // TOOLBAR_COLOR, TOOLBAR_TITLE_FONT, TOOLBAR_TEXT_COLOR, BUTTON_HOVER_COLOR, BUTTON_COLOR

    const padding = 10;
    const buttonHeight = TOOLBAR_HEIGHT - 2 * BUTTON_PADDING;
    const quitText = 'Quit';
    this.ctx.font = TOOLBAR_FONT;
    const quitWidth = this.ctx.measureText(quitText).width + 2 * BUTTON_PADDING;
    this.state.toolbarElements.quit = {
      x: this.canvas.width - quitWidth - padding,
      y: BUTTON_PADDING,
      width: quitWidth,
      height: buttonHeight,
    };
    const origFill = this.ctx.fillStyle;
    const origStroke = this.ctx.strokeStyle;
    const origLineWidth = this.ctx.lineWidth;
    this.ctx.fillStyle = TOOLBAR_COLOR;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    if ('roundRect' in this.ctx) {
      (
        this.ctx as CanvasRenderingContext2D & {
          roundRect: (
            x: number,
            y: number,
            w: number,
            h: number,
            r: number
          ) => void;
        }
      ).roundRect(5, 5, this.canvas.width - 10, TOOLBAR_HEIGHT, 8);
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      (this.ctx as CanvasRenderingContext2D).fillRect(
        5,
        5,
        this.canvas.width - 10,
        TOOLBAR_HEIGHT
      );
      (this.ctx as CanvasRenderingContext2D).strokeRect(
        5,
        5,
        this.canvas.width - 10,
        TOOLBAR_HEIGHT
      );
    }
    this.ctx.font = TOOLBAR_TITLE_FONT;
    this.ctx.fillStyle = TOOLBAR_TEXT_COLOR;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('IsoCity', padding * 2, TOOLBAR_HEIGHT / 2 + 2);
    this.ctx.fillStyle = this.state.isHoveringQuit
      ? BUTTON_HOVER_COLOR
      : BUTTON_COLOR;
    this.ctx.beginPath();
    if ((this.ctx as any).roundRect) {
      (this.ctx as any).roundRect(
        this.state.toolbarElements.quit.x,
        this.state.toolbarElements.quit.y,
        this.state.toolbarElements.quit.width,
        this.state.toolbarElements.quit.height,
        5
      );
      this.ctx.fill();
    } else {
      this.ctx.fillRect(
        this.state.toolbarElements.quit.x,
        this.state.toolbarElements.quit.y,
        this.state.toolbarElements.quit.width,
        this.state.toolbarElements.quit.height
      );
    }
    this.ctx.font = TOOLBAR_FONT;
    this.ctx.fillStyle = TOOLBAR_TEXT_COLOR;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      quitText,
      this.state.toolbarElements.quit.x +
        this.state.toolbarElements.quit.width / 2,
      TOOLBAR_HEIGHT / 2 + 2
    );
    this.ctx.fillStyle = origFill;
    this.ctx.strokeStyle = origStroke;
    this.ctx.lineWidth = origLineWidth;
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

    this.state.clouds = Array.from({ length: CLOUD_COUNT }, () => ({
      x: this.randomRange(-this.canvas!.width * 0.2, this.canvas!.width * 1.2),
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
