import React from 'react';

export default function VariableTrackers() {
  // Placeholder data
  const sliderVars = [
    { label: 'BODYWEIGHT', value: '80.5', unit: 'kg', color: '#2563eb', active: true },
    { label: 'WAIST', value: '74.5', unit: 'cm', color: '#d97706', active: false },
    { label: 'SLEEP', value: '7.50', unit: 'hrs', color: '#16a34a', active: false },
    { label: 'ENERGY', value: '7.0', unit: '/10', color: '#db2777', active: false },
    { label: 'MOOD', value: '8.0', unit: '/10', color: '#0891b2', active: false },
  ];

  const catOptions = ['Low', 'Normal', 'Elevated', 'Signif.'];
  const binaryVars = [
    { label: 'WORKOUT', on: true },
    { label: 'CAFFEINE', on: true },
    { label: 'ALCOHOL', on: false },
    { label: 'FASTED AM', on: false },
  ];

  return (
    <div className="bg-white">
      {/* Slider rows */}
      {sliderVars.map((v, i) => (
        <div
          key={i}
          className="h-9 flex items-center px-2 border-b border-gray-200 cursor-pointer relative"
        >
          {v.active && (
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ background: v.color }}
            />
          )}
          <span className="text-[13px] font-bold tracking-wide min-w-[105px]">
            {v.label}
          </span>
          <div
            className="flex-1 h-px mx-1.5"
            style={{
              background: v.active
                ? `repeating-linear-gradient(90deg, ${v.color} 0px, ${v.color} 2px, transparent 2px, transparent 5px)`
                : 'repeating-linear-gradient(90deg, #bbb 0px, #bbb 2px, transparent 2px, transparent 5px)'
            }}
          />
          <span
            className="text-[16px] font-bold min-w-[50px] text-right tabular-nums"
            style={{ color: v.active ? v.color : '#000' }}
          >
            {v.value}
          </span>
          <span className="text-[10px] font-semibold text-gray-600 ml-0.5 min-w-[24px]">
            {v.unit}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full ml-1.5"
            style={{ background: v.active ? v.color : '#ccc' }}
          />
        </div>
      ))}

      {/* Categorical row */}
      <div className="h-9 flex items-center px-2 border-b border-gray-200">
        <span className="text-[13px] font-bold tracking-wide min-w-[105px]">
          HAIR SHED
        </span>
        <div
          className="flex-1 h-px mx-1.5"
          style={{
            background: 'repeating-linear-gradient(90deg, #bbb 0px, #bbb 2px, transparent 2px, transparent 5px)'
          }}
        />
        <div className="flex">
          {catOptions.map((opt, i) => (
            <button
              key={i}
              className={`px-1.5 py-1 text-[8px] font-bold tracking-tight border border-gray-300 transition-all ${
                i === 1
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              } ${i > 0 ? 'border-l-0' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Binary grid */}
      <div className="flex flex-wrap border-b border-gray-200">
        {binaryVars.map((v, i) => (
          <button
            key={i}
            className={`w-1/2 h-8 flex items-center px-2 border-b transition-colors ${
              i % 2 === 0 ? 'border-r' : ''
            } ${i >= 2 ? 'border-b-0' : ''} ${
              v.on ? 'bg-black' : 'bg-white hover:bg-gray-50'
            } border-gray-200`}
          >
            <span
              className={`text-[11px] font-bold tracking-wide transition-colors ${
                v.on ? 'text-white' : 'text-gray-400'
              }`}
            >
              {v.label}
            </span>
            <div
              className="flex-1 h-px mx-1.5 opacity-30"
              style={{
                background: v.on
                  ? 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 5px)'
                  : 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 5px)'
              }}
            />
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                v.on ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
