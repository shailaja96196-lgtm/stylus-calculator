import { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Footer from './components/Footer';
import ExampleBreakdown from './components/ExampleBreakdown';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // State for the edge-hiding pull tab on mobile
  const [isEdgeOpen, setIsEdgeOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Smoothly close the edge tab after selection
    setTimeout(() => setIsEdgeOpen(false), 200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-200 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans selection:bg-maroon-600 selection:text-white flex flex-col items-center relative overflow-x-hidden">
      
      {/* HEADER */}
      <header className="w-full max-w-7xl relative flex justify-center mb-10 pt-4 sm:pt-0">
        
        {/* CENTERED LOGO AND TITLE */}
        <div className="flex items-center gap-3 sm:gap-5">
          <img 
            src="/logo.svg" 
            alt="Stylus Technologies Logo" 
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
          />
          
          {/* Text block: centered relative to each other on both mobile & desktop */}
          <div className="flex flex-col items-center text-center">
            {/* Increased mobile font size to text-2xl */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors leading-none mb-1 sm:mb-1.5">
              Stylus Technologies
            </h1>
            <p className="text-xs sm:text-base text-slate-500 dark:text-neutral-400 transition-colors">
              Procurement Pricing Calculator
            </p>
          </div>
        </div>

        {/* ========================================= */}
        {/* DESKTOP TOGGLE (Hidden on mobile) */}
        {/* ========================================= */}
        <button 
          onClick={toggleTheme}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white dark:bg-[#0a0a0a] shadow-sm border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-maroon-600"
          aria-label="Toggle Dark Mode"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
      </header>

      {/* CALCULATOR APP */}
      <main className="w-full max-w-7xl">
        <Calculator />
        <ExampleBreakdown />
      </main>

      {/* FOOTER */}
      <Footer />

      {/* ========================================= */}
      {/* MOBILE EDGE SLIDER (Hidden on desktop) */}
      {/* ========================================= */}
      
      {/* Invisible overlay catches outside clicks to close it */}
      {isEdgeOpen && (
        <div 
          className="fixed inset-0 z-40 sm:hidden" 
          onClick={() => setIsEdgeOpen(false)} 
        />
      )}

      {/* The Edge Container */}
      <div 
        className={`sm:hidden fixed top-32 right-0 z-50 flex items-center transition-transform duration-300 ease-in-out ${
          isEdgeOpen ? 'translate-x-0' : 'translate-x-[calc(100%-1.25rem)]'
        }`}
      >
        {/* The little tab that sticks out */}
        <button 
          onClick={() => setIsEdgeOpen(!isEdgeOpen)}
          className="w-5 h-14 bg-white dark:bg-[#111] border border-r-0 border-slate-200 dark:border-neutral-800 rounded-l-lg flex items-center justify-center text-slate-400 dark:text-neutral-500 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] focus:outline-none relative z-10"
          aria-label="Open Theme Toggle"
        >
          {/* Chevron icon flips when open */}
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isEdgeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* The actual toggle that slides out */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 border-l-0 pr-4 pl-3 py-2.5 shadow-lg rounded-bl-lg">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-neutral-300 focus:outline-none"
          >
            {isDarkMode ? (
              <>
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Light Mode
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                Dark Mode
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;