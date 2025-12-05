import React from 'react';

export default function CompoundsHeader() {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '.');

  return (
    <div className="h-6 bg-white flex items-center justify-between px-2">
      <span className="text-[9px] tracking-[0.15em] text-gray-400 font-semibold">
        COMPOUNDS
      </span>
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[8px] text-gray-500 tracking-wide">
          {today}
        </span>
      </div>
    </div>
  );
}
