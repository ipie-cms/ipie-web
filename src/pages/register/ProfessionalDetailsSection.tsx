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
import { ENTITY_PROFESSIONAL_ROLE_CODES } from '@/api/registrationApi'
import {
  useGetProfessionalIdentificationTypesQuery,
  useGetProfessionalRolesQuery,
} from '@/api/registrationLookupsApi'
import { FieldLabel, FieldRow, RegistrationSection } from '@/pages/register/RegistrationSection'
import { ProfessionalRoleSelect } from '@/pages/register/ProfessionalRoleSelect'
import { UploadDropzone } from '@/pages/register/UploadDropzone'

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
  const roleOptions =
    accountType === 'ENTITY'
      ? professionalRoles.filter((role) => ENTITY_PROFESSIONAL_ROLE_CODES.includes(role.code))
      : professionalRoles

  return (
    <RegistrationSection title="Professional Details">
      <div>
        <FieldLabel>Professional Roles</FieldLabel>
        <ProfessionalRoleSelect
          options={roleOptions}
          value={fields.professionalRoleId ?? null}
          onChange={(roleId) => dispatch(updateFields({ professionalRoleId: roleId }))}
        />
      </div>

      <FieldRow>
        <div>
          <FieldLabel>Professional Identification Type</FieldLabel>
          <Select
            value={fields.professionalIdentificationTypeId ?? undefined}
            onValueChange={(value) =>
              dispatch(updateFields({ professionalIdentificationTypeId: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="PAN Card" />
            </SelectTrigger>
            <SelectContent>
              {professionalIdentificationTypes.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
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
              value={fields.professionalIdentificationValue ?? ''}
              onChange={(event) =>
                dispatch(updateFields({ professionalIdentificationValue: event.target.value }))
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

      <UploadDropzone label="Click to upload Authorization Letter scan" />
    </RegistrationSection>
  )
}
