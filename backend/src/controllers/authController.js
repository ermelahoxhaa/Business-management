import { loginUser, registerUser } from '../services/authService.js'

export const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body)
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body)
    res.json(data)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}