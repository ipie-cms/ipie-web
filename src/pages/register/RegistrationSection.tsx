import type { ReactNode } from 'react'

/** One white, bordered section card on the registration page - "Account Details", "Personal Details", etc. */
export function RegistrationSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
    </section>
  )
}

/** Two-column row for a pair of fields (Mobile/Email, Country/State, ...) - stacks on small screens. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
}

export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-900">
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  )
}
