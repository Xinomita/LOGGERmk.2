import React, { useState, useMemo } from 'react';
import Header from '../components/logging/Header';
import StatusBanner from '../components/logging/StatusBanner';
import VariableGraph from '../components/logging/VariableGraph';
import GraphLegend from '../components/logging/GraphLegend';
import VariableTrackers from '../components/logging/VariableTrackers';
import NotesButton from '../components/logging/NotesButton';
import QuickCompoundAdd from '../components/logging/QuickCompoundAdd';
import { generateMockHistory } from '../utils/graphUtils';

export default function LoggingPage() {
  const [focusedVariable, setFocusedVariable] = useState(null);

  // Generate mock history data for 30 days
  const history = useMemo(() => generateMockHistory(30), []);

  // Variable configurations for graph (matches SLIDER_CONFIGS from VariableTrackers)
  const graphVariables = useMemo(() => [
    {
      id: 'bodyweight',
      label: 'BODYWEIGHT',
      baseline: 80,
      maxAbsValue: 10,
      stepSize: 0.5,
      unit: 'kg',
      color: '#2563eb',
      loggingMode: 'point_in_time'
    },
    {
      id: 'sleep',
      label: 'SLEEP',
      baseline: 7,
      maxAbsValue: 3,
      stepSize: 0.25,
      unit: 'hrs',
      color: '#22c55e',
      loggingMode: 'summary'
    },
    {
      id: 'energy',
      label: 'ENERGY',
      baseline: 5,
      maxAbsValue: 5,
      stepSize: 0.5,
      unit: '/10',
      color: '#ec4899',
      loggingMode: 'summary'
    },
    {
      id: 'mood',
      label: 'MOOD',
      baseline: 5,
      maxAbsValue: 5,
      stepSize: 1,
      unit: '/10',
      color: '#06b6d4',
      loggingMode: 'summary'
    },
  ], []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-start justify-center p-5">
      <div className="w-full max-w-[375px] bg-white border-[3px] border-black font-mono">
        <Header />
        <StatusBanner />
        <VariableGraph
          variables={graphVariables}
          history={history}
          focusedVariable={focusedVariable}
          onFocusChange={setFocusedVariable}
        />
        <GraphLegend />
        <VariableTrackers />
        <NotesButton />
        <QuickCompoundAdd />
      </div>
    </div>
  );
}
