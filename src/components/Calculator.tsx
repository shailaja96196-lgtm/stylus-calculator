import { useState } from 'react';
import DomesticPricing from './DomesticPricing';
import InternationalPricing from './InternationalPricing';
import ExampleBreakdown from './ExampleBreakdown';

export default function Calculator() {
  const [source, setSource] = useState<'india' | 'international'>('india');

  return (
    <div className="w-full">
      {/* App Module */}
      <div className="w-full overflow-hidden rounded-2xl shadow-sm">
        <div 
          key={source} 
          className="animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-4 duration-500 ease-out"
        >
          {source === 'india' ? (
            <DomesticPricing onSwitch={setSource} />
          ) : (
            <InternationalPricing onSwitch={setSource} />
          )}
        </div>
      </div>

      {/* Dynamic Breakdown Text */}
      <div 
        key={`${source}-breakdown`} 
        className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out"
      >
        <ExampleBreakdown source={source} />
      </div>
    </div>
  );
}