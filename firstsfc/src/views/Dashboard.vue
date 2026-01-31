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
        <p v-if="lastTap" class="success-msg">Welcome, {{ lastTap }}!</p>
        <p v-else>Please Tap your NFC ID to log attendance</p>
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
                <td>{{ new Date(log.tap_time).toLocaleTimeString() }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>No attendance records for today yet.</p>
        </div>
        <div class="modal-footer">
          <button class="close-btn" @click="showLogs = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

const showLogs = ref(false);
const logs = ref([]);
const lastTap = ref('');

// 1. Fetch existing logs for today
const fetchLogs = async () => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .gte('tap_time', today)
    .order('tap_time', { ascending: false });

  if (data) logs.value = data;
};

// 2. Listen for Real-time taps
const setupRealtime = () => {
  supabase
    .channel('attendance_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' }, (payload) => {
      logs.value.unshift(payload.new); // Add new log to top of list
      lastTap.value = payload.new.full_name; // Show welcome message
      
      // Reset welcome message after 3 seconds
      setTimeout(() => { lastTap.value = ''; }, 3000);
    })
    .subscribe();
};

onMounted(() => {
  fetchLogs();
  setupRealtime();
});
</script>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation Styles - Restores the layout in your screenshot */
.navbar {
    background: white;
    padding: 1rem 5%;
    display: flex;
    justify-content: space-between; /* This pushes links to the right */
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-sizing: border-box; /* Prevents navbar from overflowing the screen */
}

.nav-logo {
    font-weight: 700;
    color: #F9707E; /* Your signature pink */
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 2rem; /* Adds space between Logs and Logout */
    margin: 0;
    padding: 0;
}

.logs, .logout {
    text-decoration: none;
    font-weight: 500;
    color: #F9707E;
    padding: 8px 20px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.logs:hover, .logout:hover {
    color: white;
    background: #F9707E;
    border-radius: 20px;
}

/* Dashboard Content Adjustments */
.container {
    margin-top: 100px; /* Space for the fixed navbar */
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
/* ... keep your existing dashboard-card and status-circle styles ... */

.dashboard-card {
    width: 85%;
    max-width: 700px;
    padding: 60px;
    background: white;
    border-radius: 50px;
    text-align: center;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
}

.status-circle {
    width: 70px;
    height: 70px;
    background-color: #ffe2ec;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 30px;
    color: #F9707E;
    font-weight: 700;
    font-size: 1.5rem;
    animation: softBlink 2s infinite ease-in-out;
}

.dashboard-card h1 {
    font-size: 2.2rem;
    font-weight: 800;
    color: #1a202c;
    margin-bottom: 10px;
}

.dashboard-card p {
    color: #718096;
    font-size: 1.1rem;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-content {
    background: white;
    width: 90%;
    max-width: 550px;
    padding: 30px;
    border-radius: 25px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 50px;
}

.close-icon {
    font-size: 24px;
    cursor: pointer;
    color: #94a3b8;
}

.modal-body {
    text-align: center;
    margin-bottom: 50px;
    color: #94a3b8;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
}

.close-btn {
    padding: 10px 25px;
    background: #f1f5f9;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.logs-table th {
  text-align: left;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 10px;
}
.logs-table td {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-weight: 500;
}
.success-msg {
  color: #10b981;
  font-weight: 700;
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>