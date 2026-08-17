import { useState } from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { LookupOption } from '@/api/registrationLookupsApi'

interface ProfessionalRoleSelectProps {
  options: LookupOption[]
  /** Every role currently selected, by option id. */
  value: string[]
  onChange: (value: string[]) => void
}

/**
 * "Professional Roles" field - multi-select. The FRS is explicit that a person may select several
 * ("can select multiple roles"), and IBBI confirmed that one account covers every role an
 * Insolvency Professional performs, so choosing a second role adds to the first rather than
 * replacing it. `options` come from the database-backed lookup catalogue (see
 * registrationLookupsApi), not a hardcoded list, and `value`/`onChange` work in option ids.
 */
export function ProfessionalRoleSelect({ options, value, onChange }: ProfessionalRoleSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedOptions = options.filter((option) => value.includes(option.id))

  function choose(id: string) {
    // Toggle, and leave the list open: selecting several is the normal case, and closing after each
    // one would make the common path the tedious one.
    onChange(value.includes(id) ? value.filter((selected) => selected !== id) : [...value, id])
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-left"
      >
        {selectedOptions.length === 0 ? (
          <span className="px-1 text-sm text-gray-400">Select one or more professional roles</span>
        ) : (
          selectedOptions.map((option) => (
            <span
              key={option.id}
              className="bg-ipie-reg-blue inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white"
            >
              {option.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation()
                  onChange(value.filter((selected) => selected !== option.id))
                }}
              />
            </span>
          ))
        )}
      </button>

      {open && (
        <div className="mt-1 max-h-72 overflow-auto rounded-md border border-gray-300 bg-white">
          {options.map((option) => {
            const selected = value.includes(option.id)
            return (
              <button
                type="button"
                key={option.id}
                onClick={() => choose(option.id)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-700',
                  selected && 'bg-gray-100',
                )}
              >
                {option.label}
                {selected && (
                  <span className="bg-ipie-reg-green flex h-4 w-4 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
