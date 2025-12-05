import React, { useState } from 'react';

// Common compounds for autocomplete
const COMPOUND_LIBRARY = [
  { name: 'Testosterone', defaultDose: '100', defaultUnit: 'mg', defaultRoa: 'im' },
  { name: 'Caffeine', defaultDose: '200', defaultUnit: 'mg', defaultRoa: 'oral' },
  { name: 'Creatine', defaultDose: '5', defaultUnit: 'g', defaultRoa: 'oral' },
  { name: 'Vitamin D3', defaultDose: '5000', defaultUnit: 'IU', defaultRoa: 'oral' },
  { name: 'Ashwagandha', defaultDose: '600', defaultUnit: 'mg', defaultRoa: 'oral' },
  { name: 'Melatonin', defaultDose: '3', defaultUnit: 'mg', defaultRoa: 'sublingual' },
  { name: 'Magnesium', defaultDose: '400', defaultUnit: 'mg', defaultRoa: 'oral' },
  { name: 'Zinc', defaultDose: '30', defaultUnit: 'mg', defaultRoa: 'oral' },
  { name: 'Finasteride', defaultDose: '1', defaultUnit: 'mg', defaultRoa: 'oral' },
  { name: 'Minoxidil', defaultDose: '1', defaultUnit: 'ml', defaultRoa: 'topical' },
];

const ROA_OPTIONS = [
  { value: 'oral', label: 'Oral' },
  { value: 'sublingual', label: 'Sublng' },
  { value: 'im', label: 'IM' },
  { value: 'subq', label: 'SubQ' },
  { value: 'iv', label: 'IV' },
  { value: 'topical', label: 'Topic' },
  { value: 'transdermal', label: 'Trans' },
];

const UNIT_OPTIONS = ['mg', 'g', 'mcg', 'IU', 'ml', 'drops'];

export default function QuickCompoundAdd() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [compound, setCompound] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState('mg');
  const [roa, setRoa] = useState('oral');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [frequency, setFrequency] = useState('once'); // once, daily, scheduled
  const [recentEntries, setRecentEntries] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCompounds = COMPOUND_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(compound.toLowerCase())
  );

  const handleSelectCompound = (c) => {
    setCompound(c.name);
    setDose(c.defaultDose);
    setUnit(c.defaultUnit);
    setRoa(c.defaultRoa);
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (!compound.trim() || !dose.trim()) return;

    const entry = {
      id: Date.now(),
      compound: compound.trim(),
      dose: dose.trim(),
      unit,
      roa,
      time,
      frequency,
      addedAt: new Date().toISOString(),
    };

    setRecentEntries(prev => [entry, ...prev].slice(0, 5));
    console.log('Compound logged:', entry);

    // Reset form
    setCompound('');
    setDose('');
    setUnit('mg');
    setRoa('oral');
    setFrequency('once');
    setIsExpanded(false);
  };

  const handleRemoveEntry = (id) => {
    setRecentEntries(prev => prev.filter(e => e.id !== id));
  };

  const handlePromote = (entry) => {
    console.log('Promote to permanent:', entry);
    // TODO: Navigate to compounds page with this entry
  };

  return (
    <div className="relative bg-black border-t border-gray-700">
      {/* Expanded panel - overlays upward */}
      {isExpanded && (
        <div
          className="absolute bottom-full left-0 right-0 bg-black border-t border-gray-700 z-20"
          style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.5)' }}
        >
          {/* Recent quick-adds history */}
          {recentEntries.length > 0 && (
            <div className="border-b border-gray-700">
              <div className="px-2 py-1 text-[7px] text-gray-600 tracking-wider">
                RECENT QUICK-ADDS
              </div>
              {recentEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center px-2 py-1.5 text-[9px] text-gray-400 hover:bg-[#111] group border-t border-gray-800"
                >
                  <span className="text-gray-500 w-10 shrink-0">{entry.time}</span>
                  <span className="text-white font-medium truncate">{entry.compound}</span>
                  <span className="mx-1 text-gray-600">·</span>
                  <span className="shrink-0">{entry.dose}{entry.unit}</span>
                  <span className="mx-1 text-gray-600 shrink-0">{entry.roa}</span>
                  <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handlePromote(entry)}
                      className="text-[7px] text-blue-400 hover:text-blue-300 px-1"
                      title="Add to permanent stack"
                    >
                      +PERM
                    </button>
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="text-red-500 hover:text-red-400 px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full configuration form */}
          <div className="p-2 space-y-2">
            {/* Compound search with autocomplete */}
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
                placeholder="Search or enter compound name..."
                className="w-full h-[28px] bg-[#1a1a1a] border border-gray-700 px-2 text-[10px] text-white font-medium outline-none focus:border-gray-500 focus:bg-[#222] placeholder:text-gray-500"
              />
              {showSuggestions && filteredCompounds.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-gray-700 border-t-0 z-30 max-h-28 overflow-y-auto">
                  {filteredCompounds.map(c => (
                    <button
                      key={c.name}
                      onClick={() => handleSelectCompound(c)}
                      className="w-full px-2 py-1.5 text-left text-[9px] text-white hover:bg-[#333] flex justify-between"
                    >
                      <span>{c.name}</span>
                      <span className="text-gray-500">{c.defaultDose}{c.defaultUnit} · {c.defaultRoa}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dose + Unit + ROA row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">DOSE</label>
                <input
                  type="text"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="Amount"
                  className="w-full h-[28px] bg-[#1a1a1a] border border-gray-700 px-2 text-[10px] text-white font-medium outline-none focus:border-gray-500 focus:bg-[#222] placeholder:text-gray-500"
                />
              </div>
              <div className="w-16">
                <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">UNIT</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-[28px] bg-[#1a1a1a] border border-gray-700 px-1 text-[10px] text-white font-medium outline-none appearance-none cursor-pointer focus:border-gray-500"
                >
                  {UNIT_OPTIONS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">ROA</label>
                <select
                  value={roa}
                  onChange={(e) => setRoa(e.target.value)}
                  className="w-full h-[28px] bg-[#1a1a1a] border border-gray-700 px-1 text-[10px] text-white font-medium outline-none appearance-none cursor-pointer focus:border-gray-500"
                >
                  {ROA_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time + Frequency row */}
            <div className="flex gap-2">
              <div className="w-20">
                <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">TIME</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-[28px] bg-[#1a1a1a] border border-gray-700 px-1 text-[10px] text-white font-medium text-center outline-none focus:border-gray-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] text-gray-500 tracking-wider block mb-0.5">TYPE</label>
                <div className="flex h-[28px]">
                  {[
                    { value: 'once', label: 'One-time' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'scheduled', label: 'Scheduled' },
                  ].map((opt, i) => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={`flex-1 text-[8px] font-bold border border-gray-700 transition-colors ${
                        frequency === opt.value
                          ? 'bg-white text-black border-white'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                      } ${i > 0 ? 'border-l-0' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 h-7 text-[9px] text-gray-500 hover:text-gray-300 font-bold border border-gray-700 hover:border-gray-500 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleAdd}
                disabled={!compound.trim() || !dose.trim()}
                className="flex-1 h-7 bg-white text-[9px] text-black font-bold hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                + ADD COMPOUND
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed quick-add bar */}
      <div
        className="h-8 flex items-center px-2 gap-1 cursor-pointer hover:bg-[#111] transition-colors"
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <span className="text-[8px] tracking-widest text-gray-500 font-semibold shrink-0">
          + COMPOUND
        </span>
        <div className="flex-1 h-px bg-gray-800 mx-1" />
        {recentEntries.length > 0 ? (
          <span className="text-[8px] text-gray-600">
            {recentEntries.length} logged today
          </span>
        ) : (
          <span className="text-[8px] text-gray-600">
            tap to add
          </span>
        )}
      </div>
    </div>
  );
}
