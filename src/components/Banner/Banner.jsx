import React from 'react';
import Card from './Cards';
import Container from '../Container/Container';

/* ---------- Diagram ke chhote icons ---------- */
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

/* Figma wale 8 nodes */
const NODES = [
  { label: 'NCLAT', angle: 90, color: '#7C3AED', Icon: BankIcon },
  { label: 'Insolvency Professionals', angle: 45, color: '#DB2777', Icon: UserIcon },
  { label: 'NeSL', angle: 0, color: '#EA580C', Icon: NetworkIcon },
  { label: 'MCA', angle: -45, color: '#10B981', Icon: BankIcon },
  { label: 'NCLAT', angle: -90, color: '#7C3AED', Icon: BankIcon },
  { label: 'IBBI', angle: -135, color: '#2563EB', Icon: UserIcon },
  { label: 'Creditors & Stakeholders', angle: 180, color: '#059669', Icon: UsersIcon },
  { label: 'NCLT', angle: 135, color: '#16A34A', Icon: BankIcon },
];

const pos = (angle, radius = 42) => {
  const rad = (angle * Math.PI) / 180;
  return { left: `${50 + radius * Math.cos(rad)}%`, top: `${50 - radius * Math.sin(rad)}%` };
};

/* Lavender card ke andar built-in ecosystem diagram */
const EcosystemDiagram = () => (
  <div className="bg-[#E7EBF7] rounded-2xl shadow-lg w-full max-w-[520px] h-[300px] md:h-[320px] flex items-center justify-center p-4">
    <div className="relative w-[250px] h-[250px] md:w-[270px] md:h-[270px]">
      {/* Ring + dots */}
      <div className="absolute inset-[10%] rounded-full border border-blue-300/80" />
      {NODES.map((n, i) => (
        <div key={`d${i}`} className="absolute w-1.5 h-1.5 -ml-0.5 -mt-0.5 rounded-full bg-blue-500" style={pos(n.angle + 22)} />
      ))}
      {/* Nodes */}
      {NODES.map((n, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-md flex flex-col items-center justify-center gap-0.5 w-12 h-12 px-0.5"
          style={pos(n.angle)}
        >
          <span style={{ color: n.color }}>
            <n.Icon className="w-4 h-4" />
          </span>
          <span className="text-[5.5px] font-bold text-center leading-[1.1]" style={{ color: n.color }}>
            {n.label}
          </span>
        </div>
      ))}
      {/* Center */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center"
        style={{ boxShadow: '0 0 0 8px rgba(255,255,255,0.5), 0 8px 20px rgba(30,64,175,0.15)' }}
      >
        <span className="text-xl font-extrabold text-blue-600">iPIE</span>
        <span className="text-[10px] font-bold text-slate-700 -mt-0.5">Platform</span>
      </div>
    </div>
  </div>
);

export default function Banner() {
  const statsData = [
    { id: 1, icon: 'scales', title: 'Active Cases', value: '500+', percentage: '84% vs Apr 2025', bgColor: '#16A34A' },
    { id: 2, icon: 'claims', title: 'Claims Received', value: '500+', percentage: '84% vs Apr 2025', bgColor: '#2563EB' },
    { id: 3, icon: 'resolutions', title: 'Resolutions', value: '4,820', percentage: '84% vs Apr 2025', bgColor: '#A855F7' },
    { id: 4, icon: 'liquidations', title: 'Liquidations', value: '4,820', percentage: '84% vs Apr 2025', bgColor: '#F59E0B' },
    { id: 5, icon: 'ips', title: 'Registered IPs', value: '4,820', percentage: '84% vs Apr 2025', bgColor: '#14B8A6' },
  ];

  return (
    <>
    <Container>
      {/* ===== Banner (dark navy gradient) ===== */}
      <section className="bg-gradient-to-br from-[#0d2b4e] via-[#123a63] to-[#1d4e7e] pt-14 md:pt-20 pb-32 md:pb-36">
        <div className="w-full px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left – Content */}
            <div>
              <h1 className="font-serif text-4xl md:text-[44px] font-bold text-white leading-snug mb-6">
                Integrated Platform for IBC Ecosystem
              </h1>
              <p className="text-blue-100/90 text-[15px] md:text-base leading-relaxed mb-8 max-w-xl">
                A united digital platform connecting all stakeholders of the Insolvency and Bankruptcy Code
                ecosystem for seamless interaction, transparency and efficient resolution
              </p>
              <button className="bg-white text-[#2563EB] border-2 border-[#2563EB] rounded-lg px-8 py-3 font-semibold text-[15px] hover:bg-blue-50 transition-colors">
                Learn more
              </button>
            </div>

            {/* Right – Diagram card */}
            <div className="flex justify-center lg:justify-end">
              <EcosystemDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats cards ===== */}
      {/* Light section banner ke theek baad start hoti hai (koi negative margin nahi) */}
      <section className="bg-[#F7F9FC] pb-[20px] md:pb-[20px]">
        <div className="max-w-[1700px] mx-auto px-6">
          {/* ✅ ROOT FIX: -mt ki jagah -translate-y → margin collapsing nahi hoga,
              sirf cards upar khiskenge, light background apni jagah rahega */}
          <div className="relative z-10 -translate-y-16 md:-translate-y-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {statsData.map((stat) => (
              <Card
                key={stat.id}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                percentage={stat.percentage}
                bgColor={stat.bgColor}
              />
            ))}
          </div>
        </div>
      </section>
      </Container>
    </>
  );
}