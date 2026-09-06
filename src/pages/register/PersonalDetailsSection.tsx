import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setEmail,
  setEmailOtpSent,
  setEmailVerified,
  setFullName,
  setMobileNumber,
  setRegistrationId,
  updateFields,
} from '@/features/registration/registrationWizardSlice'
import {
  useConfirmEmailOtpMutation,
  useCreateRegistrationMutation,
  useRequestEmailOtpMutation,
  type AccountCategory,
} from '@/api/registrationApi'
import { FieldLabel, FieldRow, RegistrationSection } from '@/pages/register/RegistrationSection'
import { CITIES, COUNTRIES, INDIAN_STATES } from '@/pages/register/geoData'

const CATEGORIES: { value: AccountCategory; label: string }[] = [
  { value: 'INDIAN', label: 'Indian' },
  { value: 'NRI', label: 'NRI' },
  { value: 'FOREIGNER', label: 'Foreigner' },
]

/**
 * Shared by both Individual and Entity forms - identical except the Entity mockup collapses
 * Address into a single field (the entity's own address already lives in Entity Details), while
 * the Individual mockup splits it into Address Line 1/2. `singleAddressField` toggles that; either
 * way only `addressLine1` is populated when collapsed.
 */
export function PersonalDetailsSection({ singleAddressField }: { singleAddressField: boolean }) {
  const dispatch = useAppDispatch()
  const registrationId = useAppSelector((state) => state.registrationWizard.registrationId)
  const fullName = useAppSelector((state) => state.registrationWizard.fullName)
  const mobileNumber = useAppSelector((state) => state.registrationWizard.mobileNumber)
  const email = useAppSelector((state) => state.registrationWizard.email)
  const fields = useAppSelector((state) => state.registrationWizard.fields)
  const emailOtpSent = useAppSelector((state) => state.registrationWizard.emailOtpSent)
  const emailVerified = useAppSelector((state) => state.registrationWizard.emailVerified)

  const [mobileOtpSent, setMobileOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)

  const [createRegistration, { isLoading: isCreatingRegistration }] =
    useCreateRegistrationMutation()
  const [requestEmailOtp, { isLoading: isSendingOtp }] = useRequestEmailOtpMutation()
  const [confirmEmailOtp, { isLoading: isConfirmingOtp }] = useConfirmEmailOtpMutation()

  async function handleSendEmailOtp() {
    setOtpError(null)
    try {
      let id = registrationId
      if (!id) {
        const created = await createRegistration({ mobileNumber, email }).unwrap()
        id = created.registrationId
        dispatch(setRegistrationId(id))
      }
      await requestEmailOtp({ registrationId: id }).unwrap()
      dispatch(setEmailOtpSent(true))
    } catch {
      setOtpError(
        'Could not send the verification code - please check the email address and try again.',
      )
    }
  }

  async function handleConfirmEmailOtp() {
    if (!registrationId) {
      return
    }
    setOtpError(null)
    try {
      await confirmEmailOtp({ registrationId, code: otpCode }).unwrap()
      dispatch(setEmailVerified(true))
    } catch {
      setOtpError('That code is incorrect or has expired.')
    }
  }

  return (
    <RegistrationSection title="Personal Details">
      <div>
        <FieldLabel>Select Category</FieldLabel>
        <div className="flex items-center gap-6">
          {CATEGORIES.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => dispatch(updateFields({ category: value }))}
              className="flex items-center gap-2 text-sm text-gray-900"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  fields.category === value ? 'border-ipie-reg-blue-dark' : 'border-gray-300'
                }`}
              >
                {fields.category === value && (
                  <span className="bg-ipie-reg-blue-dark h-2 w-2 rounded-full" />
                )}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Name</FieldLabel>
        <Input
          placeholder="Enter full Name"
          value={fullName}
          onChange={(event) => dispatch(setFullName(event.target.value))}
        />
      </div>

      <FieldRow>
        <div>
          <FieldLabel>Mobile Number</FieldLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={(event) => dispatch(setMobileNumber(event.target.value))}
            />
            <Button
              type="button"
              variant="outline"
              className="border-ipie-reg-blue text-ipie-reg-blue shrink-0"
              onClick={() => setMobileOtpSent(true)}
            >
              SEND OTP
            </Button>
          </div>
          {mobileOtpSent && (
            <p className="mt-1 text-xs text-gray-500">
              Mobile OTP verification isn't available yet.
            </p>
          )}
        </div>
        <div>
          <FieldLabel>Email ID</FieldLabel>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter Email ID"
              value={email}
              disabled={emailVerified}
              onChange={(event) => dispatch(setEmail(event.target.value))}
            />
            <Button
              type="button"
              variant="outline"
              className="border-ipie-reg-blue text-ipie-reg-blue shrink-0"
              disabled={!email || isCreatingRegistration || isSendingOtp || emailVerified}
              onClick={handleSendEmailOtp}
            >
              {emailVerified ? 'VERIFIED' : 'SEND OTP'}
            </Button>
          </div>
          {emailOtpSent && !emailVerified && (
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Enter 6-digit code"
                value={otpCode}
                maxLength={6}
                onChange={(event) => setOtpCode(event.target.value)}
              />
              <Button
                type="button"
                disabled={isConfirmingOtp || otpCode.length === 0}
                onClick={handleConfirmEmailOtp}
              >
                VERIFY
              </Button>
            </div>
          )}
          {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
        </div>
      </FieldRow>

      {singleAddressField ? (
        <div>
          <FieldLabel>Address</FieldLabel>
          <Textarea
            placeholder="Enter Address here"
            value={fields.addressLine1 ?? ''}
            onChange={(event) => dispatch(updateFields({ addressLine1: event.target.value }))}
          />
        </div>
      ) : (
        <FieldRow>
          <div>
            <FieldLabel>Address Line 1</FieldLabel>
            <Textarea
              placeholder="Enter Address Line 1"
              value={fields.addressLine1 ?? ''}
              onChange={(event) => dispatch(updateFields({ addressLine1: event.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Address Line 2</FieldLabel>
            <Textarea
              placeholder="Enter Address Line 2"
              value={fields.addressLine2 ?? ''}
              onChange={(event) => dispatch(updateFields({ addressLine2: event.target.value }))}
            />
          </div>
        </FieldRow>
      )}

      <FieldRow>
        <div>
          <FieldLabel>Country</FieldLabel>
          <Select
            value={fields.country ?? undefined}
            onValueChange={(value) => dispatch(updateFields({ country: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>State</FieldLabel>
          <Select
            value={fields.state ?? undefined}
            onValueChange={(value) => dispatch(updateFields({ state: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FieldRow>

      <FieldRow>
        <div>
          <FieldLabel>City</FieldLabel>
          <Select
            value={fields.city ?? undefined}
            onValueChange={(value) => dispatch(updateFields({ city: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>PIN</FieldLabel>
          <Input
            placeholder="Enter PIN Code"
            value={fields.pin ?? ''}
            onChange={(event) => dispatch(updateFields({ pin: event.target.value }))}
          />
        </div>
      </FieldRow>
    </RegistrationSection>
  )
}
