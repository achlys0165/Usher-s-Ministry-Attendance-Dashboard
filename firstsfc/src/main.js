import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createClient } from '@supabase/supabase-js' //
import App from './App.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'

// 2. Define the router FIRST
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Login },
    { path: '/dashboard', component: Dashboard }
  ]
})

// 3. NOW you can add the guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (to.path === '/dashboard' && !session) {
    next('/');
  } else {
    next();
  }
});

const app = createApp(App)
app.use(router)
app.mount('#app')