import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GRAPH_NORMALIZED_EXTENT,
  VIEWPORTS,
  getGraphDomain,
  normalizeValueForGraph,
  getAxisTicks,
  formatAxisValue,
  filterToViewport,
  getTimeRange,
  getLinePath,
} from '../../utils/graphUtils';

// Marker shapes
const MARKERS = {
  circle: (x, y, r, fill, stroke) => (
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="1" />
  ),
  diamond: (x, y, r, fill, stroke) => (
    <polygon
      points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
      fill={fill} stroke={stroke} strokeWidth="1"
    />
  ),
  square: (x, y, r, fill, stroke) => (
    <rect x={x - r * 0.7} y={y - r * 0.7} width={r * 1.4} height={r * 1.4}
      fill={fill} stroke={stroke} strokeWidth="1"
    />
  ),
  triangle: (x, y, r, fill, stroke) => (
    <polygon
      points={`${x},${y - r} ${x + r},${y + r * 0.7} ${x - r},${y + r * 0.7}`}
      fill={fill} stroke={stroke} strokeWidth="1"
    />
  ),
};

const MARKER_TYPES = ['circle', 'diamond', 'square', 'triangle'];
const VIEWPORT_ORDER = ['week', 'month', 'year'];

export default function VariableGraph({
  variables = [],
  history = [],
  activeVariable = null,
  onViewportChange = null,
}) {
  const [viewport, setViewport] = useState('month');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(400);

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

  // Layout with enough space for axis labels
  const height = 130;
  const padding = { top: 6, right: 6, bottom: 16, left: 8 };
  const graphHeight = height - padding.top - padding.bottom;
  const graphWidth = containerWidth - padding.left - padding.right;

  // Grid configuration - aligned with axes
  const xDivisions = viewport === 'week' ? 7 : viewport === 'month' ? 10 : 12;
  const yDivisions = 6;
  const smallGridX = graphWidth / (xDivisions * 4);
  const smallGridY = graphHeight / (yDivisions * 4);
  const largeGridX = graphWidth / xDivisions;
  const largeGridY = graphHeight / yDivisions;

  const filteredHistory = useMemo(() => filterToViewport(history, viewport), [history, viewport]);
  const timeRange = useMemo(() => getTimeRange(filteredHistory), [filteredHistory]);

  const domains = useMemo(() => {
    const result = {};
    variables.forEach(variable => {
      const values = filteredHistory.map(h => h.values[variable.id]).filter(v => v != null);
      result[variable.id] = getGraphDomain(variable, values);
    });
    return result;
  }, [variables, filteredHistory]);

  // Generate series with percentage-based coordinates
  const series = useMemo(() => {
    return variables.map((variable, varIndex) => {
      const domain = domains[variable.id];
      const points = filteredHistory
        .map((h) => {
          const relativeValue = h.values[variable.id];
          if (relativeValue === null || relativeValue === undefined) return null;

          const absoluteValue = variable.baseline + relativeValue;
          const normalizedY = normalizeValueForGraph(absoluteValue, domain);
          const timestamp = new Date(h.date).getTime();

          const xPct = timeRange.max === timeRange.min ? 0.5 :
            (timestamp - timeRange.min) / (timeRange.max - timeRange.min);
          const yPct = (GRAPH_NORMALIZED_EXTENT.max - normalizedY) /
            (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min);

          return { xPct, yPct, date: h.date, value: absoluteValue };
        })
        .filter(p => p !== null);

      return {
        id: variable.id,
        label: variable.label,
        color: variable.color || '#666',
        marker: variable.marker || MARKER_TYPES[varIndex % MARKER_TYPES.length],
        points,
      };
    });
  }, [variables, filteredHistory, domains, timeRange]);

  const axisTicks = useMemo(() => {
    if (!activeVariable) return [];
    const variable = variables.find(v => v.id === activeVariable);
    if (!variable) return [];
    return getAxisTicks(domains[activeVariable], variable.stepSize, 6);
  }, [activeVariable, variables, domains]);

  // X-axis ticks - one per day for week, otherwise spaced evenly
  const xTicks = useMemo(() => {
    const ticks = [];
    const count = xDivisions;

    for (let i = 0; i <= count; i++) {
      const pct = i / count;
      const timestamp = timeRange.min + (timeRange.max - timeRange.min) * pct;
      const date = new Date(timestamp);
      const label = date.getDate().toString();
      ticks.push({ pct, label });
    }
    return ticks;
  }, [timeRange, xDivisions]);

  const pctToY = (pct) => padding.top + pct * graphHeight;
  const pctToX = (pct) => padding.left + pct * graphWidth;

  const cycleViewport = () => {
    const currentIndex = VIEWPORT_ORDER.indexOf(viewport);
    const nextIndex = (currentIndex + 1) % VIEWPORT_ORDER.length;
    const newViewport = VIEWPORT_ORDER[nextIndex];
    setViewport(newViewport);
    onViewportChange?.(newViewport);
  };

  return (
    <div className="h-[130px] bg-white border-b-2 border-black flex">
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {/* Viewport toggle - compact, top-left inside graph */}
        <button
          onClick={cycleViewport}
          className="absolute z-10 bg-black/80 text-white text-[8px] font-bold w-5 h-5 flex items-center justify-center rounded-sm hover:bg-black transition-colors"
          style={{ left: padding.left + 2, top: padding.top + 2 }}
        >
          {VIEWPORTS[viewport].label}
        </button>

        <svg
          width={containerWidth}
          height={height}
          className="absolute inset-0"
        >
          {/* Clip path for grid area */}
          <defs>
            <clipPath id="graphArea">
              <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} />
            </clipPath>
          </defs>

          {/* Grid - SVG based, aligned with axes */}
          <g clipPath="url(#graphArea)">
            {/* Small grid */}
            {Array.from({ length: Math.ceil(graphWidth / smallGridX) + 1 }).map((_, i) => (
              <line
                key={`vsmall${i}`}
                x1={padding.left + i * smallGridX}
                y1={padding.top}
                x2={padding.left + i * smallGridX}
                y2={padding.top + graphHeight}
                stroke="#f0f0f0"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: Math.ceil(graphHeight / smallGridY) + 1 }).map((_, i) => (
              <line
                key={`hsmall${i}`}
                x1={padding.left}
                y1={padding.top + i * smallGridY}
                x2={padding.left + graphWidth}
                y2={padding.top + i * smallGridY}
                stroke="#f0f0f0"
                strokeWidth="0.5"
              />
            ))}
            {/* Large grid - aligned with axis divisions */}
            {Array.from({ length: xDivisions + 1 }).map((_, i) => (
              <line
                key={`vlarge${i}`}
                x1={padding.left + i * largeGridX}
                y1={padding.top}
                x2={padding.left + i * largeGridX}
                y2={padding.top + graphHeight}
                stroke="#ddd"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: yDivisions + 1 }).map((_, i) => (
              <line
                key={`hlarge${i}`}
                x1={padding.left}
                y1={padding.top + i * largeGridY}
                x2={padding.left + graphWidth}
                y2={padding.top + i * largeGridY}
                stroke="#ddd"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Axes */}
          <line
            x1={padding.left} y1={padding.top}
            x2={padding.left} y2={padding.top + graphHeight}
            stroke="#333" strokeWidth="1"
          />
          <line
            x1={padding.left} y1={padding.top + graphHeight}
            x2={padding.left + graphWidth} y2={padding.top + graphHeight}
            stroke="#333" strokeWidth="1"
          />

          {/* Y-axis ticks */}
          {Array.from({ length: yDivisions + 1 }).map((_, i) => (
            <line
              key={`ytick${i}`}
              x1={padding.left - 2}
              y1={padding.top + i * largeGridY}
              x2={padding.left}
              y2={padding.top + i * largeGridY}
              stroke="#333" strokeWidth="1"
            />
          ))}

          {/* X-axis ticks */}
          {xTicks.map((tick, i) => (
            <line
              key={`xtick${i}`}
              x1={pctToX(tick.pct)}
              y1={padding.top + graphHeight}
              x2={pctToX(tick.pct)}
              y2={padding.top + graphHeight + 2}
              stroke="#333" strokeWidth="1"
            />
          ))}

          {/* Data lines and markers */}
          {series.map(s => {
            const isActive = activeVariable === null || activeVariable === s.id;
            const opacity = isActive ? 1 : 0.2;
            const strokeWidth = activeVariable === s.id ? 2 : 1.5;
            const pixelPoints = s.points.map(p => ({ x: pctToX(p.xPct), y: pctToY(p.yPct) }));

            return (
              <g key={s.id}>
                <path
                  d={getLinePath(pixelPoints)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={s.marker === 'square' ? '4,2' : undefined}
                />
                {s.points.map((point, idx) => {
                  const MarkerFn = MARKERS[s.marker] || MARKERS.circle;
                  const markerSize = activeVariable === s.id ? 3 : 2;
                  const px = pctToX(point.xPct);
                  const py = pctToY(point.yPct);

                  return (
                    <g
                      key={idx}
                      style={{ cursor: 'pointer' }}
                      opacity={opacity}
                      onMouseEnter={() => setHoveredPoint({ ...point, px, py, variable: s })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {MarkerFn(px, py, markerSize, s.color, '#fff')}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels - HTML */}
        {xTicks.filter((_, i) => i % 2 === 0 || viewport === 'week').map((tick, i) => (
          <span
            key={i}
            className="absolute text-[8px] text-gray-500 font-medium"
            style={{
              left: pctToX(tick.pct),
              top: padding.top + graphHeight + 3,
              transform: 'translateX(-50%)',
            }}
          >
            {tick.label}
          </span>
        ))}

        {/* Y-axis labels when active */}
        {activeVariable && axisTicks.map((tick, index) => {
          const variable = variables.find(v => v.id === activeVariable);
          if (!variable) return null;
          const yPct = (GRAPH_NORMALIZED_EXTENT.max - tick.normalizedY) /
            (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min);
          if (yPct < 0 || yPct > 1) return null;

          return (
            <span
              key={index}
              className="absolute text-[7px] font-semibold whitespace-nowrap"
              style={{
                left: padding.left + 3,
                top: pctToY(yPct),
                transform: 'translateY(-50%)',
                color: variable.color,
              }}
            >
              {formatAxisValue(tick.value, variable)}
            </span>
          );
        })}

        {/* Hover tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-black/90 text-white px-2 py-1 rounded text-[9px] pointer-events-none z-20 whitespace-nowrap"
            style={{
              left: Math.min(Math.max(hoveredPoint.px, 40), containerWidth - 60),
              top: Math.max(hoveredPoint.py - 32, padding.top),
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold" style={{ color: hoveredPoint.variable.color }}>
              {hoveredPoint.variable.label}
            </div>
            <div>
              {formatAxisValue(
                hoveredPoint.value,
                variables.find(v => v.id === hoveredPoint.variable.id) || {}
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compounds strip */}
      <button className="w-[22px] bg-black flex items-center justify-center hover:bg-gray-900 transition-colors">
        <span
          className="text-[7px] tracking-[0.15em] text-gray-600 font-bold"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          COMPOUNDS
        </span>
      </button>
    </div>
  );
}
