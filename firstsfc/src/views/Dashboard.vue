<template>
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="nav-logo">Usher's Ministry – Attendance Dashboard</div>
      <ul class="nav-links">
        <li><a href="#" @click.prevent="showLogs = true" class="logs">Logs</a></li>
        <li><router-link to="/" class="logout">Logout</router-link></li>
      </ul>
    </nav>

    <main class="container">
      <div class="dashboard-card">
        <div class="status-circle"><span>u</span></div>
        <h1>READY TO TAP CARD</h1>
        <p>Please Tap your NFC ID to log attendance</p>
      </div>
    </main>

    <div v-if="showLogs" class="modal-overlay" @click.self="showLogs = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Today's Attendance Logs</h2>
          <span class="close-icon" @click="showLogs = false">&times;</span>
        </div>
        <div class="modal-body">
          <table v-if="logs.length > 0" class="logs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td>{{ log.full_name }}</td>
                <td>{{ new Date(log.tap_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-msg">No attendance records for today yet.</p>
        </div>
        <div class="modal-footer">
          <button class="close-btn" @click="showLogs = false">Close</button>
        </div>
      </div>
    </div>

    <footer class="dashboard-footer">
      <p>&copy; 2026 Usher's Ministry. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();
const showLogs = ref(false);
const logs = ref([]);

// Initialize Supabase using your Vercel Environment Variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

onMounted(async () => {
  // Logic to fetch logs from Supabase would go here
});
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background: white;
  padding: 1.2rem 5%;
  display: flex;
  justify-content: space-between; /* Fixes navigation layout */
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.nav-links {
  display: flex;
  list-style: none; /* Removes the dots */
  gap: 2rem;
}

.container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 80px;
}

.dashboard-card {
  background: white;
  padding: 80px 40px;
  border-radius: 50px;
  width: 90%;
  max-width: 650px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.04);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 30px;
  width: 90%;
  max-width: 550px;
}

.dashboard-footer {
  text-align: center;
  padding: 30px 0;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: auto;
}
</style>