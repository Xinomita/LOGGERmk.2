import { useMemo } from 'react';

/**
 * VariableGraph - Displays multi-line graph with checkered grid background
 */
export const VariableGraph = ({
  series = [],
  activeVariable = null,
  normalized = true,
}) => {
  // Dimensions
  const height = 130;
  const width = 800;
  // Padding for graph CONTENT (lines, axes) - NOT for grid background
  const padding = { top: 10, right: 30, bottom: 20, left: 30 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  return (
    <div className="h-[130px] bg-white border-b-2 border-black flex">
      <div className="flex-1 relative overflow-hidden">
        {/*
          KEY FIX: preserveAspectRatio="none" stretches the SVG to fill
          the container completely, eliminating letterboxing/white space
        */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            {/* Small grid pattern - 5x5 cells */}
            <pattern
              id="smallGrid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#e8e8e8"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Large grid pattern - 4x4 small cells */}
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="40" fill="url(#smallGrid)"/>
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#ccc"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/*
            KEY FIX: Grid background fills ENTIRE SVG (0,0 to width,height)
            NOT constrained by padding - this ensures no white space
          */}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#grid)"
          />

          {/* Graph content area (respects padding) */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Horizontal guide lines at 25%, 50%, 75% */}
            <g stroke="#bbb" strokeWidth="0.5" strokeDasharray="4,4">
              {[0.25, 0.5, 0.75].map(ratio => (
                <line
                  key={ratio}
                  x1={0}
                  y1={graphHeight * ratio}
                  x2={graphWidth}
                  y2={graphHeight * ratio}
                />
              ))}
            </g>

            {/* Data lines would go here */}
            {series.map(s => {
              const isActive = activeVariable === null || activeVariable === s.id;
              return (
                <path
                  key={s.id}
                  d={s.path || ''}
                  fill="none"
                  stroke={s.color || '#000'}
                  strokeWidth={activeVariable === s.id ? 2.5 : 1.5}
                  strokeOpacity={isActive ? 1 : 0.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default VariableGraph;
