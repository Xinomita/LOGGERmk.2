import React, { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
  { prefix: 'TREND:', text: 'BODYWEIGHT ↑ 2.3% THIS WEEK', type: '' },
  { prefix: 'TREND:', text: 'SLEEP AVG 7.2h ↑ FROM 6.8h', type: '' },
  { prefix: 'ALERT:', text: 'ZINC + COPPER TIMING', type: 'warning' },
];

export default function StatusBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const message = STATUS_MESSAGES[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 bg-black border-b border-gray-800 flex">
      <div className="flex-[3] flex items-center px-2 border-r border-gray-700 overflow-hidden">
        <span className="text-[7px] font-semibold tracking-wider text-gray-600 mr-1.5">
          {message.prefix}
        </span>
        <span className={`text-[9px] font-semibold tracking-wide ${
          message.type === 'warning' ? 'text-orange-500' : 'text-green-500'
        }`}>
          {message.text}
        </span>
      </div>
      <button className="flex-1 flex items-center justify-center hover:bg-gray-900 transition-colors">
        <span className="text-[8px] font-bold tracking-widest text-gray-600">
          PROFILE
        </span>
      </button>
    </div>
  );
}
