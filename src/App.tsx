import React from 'react';
import { useState, useCallback } from 'react';
import { StartMenu } from './components/StartMenu';
import { MessageBox } from './components/MessageBox';
import { GameCanvas } from './components/GameCanvas';
import { gameManager } from './game/gameLogic';

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showQuitMessage, setShowQuitMessage] = useState(false);

  const handleStart = useCallback(() => {
    setIsGameStarted(true);
  }, []);

  const handleQuit = useCallback(() => {
    setShowQuitMessage(true);
  }, []);

  const handleConfirmQuit = useCallback(() => {
    gameManager.stopGame();
    setIsGameStarted(false);
    setShowQuitMessage(false);
  }, []);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    gameManager.initialize(canvas);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#f0f4f8] overflow-hidden m-0 p-0">
      <StartMenu isVisible={!isGameStarted} onStart={handleStart} />
      <div className="flex-grow flex justify-center items-center p-5">
        <GameCanvas
          isRunning={isGameStarted}
          onCanvasReady={handleCanvasReady}
        />
      </div>
      <MessageBox
        isVisible={showQuitMessage}
        title="Quit Game?"
        message="Are you sure?"
        onConfirm={handleConfirmQuit}
        onCancel={() => setShowQuitMessage(false)}
      />
    </div>
  );
}

export default App;
