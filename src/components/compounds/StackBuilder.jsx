import React, { useState } from 'react';

// Mock stacks data
const INITIAL_STACKS = [
  {
    id: 'morning',
    name: 'Morning Stack',
    compounds: [
      { id: 'caffeine', name: 'Caffeine', dose: '200', unit: 'mg', frequency: 'daily', loggingMode: 'negative', color: '#22c55e' },
      { id: 'vitd', name: 'Vitamin D3', dose: '5000', unit: 'IU', frequency: 'daily', loggingMode: 'none', color: '#f59e0b' },
    ],
  },
  {
    id: 'evening',
    name: 'Evening Stack',
    compounds: [
      { id: 'zinc', name: 'Zinc', dose: '30', unit: 'mg', frequency: 'daily', loggingMode: 'negative', color: '#3b82f6' },
      { id: 'magnesium', name: 'Magnesium', dose: '400', unit: 'mg', frequency: 'daily', loggingMode: 'none', color: '#ec4899' },
    ],
  },
];

function CompoundRow({ compound, onRemove }) {
  return (
    <div className="flex items-center h-8 px-2 border-b border-gray-200 hover:bg-gray-50 group">
      <div
        className="w-2 h-2 rounded-full mr-2 shrink-0"
        style={{ backgroundColor: compound.color }}
      />
      <span className="text-[10px] font-bold text-black flex-1 truncate">
        {compound.name}
      </span>
      <span className="text-[9px] text-gray-500 mr-2">
        {compound.dose}{compound.unit}
      </span>
      <span className={`text-[7px] px-1 py-0.5 rounded ${
        compound.loggingMode === 'negative' ? 'bg-red-100 text-red-600' :
        compound.loggingMode === 'positive' ? 'bg-green-100 text-green-600' :
        'bg-gray-100 text-gray-500'
      }`}>
        {compound.loggingMode === 'negative' ? '−LOG' :
         compound.loggingMode === 'positive' ? '+LOG' : 'NO LOG'}
      </span>
      <button
        onClick={() => onRemove?.(compound.id)}
        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
}

function StackSection({ stack, onAddClick, onRemoveCompound }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="border-b-2 border-black">
      {/* Stack header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full h-7 bg-gray-100 flex items-center px-2 hover:bg-gray-200 transition-colors"
      >
        <span className="text-[8px] text-gray-500 mr-1">
          {isCollapsed ? '▶' : '▼'}
        </span>
        <span className="text-[10px] font-bold text-black tracking-wide">
          {stack.name.toUpperCase()}
        </span>
        <span className="ml-auto text-[8px] text-gray-500">
          {stack.compounds.length} compounds
        </span>
      </button>

      {/* Compounds list */}
      {!isCollapsed && (
        <div className="bg-white">
          {stack.compounds.map((compound) => (
            <CompoundRow
              key={compound.id}
              compound={compound}
              onRemove={() => onRemoveCompound?.(stack.id, compound.id)}
            />
          ))}

          {/* Add compound button */}
          <button
            onClick={() => onAddClick?.(stack.id)}
            className="w-full h-8 flex items-center justify-center text-[9px] text-gray-400 hover:text-black hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            + Add Compound
          </button>
        </div>
      )}
    </div>
  );
}

export default function StackBuilder({ onAddCompound }) {
  const [stacks, setStacks] = useState(INITIAL_STACKS);
  const [showAddStack, setShowAddStack] = useState(false);

  const handleRemoveCompound = (stackId, compoundId) => {
    setStacks(prev => prev.map(stack =>
      stack.id === stackId
        ? { ...stack, compounds: stack.compounds.filter(c => c.id !== compoundId) }
        : stack
    ));
  };

  const handleAddStack = () => {
    const newStack = {
      id: `stack_${Date.now()}`,
      name: 'New Stack',
      compounds: [],
    };
    setStacks(prev => [...prev, newStack]);
    setShowAddStack(false);
  };

  return (
    <div className="bg-white">
      {/* Section header */}
      <div className="h-6 bg-black flex items-center px-2">
        <span className="text-[8px] tracking-widest text-gray-500 font-semibold">
          STACK BUILDER
        </span>
      </div>

      {/* Stacks */}
      {stacks.map((stack) => (
        <StackSection
          key={stack.id}
          stack={stack}
          onAddClick={onAddCompound}
          onRemoveCompound={handleRemoveCompound}
        />
      ))}

      {/* Add new stack button */}
      <button
        onClick={handleAddStack}
        className="w-full h-8 bg-gray-50 flex items-center justify-center text-[9px] text-gray-400 hover:text-black hover:bg-gray-100 transition-colors border-b-2 border-black"
      >
        + New Stack
      </button>
    </div>
  );
}
