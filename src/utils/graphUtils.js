/**
 * Graph Utilities for Multi-Variable Visualization
 *
 * Handles normalization, domain calculation, axis formatting, and viewports
 * for displaying multiple variables with different units on a shared graph.
 */

// Fixed normalized range for all graph values
export const GRAPH_NORMALIZED_EXTENT = {
  min: -1.05,
  max: 1.05,
};

// Viewport configurations
export const VIEWPORTS = {
  day: { label: 'D', days: 1, aggregate: false },
  week: { label: 'W', days: 7, aggregate: false },
  month: { label: 'M', days: 30, aggregate: true },
  year: { label: 'Y', days: 365, aggregate: true },
};

/**
 * Calculate the graph domain (min/max) for a variable based on its configuration
 *
 * @param {Object} variable - Variable configuration from SLIDER_CONFIGS
 * @param {Array} values - Historical values (relative to baseline)
 * @returns {Object} - { min, max } domain for normalization
 */
export function getGraphDomain(variable, values = []) {
  const { baseline = 0, maxAbsValue, loggingMode, min: varMin, max: varMax } = variable;

  // For summary mode (fixed range sliders like mood, energy)
  // Domain is always baseline ± maxAbsValue
  if (loggingMode === 'summary' && maxAbsValue) {
    return {
      min: baseline - maxAbsValue,
      max: baseline + maxAbsValue,
    };
  }

  // If variable has explicit min/max, use those
  if (varMin !== undefined && varMax !== undefined) {
    const range = varMax - varMin;
    return {
      min: baseline - range / 2,
      max: baseline + range / 2,
    };
  }

  // For point-in-time mode or dynamic range
  if (values.length === 0) {
    // No data yet, use default range
    const defaultRange = maxAbsValue || 10;
    return {
      min: baseline - defaultRange,
      max: baseline + defaultRange,
    };
  }

  // Calculate absolute values (baseline + relative value)
  const absoluteValues = values.map(v => baseline + v);
  const dataMin = Math.min(...absoluteValues);
  const dataMax = Math.max(...absoluteValues);

  // Ensure domain includes the full configured range if maxAbsValue exists
  const configuredRange = maxAbsValue || (dataMax - dataMin) / 2;
  const domainMin = Math.min(dataMin, baseline - configuredRange);
  const domainMax = Math.max(dataMax, baseline + configuredRange);

  // Add 10% padding
  const range = domainMax - domainMin || 1;
  const padding = range * 0.1;

  return {
    min: domainMin - padding,
    max: domainMax + padding,
  };
}

/**
 * Normalize a value to the fixed graph range [-1.05, 1.05]
 *
 * @param {number} value - Absolute value (e.g., 78kg, 7.5hrs, 8/10)
 * @param {Object} domain - { min, max } from getGraphDomain
 * @returns {number} - Normalized value in range [-1.05, 1.05]
 */
export function normalizeValueForGraph(value, domain) {
  const { min, max } = domain;

  // Handle edge case: domain has no range
  if (max === min) {
    return 0; // Center of normalized range
  }

  // Map [min, max] to [-1.05, 1.05]
  const normalized =
    ((value - min) / (max - min)) *
      (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min) +
    GRAPH_NORMALIZED_EXTENT.min;

  return normalized;
}

/**
 * Denormalize a graph value back to absolute value
 */
export function denormalizeValueFromGraph(normalizedValue, domain) {
  const { min, max } = domain;

  if (max === min) {
    return min;
  }

  const value =
    ((normalizedValue - GRAPH_NORMALIZED_EXTENT.min) /
      (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min)) *
      (max - min) +
    min;

  return value;
}

/**
 * Generate axis tick values for a focused variable
 */
export function getAxisTicks(domain, stepSize, count = 5) {
  const { min, max } = domain;
  const range = max - min;

  // Calculate reasonable step
  const tickStep = stepSize
    ? stepSize * Math.ceil(range / (stepSize * count))
    : getNiceStep(range, count);

  const ticks = [];
  let tickValue = Math.ceil(min / tickStep) * tickStep;

  while (tickValue <= max && ticks.length < count + 2) {
    ticks.push({
      value: tickValue,
      normalizedY: normalizeValueForGraph(tickValue, domain),
    });
    tickValue += tickStep;
  }

  return ticks;
}

/**
 * Calculate a "nice" step value for axis ticks
 */
function getNiceStep(range, targetCount) {
  const roughStep = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceStep;
  if (normalized < 1.5) niceStep = 1;
  else if (normalized < 3) niceStep = 2;
  else if (normalized < 7) niceStep = 5;
  else niceStep = 10;

  return niceStep * magnitude;
}

/**
 * Format a value for axis display based on variable config
 */
export function formatAxisValue(value, variable) {
  const { stepSize = 1, unit = '', decimals } = variable;

  // Determine decimal places
  let decimalPlaces = decimals;
  if (decimalPlaces === undefined) {
    const stepStr = stepSize.toString();
    decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  }

  const formatted = value.toFixed(decimalPlaces);
  return unit ? `${formatted}${unit}` : formatted;
}

/**
 * Aggregate data points for longer viewports (month/year)
 * Groups by day and returns average value per day
 */
export function aggregateByDay(history) {
  const byDay = {};

  history.forEach(entry => {
    const dateKey = new Date(entry.date).toISOString().split('T')[0];

    if (!byDay[dateKey]) {
      byDay[dateKey] = { date: dateKey, values: {}, counts: {} };
    }

    Object.entries(entry.values || {}).forEach(([varId, value]) => {
      if (value !== null && value !== undefined) {
        byDay[dateKey].values[varId] = (byDay[dateKey].values[varId] || 0) + value;
        byDay[dateKey].counts[varId] = (byDay[dateKey].counts[varId] || 0) + 1;
      }
    });
  });

  return Object.values(byDay)
    .map(day => ({
      date: day.date,
      values: Object.fromEntries(
        Object.entries(day.values).map(([varId, sum]) => [
          varId,
          sum / day.counts[varId],
        ])
      ),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Filter history to viewport range
 */
export function filterToViewport(history, viewport, referenceDate = new Date()) {
  const days = VIEWPORTS[viewport]?.days || 30;
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - days);

  let filtered = history.filter(entry => new Date(entry.date) >= cutoff);

  if (VIEWPORTS[viewport]?.aggregate) {
    filtered = aggregateByDay(filtered);
  }

  return filtered;
}

/**
 * Convert timestamp to X position within graph bounds
 */
export function timestampToX(timestamp, timeRange, graphWidth) {
  const { min, max } = timeRange;
  const range = max - min || 1;
  return ((timestamp - min) / range) * graphWidth;
}

/**
 * Get time range from history data
 */
export function getTimeRange(history) {
  if (history.length === 0) {
    const now = Date.now();
    return { min: now - 86400000, max: now };
  }

  const timestamps = history.map(h => new Date(h.date).getTime());
  return {
    min: Math.min(...timestamps),
    max: Math.max(...timestamps),
  };
}

/**
 * Generate X-axis tick labels based on viewport
 */
export function getXAxisTicks(timeRange, viewport, graphWidth) {
  const { min, max } = timeRange;
  const ticks = [];

  const tickCount = viewport === 'day' ? 6 : viewport === 'week' ? 7 : 5;
  const step = (max - min) / Math.max(tickCount - 1, 1);

  for (let i = 0; i < tickCount; i++) {
    const timestamp = min + step * i;
    const date = new Date(timestamp);
    const x = tickCount > 1 ? (i / (tickCount - 1)) * graphWidth : graphWidth / 2;

    let label;
    if (viewport === 'day') {
      label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (viewport === 'year') {
      label = date.toLocaleDateString([], { month: 'short' });
    } else {
      label = date.getDate().toString().padStart(2, '0');
    }

    ticks.push({ x, label, timestamp });
  }

  return ticks;
}

/**
 * Monotone cubic interpolation for smooth SVG paths
 */
export function getLinePath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const n = points.length;
  const slopes = [];

  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    slopes.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx);
  }

  const tangents = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents.push(0);
    } else {
      tangents.push((slopes[i - 1] + slopes[i]) / 2);
    }
  }
  tangents.push(slopes[n - 2]);

  // Fritsch-Carlson constraint
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slopes[i]) < 1e-6) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / slopes[i];
      const beta = tangents[i + 1] / slopes[i];
      const s = alpha * alpha + beta * beta;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        tangents[i] = t * alpha * slopes[i];
        tangents[i + 1] = t * beta * slopes[i];
      }
    }
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const cp1x = points[i].x + dx / 3;
    const cp1y = points[i].y + (tangents[i] * dx) / 3;
    const cp2x = points[i + 1].x - dx / 3;
    const cp2y = points[i + 1].y - (tangents[i + 1] * dx) / 3;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  return path;
}

/**
 * Generate mock history data for testing (full year for all viewports)
 */
export function generateMockHistory(days = 365) {
  const history = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Use different wave patterns to create realistic-looking data
    const dayOfYear = i;
    const weekCycle = (i % 7) / 7;
    const monthCycle = (i % 30) / 30;

    history.push({
      date: date.toISOString().split('T')[0],
      values: {
        // Sleep: 7hrs baseline, varies ±3hrs, weekly pattern + longer trend
        sleep: Math.sin(weekCycle * Math.PI * 2) * 1.5 +
               Math.sin((dayOfYear / 60) * Math.PI * 2) * 1.2 +
               (Math.random() - 0.5) * 0.5,

        // Energy: 5 baseline, varies ±5, follows sleep loosely
        energy: Math.sin(weekCycle * Math.PI * 2 + 0.5) * 2 +
                Math.sin((dayOfYear / 45) * Math.PI * 2) * 2 +
                (Math.random() - 0.5) * 1,

        // Mood: 5 baseline, varies ±5, monthly cycle
        mood: Math.sin(monthCycle * Math.PI * 2) * 2 +
              Math.sin((dayOfYear / 90) * Math.PI * 2) * 2 +
              (Math.random() - 0.5) * 1,

        // Bodyweight: gradual trend over year + weekly fluctuations
        bodyweight: Math.sin(weekCycle * Math.PI * 2) * 0.5 +
                    Math.sin((dayOfYear / 180) * Math.PI) * 3 +
                    (dayOfYear / 365) * 2,

        // Waist: follows bodyweight pattern loosely
        waist: Math.sin(weekCycle * Math.PI * 2) * 0.3 +
               Math.sin((dayOfYear / 180) * Math.PI) * 2 +
               (dayOfYear / 365) * 1.5,
      },
    });
  }

  return history;
}
