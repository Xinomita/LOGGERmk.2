import React, { useState, useRef, useEffect } from 'react';

export default function NotesButton() {
  const [noteText, setNoteText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [height, setHeight] = useState(28); // Single line height
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-resize textarea and expand upward
  useEffect(() => {
    if (textareaRef.current) {
      // Reset to measure true scroll height
      textareaRef.current.style.height = '28px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.max(28, Math.min(scrollHeight, 120)); // Max 120px
      setHeight(newHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [noteText]);

  const handleBlur = () => {
    // Only deactivate if empty
    if (!noteText.trim()) {
      setIsActive(false);
    }
    if (noteText.trim()) {
      console.log('Note saved:', noteText);
      // TODO: Persist to store
    }
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  // Calculate upward expansion offset
  const expandOffset = height - 28;

  return (
    <div
      className="relative bg-black"
      style={{ marginTop: isActive ? `-${expandOffset}px` : 0 }}
    >
      <div className="flex items-end px-2 py-1">
        <span className="text-[9px] tracking-[0.12em] text-gray-600 font-bold shrink-0 pb-1.5">
          NOTES
        </span>
        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type to add notes..."
          rows={1}
          className={`flex-1 ml-2 bg-transparent border-0 px-1.5 py-1 text-[10px] text-white font-medium outline-none resize-none placeholder:text-gray-600 transition-colors ${
            isActive ? 'bg-[#1a1a1a]' : ''
          }`}
          style={{
            height: `${height}px`,
            lineHeight: '18px',
          }}
        />
      </div>
    </div>
  );
}
