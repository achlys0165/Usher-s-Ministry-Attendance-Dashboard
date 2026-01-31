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
/* 1. Wrapper & Footer Fix */
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.dashboard-footer {
  text-align: center;
  padding: 30px 0;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: auto; /* Pushes to bottom */
}

/* 2. Modal Overlay - The Darkened Background */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4); /* Matches darkened background in image */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* 3. Modal Content - The White Box */
.modal-content {
  background: white;
  width: 90%;
  max-width: 600px;
  padding: 35px;
  border-radius: 28px; /* Smooth rounded corners */
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  animation: slideUp 0.3s ease-out;
}

/* 4. Log Table Styling */
.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.logs-table th {
  text-align: left;
  color: #64748b;
  font-size: 0.9rem;
  border-bottom: 2px solid #f1f5f9;
  padding: 10px 0;
}
.logs-table td {
  padding: 15px 0;
  border-bottom: 1px solid #f8fafc;
  color: #1e293b;
  font-weight: 500;
}
.empty-msg {
  color: #94a3b8;
  padding: 60px 0;
}

/* 5. Modal Navigation Components */
.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.close-icon { font-size: 24px; color: #cbd5e1; cursor: pointer; }
.close-btn {
  background: #f1f5f9;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>