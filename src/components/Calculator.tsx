import { useState } from 'react';
import DomesticPricing from './DomesticPricing';
import InternationalPricing from './InternationalPricing';

export default function Calculator() {
  const [source, setSource] = useState<'india' | 'international'>('india');

  return (
    <div className="w-full overflow-hidden rounded-2xl">
      {/* 
        The key={source} tells React to destroy and recreate this div when the source changes.
        This perfectly triggers the Tailwind transition classes every single time you click the toggle.
      */}
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
  );
}