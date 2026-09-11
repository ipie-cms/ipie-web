import React, { useEffect, useRef, useState } from 'react';

/* ✅ White inline SVG icons (Figma jaisi) – koi image file nahi chahiye */
const ICONS = {
  scales: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M8 21h8" /><path d="M4 7h16" />
      <path d="m6 7-2.5 6a3.5 3.5 0 0 0 5 0L6 7z" />
      <path d="m18 7-2.5 6a3.5 3.5 0 0 0 5 0L18 7z" />
    </svg>
  ),
  claims: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" /><path d="M9 13h6M9 17h4" />
    </svg>
  ),
  resolutions: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2.5" width="8" height="4" rx="1" />
      <path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2" />
      <path d="M9 11h6M9 14.5h6M9 18h4" />
    </svg>
  ),
  liquidations: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5.5" />
    </svg>
  ),
  ips: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="8" r="3.5" />
      <path d="M4 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M18.5 7.5v5M16 10h5" />
    </svg>
  ),
};

const DURATION = 2000; // ✅ 2 seconds

export default function Card({ icon, title, value, percentage, bgColor }) {
  const ref = useRef(null);

  // "500+" -> target=500, suffix='+'  |  "4,820" -> target=4820, suffix=''
  const target = parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = String(value).replace(/[0-9,]/g, '');

  const [display, setDisplay] = useState(`0${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = null;
    let started = false;

    const animate = () => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out (smooth finish)
        setDisplay(`${Math.round(target * eased).toLocaleString('en-IN')}${suffix}`);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    // ✅ Jab card screen par dikhe tabhi count start ho
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            animate();
            observer.unobserve(entry.target); // sirf ek baar
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, suffix]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(15,42,74,0.10)] transition-shadow hover:shadow-lg"
    >
      {/* Bottom-right soft colored arc (Figma jaisa) */}
      <div
        className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full"
        style={{ backgroundColor: bgColor, opacity: 0.12 }}
      />

      {/* Colored circle + white icon */}
      <div
        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-5 text-white"
        style={{ backgroundColor: bgColor }}
      >
        {ICONS[icon]}
      </div>

      {/* Text */}
      <div className="relative z-10">
        <h3 className="text-[15px] font-medium text-gray-500 mb-1.5">{title}</h3>
        <p className="text-[28px] leading-9 font-bold text-[#12274A] mb-1">{display}</p>
        <p className="text-xs text-gray-400">{percentage}</p>
      </div>
    </div>
  );
}