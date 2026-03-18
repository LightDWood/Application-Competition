import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Training from '../views/Training.vue'
import TrainingAdmin from '../views/TrainingAdmin.vue'
import Registration from '../views/Registration.vue'
// import Login from '../views/Login.vue'  // 已废弃
import UserLogin from '../views/user/Login.vue'
import UserRegister from '../views/user/Register.vue'

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
    redirect: '/user/login'  // 重定向到统一登录页
  },
  {
    path: '/training-admin',
    name: 'TrainingAdmin',
    component: TrainingAdmin,
    meta: { 
      requiresAuth: true,
      requiresRole: 'admin'  // 新配置：仅允许管理员访问
    }
  },
  {
    path: '/admin',
    redirect: '/training-admin'
  },
  {
    path: '/registration',
    name: 'Registration',
    component: Registration
  },
  {
    path: '/user/login',
    name: 'UserLogin',
    component: UserLogin
  },
  {
    path: '/user/register',
    name: 'UserRegister',
    component: UserRegister
  },
  {
    path: '/requirement',
    name: 'Requirement',
    component: () => import('../views/requirement/Layout.vue'),
    meta: { 
      requiresAuth: true,
      requiresRole: ['user', 'admin'],  // 新增：允许普通用户和管理员访问
      title: '创意工坊 - AI 副驾驶设计助手'
    },
    children: [
      {
        path: '',
        redirect: '/requirement/sessions'
      },
      {
        path: 'sessions',
        name: 'SessionList',
        component: () => import('../views/requirement/SessionList.vue'),
        meta: { title: '创意工坊 - 会话列表' }
      },
      {
        path: 'session/:id',
        name: 'ChatWindow',
        component: () => import('../views/requirement/ChatWindow.vue'),
        meta: { title: '创意工坊 - 需求澄清' }
      },
      {
        path: 'documents',
        name: 'DocumentList',
        component: () => import('../views/requirement/DocumentList.vue'),
        meta: { title: '创意工坊 - 文档管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/ai-contest/'),
  routes
})

router.beforeEach((to, from, next) => {
  const userInfo = localStorage.getItem('user_info')
  const userRole = userInfo ? JSON.parse(userInfo).role : null
  const token = localStorage.getItem('user_token')
  
  // 需要登录
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/user/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 需要特定角色
  if (to.meta.requiresRole && userInfo) {
    const requiredRole = to.meta.requiresRole
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!allowedRoles.includes(userRole)) {
      // 角色不匹配，重定向到首页或提示
      alert('您没有访问该页面的权限')
      next('/')
      return
    }
  }
  
  next()
})

export default router
