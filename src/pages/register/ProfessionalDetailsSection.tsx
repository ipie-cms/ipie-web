import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { updateFields } from '@/features/registration/registrationWizardSlice'
import { ENTITY_PROFESSIONAL_ROLE_CODES, type ProfessionalRoleEntry } from '@/api/registrationApi'
import {
  useGetLegalRepresentativeTypesQuery,
  useGetProfessionalIdentificationTypesQuery,
  useGetProfessionalRolesQuery,
} from '@/api/registrationLookupsApi'
import { FieldLabel, FieldRow, RegistrationSection } from '@/pages/register/RegistrationSection'
import { ProfessionalRoleSelect } from '@/pages/register/ProfessionalRoleSelect'
import { UploadDropzone } from '@/pages/register/UploadDropzone'

/** Only this role may carry an Advocate/CA/CS qualification; the server refuses it on any other. */
const LEGAL_REPRESENTATIVE_CODE = 'LEGAL_REPRESENTATIVE'

/**
 * Professional Details.
 *
 * One block of credential fields per role selected, rather than one set for the person. The FRS asks
 * for an identification type and value for each role, and the reason is not bookkeeping: an IP
 * proves the role with an IBBI registration number, while the same individual acting as a legal
 * representative proves it with a bar registration number. A single pair of fields could hold one or
 * the other and would make the wrong one look validated.
 */
export function ProfessionalDetailsSection({
  accountType,
}: {
  accountType: 'INDIVIDUAL' | 'ENTITY'
}) {
  const dispatch = useAppDispatch()
  const fields = useAppSelector((state) => state.registrationWizard.fields)
  const { data: professionalRoles = [] } = useGetProfessionalRolesQuery()
  const { data: professionalIdentificationTypes = [] } =
    useGetProfessionalIdentificationTypesQuery()
  const { data: legalRepresentativeTypes = [] } = useGetLegalRepresentativeTypesQuery()

  const roleOptions =
    accountType === 'ENTITY'
      ? professionalRoles.filter((role) => ENTITY_PROFESSIONAL_ROLE_CODES.includes(role.code))
      : professionalRoles

  const selected: ProfessionalRoleEntry[] = fields.professionalRoles ?? []

  function setRoles(roleIds: string[]) {
    // Keep what was already entered for a role that stays selected - re-picking the list must not
    // discard a registration number someone has typed.
    const next = roleIds.map(
      (roleId) =>
        selected.find((entry) => entry.roleId === roleId) ?? {
          roleId,
          identificationTypeId: '',
          identificationValue: '',
          legalRepresentativeTypeId: null,
        },
    )
    dispatch(updateFields({ professionalRoles: next }))
  }

  function updateEntry(roleId: string, patch: Partial<ProfessionalRoleEntry>) {
    dispatch(
      updateFields({
        professionalRoles: selected.map((entry) =>
          entry.roleId === roleId ? { ...entry, ...patch } : entry,
        ),
      }),
    )
  }

  return (
    <RegistrationSection title="Professional Details">
      <div>
        <FieldLabel>Professional Roles</FieldLabel>
        <ProfessionalRoleSelect
          options={roleOptions}
          value={selected.map((entry) => entry.roleId)}
          onChange={setRoles}
        />
      </div>

      {selected.map((entry) => {
        const option = roleOptions.find((role) => role.id === entry.roleId)
        const isLegalRepresentative = option?.code === LEGAL_REPRESENTATIVE_CODE
        return (
          <div key={entry.roleId} className="rounded-md border border-gray-200 p-3">
            <p className="mb-2 text-sm font-medium">{option?.label ?? 'Selected role'}</p>

            <FieldRow>
              <div>
                <FieldLabel>Professional Identification Type</FieldLabel>
                <Select
                  value={entry.identificationTypeId || undefined}
                  onValueChange={(value) => updateEntry(entry.roleId, { identificationTypeId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalIdentificationTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Professional Identification Value</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter ID Number"
                    value={entry.identificationValue}
                    onChange={(event) =>
                      updateEntry(entry.roleId, { identificationValue: event.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-ipie-reg-blue text-ipie-reg-blue shrink-0"
                  >
                    VALIDATE
                  </Button>
                </div>
              </div>
            </FieldRow>

            {isLegalRepresentative && (
              <div className="mt-3">
                <FieldLabel>Legal Representative Type</FieldLabel>
                <Select
                  value={entry.legalRepresentativeTypeId ?? undefined}
                  onValueChange={(value) =>
                    updateEntry(entry.roleId, { legalRepresentativeTypeId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Advocate / CA / CS" />
                  </SelectTrigger>
                  <SelectContent>
                    {legalRepresentativeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )
      })}

      <UploadDropzone label="Click to upload Authorization Letter scan" />
    </RegistrationSection>
  )
}
