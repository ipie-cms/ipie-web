import React, { useState, useEffect, useMemo, useRef } from 'react';
import Container from '../Container/Container';


const GEO_SOURCES = [
  'https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson',
  'https://cdn.jsdelivr.net/gh/AbhinavSwami28/india-official-geojson@main/india-states-simplified.geojson',
  'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States',
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson',
  'https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/geography/india_map.geojson',
];

// ✅ FIX 2: Lakshadweep jaise chhote UT jo kuch GeoJSON sources me missing hote hain — alag se merge honge
const EXTRA_REGIONS = [
  {
    name: 'Lakshadweep',
    urls: [
      'https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/lakshadweep.geojson',
      'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/states/lakshadweep.geojson',
    ],
  },
];

const VB_W = 600, VB_H = 660;

/* Figma jaisi dark blue scale (Low -> High) */
const COLOR_SCALE = ['#DCE6F9', '#A8C3F1', '#6D9BEA', '#3F74E0', '#1E4CB5', '#0E2763'];

const statesIntensity = {
  'Andaman and Nicobar Islands': 35, 'Andhra Pradesh': 72, 'Arunachal Pradesh': 42,
  'Assam': 80, 'Bihar': 55, 'Chandigarh': 65, 'Chhattisgarh': 70,
  'Dadra and Nagar Haveli and Daman and Diu': 48, 'Delhi': 88, 'Goa': 65,
  'Gujarat': 75, 'Haryana': 75, 'Himachal Pradesh': 50, 'Jharkhand': 58,
  'Karnataka': 85, 'Kerala': 55, 'Ladakh': 45, 'Lakshadweep': 80,
  'Madhya Pradesh': 90, 'Maharashtra': 95, 'Manipur': 45, 'Meghalaya': 50,
  'Mizoram': 48, 'Nagaland': 45, 'Odisha': 62, 'Puducherry': 60, 'Punjab': 65,
  'Rajasthan': 60, 'Sikkim': 45, 'Tamil Nadu': 92, 'Telangana': 78, 'Tripura': 52,
  'Uttar Pradesh': 70, 'Uttarakhand': 60, 'West Bengal': 68,'Jammu and Kashmir':55,
};

const statesData = {
  'Maharashtra': { cases: 1456, ips: 1567, liquidation: 2234, cirp: 10234 },
  'Karnataka': { cases: 1123, ips: 1233, liquidation: 1789, cirp: 8234 },
  'Tamil Nadu': { cases: 1345, ips: 1478, liquidation: 2123, cirp: 9876 },
  'Madhya Pradesh': { cases: 1234, ips: 1356, liquidation: 1945, cirp: 8956 },
  'Delhi': { cases: 1234, ips: 1456, liquidation: 2134, cirp: 9876 },
  'Uttar Pradesh': { cases: 1023, ips: 1134, liquidation: 1645, cirp: 7567 },
  'Gujarat': { cases: 945, ips: 1089, liquidation: 1567, cirp: 7234 },
  'Assam': { cases: 945, ips: 1050, liquidation: 1456, cirp: 6789 },
  'Telangana': { cases: 912, ips: 1001, liquidation: 1456, cirp: 6789 },
  'West Bengal': { cases: 834, ips: 912, liquidation: 1312, cirp: 6012 },
    'Ladakh': { cases: 834, ips: 912, liquidation: 1312, cirp: 6012 },
    'Lakshadweep': { cases: 995, ips: 860, liquidation: 1120, cirp: 9350 },

};

/* ✅ CHANGE 1: Figma jaisi stats (icon + label + value + Save Products) */
const STATS = [
  { label: 'Active Cases', value: '3456+', color: '#3B82F6', bg: '#E8F0FE' },
  { label: 'Resolved Cases', value: '2345+', color: '#F59E0B', bg: '#FDF3E0' },
  { label: 'Value Involved', value: '2 Lakh cr', color: '#10B981', bg: '#E5F7EF' },
];

const StatIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);

const norm = (s = '') => s.toLowerCase().replace(/[^a-z]/g, '');
const ALIAS = { orissa: 'odisha', uttaranchal: 'uttarakhand', telengana: 'telangana', nctofdelhi: 'delhi' };
const NORM_INTENSITY = Object.fromEntries(Object.entries(statesIntensity).map(([k, v]) => [norm(k), v]));
const intensityOf = (name) => NORM_INTENSITY[ALIAS[norm(name)] || norm(name)] ?? 0;

const getStateName = (p = {}) =>
  p.State_Name || p.state || p.name || p.NAME_1 || p.NAME || p.st_name || 'Unknown';

const mercator = ([lon, lat]) => {
  const x = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  return [x, Math.log(Math.tan(Math.PI / 4 + phi / 2))];
};

/* ✅ FIX 1 helpers: Dot ko sabse bade landmass ke true center par rakhne ke liye */
const ringArea = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
};

const ringCentroid = (ring) => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  if (Math.abs(a) < 1e-12) {
    let sx0 = 0, sy0 = 0;
    ring.forEach(([x, y]) => { sx0 += x; sy0 += y; });
    return [sx0 / (ring.length || 1), sy0 / (ring.length || 1)];
  }
  return [cx / (3 * a), cy / (3 * a)];
};

const pointInRing = ([px, py], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

const getColor = (intensity = 0) => {
  if (intensity >= 90) return COLOR_SCALE[5];
  if (intensity >= 80) return COLOR_SCALE[4];
  if (intensity >= 70) return COLOR_SCALE[3];
  if (intensity >= 60) return COLOR_SCALE[2];
  if (intensity >= 50) return COLOR_SCALE[1];
  return COLOR_SCALE[0];
};

const Sparkline = ({ seed = 0 }) => {
  let d = '';
  for (let i = 0; i <= 8; i++) {
    const x = i * 9;
    const y = 10 + Math.sin(i * 1.35 + seed) * 2.6;
    d += `${i === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `;
  }
  return (
    <svg width="72" height="20" viewBox="0 0 72 20" className="overflow-visible">
      <path d={d} fill="none" stroke="#4E8FE0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function IndiaStatesChoropleth() {
  const [selectedState, setSelectedState] = useState(null);
  const [hover, setHover] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const svgRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let base = null;
      for (const url of GEO_SOURCES) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          if (json?.features?.length) { base = json; break; }
        } catch (e) { /* next source */ }
      }
      if (!base) return;

      // ✅ FIX 2: Missing regions (Lakshadweep) ko alag GeoJSON se merge karo
      const existing = new Set((base.features || []).map((f) => norm(getStateName(f.properties || {}))));
      for (const region of EXTRA_REGIONS) {
        if (existing.has(norm(region.name))) continue;
        for (const url of region.urls) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const json = await res.json();
            const polys = [];
            (json.features || [json]).forEach((f) => {
              const g = f?.geometry || {};
              if (g.type === 'Polygon') polys.push(g.coordinates);
              else if (g.type === 'MultiPolygon') polys.push(...g.coordinates);
            });
            if (!polys.length) continue;
            base = {
              ...base,
              features: [
                ...base.features,
                {
                  type: 'Feature',
                  properties: { State_Name: region.name },
                  geometry: { type: 'MultiPolygon', coordinates: polys },
                },
              ],
            };
            break;
          } catch (e) { /* next url */ }
        }
      }

      setGeoData(base);
    })();
  }, []);

  const mapShapes = useMemo(() => {
    if (!geoData) return null;

    const feats = geoData.features.map((f) => {
      const g = f.geometry || {};
      const polys =
        g.type === 'Polygon' ? [g.coordinates] :
        g.type === 'MultiPolygon' ? g.coordinates : [];
      return {
        name: getStateName(f.properties),
        rings: polys.map((poly) => poly.map((ring) => ring.map(mercator))),
      };
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    feats.forEach(({ rings }) =>
      rings.forEach((poly) =>
        poly.forEach((ring) =>
          ring.forEach(([x, y]) => {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          })
        )
      )
    );

    const PAD = 16;
    const scale = Math.min((VB_W - PAD * 2) / (maxX - minX), (VB_H - PAD * 2) / (maxY - minY));
    const offX = (VB_W - (maxX - minX) * scale) / 2;
    const offY = (VB_H - (maxY - minY) * scale) / 2;
    const sx = (x) => (x - minX) * scale + offX;
    const sy = (y) => (maxY - y) * scale + offY;

    return feats.map(({ name, rings }) => {
      let d = '';
      rings.forEach((poly) =>
        poly.forEach((ring) => {
          ring.forEach(([x, y], i) => {
            d += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
          });
          d += 'Z';
        })
      );

      // ✅ FIX 1: Dot HAR state me — sabse bade polygon ke area-weighted center par,
      // point-in-polygon check ke saath (fallback: bbox center)
      let bestRing = null, bestArea = -1;
      rings.forEach((poly) => {
        const ring = poly[0];
        if (!ring || ring.length < 3) return;
        const a = ringArea(ring);
        if (a > bestArea) { bestArea = a; bestRing = ring; }
      });

      let cx = 0, cy = 0;
      if (bestRing) {
        const [mx, my] = ringCentroid(bestRing);
        let px = mx, py = my;
        if (!pointInRing([mx, my], bestRing)) {
          let b0 = Infinity, b1 = Infinity, b2 = -Infinity, b3 = -Infinity;
          bestRing.forEach(([x, y]) => {
            if (x < b0) b0 = x; if (y < b1) b1 = y;
            if (x > b2) b2 = x; if (y > b3) b3 = y;
          });
          const bx = (b0 + b2) / 2, by = (b1 + b3) / 2;
          if (pointInRing([bx, by], bestRing)) { px = bx; py = by; }
        }
        cx = sx(px); cy = sy(py);
      }

      return { name, d, cx, cy };
    });
  }, [geoData]);

  const handleEnter = (s) => {
    const svg = svgRef.current, wrap = wrapRef.current;
    if (!svg || !wrap) return;
    const sr = svg.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    const scale = Math.min(sr.width / VB_W, sr.height / VB_H);
    const ox = (sr.left - wr.left) + (sr.width - VB_W * scale) / 2;
    const oy = (sr.top - wr.top) + (sr.height - VB_H * scale) / 2;
    const x = ox + s.cx * scale;
    const y = Math.min(Math.max(oy + s.cy * scale, 110), wr.height - 110);
    setHover({ name: s.name, x, y, flip: x > wr.width * 0.55 });
  };

  const hoverData = hover
    ? (statesData[hover.name] || { cases: 1234, ips: 1234, liquidation: 2234, cirp: 11234 })
    : null;

  return (
    <Container>
    <section className="bg-white pb-[20px] md:py-[80px]">
      <div className="max-w-7xl mx-auto px-4">

        {/* ✅ CHANGE 2: Bada light-blue rounded panel (Figma jaisa) */}
        <div className="bg-[#EDF4FC] rounded-2xl p-5 md:p-8">

          {/* ===== Row 1: Title+Description (left) + Stats card (right) ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-8 md:mb-10">
            {/* Left – Title & Description */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Insolvency Activity Across India
              </h2>
              <p className="text-gray-700 text-sm md:text-[15px] leading-relaxed max-w-md">
                Explore regional distribution of insolvency process & identity activity hotspots, trends & variations across states & UT's
              </p>
            </div>

            {/* Right – Single white stats card with dividers */}
            <div className="bg-white rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 divide-y divide-gray-200 sm:divide-y-0 sm:divide-x">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-4 px-6 py-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: s.bg }}
                  >
                    <span style={{ color: s.color }}>
                      <StatIcon className="w-5 h-5" />
                    </span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-gray-800 leading-tight">{s.label}</p>
                    <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{s.value}</p>
                    <button className="text-xs text-gray-500 hover:text-blue-600 mt-1 transition-colors">
                      Save Products
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Row 2: Map card + Table card (alag-alag cards) ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* LEFT: Map card */}
            <div
              ref={wrapRef}
              className="relative bg-[#F7F9FC] rounded-xl shadow-sm overflow-hidden p-6 flex items-center justify-center"
              style={{ minHeight: '520px' }}
            >
              {mapShapes ? (
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${VB_W} ${VB_H}`}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                  onMouseLeave={() => setHover(null)}
                >
                  {mapShapes.map((s, i) => (
                    <path
                      key={i}
                      d={s.d}
                      fill={getColor(intensityOf(s.name))}
                      fillRule="evenodd"
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
                      onMouseEnter={() => handleEnter(s)}
                      onClick={() => setSelectedState(s.name)}
                    />
                  ))}
                  {mapShapes.map((s, i) => (
                    <circle key={`dot-${i}`} cx={s.cx} cy={s.cy} r="2.4" fill="#ffffff" opacity="0.9" pointerEvents="none" />
                  ))}
                </svg>
              ) : (
                <p className="text-gray-500 text-sm">Loading map…</p>
              )}

              {/* Connector line */}
              {hover && (
                <div
                  className="absolute z-10 pointer-events-none"
                  style={{
                    left: hover.flip ? hover.x - 26 : hover.x,
                    top: hover.y,
                    width: 26,
                    height: 2,
                    backgroundColor: '#ffffff',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}

              {/* Hover Tooltip */}
              {hover && hoverData && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: hover.x,
                    top: hover.y,
                    transform: hover.flip
                      ? 'translate(calc(-100% - 26px), -50%)'
                      : 'translate(26px, -50%)',
                  }}
                >
                  <div className="bg-white rounded-xl shadow-xl px-6 py-5 min-w-[260px]">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">{hover.name}</h4>
                    <div className="space-y-2.5 text-[15px]">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-500">Active Cases</span>
                        <span className="font-bold text-gray-900">{hoverData.cases.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-500">Liquidation</span>
                        <span className="font-bold text-gray-900">{hoverData.liquidation.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-500">CIRP</span>
                        <span className="font-bold text-gray-900">{hoverData.cirp.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-gray-500">IP's Registered</span>
                        <span className="font-bold text-gray-900">{hoverData.ips.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Legend – bottom center */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-800">Low</span>
                <div className="flex shadow-sm">
                  {COLOR_SCALE.map((c, i) => (
                    <div key={i} style={{ width: 40, height: 24, backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">High</span>
              </div>
            </div>

            {/* RIGHT: Table card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-[#DDE4EE]">
                <h3 className="text-base font-bold text-gray-900">Top 10 States by Cases</h3>
              </div>

              <div className="px-6 pb-4 overflow-y-auto flex-1" style={{ maxHeight: '520px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="text-left py-4 pr-2 font-bold text-gray-900 w-[34%]">State</th>
                      <th className="text-left py-4 pr-2 font-bold text-gray-900 w-[22%]">Active Cases</th>
                      <th className="text-left py-4 pr-2 font-bold text-gray-900 w-[22%]">Register IP's</th>
                      <th className="text-left py-4 font-bold text-gray-900">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statesData).map(([state, data], idx) => (
                      <tr
                        key={state}
                        className={`cursor-pointer transition-colors hover:bg-blue-50/70 ${selectedState === state ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedState(state)}
                      >
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: getColor(intensityOf(state)) }} />
                            <span className="text-gray-900">{state}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-2 font-semibold text-gray-900">{data.cases.toLocaleString('en-IN')}</td>
                        <td className="py-3 pr-2 font-semibold text-gray-900">{data.ips.toLocaleString('en-IN')}</td>
                        <td className="py-3"><Sparkline seed={idx} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </Container>
  );
}