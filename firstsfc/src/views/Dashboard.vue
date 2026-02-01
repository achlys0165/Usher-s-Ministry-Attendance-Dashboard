<template>
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="nav-logo">Usher's Ministry – Attendance Dashboard</div>
      <ul class="nav-links">
        <li><a href="#" @click.prevent="showLogs = true" class="logs">Logs</a></li>
        <li><router-link to="/" class="logout">Logout</router-link></li>
      </ul>
    </nav>

    <main class="main-content">
      <div class="dashboard-card">
        <div class="status-circle"><span>u</span></div>
        <h1>READY TO TAP CARD</h1>
        <p>Please Tap your NFC ID to log attendance</p>
      </div>
    </main>

    <footer class="dashboard-footer">
      <p>&copy; 2026 Usher's Ministry. All rights reserved.</p>
    </footer>

   <div class="dashboard-wrapper">
      <div v-if="showLogs" class="modal-overlay" @click.self="showLogs = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Today's Attendance Logs</h2>
            <span class="close-icon" @click="showLogs = false">&times;</span>
          </div>

          <div class="modal-body">
            <div v-if="logs.length === 0" class="empty-state">
              <p>No attendance records for today yet.</p>
          </div>

          <div v-else class="logs-container">
            <div v-for="log in logs" :key="log.id" class="log-card">
              <div class="log-info">
                <p class="user-name">{{ log.full_name }}</p>
                <p class="user-id">{{ log.nfc_id }}</p>
              </div>
                <p class="log-time">{{ formatTime(log.tap_time) }}</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="close-btn-styled" @click="showLogs = false">Close</button>
          </div>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // All Vue imports on one line
import { useRouter } from 'vue-router';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();
const showLogs = ref(false);
const logs = ref([]); // Data from Supabase

// Use your Vercel Environment Variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

// Fetch real data from Supabase
const fetchLogs = async () => {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .order('tap_time', { ascending: false });

  if (data) logs.value = data;
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
/* 1. Reset and Layout - Restores background from image_ae6336 */
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffe2ec;
}

/* 2. Navbar Fix - Restores space-between layout from image_ae6793 */
/* 1. Reset and Positioning */
.navbar {
    background: white;
    padding: 1.2rem 5%;
    display: flex;
    justify-content: space-between; /* This pushes links to the far right */
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-sizing: border-box; /* Ensures padding doesn't break width */
}

/* 2. Brand Styling */
.nav-logo {
    font-weight: 700;
    color: #F9707E; /* Signature Pink */
    font-size: 1.1rem;
}

/* 3. Navigation Links Fix */
.nav-links {
    list-style: none; /* Removes the dots/bullets */
    display: flex;
    gap: 2.5rem; /* Adds clean spacing between Logs and Logout */
    margin: 0;
    padding: 0;
}

.logs, .logout {
    text-decoration: none;
    font-weight: 600;
    color: #F9707E;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.3s ease;
}

.logs:hover, .logout:hover {
    opacity: 0.7;
}

/* 3. Container & Card - Restores centering from image_ae01dd */
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

.status-circle {
  width: 80px;
  height: 80px;
  background-color: #ffe2ec;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 35px;
  color: #F9707E;
  font-weight: 700;
  font-size: 1.8rem;
  animation: softBlink 2s infinite ease-in-out;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

/* Modal Box */
.modal-content {
    background: white;
    width: 90%;
    max-width: 550px;
    padding: 30px;
    border-radius: 25px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

/* Header: Title Top-Left */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
}

.close-icon {
    font-size: 24px;
    color: #94a3b8;
    cursor: pointer;
}

/* Empty State Message */
.empty-state {
    text-align: center;
    padding: 60px 0;
    color: #94a3b8;
    font-size: 1rem;
}

/* Log Card Styling */
.log-card {
    background: #fff5f7; /* Soft pink tint for logs */
    padding: 15px 20px;
    border-radius: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.user-name { font-weight: 700; color: #1e293b; margin-bottom: 2px; }
.user-id { font-size: 0.8rem; color: #94a3b8; }
.log-time { font-weight: 600; color: #F9707E; font-size: 0.9rem; }

/* Footer: Button Lower-Right */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.close-btn-styled {
    background: #f1f5f9; /* Soft background */
    border: none;
    padding: 10px 25px;
    border-radius: 12px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: background 0.2s;
}

.close-btn-styled:hover {
    background: #e2e8f0;
}

.dashboard-footer {
  text-align: center;
  padding: 25px 0;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: auto; /* This pushes the footer to the bottom */
  width: 100%;
}
</style>