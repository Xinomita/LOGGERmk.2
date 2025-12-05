import React, { useState } from 'react';

export default function FinalizeButton({ onFinalize, tokensRemaining = 3 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-black p-2">
      <button
        onClick={onFinalize}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={tokensRemaining <= 0}
        className={`w-full h-10 border-2 transition-all font-bold tracking-wider text-[11px] ${
          tokensRemaining > 0
            ? 'border-white text-white hover:bg-white hover:text-black'
            : 'border-gray-700 text-gray-700 cursor-not-allowed'
        }`}
      >
        {isHovered && tokensRemaining > 0 ? (
          <span>GENERATE AI REPORT</span>
        ) : (
          <span>FINALIZE STACK</span>
        )}
      </button>
      <div className="flex justify-between mt-1.5 px-1">
        <span className="text-[7px] text-gray-600">
          Comprehensive interaction analysis
        </span>
        <span className={`text-[7px] font-semibold ${
          tokensRemaining > 1 ? 'text-green-500' :
          tokensRemaining === 1 ? 'text-orange-500' : 'text-red-500'
        }`}>
          {tokensRemaining} tokens remaining
        </span>
      </div>
    </div>
  );
}
