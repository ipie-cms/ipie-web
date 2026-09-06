import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

/**
 * UI-only document dropzone (Identity Proof / Authorization Letter scans) - accepts and previews a
 * file client-side (name, type/size validation) but never uploads it anywhere. Document storage
 * (ipie-common-file-storage) is deliberately out of scope for this pass.
 */
export function UploadDropzone({ label }: { label: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) {
      return
    }
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, PNG, or JPG files are supported.')
      setFileName(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be 5MB or smaller.')
      setFileName(null)
      return
    }
    setError(null)
    setFileName(file.name)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center"
      >
        <UploadCloud className="mb-1 h-6 w-6 text-gray-400" />
        {fileName ? (
          <span className="text-sm font-medium text-gray-700">{fileName}</span>
        ) : (
          <span className="text-ipie-reg-blue text-sm font-semibold">{label}</span>
        )}
        <span className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB are supported</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
