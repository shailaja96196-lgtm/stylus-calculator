import { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import Footer from './components/Footer';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-200 py-10 px-4 sm:px-6 lg:px-8 xl:px-12 font-sans selection:bg-maroon-600 selection:text-white flex flex-col items-center relative">
      

      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 p-2.5 rounded-full bg-white dark:bg-neutral-900 shadow-sm border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-maroon-600"
        aria-label="Toggle Dark Mode"
        title="Toggle Theme"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>


      <header className="w-full max-w-7xl flex justify-center mb-10 pt-8 sm:pt-0">
        <div className="flex items-center gap-4 sm:gap-5">
          <img 
            src="/logo.svg" 
            alt="Stylus Technologies Logo" 
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
          />
          
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors leading-none mb-1.5">
              Stylus Technologies
            </h1>
            <p className="text-slate-500 dark:text-neutral-400 transition-colors">
              Procurement Pricing Calculator
            </p>
          </div>
        </div>
      </header>


      <main className="w-full max-w-7xl">
        <Calculator />
      </main>


      <Footer />

    </div>
  );
}

export default App;