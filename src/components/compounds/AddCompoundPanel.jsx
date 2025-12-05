import React, { useState } from 'react';

const COMPOUND_LIBRARY = [
  { name: 'Testosterone', defaultDose: '100', defaultUnit: 'mg', category: 'hormone' },
  { name: 'Caffeine', defaultDose: '200', defaultUnit: 'mg', category: 'stimulant' },
  { name: 'Creatine', defaultDose: '5', defaultUnit: 'g', category: 'supplement' },
  { name: 'Vitamin D3', defaultDose: '5000', defaultUnit: 'IU', category: 'vitamin' },
  { name: 'Ashwagandha', defaultDose: '600', defaultUnit: 'mg', category: 'adaptogen' },
  { name: 'Zinc', defaultDose: '30', defaultUnit: 'mg', category: 'mineral' },
  { name: 'Magnesium', defaultDose: '400', defaultUnit: 'mg', category: 'mineral' },
  { name: 'Finasteride', defaultDose: '1', defaultUnit: 'mg', category: 'pharma' },
];

const ROA_OPTIONS = ['Oral', 'Sublingual', 'IM', 'SubQ', 'IV', 'Topical', 'Transdermal'];
const FREQUENCY_OPTIONS = ['Daily', 'EOD', 'E3D', 'Weekly', 'As needed'];
const UNIT_OPTIONS = ['mg', 'g', 'mcg', 'IU', 'ml'];

export default function AddCompoundPanel({ isOpen, onClose, onAdd, targetStack }) {
  const [compound, setCompound] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState('mg');
  const [roa, setRoa] = useState('Oral');
  const [frequency, setFrequency] = useState('Daily');
  const [loggingMode, setLoggingMode] = useState('none'); // none, positive, negative
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCompounds = COMPOUND_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(compound.toLowerCase())
  );

  const handleSelectCompound = (c) => {
    setCompound(c.name);
    setDose(c.defaultDose);
    setUnit(c.defaultUnit);
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (!compound.trim()) return;

    onAdd?.({
      id: `compound_${Date.now()}`,
      name: compound,
      dose,
      unit,
      roa,
      frequency,
      loggingMode,
      targetStack,
    });

    // Reset
    setCompound('');
    setDose('');
    setUnit('mg');
    setRoa('Oral');
    setFrequency('Daily');
    setLoggingMode('none');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white border-b-2 border-black">
      {/* Header */}
      <div className="h-6 bg-gray-900 flex items-center justify-between px-2">
        <span className="text-[8px] tracking-widest text-gray-400 font-semibold">
          ADD COMPOUND
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm"
        >
          ×
        </button>
      </div>

      <div className="p-2 space-y-2">
        {/* Compound search */}
        <div className="relative">
          <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">COMPOUND</label>
          <input
            type="text"
            value={compound}
            onChange={(e) => {
              setCompound(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(compound.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search compound..."
            className="w-full h-7 bg-gray-100 border border-gray-300 px-2 text-[10px] text-black font-medium outline-none focus:border-black placeholder:text-gray-400"
          />
          {showSuggestions && filteredCompounds.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 z-30 max-h-28 overflow-y-auto shadow-lg">
              {filteredCompounds.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleSelectCompound(c)}
                  className="w-full px-2 py-1.5 text-left text-[9px] text-black hover:bg-gray-100 flex justify-between"
                >
                  <span>{c.name}</span>
                  <span className="text-gray-400">{c.defaultDose}{c.defaultUnit}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dose + Unit + ROA */}
        <div className="flex gap-1">
          <div className="flex-1">
            <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">DOSE</label>
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Amount"
              className="w-full h-7 bg-gray-100 border border-gray-300 px-2 text-[10px] text-black font-medium outline-none focus:border-black placeholder:text-gray-400"
            />
          </div>
          <div className="w-14">
            <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">UNIT</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-7 bg-gray-100 border border-gray-300 px-1 text-[9px] text-black font-medium outline-none appearance-none"
            >
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="w-20">
            <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">ROA</label>
            <select
              value={roa}
              onChange={(e) => setRoa(e.target.value)}
              className="w-full h-7 bg-gray-100 border border-gray-300 px-1 text-[9px] text-black font-medium outline-none appearance-none"
            >
              {ROA_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Frequency + Logging mode */}
        <div className="flex gap-1">
          <div className="flex-1">
            <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">FREQUENCY</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full h-7 bg-gray-100 border border-gray-300 px-2 text-[9px] text-black font-medium outline-none appearance-none"
            >
              {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">LOGGING MODE</label>
            <div className="flex h-7">
              {[
                { value: 'none', label: 'NONE' },
                { value: 'positive', label: '+LOG' },
                { value: 'negative', label: '−LOG' },
              ].map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => setLoggingMode(opt.value)}
                  className={`flex-1 text-[8px] font-bold border border-gray-300 transition-colors ${
                    loggingMode === opt.value
                      ? opt.value === 'positive' ? 'bg-green-500 text-white border-green-500' :
                        opt.value === 'negative' ? 'bg-red-500 text-white border-red-500' :
                        'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  } ${i > 0 ? 'border-l-0' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI suggestion placeholder */}
        {compound && (
          <div className="bg-blue-50 border border-blue-200 p-2 rounded">
            <div className="text-[7px] text-blue-600 font-semibold mb-1">AI SUGGESTION</div>
            <div className="text-[8px] text-blue-800">
              Consider tracking: Sleep quality, Energy levels
            </div>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!compound.trim()}
          className="w-full h-8 bg-black text-white text-[10px] font-bold tracking-wide hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
        >
          + ADD TO {targetStack?.toUpperCase() || 'STACK'}
        </button>
      </div>
    </div>
  );
}
