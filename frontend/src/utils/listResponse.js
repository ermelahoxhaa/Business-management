export const unwrapList = (response) => {
  const payload = response.data

  if (payload && Array.isArray(payload.data)) {
    return {
      items: payload.data,
      meta: payload.meta || { total: payload.data.length, page: 1, limit: payload.data.length, totalPages: 1 }
    }
  }

  const items = Array.isArray(payload) ? payload : []
  return {
    items,
    meta: { total: items.length, page: 1, limit: items.length, totalPages: 1 }
  }
}

export const buildQueryParams = (filters = {}) => {
  const params = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value
    }
  })

  return params
}
