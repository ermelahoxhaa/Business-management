import {
  createDepartment,
  findDepartmentByName,
  searchDepartments
} from '../repositories/departmentRepository.js'
import { parseListQuery, buildPaginatedResponse } from '../utils/queryParser.js'

export const searchDepartmentsService = async (query) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['name', 'created_at', 'employee_count'],
    defaultSort: 'name',
    defaultOrder: 'ASC'
  })

  const { rows, count } = await searchDepartments({
    search: listQuery.search,
    sort: listQuery.sort,
    order: listQuery.order,
    limit: listQuery.limit,
    offset: listQuery.offset
  })

  return buildPaginatedResponse(rows, count, listQuery)
}

export const createDepartmentService = async ({ name, description, created_by }) => {
  const normalizedName = (name || '').trim()
  if (!normalizedName) {
    throw new Error('Department name is required')
  }

  const existing = await findDepartmentByName(normalizedName)
  if (existing) {
    throw new Error('Department already exists')
  }

  return createDepartment({
    name: normalizedName,
    description,
    created_by
  })
}
