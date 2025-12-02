import React, { useMemo } from "react";
import InlineSlider from "./InlineSlider.jsx";
import { getVariableDefinition } from "../variableLibrary.js";

// Temporary: Keep toggle panel from old MetricBlock for toggle variables
function TogglePanel({ variable, value, onChange }) {
  return (
    <div style={{ padding: '12px 20px', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {(variable.options ?? []).map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              style={{
                padding: '8px 16px',
                border: '2px solid #000',
                backgroundColor: active ? '#000' : '#fff',
                color: active ? '#fff' : '#000',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MetricsBoard({ activeVariables, getValue, updateVariable, getLastLogged, onFocusChange, variableDefinitions }) {
  const variables = useMemo(
    () => {
      // Use provided dynamic definitions if available, otherwise fall back to static lookup
      if (variableDefinitions) {
        return activeVariables
          .map((variableId) => variableDefinitions[variableId])
          .filter(Boolean);
      }
      return activeVariables
        .map((variableId) => getVariableDefinition(variableId))
        .filter(Boolean);
    },
    [activeVariables, variableDefinitions]
  );

  if (!variables.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {variables.map((variable, index) => {
        const currentValue = getValue(variable.id);
        const isFirst = index === 0;

        // Handle toggle variables with temporary panel
        if (variable.type === 'toggle') {
          return (
            <div key={variable.id} className="bg-white overflow-hidden" style={{ border: '2px solid #000', borderTop: isFirst ? '2px solid #000' : 'none' }}>
              <div style={{ padding: '12px 20px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>{variable.label}</span>
              </div>
              <TogglePanel
                variable={variable}
                value={currentValue}
                onChange={(nextValue) => updateVariable(variable.id, nextValue)}
              />
            </div>
          );
        }

        // Handle slider variables with InlineSlider
        const baseline = variable.defaultValue ?? (variable.min + variable.max) / 2;
        const maxAbs = Math.max(baseline - variable.min, variable.max - baseline);
        const offsetValue = currentValue - baseline;

        return (
          <div key={variable.id} className="bg-white overflow-hidden" style={{ border: '2px solid #000', borderTop: isFirst ? '2px solid #000' : 'none' }}>
            <InlineSlider
              label={variable.label}
              unit={variable.units}
              value={offsetValue}
              onChange={(newOffsetValue) => {
                const newActualValue = baseline + newOffsetValue;
                // Clamp to variable's min/max
                const clamped = Math.max(variable.min, Math.min(variable.max, newActualValue));
                updateVariable(variable.id, clamped);
              }}
              baseline={baseline}
              maxAbsValue={maxAbs}
              stepSize={variable.step}
              defaultValue={0}
              lastLoggedDate={getLastLogged?.(variable.id)}
              trackHeight={56}
              onCenterChange={() => onFocusChange?.(variable.id, true)}
            />
          </div>
        );
      })}
    </div>
  );
}
