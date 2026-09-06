/** The registration page's own top bar - just the iPIE logo, no user/logout (this flow is unauthenticated). */
export function RegistrationTopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="bg-ipie-reg-blue-dark flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-white">
          I
        </span>
        <span className="text-lg font-bold tracking-wide text-gray-900">PIE</span>
      </div>
    </header>
  )
}
