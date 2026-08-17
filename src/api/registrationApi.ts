import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

export type RegistrationStatus = 'PRE_REGISTRATION' | 'UNVERIFIED' | 'VERIFIED'

export type AccountCategory = 'INDIAN' | 'NRI' | 'FOREIGNER'

/**
 * The registration wizard's Professional Role catalogue is database-backed now (see
 * registrationLookupsApi's `useGetProfessionalRolesQuery` - `LookupJpaEntity`'s Javadoc on the
 * backend), not a closed frontend union - the Individual form offers every fetched option; the
 * Entity form offers only the codes below (matches the mockup's dropdown).
 */
export const ENTITY_PROFESSIONAL_ROLE_CODES: string[] = [
  'ADMIN',
  'FINANCIAL_CREDITOR',
  'RESOLUTION_APPLICANT',
  'OTHER',
]

export type LegalConstitution =
  | 'PUBLIC_LTD_COMPANY'
  | 'PRIVATE_LTD_COMPANY'
  | 'LLP'
  | 'PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'ENTITY_CREATED_BY_OR_UNDER_A_STATUTE'
  | 'TRUST'
  | 'HUF'
  | 'CO_OP_SOCIETY'
  | 'ASSOCIATION_OF_PERSONS'
  | 'GOVERNMENT'
  | 'SELF_HELP_GROUP'
  | 'RESIDENT_INDIVIDUAL'
  | 'NON_RESIDENT_FOREIGN_COMPANY'
  | 'OTHER'

export type OrganisationIdType = 'CIN' | 'PAN' | 'LLPIN' | 'TAN' | 'OTHER'

/** A brand-new (not-yet-existing) Entity's captured details - mirrors ipie-user-service's EntityDraftDetails record. */
export interface EntityDraftDetails {
  name?: string | null
  legalConstitution?: LegalConstitution | null
  idType?: OrganisationIdType | null
  idValue?: string | null
  msme?: boolean
  msmeType?: string | null
  registeredAddress?: string | null
  contactNumber?: string | null
  contactEmail?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  pin?: string | null
  district?: string | null
}

/**
 * One professional role claimed, with the credential proving it.
 *
 * The FRS asks for an identification type and value *per role selected* - an IP carries an IBBI
 * registration number while the same person acting as a legal representative carries a bar
 * registration number - so these travel together rather than as parallel arrays that could be sent
 * at different lengths.
 */
export interface ProfessionalRoleEntry {
  roleId: string
  identificationTypeId: string
  identificationValue: string
  /** Advocate/CA/CS - only meaningful on the LEGAL_REPRESENTATIVE role; the server refuses it elsewhere. */
  legalRepresentativeTypeId?: string | null
}

/** Shared by both draft-save and final-submit - every rich field optional at this layer (backend mirrors the same looseness). */
export interface RegistrationWizardFields {
  category?: AccountCategory | null
  addressLine1?: string | null
  addressLine2?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  pin?: string | null
  identityProofTypeId?: string | null
  identityProofNumber?: string | null
  /** Every role claimed. A person may hold several (FRS 1.1.1 item 6). */
  professionalRoles?: ProfessionalRoleEntry[] | null
  /** Set when an already-registered Entity was picked from search - takes precedence over `entity`. */
  organisationId?: string | null
  /** Set when registering a brand-new Entity. */
  entity?: EntityDraftDetails | null
}

export interface CreateRegistrationRequest {
  mobileNumber: string
  email: string
}

export interface SaveRegistrationDraftRequest extends RegistrationWizardFields {
  fullName?: string | null
}

/**
 * No password field. Provisioning is asynchronous and the account is created without credentials,
 * so there is nothing here to attach one to - the registrant sets theirs afterwards against
 * ipie-iam-service, from the link emailed to them (see `credentialApi`).
 */
export interface CompleteRegistrationRequest extends RegistrationWizardFields {
  registrationId: string
  fullName: string
}

export interface CurrentUserResponse {
  id: string
  username: string
  email: string
  fullName: string | null
  phoneNumber: string | null
  status: 'ACTIVE' | 'INACTIVE'
  registrationStatus: RegistrationStatus
  category: AccountCategory | null
  addressLine1: string | null
  addressLine2: string | null
  country: string | null
  state: string | null
  city: string | null
  pin: string | null
  identityProofTypeId: string | null
  /** Last four digits only - the server does not store the rest (Aadhaar Act s.29). */
  identityProofNumberLast4: string | null
  professionalRoles: ProfessionalRoleEntry[]
  emailVerified: boolean
}

export const registrationApi = createApi({
  reducerPath: 'registrationApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  endpoints: (builder) => ({
    createRegistration: builder.mutation<{ registrationId: string }, CreateRegistrationRequest>({
      query: ({ mobileNumber, email }) => ({
        url: '/api/v1/registrations',
        method: 'POST',
        data: { mobileNumber, email },
      }),
    }),
    /** The wizard's "Save Draft" action - callable repeatedly from any step. */
    saveRegistrationDraft: builder.mutation<
      CurrentUserResponse,
      { registrationId: string } & SaveRegistrationDraftRequest
    >({
      query: ({ registrationId, ...body }) => ({
        url: `/api/v1/registrations/${registrationId}`,
        method: 'PATCH',
        data: body,
      }),
    }),
    /** Email "SEND OTP" - emails a fresh code to the registrant's own address. */
    requestEmailOtp: builder.mutation<void, { registrationId: string }>({
      query: ({ registrationId }) => ({
        url: `/api/v1/registrations/${registrationId}/email-otp`,
        method: 'POST',
      }),
    }),
    confirmEmailOtp: builder.mutation<
      { emailVerified: boolean },
      { registrationId: string; code: string }
    >({
      query: ({ registrationId, code }) => ({
        url: `/api/v1/registrations/${registrationId}/email-otp/confirm`,
        method: 'POST',
        data: { code },
      }),
    }),
    completeRegistration: builder.mutation<CurrentUserResponse, CompleteRegistrationRequest>({
      query: ({ registrationId, ...body }) => ({
        url: `/api/v1/registrations/${registrationId}/complete`,
        method: 'POST',
        data: body,
      }),
    }),
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: '/api/v1/users/me',
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useCreateRegistrationMutation,
  useSaveRegistrationDraftMutation,
  useRequestEmailOtpMutation,
  useConfirmEmailOtpMutation,
  useCompleteRegistrationMutation,
  useGetCurrentUserQuery,
} = registrationApi
