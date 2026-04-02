import User from '../models/User.js'

export const createUser = (data) => User.create(data)
export const findUserByEmail = (email) => User.findOne({ where: { email } })