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
          <p class="empty-msg">No attendance records for today yet.</p>
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* Darkened background */
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
</style>