import { useState } from 'react'
import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { LookupOption } from '@/api/registrationLookupsApi'

interface ProfessionalRoleSelectProps {
  options: LookupOption[]
  value: string | null
  onChange: (value: string | null) => void
}

/**
 * "Professional Roles" field - single-select, not multi: choosing a role replaces any previous
 * selection. `options` come from the database-backed lookup catalogue (see
 * registrationLookupsApi), not a hardcoded list - `value`/`onChange` work in terms of the option's
 * id. Keeps the source design's chip + checklist visual (the checklist expands directly beneath
 * the chip box, in normal document flow) even though only one chip can ever be shown.
 */
export function ProfessionalRoleSelect({ options, value, onChange }: ProfessionalRoleSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find((option) => option.id === value) ?? null

  function choose(id: string) {
    onChange(value === id ? null : id)
    setOpen(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-left"
      >
        {selectedOption === null ? (
          <span className="px-1 text-sm text-gray-400">Select a professional role</span>
        ) : (
          <span className="bg-ipie-reg-blue inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white">
            {selectedOption.label}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation()
                onChange(null)
              }}
            />
          </span>
        )}
      </button>

      {open && (
        <div className="mt-1 max-h-72 overflow-auto rounded-md border border-gray-300 bg-white">
          {options.map((option) => {
            const selected = value === option.id
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
