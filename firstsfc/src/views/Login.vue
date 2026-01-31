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
              <tr><th>Name</th><th>Time</th></tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td>{{ log.full_name }}</td>
                <td>{{ new Date(log.tap_time).toLocaleTimeString() }}</td>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const handleLogin = async () => {
  errorMessage.value = '';
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMessage.value = "Invalid login credentials.";
  } else {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #ffe2ec; /* Pink background from your images */
}

.card {
    width: 420px;
    padding: 40px;
    background: white;
    border-radius: 30px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    text-align: center;
}

.card h1 {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
}

.dashboard-title {
    font-size: 0.9rem;
    margin-bottom: 2rem;
    color: #64748b;
}

.input_field {
    margin: 15px 0;
}

.input_field input {
    height: 50px;
    width: 100%;
    padding: 0 15px;
    font-size: 16px;
    background-color: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    outline: none;
    text-align: center;
    box-sizing: border-box;
}

.btn {
    width: 100%;
    height: 50px;
    background: #F9707E; /* Signature Pink */
    border: none;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    border-radius: 15px;
    margin-top: 10px;
    cursor: pointer;
    transition: background 0.3s;
}

.btn:hover {
    background: #ff4d6d;
}

.error-text {
    color: #F9707E;
    font-size: 0.85rem;
    margin-bottom: 15px;
}

.login-footer {
    margin-top: 40px;
    color: #94a3b8;
    font-size: 0.85rem;
}
</style>