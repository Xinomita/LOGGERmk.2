/**
 * Graph Utilities for Multi-Variable Visualization
 *
 * Handles normalization, domain calculation, and axis formatting
 * for displaying multiple variables with different units on a shared graph.
 */

// Fixed normalized range for all graph values
export const GRAPH_NORMALIZED_EXTENT = {
  min: -1.05,
  max: 1.05,
};

/**
 * Calculate the graph domain (min/max) for a variable based on its configuration
 *
 * @param {Object} variable - Variable configuration from SLIDER_CONFIGS
 * @param {Array} values - Historical values (relative to baseline, e.g., [-1, 0, 0.5, 1])
 * @returns {Object} - { min, max } domain for normalization
 */
export function getGraphDomain(variable, values = []) {
  const { baseline, maxAbsValue, loggingMode } = variable;

  // For summary mode (fixed range sliders like mood, energy)
  // Domain is always baseline ± maxAbsValue
  if (loggingMode === 'summary') {
    return {
      min: baseline - maxAbsValue,
      max: baseline + maxAbsValue,
    };
  }

  // For point-in-time mode (dynamic range sliders like bodyweight)
  // Domain can expand based on actual logged values
  if (values.length === 0) {
    // No data yet, use default range
    return {
      min: baseline - maxAbsValue,
      max: baseline + maxAbsValue,
    };
  }

  // Calculate absolute values (baseline + relative value)
  const absoluteValues = values.map(v => baseline + v);
  const dataMin = Math.min(...absoluteValues);
  const dataMax = Math.max(...absoluteValues);

  // Ensure domain includes the full configured range
  const domainMin = Math.min(dataMin, baseline - maxAbsValue);
  const domainMax = Math.max(dataMax, baseline + maxAbsValue);

  return {
    min: domainMin,
    max: domainMax,
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
  const normalized = ((value - min) / (max - min)) *
    (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min) +
    GRAPH_NORMALIZED_EXTENT.min;

  return normalized;
}

/**
 * Denormalize a graph value back to absolute value
 *
 * @param {number} normalizedValue - Value in range [-1.05, 1.05]
 * @param {Object} domain - { min, max } from getGraphDomain
 * @returns {number} - Absolute value
 */
export function denormalizeValueFromGraph(normalizedValue, domain) {
  const { min, max } = domain;

  if (max === min) {
    return min;
  }

  // Map [-1.05, 1.05] back to [min, max]
  const value = ((normalizedValue - GRAPH_NORMALIZED_EXTENT.min) /
    (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min)) *
    (max - min) + min;

  return value;
}

/**
 * Generate axis tick values for a focused variable
 *
 * @param {Object} domain - { min, max } from getGraphDomain
 * @param {number} stepSize - Step size from variable config
 * @returns {Array} - Array of { value, normalizedY } for tick marks
 */
export function getAxisTicks(domain, stepSize) {
  const { min, max } = domain;
  const ticks = [];

  // Calculate reasonable number of ticks (aim for 5-7)
  const range = max - min;
  const tickStep = stepSize * Math.ceil(range / (stepSize * 6));

  // Generate ticks from min to max
  let tickValue = Math.ceil(min / tickStep) * tickStep;

  while (tickValue <= max) {
    ticks.push({
      value: tickValue,
      normalizedY: normalizeValueForGraph(tickValue, domain),
    });
    tickValue += tickStep;
  }

  return ticks;
}

/**
 * Format a value for axis display based on variable config
 *
 * @param {number} value - Value to format
 * @param {Object} variable - Variable configuration
 * @returns {string} - Formatted string (e.g., "78.5kg", "7.5hrs", "8/10")
 */
export function formatAxisValue(value, variable) {
  const { stepSize, unit } = variable;

  // Determine decimal places from step size
  const stepStr = stepSize.toString();
  const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;

  const formatted = decimalPlaces === 0
    ? value.toFixed(0)
    : value.toFixed(decimalPlaces);

  return `${formatted}${unit}`;
}

/**
 * Generate mock history data for testing
 *
 * @param {number} days - Number of days of history
 * @returns {Array} - Array of { date, values } objects
 */
export function generateMockHistory(days = 30) {
  const history = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    history.push({
      date: date.toISOString().split('T')[0],
      values: {
        // Mock values - will be replaced with real data
        sleep: Math.sin(i / 5) * 1.5, // Oscillating around baseline
        energy: Math.cos(i / 7) * 2 + Math.random() * 0.5,
        mood: Math.sin(i / 4) * 2.5 + Math.random() * 0.3,
        bodyweight: i * 0.05, // Gradual increase
      },
    });
  }

  return history;
}
