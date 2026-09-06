import { Info } from 'lucide-react'

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
import { useGetIdentityProofTypesQuery } from '@/api/registrationLookupsApi'
import { FieldLabel, FieldRow, RegistrationSection } from '@/pages/register/RegistrationSection'
import { UploadDropzone } from '@/pages/register/UploadDropzone'

export function IdentityProofSection() {
  const dispatch = useAppDispatch()
  const fields = useAppSelector((state) => state.registrationWizard.fields)
  const { data: identityProofTypes = [] } = useGetIdentityProofTypesQuery()

  return (
    <RegistrationSection title="Identity Proof">
      <div className="bg-ipie-reg-info-bg text-ipie-reg-info-text flex items-start gap-2 rounded-md px-4 py-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Identity verification requires either a valid PAN card or an Aadhaar authentication card.
          Please upload clear, readable scans of your identification.
        </span>
      </div>

      <FieldRow>
        <div>
          <FieldLabel required>Indentification ID Type</FieldLabel>
          <Select
            value={fields.identityProofTypeId ?? undefined}
            onValueChange={(value) => dispatch(updateFields({ identityProofTypeId: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="PAN Card" />
            </SelectTrigger>
            <SelectContent>
              {identityProofTypes.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel required>Identification Number</FieldLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ID Number"
              value={fields.identityProofNumber ?? ''}
              onChange={(event) =>
                dispatch(updateFields({ identityProofNumber: event.target.value }))
              }
            />
            <Button
              type="button"
              variant="outline"
              className="border-ipie-reg-blue text-ipie-reg-blue shrink-0"
            >
              SEARCH
            </Button>
          </div>
        </div>
      </FieldRow>

      <div>
        <FieldLabel required>Upload Verification Document</FieldLabel>
        <UploadDropzone label="Click to upload document scan" />
      </div>
    </RegistrationSection>
  )
}
