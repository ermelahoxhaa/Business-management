import {
  getEmployeeByUserId,
  getUserIdsByDepartment
} from '../repositories/employeeRepository.js'

export const getTeamLeaderDepartmentId = async (userId) => {
  const profile = await getEmployeeByUserId(userId)
  return profile?.department_id ?? null
}

export const assertTeamLeaderHasDepartment = async (userId) => {
  const departmentId = await getTeamLeaderDepartmentId(userId)
  if (!departmentId) {
    throw new Error('Your account has no department assigned. Contact an administrator.')
  }
  return departmentId
}

export const assertUserInTeamLeaderDepartment = async (teamLeaderUserId, targetUserId) => {
  const departmentId = await assertTeamLeaderHasDepartment(teamLeaderUserId)
  const targetProfile = await getEmployeeByUserId(targetUserId)

  if (!targetProfile || Number(targetProfile.department_id) !== Number(departmentId)) {
    throw new Error('You can only manage users in your assigned department')
  }

  return departmentId
}

export const getDepartmentEmployeeUserIds = async (departmentId) =>
  getUserIdsByDepartment(departmentId, ['employee'])
