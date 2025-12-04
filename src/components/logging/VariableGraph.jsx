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
  timestampToX,
  getLinePath,
} from '../../utils/graphUtils';

// Marker shapes for different variables
const MARKERS = {
  circle: (x, y, r, fill, stroke) => (
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="1" />
  ),
  diamond: (x, y, r, fill, stroke) => (
    <polygon
      points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
  ),
  square: (x, y, r, fill, stroke) => (
    <rect
      x={x - r * 0.7}
      y={y - r * 0.7}
      width={r * 1.4}
      height={r * 1.4}
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
  ),
  triangle: (x, y, r, fill, stroke) => (
    <polygon
      points={`${x},${y - r} ${x + r},${y + r * 0.7} ${x - r},${y + r * 0.7}`}
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
  ),
};

const MARKER_TYPES = ['circle', 'diamond', 'square', 'triangle'];
const VIEWPORT_ORDER = ['week', 'month', 'year'];

/**
 * VariableGraph - Multi-variable line graph with normalization and viewports
 */
export default function VariableGraph({
  variables = [],
  history = [],
  activeVariable = null,
  onViewportChange = null,
}) {
  const [viewport, setViewport] = useState('month');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);

  // Track container width for proper scaling
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

  // Layout constants (in pixels, will scale with container)
  const height = 130;
  const padding = { top: 8, right: 10, bottom: 16, left: 28 };
  const graphHeight = height - padding.top - padding.bottom;
  const graphWidth = containerWidth - padding.left - padding.right;

  // Filter and potentially aggregate data based on viewport
  const filteredHistory = useMemo(() => {
    return filterToViewport(history, viewport);
  }, [history, viewport]);

  // Time range for X-axis
  const timeRange = useMemo(() => {
    return getTimeRange(filteredHistory);
  }, [filteredHistory]);

  // Calculate domains for each variable
  const domains = useMemo(() => {
    const result = {};
    variables.forEach(variable => {
      const values = filteredHistory.map(h => h.values[variable.id]).filter(v => v != null);
      result[variable.id] = getGraphDomain(variable, values);
    });
    return result;
  }, [variables, filteredHistory]);

  // Generate data points for each variable (as percentages)
  const series = useMemo(() => {
    return variables.map((variable, varIndex) => {
      const domain = domains[variable.id];
      const points = filteredHistory
        .map((h, index) => {
          const relativeValue = h.values[variable.id];
          if (relativeValue === null || relativeValue === undefined) return null;

          const absoluteValue = variable.baseline + relativeValue;
          const normalizedY = normalizeValueForGraph(absoluteValue, domain);

          const timestamp = new Date(h.date).getTime();
          // X as percentage of graph width
          const xPct = timeRange.max === timeRange.min ? 0.5 :
            (timestamp - timeRange.min) / (timeRange.max - timeRange.min);
          // Y as percentage of graph height
          const yPct = (GRAPH_NORMALIZED_EXTENT.max - normalizedY) /
            (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min);

          return { xPct, yPct, date: h.date, value: absoluteValue, index };
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

  // Axis ticks for active variable
  const axisTicks = useMemo(() => {
    if (!activeVariable) return [];
    const variable = variables.find(v => v.id === activeVariable);
    if (!variable) return [];
    return getAxisTicks(domains[activeVariable], variable.stepSize, 7);
  }, [activeVariable, variables, domains]);

  // X-axis ticks - more frequent based on viewport
  const xTicks = useMemo(() => {
    const { min, max } = timeRange;
    const ticks = [];

    // Determine tick count based on viewport
    let tickCount;
    if (viewport === 'week') tickCount = 7;
    else if (viewport === 'month') tickCount = 10;
    else tickCount = 12;

    for (let i = 0; i < tickCount; i++) {
      const pct = tickCount > 1 ? i / (tickCount - 1) : 0.5;
      const timestamp = min + (max - min) * pct;
      const date = new Date(timestamp);

      let label;
      if (viewport === 'year') {
        label = date.toLocaleDateString([], { month: 'short' });
      } else {
        label = date.getDate().toString();
      }

      ticks.push({ pct, label, timestamp });
    }

    return ticks;
  }, [timeRange, viewport]);

  // Y-axis grid lines (more frequent)
  const yGridLines = useMemo(() => {
    const lines = [];
    const count = 8;
    for (let i = 0; i <= count; i++) {
      lines.push(i / count);
    }
    return lines;
  }, []);

  // Map percentage to pixel Y
  const pctToY = (pct) => padding.top + pct * graphHeight;
  const pctToX = (pct) => padding.left + pct * graphWidth;

  // Cycle viewport on click
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
        {/* Grid background - contained to graph area only */}
        <div
          className="absolute"
          style={{
            left: padding.left,
            top: padding.top,
            width: graphWidth,
            height: graphHeight,
            backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <div
          className="absolute"
          style={{
            left: padding.left,
            top: padding.top,
            width: graphWidth,
            height: graphHeight,
            backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Viewport toggle button - top left */}
        <button
          onClick={cycleViewport}
          className="absolute z-10 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-gray-800 transition-colors"
          style={{ left: padding.left + 4, top: padding.top + 4 }}
        >
          {VIEWPORTS[viewport].label}
        </button>

        {/* SVG for lines and markers only */}
        <svg
          width={containerWidth}
          height={height}
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
        >
          {/* Y-axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + graphHeight}
            stroke="#333"
            strokeWidth="1"
          />

          {/* X-axis line */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#333"
            strokeWidth="1"
          />

          {/* Y-axis grid lines and ticks */}
          {yGridLines.map((pct, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={pctToY(pct)}
                x2={padding.left + graphWidth}
                y2={pctToY(pct)}
                stroke={pct === 0.5 ? '#bbb' : '#e5e5e5'}
                strokeWidth="0.5"
              />
              <line
                x1={padding.left - 3}
                y1={pctToY(pct)}
                x2={padding.left}
                y2={pctToY(pct)}
                stroke="#333"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* X-axis ticks */}
          {xTicks.map((tick, i) => (
            <line
              key={i}
              x1={pctToX(tick.pct)}
              y1={padding.top + graphHeight}
              x2={pctToX(tick.pct)}
              y2={padding.top + graphHeight + 3}
              stroke="#333"
              strokeWidth="1"
            />
          ))}

          {/* Data lines and markers */}
          {series.map(s => {
            const isActive = activeVariable === null || activeVariable === s.id;
            const opacity = isActive ? 1 : 0.2;
            const strokeWidth = activeVariable === s.id ? 2 : 1.5;

            // Convert percentage points to pixel coordinates
            const pixelPoints = s.points.map(p => ({
              x: pctToX(p.xPct),
              y: pctToY(p.yPct),
            }));

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
                />

                {s.points.map((point, idx) => {
                  const MarkerFn = MARKERS[s.marker] || MARKERS.circle;
                  const markerSize = activeVariable === s.id ? 3.5 : 2.5;
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

        {/* X-axis labels (HTML for crisp text) */}
        {xTicks.map((tick, i) => (
          <span
            key={i}
            className="absolute text-[9px] text-gray-600 font-medium"
            style={{
              left: pctToX(tick.pct),
              top: padding.top + graphHeight + 4,
              transform: 'translateX(-50%)',
            }}
          >
            {tick.label}
          </span>
        ))}

        {/* Y-axis labels - only when variable is active (HTML) */}
        {activeVariable &&
          axisTicks.slice(0, 7).map((tick, index) => {
            const variable = variables.find(v => v.id === activeVariable);
            if (!variable) return null;
            const yPct = (GRAPH_NORMALIZED_EXTENT.max - tick.normalizedY) /
              (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min);

            return (
              <span
                key={index}
                className="absolute text-[8px] font-semibold"
                style={{
                  right: containerWidth - padding.left + 4,
                  top: pctToY(yPct),
                  transform: 'translateY(-50%)',
                  color: variable.color,
                }}
              >
                {formatAxisValue(tick.value, variable)}
              </span>
            );
          })}

        {/* Hover tooltip (HTML) */}
        {hoveredPoint && (
          <div
            className="absolute bg-black/90 text-white px-2 py-1 rounded text-[10px] pointer-events-none z-20"
            style={{
              left: Math.min(Math.max(hoveredPoint.px, 50), containerWidth - 70),
              top: Math.max(hoveredPoint.py - 36, padding.top),
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
