import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-sm text-center bg-white border border-gray-200 rounded-md px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 tabular-nums">403</p>
        <h1 className="mt-1 text-xl font-semibold text-gray-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-gray-600">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center h-9 px-3.5 rounded-md text-sm font-medium
                     bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 hover:border-primary-700
                     transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
