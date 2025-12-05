import React, { useState, useRef, useEffect } from 'react';

// Mock compound data for the half-life visualization
const MOCK_COMPOUNDS = [
  { id: 'caffeine', name: 'Caffeine', color: '#22c55e', halfLife: 5, lastDose: 2, doseAmount: 200 },
  { id: 'zinc', name: 'Zinc', color: '#3b82f6', halfLife: 3, lastDose: 8, doseAmount: 30 },
  { id: 'vitd', name: 'Vitamin D3', color: '#f59e0b', halfLife: 24, lastDose: 10, doseAmount: 5000 },
];

export default function HalfLifeGraph({ compounds = MOCK_COMPOUNDS, activeCompound = null }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [viewport, setViewport] = useState('24h'); // 12h, 24h, 48h

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const height = 130;
  const padding = { top: 6, right: 6, bottom: 16, left: 8 };
  const graphHeight = height - padding.top - padding.bottom;
  const graphWidth = containerWidth - padding.left - padding.right;

  // Time range based on viewport
  const hours = viewport === '12h' ? 12 : viewport === '48h' ? 48 : 24;
  const nowPosition = 0.5; // NOW is at center

  // Grid
  const xDivisions = viewport === '12h' ? 6 : viewport === '48h' ? 8 : 6;
  const yDivisions = 4;

  const cycleViewport = () => {
    const viewports = ['12h', '24h', '48h'];
    const idx = viewports.indexOf(viewport);
    setViewport(viewports[(idx + 1) % viewports.length]);
  };

  return (
    <div className="h-[130px] bg-black border-b-2 border-white flex">
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Viewport toggle */}
        <button
          onClick={cycleViewport}
          className="absolute z-10 bg-white/90 text-black text-[8px] font-bold w-6 h-5 flex items-center justify-center rounded-sm hover:bg-white transition-colors"
          style={{ left: padding.left + 2, top: padding.top + 2 }}
        >
          {viewport}
        </button>

        <svg width={containerWidth} height={height} className="absolute inset-0">
          {/* Grid */}
          <defs>
            <clipPath id="halfLifeGraphArea">
              <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} />
            </clipPath>
          </defs>

          <g clipPath="url(#halfLifeGraphArea)">
            {/* Vertical grid lines */}
            {Array.from({ length: xDivisions + 1 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={padding.left + (i / xDivisions) * graphWidth}
                y1={padding.top}
                x2={padding.left + (i / xDivisions) * graphWidth}
                y2={padding.top + graphHeight}
                stroke="#333"
                strokeWidth="0.5"
              />
            ))}
            {/* Horizontal grid lines */}
            {Array.from({ length: yDivisions + 1 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={padding.left}
                y1={padding.top + (i / yDivisions) * graphHeight}
                x2={padding.left + graphWidth}
                y2={padding.top + (i / yDivisions) * graphHeight}
                stroke="#333"
                strokeWidth="0.5"
              />
            ))}

            {/* NOW line - vertical dashed */}
            <line
              x1={padding.left + nowPosition * graphWidth}
              y1={padding.top}
              x2={padding.left + nowPosition * graphWidth}
              y2={padding.top + graphHeight}
              stroke="#fff"
              strokeWidth="1"
              strokeDasharray="4,2"
            />

            {/* Placeholder concentration curves */}
            {compounds.map((compound, idx) => {
              const isActive = activeCompound === null || activeCompound === compound.id;
              const opacity = isActive ? 0.8 : 0.2;

              // Generate a simple decay curve (placeholder)
              const points = [];
              for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const x = padding.left + t * graphWidth;
                // Simple exponential decay from peak at dose time
                const peakTime = (compound.lastDose / hours) * (1 - nowPosition);
                const timeSincePeak = t - (nowPosition - peakTime);
                const decay = timeSincePeak > 0
                  ? Math.exp(-timeSincePeak * (hours / compound.halfLife) * 0.5)
                  : Math.exp(timeSincePeak * 2);
                const y = padding.top + graphHeight - (decay * graphHeight * 0.8);
                points.push(`${x},${y}`);
              }

              return (
                <polyline
                  key={compound.id}
                  points={points.join(' ')}
                  fill="none"
                  stroke={compound.color}
                  strokeWidth={activeCompound === compound.id ? 2 : 1.5}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* Axes */}
          <line
            x1={padding.left} y1={padding.top}
            x2={padding.left} y2={padding.top + graphHeight}
            stroke="#666" strokeWidth="1"
          />
          <line
            x1={padding.left} y1={padding.top + graphHeight}
            x2={padding.left + graphWidth} y2={padding.top + graphHeight}
            stroke="#666" strokeWidth="1"
          />
        </svg>

        {/* NOW label */}
        <span
          className="absolute text-[7px] text-white font-bold bg-black/80 px-1 rounded"
          style={{
            left: padding.left + nowPosition * graphWidth,
            top: padding.top + 2,
            transform: 'translateX(-50%)',
          }}
        >
          NOW
        </span>

        {/* X-axis time labels */}
        {Array.from({ length: xDivisions + 1 }).map((_, i) => {
          const pct = i / xDivisions;
          const hoursFromNow = (pct - nowPosition) * hours;
          const label = hoursFromNow === 0 ? '' :
            hoursFromNow > 0 ? `+${Math.round(hoursFromNow)}h` : `${Math.round(hoursFromNow)}h`;

          return (
            <span
              key={i}
              className="absolute text-[7px] text-gray-500 font-medium"
              style={{
                left: padding.left + pct * graphWidth,
                top: padding.top + graphHeight + 3,
                transform: 'translateX(-50%)',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      {/* Logging strip - inverted from logging page */}
      <button className="w-[22px] bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
        <span
          className="text-[7px] tracking-[0.15em] text-gray-400 font-bold"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          LOGGING
        </span>
      </button>
    </div>
  );
}
