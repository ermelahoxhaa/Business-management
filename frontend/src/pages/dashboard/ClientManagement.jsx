import {
  Search,
  FileText,
  TrendingUp,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react'

export default function ClientManagement() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 sm:w-auto"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Client
        </button>
      </div>

      <div className="mb-6 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <div className="flex min-h-70 flex-col overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <div className="mb-4 flex grow flex-col">
            <h3 className="mb-0.5 truncate text-base font-semibold text-gray-900 dark:text-white">
              John Doe - Acme Corporation
            </h3>
          </div>
          <div className="mb-4 grow space-y-2 text-sm">
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">Phone: +38349356478</p>
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">Email: john.doe@acme.com</p>
            <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">Address: 123 Main St, Anytown, USA</p>
          </div>

          <div className="mb-4 mt-auto space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5">
                <FileText className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-700">1</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">4,500.00€</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-3">
            <button
              type="button"
              className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-all duration-200 hover:bg-green-600 hover:text-white dark:bg-gray-800 dark:text-gray-300"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-all duration-200 hover:bg-red-600 hover:text-white dark:bg-gray-800 dark:text-gray-300"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
