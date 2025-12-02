import React, { useState } from 'react';
import SliderRow from './SliderRow';

// Configuration for slider variables
const SLIDER_CONFIGS = [
  { id: 'bodyweight', label: 'BODYWEIGHT', baseline: 80, maxAbsValue: 10, stepSize: 0.5, unit: 'kg', color: '#2563eb' },
  { id: 'waist', label: 'WAIST', baseline: 75, maxAbsValue: 8, stepSize: 0.5, unit: 'cm', color: '#d97706' },
  { id: 'sleep', label: 'SLEEP', baseline: 7, maxAbsValue: 3, stepSize: 0.25, unit: 'hrs', color: '#16a34a' },
  { id: 'energy', label: 'ENERGY', baseline: 5, maxAbsValue: 5, stepSize: 0.5, unit: '/10', color: '#db2777' },
  { id: 'mood', label: 'MOOD', baseline: 5, maxAbsValue: 5, stepSize: 1, unit: '/10', color: '#0891b2' },
];

export default function VariableTrackers() {
  // State for each slider variable
  const [sliderValues, setSliderValues] = useState(
    SLIDER_CONFIGS.reduce((acc, config) => ({ ...acc, [config.id]: 0 }), {})
  );

  const handleSliderChange = (id, value) => {
    setSliderValues(prev => ({ ...prev, [id]: value }));
  };

  // Categorical options
  const catOptions = ['Low', 'Normal', 'Elevated', 'Signif.'];
  const [selectedCat, setSelectedCat] = useState('Normal');

  // Binary variables
  const [binaryStates, setBinaryStates] = useState({
    workout: true,
    caffeine: true,
    alcohol: false,
    fastedAm: false,
  });

  const toggleBinary = (key) => {
    setBinaryStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white">
      {/* Slider rows */}
      {SLIDER_CONFIGS.map((config) => (
        <SliderRow
          key={config.id}
          label={config.label}
          unit={config.unit}
          color={config.color}
          baseline={config.baseline}
          maxAbsValue={config.maxAbsValue}
          stepSize={config.stepSize}
          value={sliderValues[config.id]}
          onChange={(val) => handleSliderChange(config.id, val)}
        />
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
              onClick={() => setSelectedCat(opt)}
              className={`px-1.5 py-1 text-[8px] font-bold tracking-tight border border-gray-300 transition-all ${
                selectedCat === opt
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
        {[
          { key: 'workout', label: 'WORKOUT' },
          { key: 'caffeine', label: 'CAFFEINE' },
          { key: 'alcohol', label: 'ALCOHOL' },
          { key: 'fastedAm', label: 'FASTED AM' },
        ].map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => toggleBinary(key)}
            className={`w-1/2 h-8 flex items-center px-2 border-b transition-colors ${
              i % 2 === 0 ? 'border-r' : ''
            } ${i >= 2 ? 'border-b-0' : ''} ${
              binaryStates[key] ? 'bg-black' : 'bg-white hover:bg-gray-50'
            } border-gray-200`}
          >
            <span
              className={`text-[11px] font-bold tracking-wide transition-colors ${
                binaryStates[key] ? 'text-white' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
            <div
              className="flex-1 h-px mx-1.5 opacity-30"
              style={{
                background: 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 5px)'
              }}
            />
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                binaryStates[key] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
