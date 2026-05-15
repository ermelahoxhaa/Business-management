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
