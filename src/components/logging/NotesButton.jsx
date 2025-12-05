import React, { useState, useRef, useEffect } from 'react';

export default function NotesButton() {
  const [noteText, setNoteText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleSave = () => {
    if (noteText.trim()) {
      console.log('Note saved:', noteText);
      // TODO: Persist to store
    }
  };

  // Auto-save on blur if there's content
  const handleBlur = () => {
    setIsFocused(false);
    if (noteText.trim()) {
      handleSave();
    }
  };

  return (
    <div className="relative bg-black">
      {/* Expanded overlay - renders above the input, overlaying content above */}
      {isFocused && (
        <div
          className="absolute bottom-full left-0 right-0 bg-black border-t border-gray-700 z-20"
          style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.5)' }}
        >
          <textarea
            ref={textareaRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add detailed notes..."
            className="w-full h-24 bg-[#1a1a1a] border-0 p-2 text-[10px] text-white font-medium outline-none resize-none placeholder:text-gray-500"
            autoFocus
          />
          <div className="flex justify-between items-center px-2 pb-1.5">
            <span className="text-[7px] text-gray-600">Auto-saves on blur</span>
            <button
              onClick={() => {
                handleSave();
                setIsFocused(false);
              }}
              className="px-2 py-0.5 bg-white text-[8px] text-black font-bold hover:bg-green-500 transition-colors"
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* Always-visible input bar */}
      <div className="h-7 flex items-center px-2 gap-2">
        <span className="text-[9px] tracking-[0.12em] text-gray-600 font-bold shrink-0">
          NOTES
        </span>
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Type to add notes..."
          className="flex-1 h-5 bg-[#1a1a1a] border border-gray-700 px-1.5 text-[9px] text-white font-medium outline-none focus:border-gray-500 placeholder:text-gray-500"
        />
        {noteText.trim() && !isFocused && (
          <button
            onClick={() => setNoteText('')}
            className="text-[10px] text-gray-500 hover:text-gray-300"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
