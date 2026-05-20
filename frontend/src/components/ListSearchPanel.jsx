import { Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ListSearchPanel({
  search,
  onSearchChange,
  onSubmit,
  onReset,
  sort,
  onSortChange,
  order,
  onOrderChange,
  sortOptions = [],
  children,
  resultMeta,
  page = 1,
  onPageChange
}) {
  const totalPages = resultMeta?.totalPages || 1
  const showPagination = totalPages > 1 && typeof onPageChange === 'function'

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl ring-1 ring-white/5">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {sortOptions.length > 0 && (
            <>
              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
                className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <select
                value={order}
                onChange={(event) => onOrderChange(event.target.value)}
                className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {children}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {resultMeta?.total !== undefined && (
            <p className="text-sm text-slate-400">
              Showing {resultMeta.total} result{resultMeta.total === 1 ? '' : 's'}
              {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ''}
            </p>
          )}

          {showPagination && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </form>
    </section>
  )
}
