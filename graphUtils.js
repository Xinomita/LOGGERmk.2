/**
 * Monotone cubic interpolation for SVG paths
 * Prevents overshoot while maintaining smooth curves through data points
 * 
 * @param {Array<{x: number, y: number}>} points - Data points to interpolate
 * @returns {string} SVG path d attribute
 */
export const getLinePath = (points) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const n = points.length;
  
  // Calculate slopes between consecutive points
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    slopes.push(
      (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x)
    );
  }

  // Calculate tangents with monotone constraint
  // At direction changes (slope sign flip), tangent = 0 to prevent overshoot
  const tangents = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      // Direction change or flat segment - zero tangent
      tangents.push(0);
    } else {
      // Average of adjacent slopes
      tangents.push((slopes[i - 1] + slopes[i]) / 2);
    }
  }
  tangents.push(slopes[n - 2]);

  // Apply Fritsch-Carlson monotonicity constraint
  // Ensures curve stays within data bounds
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slopes[i]) < 1e-6) {
      // Flat segment - zero tangents on both ends
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / slopes[i];
      const beta = tangents[i + 1] / slopes[i];
      const s = alpha * alpha + beta * beta;
      
      // If tangents too steep relative to slope, scale them down
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        tangents[i] = t * alpha * slopes[i];
        tangents[i + 1] = t * beta * slopes[i];
      }
    }
  }

  // Build SVG path with cubic bezier segments
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    
    // Control points at 1/3 and 2/3 of horizontal distance
    // Y offset determined by tangent slope
    const cp1x = points[i].x + dx / 3;
    const cp1y = points[i].y + tangents[i] * dx / 3;
    const cp2x = points[i + 1].x - dx / 3;
    const cp2y = points[i + 1].y - tangents[i + 1] * dx / 3;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  return path;
};


/**
 * Convert raw data values to pixel coordinates
 * 
 * @param {Array<{date: string|Date, value: number}>} data - Raw data points
 * @param {object} bounds - Graph bounds { width, height }
 * @param {object} range - Value range { min, max } (optional, auto-calculated if omitted)
 * @returns {Array<{x: number, y: number}>} Pixel coordinates
 */
export const dataToPoints = (data, bounds, range = null) => {
  if (data.length === 0) return [];
  
  // Auto-calculate range if not provided
  const values = data.map(d => d.value).filter(v => v != null);
  const minVal = range?.min ?? Math.min(...values);
  const maxVal = range?.max ?? Math.max(...values);
  const valueRange = maxVal - minVal || 1; // Prevent division by zero
  
  // Convert timestamps to x positions
  const timestamps = data.map(d => new Date(d.date).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRange = maxTime - minTime || 1;
  
  return data
    .filter(d => d.value != null)
    .map(d => ({
      x: ((new Date(d.date).getTime() - minTime) / timeRange) * bounds.width,
      y: bounds.height - ((d.value - minVal) / valueRange) * bounds.height
    }));
};


/**
 * Normalize multiple series to shared 0-1 scale for overlay comparison
 * 
 * @param {Array<{value: number}>} data - Raw data points for one series
 * @returns {Array<{value: number}>} Normalized to 0-1 range
 */
export const normalizeData = (data) => {
  const values = data.map(d => d.value).filter(v => v != null);
  if (values.length === 0) return data;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  return data.map(d => ({
    ...d,
    value: d.value != null ? (d.value - min) / range : null
  }));
};
