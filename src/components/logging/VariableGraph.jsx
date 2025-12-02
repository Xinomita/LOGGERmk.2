import React from 'react';

export default function VariableGraph() {
  return (
    <div className="h-[130px] bg-white border-b-2 border-black flex">
      <div className="flex-1 relative overflow-hidden">
        {/* Dense grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(90deg, #e8e8e8 1px, transparent 1px), linear-gradient(0deg, #e8e8e8 1px, transparent 1px)',
            backgroundSize: '5px 5.5px'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(90deg, #ccc 1px, transparent 1px), linear-gradient(0deg, #ccc 1px, transparent 1px)',
            backgroundSize: '25px 22px'
          }}
        />

        {/* Y-axis */}
        <div className="absolute left-[3px] top-1 bottom-3 flex flex-col justify-between">
          <span className="text-[6px] text-gray-500">95</span>
          <span className="text-[6px] text-gray-500">85</span>
          <span className="text-[6px] text-gray-500">75</span>
        </div>

        {/* X-axis */}
        <div className="absolute bottom-[1px] left-[18px] right-6 flex justify-between">
          <span className="text-[6px] text-gray-500">01</span>
          <span className="text-[6px] text-gray-500">08</span>
          <span className="text-[6px] text-gray-500">15</span>
          <span className="text-[6px] text-gray-500">22</span>
          <span className="text-[6px] text-gray-500">30</span>
        </div>

        {/* Placeholder for SVG graph lines */}
        <div className="absolute left-[18px] right-6 top-1 bottom-3 flex items-center justify-center">
          <span className="text-[8px] text-gray-400">[ Graph data will render here ]</span>
        </div>
      </div>

      {/* Compounds strip */}
      <button className="w-[22px] bg-black flex items-center justify-center hover:bg-gray-900 transition-colors">
        <span
          className="text-[7px] tracking-[0.15em] text-gray-600 font-bold"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          COMPOUNDS
        </span>
      </button>
    </div>
  );
}
