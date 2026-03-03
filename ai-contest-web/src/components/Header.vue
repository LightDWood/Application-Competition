<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea"/>
                  <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" stroke="url(#aiGradient)" stroke-width="2" fill="none" class="pulse-circle"/>
              <circle cx="20" cy="20" r="12" fill="url(#aiGradient)" opacity="0.1"/>
              <path d="M20 8 L20 12 M20 28 L20 32 M8 20 L12 20 M28 20 L32 20" stroke="url(#aiGradient)" stroke-width="2" stroke-linecap="round"/>
              <circle cx="20" cy="20" r="6" fill="url(#aiGradient)" class="core-circle"/>
              <circle cx="20" cy="20" r="3" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <span class="logo-text">AI<span class="highlight">"虚拟下属"设计大赛</span></span>
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

.pulse-circle {
  animation: pulse 2s ease-in-out infinite;
}

.core-circle {
  animation: glow 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes glow {
  0% {
    filter: drop-shadow(0 0 2px rgba(102, 126, 234, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.8));
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
