import { useState, useMemo } from 'react';

interface Props {
  onSwitch: (source: 'india' | 'international') => void;
}

export default function DomesticPricing({ onSwitch }: Props) {
  const [basePrice, setBasePrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  
  const [freight, setFreight] = useState<string>('');
  const [otherCharges, setOtherCharges] = useState<string>('');
  const [gstRate, setGstRate] = useState<string>('9');
  const [marginRate, setMarginRate] = useState<string>('40');
  
  const [copied, setCopied] = useState(false);

  const isPristine = basePrice === '' && quantity === '' && freight === '' && otherCharges === '' && gstRate === '9' && marginRate === '40';
  
  const missingFields = useMemo(() => {
    const missing = [];
    if (basePrice === '') missing.push('Base Unit Price');
    if (quantity === '') missing.push('Required Quantity');
    if (freight === '') missing.push('Freight Charges');
    if (otherCharges === '') missing.push('Other Charges');
    if (gstRate === '') missing.push('GST (%)');
    if (marginRate === '') missing.push('Final Margin (%)');
    return missing;
  }, [basePrice, quantity, freight, otherCharges, gstRate, marginRate]);

  const calculation = useMemo(() => {
    if (missingFields.length > 0) return null;

    const numBasePrice = parseFloat(basePrice);
    const numQuantity = parseInt(quantity, 10);
    const numFreight = parseFloat(freight) || 0;
    const numOther = parseFloat(otherCharges) || 0;
    const numGstRate = parseFloat(gstRate) || 0;
    const numMarginRate = parseFloat(marginRate) || 0;
    
    if (isNaN(numBasePrice) || isNaN(numQuantity) || numBasePrice <= 0 || numQuantity <= 0) return null;

    const rmTotal = numBasePrice * numQuantity;
    const gstAmount = rmTotal * (numGstRate / 100);
    const landedCost = rmTotal + gstAmount + numFreight + numOther;
    const marginAmount = landedCost * (numMarginRate / 100);
    const totalSellingPrice = landedCost + marginAmount;
    const sellingPriceUnit = totalSellingPrice / numQuantity;

    return {
      isValid: true,
      inrBasePrice: numBasePrice,
      rmTotal,
      gstAmount,
      freight: numFreight,
      otherCharges: numOther,
      landedCost,
      marginPercent: numMarginRate,
      marginAmount,
      sellingPriceUnit,
      totalSellingPrice,
      quantity: numQuantity
    };
  }, [basePrice, quantity, freight, otherCharges, gstRate, marginRate, missingFields]);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const handleReset = () => {
    setBasePrice('');
    setQuantity('');
    setFreight('');
    setOtherCharges('');
    setGstRate('9');
    setMarginRate('40');
  };

  const handleCopy = () => {
    if (!calculation) return;
    const textToCopy = `DOMESTIC PROCUREMENT QUOTATION\n-----------------------------------\nTotal Base Cost: ${formatINR(calculation.rmTotal)}\nGST Amount: ${formatINR(calculation.gstAmount)}\nLanded Cost: ${formatINR(calculation.landedCost)}\nApplied Margin: ${calculation.marginPercent}%\nSelling Price / Unit: ${formatINR(calculation.sellingPriceUnit)}\nQuantity: ${calculation.quantity}\nTOTAL SELLING PRICE: ${formatINR(calculation.totalSellingPrice)}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ADDED: highlight prop for visual emphasis
  const ReceiptRow = ({ label, value, isSub = false, indent = false, highlight = false }: { label: string, value: number, isSub?: boolean, indent?: boolean, highlight?: boolean }) => (
    <div className={`flex justify-between gap-4 ${indent ? 'pl-3 border-l-2 border-slate-200 dark:border-neutral-700/50 ml-1 mt-2' : 'mt-2'} ${highlight ? 'py-2.5 px-3 mt-4 bg-maroon-50 dark:bg-maroon-900/20 rounded-lg font-bold text-maroon-500 border border-maroon-100 dark:border-maroon-800/60' : isSub ? 'pt-3 mt-3 border-t border-slate-200 dark:border-neutral-800/80 font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-neutral-400'} text-sm transition-colors items-center`}>
      <span className="shrink-0">{label}</span>
      <span className={`text-right break-all ${highlight ? 'text-base' : ''}`}>{formatINR(value)}</span>
    </div>
  );

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col lg:flex-row transition-colors">
      
      {/* LEFT SIDE: INPUTS */}
      <div className="flex-1 p-6 sm:p-8 lg:p-10 xl:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-neutral-800 transition-colors">
        <div className="flex items-center justify-between mb-8 lg:mb-10 gap-4">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Procurement Source</h2>
          <button onClick={handleReset} className="text-sm text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 self-start sm:self-auto">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Reset
          </button>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-black/60 rounded-lg mb-8 lg:mb-10 transition-colors">
          <button className="flex-1 py-3 text-sm font-medium rounded-md bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm transition-all">India (Domestic)</button>
          <button onClick={() => onSwitch('international')} className="flex-1 py-3 text-sm font-medium rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-all">International</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Base Unit Price</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-slate-500 dark:text-neutral-500 font-medium text-lg">₹</span></div>
              <input type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-14 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-slate-900 dark:text-white text-lg transition-all" />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-slate-400 text-sm font-medium">INR</span></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Required Quantity</label>
            <input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 10" className="w-full px-4 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-slate-900 dark:text-white text-lg transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Freight Charges (INR)</label>
            <input type="number" min="0" value={freight} onChange={(e) => setFreight(e.target.value)} placeholder="0.00" className="w-full px-4 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-slate-900 dark:text-white text-lg transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Other Charges (INR)</label>
            <input type="number" min="0" value={otherCharges} onChange={(e) => setOtherCharges(e.target.value)} placeholder="0.00 (Type 0 if none)" className="w-full px-4 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-slate-900 dark:text-white text-lg transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">GST (%)</label>
            <input type="number" min="0" step="0.1" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="w-full px-4 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-slate-900 dark:text-white text-lg transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Final Margin (%)</label>
            <input type="number" min="0" step="0.1" value={marginRate} onChange={(e) => setMarginRate(e.target.value)} className="w-full px-4 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-slate-900 dark:text-white text-lg transition-all" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: OUTPUT */}
      <div className="w-full lg:w-[45%] xl:w-[450px] shrink-0 p-6 sm:p-8 lg:p-10 xl:p-12 bg-slate-50 dark:bg-[#0f0f0f] flex flex-col transition-colors rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl">
        <div className="flex items-center justify-between mb-8 lg:mb-10">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Calculation Breakdown</h2>
          <button onClick={handleCopy} disabled={!calculation} className={`text-sm flex items-center gap-1.5 transition-colors ${!calculation ? 'text-slate-300 dark:text-neutral-700 cursor-not-allowed' : copied ? 'text-green-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'}`}>
            {copied ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Result</>}
          </button>
        </div>

        {calculation ? (
          <div className="flex flex-col flex-1 pb-4">
            
            <div className="mb-6">
              <h3 className="text-xs font-bold text-maroon-600/80 dark:text-maroon-500/80 uppercase tracking-wider mb-2 border-b border-maroon-100 dark:border-maroon-900/30 pb-1">1. Landed Cost Breakdown</h3>
              <ReceiptRow label="Total Base RM Cost" value={calculation.rmTotal} />
              <ReceiptRow label={`GST (${gstRate}%)`} value={calculation.gstAmount} />
              <ReceiptRow label="Freight" value={calculation.freight} />
              <ReceiptRow label="Other Charges" value={calculation.otherCharges} />
              <ReceiptRow label="Total Landed Cost" value={calculation.landedCost} isSub />
            </div>

            <div className="space-y-2 mb-8">
              <ReceiptRow label={`Applied Margin (${marginRate}%)`} value={calculation.marginAmount} />
              {/* Highlighted Unit Price */}
              <ReceiptRow label="Selling Price / Unit" value={calculation.sellingPriceUnit} highlight />
            </div>

            <div className="pt-6 border-t-2 border-slate-200 dark:border-neutral-800 flex flex-col items-end gap-2 mt-auto">
              <span className="text-sm font-bold tracking-wider text-maroon-500 dark:text-maroon-500 uppercase">Total Selling Price ({calculation.quantity} Units)</span>
              <span className="text-4xl font-bold text-maroon-500 dark:text-maroon-500 tracking-tight text-right break-all">{formatINR(calculation.totalSellingPrice)}</span>
            </div>
          </div>
        ) : (
          <div className={`flex-1 min-h-[300px] py-12 px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-center transition-colors ${!isPristine && missingFields.length > 0 ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10' : 'border-slate-200 dark:border-neutral-800'}`}>
            {!isPristine && missingFields.length > 0 ? (
              <>
                <svg className="w-10 h-10 mb-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-base font-bold text-red-600 dark:text-red-400">Hey, you missed a field!</p>
                <p className="text-sm mt-1.5 text-red-500 dark:text-red-400/80">No fields should be missed. Please provide: <span className="font-semibold">{missingFields.join(', ')}</span>.</p>
              </>
            ) : (
              <p className="text-base text-slate-400 dark:text-neutral-500">Enter base price and quantity to view calculation</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}