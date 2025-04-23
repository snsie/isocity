export interface Tile {
  spriteIndex: number;
  currentAlpha: number;
  targetAlpha: number;
  isAnimating: boolean;
  animationProgress: number;
  animationType: string | null;
  disappearingSpriteIndex: number;
}

export interface HoveredTile {
  row: number;
  col: number;
}

export interface Cloud {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export interface AudioState {
  isPlaying: boolean;
  currentTrack: 1 | 2;
  audioDuration: number;
  crossfadePoint: number;
  fadeInInterval: number | null;
  crossfadeInterval: number | null;
}
