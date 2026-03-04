<template>
  <header class="header" v-show="!isHome">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366f1"/>
                  <stop offset="100%" style="stop-color:#8b5cf6"/>
                </linearGradient>
                <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#1e1b4b"/>
                  <stop offset="100%" style="stop-color:#312e81"/>
                </linearGradient>
              </defs>
              <rect x="50" y="40" width="100" height="120" rx="15" fill="url(#robotGrad)"/>
              <rect x="60" y="55" width="80" height="50" rx="8" fill="url(#screenGrad)"/>
              <circle cx="80" cy="80" r="8" fill="#22d3ee" class="eye-left">
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="120" cy="80" r="8" fill="#22d3ee" class="eye-right">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
              </circle>
              <rect x="70" y="115" width="60" height="8" rx="4" fill="#c4b5fd"/>
              <rect x="80" y="130" width="40" height="8" rx="4" fill="#c4b5fd"/>
              <rect x="90" y="145" width="20" height="8" rx="4" fill="#c4b5fd"/>
              <rect x="30" y="70" width="15" height="30" rx="5" fill="url(#robotGrad)"/>
              <rect x="155" y="70" width="15" height="30" rx="5" fill="url(#robotGrad)"/>
              <circle cx="100" cy="30" r="8" fill="#f43f5e"/>
            </svg>
          </div>
          <span class="logo-text">法务<span class="highlight">"AI副驾驶"设计大赛</span></span>
        </router-link>
        <nav class="nav" :class="{ 'nav-open': menuOpen }">
          <ul>
            <li>
              <router-link 
                to="/" 
                :class="{ active: activeMenu === 'home' }"
                @click="menuOpen = false"
              >
                首页
              </router-link>
            </li>
            <li>
              <router-link 
                to="/training" 
                :class="{ active: activeMenu === 'training' }"
                @click="menuOpen = false"
              >
                培训资料
              </router-link>
            </li>
            <li>
              <router-link 
                to="/registration" 
                :class="{ active: activeMenu === 'registration' }"
                @click="menuOpen = false"
              >
                大赛报名
              </router-link>
            </li>
          </ul>
        </nav>
        <button class="menu-toggle" @click="menuOpen = !menuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

const isHome = computed(() => route.path === '/')

const activeMenu = computed(() => {
  if (route.path === '/training') return 'training'
  if (route.path === '/registration') return 'registration'
  return 'home'
})
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.eye-left, .eye-right {
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.logo-text {
  display: flex;
}

.logo-text .highlight {
  color: #764ba2;
}

.nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
}

.nav a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.3s;
  padding: 5px 0;
}

.nav a:hover,
.nav a.active {
  color: #667eea;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: #667eea;
  border-radius: 2px;
  transition: all 0.3s;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
  }

  .menu-toggle {
    display: flex;
  }

  .nav {
    width: 100%;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .nav-open {
    max-height: 200px;
  }

  .nav ul {
    flex-direction: column;
    gap: 0;
    padding-top: 15px;
  }

  .nav li {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }

  .nav li:last-child {
    border-bottom: none;
  }
}
</style>
