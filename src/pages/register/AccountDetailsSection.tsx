import { Building2, Check, User as UserIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setAccountType,
  setUserType,
  type AccountType,
  type UserType,
} from '@/features/registration/registrationWizardSlice'
import { FieldLabel, RegistrationSection } from '@/pages/register/RegistrationSection'

const ACCOUNT_TYPES: { value: AccountType; label: string; Icon: typeof UserIcon }[] = [
  { value: 'INDIVIDUAL', label: 'Individual', Icon: UserIcon },
  { value: 'ENTITY', label: 'Entity', Icon: Building2 },
]

export function AccountDetailsSection() {
  const accountType = useAppSelector((state) => state.registrationWizard.accountType)
  const userType = useAppSelector((state) => state.registrationWizard.userType)
  const dispatch = useAppDispatch()

  return (
    <RegistrationSection title="Account Details">
      <div>
        <FieldLabel required>User Account Type</FieldLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ACCOUNT_TYPES.map(({ value, label, Icon }) => {
            const selected = accountType === value
            return (
              <button
                type="button"
                key={value}
                onClick={() => dispatch(setAccountType(value))}
                className={cn(
                  'relative flex items-center gap-3 rounded-md border px-4 py-3 text-left',
                  selected
                    ? 'border-ipie-reg-blue bg-ipie-reg-blue-light'
                    : 'border-gray-300 bg-white',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    selected
                      ? 'bg-ipie-reg-blue-light text-ipie-reg-blue'
                      : 'bg-gray-100 text-gray-500',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    selected ? 'text-ipie-reg-blue-dark' : 'text-gray-900',
                  )}
                >
                  {label}
                </span>
                {selected ? (
                  <span className="bg-ipie-reg-blue-dark absolute top-1/2 right-4 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                ) : (
                  <span className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 rounded-full border border-gray-300" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {accountType === 'ENTITY' && (
        <div>
          <FieldLabel required>Select User Type</FieldLabel>
          <div className="flex items-center gap-6">
            {(['SINGLE', 'MULTI'] as UserType[]).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => dispatch(setUserType(type))}
                className="flex items-center gap-2 text-sm text-gray-900"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border',
                    userType === type ? 'border-ipie-reg-blue-dark' : 'border-gray-300',
                  )}
                >
                  {userType === type && (
                    <span className="bg-ipie-reg-blue-dark h-2 w-2 rounded-full" />
                  )}
                </span>
                {type === 'SINGLE' ? 'Single User' : 'Multi Users'}
              </button>
            ))}
          </div>
          {userType === 'MULTI' && (
            <p className="mt-2 text-xs text-gray-500">
              Multi Users registration isn't supported yet - continuing as Single User.
            </p>
          )}
        </div>
      )}
    </RegistrationSection>
  )
}
