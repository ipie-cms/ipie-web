import React from 'react';
import Container from '../Container/Container';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

/* Bar chart colors (Figma jaisi) */
const BAR_COLORS = {
  CIRP: '#1D5BD0',
  Liquidation: '#14A08A',
  PPIRP: '#F59E0B',
  Liquidation2: '#64748B',
};

const LEGEND = [
  { label: 'CIRP', color: BAR_COLORS.CIRP },
  { label: 'Liquidation', color: BAR_COLORS.Liquidation },
  { label: 'PPIRP', color: BAR_COLORS.PPIRP },
  { label: 'Liquidation', color: BAR_COLORS.Liquidation2 },
];

export default function Pillars() {
  // Bar Chart Data
  const ecosystemData = [
    { year: '2016', CIRP: 1200, Liquidation: 1500, PPIRP: 1800, Liquidation2: 1000 },
    { year: '2017', CIRP: 1500, Liquidation: 1800, PPIRP: 2100, Liquidation2: 1200 },
    { year: '2018', CIRP: 1800, Liquidation: 2100, PPIRP: 2400, Liquidation2: 1500 },
    { year: '2019', CIRP: 2100, Liquidation: 2400, PPIRP: 2700, Liquidation2: 1800 },
    { year: '2020', CIRP: 2400, Liquidation: 2700, PPIRP: 3000, Liquidation2: 2100 },
    { year: '2021', CIRP: 2700, Liquidation: 3000, PPIRP: 3300, Liquidation2: 2400 },
    { year: '2022', CIRP: 3000, Liquidation: 3300, PPIRP: 3600, Liquidation2: 2700 },
    { year: '2023', CIRP: 3300, Liquidation: 3600, PPIRP: 3900, Liquidation2: 3000 },
    { year: '2024', CIRP: 3600, Liquidation: 3900, PPIRP: 4200, Liquidation2: 3300 },
    { year: '2025', CIRP: 3900, Liquidation: 4200, PPIRP: 4500, Liquidation2: 3600 },
  ];

  // Pie Chart Data (donut me sirf pehle 4, table me sab 6 – Figma jaisa)
  const pieData = [
    { name: 'Addmission', value: 1280, color: '#14A08A' },
    { name: 'Claims', value: 2450, color: '#F59E0B' },
    { name: 'Resolution Plan', value: 1567, color: '#1D6FE0' },
    { name: 'Pending with NCLT', value: 3460, color: '#64748B' },
    { name: 'Label 5', value: 1280, color: '#F59E0B' },
    { name: 'Label 6', value: 1567, color: '#FBBF24' },
  ];
  const donutData = pieData.slice(0, 4);

  const pillars = [
    { id: 1, logo: '/nclt-logo.png', name: 'NCLT' },
    { id: 2, logo: '/nclat-logo.png', name: 'NCLAT' },
    { id: 3, logo: '/ibbi-logo.png', name: 'IBBI' },
    { id: 4, logo: '/nesl-logo.png', name: 'NeSL' },
  ];

  return (
    <Container>
    <section className="bg-white py-[20px] md:py-[80px]">
      <div className="max-w-[1600px] mx-auto px-4">

        {/* ===== Title with lines + end dots (Figma jaisa) ===== */}
        <div className="flex items-center gap-4 md:gap-6 mb-12 md:mb-14 px-1 md:px-14">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
          <span className="flex-1 h-[2px] bg-[#2563EB] rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold text-[#2563EB] whitespace-nowrap">
            4 Pillars of IBC
          </h2>
          <span className="flex-1 h-[2px] bg-[#2563EB] rounded-full" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
        </div>

        {/* ===== Logos row ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 items-center justify-items-center mb-14 md:mb-20">
          {pillars.map((p) => (
            <img
              key={p.id}
              src={p.logo}
              alt={p.name}
              className="h-14 md:h-16 w-auto max-w-[230px] object-contain"
            />
          ))}
        </div>

        {/* ===== Charts row ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* LEFT – Bar chart card */}
          <div className="bg-[#F8FAFC] rounded-xl shadow-sm p-6 md:p-7 flex flex-col sm:flex-row gap-6">
            {/* Left column: title + desc + legend */}
            <div className="w-full sm:w-[150px] shrink-0">
              <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-2">
                The Ecosystem in Numbers
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-7">
                Tracking the lifecycle of Insolvency cases across india
              </p>

              {/* Legend – bade rounded swatches (Figma jaisi) */}
              <div className="flex flex-row flex-wrap sm:flex-col gap-4 sm:gap-7">
                {LEGEND.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-md shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={ecosystemData} margin={{ top: 5, right: 5, left: -18, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 14000]}
                    tickFormatter={(v) => (v ? `${v / 1000}k` : '')}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="CIRP" stackId="a" fill={BAR_COLORS.CIRP} />
                  <Bar dataKey="Liquidation" stackId="a" fill={BAR_COLORS.Liquidation} />
                  <Bar dataKey="PPIRP" stackId="a" fill={BAR_COLORS.PPIRP} />
                  {/* Top segment rounded (Figma jaisa) */}
                  <Bar dataKey="Liquidation2" stackId="a" fill={BAR_COLORS.Liquidation2} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT – Pie chart card */}
          <div className="bg-[#F8FAFC] rounded-xl shadow-sm p-6 md:p-7">
            <h3 className="text-[17px] font-bold text-gray-900 mb-6">Pie Chart Analysis</h3>

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center">
              {/* Donut + center text ANDAR */}
              <div className="relative w-[210px] h-[210px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="96%"
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center label – donut ke andar */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[13px] text-gray-500 leading-tight">Total</span>
                  <span className="text-[13px] text-gray-500 leading-tight">Active Cases</span>
                  <span className="text-lg font-bold text-gray-900 mt-1">12,440</span>
                </div>
              </div>

              {/* Table legend */}
              <div className="flex-1 w-full min-w-0">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left pb-2.5 font-semibold text-gray-600">Label</th>
                      <th className="text-right pb-2.5 font-semibold text-gray-600">Value</th>
                      <th className="text-right pb-2.5 font-semibold text-gray-600">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieData.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2.5 text-gray-600">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-900">
                          {item.value.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-900">
                          {Math.round((item.value / 12440) * 100)}%
                        </td>
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