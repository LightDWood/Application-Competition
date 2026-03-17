import express from 'express'
import authRoutes from './auth.js'
import trainingRoutes from './training.js'
import registrationRoutes from './registration.js'
import contestRoutes from './contest.js'
import uploadRoutes from './upload.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/trainings', trainingRoutes)
router.use('/registrations', registrationRoutes)
router.use('/contest', contestRoutes)
router.use('/upload', uploadRoutes)

export default router
