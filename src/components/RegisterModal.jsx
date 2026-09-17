import React from 'react';
import RegisterForm from './RegisterForm/RegisterForm';

export default function RegisterModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 md:p-10">
        <div
          className="bg-[#F4F6F9] w-full max-w-[950px] rounded-lg shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-sm font-bold z-10"
          >
            ✕
          </button>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}