import React, { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  { prefix: 'STACK:', text: '4 ACTIVE COMPOUNDS', type: 'info' },
  { prefix: 'NEXT:', text: 'ZINC IN 2H 15M', type: '' },
  { prefix: 'ALERT:', text: '1 INTERACTION DETECTED', type: 'warning' },
];

export default function CompoundsStatusBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const message = STATUS_MESSAGES[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 bg-white border-b border-gray-300 flex">
      <div className="flex-[3] flex items-center px-2 border-r border-gray-300 overflow-hidden">
        <span className="text-[7px] font-semibold tracking-wider text-gray-400 mr-1.5">
          {message.prefix}
        </span>
        <span className={`text-[9px] font-semibold tracking-wide ${
          message.type === 'warning' ? 'text-orange-500' :
          message.type === 'info' ? 'text-blue-500' : 'text-green-500'
        }`}>
          {message.text}
        </span>
      </div>
      <button className="flex-1 flex items-center justify-center hover:bg-gray-100 transition-colors">
        <span className="text-[8px] font-bold tracking-widest text-gray-400">
          AI
        </span>
      </button>
    </div>
  );
}
