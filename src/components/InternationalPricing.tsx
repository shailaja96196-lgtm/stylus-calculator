import { useState, useEffect, useMemo } from 'react';
import { COUNTRIES } from '../data/countries';

const BCD_RATE = 0.11;
const SWG_RATE = 0.10;
const DAYS_IN_YEAR = 365;

interface Props {
  onSwitch: (source: 'india' | 'international') => void;
}

export default function InternationalPricing({ onSwitch }: Props) {
  const [basePrice, setBasePrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [freight, setFreight] = useState<string>('');
  
  const [chaCharges, setChaCharges] = useState<string>('');
  const [adminCharges, setAdminCharges] = useState<string>('');
  
  const [insuranceRate, setInsuranceRate] = useState<string>('0.5'); 
  const [gstEnabled, setGstEnabled] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<string>('18');
  
  const [marginRate, setMarginRate] = useState<string>('25');
  const [interestRate, setInterestRate] = useState<string>('14');
  const [interestDays, setInterestDays] = useState<string>('45');
  
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(COUNTRIES[0].code);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [manualExchangeRate, setManualExchangeRate] = useState<string>('');
  
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.currency.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const isPristine = basePrice === '' && freight === '' && chaCharges === '' && adminCharges === '' && quantity === '1' && insuranceRate === '0.5' && marginRate === '25' && interestRate === '14' && interestDays === '45';
  
  const missingFields = useMemo(() => {
    const missing = [];
    if (basePrice === '') missing.push('Base Unit Price');
    if (quantity === '') missing.push('Quantity');
    if (freight === '') missing.push('Freight Charges');
    if (chaCharges === '') missing.push('CHA Charges');
    if (adminCharges === '') missing.push('Admin Charges');
    if (insuranceRate === '') missing.push('Insurance Rate');
    if (gstEnabled && gstRate === '') missing.push('GST Rate');
    if (marginRate === '') missing.push('Final Margin');
    if (interestRate === '') missing.push('Interest Rate');
    if (interestDays === '') missing.push('Interest Days');
    if (rateError && manualExchangeRate === '') missing.push('Exchange Rate');
    return missing;
  }, [basePrice, quantity, freight, chaCharges, adminCharges, insuranceRate, gstEnabled, gstRate, marginRate, interestRate, interestDays, rateError, manualExchangeRate]);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRate(true);
      setRateError(false);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${selectedCountry.currency}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (data?.rates?.INR) {
          setExchangeRates(prev => ({ ...prev, [selectedCountry.currency]: data.rates.INR }));
        } else throw new Error('Invalid rate format');
      } catch (err) {
        setRateError(true);
      } finally {
        setIsLoadingRate(false);
      }
    };
    if (!exchangeRates[selectedCountry.currency] && !manualExchangeRate) fetchRates();
  }, [selectedCountry.currency, exchangeRates, manualExchangeRate]);

  const calculation = useMemo(() => {
    if (missingFields.length > 0) return null;

    const numBasePrice = parseFloat(basePrice);
    const numQuantity = parseInt(quantity, 10);
    const activeExchangeRate = manualExchangeRate ? parseFloat(manualExchangeRate) : exchangeRates[selectedCountry.currency];
        
    if (isNaN(numBasePrice) || isNaN(numQuantity) || !activeExchangeRate || numBasePrice <= 0 || numQuantity <= 0) return null;

    const numFreight = parseFloat(freight) || 0;
    const numCha = parseFloat(chaCharges) || 0;
    const numAdmin = parseFloat(adminCharges) || 0;
    const numInsuranceRate = parseFloat(insuranceRate) || 0;
    const numGstRate = gstEnabled ? (parseFloat(gstRate) || 0) : 0;
    const numMarginRate = parseFloat(marginRate) || 0;
    const numInterestRate = parseFloat(interestRate) || 0;
    const numInterestDays = parseFloat(interestDays) || 0;

    const rmPrice = numBasePrice * activeExchangeRate * numQuantity;
    const baseCosts = rmPrice + numFreight;

    const bcd = baseCosts * BCD_RATE;
    const swg = bcd * SWG_RATE;
    const gstAmount = (baseCosts + bcd + swg) * (numGstRate / 100);
    const customsAndOverheads = bcd + swg + gstAmount + numCha + numAdmin;

    const insuranceAmt = (baseCosts + customsAndOverheads) * (numInsuranceRate / 100);

    const subtotal = baseCosts + customsAndOverheads + insuranceAmt;

    const interestAmt = subtotal * (numInterestRate / 100) * (numInterestDays / DAYS_IN_YEAR);

    const landingPrice = subtotal + interestAmt;

    const marginAmount = landingPrice * (numMarginRate / 100);
    const finalPricing = landingPrice + marginAmount;
    const sellingPriceUnit = finalPricing / numQuantity;

    return {
      activeExchangeRate, rmPrice, freightAmt: numFreight, baseCosts,
      bcd, swg, gstAmount, chaAmt: numCha, adminAmt: numAdmin, customsAndOverheads, 
      insuranceAmt, subtotal, interestAmt, landingPrice,
      marginAmount, finalPricing, sellingPriceUnit, quantity: numQuantity
    };
  }, [basePrice, quantity, freight, chaCharges, adminCharges, insuranceRate, gstEnabled, gstRate, marginRate, interestRate, interestDays, selectedCountry.currency, exchangeRates, manualExchangeRate, missingFields]);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const handleCopy = () => {
    if (!calculation) return;
    const textToCopy = `INTERNATIONAL QUOTATION\n-----------------------\nCountry: ${selectedCountry.name}\nExchange Rate: ₹${calculation.activeExchangeRate}\n\nLANDING PRICE: ${formatINR(calculation.landingPrice)}\nMargin: ${formatINR(calculation.marginAmount)}\nTOTAL SELLING PRICE: ${formatINR(calculation.finalPricing)}\nSelling Price / Unit: ${formatINR(calculation.sellingPriceUnit)}\nQuantity: ${calculation.quantity}`;
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
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Procurement Source</h2>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-black/60 rounded-lg mb-8 transition-colors">
          <button onClick={() => onSwitch('india')} className="flex-1 py-3 text-sm font-medium rounded-md text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-all">India (Domestic)</button>
          <button className="flex-1 py-3 text-sm font-medium rounded-md bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm transition-all">International</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          
          <div className="relative sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 p-5 lg:p-6 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-neutral-800/60 transition-colors">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Country</label>
              <button type="button" onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)} className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black border rounded-lg focus:outline-none transition-colors text-left ${isCountryDropdownOpen ? 'border-maroon-600 ring-2 ring-maroon-600/20' : 'border-slate-300 dark:border-neutral-800'}`}>
                <span className="text-slate-900 dark:text-white text-base">{selectedCountry.name} <span className="text-slate-500">({selectedCountry.currency})</span></span>
                <svg className={`w-4 h-4 text-slate-500 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isCountryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => {setIsCountryDropdownOpen(false); setSearchQuery('');}} />
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-lg shadow-xl flex flex-col max-h-[300px]">
                    <div className="p-2 border-b border-slate-100 dark:border-neutral-800">
                      <input type="text" placeholder="Search country..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-md text-sm outline-none focus:border-maroon-600 text-slate-900 dark:text-white" autoFocus />
                    </div>
                    <div className="overflow-y-auto py-1">
                      {filteredCountries.map(c => (
                        <button key={c.code} onClick={() => { setSelectedCountryCode(c.code); setManualExchangeRate(''); setIsCountryDropdownOpen(false); setSearchQuery(''); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800/80">
                          {c.name} ({c.currency})
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Exchange Rate</label>
              {isLoadingRate ? (
                <div className="h-12 flex items-center text-sm text-slate-500">Fetching...</div>
              ) : rateError ? (
                <div className="flex items-center space-x-2"><span className="text-sm text-slate-700 dark:text-neutral-300">1 {selectedCountry.currency} = ₹</span><input type="number" value={manualExchangeRate} onChange={(e) => setManualExchangeRate(e.target.value)} placeholder="Rate" className="flex-1 px-3 py-3 bg-white dark:bg-black border border-red-300 dark:border-red-500/30 rounded-lg outline-none text-sm dark:text-white" /></div>
              ) : (
                <div className="flex items-center justify-between h-12 px-4 bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-lg text-sm text-slate-900 dark:text-white">
                  <span>1 {selectedCountry.currency} = <strong>₹{exchangeRates[selectedCountry.currency]?.toFixed(2)}</strong> INR</span>
                  <button onClick={() => setRateError(true)} className="text-xs font-medium text-maroon-600 dark:text-maroon-500">Edit</button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Base Unit Price</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="text-slate-500 font-medium">{selectedCountry.symbol}</span></div>
              <input type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-14 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Quantity</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Freight Charges (INR)</label>
            <input type="number" min="0" value={freight} onChange={(e) => setFreight(e.target.value)} placeholder="0.00 (Type 0 if none)" className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">CHA Charges (INR)</label>
            <input type="number" min="0" value={chaCharges} onChange={(e) => setChaCharges(e.target.value)} placeholder="0.00 (Type 0 if none)" className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Admin Charges (INR)</label>
            <input type="number" min="0" value={adminCharges} onChange={(e) => setAdminCharges(e.target.value)} placeholder="0.00 (Type 0 if none)" className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Customs GST (%)</label>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} />
                  <div className={`block w-8 h-4.5 rounded-full transition-colors ${gstEnabled ? 'bg-maroon-600' : 'bg-slate-300 dark:bg-neutral-700'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-2.5 h-2.5 rounded-full transition-transform ${gstEnabled ? 'translate-x-3.5' : ''}`}></div>
                </div>
              </label>
            </div>
            <input type="number" min="0" value={gstRate} disabled={!gstEnabled} onChange={(e) => setGstRate(e.target.value)} className={`w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg outline-none dark:text-white ${!gstEnabled ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-maroon-600'}`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Insurance (%)</label>
            <input type="number" min="0" step="0.1" value={insuranceRate} onChange={(e) => setInsuranceRate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Final Margin (%)</label>
            <input type="number" min="0" step="0.1" value={marginRate} onChange={(e) => setMarginRate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white" />
          </div>

          <div className="sm:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-slate-100 dark:border-neutral-800/50">
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Interest Rate (%)</label>
              <input type="number" min="0" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Interest Days</label>
              <input type="number" min="0" step="1" value={interestDays} onChange={(e) => setInterestDays(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none dark:text-white text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: CALCULATION RECEIPT */}
      <div className="w-full lg:w-[45%] shrink-0 p-6 sm:p-8 lg:p-10 bg-slate-50 dark:bg-[#0f0f0f] flex flex-col rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Calculation Breakdown</h2>
          <button onClick={handleCopy} disabled={!calculation} className={`text-sm flex items-center gap-1.5 transition-colors ${!calculation ? 'text-slate-300 dark:text-neutral-700 cursor-not-allowed' : copied ? 'text-green-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200'}`}>
            {copied ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Result</>}
          </button>
        </div>

        {calculation ? (
          <div className="flex flex-col flex-1 pb-4">
            
            <div className="mb-6">
              <h3 className="text-xs font-bold text-maroon-600/80 dark:text-maroon-500/80 uppercase tracking-wider mb-2 border-b border-maroon-100 dark:border-maroon-900/30 pb-1">1. Base Costs</h3>
              <ReceiptRow label="RM Price (INR)" value={calculation.rmPrice} />
              <ReceiptRow label="Freight" value={calculation.freightAmt} />
              <ReceiptRow label="Total Base Costs" value={calculation.baseCosts} isSub />
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-maroon-600/80 dark:text-maroon-500/80 uppercase tracking-wider mb-2 border-b border-maroon-100 dark:border-maroon-900/30 pb-1">2. Customs & Overheads</h3>
              <ReceiptRow label="BCD (11%)" value={calculation.bcd} />
              <ReceiptRow label="SWG (10% of BCD)" value={calculation.swg} />
              {gstEnabled && <ReceiptRow label={`GST (${gstRate}% of Base+BCD+SWG)`} value={calculation.gstAmount} />}
              <ReceiptRow label="CHA & Admin Charges" value={calculation.chaAmt + calculation.adminAmt} />
              <ReceiptRow label="Total Customs & Overheads" value={calculation.customsAndOverheads} isSub />
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-maroon-600/80 dark:text-maroon-500/80 uppercase tracking-wider mb-2 border-b border-maroon-100 dark:border-maroon-900/30 pb-1">3. Insurance</h3>
              <ReceiptRow label={`Insurance (${insuranceRate}%)`} value={calculation.insuranceAmt} />
              <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 pl-1 italic">*Applied to Base Costs + Customs & Overheads</div>
              <ReceiptRow label="Accumulated Subtotal" value={calculation.subtotal} isSub />
            </div>

            <div className="mb-8 border-b border-slate-200 dark:border-neutral-800/80 pb-6">
              <h3 className="text-xs font-bold text-maroon-600/80 dark:text-maroon-500/80 uppercase tracking-wider mb-2 border-b border-maroon-100 dark:border-maroon-900/30 pb-1">4. Capital Block Interest</h3>
              <ReceiptRow label={`Interest (${interestRate}% for ${interestDays} Days)`} value={calculation.interestAmt} />
              <ReceiptRow label="Landing Price" value={calculation.landingPrice} isSub />
            </div>

            <div className="space-y-2 mb-8">
              <ReceiptRow label={`Applied Margin (${marginRate}%)`} value={calculation.marginAmount} />
              {/* Highlighted Unit Price */}
              <ReceiptRow label="Selling Price / Unit" value={calculation.sellingPriceUnit} highlight />
            </div>

            <div className="pt-6 border-t-2 border-slate-200 dark:border-neutral-800 flex flex-col items-end gap-2 mt-auto">
              <span className="text-sm font-bold tracking-wider text-maroon-500 dark:text-maroon-500 uppercase">Total Selling Price ({calculation.quantity} Units)</span>
              <span className="text-4xl font-bold text-maroon-500 dark:text-maroon-500 tracking-tight text-right break-all">{formatINR(calculation.finalPricing)}</span>
            </div>
          </div>
        ) : (
          <div className={`flex-1 min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-center transition-colors p-6 ${!isPristine && missingFields.length > 0 ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10' : 'border-slate-200 dark:border-neutral-800'}`}>
             {!isPristine && missingFields.length > 0 ? (
              <>
                <svg className="w-10 h-10 mb-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-base font-bold text-red-600 dark:text-red-400">Hey, you missed a field!</p>
                <p className="text-sm mt-1.5 text-red-500 dark:text-red-400/80">No fields should be missed. Please provide: <span className="font-semibold">{missingFields.join(', ')}</span>.</p>
              </>
            ) : (
              <p className="text-base text-slate-400 dark:text-neutral-500">Enter base price, exchange rate, and quantity to generate full cost breakdown.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}