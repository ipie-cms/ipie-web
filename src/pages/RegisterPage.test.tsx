import { describe, expect, it, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import registrationWizardReducer, {
  selectOrganisation,
  setAccountType,
} from '@/features/registration/registrationWizardSlice'
import { ENTITY_PROFESSIONAL_ROLE_CODES } from '@/api/registrationApi'
import { RegisterPage } from '@/pages/RegisterPage'

const PROFESSIONAL_ROLES = [
  { id: 'role-ip', code: 'INSOLVENCY_PROFESSIONAL', label: 'Insolvency Professional' },
  { id: 'role-fc', code: 'FINANCIAL_CREDITOR', label: 'Financial Creditor' },
  { id: 'role-admin', code: 'ADMIN', label: 'Admin' },
  { id: 'role-ra', code: 'RESOLUTION_APPLICANT', label: 'Resolution Applicant' },
  { id: 'role-other', code: 'OTHER', label: 'Others' },
]

const IDENTITY_PROOF_TYPES = [
  { id: 'idtype-pan', code: 'PAN', label: 'PAN Card' },
  { id: 'idtype-aadhaar', code: 'AADHAAR', label: 'Aadhaar Card' },
]

const mockCreateRegistration = vi.fn()
const mockSaveRegistrationDraft = vi.fn()
const mockRequestEmailOtp = vi.fn()
const mockConfirmEmailOtp = vi.fn()
const mockCompleteRegistration = vi.fn()
const mockTriggerSearch = vi.fn()

vi.mock('@/api/registrationApi', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/registrationApi')>('@/api/registrationApi')
  return {
    ...actual,
    useCreateRegistrationMutation: () => [mockCreateRegistration, { isLoading: false }],
    useSaveRegistrationDraftMutation: () => [mockSaveRegistrationDraft, { isLoading: false }],
    useRequestEmailOtpMutation: () => [mockRequestEmailOtp, { isLoading: false }],
    useConfirmEmailOtpMutation: () => [mockConfirmEmailOtp, { isLoading: false }],
    useCompleteRegistrationMutation: () => [mockCompleteRegistration, { isLoading: false }],
  }
})

vi.mock('@/api/organisationsApi', () => ({
  useLazySearchOrganisationsQuery: () => [
    mockTriggerSearch,
    { data: undefined, isFetching: false },
  ],
}))

vi.mock('@/api/registrationLookupsApi', () => ({
  useGetProfessionalRolesQuery: () => ({ data: PROFESSIONAL_ROLES }),
  useGetLegalRepresentativeTypesQuery: () => ({ data: [] }),
  useGetProfessionalIdentificationTypesQuery: () => ({ data: [] }),
  useGetIdentityProofTypesQuery: () => ({ data: IDENTITY_PROOF_TYPES }),
}))

function renderRegisterPage() {
  const store = configureStore({ reducer: { registrationWizard: registrationWizardReducer } })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </Provider>,
  )
  return store
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockCreateRegistration.mockReset()
    mockSaveRegistrationDraft.mockReset()
    mockRequestEmailOtp.mockReset()
    mockConfirmEmailOtp.mockReset()
    mockCompleteRegistration.mockReset()
    mockTriggerSearch.mockReset()
  })

  it('defaults to the Individual account type and hides Entity-only sections', () => {
    renderRegisterPage()

    expect(screen.getByText('Individual')).toBeInTheDocument()
    expect(screen.queryByText('Search and Select Your Registered Entity')).not.toBeInTheDocument()
    expect(screen.queryByText('Entity Details')).not.toBeInTheDocument()
  })

  it('shows the Entity-only sections once Entity is selected', async () => {
    renderRegisterPage()
    const user = userEvent.setup()

    await user.click(screen.getByText('Entity'))

    expect(screen.getByText('Search and Select Your Registered Entity')).toBeInTheDocument()
    expect(screen.getByText('Entity Details')).toBeInTheDocument()
  })

  it('hides Entity Details once an existing entity is selected from search', () => {
    const store = configureStore({ reducer: { registrationWizard: registrationWizardReducer } })
    store.dispatch(setAccountType('ENTITY'))
    store.dispatch(selectOrganisation({ organisationId: 'org-1', name: 'ABC Company' }))
    render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('Search and Select Your Registered Entity')).toBeInTheDocument()
    expect(screen.queryByText('Entity Details')).not.toBeInTheDocument()
    expect(screen.getByText('ABC Company')).toBeInTheDocument()
  })

  it('completes the email-OTP flow, then submits the full Individual registration payload', async () => {
    mockCreateRegistration.mockReturnValue({
      unwrap: () => Promise.resolve({ registrationId: 'reg-1' }),
    })
    mockRequestEmailOtp.mockReturnValue({ unwrap: () => Promise.resolve() })
    mockConfirmEmailOtp.mockReturnValue({ unwrap: () => Promise.resolve({ emailVerified: true }) })
    mockCompleteRegistration.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'user-1' }) })

    renderRegisterPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Enter full Name'), 'Jane Doe')
    await user.type(screen.getByPlaceholderText('Enter Mobile Number'), '+91 9800000009')
    await user.type(screen.getByPlaceholderText('Enter Email ID'), 'jane@example.com')

    const emailField = screen.getByText('Email ID').parentElement as HTMLElement
    await user.click(within(emailField).getByRole('button', { name: 'SEND OTP' }))

    await waitFor(() =>
      expect(mockCreateRegistration).toHaveBeenCalledWith({
        mobileNumber: '+91 9800000009',
        email: 'jane@example.com',
      }),
    )
    expect(mockRequestEmailOtp).toHaveBeenCalledWith({ registrationId: 'reg-1' })

    const codeInput = await screen.findByPlaceholderText('Enter 6-digit code')
    await user.type(codeInput, '654321')
    await user.click(screen.getByRole('button', { name: 'VERIFY' }))

    await waitFor(() =>
      expect(mockConfirmEmailOtp).toHaveBeenCalledWith({ registrationId: 'reg-1', code: '654321' }),
    )
    expect(await screen.findByRole('button', { name: 'VERIFIED' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'SUBMIT FOR VERIFICATION' }))

    await waitFor(() => expect(mockCompleteRegistration).toHaveBeenCalled())
    const payload = mockCompleteRegistration.mock.calls[0]?.[0]
    expect(payload.registrationId).toBe('reg-1')
    expect(payload.fullName).toBe('Jane Doe')
    // Registration must not carry a credential. The account is provisioned without one and the
    // registrant sets a password afterwards, against ipie-iam-service, from the emailed link.
    // Asserting absence rather than a value: a password reappearing here is the regression.
    expect(payload).not.toHaveProperty('password')

    expect(await screen.findByText('Registration submitted')).toBeInTheDocument()
  })

  it('does not collect a password during registration', async () => {
    renderRegisterPage()
    // The account is created without credentials, so there is nothing for a password field here to
    // attach one to. It used to be collected, validated, and then silently discarded by the server.
    expect(screen.queryByLabelText('Password', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm Password', { exact: true })).not.toBeInTheDocument()
  })

  it('blocks submission with an inline error when the email has not been verified yet', async () => {
    renderRegisterPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Enter full Name'), 'Jane Doe')

    await user.click(screen.getByRole('button', { name: 'SUBMIT FOR VERIFICATION' }))

    expect(await screen.findByText(/before submitting/i)).toBeInTheDocument()
    expect(mockCompleteRegistration).not.toHaveBeenCalled()
  })

  it('filters Professional Roles to the curated Entity subset when Entity is selected', async () => {
    renderRegisterPage()
    const user = userEvent.setup()
    await user.click(screen.getByText('Entity'))

    await user.click(screen.getByText('Select one or more professional roles'))

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.queryByText('Insolvency Professional')).not.toBeInTheDocument()
    expect(ENTITY_PROFESSIONAL_ROLE_CODES).toEqual([
      'ADMIN',
      'FINANCIAL_CREDITOR',
      'RESOLUTION_APPLICANT',
      'OTHER',
    ])
  })

  it('keeps every Professional Role selected, and a credential block for each', async () => {
    // The previous version of this test asserted the opposite - that a second choice replaced the
    // first. That was the V23 single-role collapse, which the FRS contradicts ("can select multiple
    // roles") and which IBBI ruled out explicitly: one account covers every role an Insolvency
    // Professional performs.
    renderRegisterPage()
    const user = userEvent.setup()

    await user.click(screen.getByText('Select one or more professional roles'))
    await user.click(screen.getByText('Insolvency Professional'))
    await user.click(screen.getByText('Financial Creditor'))

    // Both remain chosen: chip, list entry, and the heading of that role's credential block.
    expect(screen.getAllByText('Insolvency Professional').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Financial Creditor').length).toBeGreaterThan(1)

    // One identification pair per role, because the credential belongs to the role and not to the
    // person - an IBBI number proves one and cannot prove the other.
    expect(screen.getAllByText('Professional Identification Type')).toHaveLength(2)
    expect(screen.getAllByText('Professional Identification Value')).toHaveLength(2)
  })

  it('drops a role from the selection when its chip is dismissed', async () => {
    renderRegisterPage()
    const user = userEvent.setup()

    await user.click(screen.getByText('Select one or more professional roles'))
    await user.click(screen.getByText('Insolvency Professional'))
    await user.click(screen.getByText('Financial Creditor'))
    await user.click(screen.getByText('Insolvency Professional', { selector: 'button' }))

    expect(screen.getAllByText('Professional Identification Type')).toHaveLength(1)
  })
})
