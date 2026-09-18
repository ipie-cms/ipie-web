import React, { useState } from 'react';
import Container from '../Container/Container';


/* ---------- Icons (same as before) ---------- */
const GavelIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L11 10" />
    <path d="m16 16 6-6" />
    <path d="m8 8 6-6" />
    <path d="m9 7 8 8" />
    <path d="m21 11-8-8" />
    <path d="M8 21.5h8" />
  </svg>
);

const UserPlusIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="10" cy="7.5" r="3.2" />
    <path d="M4 19.5c0-3.2 2.7-5.3 6-5.3s6 2.1 6 5.3" />
    <path d="M18.5 6.5v5M16 9h5" />
  </svg>
);

const ReceiptIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 4.5 9.2 3.3l1.2 1.2 1.2-1.2 1.2 1.2 1.2-1.2L16 4.5V19.5H8V4.5z" />
    <path d="M10.2 8.2h3.6M10.2 11.2h3.6M10.2 14.2h2.4" />
    <path d="M5.6 21.2h9.6" />
  </svg>
);

const UsersSolidIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="7.4" r="2.8" />
    <circle cx="5.8" cy="9.3" r="2.1" />
    <circle cx="18.2" cy="9.3" r="2.1" />
    <path d="M12 11.6c-3 0-5.4 1.9-5.4 4.3v1.6h10.8v-1.6c0-2.4-2.4-4.3-5.4-4.3z" />
    <path d="M5.8 12.5c-2.1 0-3.8 1.4-3.8 3.2v1.8h3.2v-1.6c0-1.3.5-2.4 1.4-3.3-.3-.1-.6-.1-.8-.1z" />
    <path d="M18.2 12.5c2.1 0 3.8 1.4 3.8 3.2v1.8h-3.2v-1.6c0-1.3-.5-2.4-1.4-3.3.3-.1.6-.1.8-.1z" />
  </svg>
);

const WalletIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3.5" y="5.5" width="17" height="14" rx="2.5" />
    <path d="M20.5 10.2h-3.6a2.3 2.3 0 0 0 0 4.6h3.6" />
    <circle cx="16.9" cy="12.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const ClipboardListIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8.2" y="2.8" width="7.6" height="3.6" rx="1" />
    <path d="M15.8 4.6h2.4a1.6 1.6 0 0 1 1.6 1.6v13.2a1.6 1.6 0 0 1-1.6 1.6H5.8a1.6 1.6 0 0 1-1.6-1.6V6.2a1.6 1.6 0 0 1 1.6-1.6h2.4" />
    <path d="M8.6 10.2h6.8M8.6 13.2h6.8M8.6 16.2h4.4" />
  </svg>
);

const ClipboardCheckIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8.2" y="2.8" width="7.6" height="3.6" rx="1" />
    <path d="M15.8 4.6h2.4a1.6 1.6 0 0 1 1.6 1.6v13.2a1.6 1.6 0 0 1-1.6 1.6H5.8a1.6 1.6 0 0 1-1.6-1.6V6.2a1.6 1.6 0 0 1 1.6-1.6h2.4" />
    <path d="m9.4 13.4 2 2 3.6-3.8" />
  </svg>
);

const CheckCircleIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="m8.4 12.5 2.6 2.6 7.4-8" />
  </svg>
);

/* ---------- Steps data ---------- */
const STEPS = [
  { title: 'Admission of Application', desc: 'Admission filed before NCLT and admitted', color: '#3342B4', tint: '#DDE2F1', Icon: GavelIcon },
  { title: 'IRP/ RP', desc: 'Interim Resolution Professional assigned', color: '#F0930F', tint: '#FAE9CD', Icon: UserPlusIcon },
  { title: 'Claims', desc: 'Creditors submit and verify claims', color: '#1EA45B', tint: '#BDF0D6', Icon: ReceiptIcon },
  { title: 'COC Process', desc: 'Committee of creditors constituted', color: '#8B5CF6', tint: '#D9C9F6', Icon: UsersSolidIcon },
  { title: 'Valuation and EOI', desc: 'Plan submitted and voted by COC', color: '#0E96B4', tint: '#A9D9F2', Icon: WalletIcon },
  { title: 'Resolution Plan', desc: 'Plan submitted and voted by COC', color: '#22D3EE', tint: '#A0EFF2', Icon: ClipboardListIcon },
  { title: 'NCLT Approval', desc: 'Plan Approved by NCLT', color: '#8B7CF6', tint: '#C9BAF2', Icon: ClipboardCheckIcon },
  { title: 'Resolution', desc: 'Plan Implemented and case resolved', color: '#F472A6', tint: '#F6CBD8', Icon: CheckCircleIcon },
];

export default function ProcessSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <Container>
    <section
      className=" pb-12 md:pb-16 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="max-w-[1400px] mx-auto px-3 md:px-4">
        {/* Header */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-2 md:mb-3">
          Corporate Insolvency Resolution Process
        </h2>
        <p className="text-center text-gray-800 text-sm md:text-base lg:text-lg font-medium mb-10 md:mb-14">
          End to End Journey of a case under the IBC
        </p>

        {/* Steps – mobile: grid (no scroll), md+: single flex row jo fit hoti hai */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-8 md:flex md:items-start md:justify-center md:gap-1 lg:gap-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.title}>
              {/* Step column */}
              <div className="flex flex-col items-center flex-1 min-w-0 px-1">
                {/* Ring – hover par colorful */}
                <div
                  className="rounded-full border-2 p-[2px] md:p-[3px] transition-colors duration-300"
                  style={{ borderColor: hovered ? step.color : '#EBEFF3' }}
                >
                  <div
                    className="w-16 h-16 md:w-[clamp(48px,7vw,104px)] md:h-[clamp(48px,7vw,104px)] rounded-full flex items-center justify-center"
                    style={{ backgroundColor: step.tint }}
                  >
                    <span style={{ color: step.color }}>
                      <step.Icon className="w-7 h-7 md:w-[clamp(20px,3.2vw,44px)] md:h-[clamp(20px,3.2vw,44px)]" />
                    </span>
                  </div>
                </div>

                <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 text-center leading-snug mt-4 md:mt-5">
                  {step.title}
                </h3>
                <p className="text-xs lg:text-[15px] text-gray-800 text-center leading-snug mt-1 md:mt-2">
                  {step.desc}
                </p>
              </div>

              {/* Arrow – sirf md+ par, circle ke center aligned */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex shrink-0 items-center w-6 lg:w-8"
                  style={{ height: 'clamp(48px,7vw,104px)' }}
                >
                  <svg
                    viewBox="0 0 56 24" fill="none" stroke="#111827" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" className="w-full h-4 lg:h-5"
                  >
                    <path d="M2 12h47M43 6l7 6-7 6" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
    </Container>
  );
}