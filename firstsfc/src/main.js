import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import App from './App.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'

// 1. Initialize Supabase first
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 2. Define the router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Login },
    { path: '/dashboard', component: Dashboard }
  ]
})

// 3. Mount the app
const app = createApp(App)
app.use(router)
app.mount('#app')