import { Op } from 'sequelize'
import sequelize from '../config/database.js'
import Department from '../models/Department.js'
export const findDepartmentByName = (name) => Department.findOne({ where: { name } })

export const createDepartment = (data) => Department.create(data)

export const searchDepartments = async ({ search, sort, order, limit, offset }) => {
  const where = {}

  if (search) {
    const value = `%${search}%`
    where[Op.or] = [
      { name: { [Op.iLike]: value } },
      { description: { [Op.iLike]: value } }
    ]
  }

  const sortColumn = sort === 'employee_count' ? sequelize.literal('employee_count') : sort

  const { rows, count } = await Department.findAndCountAll({
    where,
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM employees AS e
            WHERE e.department_id = "Department"."id"
          )`),
          'employee_count'
        ]
      ]
    },
    order: [[sortColumn, order]],
    limit,
    offset,
    subQuery: false
  })

  return {
    rows: rows.map((row) => {
      const plain = row.get({ plain: true })
      return {
        ...plain,
        employee_count: Number(plain.employee_count) || 0
      }
    }),
    count
  }
}
