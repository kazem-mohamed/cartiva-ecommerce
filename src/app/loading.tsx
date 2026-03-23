import { Spinner } from '@/component/ui/Spinner'

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-5 text-gray-500">
        <Spinner className="text-primary-600 h-12 w-12" />
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    </div>
  )
}
