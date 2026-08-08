import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'
import { signupLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

router.route('/api/users')
  .post(signupLimiter, userCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, userCtrl.list)

router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.hasAuthorizationOrAdmin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.hasAuthorizationOrAdmin, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.hasAuthorizationOrAdmin, userCtrl.remove)

router.param('userId', userCtrl.userByID)

export default router
