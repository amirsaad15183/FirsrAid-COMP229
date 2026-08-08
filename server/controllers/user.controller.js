import User from '../models/user.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const create = async (req, res) => {
  // Ignore role values from the request to prevent public admin-account creation.
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  })
  try {
    await user.save()
    return res.status(201).json({ message: 'Account created successfully.', user: user.toJSON() })
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const list = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt updatedAt')
    return res.json(users)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const userByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id).select('+hashedPassword +salt')
    if (!user) return res.status(404).json({ error: 'User not found.' })
    req.profile = user
    return next()
  } catch (error) {
    return res.status(400).json({ error: 'Could not retrieve user.' })
  }
}

const read = (req, res) => res.json(req.profile)

const update = async (req, res) => {
  try {
    // Users can update profile details but cannot change their role through this route.
    const allowedFields = ['name', 'email', 'password']
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.profile[field] = req.body[field]
    })
    await req.profile.save()
    return res.json(req.profile)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const remove = async (req, res) => {
  try {
    if (req.profile.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return res.status(409).json({ error: 'The final administrator account cannot be deleted.' })
      }
    }
    await req.profile.deleteOne()
    return res.json({ message: 'User deleted successfully.' })
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

export default { create, userByID, read, list, remove, update }
