import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppSelector } from '@/app/hooks'
import {
  useGetIdentityProofTypesQuery,
  useGetProfessionalRolesQuery,
} from '@/api/registrationLookupsApi'

interface RegistrationFooterBarProps {
  isSavingDraft: boolean
  isSubmitting: boolean
  onSaveDraft: () => void
  onSubmit: () => void
}

function PreviewRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null
  }
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  )
}

export function RegistrationFooterBar({
  isSavingDraft,
  isSubmitting,
  onSaveDraft,
  onSubmit,
}: RegistrationFooterBarProps) {
  const wizard = useAppSelector((state) => state.registrationWizard)
  const { data: identityProofTypes = [] } = useGetIdentityProofTypesQuery()
  const { data: professionalRoles = [] } = useGetProfessionalRolesQuery()
  const identityProofTypeLabel = identityProofTypes.find(
    (option) => option.id === wizard.fields.identityProofTypeId,
  )?.label
  // Every role selected, not the first: the preview should show what the person is about to submit.
  const professionalRoleLabel = (wizard.fields.professionalRoles ?? [])
    .map((entry) => professionalRoles.find((option) => option.id === entry.roleId)?.label)
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="bg-ipie-reg-blue hover:bg-ipie-reg-blue-dark text-white"
            >
              PREVIEW
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review your details</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col">
              <PreviewRow label="Account type" value={wizard.accountType} />
              <PreviewRow label="Full name" value={wizard.fullName} />
              <PreviewRow label="Mobile number" value={wizard.mobileNumber} />
              <PreviewRow label="Email" value={wizard.email} />
              <PreviewRow label="Category" value={wizard.fields.category} />
              <PreviewRow label="Address line 1" value={wizard.fields.addressLine1} />
              <PreviewRow label="Address line 2" value={wizard.fields.addressLine2} />
              <PreviewRow label="Country" value={wizard.fields.country} />
              <PreviewRow label="State" value={wizard.fields.state} />
              <PreviewRow label="City" value={wizard.fields.city} />
              <PreviewRow label="PIN" value={wizard.fields.pin} />
              <PreviewRow label="Identity proof type" value={identityProofTypeLabel} />
              <PreviewRow label="Identity proof number" value={wizard.fields.identityProofNumber} />
              <PreviewRow label="Professional roles" value={professionalRoleLabel} />
              <PreviewRow
                label="Entity"
                value={wizard.selectedOrganisationName ?? wizard.fields.entity?.name}
              />
              <PreviewRow label="Email verified" value={wizard.emailVerified ? 'Yes' : 'No'} />
            </div>
          </DialogContent>
        </Dialog>

        <Button
          type="button"
          variant="outline"
          className="border-ipie-reg-coral text-ipie-reg-coral hover:bg-ipie-reg-coral/5"
          disabled={isSavingDraft}
          onClick={onSaveDraft}
        >
          {isSavingDraft ? 'SAVING…' : 'SAVE DRAFT'}
        </Button>
      </div>

      <Button
        type="button"
        className="bg-ipie-reg-coral hover:bg-ipie-reg-coral/90 text-white"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? 'SUBMITTING…' : 'SUBMIT FOR VERIFICATION'}
      </Button>
    </div>
  )
}
