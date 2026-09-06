import { useState } from 'react'

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
import {
  clearSelectedOrganisation,
  selectOrganisation,
} from '@/features/registration/registrationWizardSlice'
import { useLazySearchOrganisationsQuery } from '@/api/organisationsApi'
import { RegistrationSection } from '@/pages/register/RegistrationSection'

/** The Entity form's "Search and Select Your Registered Entity" step - real lookup against the organisations table. */
export function EntitySearchSection() {
  const dispatch = useAppDispatch()
  const selectedOrganisationName = useAppSelector(
    (state) => state.registrationWizard.selectedOrganisationName,
  )
  const [keyword, setKeyword] = useState('')
  const [triggerSearch, { data, isFetching }] = useLazySearchOrganisationsQuery()
  const [searched, setSearched] = useState(false)

  function handleSearch() {
    setSearched(true)
    void triggerSearch({ name: keyword })
  }

  return (
    <RegistrationSection title="Search and Select Your Registered Entity">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">Search By</label>
          <Select value="NAME">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NAME">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">Keyword</label>
          <Input
            placeholder="ABC"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <Button
          type="button"
          className="bg-ipie-reg-blue hover:bg-ipie-reg-blue-dark text-white"
          disabled={isFetching}
          onClick={handleSearch}
        >
          SEARCH
        </Button>
      </div>

      {searched && (
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-ipie-reg-info-bg text-gray-700">
              <tr>
                <th className="px-4 py-2 font-medium">Sr. No</th>
                <th className="px-4 py-2 font-medium">Entity Name</th>
                <th className="px-4 py-2 font-medium">CIN</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.length ? (
                data.content.map((organisation, index) => (
                  <tr key={organisation.id} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 text-gray-900">{organisation.name}</td>
                    <td className="px-4 py-2 text-gray-700">{organisation.idValue}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="text-ipie-reg-blue font-medium"
                        onClick={() =>
                          dispatch(
                            selectOrganisation({
                              organisationId: organisation.id,
                              name: organisation.name,
                            }),
                          )
                        }
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3 text-gray-500" colSpan={4}>
                    No matching entities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrganisationName ? (
        <p className="text-sm text-gray-700">
          Selected: <span className="font-medium text-gray-900">{selectedOrganisationName}</span>{' '}
          <button
            type="button"
            className="text-ipie-reg-blue underline"
            onClick={() => dispatch(clearSelectedOrganisation())}
          >
            Change
          </button>
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Can&apos;t find your entity?{' '}
          <button
            type="button"
            className="text-ipie-reg-blue font-medium underline"
            onClick={() => dispatch(clearSelectedOrganisation())}
          >
            Create and Register New Entity Now
          </button>
        </p>
      )}
    </RegistrationSection>
  )
}
