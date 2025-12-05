import React from 'react';

// Mock history of quick-adds from logging page
const MOCK_HISTORY = [
  { id: 1, name: 'Coffee', dose: '1', unit: 'cup', time: '08:30', date: 'Today', roa: 'oral' },
  { id: 2, name: 'Ibuprofen', dose: '400', unit: 'mg', time: '14:15', date: 'Today', roa: 'oral' },
  { id: 3, name: 'Melatonin', dose: '3', unit: 'mg', time: '22:00', date: 'Yesterday', roa: 'sublingual' },
  { id: 4, name: 'Alcohol', dose: '2', unit: 'drinks', time: '20:30', date: 'Yesterday', roa: 'oral' },
  { id: 5, name: 'Pre-workout', dose: '1', unit: 'scoop', time: '06:00', date: '2 days ago', roa: 'oral' },
];

export default function CompoundHistory({ onPromote }) {
  return (
    <div className="bg-black">
      {/* Header */}
      <div className="h-6 flex items-center px-2 border-b border-gray-800">
        <span className="text-[8px] tracking-widest text-gray-500 font-semibold">
          QUICK-ADD HISTORY
        </span>
        <span className="ml-auto text-[7px] text-gray-600">
          Promote to permanent →
        </span>
      </div>

      {/* History list */}
      <div className="max-h-40 overflow-y-auto">
        {MOCK_HISTORY.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center h-8 px-2 border-b border-gray-800 hover:bg-gray-900 group"
          >
            <div className="w-12 shrink-0">
              <span className="text-[7px] text-gray-600">{entry.date}</span>
            </div>
            <div className="w-10 shrink-0">
              <span className="text-[8px] text-gray-500">{entry.time}</span>
            </div>
            <span className="text-[9px] text-white font-medium flex-1 truncate">
              {entry.name}
            </span>
            <span className="text-[8px] text-gray-500 mr-2">
              {entry.dose}{entry.unit}
            </span>
            <button
              onClick={() => onPromote?.(entry)}
              className="text-[7px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity px-1"
            >
              +PERM
            </button>
          </div>
        ))}
      </div>

      {/* View all link */}
      <button className="w-full h-6 flex items-center justify-center text-[8px] text-gray-600 hover:text-gray-400 transition-colors">
        View full history
      </button>
    </div>
  );
}
