import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import User from '../models/user.model.js'
import config from '../../config/config.js'

// Authentication controller signs users in and guards routes using an HTTP-only JWT cookie.
const signin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase()
    const user = await User.findOne({ email }).select('+hashedPassword +salt')
    if (!user || !user.authenticate(req.body.password)) {
      return res.status(401).json({ error: 'Email or password is incorrect.' })
    }

    // The browser receives the signed session only as an HTTP-only cookie.
    const token = jwt.sign({ _id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '8h' })
    res.cookie('t', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    })
    return res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    return res.status(401).json({ error: 'Could not sign in.' })
  }
}

const signout = (req, res) => {
  res.clearCookie('t', { httpOnly: true, sameSite: 'lax', secure: config.env === 'production', path: '/' })
  return res.status(200).json({ message: 'Signed out.' })
}

const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  userProperty: 'auth',
  getToken: (req) => req.cookies?.t || req.headers.authorization?.replace(/^Bearer\s+/i, ''),
})

const validateSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth?._id).select('_id name email role')
    if (!user) {
      res.clearCookie('t', { path: '/' })
      return res.status(401).json({ error: 'Your session is no longer valid. Please sign in again.' })
    }
    // Read role from the database, not only from the token, so role changes take effect immediately.
    req.auth = { _id: user._id.toString(), role: user.role }
    req.currentUser = user
    return next()
  } catch {
    return res.status(401).json({ error: 'Your session could not be verified. Please sign in again.' })
  }
}

const session = (req, res) => res.json({
  user: {
    _id: req.currentUser._id,
    name: req.currentUser.name,
    email: req.currentUser.email,
    role: req.currentUser.role,
  },
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

export default { signin, signout, session, requireSignin, validateSession, hasAuthorization, hasAuthorizationOrAdmin, requireAdmin }
