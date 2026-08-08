import express from 'express'
import authCtrl from '../controllers/auth.controller.js'
import trainingClassCtrl from '../controllers/trainingClass.controller.js'

const router = express.Router()

router.route('/api/training-classes')
  // Anyone can browse future class listings.
  .get(trainingClassCtrl.list)
  // Class management requires a signed-in administrator.
  .post(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, trainingClassCtrl.create)

router.route('/api/training-classes/:classId')
  .get(trainingClassCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, trainingClassCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.validateSession, authCtrl.requireAdmin, trainingClassCtrl.remove)

router.param('classId', trainingClassCtrl.classByID)

export default router
