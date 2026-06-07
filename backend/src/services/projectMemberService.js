import ProjectMember from '../models/ProjectMember.js'
import Project from '../models/Project.js'
import User from '../models/User.js'

export const listProjectMembersService = async (projectId) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new Error('Project not found')

  const members = await ProjectMember.findAll({
    where: { project_id: projectId },
    order: [['created_at', 'ASC']]
  })

  const userIds = members.map((member) => member.user_id)
  const users = userIds.length ? await User.findAll({ where: { id: userIds } }) : []
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]))

  return members.map((member) => ({
    ...member.toJSON(),
    user: userMap[member.user_id]
      ? {
          id: userMap[member.user_id].id,
          first_name: userMap[member.user_id].first_name,
          last_name: userMap[member.user_id].last_name,
          email: userMap[member.user_id].email
        }
      : null
  }))
}

export const addProjectMemberService = async (projectId, payload) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new Error('Project not found')

  const userId = Number(payload.user_id)
  const user = await User.findByPk(userId)
  if (!user) throw new Error('User not found')

  const role = payload.role === 'owner' ? 'owner' : 'member'
  const existing = await ProjectMember.findOne({ where: { project_id: projectId, user_id: userId } })
  if (existing) throw new Error('User is already a project member')

  return ProjectMember.create({
    project_id: Number(projectId),
    user_id: userId,
    role
  })
}

export const removeProjectMemberService = async (projectId, memberId) => {
  const deleted = await ProjectMember.destroy({ where: { id: memberId, project_id: projectId } })
  if (!deleted) throw new Error('Project member not found')
  return { deleted: true }
}
