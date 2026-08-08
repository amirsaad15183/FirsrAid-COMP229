import express from 'express'
import authCtrl from '../controllers/auth.controller.js'
import companyInfoCtrl from '../controllers/companyInfo.controller.js'

const router = express.Router()

router.route('/api/company-info')
  .get(companyInfoCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, companyInfoCtrl.update)

export default router
