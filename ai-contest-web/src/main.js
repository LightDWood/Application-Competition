import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElLoadingDirective } from 'element-plus'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.directive('loading', ElLoadingDirective)

app.mount('#app')
