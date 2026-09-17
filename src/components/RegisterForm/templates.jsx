import React from 'react';

/* ---------- Label + field wrapper ---------- */
export function FieldTemplate(props) {
  const { id, label, required, children, errors, classNames, style } = props;
  return (
    <div className={`${classNames} mb-4`} style={style}>
      <label htmlFor={id} className="block text-[13px] font-semibold text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {errors}
    </div>
  );
}

/* ---------- Section cards (Account Details, Personal Details...) ---------- */
export function ObjectFieldTemplate(props) {
  const { title, description, properties } = props;

  // Root object → bina card ke plain wrapper
  if (!title) {
    return <div>{properties.map((p) => p.content)}</div>;
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 md:p-6 mb-5">
      <h3 className="text-[14px] font-bold text-gray-900 mb-4 pb-2.5 border-b border-gray-100">{title}</h3>

      {/* Identity Proof info banner */}
      {description && (
        <div className="mb-4 flex items-center gap-2.5 bg-blue-50 border border-blue-100 text-blue-700 text-[12px] rounded-md px-3.5 py-2.5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {description}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {properties.map((p) => p.content)}
      </div>
    </section>
  );
}

/* ---------- Field errors (chhote laal text) ---------- */
export function FieldErrorTemplate(props) {
  const { errors } = props;
  if (!errors?.length) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {errors.map((e, i) => (
        <li key={i} className="text-[11px] text-red-500">{e}</li>
      ))}
    </ul>
  );
}