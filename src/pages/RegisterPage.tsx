import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { resetWizard } from '@/features/registration/registrationWizardSlice'
import {
  useCompleteRegistrationMutation,
  useSaveRegistrationDraftMutation,
} from '@/api/registrationApi'
import { AccountDetailsSection } from '@/pages/register/AccountDetailsSection'
import { EntityDetailsSection } from '@/pages/register/EntityDetailsSection'
import { EntitySearchSection } from '@/pages/register/EntitySearchSection'
import { IdentityProofSection } from '@/pages/register/IdentityProofSection'
import { PersonalDetailsSection } from '@/pages/register/PersonalDetailsSection'
import { ProfessionalDetailsSection } from '@/pages/register/ProfessionalDetailsSection'
import { RegistrationFooterBar } from '@/pages/register/RegistrationFooterBar'
import { RegistrationTopBar } from '@/pages/register/RegistrationTopBar'

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const wizard = useAppSelector((state) => state.registrationWizard)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [saveRegistrationDraft, { isLoading: isSavingDraft }] = useSaveRegistrationDraftMutation()
  const [completeRegistration, { isLoading: isSubmitting }] = useCompleteRegistrationMutation()

  const isEntity = wizard.accountType === 'ENTITY'
  const showEntityDetails = isEntity && !wizard.selectedOrganisationName

  function errorMessage(err: unknown, fallback: string) {
    const status = (err as { status?: number }).status
    return status === undefined
      ? 'Network error - could not reach the registration server.'
      : fallback
  }

  async function handleSaveDraft() {
    setError(null)
    if (!wizard.registrationId) {
      setError(
        'Please enter your mobile number and email, and send the email verification code, before saving a draft.',
      )
      return
    }
    try {
      await saveRegistrationDraft({
        registrationId: wizard.registrationId,
        fullName: wizard.fullName,
        ...wizard.fields,
      }).unwrap()
    } catch (err) {
      setError(errorMessage(err, 'Could not save your draft - please try again.'))
    }
  }

  async function handleSubmit() {
    setError(null)
    if (!wizard.registrationId) {
      setError(
        'Please enter your mobile number and email, and verify your email, before submitting.',
      )
      return
    }
    if (!wizard.emailVerified) {
      setError('Please verify your email address before submitting.')
      return
    }
    if (!wizard.fullName) {
      setError('Please enter your full name.')
      return
    }
    try {
      await completeRegistration({
        registrationId: wizard.registrationId,
        fullName: wizard.fullName,
        ...wizard.fields,
      }).unwrap()
      setSubmitted(true)
      dispatch(resetWizard())
    } catch (err) {
      setError(errorMessage(err, 'Could not complete registration - please try again.'))
    }
  }

  if (submitted) {
    return (
      <div className="min-h-svh bg-ipie-reg-page-bg">
        <RegistrationTopBar />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Registration submitted</h1>
          <p className="text-gray-600">
            An administrator will verify your account shortly. You can{' '}
            <Link to="/login" className="text-ipie-reg-blue underline">
              sign in
            </Link>{' '}
            now, but the dashboard will show limited information until then.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-ipie-reg-page-bg">
      <RegistrationTopBar />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-sm text-gray-500">Fill in your details to get started</p>
          </div>
          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Indicates Mandatory Fields
          </p>
        </div>

        <AccountDetailsSection />

        {isEntity && <EntitySearchSection />}
        {showEntityDetails && <EntityDetailsSection />}

        <PersonalDetailsSection singleAddressField={isEntity} />
        <IdentityProofSection />
        <ProfessionalDetailsSection accountType={isEntity ? 'ENTITY' : 'INDIVIDUAL'} />
        {error && <p className="text-sm text-red-500">{error}</p>}

        <RegistrationFooterBar
          isSavingDraft={isSavingDraft}
          isSubmitting={isSubmitting}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
        />

        <p className="pb-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-ipie-reg-blue underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
