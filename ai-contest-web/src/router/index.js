import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Training from '../views/Training.vue'
import TrainingAdmin from '../views/TrainingAdmin.vue'
import Registration from '../views/Registration.vue'
import Login from '../views/Login.vue'

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
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/training-admin',
    name: 'TrainingAdmin',
    component: TrainingAdmin,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/training-admin'
  },
  {
    path: '/registration',
    name: 'Registration',
    component: Registration
  }
]

const router = createRouter({
  history: createWebHistory('/ai-contest/'),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/login')
      return
    }
  }
  next()
})

export default router
