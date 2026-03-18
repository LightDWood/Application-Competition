import express from 'express'
import authRoutes from './auth.js'
import trainingRoutes from './training.js'
import registrationRoutes from './registration.js'
import contestRoutes from './contest.js'
import uploadRoutes from './upload.js'
import userRoutes from './user.js'
import sessionRoutes from './session.js'
import adminRoutes from './admin.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/trainings', trainingRoutes)
router.use('/registrations', registrationRoutes)
router.use('/contest', contestRoutes)
router.use('/upload', uploadRoutes)
router.use('/user', userRoutes)
router.use('/sessions', sessionRoutes)
router.use('/admin', adminRoutes)

try {
  const reqModule = await import('./requirement.js')
  const requirementRoutes = reqModule.default || reqModule
  router.use('/requirement', requirementRoutes)
} catch (e) {
  console.warn('requirement.js load failed:', e.message)
}
 
export default router
