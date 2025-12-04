/**
 * Logging Data Store
 *
 * Based on Logger Blueprint architecture:
 * - Daily logged data (variables, notes)
 * - Timestamped entries supporting multiple logs per day
 * - 30-day raw data retention
 * - Weekly/monthly compaction for older data
 */

// Default variable configurations (from blueprint logging variable pool)
export const DEFAULT_VARIABLES = {
  // Physical
  bodyweight: {
    id: 'bodyweight',
    label: 'BODYWEIGHT',
    type: 'slider',
    category: 'physical',
    baseline: 80,
    maxAbsValue: 10,
    stepSize: 0.1,
    unit: 'kg',
    decimals: 1,
    loggingMode: 'point_in_time',
    graphSeries: true,
    color: '#2563eb',
    marker: 'circle',
  },
  waist: {
    id: 'waist',
    label: 'WAIST',
    type: 'slider',
    category: 'physical',
    baseline: 85,
    maxAbsValue: 10,
    stepSize: 0.5,
    unit: 'cm',
    decimals: 1,
    loggingMode: 'point_in_time',
    graphSeries: true,
    color: '#8b5cf6',
    marker: 'diamond',
  },
  // Sleep
  sleep: {
    id: 'sleep',
    label: 'SLEEP',
    type: 'slider',
    category: 'sleep',
    baseline: 7,
    maxAbsValue: 4,
    stepSize: 0.25,
    unit: 'hrs',
    decimals: 1,
    loggingMode: 'summary',
    graphSeries: true,
    color: '#22c55e',
    marker: 'square',
  },
  // Mental
  energy: {
    id: 'energy',
    label: 'ENERGY',
    type: 'slider',
    category: 'mental',
    baseline: 5,
    maxAbsValue: 5,
    stepSize: 0.5,
    unit: '/10',
    decimals: 0,
    loggingMode: 'summary',
    graphSeries: true,
    color: '#ec4899',
    marker: 'circle',
  },
  mood: {
    id: 'mood',
    label: 'MOOD',
    type: 'slider',
    category: 'mental',
    baseline: 5,
    maxAbsValue: 5,
    stepSize: 1,
    unit: '/10',
    decimals: 0,
    loggingMode: 'summary',
    graphSeries: true,
    color: '#06b6d4',
    marker: 'triangle',
  },
  focus: {
    id: 'focus',
    label: 'FOCUS',
    type: 'slider',
    category: 'mental',
    baseline: 5,
    maxAbsValue: 5,
    stepSize: 1,
    unit: '/10',
    decimals: 0,
    loggingMode: 'summary',
    graphSeries: false,
    color: '#f59e0b',
    marker: 'diamond',
  },
  anxiety: {
    id: 'anxiety',
    label: 'ANXIETY',
    type: 'slider',
    category: 'mental',
    baseline: 3,
    maxAbsValue: 5,
    stepSize: 1,
    unit: '/10',
    decimals: 0,
    loggingMode: 'summary',
    graphSeries: false,
    color: '#ef4444',
    marker: 'triangle',
  },
};

// Categories for grouping variables
export const VARIABLE_CATEGORIES = {
  physical: { label: 'Physical', order: 1 },
  sleep: { label: 'Sleep', order: 2 },
  mental: { label: 'Mental', order: 3 },
  digestive: { label: 'Digestive', order: 4 },
  sexual: { label: 'Sexual', order: 5 },
  custom: { label: 'Custom', order: 6 },
};

/**
 * Create a new log entry
 * @param {string} variableId
 * @param {number} value - Relative value (deviation from baseline)
 * @param {Date} timestamp
 */
export function createLogEntry(variableId, value, timestamp = new Date()) {
  return {
    id: `${variableId}_${timestamp.getTime()}`,
    variableId,
    value,
    timestamp: timestamp.toISOString(),
    date: timestamp.toISOString().split('T')[0],
  };
}

/**
 * Aggregate multiple entries for the same variable on the same day
 * Uses the LAST entry for point_in_time, AVERAGE for summary
 * @param {Array} entries
 * @param {Object} variableConfig
 */
export function aggregateEntries(entries, variableConfig) {
  if (entries.length === 0) return null;
  if (entries.length === 1) return entries[0].value;

  if (variableConfig.loggingMode === 'point_in_time') {
    // Use latest entry
    const sorted = [...entries].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    return sorted[0].value;
  } else {
    // Average for summary mode
    const sum = entries.reduce((acc, e) => acc + e.value, 0);
    return sum / entries.length;
  }
}

/**
 * Convert raw log entries to daily history format for graph
 * @param {Array} entries - Raw log entries
 * @param {Object} variables - Variable configurations
 * @param {number} days - Number of days to include
 */
export function entriesToHistory(entries, variables, days = 30) {
  const history = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group entries by date
  const byDate = {};
  entries.forEach(entry => {
    const date = entry.date;
    if (!byDate[date]) byDate[date] = {};
    if (!byDate[date][entry.variableId]) byDate[date][entry.variableId] = [];
    byDate[date][entry.variableId].push(entry);
  });

  // Generate history for each day
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayValues = {};
    Object.keys(variables).forEach(varId => {
      const dayEntries = byDate[dateStr]?.[varId] || [];
      if (dayEntries.length > 0) {
        dayValues[varId] = aggregateEntries(dayEntries, variables[varId]);
      }
    });

    if (Object.keys(dayValues).length > 0) {
      history.push({ date: dateStr, values: dayValues });
    }
  }

  return history;
}

/**
 * Calculate statistics for a variable over a period
 * @param {Array} values
 */
export function calculateStats(values) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;

  return {
    mean,
    variance,
    stdDev: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    count: values.length,
  };
}

/**
 * Compact weekly data (for data older than 30 days)
 * @param {Array} history - Daily history entries
 */
export function compactToWeekly(history) {
  const weeks = {};

  history.forEach(day => {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks[weekKey]) weeks[weekKey] = { entries: [], values: {} };
    weeks[weekKey].entries.push(day);

    Object.entries(day.values).forEach(([varId, value]) => {
      if (!weeks[weekKey].values[varId]) weeks[weekKey].values[varId] = [];
      weeks[weekKey].values[varId].push(value);
    });
  });

  return Object.entries(weeks).map(([weekStart, data]) => ({
    weekStart,
    weekEnd: new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0],
    dayCount: data.entries.length,
    stats: Object.fromEntries(
      Object.entries(data.values).map(([varId, values]) => [
        varId,
        calculateStats(values),
      ])
    ),
  }));
}

/**
 * Get trend for a variable (week over week change)
 * @param {Array} history
 * @param {string} variableId
 */
export function getTrend(history, variableId) {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = history.filter(h => {
    const d = new Date(h.date);
    return d >= oneWeekAgo && h.values[variableId] !== undefined;
  }).map(h => h.values[variableId]);

  const lastWeek = history.filter(h => {
    const d = new Date(h.date);
    return d >= twoWeeksAgo && d < oneWeekAgo && h.values[variableId] !== undefined;
  }).map(h => h.values[variableId]);

  if (thisWeek.length === 0 || lastWeek.length === 0) return null;

  const thisAvg = thisWeek.reduce((a, b) => a + b, 0) / thisWeek.length;
  const lastAvg = lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length;
  const change = thisAvg - lastAvg;
  const changePct = lastAvg !== 0 ? (change / Math.abs(lastAvg)) * 100 : 0;

  return {
    thisWeekAvg: thisAvg,
    lastWeekAvg: lastAvg,
    change,
    changePct,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  };
}

/**
 * Local storage key
 */
const STORAGE_KEY = 'biologger_logs';

/**
 * Save logs to localStorage
 */
export function saveLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
}

/**
 * Load logs from localStorage
 */
export function loadLogs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load logs:', e);
    return [];
  }
}
