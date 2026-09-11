import { useState } from 'react';
import AccessibilityControls from './AccessibilityControls';

export default function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className=""
        title="Accessibility Controls"
        aria-label="Open accessibility controls"
      >
    Accessibility
      </button>

      <AccessibilityControls 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}