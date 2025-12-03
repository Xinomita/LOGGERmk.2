import React, { useState, useMemo } from 'react';
import {
  GRAPH_NORMALIZED_EXTENT,
  getGraphDomain,
  normalizeValueForGraph,
  getAxisTicks,
  formatAxisValue,
} from '../../utils/graphUtils';

/**
 * VariableGraph - Multi-variable line graph with normalization
 *
 * Props:
 * - variables: Array of variable configs from SLIDER_CONFIGS
 * - history: Array of { date, values } where values is { variableId: relativeValue }
 * - activeVariable: Currently dragged variable ID (shows Y-axis labels)
 */
export default function VariableGraph({
  variables = [],
  history = [],
  activeVariable = null,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Graph dimensions
  const height = 130;
  const width = 800; // Will be scaled by viewBox
  const padding = { top: 15, right: 30, bottom: 18, left: 18 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate domains for each variable
  const domains = useMemo(() => {
    const result = {};
    variables.forEach(variable => {
      const values = history.map(h => h.values[variable.id] || 0);
      result[variable.id] = getGraphDomain(variable, values);
    });
    return result;
  }, [variables, history]);

  // Generate normalized data points for each variable
  const series = useMemo(() => {
    return variables.map(variable => {
      const domain = domains[variable.id];
      const points = history.map((h, index) => {
        const relativeValue = h.values[variable.id];
        if (relativeValue === null || relativeValue === undefined) return null;

        const absoluteValue = variable.baseline + relativeValue;
        const normalizedY = normalizeValueForGraph(absoluteValue, domain);

        // Map index to X position
        const x = (index / Math.max(history.length - 1, 1)) * graphWidth;
        // Map normalized Y to graph space (invert because SVG Y increases downward)
        const y = ((GRAPH_NORMALIZED_EXTENT.max - normalizedY) /
          (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min)) * graphHeight;

        return { x, y, date: h.date, value: absoluteValue, index };
      });

      return {
        id: variable.id,
        label: variable.label,
        color: variable.color,
        points: points.filter(p => p !== null),
      };
    });
  }, [variables, history, domains, graphWidth, graphHeight]);

  // Generate axis ticks for active variable (being dragged)
  const axisTicks = useMemo(() => {
    if (!activeVariable) return [];
    const variable = variables.find(v => v.id === activeVariable);
    if (!variable) return [];

    const domain = domains[activeVariable];
    return getAxisTicks(domain, variable.stepSize);
  }, [activeVariable, variables, domains]);

  // Generate smooth curve path using cubic Bezier curves
  const getLinePath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    // Calculate control points for smooth curves
    const getControlPoints = (p0, p1, p2, tension = 0.3) => {
      const d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
      const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

      const fa = tension * d01 / (d01 + d12);
      const fb = tension * d12 / (d01 + d12);

      const cp1x = p1.x - fa * (p2.x - p0.x);
      const cp1y = p1.y - fa * (p2.y - p0.y);
      const cp2x = p1.x + fb * (p2.x - p0.x);
      const cp2y = p1.y + fb * (p2.y - p0.y);

      return { cp1x, cp1y, cp2x, cp2y };
    };

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const { cp2x, cp2y } = getControlPoints(p0, p1, p2);
      const { cp1x, cp1y } = getControlPoints(p1, p2, p3);

      path += ` C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  // Map normalized Y to graph Y coordinate
  const normalizedToGraphY = (normalizedY) => {
    return ((GRAPH_NORMALIZED_EXTENT.max - normalizedY) /
      (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min)) * graphHeight;
  };

  return (
    <div className="h-[130px] bg-white border-b-2 border-black flex">
      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Graph area background with grid */}
          <defs>
            <pattern id="smallGrid" width="5" height="5.5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5.5" fill="none" stroke="#e8e8e8" strokeWidth="0.5"/>
            </pattern>
            <pattern id="grid" width="25" height="22" patternUnits="userSpaceOnUse">
              <rect width="25" height="22" fill="url(#smallGrid)"/>
              <path d="M 25 0 L 0 0 0 22" fill="none" stroke="#ccc" strokeWidth="0.5"/>
            </pattern>
          </defs>

          <rect
            x={padding.left}
            y={padding.top}
            width={graphWidth}
            height={graphHeight}
            fill="url(#grid)"
          />

          {/* Center line (normalized 0) */}
          <line
            x1={padding.left}
            y1={padding.top + normalizedToGraphY(0)}
            x2={padding.left + graphWidth}
            y2={padding.top + normalizedToGraphY(0)}
            stroke="#999"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity="0.5"
          />

          {/* Y-axis tick marks - always visible */}
          {[0.75, 0.5, 0.25, 0, -0.25, -0.5, -0.75].map(normalizedY => {
            const y = normalizedToGraphY(normalizedY);
            return (
              <line
                key={normalizedY}
                x1={padding.left - 3}
                y1={padding.top + y}
                x2={padding.left}
                y2={padding.top + y}
                stroke="#666"
                strokeWidth="1"
              />
            );
          })}

          {/* Y-axis labels - only show when dragging */}
          {activeVariable && axisTicks.slice(0, 5).map((tick, index) => {
            const y = normalizedToGraphY(tick.normalizedY);
            const variable = variables.find(v => v.id === activeVariable);

            return (
              <text
                key={index}
                x={padding.left - 5}
                y={padding.top + y}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="6"
                fontWeight="500"
                fill={variable.color}
              >
                {formatAxisValue(tick.value, variable)}
              </text>
            );
          })}

          {/* Line series for each variable */}
          {series.map(s => (
            <g key={s.id}>
              {/* Line path */}
              <path
                d={getLinePath(s.points)}
                fill="none"
                stroke={s.color}
                strokeWidth={activeVariable === s.id ? 2.5 : 1.5}
                strokeOpacity={activeVariable === null || activeVariable === s.id ? 1 : 0.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`translate(${padding.left}, ${padding.top})`}
              />

              {/* Data point circles */}
              {s.points.map((point, index) => (
                <circle
                  key={index}
                  cx={padding.left + point.x}
                  cy={padding.top + point.y}
                  r={activeVariable === s.id ? 2.5 : 1.5}
                  fill={s.color}
                  fillOpacity={activeVariable === null || activeVariable === s.id ? 1 : 0.25}
                  stroke="#fff"
                  strokeWidth="1"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ ...point, variable: s })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </g>
          ))}

          {/* X-axis labels (day of month) */}
          {history.length > 0 && [0, 7, 14, 21, 29].map(index => {
            if (index >= history.length) return null;
            const x = (index / Math.max(history.length - 1, 1)) * graphWidth;
            const date = new Date(history[index].date);
            const day = date.getDate();

            return (
              <text
                key={index}
                x={padding.left + x}
                y={height - 1}
                textAnchor="middle"
                fontSize="6"
                fill="#666"
                fontWeight="500"
              >
                {day.toString().padStart(2, '0')}
              </text>
            );
          })}

          {/* Hover tooltip */}
          {hoveredPoint && (
            <g>
              <rect
                x={Math.min(Math.max(padding.left + hoveredPoint.x - 35, padding.left), padding.left + graphWidth - 70)}
                y={Math.max(padding.top + hoveredPoint.y - 22, padding.top + 5)}
                width="70"
                height="18"
                fill="rgba(0, 0, 0, 0.95)"
                rx="2"
              />
              <text
                x={Math.min(Math.max(padding.left + hoveredPoint.x, padding.left + 35), padding.left + graphWidth - 35)}
                y={Math.max(padding.top + hoveredPoint.y - 14, padding.top + 13)}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill={hoveredPoint.variable.color}
              >
                {hoveredPoint.variable.label}
              </text>
              <text
                x={Math.min(Math.max(padding.left + hoveredPoint.x, padding.left + 35), padding.left + graphWidth - 35)}
                y={Math.max(padding.top + hoveredPoint.y - 6, padding.top + 21)}
                textAnchor="middle"
                fontSize="7"
                fill="#fff"
              >
                {formatAxisValue(
                  hoveredPoint.value,
                  variables.find(v => v.id === hoveredPoint.variable.id)
                )}
              </text>
            </g>
          )}
        </svg>
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
