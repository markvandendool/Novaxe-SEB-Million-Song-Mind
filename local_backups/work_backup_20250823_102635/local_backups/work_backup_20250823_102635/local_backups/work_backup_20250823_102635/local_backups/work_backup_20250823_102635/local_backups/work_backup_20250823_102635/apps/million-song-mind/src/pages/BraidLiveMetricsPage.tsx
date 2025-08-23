import React from 'react';
import BraidLiveMetrics from '@/components/braid/BraidLiveMetrics';

// SENTINEL_LOVABLE_BRAID_FREEZE

const BraidLiveMetricsPage: React.FC = () => {
  const handleBubbleClick = (chord: string) => {
    // Navigate to Million Song Mind with chord query
    console.log(`Querying Million Song Mind for chord: ${chord}`);
    // TODO: Implement navigation to MSM with chord filter
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl  font-bold text-primary mb-2">
            Live Harmonic Metrics
          </h1>
          <p className="text-muted-foreground">
            Real-time visualization of chord frequencies and progressions from the data3 corpus.
            Toggle between presence, standalone counts, and progression flows.
          </p>
        </div>

        <BraidLiveMetrics onBubbleClick={handleBubbleClick} />
      </div>
    </div>
  );
};

export default BraidLiveMetricsPage;