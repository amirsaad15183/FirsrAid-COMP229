import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import User from '../models/user.model.js'
import config from '../../config/config.js'

const signin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase()
    const user = await User.findOne({ email }).select('+hashedPassword +salt')
    if (!user || !user.authenticate(req.body.password)) {
      return res.status(401).json({ error: 'Email or password is incorrect.' })
    }

    // The token carries the role so protected routes can enforce authorization.
    const token = jwt.sign({ _id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '8h' })
    res.cookie('t', token, { httpOnly: true, sameSite: 'lax' })
    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(401).json({ error: 'Could not sign in.' })
  }
}

const signout = (req, res) => {
  res.clearCookie('t')
  return res.status(200).json({ message: 'Signed out.' })
}

const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  userProperty: 'auth',
})

const hasAuthorization = (req, res, next) => {
  if (req.profile && req.auth && req.profile._id.toString() === req.auth._id) return next()
  return res.status(403).json({ error: 'User is not authorized.' })
}

const hasAuthorizationOrAdmin = (req, res, next) => {
  if (req.auth?.role === 'admin' || (req.profile && req.profile._id.toString() === req.auth?._id)) {
    return next()
  }
  return res.status(403).json({ error: 'User is not authorized.' })
}

const requireAdmin = (req, res, next) => {
  // Only administrators can create, edit, or delete training classes.
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access is required.' })
  }
  return next()
}

export default { signin, signout, requireSignin, hasAuthorization, hasAuthorizationOrAdmin, requireAdmin }
