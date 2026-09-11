import { useState } from "react";
import AccessibilityButton from '../Accessibility/AccessibilityButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="mx-auto flex min-h-[70px] max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-14">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/ipie-logo.svg"
            alt="PIE Logo"
            className="h-12 w-32 object-cover"
            style={{
              filter: 'brightness(1.1) contrast(1.2)',
              opacity: 0.95
            }}
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex lg:gap-12">
          <a
            href="#home"
            className="text-base font-medium text-[#1f4f8a] transition hover:text-[#0b315c]"
          >
            Home
          </a>

          <a
            href="#about"
            className="text-base font-medium text-slate-600 transition hover:text-[#1f4f8a]"
          >
            About
          </a>

          <a
            href="#services"
            className="text-base font-medium text-slate-600 transition hover:text-[#1f4f8a]"
          >
            Services
          </a>

          {/* Resource */}
          <button
            type="button"
            className="flex items-center cursor-pointer gap-2 text-base font-medium text-slate-600 transition hover:text-[#1f4f8a]"
          >
            Resource
            <span className="h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-slate-600" />
          </button>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            className="rounded-lg border-2 border-[#1f5591] px-8 py-2 text-base font-medium text-[#174d88] transition hover:bg-[#1f5591] hover:text-white"
          >
            Log in
          </button>

          <button
            type="button"
            className="rounded-lg bg-[#1f5591] px-8 py-2 text-base font-medium text-white transition hover:bg-[white] hover:text-[#1f5591] border-2 hove:border-[#1f5591] border-[#1f5591]"
          >
            Register
          </button>
           <button
            type="button"
            className="rounded-lg bg-[#1f5591] px-8 py-2 text-base font-medium text-white transition hover:bg-[white] hover:text-[#1f5591] border-2 hove:border-[#1f5591] border-[#1f5591]"
          >
            <AccessibilityButton />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="flex w-5 flex-col gap-1.5">
            <span className="h-0.5 w-full bg-slate-700" />
            <span className="h-0.5 w-full bg-slate-700" />
            <span className="h-0.5 w-full bg-slate-700" />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-md md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#home"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-[#1f4f8a] hover:bg-slate-50"
            >
              Home
            </a>

            <a
              href="#about"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50"
            >
              About
            </a>

            <a
              href="#services"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50"
            >
              Services
            </a>

            <button
              type="button"
              className="flex items-center justify-between rounded-md px-3 py-2 text-left text-base font-medium text-slate-600 hover:bg-slate-50"
            >
              Resource
              <span className="h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-slate-600" />
            </button>

            <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row">
              <button
                type="button"
                className="w-full rounded-lg border-2 border-[#1f5591] px-6 py-3 text-base font-medium text-[#174d88] transition hover:bg-[#1f5591] hover:text-white"
              >
                Log in
              </button>

              <button
                type="button"
                className="w-full rounded-lg bg-[#1f5591] px-6 py-3 text-base font-medium text-white transition hover:bg-[#174575]"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;