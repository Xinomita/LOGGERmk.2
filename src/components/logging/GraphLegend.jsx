import React, { useState } from 'react';

const VARIABLES = [
  { id: 'weight', name: 'WEIGHT', color: '#2563eb', shape: 'dot' },
  { id: 'waist', name: 'WAIST', color: '#d97706', shape: 'tri' },
  { id: 'sleep', name: 'SLEEP', color: '#16a34a', shape: 'square' },
  { id: 'energy', name: 'ENERGY', color: '#db2777', shape: 'dot' },
];

export default function GraphLegend() {
  const [activeVar, setActiveVar] = useState('weight');

  return (
    <div className="h-5 bg-white border-b border-gray-300 flex items-center px-2 gap-2.5">
      {VARIABLES.map((variable) => (
        <button
          key={variable.id}
          onClick={() => setActiveVar(variable.id)}
          className={`flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 transition-colors ${
            activeVar === variable.id ? 'bg-black' : 'hover:bg-gray-100'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 border transition-all ${
              variable.shape === 'dot' ? 'rounded-full' : ''
            }`}
            style={{
              borderColor: activeVar === variable.id ? variable.color : '#aaa',
              background: activeVar === variable.id ? variable.color : 'transparent'
            }}
          />
          <span
            className={`text-[7px] tracking-wider font-semibold transition-colors ${
              activeVar === variable.id ? 'text-white' : 'text-gray-500'
            }`}
          >
            {variable.name}
          </span>
        </button>
      ))}
    </div>
  );
}
