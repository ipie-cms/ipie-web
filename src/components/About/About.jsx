import React from 'react';
import Container from '../Container/Container';


/* ---------- Icons (inline SVG, koi dependency nahi) ---------- */
const BankIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3 3 8v2h18V8l-9-5zM5 12v5H3v3h18v-3h-2v-5h-3v5h-2.5v-5h-3v5H8v-5H5z" />
  </svg>
);
const UserIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.4-8 5.4V21h16v-1.6c0-3-3.6-5.4-8-5.4Z" />
  </svg>
);
const UsersIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8 .5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 19c0-2.9 3.1-5.2 7-5.2s7 2.3 7 5.2v1H2v-1Zm16.9-3.4c1.9.7 3.1 2 3.1 3.6V21h-3.5v-2c0-1.3-.6-2.5-1.6-3.4.7-.1 1.4-.1 2 0Z" />
  </svg>
);
const NetworkIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="6" cy="12" r="2.6" fill="currentColor" stroke="none" />
    <circle cx="18" cy="5.5" r="2.6" fill="currentColor" stroke="none" />
    <circle cx="18" cy="18.5" r="2.6" fill="currentColor" stroke="none" />
    <path d="m8.3 10.7 7.4-4M8.3 13.3l7.4 4" />
  </svg>
);

/* ---------- Ecosystem nodes (angle = circle par position) ---------- */
const NODES = [
  { label: 'NCLAT', angle: 90, color: '#7C3AED', Icon: BankIcon },
  { label: 'IBBI', angle: 39, color: '#2563EB', Icon: UserIcon },
  { label: 'Creditors & Stakeholders', angle: -12, color: '#059669', Icon: UsersIcon },
  { label: 'NCLT', angle: -63, color: '#1D4ED8', Icon: BankIcon },
  { label: 'Insolvency Professionals', angle: -115, color: '#DB2777', Icon: UserIcon },
  { label: 'NeSL', angle: -166, color: '#EA580C', Icon: NetworkIcon },
  { label: 'MCA', angle: 141, color: '#10B981', Icon: BankIcon },
];

/* Decor: chhote sparkle dots (Figma jaise) */
const SPARKS = [
  { left: '10%', top: '28%' },
  { left: '6%', top: '56%' },
  { left: '18%', top: '82%' },
  { left: '82%', top: '16%' },
  { left: '88%', top: '72%' },
  { left: '70%', top: '88%' },
];

const pos = (angle, radius = 42) => {
  const rad = (angle * Math.PI) / 180;
  return { left: `${50 + radius * Math.cos(rad)}%`, top: `${50 - radius * Math.sin(rad)}%` };
};

export default function About() {
  return (
    <Container>
    <div className="w-full">
      {/* ===== Header + Main (ek hi continuous light-blue background) ===== */}
      <section className="bg-[#EAF2FC] pt-14 md:pt-16 pb-16 md:pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-3">About iPIE</h2>
          <p className="text-center text-slate-500 text-xs md:text-sm mb-14 md:mb-16">
            Powerful capabilities designed for a seamless IBC experience
          </p>

          <div className="relative">
            {/* Bada tilted panel (Figma jaisa) */}
            <div className="absolute -top-6 -bottom-12 left-[3%] md:left-[30%] right-[3%] rotate-[-4deg] rounded-[2.5rem] bg-[#D6E4F7]" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center py-[25px] px-[50px]">
              {/* LEFT – Ecosystem Diagram */}
              <div className="flex justify-center relative z-20">
                <div className="relative rotate-[2deg] rounded-3xl bg-white/45 shadow-sm p-6 md:p-8 overflow-hidden">
                  {/* Dotted India-map patch (right-center, Figma jaisa) */}
                  <div
                    className="absolute right-2 top-1/2 -translate-y-[60%] w-40 h-52 opacity-60 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#9EC3EF 1.1px, transparent 1.1px)',
                      backgroundSize: '7px 7px',
                      maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
                      WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
                    }}
                  />

                  {/* Wave lines (decor) */}
                  <svg className="absolute bottom-3 left-3 w-56 h-20 opacity-70 pointer-events-none" viewBox="0 0 220 80" fill="none">
                    <path d="M0 55 C 30 40, 60 70, 90 55 S 150 40, 220 60" stroke="#C9DCF3" strokeWidth="2" />
                    <path d="M0 68 C 40 55, 80 80, 120 66 S 180 52, 220 72" stroke="#DCE9F8" strokeWidth="2" />
                  </svg>

                  {/* Sparkle dots (decor) */}
                  {SPARKS.map((s, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-blue-300/80 pointer-events-none"
                      style={{ left: s.left, top: s.top }}
                    />
                  ))}

                  {/* Diagram */}
                  <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[420px] md:h-[420px] mx-auto">
                    {/* Ring */}
                    <div className="absolute inset-[9%] rounded-full border border-blue-300/80" />

                    {/* Ring par chhote blue dots */}
                    {NODES.map((n) => (
                      <div
                        key={`dot-${n.label}`}
                        className="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-blue-500"
                        style={pos(n.angle + 26)}
                      />
                    ))}

                    {/* Stakeholder nodes */}
                    {NODES.map(({ label, angle, color, Icon }) => (
                      <div
                        key={label}
                        className="absolute -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-md flex flex-col items-center justify-center gap-1 w-16 h-16 px-1"
                        style={pos(angle)}
                      >
                        <span style={{ color }}>
                          <Icon className="w-5 h-5" />
                        </span>
                        {/* ✅ Label ab icon ke color me (Figma jaisa) */}
                        <span
                          className="text-[7px] font-bold text-center leading-[1.1]"
                          style={{ color }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}

                    {/* Center – iPIE Platform (soft halo rings ke saath) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-white/35 flex items-center justify-center">
                      <div
                        className="w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center"
                        style={{
                          boxShadow:
                            '0 0 0 10px rgba(255,255,255,0.5), 0 10px 25px rgba(30,64,175,0.15)',
                        }}
                      >
                        <span className="text-3xl font-extrabold text-blue-600">iPIE</span>
                        <span className="text-sm font-bold text-slate-700 -mt-0.5">Platform</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT – Content */}
              <div className="relative z-10 md:pl-6">
                <h3 className="font-serif text-3xl md:text-[34px] font-bold text-slate-900 mb-6 leading-snug">
                  Integrated Platform for IBC Ecosystem
                </h3>

                <p className="text-slate-500 text-sm md:text-[15px] leading-relaxed mb-8 max-w-xl">
                  Integrated Platform for IBC Ecosystem (iPIE) is a unified digital platform designed to streamline
                  insolvency and bankruptcy processes by connecting all stakeholders through a single, secure, and
                  transparent ecosystem. It enables seamless collaboration among Insolvency Professionals, Adjudicating
                  Authorities, Regulators, Creditors, and Government Agencies, ensuring efficient case management,
                  real-time information exchange, and faster resolution of insolvency proceedings.
                </p>

                <button className="bg-[#1D4E89] hover:bg-[#173E6E] text-white text-sm font-semibold px-8 py-3 rounded-md transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </Container>
  );
}