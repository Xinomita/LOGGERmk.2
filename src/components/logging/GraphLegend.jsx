import React from 'react';

const VARIABLES = [
  { id: 'bodyweight', name: 'WEIGHT', color: '#2563eb', shape: 'dot' },
  { id: 'waist', name: 'WAIST', color: '#d97706', shape: 'tri' },
  { id: 'sleep', name: 'SLEEP', color: '#22c55e', shape: 'square' },
  { id: 'energy', name: 'ENERGY', color: '#ec4899', shape: 'dot' },
  { id: 'mood', name: 'MOOD', color: '#06b6d4', shape: 'square' },
];

/**
 * GraphLegend - Shows which variable is currently being manipulated
 *
 * Props:
 * - activeVariable: ID of the variable currently being dragged (null when inactive)
 */
export default function GraphLegend({ activeVariable = null }) {
  return (
    <div className="h-5 bg-white border-b border-gray-300 flex items-center px-2 gap-2.5">
      {VARIABLES.map((variable) => {
        const isActive = activeVariable === variable.id;

        return (
          <div
            key={variable.id}
            className="flex items-center gap-1 px-1 py-0.5 -mx-1 -my-0.5 transition-colors"
          >
            <div
              className={`w-1.5 h-1.5 border-2 transition-colors ${
                variable.shape === 'dot' ? 'rounded-full' : ''
              }`}
              style={{
                borderColor: isActive ? variable.color : '#000',
                backgroundColor: isActive ? variable.color : 'transparent',
              }}
            />
            <span
              className="text-[7px] tracking-wider font-semibold transition-colors"
              style={{
                color: isActive ? variable.color : '#000',
              }}
            >
              {variable.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
