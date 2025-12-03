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
  const [activeVariable, setActiveVariable] = useState(null);
  const [currentSliderValues, setCurrentSliderValues] = useState({
    bodyweight: 2,
    waist: -0.5,
    sleep: 0.5,
    energy: 0,
    mood: 2,
  });

  // Generate mock history data for 29 days (excluding today)
  const baseHistory = useMemo(() => generateMockHistory(29), []);

  // Merge base history with current slider values for live updates
  const liveHistory = useMemo(() => {
    const today = new Date();
    const todayEntry = {
      date: today.toISOString().split('T')[0],
      values: currentSliderValues,
    };
    return [...baseHistory, todayEntry];
  }, [baseHistory, currentSliderValues]);

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
          history={liveHistory}
          activeVariable={activeVariable}
        />
        <GraphLegend activeVariable={activeVariable} />
        <VariableTrackers
          onActiveVariableChange={setActiveVariable}
          onSliderValuesChange={setCurrentSliderValues}
        />
        <NotesButton />
        <QuickCompoundAdd />
      </div>
    </div>
  );
}
