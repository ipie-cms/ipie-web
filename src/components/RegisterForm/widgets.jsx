import React from 'react';

const inputCls =
  'w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

/* ---------- Simple text input ---------- */
export function TextWidget({ id, value, placeholder, onChange, onBlur, onFocus, disabled, readonly }) {
  return (
    <input
      id={id}
      type="text"
      className={inputCls}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled || readonly}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur && ((e) => onBlur(id, e.target.value))}
      onFocus={onFocus && ((e) => onFocus(id, e.target.value))}
    />
  );
}

/* ---------- Select with chevron ---------- */
export function SelectWidget({ id, value, placeholder, options, onChange, disabled, readonly }) {
  const { enumOptions } = options;
  return (
    <div className="relative">
      <select
        id={id}
        className={`${inputCls} appearance-none pr-9 ${value ? 'text-gray-800' : 'text-gray-400'}`}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>{placeholder || 'Select'}</option>
        {enumOptions?.map((o) => (
          <option key={o.value} value={o.value} className="text-gray-800">{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ---------- Inline radio (Indian / NRI / YES-NO) ---------- */
export function RadioWidget({ id, value, options, onChange }) {
  return (
    <div className="flex items-center gap-6 h-10">
      {options.enumOptions?.map((o) => (
        <label key={o.value} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
          <input
            type="radio"
            name={id}
            className="w-4 h-4 accent-blue-600"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/* ---------- Input + SEND OTP button ---------- */
export function OtpWidget({ id, value, placeholder, onChange, formContext, options, disabled, readonly }) {
  return (
    <div className="flex gap-2">
      <input
        id={id}
        type="text"
        className={inputCls}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => formContext?.sendOtp?.(options?.fieldKey || id, value)}
        className="shrink-0 px-3 h-10 rounded-md border border-blue-500 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wide hover:bg-blue-100"
      >
        SEND OTP
      </button>
    </div>
  );
}

/* ---------- Input + VALIDATE button ---------- */
export function ValidateWidget({ id, value, placeholder, onChange, formContext, options, disabled, readonly }) {
  return (
    <div className="flex gap-2">
      <input
        id={id}
        type="text"
        className={inputCls}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => formContext?.validateField?.(options?.fieldKey || id, value)}
        className="shrink-0 px-3 h-10 rounded-md border border-blue-500 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wide hover:bg-blue-100"
      >
        VALIDATE
      </button>
    </div>
  );
}

/* ---------- Individual / Entity card radio ---------- */
export function AccountTypeWidget({ id, value, onChange }) {
  const opts = [
    {
      value: 'Individual',
      label: 'Individual',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      value: 'Entity',
      label: 'Entity',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M9 7h2M9 11h2M9 15h2M15 21V9a2 2 0 012-2h2a2 2 0 012 2v12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {opts.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-between px-4 h-12 rounded-md border text-sm font-medium transition ${
              active
                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {o.icon}
              {o.label}
            </span>
            <span className={`w-4.5 h-4.5 w-5 h-5 rounded-full border flex items-center justify-center ${active ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
              {active && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}