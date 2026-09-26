export default function ExampleBreakdown() {
  return (
    <section className="mt-10 sm:mt-12 p-6 sm:p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 transition-colors">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-maroon-600 dark:text-maroon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        How is International Pricing Calculated?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm text-slate-600 dark:text-neutral-400">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">1. The Base CIF Value</h3>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>RM Price:</strong> Base Foreign Price × Exchange Rate × Quantity</li>
            <li><strong>Freight:</strong> User input (Flat ₹)</li>
            <li><strong>Insurance:</strong> (RM Price + Freight) × 0.5%</li>
            <li><strong className="text-maroon-600 dark:text-maroon-500">CIF (Base Cost)</strong> = RM Price + Freight + Insurance</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">2. Customs & Landed Cost</h3>
          <ul className="space-y-1.5 list-disc pl-4">
            <li><strong>BCD:</strong> 10% of CIF</li>
            <li><strong>SWG:</strong> 10% of BCD</li>
            <li><strong>Claimable GST:</strong> Total Customs Payable × 18% <br/><span className="text-xs italic">(Not added to final cost, but blocks capital for interest)</span></li>
            <li><strong className="text-maroon-600 dark:text-maroon-500">Landed Cost</strong> = CIF + BCD + SWG + CHA + Admin Overheads</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-neutral-200 mb-2">3. Consolidated Capital Block Interest</h3>
          <div className="bg-slate-50 dark:bg-[#111] p-4 rounded-lg border border-slate-100 dark:border-neutral-800/80">
            <p className="mb-2">Because Stylus pays for RM, Customs, Freight, and GST upfront, cash is "blocked" until the customer pays. Interest is charged on this consolidated blocked amount.</p>
            <ul className="space-y-1.5 list-disc pl-4 font-medium text-slate-700 dark:text-neutral-300">
              <li>Capital Blocked = Landed Cost + Upfront GST</li>
              <li><strong className="text-maroon-600 dark:text-maroon-500">Interest</strong> = Capital Blocked × Interest Rate (14%) × (Days (45) / 365)</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <p className="font-medium text-slate-900 dark:text-white mt-2">
            <strong className="text-maroon-600 dark:text-maroon-500">FINAL SELLING PRICE</strong> = (Landed Cost + Consolidated Interest) + Final Margin (25%)
          </p>
        </div>
      </div>
    </section>
  );
}