import { FC } from 'react';

interface MessageBoxProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MessageBox: FC<MessageBoxProps> = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        className="bg-[rgba(173,193,163,0.9)] text-[#1f2937] font-josefin p-6 px-12 
                    rounded-lg shadow-xl z-110 text-center border border-white/15"
      >
        <h2 className="mt-0 font-normal text-2xl mb-2.5">{title}</h2>
        <p className="font-light text-base mb-5">{message}</p>
        <div className="space-x-2">
          <button
            id="confirmButton"
            onClick={onConfirm}
            className="font-normal px-4.5 py-2 rounded-md transition-all duration-300
                       bg-[rgba(220,53,69,0.7)] text-white hover:bg-[rgba(220,53,69,0.9)] 
                       shadow-sm hover:shadow-md"
          >
            Yes, Quit
          </button>
          <button
            id="cancelButton"
            onClick={onCancel}
            className="font-normal px-4.5 py-2 rounded-md transition-all duration-300
                       bg-white/30 text-[#1f2937] hover:bg-white/50 
                       shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
