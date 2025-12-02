// Variable Library - Central catalog of all available logging variables
// This file contains the master definition of all possible variables users can select from

export const GRAPH_NORMALIZED_EXTENT = { min: -1.05, max: 1.05 };

export const VARIABLE_LIBRARY = {
  // === PHYSICAL METRICS ===
  bodyweight: {
    id: 'bodyweight',
    label: 'BODYWEIGHT',
    type: 'slider',
    min: 73.5,
    max: 83.5,
    step: 0.5,
    units: 'kg',
    defaultValue: 78.5,
    category: 'physical',
    graphSeries: true,
    graphMarker: 'circle',
    graphColor: '#2A66E5',
    graphBaseline: 78.5,
    graphAxis: {
      unit: 'kg',
      decimals: 1,
      tickCount: 5,
      tickStep: 0.5,
    },
    description: 'Daily body weight measurement'
  },
  
  waist: {
    id: 'waist',
    label: 'WAIST',
    type: 'slider',
    min: 68,
    max: 84,
    step: 0.5,
    units: 'cm',
    defaultValue: 74.5,
    category: 'physical',
    graphSeries: true,
    graphMarker: 'triangle',
    graphColor: '#FF3DB5',
    graphBaseline: 74.5,
    graphAxis: {
      unit: 'cm',
      decimals: 1,
      tickCount: 6,
      tickStep: 1,
    },
    description: 'Waist circumference measurement'
  },
  
  waterIntake: {
    id: 'waterIntake',
    label: 'WATER INTAKE',
    type: 'slider',
    min: 0,
    max: 6,
    step: 0.25,
    units: 'liters',
    defaultValue: 2.3,
    category: 'physical',
    description: 'Daily water consumption'
  },
  
  // bowelMovement: {
  //   id: 'bowelMovement',
  //   label: 'BOWEL MOVEMENT',
  //   type: 'slider',
  //   min: 0,
  //   max: 6,
  //   step: 1,
  //   units: 'count',
  //   defaultValue: 1,
  //   category: 'physical',
  //   description: 'Number of bowel movements today'
  // },

  // === WELLNESS METRICS ===
  sleep: {
    id: 'sleep',
    label: 'SLEEP',
    type: 'slider',
    min: 4,
    max: 10,
    step: 0.25,
    units: 'hours',
    defaultValue: 7.1,
    category: 'wellness',
    graphSeries: true,
    graphMarker: 'square',
    graphColor: '#00FF00',
    graphBaseline: 7.1,
    graphAxis: {
      unit: 'h',
      decimals: 2,
      tickCount: 6,
      tickStep: 0.25,
    },
    description: 'Hours of sleep last night'
  },
  
  energy: {
    id: 'energy',
    label: 'ENERGY',
    type: 'slider',
    min: 0,
    max: 10,
    step: 0.5,
    units: 'rating',
    defaultValue: 6.8,
    category: 'wellness',
    graphSeries: true,
    graphMarker: 'cross',
    graphColor: '#FF9800',
    graphBaseline: 6.6,
    graphAxis: {
      unit: 'score',
      decimals: 1,
      tickCount: 5,
      tickStep: 0.5,
    },
    description: 'Subjective energy level (1-10)'
  },
  
  mood: {
    id: 'mood',
    label: 'MOOD',
    type: 'slider',
    min: 0,
    max: 10,
    step: 1,
    units: 'rating',
    defaultValue: 5,
    category: 'wellness',
    description: 'Overall mood rating (0-10)'
  },
  
  stress: {
    id: 'stress',
    label: 'STRESS',
    type: 'slider',
    min: 0,
    max: 10,
    step: 1,
    units: 'rating',
    defaultValue: 3,
    category: 'wellness',
    description: 'Stress level (0-10)'
  },

  // === LIFESTYLE METRICS ===
  workout: {
    id: 'workout',
    label: 'WORKOUT',
    type: 'toggle',
    options: ['YES', 'NO', 'MORNING WOOD'],
    defaultValue: 'YES',
    units: null,
    category: 'lifestyle',
    description: 'Did you work out today?'
  }
};

// Default variable selections for new users
export const DEFAULT_VARIABLE_SELECTIONS = [
  'bodyweight',
  'waist',
  'sleep',
  'energy',
  'workout'
  // 'bowelMovement'
];

// Categories for organizing the variable library
export const VARIABLE_CATEGORIES = {
  physical: {
    label: 'Physical Metrics',
    description: 'Body measurements and physical health indicators',
    color: '#2A66E5'
  },
  wellness: {
    label: 'Wellness & Mental',
    description: 'Sleep, mood, energy, and mental health metrics',
    color: '#28A745'
  },
  lifestyle: {
    label: 'Lifestyle & Activities',
    description: 'Daily activities, habits, and lifestyle choices',
    color: '#FF6B35'
  }
};

// Calculate dynamic bounds that center around the last measurement
export const calculateDynamicBounds = (lastValue, originalMin, originalMax, step) => {
  const originalRange = originalMax - originalMin;
  const halfRange = originalRange / 2;

  // Center the range around the last measurement
  let newMin = lastValue - halfRange;
  let newMax = lastValue + halfRange;

  // Round to valid increments
  const stepsFromOriginalMin = Math.round((newMin - originalMin) / step);
  newMin = originalMin + (stepsFromOriginalMin * step);

  const stepsFromOriginalMinForMax = Math.round((newMax - originalMin) / step);
  newMax = originalMin + (stepsFromOriginalMinForMax * step);

  // Ensure we maintain the same total range by adjusting if needed
  const actualRange = newMax - newMin;
  if (Math.abs(actualRange - originalRange) > step) {
    newMax = newMin + originalRange;
  }

  return { min: newMin, max: newMax };
};

// Get dynamic variable definition based on last measurement
export const getDynamicVariableDefinition = (variableId, lastValue = null) => {
  const baseVariable = VARIABLE_LIBRARY[variableId];
  if (!baseVariable) return null;

  // If no last value provided or not a slider, return original definition
  if (lastValue === null || baseVariable.type !== 'slider') {
    return getVariableDefinition(variableId);
  }

  // Calculate dynamic bounds
  const dynamicBounds = calculateDynamicBounds(
    lastValue,
    baseVariable.min,
    baseVariable.max,
    baseVariable.step
  );

  // Create variable with dynamic bounds
  const dynamicVariable = {
    ...baseVariable,
    min: dynamicBounds.min,
    max: dynamicBounds.max,
    defaultValue: lastValue, // Slider operates centered on last measurement
    graphBaseline: lastValue // Update baseline for graph
  };

  // Apply layout calculations to the dynamic variable
  const layoutProps = calculateLayoutProperties(dynamicVariable);

  return {
    ...dynamicVariable,
    ...layoutProps
  };
};

// Calculate increment-based graph scale for proportional visual impact
const calculateIncrementBasedScale = (variable) => {
  if (variable.type !== 'slider') {
    return 1;
  }

  const totalIncrements = Math.round((variable.max - variable.min) / variable.step);

  // Base scale factor: how many increments should span the full graph height
  // We want ~40% of total increments to span from center to edge of normalized range
  const baseScaleFactor = 0.4;
  const incrementsToEdge = Math.max(3, totalIncrements * baseScaleFactor);

  // Convert increment count to actual value span
  const valuePerIncrement = variable.step;
  const scaleInValueUnits = incrementsToEdge * valuePerIncrement;

  return scaleInValueUnits;
};

const fallbackGraphScale = (variable) => {
  if (typeof variable.graphScale === 'number' && variable.graphScale !== 0) {
    return variable.graphScale;
  }

  // Use increment-based scaling for more proportional representation
  return calculateIncrementBasedScale(variable);
};

export const getGraphDomain = (variableId, values = []) => {
  const variable = VARIABLE_LIBRARY[variableId];
  if (!variable) {
    return { min: -1, max: 1 };
  }
  const baseline = variable.graphBaseline ?? variable.defaultValue ?? 0;
  let min = baseline - fallbackGraphScale(variable);
  let max = baseline + fallbackGraphScale(variable);

  values.forEach((entry) => {
    const numeric = typeof entry === 'number' ? entry : entry?.value;
    if (!Number.isFinite(numeric)) return;
    if (numeric < min) min = numeric;
    if (numeric > max) max = numeric;
  });

  if (Math.abs(max - min) < 1e-6) {
    min = baseline - 1;
    max = baseline + 1;
  }

  return { min, max };
};

// Calculate layout properties for any variable (moved from loggingConfig.js)
export const calculateLayoutProperties = (variable) => {
  if (variable.type === 'toggle') {
    return {
      totalIncrements: variable.options.length,
      layoutPriority: 'LOW',
      preferredWidth: 'HALF',
      minWidth: 200
    };
  }
  
  if (variable.type === 'slider') {
    const totalIncrements = Math.round((variable.max - variable.min) / variable.step);
    
    let layoutPriority, preferredWidth, minWidth;
    
    if (totalIncrements > 100) {
      layoutPriority = 'HIGH';
      preferredWidth = 'FULL';
      minWidth = 300;
    } else if (totalIncrements > 20) {
      layoutPriority = 'MEDIUM';
      preferredWidth = 'HALF';
      minWidth = 200;
    } else {
      layoutPriority = 'LOW';
      preferredWidth = 'QUARTER';
      minWidth = 150;
    }
    
    return {
      totalIncrements,
      layoutPriority,
      preferredWidth,
      minWidth
    };
  }
  
  return {
    totalIncrements: 1,
    layoutPriority: 'LOW',
    preferredWidth: 'HALF',
    minWidth: 200
  };
};

// Get enriched variable data with layout calculations
export const getVariableDefinition = (variableId) => {
  const variable = VARIABLE_LIBRARY[variableId];
  if (!variable) return null;
  
  const layoutProps = calculateLayoutProperties(variable);
  
  return {
    ...variable,
    ...layoutProps
  };
};

export const normalizeValueForGraph = (variableId, rawValue, domainOverride) => {
  const variable = VARIABLE_LIBRARY[variableId];
  if (!variable) return 0;
  const domain = domainOverride ?? getGraphDomain(variableId, [rawValue]);
  const span = Math.max(1e-6, domain.max - domain.min);
  const ratio = (rawValue - domain.min) / span;
  const normalized = GRAPH_NORMALIZED_EXTENT.min + ratio * (GRAPH_NORMALIZED_EXTENT.max - GRAPH_NORMALIZED_EXTENT.min);
  return Math.max(GRAPH_NORMALIZED_EXTENT.min, Math.min(GRAPH_NORMALIZED_EXTENT.max, normalized));
};

export const getGraphAxisConfig = (variableId) => {
  const variable = VARIABLE_LIBRARY[variableId];
  if (!variable?.graphSeries) {
    return { unit: '', decimals: null, tickCount: 5, formatter: null, xFormatter: null };
  }
  const axis = variable.graphAxis ?? {};
  return {
    unit: axis.unit ?? variable.units ?? '',
    decimals: typeof axis.decimals === 'number' ? axis.decimals : null,
    tickCount: typeof axis.tickCount === 'number' ? axis.tickCount : 5,
    tickStep: typeof axis.tickStep === 'number' && axis.tickStep > 0 ? axis.tickStep : null,
    xTickCount: typeof axis.xTickCount === 'number' ? axis.xTickCount : null,
    formatter: typeof axis.formatter === 'function' ? axis.formatter : null,
    xFormatter: typeof axis.xFormatter === 'function' ? axis.xFormatter : null,
  };
};

export const getGraphDisplayConfig = (variableId) => {
  const variable = VARIABLE_LIBRARY[variableId];
  if (!variable?.graphSeries) return null;
  return {
    id: variableId,
    label: variable.label,
    color: variable.graphColor ?? '#111',
    marker: variable.graphMarker ?? 'circle',
    legendType: variable.graphLegendType ?? null,
    legendWeight: variable.graphLegendWeight ?? 600,
  };
};

// Get all variables in a category
export const getVariablesByCategory = (category) => {
  return Object.keys(VARIABLE_LIBRARY)
    .filter(id => VARIABLE_LIBRARY[id].category === category)
    .map(id => getVariableDefinition(id));
};

// Get all available variables with layout calculations
export const getAllVariables = () => {
  return Object.keys(VARIABLE_LIBRARY).map(id => getVariableDefinition(id));
};
