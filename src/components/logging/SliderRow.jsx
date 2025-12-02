import React, { useState, useRef, useCallback } from 'react';

/**
 * SliderRow - Modular drag-based slider for logging variables
 *
 * Props:
 * - label: Display name (e.g., "BODYWEIGHT")
 * - unit: Unit string (e.g., "kg", "/10", "hrs")
 * - color: Accent color when active
 * - value/onChange: Controlled mode
 * - defaultValue: Uncontrolled mode
 * - baseline: Center value (e.g., 80 for bodyweight)
 * - maxAbsValue: Range from baseline (e.g., 20 means 60-100)
 * - stepSize: Increment size (e.g., 0.5, 1, 5)
 * - disabled: Disable interaction
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
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

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

  // Pointer event handlers
  const handlePointerDown = useCallback((e) => {
    if (disabled || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const newValue = pixelToValue(e.clientX - rect.left, rect.width);
    if (isControlled) onChange?.(newValue);
    else setInternalValue(newValue);
    setIsDragging(true);
    trackRef.current.setPointerCapture(e.pointerId);
  }, [disabled, isControlled, onChange, maxAbsValue, stepSize, baseline]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || disabled || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newValue = pixelToValue(x, rect.width);
    if (isControlled) onChange?.(newValue);
    else setInternalValue(newValue);
  }, [isDragging, disabled, isControlled, onChange, maxAbsValue, stepSize]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (trackRef.current) trackRef.current.releasePointerCapture(e.pointerId);
  }, [isDragging]);

  const isActive = currentValue !== defaultValue;

  return (
    <div
      className="h-9 flex items-center px-2 border-b border-gray-200 cursor-pointer relative select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Left accent bar */}
      {isActive && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: color }}
        />
      )}

      {/* Label */}
      <span className="text-[13px] font-bold tracking-wide min-w-[105px]">
        {label}
      </span>

      {/* Leader line (animated when active) */}
      <div
        className={`flex-1 h-px mx-1.5 ${isActive ? 'animate-dash' : ''}`}
        style={{
          background: isActive
            ? `repeating-linear-gradient(90deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 5px)`
            : 'repeating-linear-gradient(90deg, #bbb 0px, #bbb 2px, transparent 2px, transparent 5px)'
        }}
      />

      {/* Value */}
      <span
        className="text-[16px] font-bold min-w-[50px] text-right tabular-nums"
        style={{ color: isActive ? color : '#000' }}
      >
        {formatValue(currentValue)}
      </span>

      {/* Unit */}
      <span className="text-[10px] font-semibold text-gray-600 ml-0.5 min-w-[24px]">
        {unit}
      </span>

      {/* Indicator dot */}
      <div
        className="w-1.5 h-1.5 rounded-full ml-1.5"
        style={{ background: isActive ? color : '#ccc' }}
      />

      {/* Invisible hit area for drag */}
      <div
        ref={trackRef}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
