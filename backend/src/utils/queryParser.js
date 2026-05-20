export const parseListQuery = (query, options = {}) => {
  const {
    allowedSort = ['created_at'],
    defaultSort = 'created_at',
    defaultOrder = 'DESC',
    maxLimit = 100,
    defaultLimit = 20
  } = options

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit))
  const sort = allowedSort.includes(query.sort) ? query.sort : defaultSort
  const order = String(query.order || defaultOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
  const search = String(query.search || '').trim()
  const offset = (page - 1) * limit

  return { page, limit, offset, sort, order, search }
}

export const buildPaginatedResponse = (rows, total, { page, limit }) => ({
  data: rows,
  meta: {
    total,
    page,
    limit,
    totalPages: total > 0 ? Math.ceil(total / limit) : 0
  }
})

export const fetchAllPages = async (searchFn, query = {}, requester, pageSize = 500) => {
  const rows = []
  let page = 1
  let totalPages = 1

  do {
    const result = await searchFn({ ...query, page, limit: pageSize }, requester)
    rows.push(...(result.data || []))
    totalPages = result.meta?.totalPages || 1
    page += 1
  } while (page <= totalPages)

  return rows
}
