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
          <p>No attendance records for today yet.</p>
        </div>
        <div class="modal-footer">
          <button class="close-btn" @click="showLogs = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const showLogs = ref(false);
</script>

<style scoped>
/* 1. Navbar Fix: Ensures links show on the right */
.navbar {
    background: white;
    padding: 1.2rem 5%;
    display: flex;
    justify-content: space-between; /* This fixes your missing links */
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-sizing: border-box;
}

.nav-logo {
    font-weight: 700;
    color: #F9707E;
    font-size: 1.1rem;
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
    font-weight: 600;
    color: #F9707E;
    font-size: 0.95rem;
    cursor: pointer;
}

/* 2. Layout Fix: Centering and Sizing */
.container {
    padding-top: 80px; /* Space for navbar */
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffe2ec; /* Pink background from image */
}

.dashboard-card {
    width: 90%;
    max-width: 650px; /* Matches the proportions in image_ae01dd.png */
    padding: 80px 40px;
    background: white;
    border-radius: 40px;
    text-align: center;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
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
    /* Uses your custom blink animation */
    animation: softBlink 2s infinite ease-in-out; 
}

.dashboard-card h1 {
    font-size: 2.5rem; /* Larger, bold font from image */
    font-weight: 900;
    color: #1e293b;
    margin-bottom: 15px;
    letter-spacing: 1px;
}

.dashboard-card p {
    color: #64748b;
    font-size: 1.1rem;
    font-weight: 500;
}
</style>