import React from 'react';

interface StartMenuProps {
  isVisible: boolean;
  onStart: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isVisible, onStart }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center z-100">
      <div className="bg-[rgba(173,193,163,0.85)] text-[#1f2937] font-josefin p-8 px-12 rounded-xl shadow-lg border border-white/20">
        <h1 className="font-normal text-[2.25rem] mb-4">IsoCity</h1>
        <p className="font-light text-[1.1rem] mb-6">
          Hover: Pulsing Highlight | Hover Buildings: See-Through | Click/Drag:
          Place/Remove
        </p>
        <button
          id="startButton"
          onClick={onStart}
          className="bg-white/30 text-[#1f2937] font-normal py-3 px-6 rounded-md transition-colors hover:bg-white/50 text-base"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};
