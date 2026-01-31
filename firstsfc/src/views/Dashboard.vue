<template>
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="nav-logo">Usher's Ministry – Attendance Dashboard</div>
      <ul class="nav-links">
        <li><a href="#" @click.prevent="showLogs = true" class="logs">Logs</a></li>
        <li><a href="#" @click.prevent="handleLogout" class="logout">Logout</a></li>
      </ul>
    </nav>

    <main class="container">
      <div class="dashboard-card">
        <div class="status-circle">
          <span>u</span>
        </div>
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
          <p v-if="logs.length === 0">No attendance records for today yet.</p>
          <div v-else class="logs-list">
            <div v-for="log in logs" :key="log.id" class="log-entry">
              <span>{{ log.name }}</span>
              <span>{{ log.time }}</span>
            </div>
          </div>
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
  width: 100%;
}

.modal-overlay {
  position: fixed; /* Fixes it to the viewport */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Dims the background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Ensures it is above everything else */
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 30px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

/* Navbar Fix: Pushes links to the far right */
.navbar {
    background: white;
    padding: 1rem 5%;
    display: flex;
    justify-content: space-between; 
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    position: fixed;
    padding: 1.5rem 5%;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-sizing: border-box;
}

.nav-logo {
    font-weight: 700;
    color: #F9707E;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.logs, .logout {
    text-decoration: none;
    font-weight: 500;
    color: #F9707E;
    padding: 8px 20px;
    cursor: pointer;
}

/* Card Centering Fix: Ensuring it stays in the middle of the pink [cite: 24, 25] */
.container {
    margin-top: 80px; /* Space for the fixed navbar  */
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.dashboard-card {
    width: 90%;
    max-width: 600px; /* Matches the proportions in image_ae01dd */
    padding: 80px 40px;
    background: white;
    border-radius: 50px; /* Signature rounded look [cite: 25] */
    text-align: center;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
}

.status-circle {
    width: 80px;
    height: 80px;
    background-color: #ffe2ec;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 40px;
    color: #F9707E;
    font-weight: 700;
    font-size: 2rem;
    animation: softBlink 2s infinite ease-in-out; /* [cite: 34] */
}

.dashboard-card h1 {
    font-size: 2.5rem;
    font-weight: 900;
    color: #1a202c;
    margin-bottom: 10px;
    text-transform: uppercase;
}

.dashboard-card p {
    color: #718096;
    font-size: 1.1rem;
}
</style>