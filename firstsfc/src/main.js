import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import App from './App.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Registration from './views/Registration.vue' // ← Add this import

// 1. Initialize Supabase first
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 2. Define the router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      component: Login,
      name: 'Login',
      meta: { requiresGuest: true } // Optional: redirect logged-in users
    },
    { 
      path: '/dashboard', 
      component: Dashboard,
      name: 'Dashboard',
      meta: { requiresAuth: true } // Optional: protect this route
    },
    { 
      path: '/register', 
      component: Registration, // ← Add this route
      name: 'Register',
      meta: { requiresAuth: true } // Optional: only allow logged-in admins
    }
  ]
})

// 3. Optional: Navigation Guard (protect routes)
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  // If route requires auth and user is not logged in
  if (to.meta.requiresAuth && !session) {
    next('/')
  }
  // If route requires guest (login page) and user is logged in
  else if (to.meta.requiresGuest && session) {
    next('/dashboard')
  }
  else {
    next()
  }
})

// 4. Mount the app
const app = createApp(App)
app.use(router)
app.mount('#app')