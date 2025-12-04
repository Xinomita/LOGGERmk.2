import React, { useState, useMemo } from 'react';
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
  getXAxisTicks,
  getLinePath,
} from '../../utils/graphUtils';

// Marker shapes for different variables
const MARKERS = {
  circle: (x, y, r, fill, stroke) => (
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
  ),
  diamond: (x, y, r, fill, stroke) => (
    <polygon
      points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
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
      strokeWidth="1.5"
    />
  ),
  triangle: (x, y, r, fill, stroke) => (
    <polygon
      points={`${x},${y - r} ${x + r},${y + r * 0.7} ${x - r},${y + r * 0.7}`}
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
    />
  ),
};

const MARKER_TYPES = ['circle', 'diamond', 'square', 'triangle'];

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

  // Graph dimensions
  const height = 130;
  const width = 800;
  const padding = { top: 12, right: 8, bottom: 18, left: 32 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

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

  // Generate data points for each variable
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
          const x = timestampToX(timestamp, timeRange, graphWidth);
          const y =
            ((GRAPH_NORMALIZED_EXTENT.max - normalizedY) /
              (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min)) *
            graphHeight;

          return { x, y, date: h.date, value: absoluteValue, index };
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
  }, [variables, filteredHistory, domains, timeRange, graphWidth, graphHeight]);

  // Axis ticks for active variable
  const axisTicks = useMemo(() => {
    if (!activeVariable) return [];
    const variable = variables.find(v => v.id === activeVariable);
    if (!variable) return [];
    return getAxisTicks(domains[activeVariable], variable.stepSize, 5);
  }, [activeVariable, variables, domains]);

  // X-axis ticks
  const xTicks = useMemo(() => {
    return getXAxisTicks(timeRange, viewport, graphWidth);
  }, [timeRange, viewport, graphWidth]);

  // Map normalized Y to pixel Y
  const normalizedToGraphY = normalizedY => {
    return (
      ((GRAPH_NORMALIZED_EXTENT.max - normalizedY) /
        (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min)) *
      graphHeight
    );
  };

  const handleViewportChange = newViewport => {
    setViewport(newViewport);
    onViewportChange?.(newViewport);
  };

  return (
    <div className="h-[130px] bg-white border-b-2 border-black flex">
      <div className="flex-1 relative overflow-hidden">
        {/* CSS grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Y-axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + graphHeight}
            stroke="#333"
            strokeWidth="1.5"
          />

          {/* X-axis line */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#333"
            strokeWidth="1.5"
          />

          {/* Y-axis ticks and grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const normalizedY = GRAPH_NORMALIZED_EXTENT.min + ratio * (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min);
            const y = normalizedToGraphY(normalizedY);
            return (
              <g key={ratio}>
                {/* Grid line */}
                <line
                  x1={padding.left}
                  y1={padding.top + y}
                  x2={padding.left + graphWidth}
                  y2={padding.top + y}
                  stroke="#e0e0e0"
                  strokeWidth="0.5"
                  strokeDasharray={ratio === 0.5 ? 'none' : '2,2'}
                />
                {/* Tick mark */}
                <line
                  x1={padding.left - 4}
                  y1={padding.top + y}
                  x2={padding.left}
                  y2={padding.top + y}
                  stroke="#333"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Y-axis labels - only when variable is active */}
          {activeVariable &&
            axisTicks.slice(0, 5).map((tick, index) => {
              const y = normalizedToGraphY(tick.normalizedY);
              const variable = variables.find(v => v.id === activeVariable);
              if (!variable) return null;

              return (
                <text
                  key={index}
                  x={padding.left - 6}
                  y={padding.top + y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="7"
                  fontWeight="600"
                  fill={variable.color}
                  fontFamily="system-ui, sans-serif"
                >
                  {formatAxisValue(tick.value, variable)}
                </text>
              );
            })}

          {/* X-axis ticks and labels */}
          {xTicks.map((tick, index) => (
            <g key={index}>
              <line
                x1={padding.left + tick.x}
                y1={padding.top + graphHeight}
                x2={padding.left + tick.x}
                y2={padding.top + graphHeight + 4}
                stroke="#333"
                strokeWidth="1.5"
              />
              <text
                x={padding.left + tick.x}
                y={height - 2}
                textAnchor="middle"
                fontSize="7"
                fill="#666"
                fontWeight="500"
                fontFamily="system-ui, sans-serif"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Center baseline (normalized 0) */}
          <line
            x1={padding.left}
            y1={padding.top + normalizedToGraphY(0)}
            x2={padding.left + graphWidth}
            y2={padding.top + normalizedToGraphY(0)}
            stroke="#999"
            strokeWidth="1"
            strokeDasharray="4,2"
          />

          {/* Data lines and markers */}
          {series.map(s => {
            const isActive = activeVariable === null || activeVariable === s.id;
            const opacity = isActive ? 1 : 0.2;
            const strokeWidth = activeVariable === s.id ? 2.5 : 1.5;

            return (
              <g key={s.id}>
                {/* Line path */}
                <path
                  d={getLinePath(s.points.map(p => ({ x: padding.left + p.x, y: padding.top + p.y })))}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Markers */}
                {s.points.map((point, idx) => {
                  const MarkerFn = MARKERS[s.marker] || MARKERS.circle;
                  const markerSize = activeVariable === s.id ? 4 : 3;

                  return (
                    <g
                      key={idx}
                      style={{ cursor: 'pointer' }}
                      opacity={opacity}
                      onMouseEnter={() => setHoveredPoint({ ...point, variable: s })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {MarkerFn(
                        padding.left + point.x,
                        padding.top + point.y,
                        markerSize,
                        s.color,
                        '#fff'
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hoveredPoint && (
            <g>
              <rect
                x={Math.min(
                  Math.max(padding.left + hoveredPoint.x - 40, padding.left),
                  padding.left + graphWidth - 80
                )}
                y={Math.max(padding.top + hoveredPoint.y - 28, padding.top)}
                width="80"
                height="24"
                fill="rgba(0,0,0,0.9)"
                rx="3"
              />
              <text
                x={Math.min(
                  Math.max(padding.left + hoveredPoint.x, padding.left + 40),
                  padding.left + graphWidth - 40
                )}
                y={Math.max(padding.top + hoveredPoint.y - 18, padding.top + 10)}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={hoveredPoint.variable.color}
                fontFamily="system-ui, sans-serif"
              >
                {hoveredPoint.variable.label}
              </text>
              <text
                x={Math.min(
                  Math.max(padding.left + hoveredPoint.x, padding.left + 40),
                  padding.left + graphWidth - 40
                )}
                y={Math.max(padding.top + hoveredPoint.y - 7, padding.top + 21)}
                textAnchor="middle"
                fontSize="8"
                fill="#fff"
                fontFamily="system-ui, sans-serif"
              >
                {formatAxisValue(
                  hoveredPoint.value,
                  variables.find(v => v.id === hoveredPoint.variable.id) || {}
                )}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Right panel: Viewport selector + Compounds */}
      <div className="w-[22px] bg-black flex flex-col">
        {/* Viewport buttons */}
        <div className="flex flex-col items-center py-1 gap-0.5 border-b border-gray-800">
          {Object.entries(VIEWPORTS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleViewportChange(key)}
              className={`w-4 h-4 text-[6px] font-bold rounded-sm transition-colors ${
                viewport === key
                  ? 'bg-white text-black'
                  : 'bg-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Compounds button */}
        <button className="flex-1 flex items-center justify-center hover:bg-gray-900 transition-colors">
          <span
            className="text-[7px] tracking-[0.15em] text-gray-600 font-bold"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            COMPOUNDS
          </span>
        </button>
      </div>
    </div>
  );
}
