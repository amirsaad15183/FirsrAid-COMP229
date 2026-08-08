import express from 'express'
import authCtrl from '../controllers/auth.controller.js'
import locationCtrl from '../controllers/location.controller.js'

const router = express.Router()

router.route('/api/locations')
  .get(locationCtrl.list)
  .post(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, locationCtrl.create)

router.route('/api/locations/:locationId')
  .put(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, locationCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, locationCtrl.remove)

router.param('locationId', locationCtrl.locationByID)

export default router
