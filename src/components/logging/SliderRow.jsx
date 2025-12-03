import React, { useState, useRef, useCallback } from 'react';

/**
 * SliderRow - Modular drag-based slider for logging variables
 *
 * Props:
 * - label: Display name (e.g., "BODYWEIGHT")
 * - unit: Unit string (e.g., "kg", "/10", "hrs")
 * - color: Accent color (used for both idle active states and active dragging state)
 * - value/onChange: Controlled mode
 * - defaultValue: Uncontrolled mode
 * - baseline: Center value (e.g., 80 for bodyweight)
 * - maxAbsValue: Range from baseline (e.g., 20 means 60-100)
 * - stepSize: Increment size (e.g., 0.5, 1, 5)
 * - disabled: Disable interaction
 * - previousValue: Previous logged value (for change indicator)
 * - lastUpdated: Timestamp of last log (Date object or ISO string)
 * - loggingMode: "summary" (default) | "point_in_time"
 * - onLog: Callback for point-in-time logging - receives { value, absoluteValue, timestamp }
 */

export default function SliderRow({
  label = "VARIABLE",
  unit = "",
  color = '#2563eb',

  value: controlledValue,
  onChange,
  defaultValue = 0,

  baseline = 0,
  maxAbsValue = 10,
  stepSize = 1,
  disabled = false,

  previousValue = null,
  lastUpdated = null,

  loggingMode = "summary",
  onLog,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isDragging, setIsDragging] = useState(false);
  const [committedValue, setCommittedValue] = useState(currentValue);
  const [isLocked, setIsLocked] = useState(false); // For summary mode locking
  const containerRef = useRef(null); // Full component width for calculations
  const trackRef = useRef(null); // Hit area for drag interactions

  // Sync committedValue when parent resets the value (e.g., after LOG)
  React.useEffect(() => {
    if (!isDragging) {
      setCommittedValue(currentValue);
      // Reset lock state when value returns to default
      if (currentValue === defaultValue) {
        setIsLocked(false);
      }
    }
  }, [currentValue, isDragging, defaultValue]);

  // Value <-> Percent conversion
  const valueToPercent = (val) => ((val + maxAbsValue) / (maxAbsValue * 2)) * 100;

  const percentToValue = (percent) => {
    const raw = (percent / 100) * (maxAbsValue * 2) - maxAbsValue;
    const stepped = Math.round(raw / stepSize) * stepSize;
    return Math.max(-maxAbsValue, Math.min(maxAbsValue, stepped));
  };

  const pixelToValue = (px, width) => percentToValue((px / width) * 100);

  // Format value based on stepSize decimals
  const formatValue = (val) => {
    const actualValue = baseline + val;
    const stepStr = stepSize.toString();
    const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    return decimalPlaces === 0 ? actualValue.toString() : actualValue.toFixed(decimalPlaces);
  };

  // Calculate change from previous value
  const getDelta = () => {
    if (previousValue === null) return null;
    const currentAbsolute = baseline + committedValue;
    const previousAbsolute = baseline + previousValue;
    return currentAbsolute - previousAbsolute;
  };

  const formatDelta = (delta) => {
    if (delta === null || delta === 0) return null;
    const stepStr = stepSize.toString();
    const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    const formatted = decimalPlaces === 0 ? Math.abs(delta).toString() : Math.abs(delta).toFixed(decimalPlaces);
    return delta > 0 ? `+${formatted}` : `-${formatted}`;
  };

  // Format timestamp (always show date + time)
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr}, ${timeStr}`;
  };

  const delta = getDelta();
  const deltaStr = formatDelta(delta);
  const timestampStr = formatTimestamp(lastUpdated);

  const isActive = committedValue !== defaultValue;
  const currentPercent = valueToPercent(currentValue);
  const isSliderDisabled = disabled || (loggingMode === "summary" && isLocked);

  // Calculate animation speed based on position in range
  const getAnimationSpeed = () => {
    // Calculate how far from center (0-1 range, as percentage of maxAbsValue)
    const percentageOfRange = Math.abs(committedValue) / maxAbsValue;

    // Linear mapping for consistent progression
    // Map to speed range: 0.8s (slow at center) to 0.25s (fast at extremes)
    const minSpeed = 0.25; // Fastest (at max/min)
    const maxSpeed = 0.8;  // Slowest (at center)
    const speed = maxSpeed - (percentageOfRange * (maxSpeed - minSpeed));

    return speed;
  };

  const animationSpeed = getAnimationSpeed();

  // Convert hex color to rgb for opacity effects
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 37, g: 99, b: 235 }; // fallback blue
  };

  const rgb = hexToRgb(color);
  const colorWithOpacity = (opacity) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

  // Pointer event handlers
  const handlePointerDown = useCallback((e) => {
    if (isSliderDisabled || !containerRef.current || !trackRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newValue = pixelToValue(e.clientX - rect.left, rect.width);
    if (isControlled) onChange?.(newValue);
    else setInternalValue(newValue);
    setIsDragging(true);
    trackRef.current.setPointerCapture(e.pointerId);
  }, [isSliderDisabled, isControlled, onChange, maxAbsValue, stepSize, baseline]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isSliderDisabled || !containerRef.current || !trackRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newValue = pixelToValue(x, rect.width);
    if (isControlled) onChange?.(newValue);
    else setInternalValue(newValue);
  }, [isDragging, isSliderDisabled, isControlled, onChange, maxAbsValue, stepSize]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    setCommittedValue(currentValue);

    // Auto-lock summary sliders when value is set (not at default)
    if (loggingMode === "summary" && currentValue !== defaultValue) {
      setIsLocked(true);
    }

    if (trackRef.current) trackRef.current.releasePointerCapture(e.pointerId);
  }, [isDragging, currentValue, loggingMode, defaultValue]);

  const handleLog = useCallback((e) => {
    if (disabled || !onLog) return;
    e.stopPropagation();
    e.preventDefault();
    const absoluteValue = baseline + committedValue;
    onLog({
      value: committedValue,
      absoluteValue,
      timestamp: new Date(),
    });
  }, [disabled, onLog, committedValue, baseline]);

  const toggleLock = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLocked(prev => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-9 flex items-center relative select-none overflow-hidden transition-colors duration-100"
      style={{
        touchAction: 'none',
        backgroundColor: isDragging ? '#050508' : '#fff',
      }}
    >
      {/* IDLE STATE - White background */}
      <div
        className="absolute inset-0 flex items-center px-2"
        style={{
          opacity: isDragging ? 0 : (isLocked ? 0.5 : 1),
          transition: 'opacity 100ms ease-out',
          pointerEvents: isDragging ? 'none' : 'auto',
        }}
      >
        {/* Left accent bar */}
        {isActive && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: color }}
          />
        )}

        {/* Label */}
        <span className="text-[13px] font-bold tracking-wide min-w-[105px] z-10">
          {label}
        </span>

        {/* Leader line (animated when active) */}
        <div
          className="flex-1 h-px mx-1.5"
          style={{
            background: isActive
              ? `repeating-linear-gradient(90deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 5px)`
              : 'repeating-linear-gradient(90deg, #bbb 0px, #bbb 2px, transparent 2px, transparent 5px)',
            animation: isActive ? `dash-move-${committedValue > 0 ? 'right' : 'left'} ${animationSpeed}s linear infinite` : 'none',
            backgroundSize: '5px 1px',
          }}
        />

        {/* Value container with delta and timestamp */}
        <div className="flex flex-col items-end justify-center min-w-[50px] z-10">
          {/* Change indicator - only show when slider is active */}
          {isActive && deltaStr && (
            <div className="flex items-center gap-0.5 h-[9px] leading-none mb-[-1px]">
              <span className="text-[7px] font-bold" style={{ color: delta > 0 ? '#16a34a' : '#dc2626' }}>
                {delta > 0 ? '▲' : '▼'}
              </span>
              <span className="text-[7px] font-bold tracking-tight" style={{ color: delta > 0 ? '#16a34a' : '#dc2626' }}>
                {deltaStr}
              </span>
            </div>
          )}

          {/* Main value */}
          <span
            className="text-[16px] font-bold text-right tabular-nums leading-none"
            style={{ color: isActive ? color : '#000' }}
          >
            {formatValue(committedValue)}
          </span>

          {/* Timestamp - show when last logged */}
          {timestampStr && (
            <span className="text-[7px] font-medium text-gray-400 tracking-tight leading-none mt-[-1px]">
              {timestampStr}
            </span>
          )}
        </div>

        {/* Unit */}
        <span className="text-[10px] font-semibold text-gray-600 ml-0.5 min-w-[24px] z-10">
          {unit}
        </span>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
      </div>

      {/* BUTTONS - Always at full opacity, not affected by locked state dimming */}
      <div
        className="absolute inset-0 flex items-center justify-end px-2 pointer-events-none"
        style={{
          opacity: isDragging ? 0 : 1,
          transition: 'opacity 100ms ease-out',
        }}
      >
        {/* Indicator: Lock (summary) or LOG button (point-in-time) */}
        {loggingMode === "point_in_time" ? (
          <button
            onClick={handleLog}
            disabled={disabled}
            className="ml-1.5 px-2 py-0.5 text-[9px] font-bold tracking-wide border transition-all z-30 pointer-events-auto"
            style={{
              color: '#fff',
              backgroundColor: color,
              borderColor: color,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            LOG
          </button>
        ) : (
          <button
            onClick={toggleLock}
            disabled={disabled}
            className="ml-1.5 w-5 h-5 flex items-center justify-center transition-all z-30 rounded pointer-events-auto"
            style={{
              cursor: 'pointer',
              color: isLocked ? color : '#999',
              backgroundColor: 'transparent',
            }}
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isLocked ? (
                // Locked icon
                <>
                  <rect x="1" y="5" width="8" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M2.5 5V3.5C2.5 2.12 3.62 1 5 1C6.38 1 7.5 2.12 7.5 3.5V5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </>
              ) : (
                // Unlocked icon
                <>
                  <rect x="1" y="5" width="8" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M2.5 5V3.5C2.5 2.12 3.62 1 5 1C6.38 1 7.5 2.12 7.5 3.5V4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* ACTIVE STATE - Black background when dragging */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 80ms ease-out',
          pointerEvents: isDragging ? 'auto' : 'none',
        }}
      >
        {/* Grid lines for each step */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {Array.from({ length: Math.floor((maxAbsValue * 2) / stepSize) + 1 }).map((_, i) => {
            const val = -maxAbsValue + (i * stepSize);
            const isCenter = Math.abs(val) < stepSize / 2;
            const isMajor = Math.abs(val) % (stepSize * 4) < stepSize / 2;
            return (
              <div
                key={i}
                style={{
                  width: '1px',
                  height: isCenter ? '100%' : isMajor ? '40%' : '20%',
                  backgroundColor: isCenter ? colorWithOpacity(0.6) : colorWithOpacity(0.25),
                  opacity: isCenter ? 1 : isMajor ? 1 : 0.6,
                }}
              />
            );
          })}
        </div>

        {/* Center line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px"
          style={{
            backgroundColor: colorWithOpacity(0.3),
            transform: 'translateX(-50%)'
          }}
        />

        {/* Fill from center to handle */}
        {currentValue !== 0 && (
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: currentValue > 0 ? '50%' : `${currentPercent}%`,
              width: `${Math.abs(currentPercent - 50)}%`,
              background: currentValue > 0
                ? `linear-gradient(90deg, ${colorWithOpacity(0.15)} 0%, ${colorWithOpacity(0.05)} 100%)`
                : `linear-gradient(270deg, ${colorWithOpacity(0.15)} 0%, ${colorWithOpacity(0.05)} 100%)`,
            }}
          />
        )}

        {/* Handle */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: `${currentPercent}%`,
            backgroundColor: color,
            transform: 'translateX(-50%)',
            boxShadow: `0 0 8px ${colorWithOpacity(0.5)}`
          }}
        />

        {/* Live value display */}
        <div
          className="absolute top-1/2 left-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <span
            className="font-mono font-semibold px-2 py-0.5 text-[11px]"
            style={{
              color: color,
              backgroundColor: 'rgba(5, 5, 8, 0.95)',
              letterSpacing: '0.08em',
            }}
          >
            {formatValue(currentValue)}
          </span>
        </div>

        {/* Min/Max labels */}
        <div
          className="absolute left-2 top-1/2 font-mono text-[9px]"
          style={{
            transform: 'translateY(-50%)',
            color: colorWithOpacity(0.35)
          }}
        >
          {baseline - maxAbsValue}
        </div>
        <div
          className="absolute right-2 top-1/2 font-mono text-[9px]"
          style={{
            transform: 'translateY(-50%)',
            color: colorWithOpacity(0.35)
          }}
        >
          {baseline + maxAbsValue}
        </div>
      </div>

      {/* Invisible hit area for drag - excludes right side for buttons */}
      <div
        ref={trackRef}
        className="absolute inset-y-0 left-0 right-[60px] z-20 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
