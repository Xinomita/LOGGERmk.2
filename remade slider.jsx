import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';

/**
 * InlineSlider - Logging row with integrated slider
 * 
 * IDLE STATE: Clinical neo-brutalist - Label -------|------- Value • Date
 * ACTIVE STATE: Phosphor/CRT aesthetic - dithered glow, subtle grain, scan lines
 */

const InlineSlider = ({
  label = "BODYWEIGHT",
  unit = "kg",
  lastLoggedDate = null,
  
  value: controlledValue,
  onChange,
  onCenterChange,
  
  stepSize = 5,
  maxAbsValue = 75,
  baseline = 0,
  
  trackHeight = 56,
  disabled = false,
  showValue = true,
  
  defaultValue = 0,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  
  const [isDragging, setIsDragging] = useState(false);
  const [committedValue, setCommittedValue] = useState(currentValue);
  const [labelWidth, setLabelWidth] = useState(0);
  const [valueWidth, setValueWidth] = useState(0);
  
  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const positiveFillRef = useRef(null);
  const negativeFillRef = useRef(null);
  const valueDisplayRef = useRef(null);
  const labelRef = useRef(null);
  const valueContainerRef = useRef(null);
  
  const lastValueRef = useRef(currentValue);
  const EDGE_PADDING = 6;

  useLayoutEffect(() => {
    if (labelRef.current) setLabelWidth(labelRef.current.offsetWidth);
    if (valueContainerRef.current) setValueWidth(valueContainerRef.current.offsetWidth);
  }, [label, committedValue, unit]);

  const valueToPercent = (val) => ((val + maxAbsValue) / (maxAbsValue * 2)) * 100;
  
  const percentToValue = (percent) => {
    const raw = (percent / 100) * (maxAbsValue * 2) - maxAbsValue;
    const stepped = Math.round(raw / stepSize) * stepSize;
    return Math.max(-maxAbsValue, Math.min(maxAbsValue, stepped));
  };

  const pixelToValue = (px, width) => percentToValue((px / width) * 100);

  const checkCenterCrossing = (newValue) => {
    const lastVal = lastValueRef.current;
    if (onCenterChange && ((lastVal < 0 && newValue >= 0) || (lastVal > 0 && newValue <= 0))) {
      onCenterChange(newValue);
    }
    lastValueRef.current = newValue;
  };

  const handlePointerDown = useCallback((e) => {
    if (disabled || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const newValue = pixelToValue(e.clientX - rect.left, rect.width);
    if (isControlled) onChange?.(newValue);
    else setInternalValue(newValue);
    checkCenterCrossing(newValue);
    setIsDragging(true);
    trackRef.current.setPointerCapture(e.pointerId);
  }, [disabled, isControlled, onChange, maxAbsValue, stepSize]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || disabled || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newValue = pixelToValue(x, rect.width);
    if (isControlled) onChange?.(newValue);
    else setInternalValue(newValue);
    checkCenterCrossing(newValue);
  }, [isDragging, disabled, isControlled, onChange, maxAbsValue, stepSize]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    setCommittedValue(currentValue);
    if (trackRef.current) trackRef.current.releasePointerCapture(e.pointerId);
  }, [isDragging, currentValue]);

  const formatSimpleValue = (val) => {
    const actualValue = baseline + val;
    // Determine decimal places from stepSize
    const stepStr = stepSize.toString();
    const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    
    if (decimalPlaces === 0) {
      return actualValue.toString();
    }
    return actualValue.toFixed(decimalPlaces);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(/\//g, '/');
  };

  const currentPercent = valueToPercent(currentValue);
  const isModified = committedValue !== defaultValue;
  
  const gridSteps = [];
  for (let val = -maxAbsValue; val <= maxAbsValue; val += stepSize) {
    gridSteps.push(val);
  }

  const leftPad = labelWidth + 20;
  const rightPad = valueWidth + 20;
  
  // Text fills ~50% of track height
  const labelFontSize = Math.floor(trackHeight * 0.5);

  // Calculate the width of the decimal portion for offset
  // This keeps the integer part centered, so values don't bounce when decimals change
  const getDecimalOffset = () => {
    const stepStr = stepSize.toString();
    const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    if (decimalPlaces === 0) return 0;
    // Approximate character widths in monospace at the display font size
    const fontSize = labelFontSize * 0.55;
    const charWidth = fontSize * 0.6; // monospace char width ratio
    const dotWidth = charWidth * 0.4;
    return (dotWidth + (decimalPlaces * charWidth)) / 2;
  };

  return (
    <div 
      className={`relative w-full select-none overflow-hidden ${disabled ? 'opacity-50' : ''}`}
      style={{ 
        touchAction: 'none',
        backgroundColor: isDragging ? '#050508' : '#fff',
        transition: 'background-color 120ms ease-out',
        height: `${trackHeight}px`,
      }}
    >
      {/* IDLE STATE - Clinical neo-brutalist */}
      <div 
        className="absolute inset-0 flex items-center"
        style={{
          opacity: isDragging ? 0 : 1,
          transition: 'opacity 120ms ease-out',
          pointerEvents: isDragging ? 'none' : 'auto',
        }}
      >
        <div 
          ref={labelRef}
          className="absolute left-4 font-mono font-bold tracking-tight z-10"
          style={{ 
            color: '#000',
            fontSize: `${labelFontSize}px`,
            lineHeight: 1,
          }}
        >
          {label}
        </div>

        {showValue && (
          <div 
            ref={valueContainerRef}
            className="absolute right-4 flex items-baseline gap-3 font-mono z-10"
          >
            <span 
              ref={valueDisplayRef}
              className="font-bold transition-colors duration-150"
              style={{ 
                fontSize: `${labelFontSize}px`,
                lineHeight: 1,
                color: isModified ? '#2563EB' : '#000',
              }}
            >
              {formatSimpleValue(committedValue)}
              <span style={{ fontSize: `${labelFontSize * 0.55}px`, marginLeft: '3px', opacity: 0.5 }}>
                {unit}
              </span>
            </span>
            {lastLoggedDate && (
              <>
                <span style={{ color: '#D1D5DB' }}>•</span>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{formatDate(lastLoggedDate)}</span>
              </>
            )}
          </div>
        )}

        <div 
          className="absolute top-1/2" 
          style={{ left: `${leftPad}px`, right: `${rightPad}px`, transform: 'translateY(-50%)' }}
        >
          <div className="w-full border-t-2 border-dashed" style={{ borderColor: '#E5E7EB' }} />
        </div>

        <div 
          className="absolute left-1/2 top-0 bottom-0"
          style={{ width: '1px', backgroundColor: '#D1D5DB', transform: 'translateX(-50%)' }}
        />

        {committedValue > 0 && (
          <div 
            ref={positiveFillRef}
            className="absolute top-0 bottom-0"
            style={{ left: '50%', width: `${(committedValue / maxAbsValue) * 50}%`, backgroundColor: '#2563EB', opacity: 0.08 }}
          />
        )}
        {committedValue < 0 && (
          <div 
            ref={negativeFillRef}
            className="absolute top-0 bottom-0"
            style={{ right: '50%', width: `${(Math.abs(committedValue) / maxAbsValue) * 50}%`, backgroundColor: '#2563EB', opacity: 0.08 }}
          />
        )}
      </div>

      {/* ACTIVE STATE - Phosphor/CRT aesthetic */}
      <div 
        className="absolute inset-0"
        style={{
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 80ms ease-out',
          pointerEvents: isDragging ? 'auto' : 'none',
        }}
      >
        {/* Noise/grain texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.03,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Horizontal scan lines */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            opacity: 0.4,
          }}
        />

        {/* Grid lines - very subtle */}
        <div 
          ref={gridCanvasRef}
          className="absolute inset-0 flex justify-between items-center"
          style={{ padding: `0 ${EDGE_PADDING}px` }}
        >
          {gridSteps.map((val) => {
            const isCenter = val === 0;
            const isMajor = Math.abs(val) % (stepSize * 4) === 0;
            return (
              <div 
                key={val}
                style={{ 
                  width: '1px',
                  height: isCenter ? '100%' : isMajor ? '35%' : '15%',
                  backgroundColor: isCenter ? '#60A5FA' : '#3B82F6',
                  opacity: isCenter ? 0.6 : isMajor ? 0.12 : 0.05,
                }}
              />
            );
          })}
        </div>

        {/* Center line - soft phosphor glow via stacked layers */}
        <div 
          className="absolute left-1/2 top-0 bottom-0"
          style={{ transform: 'translateX(-50%)' }}
        >
          {/* Outer dithered glow - wide, faint */}
          <div 
            className="absolute top-0 bottom-0"
            style={{
              width: '20px',
              left: '-10px',
              background: 'radial-gradient(ellipse 100% 50% at center, rgba(96,165,250,0.12) 0%, transparent 70%)',
            }}
          />
          {/* Mid glow */}
          <div 
            className="absolute top-0 bottom-0"
            style={{
              width: '8px',
              left: '-4px',
              background: 'radial-gradient(ellipse 100% 50% at center, rgba(96,165,250,0.2) 0%, transparent 80%)',
            }}
          />
          {/* Core line */}
          <div 
            className="absolute top-0 bottom-0 left-0"
            style={{ width: '1px', backgroundColor: '#93C5FD' }}
          />
        </div>

        {/* Fill - dithered edge, not solid */}
        {currentValue !== 0 && (
          <div 
            className="absolute top-0 bottom-0"
            style={{
              left: currentValue > 0 ? '50%' : `${currentPercent}%`,
              width: `${Math.abs(currentPercent - 50)}%`,
            }}
          >
            {/* Base fill */}
            <div 
              className="absolute inset-0"
              style={{
                background: currentValue > 0 
                  ? 'linear-gradient(90deg, rgba(96,165,250,0.18) 0%, rgba(96,165,250,0.04) 100%)'
                  : 'linear-gradient(270deg, rgba(96,165,250,0.18) 0%, rgba(96,165,250,0.04) 100%)',
              }}
            />
            {/* Dithered edge pattern */}
            <div 
              className="absolute top-0 bottom-0"
              style={{
                width: '8px',
                right: currentValue > 0 ? 0 : 'auto',
                left: currentValue < 0 ? 0 : 'auto',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='rgba(96,165,250,0.2)'/%3E%3Crect x='2' y='2' width='1' height='1' fill='rgba(96,165,250,0.2)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
          </div>
        )}

        {/* Handle - thin with phosphor bloom */}
        <div 
          ref={handleRef}
          className="absolute top-0 bottom-0"
          style={{ left: `${currentPercent}%`, transform: 'translateX(-50%)' }}
        >
          {/* Bloom layers */}
          <div className="absolute inset-y-0" style={{ width: '16px', left: '-8px', background: 'radial-gradient(ellipse 100% 30% at center, rgba(147,197,253,0.15) 0%, transparent 70%)' }} />
          <div className="absolute inset-y-0" style={{ width: '6px', left: '-3px', background: 'radial-gradient(ellipse 100% 40% at center, rgba(147,197,253,0.25) 0%, transparent 80%)' }} />
          {/* Core */}
          <div className="absolute top-0 bottom-0 left-0" style={{ width: '1px', backgroundColor: '#BFDBFE' }} />
        </div>

        {/* Value display - offset to center on decimal point */}
        <div 
          className="absolute left-1/2 top-1/2"
          style={{ transform: `translate(calc(-50% + ${getDecimalOffset()}px), -50%)` }}
        >
          <span 
            className="font-mono font-medium px-2 py-0.5"
            style={{ 
              fontSize: `${labelFontSize * 0.55}px`,
              color: '#93C5FD',
              backgroundColor: 'rgba(5,5,8,0.95)',
              letterSpacing: '0.08em',
            }}
          >
            {formatSimpleValue(currentValue)}
          </span>
        </div>

        {/* Min/Max */}
        <div className="absolute left-2 top-1/2 font-mono" style={{ transform: 'translateY(-50%)', color: 'rgba(147,197,253,0.35)', fontSize: '9px' }}>
          {baseline - maxAbsValue}
        </div>
        <div className="absolute right-2 top-1/2 font-mono" style={{ transform: 'translateY(-50%)', color: 'rgba(147,197,253,0.35)', fontSize: '9px' }}>
          {baseline + maxAbsValue}
        </div>
      </div>

      {/* Hit area */}
      <div 
        ref={trackRef}
        className="absolute inset-0 z-20"
        style={{ cursor: disabled ? 'not-allowed' : isDragging ? 'none' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};

export default function App() {
  const [weight, setWeight] = useState(0);
  const [energy, setEnergy] = useState(0);

  return (
    <div className="min-h-screen bg-neutral-900 p-8 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-4">
        
        <div className="bg-white overflow-hidden" style={{ border: '2px solid #000' }}>
          <InlineSlider
            label="BODYWEIGHT"
            unit="kg"
            value={weight}
            onChange={setWeight}
            baseline={80}
            maxAbsValue={20}
            stepSize={1}
            trackHeight={56}
            lastLoggedDate="2025-12-01"
          />
        </div>

        <div className="bg-white overflow-hidden" style={{ border: '2px solid #000' }}>
          <InlineSlider
            label="SLEEP"
            unit="hrs"
            defaultValue={0}
            baseline={7}
            maxAbsValue={4}
            stepSize={0.5}
            trackHeight={56}
            lastLoggedDate="2025-12-01"
          />
        </div>

        <div className="bg-white overflow-hidden" style={{ border: '2px solid #000' }}>
          <InlineSlider
            label="ENERGY"
            unit="/10"
            value={energy}
            onChange={setEnergy}
            baseline={5}
            maxAbsValue={5}
            stepSize={1}
            trackHeight={56}
            lastLoggedDate="2025-12-01"
          />
        </div>

        <div className="bg-white overflow-hidden" style={{ border: '2px solid #000' }}>
          <InlineSlider
            label="MOOD"
            unit="/10"
            defaultValue={0}
            baseline={5}
            maxAbsValue={5}
            stepSize={1}
            trackHeight={56}
          />
        </div>

        <div className="mt-8 p-4 font-mono text-xs text-neutral-500 space-y-1">
          <p>• Idle: clinical neo-brutalist</p>
          <p>• Active: phosphor/CRT — scan lines, grain, dithered glow</p>
          <p>• Text now 50% of track height</p>
        </div>
      </div>
    </div>
  );
}