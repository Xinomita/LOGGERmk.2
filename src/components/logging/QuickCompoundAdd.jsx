import React from 'react';

export default function QuickCompoundAdd() {
  return (
    <div className="bg-black border-t border-gray-700">
      <div className="h-5 flex items-center px-2 border-b border-gray-700">
        <span className="text-[8px] tracking-widest text-gray-500 font-semibold">
          + COMPOUND
        </span>
      </div>
      <div className="flex items-center px-2 py-1.5 gap-1">
        <input
          type="text"
          placeholder="Search compound..."
          className="flex-[2] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none focus:border-gray-500 focus:bg-[#222] placeholder:text-gray-500"
        />
        <input
          type="text"
          placeholder="Dose"
          className="w-[50px] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none focus:border-gray-500 focus:bg-[#222] placeholder:text-gray-500"
        />
        <select
          className="w-[70px] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none appearance-none cursor-pointer focus:border-gray-500 focus:bg-[#222]"
          defaultValue=""
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23555' d='M0 2l4 4 4-4z'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center'
          }}
        >
          <option value="" disabled className="text-gray-500">ROA</option>
          <option value="oral">Oral</option>
          <option value="sublingual">Sublng</option>
          <option value="im">IM</option>
          <option value="subq">SubQ</option>
          <option value="iv">IV</option>
          <option value="topical">Topic</option>
        </select>
        <input
          type="time"
          className="w-[52px] h-[26px] bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium text-center outline-none focus:border-gray-500 focus:bg-[#222]"
          defaultValue="14:30"
        />
        <button className="w-7 h-[26px] bg-white flex items-center justify-center text-[14px] font-bold hover:bg-green-500 transition-colors">
          +
        </button>
      </div>
    </div>
  );
}
