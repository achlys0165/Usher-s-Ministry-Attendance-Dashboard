<template>
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="nav-logo">Usher's Ministry – Attendance Dashboard JACOB TULIG</div>
      <ul class="nav-links">
        <li><a href="#" @click.prevent="showLogs = true" class="logs">Logs</a></li>
        <li><router-link to="/" class="logout">Logout</router-link></li>
      </ul>
    </nav>

    <main class="container">
       <div class="dashboard-card">
            <div class="status-circle"><span>u</span></div>
            
            <h1 v-if="lastTappedUser">WELCOME, {{ lastTappedUser }}!</h1>
            <h1 v-else>READY TO TAP CARD</h1>
            
            <p v-if="lastTappedUser">Your attendance has been recorded.</p>
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
import { supabase } from '../supabaseClient'; 

const lastTappedUser = ref('');
const logs = ref([]);

const setupRealtime = () => {
  // Listen for new rows in the attendance_logs table
  supabase
    .channel('attendance_changes')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'attendance_logs' }, 
        (payload) => {
          // 1. Update the logs list instantly
          logs.value.unshift(payload.new);
          
          // 2. Show a temporary welcome message on the card
          lastTappedUser.value = payload.new.full_name;
          setTimeout(() => { lastTappedUser.value = ''; }, 5000);
        }
    )
    .subscribe();
};

onMounted(() => {
  setupRealtime();
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

/* 4. Modal Overlay Fix - Prevents layout chaos from image_7aafdd */
.modal-overlay {
    position: fixed; /* Anchors to the screen, not the document */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4); /* Darkened backdrop */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000; /* Ensures it stays above the navbar */
}

/* 2. Modal Box Styling */
.modal-content {
    background: white;
    width: 90%;
    max-width: 550px;
    padding: 40px;
    border-radius: 25px; /* Matches the rounded dashboard card */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    animation: scaleIn 0.2s ease-out; /* Smooth pop-in effect */
}

/* 3. Header & Text */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.modal-header h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a202c;
}

.close-icon {
    font-size: 24px;
    cursor: pointer;
    color: #cbd5e1;
}

/* 4. Functional Table UI */
.logs-table {
    width: 100%;
    border-collapse: collapse;
}

.logs-table th {
    text-align: left;
    padding: 10px 0;
    border-bottom: 2px solid #f1f5f9;
    color: #64748b;
    font-size: 0.9rem;
}

.logs-table td {
    padding: 15px 0;
    border-bottom: 1px solid #f8fafc;
    color: #1e293b;
    font-weight: 500;
}

/* 5. Footer & Close Button */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
}

.close-btn {
    padding: 10px 25px;
    background: #f1f5f9;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: background 0.2s;
}

.close-btn:hover {
    background: #e2e8f0;
}

.empty-msg {
    text-align: center;
    padding: 40px 0;
    color: #94a3b8;
}

@keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

/* 5. Footer - Restores position from image_7ba71e */
.dashboard-footer {
  text-align: center;
  padding: 30px 0;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: auto;
}
</style>