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

      <!-- Hidden scanner input -->
      <form @submit.prevent="handleScan" style="opacity:0; position:absolute;">
        <input
          ref="scanInput"
          v-model="scannedValue"
          autofocus
        />
      </form>

      <div class="dashboard-card" :class="status">
        <div class="status-circle">
          <span v-if="status === 'idle'">⌛</span>
          <span v-if="status === 'success'">✅</span>
          <span v-if="status === 'invalid'">❌</span>
          <span v-if="status === 'unknown'">⚠️</span>
        </div>

        <h1>{{ message }}</h1>
        <p v-if="subMessage">{{ subMessage }}</p>

        <button
          v-if="status === 'unknown'"
          @click="registerCard"
          class="register-btn"
        >
          Register this card
        </button>
      </div>

    </main>


   
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
  
  <footer class="dashboard-footer">
      <p>&copy; 2026 Usher's Ministry. All rights reserved.</p>
  </footer>
</template>

<script setup>
import Scanner from './Scanner.vue';
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

// --- State Variables ---
const showLogs = ref(false);
const logs = ref([]);
const scanInput = ref(null);
const scannedValue = ref('');

// UI State - This fixes your "No message" issue
const status = ref('idle');
const message = ref('Ready to Scan');
const subMessage = ref('Please tap your NFC card');

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

<style scoped src="../assets/main.css"></style>