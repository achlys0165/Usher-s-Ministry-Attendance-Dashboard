<template>
  <div class="dashboard-wrapper">
    <nav class="navbar">
      <div class="nav-logo">Usher's Ministry – Attendance Dashboard</div>
      <ul class="nav-links">
        <li><router-link to="/register" class="register-link">+ New Usher</router-link></li>
        <li><a href="#" @click.prevent="openLogs" class="logs">Logs</a></li>
        <li><a href="#" @click.prevent="handleLogout" class="logout">Logout</a></li>
      </ul>
    </nav>

    <main class="main-content">
      <!-- Hidden scanner input -->
      <form @submit.prevent="handleScan" style="opacity:0; position:absolute; top:0; left:0;">
        <input
          ref="scanInput"
          v-model="scannedValue"
          autofocus
          @blur="refocusInput"
        />
      </form>

      <div class="dashboard-card" :class="status">
        <div class="card-content">
          <div class="status-circle" :class="status">
            <span v-if="status === 'idle'">⌛</span>
            <span v-if="status === 'success'">✅</span>
            <span v-if="status === 'unknown'">⚠️</span>
            <span v-if="status === 'error'">❌</span>
          </div>

          <h1 class="main-message">{{ message }}</h1>
          <p class="sub-message">{{ subMessage }}</p>

          <button
            v-if="status === 'unknown'"
            @click="openRegisterModal"
            class="register-btn"
          >
            Register This Card
          </button>
        </div>
      </div>
    </main>

    <!-- Attendance Logs Modal -->
    <div v-if="showLogs" class="modal-overlay" @click.self="closeLogs">
      <div class="modal-content logs-modal">
        <div class="modal-header">
          <h2 class="modal-title">Today's Attendance Logs</h2>
          <span class="close-icon" @click="closeLogs">&times;</span>
        </div>

        <div class="modal-body">
          <div v-if="logs.length === 0" class="empty-state">
            <p>No attendance records for today yet.</p>
          </div>

          <div v-else class="logs-container">
            <div v-for="log in logs" :key="log.id" class="log-card">
              <div class="log-info">
                <p class="user-name">{{ log.full_name }}</p>
                <p class="user-nickname" v-if="log.nickname">{{ log.nickname }}</p>
              </div>
              <p class="log-time">{{ formatTime(log.tap_time) }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="export-btn" @click="exportToCSV">
            📥 Export to CSV
          </button>
          <button class="close-btn-styled" @click="closeLogs">Close</button>
        </div>
      </div>
    </div>

    <!-- Register Card Modal (for unknown cards) -->
    <div v-if="showRegister" class="modal-overlay" @click.self="closeRegisterModal">
      <div class="modal-content register-modal">
        <div class="modal-header">
          <h2 class="modal-title">Register New Usher</h2>
          <span class="close-icon" @click="closeRegisterModal">&times;</span>
        </div>

        <div class="modal-body">
          <p class="register-info">NFC ID: <strong>{{ pendingNfcId }}</strong></p>
          
          <form @submit.prevent="submitRegistration" class="register-form">
            <div class="input-group">
              <label>Full Name <span class="required">*</span></label>
              <input 
                v-model="registerForm.full_name" 
                type="text" 
                placeholder="Enter full name"
                required
              />
            </div>

            <div class="input-group">
              <label>Nickname <span class="required">*</span></label>
              <input 
                v-model="registerForm.nickname" 
                type="text" 
                placeholder="e.g., Bro. Jan, Sis. Marie"
                required
              />
              <small class="hint">How they want to be greeted</small>
            </div>

            <div v-if="registerError" class="error-message">
              {{ registerError }}
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeRegisterModal">
                Cancel
              </button>
              <button type="submit" class="submit-btn" :disabled="isRegistering">
                {{ isRegistering ? 'Registering...' : 'Register' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <footer class="dashboard-footer">
      <p>&copy; 2026 Usher's Ministry. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const scanInput = ref(null);
const scannedValue = ref('');
const status = ref('idle');
const message = ref('Welcome! 👋');
const subMessage = ref('Please tap your NFC card to log attendance');
const currentUser = ref(null);
const pendingNfcId = ref('');

const showLogs = ref(false);
const logs = ref([]);

const showRegister = ref(false);
const registerForm = ref({
  full_name: '',
  nickname: ''
});
const registerError = ref('');
const isRegistering = ref(false);

const refocusInput = () => {
  setTimeout(() => {
    if (scanInput.value) {
      scanInput.value.focus();
    }
  }, 100);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

const formatDateForFilename = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Handle NFC Scan
const handleScan = async () => {
  if (!scannedValue.value.trim()) return;

  const nfcId = scannedValue.value.trim();
  scannedValue.value = '';
  
  refocusInput();

  try {
    // Check authorized_users table
    const { data: userData, error: userError } = await supabase
      .from('authorized_users')
      .select('*')
      .eq('nfc_id', nfcId);

    if (userError) {
      console.error('Error checking user:', userError);
      status.value = 'error';
      message.value = 'System Error';
      subMessage.value = 'Unable to verify card. Please try again.';
      resetStatus();
      return;
    }

    // userData is an array
    if (!userData || userData.length === 0) {
      // Unknown card - show register option
      pendingNfcId.value = nfcId;
      status.value = 'unknown';
      message.value = 'Unknown Card ⚠️';
      subMessage.value = 'This NFC card is not registered. Please register to continue.';
      return;
    }

    // User found - log attendance
    const user = userData[0];
    currentUser.value = user;

    // Use nickname for greeting if available, otherwise use full_name
    const displayName = user.nickname || user.full_name;

    // Insert attendance log - only using columns that exist
    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        full_name: user.full_name,
        nickname: user.nickname || null,
        tap_time: new Date().toISOString(),
        status: 'present'
      });

    if (logError) {
      console.error('Error logging attendance:', logError);
      status.value = 'error';
      message.value = 'Error Logging Attendance';
      subMessage.value = 'Please try again.';
      resetStatus();
      return;
    }

    // Success! Use nickname in greeting
    status.value = 'success';
    message.value = `${getGreeting()}, ${displayName}! ✅`;
    subMessage.value = 'Your attendance has been logged successfully.';

    if (showLogs.value) {
      await fetchLogs();
    }

    resetStatus();

  } catch (error) {
    console.error('Scan handling error:', error);
    status.value = 'error';
    message.value = 'Error Processing Scan';
    subMessage.value = 'Please try again.';
    resetStatus();
  }
};

const resetStatus = () => {
  setTimeout(() => {
    status.value = 'idle';
    message.value = 'Welcome! 👋';
    subMessage.value = 'Please tap your NFC card to log attendance';
    currentUser.value = null;
  }, 3000);
};

const openLogs = async () => {
  showLogs.value = true;
  await fetchLogs();
};

const closeLogs = () => {
  showLogs.value = false;
};

const fetchLogs = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .gte('tap_time', today.toISOString())
      .order('tap_time', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }

    logs.value = data || [];
  } catch (error) {
    console.error('Fetch logs error:', error);
  }
};

const exportToCSV = () => {
  if (logs.value.length === 0) return;

  const headers = ['Name', 'Nickname', 'Time', 'Status'];
  
  const rows = logs.value.map(log => [
    log.full_name,
    log.nickname || '',
    new Date(log.tap_time).toLocaleString(),
    log.status || 'present'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_logs_${formatDateForFilename()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openRegisterModal = () => {
  showRegister.value = true;
  registerForm.value.full_name = '';
  registerForm.value.nickname = '';
  registerError.value = '';
};

const closeRegisterModal = () => {
  showRegister.value = false;
  pendingNfcId.value = '';
  registerForm.value.full_name = '';
  registerForm.value.nickname = '';
  registerError.value = '';
  
  status.value = 'idle';
  message.value = 'Welcome! 👋';
  subMessage.value = 'Please tap your NFC card to log attendance';
};

const submitRegistration = async () => {
  if (!registerForm.value.full_name.trim() || !registerForm.value.nickname.trim()) {
    registerError.value = 'Full name and nickname are required';
    return;
  }

  isRegistering.value = true;
  registerError.value = '';

  try {
    // Only insert fields that exist in your database
    const { error: insertError } = await supabase
      .from('authorized_users')
      .insert({
        nfc_id: pendingNfcId.value,
        full_name: registerForm.value.full_name.trim(),
        nickname: registerForm.value.nickname.trim(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Registration error:', insertError);
      if (insertError.code === '23505') {
        registerError.value = 'This NFC card is already registered.';
      } else {
        registerError.value = 'Failed to register. Please try again.';
      }
      isRegistering.value = false;
      return;
    }

    // Log first attendance with nickname
    await supabase
      .from('attendance_logs')
      .insert({
        full_name: registerForm.value.full_name.trim(),
        nickname: registerForm.value.nickname.trim(),
        tap_time: new Date().toISOString(),
        status: 'registered'
      });

    closeRegisterModal();
    
    status.value = 'success';
    message.value = `Welcome, ${registerForm.value.nickname}! ✅`;
    subMessage.value = 'Usher registered and attendance logged.';

    if (showLogs.value) {
      await fetchLogs();
    }

    resetStatus();

  } catch (error) {
    console.error('Registration error:', error);
    registerError.value = 'An unexpected error occurred.';
  } finally {
    isRegistering.value = false;
  }
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

onMounted(() => {
  refocusInput();
  document.addEventListener('click', refocusInput);
  document.addEventListener('keydown', refocusInput);
});

onUnmounted(() => {
  document.removeEventListener('click', refocusInput);
  document.removeEventListener('keydown', refocusInput);
});
</script>

<style scoped>
/* Navigation styles */
.register-link {
  text-decoration: none;
  font-weight: 600;
  color: #10b981;
  font-size: 0.95rem;
}

.register-link:hover {
  opacity: 0.7;
}

/* Main card container - perfectly centered */
.dashboard-card {
  background: white;
  padding: 60px 80px;
  border-radius: 50px;
  width: 90%;
  max-width: 700px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.04);
  animation: slideIn 0.3s ease;
}

/* Inner content wrapper */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Status circle */
.status-circle {
  width: 100px;
  height: 100px;
  background-color: #ffe2ec;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  color: #F9707E;
  font-weight: 700;
  font-size: 2.5rem;
  animation: softBlink 2s infinite ease-in-out;
}

.status-circle.success {
  background-color: #dcfce7;
  color: #16a34a;
  animation: none;
}

.status-circle.unknown {
  background-color: #fef3c7;
  color: #d97706;
  animation: none;
}

.status-circle.error {
  background-color: #fee2e2;
  color: #dc2626;
  animation: none;
}

/* Main message - centered */
.main-message {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 15px;
  text-align: center;
  line-height: 1.3;
  max-width: 100%;
  word-wrap: break-word;
}

/* Sub message - centered */
.sub-message {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 25px;
  text-align: center;
  line-height: 1.5;
  max-width: 90%;
}

/* Register button */
.register-btn {
  background: #F9707E;
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.register-btn:hover {
  background: #ff4d6d;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 112, 126, 0.3);
}

/* Animations */
@keyframes softBlink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal styles */
.register-modal {
  max-width: 450px;
}

.register-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #475569;
}

.register-info strong {
  color: #1e293b;
  font-family: monospace;
  font-size: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #F9707E;
}

.hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

.input-group input {
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #F9707E;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.submit-btn {
  flex: 2;
  padding: 12px;
  border: none;
  background: #F9707E;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #ff4d6d;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 10px;
}

.export-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.logs-container::-webkit-scrollbar {
  width: 6px;
}

.logs-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.logs-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.user-nickname {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .dashboard-card {
    padding: 40px 30px;
    min-height: 350px;
  }
  
  .main-message {
    font-size: 1.5rem;
  }
  
  .sub-message {
    font-size: 1rem;
  }
  
  .status-circle {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
}
</style>
