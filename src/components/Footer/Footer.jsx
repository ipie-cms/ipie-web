import React from "react";
import Container from '../Container/Container';


const Footer = () => {
  return (
    <Container>
    <footer className="bg-gradient-to-r from-[#1a3a6e] to-[#0d1f3c] text-white py-14 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* ── Column 1: Logo & Description ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2563eb] rounded-md flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span className="text-[#3b82f6] text-2xl font-bold tracking-wide">
              IPIE
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-[280px]">
            A united digital platform connecting all stakeholders of the
            Insolvency and Bankruptcy Code ecosystem.
          </p>
        </div>

        {/* ── Column 2: Get in Touch ── */}
        <div className="space-y-5">
          <h3 className="text-[#3b82f6] text-base font-semibold">
            Get in Touch
          </h3>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <p>
              <span className="text-white font-medium">Address-</span> E Block,
              CGO Complex, Lodhi Road New Delhi- 110003
            </p>
            <p>
              <span className="text-white font-medium">Email-</span>{" "}
              <a
                href="mailto:support@ipie.gov.in"
                className="hover:text-[#3b82f6] transition-colors"
              >
                support@ipie.gov.in
              </a>
            </p>
            <p>
              <span className="text-white font-medium">Phone No.-</span>{" "}
              011-XXXX XXXX
            </p>
          </div>
        </div>

        {/* ── Column 3: Policies ── */}
        <div className="space-y-5">
          <h3 className="text-[#3b82f6] text-base font-semibold">Policies</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            {["Privacy Policy", "Terms of Use", "Security Policy", "Accessibility", "Disclaimer"].map(
              (item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-[#3b82f6] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* ── Column 4: Follow Us ── */}
        <div className="space-y-5">
          <h3 className="text-[#3b82f6] text-base font-semibold">Follow Us</h3>
          <div className="flex gap-4">
            {/* X (Twitter) */}
            <a
              href="#"
              aria-label="X (Twitter)"
              className="w-10 h-10 rounded-full bg-[#1e3a5f] border border-[#2a4a7f] flex items-center justify-center hover:bg-[#2563eb] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full bg-[#1e3a5f] border border-[#2a4a7f] flex items-center justify-center hover:bg-[#2563eb] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="#"
              aria-label="YouTube"
              className="w-10 h-10 rounded-full bg-[#1e3a5f] border border-[#2a4a7f] flex items-center justify-center hover:bg-[#2563eb] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom Border / Divider (optional) ── */}
      <div className="max-w-7xl mx-auto mt-12 border-t border-[#1e3a5f] pt-6">
        <p className="text-center text-gray-400 text-xs">
          © 2026 IPIE. All rights reserved.
        </p>
      </div>
    </footer>
    </Container>
  );
};

export default Footer;