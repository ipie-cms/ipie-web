import React from 'react';
import Container from '../Container/Container';


/* ---------- Outline Icons (inline SVG) ---------- */
const FolderIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <path d="M11.5 9.5h4.5v5.5l-2.25-1.6-2.25 1.6V9.5z" />
  </svg>
);

const ClipboardIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="2.5" width="8" height="4" rx="1" />
    <path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2" />
    <path d="m9.3 13.2 2 2 3.6-3.6" />
  </svg>
);

const UsersIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.2 19.5c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2" />
    <circle cx="17.2" cy="9.2" r="2.6" />
    <path d="M16.8 14.4c2.9.3 4.6 2.1 4.6 4.4" />
  </svg>
);

const ScaleIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v18" />
    <path d="M8 21h8" />
    <path d="M4 7h16" />
    <path d="m6 7-2.5 6c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1L6 7z" />
    <path d="m18 7-2.5 6c.8.7 1.6 1 2.5 1s1.7-.3 2.5-1L18 7z" />
  </svg>
);

const ShieldIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l7 3v5.2c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V6l7-3z" />
    <path d="m9.3 11.8 2 2 3.4-3.4" />
  </svg>
);

const LockIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.2" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

const ArrowIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ---------- Services Data (color, tint, border sab yahan) ---------- */
const SERVICES = [
  {
    title: 'Unified Case Management',
    desc: 'Streamline insolvency and bankruptcy proceedings through a centralized digital platform that manages cases from initiation to closure.',
    color: '#2563EB', bg: '#E8F0FE', border: '#BFDBFE', Icon: FolderIcon,
  },
  {
    title: 'Claims Management',
    desc: 'Digitize the complete claims lifecycle with secure claim submission, verification, modification, approval, and reconsideration workflows.',
    color: '#16A34A', bg: '#E9F9EF', border: '#BBF7D0', Icon: ClipboardIcon,
  },
  {
    title: 'Stakeholder Management',
    desc: 'Facilitate collaboration among creditors, insolvency professionals, tribunals, regulators, valuers, auditors, and other stakeholders.',
    color: '#D97706', bg: '#FCF4DE', border: '#FDE68A', Icon: UsersIcon,
  },
  {
    title: 'Resolution & Liquidation Management',
    desc: 'Support resolution planning, liquidation processes, asset realization, distribution of case closure through structured workflows.',
    color: '#9333EA', bg: '#F4EDFC', border: '#E9D5FF', Icon: ScaleIcon,
  },
  {
    title: 'Compliance & Reporting',
    desc: 'Simplify regulatory compliance with automated reporting, statutory submissions, audit trails, and monitoring tools.',
    color: '#0891B2', bg: '#E0F7FA', border: '#A5F3FC', Icon: ShieldIcon,
  },
  {
    title: 'Virtual Data Room & E-Voting',
    desc: 'Provide a secure environment for confidential document sharing, due diligence, stakeholder collaboration, and electronic voting.',
    color: '#DB2777', bg: '#FCEAF2', border: '#FBCFE8', Icon: LockIcon,
  },
];

export default function OurServices() {
  return (
    <Container>
      <section className=" py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-3">Our Services</h2>
          <p className="text-center text-slate-600 text-sm md:text-base mb-12 md:mb-16">
          Designed to simplify every stage of the IBC Ecosystem
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {SERVICES.map(({ title, desc, color, bg, border, Icon }) => (
            <div
              key={title}
              className="rounded-lg p-8 md:p-9 flex flex-col items-start bg-[#F8FAFC] transition-shadow duration-300 hover:shadow-lg"
              style={{ border: `1px solid ${border}` }}
            >
              {/* Icon box */}
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center mb-9"
                style={{ backgroundColor: bg }}
              >
                <span style={{ color }}>
                  <Icon className="w-10 h-10" />
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-[22px] font-bold text-slate-800 mb-4">{title}</h3>

              {/* Description */}
              <p className="text-slate-600 text-base md:text-[17px] leading-relaxed mb-8">{desc}</p>

              {/* Learn More */}
              <a
                href="#"
                className="mt-auto inline-flex items-center gap-2 text-[#1D4ED8] font-medium text-base transition-all hover:gap-3"
              >
                Learn More
                <ArrowIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
    </Container>
  );
}