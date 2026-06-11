import {
  createDepartment,
  findDepartmentByName,
  searchDepartments
} from '../repositories/departmentRepository.js'
import { getTeamLeaderDepartmentId } from './departmentScopeService.js'
import { parseListQuery, buildPaginatedResponse } from '../utils/queryParser.js'

export const searchDepartmentsService = async (query, requester) => {
  const listQuery = parseListQuery(query, {
    allowedSort: ['name', 'created_at', 'employee_count'],
    defaultSort: 'name',
    defaultOrder: 'ASC'
  })

  let departmentId
  if (requester?.role === 'team_leader') {
    departmentId = await getTeamLeaderDepartmentId(requester.id)
    if (!departmentId) {
      return buildPaginatedResponse([], 0, listQuery)
    }
  }

  const { rows, count } = await searchDepartments({
    search: listQuery.search,
    departmentId,
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
