export interface Tile {
  spriteIndex: number;
  currentAlpha: number;
  targetAlpha: number;
  isAnimating: boolean;
  animationProgress: number;
  animationType: 'appear' | 'disappear' | null;
  disappearingSpriteIndex: number;
}

export interface Cloud {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  opacity: number;
  speedX: number;
}

export interface ToolbarElement {
  x: number;
  y: number;
  width: number;
  height: number;
}
