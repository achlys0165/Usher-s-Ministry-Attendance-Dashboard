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

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (to.path === '/dashboard' && !session) {
    // If trying to access dashboard without login, send to login
    next('/');
  } else {
    next();
  }
});