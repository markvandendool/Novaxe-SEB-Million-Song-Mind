import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BraidTextSwitcherProps {
  onRomanChange?: (useRoman: boolean) => void;
}

export default function BraidTextSwitcher({ onRomanChange }: BraidTextSwitcherProps) {
  const [useRoman, setUseRoman] = useState(false);

  const handleToggle = () => {
    const newValue = !useRoman;
    setUseRoman(newValue);
    onRomanChange?.(newValue);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm ${!useRoman ? 'text-white font-semibold' : 'text-gray-400'}`}>
            Chord Names
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className={`px-4 py-2 transition-colors ${useRoman
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-700 text-gray-300 border-gray-600'
              }`}
          >
            Toggle
          </Button>
          <span className={`text-sm ${useRoman ? 'text-white font-semibold' : 'text-gray-400'}`}>
            Roman Numerals
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
