import React from 'react';
import { validateBraidHarmonicMapping, createHarmonicSlotToBraidMapping } from '@/utils/braidHarmonicMapping';

/**
 * Development component to validate and visualize braid-to-harmonic-profile mappings
 * Only rendered in development mode for debugging
 */
export const BraidMappingValidator: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const { validMappings, unmappedRomans } = validateBraidHarmonicMapping();
  const slotMapping = createHarmonicSlotToBraidMapping();

  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-4">
      <h3 className="font-bold text-lg">Braid-to-Harmonic Mapping Validation</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Valid Mappings ({Object.keys(validMappings).length})</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {Object.entries(validMappings).map(([roman, slot]) => (
              <div key={roman} className="text-sm flex justify-between">
                <span className="">{roman}</span>
                <span className="text-muted-foreground">→ {slot}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Harmonic Slots → Braid Positions</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {Object.entries(slotMapping).map(([slot, romans]) => (
              romans.length > 0 && (
                <div key={slot} className="text-sm">
                  <div className=" font-semibold">{slot}:</div>
                  <div className="pl-4 text-muted-foreground">
                    {romans.join(', ')}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      
      {unmappedRomans.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-destructive">
            Unmapped Romans ({unmappedRomans.length})
          </h4>
          <div className="text-sm text-destructive">
            {unmappedRomans.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default BraidMappingValidator;