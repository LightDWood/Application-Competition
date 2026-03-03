import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Training from '../views/Training.vue'
import TrainingAdmin from '../views/TrainingAdmin.vue'
import Registration from '../views/Registration.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/training',
    name: 'Training',
    component: Training
  },
  {
    path: '/training-admin',
    name: 'TrainingAdmin',
    component: TrainingAdmin
  },
  {
    path: '/registration',
    name: 'Registration',
    component: Registration
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
