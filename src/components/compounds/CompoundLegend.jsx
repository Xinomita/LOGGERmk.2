import React from 'react';

const COMPOUNDS = [
  { id: 'caffeine', name: 'CAFFEINE', color: '#22c55e', dose: '200mg', status: 'active' },
  { id: 'zinc', name: 'ZINC', color: '#3b82f6', dose: '30mg', status: 'active' },
  { id: 'vitd', name: 'VIT D3', color: '#f59e0b', dose: '5000IU', status: 'active' },
  { id: 'temp', name: 'COFFEE', color: '#a855f7', dose: '1 cup', status: 'temp' },
];

export default function CompoundLegend({ activeCompound, onCompoundClick }) {
  return (
    <div className="h-5 bg-black border-b border-gray-800 flex items-center px-1 gap-1 overflow-x-auto">
      {COMPOUNDS.map((compound) => (
        <button
          key={compound.id}
          onClick={() => onCompoundClick?.(compound.id)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-all ${
            activeCompound === compound.id
              ? 'bg-white/10'
              : 'hover:bg-white/5'
          } ${compound.status === 'temp' ? 'opacity-60' : ''}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${compound.status === 'temp' ? 'ring-1 ring-white/30' : ''}`}
            style={{ backgroundColor: compound.color }}
          />
          <span className="text-[7px] text-gray-400 font-semibold tracking-wide whitespace-nowrap">
            {compound.name}
          </span>
        </button>
      ))}
    </div>
  );
}
