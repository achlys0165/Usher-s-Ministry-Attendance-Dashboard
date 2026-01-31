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
.dashboard-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
    background: white;
    padding: 1rem 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}

.nav-logo {
    font-weight: 700;
    color: #F9707E;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 1rem;
}

.nav-links a {
    text-decoration: none;
    font-weight: 500;
    color: #F9707E;
    padding: 8px 15px;
}

.container {
    margin-top: 100px;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

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
</style>