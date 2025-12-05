import React, { useState } from 'react';

// Common compounds for autocomplete
const COMPOUND_LIBRARY = [
  { name: 'Testosterone', defaultDose: '100', defaultUnit: 'mg' },
  { name: 'Caffeine', defaultDose: '200', defaultUnit: 'mg' },
  { name: 'Creatine', defaultDose: '5', defaultUnit: 'g' },
  { name: 'Vitamin D3', defaultDose: '5000', defaultUnit: 'IU' },
  { name: 'Ashwagandha', defaultDose: '600', defaultUnit: 'mg' },
  { name: 'Melatonin', defaultDose: '3', defaultUnit: 'mg' },
  { name: 'Magnesium', defaultDose: '400', defaultUnit: 'mg' },
  { name: 'Zinc', defaultDose: '30', defaultUnit: 'mg' },
];

export default function QuickCompoundAdd() {
  const [compound, setCompound] = useState('');
  const [dose, setDose] = useState('');
  const [roa, setRoa] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCompounds = COMPOUND_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(compound.toLowerCase())
  );

  const handleSelectCompound = (c) => {
    setCompound(c.name);
    setDose(c.defaultDose);
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (!compound.trim() || !dose.trim()) return;

    const entry = {
      id: Date.now(),
      compound: compound.trim(),
      dose: dose.trim(),
      roa: roa || 'oral',
      time,
    };

    setRecentEntries(prev => [entry, ...prev].slice(0, 5));
    console.log('Compound logged:', entry);

    // Reset form
    setCompound('');
    setDose('');
    setRoa('');
  };

  const handleRemoveEntry = (id) => {
    setRecentEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="bg-black border-t border-gray-700">
      <div className="h-5 flex items-center px-2 border-b border-gray-700">
        <span className="text-[8px] tracking-widest text-gray-500 font-semibold">
          + COMPOUND
        </span>
        {recentEntries.length > 0 && (
          <span className="ml-auto text-[8px] text-gray-600">
            {recentEntries.length} today
          </span>
        )}
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div className="border-b border-gray-700">
          {recentEntries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center px-2 py-1 text-[8px] text-gray-400 hover:bg-[#111] group"
            >
              <span className="text-gray-500 w-10">{entry.time}</span>
              <span className="text-white font-medium">{entry.compound}</span>
              <span className="mx-1">·</span>
              <span>{entry.dose}</span>
              <span className="mx-1 text-gray-600">{entry.roa}</span>
              <button
                onClick={() => handleRemoveEntry(entry.id)}
                className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <div className="relative flex items-center px-2 py-1.5 gap-1">
        <div className="relative flex-[2]">
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
            className="w-full h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none focus:border-gray-500 focus:bg-[#222] placeholder:text-gray-500"
          />
          {showSuggestions && filteredCompounds.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-gray-700 border-t-0 z-10 max-h-24 overflow-y-auto">
              {filteredCompounds.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleSelectCompound(c)}
                  className="w-full px-1.5 py-1 text-left text-[9px] text-white hover:bg-[#333]"
                >
                  {c.name}
                  <span className="text-gray-500 ml-1">({c.defaultDose}{c.defaultUnit})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="Dose"
          className="w-[50px] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none focus:border-gray-500 focus:bg-[#222] placeholder:text-gray-500"
        />
        <select
          value={roa}
          onChange={(e) => setRoa(e.target.value)}
          className="w-[70px] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none appearance-none cursor-pointer focus:border-gray-500 focus:bg-[#222]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23555' d='M0 2l4 4 4-4z'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center'
          }}
        >
          <option value="" className="text-gray-500">ROA</option>
          <option value="oral">Oral</option>
          <option value="sublingual">Sublng</option>
          <option value="im">IM</option>
          <option value="subq">SubQ</option>
          <option value="iv">IV</option>
          <option value="topical">Topic</option>
        </select>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-[52px] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium text-center outline-none focus:border-gray-500 focus:bg-[#222]"
        />
        <button
          onClick={handleAdd}
          disabled={!compound.trim() || !dose.trim()}
          className="w-7 h-[26px] bg-white flex items-center justify-center text-[14px] font-bold hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}
