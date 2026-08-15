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
import { updateFields } from '@/features/registration/registrationWizardSlice'
import type { LegalConstitution, OrganisationIdType } from '@/api/registrationApi'
import { FieldLabel, FieldRow, RegistrationSection } from '@/pages/register/RegistrationSection'
import { CITIES, COUNTRIES, INDIAN_STATES } from '@/pages/register/geoData'

const LEGAL_CONSTITUTIONS: { value: LegalConstitution; label: string }[] = [
  { value: 'PUBLIC_LTD_COMPANY', label: 'Public Ltd. Company' },
  { value: 'PRIVATE_LTD_COMPANY', label: 'Private Ltd. Company' },
  { value: 'LLP', label: 'LLP' },
  { value: 'PROPRIETORSHIP', label: 'Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'ENTITY_CREATED_BY_OR_UNDER_A_STATUTE', label: 'Entity Created by or under a Statute' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'HUF', label: 'HUF' },
  { value: 'CO_OP_SOCIETY', label: 'Co-operative Society' },
  { value: 'ASSOCIATION_OF_PERSONS', label: 'Association of Persons' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'SELF_HELP_GROUP', label: 'Self Help Group' },
  { value: 'RESIDENT_INDIVIDUAL', label: 'Resident Individual' },
  { value: 'NON_RESIDENT_FOREIGN_COMPANY', label: 'Non-Resident / Foreign Company' },
  { value: 'OTHER', label: 'Other' },
]

const ID_TYPES: { value: OrganisationIdType; label: string }[] = [
  { value: 'CIN', label: 'CIN' },
  { value: 'PAN', label: 'PAN' },
  { value: 'LLPIN', label: 'LLPIN' },
  { value: 'TAN', label: 'TAN' },
  { value: 'OTHER', label: 'Other' },
]

const MSME_TYPES = ['Micro', 'Small', 'Medium']

export function EntityDetailsSection() {
  const dispatch = useAppDispatch()
  const entity = useAppSelector((state) => state.registrationWizard.fields.entity) ?? {}

  function updateEntity(patch: Partial<typeof entity>) {
    dispatch(updateFields({ entity: { ...entity, ...patch } }))
  }

  return (
    <RegistrationSection title="Entity Details">
      <FieldRow>
        <div>
          <FieldLabel>Category Type</FieldLabel>
          <Select
            value={entity.legalConstitution ?? undefined}
            onValueChange={(value) =>
              updateEntity({ legalConstitution: value as LegalConstitution })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category Type" />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_CONSTITUTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Unique ID Type</FieldLabel>
          <Select
            value={entity.idType ?? undefined}
            onValueChange={(value) => updateEntity({ idType: value as OrganisationIdType })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ID_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FieldRow>

      <FieldRow>
        <div>
          <FieldLabel>Unique ID Number</FieldLabel>
          <Input
            placeholder="Enter Unique ID Number"
            value={entity.idValue ?? ''}
            onChange={(event) => updateEntity({ idValue: event.target.value })}
          />
        </div>
        <div>
          <FieldLabel>Entity Name</FieldLabel>
          <Input
            placeholder="Enter Entity Name"
            value={entity.name ?? ''}
            onChange={(event) => updateEntity({ name: event.target.value })}
          />
        </div>
      </FieldRow>

      <div>
        <FieldLabel>Address</FieldLabel>
        <Textarea
          placeholder="Enter Address here"
          value={entity.registeredAddress ?? ''}
          onChange={(event) => updateEntity({ registeredAddress: event.target.value })}
        />
      </div>

      <FieldRow>
        <div>
          <FieldLabel>Country</FieldLabel>
          <Select
            value={entity.country ?? undefined}
            onValueChange={(value) => updateEntity({ country: value })}
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
            value={entity.state ?? undefined}
            onValueChange={(value) => updateEntity({ state: value })}
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
            value={entity.city ?? undefined}
            onValueChange={(value) => updateEntity({ city: value })}
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
            value={entity.pin ?? ''}
            onChange={(event) => updateEntity({ pin: event.target.value })}
          />
        </div>
      </FieldRow>

      <div>
        <FieldLabel>District</FieldLabel>
        <Select
          value={entity.district ?? undefined}
          onValueChange={(value) => updateEntity({ district: value })}
        >
          <SelectTrigger className="w-full md:w-1/2">
            <SelectValue placeholder="Select District" />
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
        <FieldLabel>Is your company MSME?</FieldLabel>
        <div className="flex items-center gap-6">
          {[true, false].map((value) => (
            <button
              type="button"
              key={String(value)}
              onClick={() => updateEntity({ msme: value })}
              className="flex items-center gap-2 text-sm text-gray-900"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  (entity.msme ?? false) === value ? 'border-ipie-reg-blue-dark' : 'border-gray-300'
                }`}
              >
                {(entity.msme ?? false) === value && (
                  <span className="bg-ipie-reg-blue-dark h-2 w-2 rounded-full" />
                )}
              </span>
              {value ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>

      {entity.msme && (
        <div>
          <FieldLabel>MSME Type</FieldLabel>
          <Select
            value={entity.msmeType ?? undefined}
            onValueChange={(value) => updateEntity({ msmeType: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select MSME Type" />
            </SelectTrigger>
            <SelectContent>
              {MSME_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </RegistrationSection>
  )
}
