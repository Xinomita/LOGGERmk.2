import React, { useState } from 'react';

export default function NotesButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleSave = () => {
    if (noteText.trim()) {
      console.log('Note saved:', noteText);
      // TODO: Persist to store
    }
    setIsExpanded(false);
  };

  return (
    <div className="bg-black">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-7 w-full flex items-center justify-between px-2 hover:bg-gray-900 transition-colors"
      >
        <span className="text-[9px] tracking-[0.12em] text-gray-600 font-bold">
          NOTES
        </span>
        <span className="text-[10px] text-gray-600">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-2 pb-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes for today..."
            className="w-full h-20 bg-[#1a1a1a] border border-gray-700 p-2 text-[10px] text-white font-medium outline-none resize-none focus:border-gray-500 placeholder:text-gray-500"
          />
          <div className="flex justify-end gap-1 mt-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-2 py-1 text-[8px] text-gray-500 hover:text-gray-300 font-bold"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-white text-[8px] text-black font-bold hover:bg-green-500 transition-colors"
            >
              SAVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
