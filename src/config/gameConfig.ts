export const TILE_BASE_WIDTH = 64;
export const TILE_BASE_HEIGHT = 64;
export const TILE_ISO_WIDTH = TILE_BASE_WIDTH;
export const TILE_ISO_HEIGHT = TILE_BASE_WIDTH / 2;
export const GRID_COLS = 10;
export const GRID_ROWS = 10;
// export const SPRITE_SHEET_URL =
//   'src/assets/ChatGPT Image Apr 23, 2025, 07_49_52 PM.png';

export const SPRITE_SHEET_URL =
  'src/assets/b244787d-e031-4f51-b177-175c13d354a2.png'; // Updated URL for the sprite sheet
// export const SPRITE_SHEET_URL = 'https://i.imgur.com/TthFDvD.png';
export const SPRITE_COLS = 16;
export const SPRITE_ROWS = 16;
export const TOTAL_SPRITES = SPRITE_COLS * SPRITE_ROWS;
export const HOVER_GLOW_COLOR = 'rgba(255, 255, 0, 0.7)';
export const HOVER_GLOW_BLUR = 10;
export const OBSCURING_FRONT_ALPHA_MIN = 0.3;
export const OBSCURING_FRONT_MAX_DIST = 3;
export const OBSCURING_BEHIND_ALPHA_MIN = 0.7;
export const OBSCURING_BEHIND_MAX_DIST = 2;
export const ALPHA_ANIMATION_SPEED = 0.15;
export const TILE_HIGHLIGHT_GLOW_COLOR = '#FFFF00';
export const TILE_HIGHLIGHT_LINE_COLOR = '#FFFFFF';
export const TILE_HIGHLIGHT_LINE_WIDTH = 1;
export const TILE_HIGHLIGHT_MAX_BLUR = 8;
export const TILE_HIGHLIGHT_PULSE_SPEED = 0.05;
export const TILE_DEFAULT_STROKE_COLOR = '#78887b';
export const TILE_DEFAULT_LINE_WIDTH = 1;
export const TILE_GRADIENT_TOP_COLOR = '#c1d1b9';
export const TILE_GRADIENT_BOTTOM_COLOR = '#99b18d';
export const HAZE_COLOR = 'rgba(230, 235, 240, 0.08)';
export const TOOLBAR_HEIGHT = 50;
export const TOOLBAR_COLOR = 'rgba(173, 193, 163, 0.65)';
export const TOOLBAR_TEXT_COLOR = '#1f2937';
export const TOOLBAR_FONT = "300 16px 'Josefin Sans', sans-serif";
export const TOOLBAR_TITLE_FONT = "400 18px 'Josefin Sans', sans-serif";
export const BUTTON_COLOR = 'rgba(255, 255, 255, 0.3)';
export const BUTTON_HOVER_COLOR = 'rgba(255, 255, 255, 0.5)';
export const BUTTON_PADDING = 8;
export const BUILDING_ANIM_SPEED = 0.08;
export const BUILDING_ANIM_OFFSET_Y = 12;
// Audio Configuration
export const MUSIC_FADE_IN_DURATION = 3000; // Fade in duration in milliseconds
export const MUSIC_VOLUME = 0.7; // Maximum volume (0.0 to 1.0)
export const CROSSFADE_DURATION = 500; // Crossfade duration in milliseconds (reduced for tighter loop)
// Cloud Config
export const CLOUD_COUNT = 12;
export const CLOUD_COLOR = 'rgba(255, 255, 255, 0.2)';
export const CLOUD_MIN_RX = 40;
export const CLOUD_MAX_RX = 80;
export const CLOUD_MIN_RY = 15;
export const CLOUD_MAX_RY = 30;
export const CLOUD_MIN_SPEED = 0.1;
export const CLOUD_MAX_SPEED = 0.4;
export const CLOUD_MIN_OPACITY = 0.1;
export const CLOUD_MAX_OPACITY = 0.35;
// ** NEW ** Cloud Y Position Range (relative to canvas height)
export const CLOUD_MIN_Y_FACTOR = 0.25; // Start clouds lower (e.g., 25% down)
export const CLOUD_MAX_Y_FACTOR = 0.65; // Allow clouds lower (e.g., down to 65%)

export const TILE_HIGHLIGHT_GLOW_BLUR = 10;
