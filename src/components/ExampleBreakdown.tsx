interface Props {
  source: 'india' | 'international';
}

export default function ExampleBreakdown({ source }: Props) {
  if (source === 'india') {
    return (
      <section className="mt-10 sm:mt-12 p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 transition-colors">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-maroon-600 dark:text-maroon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          How is Domestic Pricing Calculated?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm text-slate-600 dark:text-neutral-400">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">1. The Base Cost</h3>
            <ul className="space-y-1.5 list-disc pl-4">
              <li><strong>Total Base RM Cost:</strong> Base Unit Price × Quantity</li>
              <li><strong>GST Amount:</strong> Total Base RM Cost × GST Rate (Default 9%) <br/><span className="text-xs italic">(This is unclaimed and added directly to the cost)</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">2. Landed Cost</h3>
            <ul className="space-y-1.5 list-disc pl-4">
              <li><strong>Freight:</strong> User input (Flat ₹)</li>
              <li><strong>Other Charges:</strong> User input (Flat ₹)</li>
              <li><strong className="text-maroon-600 dark:text-maroon-500">Landed Cost</strong> = Total Base RM Cost + GST Amount + Freight + Other Charges</li>
            </ul>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
            <p className="font-medium text-slate-900 dark:text-white mt-2">
              <strong className="text-maroon-600 dark:text-maroon-500">FINAL SELLING PRICE</strong> = Landed Cost + Final Margin (Default 40%)
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 sm:mt-12 p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 transition-colors">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-maroon-600 dark:text-maroon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        How is International Pricing Calculated?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm text-slate-600 dark:text-neutral-400">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">1. Base Costs</h3>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>RM Price:</strong> Base Foreign Price × Exchange Rate × Quantity</li>
            <li><strong>Freight:</strong> User input (Flat ₹)</li>
            <li><strong className="text-maroon-600 dark:text-maroon-500">Base Costs</strong> = RM Price + Freight</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">2. Customs & Overheads</h3>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>BCD:</strong> 11% of Base Costs</li>
            <li><strong>SWG:</strong> 10% of BCD</li>
            <li><strong>GST:</strong> 18% of (Base Costs + BCD + SWG)</li>
            <li><strong>CHA & Admin:</strong> User input (Flat ₹)</li>
            <li><strong className="text-maroon-600 dark:text-maroon-500">Total Customs</strong> = BCD + SWG + GST + Overheads</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">3. Insurance</h3>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>Insurance:</strong> (Base Costs + Total Customs) × Insurance Multiplier</li>
            <li><strong className="text-maroon-600 dark:text-maroon-500">Subtotal</strong> = Base Costs + Customs + Insurance</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">4. Capital Block Interest</h3>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>Interest:</strong> Subtotal × Interest Rate (14%) × (Days (45) / 365)</li>
            <li><strong className="text-maroon-600 dark:text-maroon-500">Landing Price</strong> = Subtotal + Interest</li>
          </ul>
        </div>

        <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <p className="font-medium text-slate-900 dark:text-white mt-2">
            <strong className="text-maroon-600 dark:text-maroon-500">FINAL SELLING PRICE</strong> = Landing Price + Final Margin (Default 25%)
          </p>
        </div>
      </div>
    </section>
  );
}