import { useMemo } from 'react';
import { getLinePath, dataToPoints, normalizeData } from './graphUtils';

/**
 * Example usage - adapt to your existing component structure
 * 
 * Props:
 * - series: Array of { id, color, data: [{date, value}] }
 * - activeVariable: id of currently active series (or null)
 * - width, height: SVG dimensions
 * - padding: { top, left, right, bottom }
 * - normalized: boolean - whether to normalize all series to 0-1
 */
export const Graph = ({ 
  series, 
  activeVariable = null,
  width = 800,
  height = 200,
  padding = { top: 15, left: 18, right: 18, bottom: 25 },
  normalized = true,
  showPoints = false
}) => {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Convert series data to drawable paths
  const processedSeries = useMemo(() => {
    return series.map(s => {
      const data = normalized ? normalizeData(s.data) : s.data;
      const points = dataToPoints(data, { width: innerWidth, height: innerHeight });
      const path = getLinePath(points);
      
      return {
        id: s.id,
        color: s.color,
        points,
        path
      };
    });
  }, [series, innerWidth, innerHeight, normalized]);

  return (
    <svg width={width} height={height}>
      {/* Grid lines - customize as needed */}
      <g stroke="#222" strokeWidth="1">
        {[0.25, 0.5, 0.75].map(ratio => (
          <line
            key={ratio}
            x1={padding.left}
            y1={padding.top + innerHeight * ratio}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight * ratio}
          />
        ))}
      </g>

      {/* Data lines */}
      {processedSeries.map(s => {
        const isActive = activeVariable === null || activeVariable === s.id;
        
        return (
          <g key={s.id} transform={`translate(${padding.left}, ${padding.top})`}>
            <path
              d={s.path}
              fill="none"
              stroke={s.color}
              strokeWidth={activeVariable === s.id ? 2.5 : 1.5}
              strokeOpacity={isActive ? 1 : 0.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Optional: data point markers */}
            {showPoints && s.points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={activeVariable === s.id ? 3 : 2}
                fill={s.color}
                fillOpacity={isActive ? 1 : 0.25}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

export default Graph;
