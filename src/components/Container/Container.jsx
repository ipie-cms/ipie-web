import React from 'react';

/* ✅ Poore page ka EK common container — har section me same width */
export default function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[1400px]  ${className}`}>
      {children}
    </div>
  );
}