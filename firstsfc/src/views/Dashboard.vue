<template>
  <div class="wrapper">
    <nav class="navbar"> [cite: 16]
      <div class="nav-logo">Usher's Ministry - Attendance Dashboard</div> 
      <ul class="nav-links">
        <li><a @click="showLogs = true" class="logs" href="#">Logs</a></li> 
        <li><router-link to="/" class="logout">Logout</router-link></li> 
      </ul>
    </nav>

    <main class="container"> 
      <div class="dashboard-card"> 
        <div class="status-circle"> 
          <span>u</span> 
        </div>
        <h1>Ready to Tap Card</h1> 
        <p class="dashboard-title">Please Tap your NFC ID to log attendance</p> 
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

    <footer>
      <p>&copy; 2024 Usher's Ministry. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const showLogs = ref(false);
</script>

<style scoped>
/* Dashboard Styling [cite: 25, 26] */
.dashboard-card { width: 85%; max-width: 800px; padding: 90px; background: white; border-radius: 50px; text-align: center; }
.status-circle { width: 80px; height: 80px; background: #ffe2ec; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 40px; animation: softBlink 2s infinite ease-in-out; color: #F9707E; font-weight: 700; font-size: 2rem; } 

/* Modal Styles from your design request */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-content { background: white; width: 600px; padding: 40px; border-radius: 24px; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
.close-btn { background: #f1f5f9; padding: 10px 25px; border-radius: 12px; border: none; cursor: pointer; }
</style>