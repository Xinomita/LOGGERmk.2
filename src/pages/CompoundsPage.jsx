import React, { useState } from 'react';
import CompoundsHeader from '../components/compounds/CompoundsHeader';
import CompoundsStatusBanner from '../components/compounds/CompoundsStatusBanner';
import HalfLifeGraph from '../components/compounds/HalfLifeGraph';
import CompoundLegend from '../components/compounds/CompoundLegend';
import StackBuilder from '../components/compounds/StackBuilder';
import AddCompoundPanel from '../components/compounds/AddCompoundPanel';
import FinalizeButton from '../components/compounds/FinalizeButton';
import CompoundHistory from '../components/compounds/CompoundHistory';

export default function CompoundsPage() {
  const [activeCompound, setActiveCompound] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [targetStack, setTargetStack] = useState(null);

  const handleAddCompound = (stackId) => {
    setTargetStack(stackId);
    setShowAddPanel(true);
  };

  const handleCompoundAdded = (compoundData) => {
    console.log('Compound added:', compoundData);
    setShowAddPanel(false);
    setTargetStack(null);
  };

  const handleFinalize = () => {
    console.log('Finalizing stack - generating AI report');
    // TODO: Navigate to AI page with report
  };

  const handlePromoteCompound = (entry) => {
    console.log('Promoting to permanent:', entry);
    setTargetStack('morning'); // Default to morning stack
    setShowAddPanel(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-start justify-center p-5">
      {/* Main container - dark theme, inverted from logging page */}
      <div className="w-full max-w-[375px] bg-black border-[3px] border-white font-mono">
        {/* Header - white bg (inverted from logging's black) */}
        <CompoundsHeader />

        {/* Status banner - white bg with interaction alerts */}
        <CompoundsStatusBanner />

        {/* Half-life graph - dark bg, concentration curves */}
        <HalfLifeGraph activeCompound={activeCompound} />

        {/* Compound legend - dark, shows active compounds */}
        <CompoundLegend
          activeCompound={activeCompound}
          onCompoundClick={setActiveCompound}
        />

        {/* Stack builder - white bg section (main interaction area) */}
        <StackBuilder onAddCompound={handleAddCompound} />

        {/* Add compound panel - expandable */}
        <AddCompoundPanel
          isOpen={showAddPanel}
          onClose={() => {
            setShowAddPanel(false);
            setTargetStack(null);
          }}
          onAdd={handleCompoundAdded}
          targetStack={targetStack}
        />

        {/* Finalize button - prominent CTA */}
        <FinalizeButton onFinalize={handleFinalize} />

        {/* Compound history - quick-adds from logging page */}
        <CompoundHistory onPromote={handlePromoteCompound} />
      </div>
    </div>
  );
}
