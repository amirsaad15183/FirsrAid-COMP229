import express from 'express'
import authCtrl from '../controllers/auth.controller.js' 
import { signinLimiter } from '../middleware/rateLimit.js'
const router = express.Router()
router.route('/auth/signin').post(signinLimiter, authCtrl.signin)
router.route('/auth/signout').post(authCtrl.signout)
router.route('/auth/session').get(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.session)
export default router
