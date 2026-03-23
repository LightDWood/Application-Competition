import express from 'express'
// import authRoutes from './auth.js'  // 已移除，统一使用 /user 路由
import trainingRoutes from './training.js'
import registrationRoutes from './registration.js'
import contestRoutes from './contest.js'
import uploadRoutes from './upload.js'
import userRoutes from './user.js'
import adminRoutes from './admin.js'

const router = express.Router()

// router.use('/auth', authRoutes)  // 已移除，统一使用 /user 路由
router.use('/trainings', trainingRoutes)
router.use('/registrations', registrationRoutes)
router.use('/contest', contestRoutes)
router.use('/upload', uploadRoutes)
router.use('/user', userRoutes)
router.use('/admin', adminRoutes)

try {
  const reqModule = await import('./requirement.js')
  const requirementRoutes = reqModule.default || reqModule
  router.use('/requirement', requirementRoutes)
} catch (e) {
  console.warn('requirement.js load failed:', e.message)
}

try {
  const v2Module = await import('./v2.js')
  const v2Routes = v2Module.default || v2Module
  router.use('/v2', v2Routes)
  console.log('✅ V2 routes loaded successfully')
} catch (e) {
  console.warn('v2.js load failed:', e.message)
}
 
export default router
