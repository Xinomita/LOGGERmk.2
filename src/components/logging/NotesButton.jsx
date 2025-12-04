import React from 'react';

export default function NotesButton() {
  return (
    <button className="h-7 w-full bg-black flex items-center px-2 hover:bg-gray-900 transition-colors">
      <span className="text-[9px] tracking-[0.12em] text-gray-600 font-bold">
        NOTES
      </span>
    </button>
  );
}
