import { useState, useEffect, useMemo } from 'react';
import { COUNTRIES } from '../data/countries';

const INDIA_MARKUP_MULTIPLIER = 1.40;
const INTL_MARKUP_MULTIPLIER = 2.20;

export default function Calculator() {
  const [source, setSource] = useState<'india' | 'international'>('india');
  const [basePrice, setBasePrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(COUNTRIES[0].code);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [manualExchangeRate, setManualExchangeRate] = useState<string>('');
  
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];
  
  useEffect(() => {
    if (source !== 'international') return;
    
    const fetchRates = async () => {
      setIsLoadingRate(true);
      setRateError(false);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${selectedCountry.currency}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (data && data.rates && data.rates.INR) {
          setExchangeRates(prev => ({
            ...prev,
            [selectedCountry.currency]: data.rates.INR
          }));
        } else {
          throw new Error('Invalid rate format');
        }
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
        setRateError(true);
      } finally {
        setIsLoadingRate(false);
      }
    };

    if (!exchangeRates[selectedCountry.currency] && !manualExchangeRate) {
      fetchRates();
    }
  }, [source, selectedCountry.currency, exchangeRates, manualExchangeRate]);

  const calculation = useMemo(() => {
    const numBasePrice = parseFloat(basePrice);
    const numQuantity = parseInt(quantity, 10);
    
    if (isNaN(numBasePrice) || isNaN(numQuantity) || numBasePrice <= 0 || numQuantity <= 0) {
      return null;
    }

    if (source === 'india') {
      const sellingPriceUnit = numBasePrice * INDIA_MARKUP_MULTIPLIER;
      const totalSellingPrice = sellingPriceUnit * numQuantity;
      return {
        isValid: true,
        inrBasePrice: numBasePrice,
        markupPercent: '40%',
        sellingPriceUnit,
        totalSellingPrice,
        quantity: numQuantity
      };
    } else {
      const activeRate = manualExchangeRate 
        ? parseFloat(manualExchangeRate) 
        : exchangeRates[selectedCountry.currency];
        
      if (!activeRate || isNaN(activeRate) || activeRate <= 0) return null;

      const inrBasePrice = numBasePrice * activeRate;
      const sellingPriceUnit = inrBasePrice * INTL_MARKUP_MULTIPLIER;
      const totalSellingPrice = sellingPriceUnit * numQuantity;
      
      return {
        isValid: true,
        exchangeRate: activeRate,
        inrBasePrice,
        markupPercent: '120%',
        sellingPriceUnit,
        totalSellingPrice,
        quantity: numQuantity
      };
    }
  }, [source, basePrice, quantity, selectedCountry.currency, exchangeRates, manualExchangeRate]);

  const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const formatForeign = (val: number, currency: string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);

  const handleReset = () => {
    setSource('india');
    setBasePrice('');
    setQuantity('');
    setSelectedCountryCode(COUNTRIES[0].code);
    setManualExchangeRate('');
    setRateError(false);
  };

  const handleCopy = () => {
    if (!calculation) return;
    
    let textToCopy = '';
    if (source === 'india') {
      textToCopy = `Base Price: ${formatINR(calculation.inrBasePrice)}\nMarkup: ${calculation.markupPercent}\nSelling Price / Unit: ${formatINR(calculation.sellingPriceUnit)}\nQuantity: ${calculation.quantity}\nTotal Selling Price: ${formatINR(calculation.totalSellingPrice)}`;
    } else {
      textToCopy = `Country: ${selectedCountry.name}\nCurrency: ${selectedCountry.currency}\nBase Price: ${formatForeign(parseFloat(basePrice), selectedCountry.currency)}\nExchange Rate: 1 ${selectedCountry.currency} = ₹${calculation.exchangeRate?.toFixed(2)}\nBase Price in INR: ${formatINR(calculation.inrBasePrice)}\nMarkup: ${calculation.markupPercent}\nSelling Price / Unit: ${formatINR(calculation.sellingPriceUnit)}\nQuantity: ${calculation.quantity}\nTotal Selling Price: ${formatINR(calculation.totalSellingPrice)}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden flex flex-col lg:flex-row transition-colors">
      
  
      <div className="flex-1 p-6 sm:p-8 lg:p-10 xl:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-neutral-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 lg:mb-10 gap-4">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Procurement Source</h2>
          <button onClick={handleReset} className="text-sm text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 self-start sm:self-auto">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             Reset
          </button>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-black/60 rounded-lg mb-8 lg:mb-10 transition-colors">
          <button
            onClick={() => setSource('india')}
            className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${
              source === 'india' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
            }`}
          >
            India (Domestic)
          </button>
          <button
            onClick={() => setSource('international')}
            className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${
              source === 'international' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
            }`}
          >
            International
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          
      
          {source === 'international' && (
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 p-5 lg:p-6 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-neutral-800/60 mb-2 transition-colors">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Country</label>
                <select
                  value={selectedCountryCode}
                  onChange={(e) => {
                    setSelectedCountryCode(e.target.value);
                    setManualExchangeRate('');
                    setRateError(false);
                  }}
                  className="w-full px-4 py-3 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 outline-none text-slate-900 dark:text-white transition-colors"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">Exchange Rate</label>
                {isLoadingRate ? (
                  <div className="flex items-center h-12 text-sm text-slate-500 dark:text-neutral-400">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-maroon-600 dark:text-maroon-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Fetching latest rate...
                  </div>
                ) : rateError ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-700 dark:text-neutral-300">1 {selectedCountry.currency} = ₹</span>
                    <input
                      type="number"
                      value={manualExchangeRate}
                      onChange={(e) => setManualExchangeRate(e.target.value)}
                      placeholder="Enter rate"
                      className="flex-1 px-3 py-3 bg-white dark:bg-black border border-red-300 dark:border-red-500/30 rounded-lg focus:ring-2 focus:ring-maroon-600 outline-none text-sm text-slate-900 dark:text-white transition-colors"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between h-12 px-4 bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-lg text-sm text-slate-900 dark:text-white transition-colors">
                    <span>1 {selectedCountry.currency} = <strong>₹{exchangeRates[selectedCountry.currency]?.toFixed(2) || '...'}</strong> INR</span>
                    <button onClick={() => setRateError(true)} className="text-xs font-medium text-maroon-600 dark:text-maroon-500 hover:underline">Edit</button>
                  </div>
                )}
                {rateError && !manualExchangeRate && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Unable to fetch rate. Please enter manually.</p>
                )}
              </div>
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
              Base Unit Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-500 dark:text-neutral-500 font-medium text-lg">
                  {source === 'india' ? '₹' : selectedCountry.symbol}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-14 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 dark:focus:ring-maroon-500 focus:border-maroon-600 dark:focus:border-maroon-500 outline-none text-slate-900 dark:text-white text-lg transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-slate-400 dark:text-neutral-500 text-sm font-medium">
                  {source === 'india' ? 'INR' : selectedCountry.currency}
                </span>
              </div>
            </div>
          </div>

  
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-2">
              Required Quantity
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10"
              className="w-full px-4 py-3.5 bg-white dark:bg-black border border-slate-300 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-maroon-600 dark:focus:ring-maroon-500 focus:border-maroon-600 dark:focus:border-maroon-500 outline-none text-slate-900 dark:text-white text-lg transition-all"
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[40%] xl:w-[450px] shrink-0 p-6 sm:p-8 lg:p-10 xl:p-12 bg-slate-50 dark:bg-[#0f0f0f] flex flex-col transition-colors">
        <div className="flex items-center justify-between mb-8 lg:mb-10">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Calculation</h2>
          <button 
            onClick={handleCopy}
            disabled={!calculation}
            className={`text-sm flex items-center gap-1.5 transition-colors ${!calculation ? 'text-slate-300 dark:text-neutral-700 cursor-not-allowed' : copied ? 'text-green-600 dark:text-green-500' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200'}`}
          >
            {copied ? (
               <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied</>
            ) : (
               <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Result</>
            )}
          </button>
        </div>

        {calculation ? (
          <div className="flex flex-col flex-1">
            <div className="space-y-5">
              <div className="flex justify-between text-slate-600 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800/80 pb-4 transition-colors">
                <span>Base Price (INR)</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatINR(calculation.inrBasePrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800/80 pb-4 transition-colors">
                <span>Applied Markup</span>
                <span className="font-medium text-slate-900 dark:text-white">{calculation.markupPercent}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800/80 pb-4 transition-colors">
                <span>Selling Price / Unit</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatINR(calculation.sellingPriceUnit)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-neutral-400 border-b border-slate-200 dark:border-neutral-800/80 pb-4 transition-colors">
                <span>Quantity</span>
                <span className="font-medium text-slate-900 dark:text-white">{calculation.quantity} Units</span>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-auto">
              <span className="text-sm font-bold tracking-wider text-slate-500 dark:text-neutral-400 uppercase">Total Selling Price</span>
              <span className="text-4xl lg:text-5xl font-bold text-maroon-600 dark:text-maroon-500 tracking-tight transition-colors">
                {formatINR(calculation.totalSellingPrice)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[300px] py-12 px-6 flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-xl text-center transition-colors">
            <svg className="w-10 h-10 mb-4 text-slate-300 dark:text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <p className="text-base">Enter base price and quantity to view calculation</p>
          </div>
        )}
      </div>
    </div>
  );
}