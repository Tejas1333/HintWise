import React from "react";

const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sky-500">
        <path d="m12 3-1.9 1.9a5 5 0 0 0 0 7L12 14l1.9-1.9a5 5 0 0 0 0-7Z"/>
        <path d="M12 21 6.5 15.5a5 5 0 0 1 0-7L12 3l5.5 5.5a5 5 0 0 1 0 7Z"/>
    </svg>
);

const NavBar = () => {
  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-2">
              <LogoIcon />
              <span className="text-xl font-bold text-slate-800">
                HintWise AI
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="#"
                className="text-slate-600 hover:text-sky-600 transition-colors"
              >
                History
              </a>
              <a
                href="#"
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
              >
                Sign In
              </a>
            </div>

            {/* Mobile Menu Button (Optional, for future use) */}
            <div className="md:hidden">
              <button className="text-slate-600 hover:text-slate-800">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
