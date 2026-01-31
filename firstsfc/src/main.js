import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Login },
    { path: '/dashboard', component: Dashboard }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')