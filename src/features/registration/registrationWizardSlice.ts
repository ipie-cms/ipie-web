import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RegistrationWizardFields } from '@/api/registrationApi'

export type AccountType = 'INDIVIDUAL' | 'ENTITY'
export type UserType = 'SINGLE' | 'MULTI'

export interface RegistrationWizardState {
  accountType: AccountType | null
  userType: UserType
  /** Set once `createRegistration` (mobile+email) has run - required before any other server call. */
  registrationId: string | null
  mobileNumber: string
  email: string
  fullName: string
  /** Every other rich field - kept as one object so the form can spread it straight into API payloads. */
  fields: RegistrationWizardFields
  /** Cosmetic only - the name of an Entity picked from search, shown next to "Entity Details" once selected. */
  selectedOrganisationName: string | null
  emailOtpSent: boolean
  emailVerified: boolean
}

const initialState: RegistrationWizardState = {
  accountType: 'INDIVIDUAL',
  userType: 'SINGLE',
  registrationId: null,
  mobileNumber: '',
  email: '',
  fullName: '',
  fields: {},
  selectedOrganisationName: null,
  emailOtpSent: false,
  emailVerified: false,
}

const registrationWizardSlice = createSlice({
  name: 'registrationWizard',
  initialState,
  reducers: {
    setAccountType(state, action: PayloadAction<AccountType>) {
      state.accountType = action.payload
    },
    setUserType(state, action: PayloadAction<UserType>) {
      state.userType = action.payload
    },
    setRegistrationId(state, action: PayloadAction<string>) {
      state.registrationId = action.payload
    },
    setMobileNumber(state, action: PayloadAction<string>) {
      state.mobileNumber = action.payload
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload
    },
    setFullName(state, action: PayloadAction<string>) {
      state.fullName = action.payload
    },
    /** Merges a partial update onto `fields` - every section writes only the keys it owns. */
    updateFields(state, action: PayloadAction<Partial<RegistrationWizardFields>>) {
      state.fields = { ...state.fields, ...action.payload }
    },
    /** Selecting an existing Entity from search sets `organisationId` and clears any brand-new-entity draft. */
    selectOrganisation(state, action: PayloadAction<{ organisationId: string; name: string }>) {
      state.fields.organisationId = action.payload.organisationId
      state.fields.entity = null
      state.selectedOrganisationName = action.payload.name
    },
    /** "Create and Register New Entity Now" - clears any prior search selection so `entity` details are used instead. */
    clearSelectedOrganisation(state) {
      state.fields.organisationId = null
      state.selectedOrganisationName = null
    },
    setEmailOtpSent(state, action: PayloadAction<boolean>) {
      state.emailOtpSent = action.payload
    },
    setEmailVerified(state, action: PayloadAction<boolean>) {
      state.emailVerified = action.payload
    },
    resetWizard() {
      return initialState
    },
  },
})

export const {
  setAccountType,
  setUserType,
  setRegistrationId,
  setMobileNumber,
  setEmail,
  setFullName,
  updateFields,
  selectOrganisation,
  clearSelectedOrganisation,
  setEmailOtpSent,
  setEmailVerified,
  resetWizard,
} = registrationWizardSlice.actions
export default registrationWizardSlice.reducer
