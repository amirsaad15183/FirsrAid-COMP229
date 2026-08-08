import express from 'express'
import authCtrl from '../controllers/auth.controller.js'
import contactMessageCtrl from '../controllers/contactMessage.controller.js'
import { contactLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

router.route('/api/contact-messages')
  .post(contactLimiter, contactMessageCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, contactMessageCtrl.list)

export default router
