import { useEffect, useRef } from 'react';
import { gameManager } from '../game/gameLogic';

interface GameCanvasProps {
  isRunning: boolean;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    gameManager.initialize(canvas);

    const handleResize = () => {
      if (canvas) {
        gameManager.resizeCanvas();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!gameManager) return;
      const r = canvas.getBoundingClientRect();
      const x = event.clientX - r.left;
      const y = event.clientY - r.top;
      gameManager.state.lastDraggedTile = { row: -1, col: -1 };
      if (
        gameManager.isPointInRect(x, y, gameManager.state.toolbarElements.quit)
      ) {
        gameManager.quitGame();
        return;
      }
      if (event.button === 0) {
        gameManager.state.isDraggingLeft = true;
        gameManager.state.isDraggingRight = false;
        gameManager.modifyTile(x, y, 'place');
      } else if (event.button === 2) {
        gameManager.state.isDraggingRight = true;
        gameManager.state.isDraggingLeft = false;
        gameManager.modifyTile(x, y, 'remove');
      }
      if (
        gameManager.state.isDraggingLeft ||
        gameManager.state.isDraggingRight
      ) {
        gameManager.state.hoveredTile = { row: -1, col: -1 };
        gameManager.updateTargetAlphas();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!gameManager.state.isGameRunning) return;
      const r = canvas.getBoundingClientRect();
      const x = event.clientX - r.left;
      const y = event.clientY - r.top;
      gameManager.updateHover(x, y);
      if (
        gameManager.state.isDraggingLeft ||
        gameManager.state.isDraggingRight
      ) {
        const action = gameManager.state.isDraggingRight ? 'remove' : 'place';
        gameManager.modifyTile(x, y, action);
      }
    };
    // canvas.addEventListener('mousemove', (event) => {

    // });

    const handleMouseUp = () => {
      gameManager.stopDragging();
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameManager.stopGame();
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      gameManager.startGame();
    } else {
      gameManager.stopGame();
    }
  }, [isRunning]);

  return (
    <canvas
      ref={canvasRef}
      className="block bg-gradient-to-br from-[#c1e8e1] to-[#dcedc1] cursor-pointer rounded-lg shadow-lg select-none"
    />
  );
};
