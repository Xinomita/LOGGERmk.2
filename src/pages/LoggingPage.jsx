import React from 'react';
import Header from '../components/logging/Header';
import StatusBanner from '../components/logging/StatusBanner';
import VariableGraph from '../components/logging/VariableGraph';
import GraphLegend from '../components/logging/GraphLegend';
import VariableTrackers from '../components/logging/VariableTrackers';
import NotesButton from '../components/logging/NotesButton';
import QuickCompoundAdd from '../components/logging/QuickCompoundAdd';

export default function LoggingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-start justify-center p-5">
      <div className="w-full max-w-[375px] bg-white border-[3px] border-black font-mono">
        <Header />
        <StatusBanner />
        <VariableGraph />
        <GraphLegend />
        <VariableTrackers />
        <NotesButton />
        <QuickCompoundAdd />
      </div>
    </div>
  );
}
