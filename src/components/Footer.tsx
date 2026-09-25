export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full max-w-7xl mt-8 pb-4 text-center text-xs sm:text-sm text-slate-400 dark:text-neutral-600 transition-colors">
      <p className="font-medium">
        &copy; {currentYear} Stylus Technologies. All rights reserved.
      </p>
      <p className="mt-1.5 flex items-center justify-center gap-1.5">
        <svg className="w-4 h-4 text-maroon-600/70 dark:text-maroon-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        This tool is strictly for internal use only. Do not share or distribute outside the company.
      </p>
    </footer>
  );
}