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

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      gameManager.stopGame();
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
