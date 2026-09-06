import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setLocale } from '@/features/locale/localeSlice'
import { SUPPORTED_LOCALES, type Locale } from '@/lib/localeStorage'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  hi: 'हि',
}

/**
 * Always-mounted, alongside SessionTimeoutGuard in App.tsx - not tied to any one page. Cycles
 * through the platform's supported locales; the axios client (src/lib/axios.ts) picks the choice
 * up from storage on the very next request via Accept-Language, no page reload needed.
 */
export function LocaleToggle() {
  const dispatch = useAppDispatch()
  const current = useAppSelector((state) => state.locale.current)

  function cycleLocale() {
    const currentIndex = SUPPORTED_LOCALES.indexOf(current)
    const next = SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length] ?? SUPPORTED_LOCALES[0]
    dispatch(setLocale(next))
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleLocale}
      aria-label="Change language"
      className="fixed bottom-4 right-4 z-50"
    >
      {LOCALE_LABELS[current]}
    </Button>
  )
}
