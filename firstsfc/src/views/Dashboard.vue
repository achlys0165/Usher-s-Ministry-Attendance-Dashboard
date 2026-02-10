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
      <!-- Hidden scanner input that captures NFC scans -->
      <form @submit.prevent="handleScan" style="opacity:0; position:absolute; top:0; left:0;">
        <input
          ref="scanInput"
          v-model="scannedValue"
          autofocus
          @blur="refocusInput"
        />
      </form>

      <div class="dashboard-card" :class="status">
        <div class="status-circle" :class="status">
          <span v-if="status === 'idle'">⌛</span>
          <span v-if="status === 'success'">✅</span>
          <span v-if="status === 'unknown'">⚠️</span>
          <span v-if="status === 'error'">❌</span>
        </div>

        <h1 class="main-message">{{ message }}</h1>
        <p v-if="subMessage" class="sub-message">{{ subMessage }}</p>

        <button
          v-if="status === 'unknown'"
          @click="openRegisterModal"
          class="register-btn"
        >
          Register This Card
        </button>
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
                <p class="user-id">{{ log.nfc_id }}</p>
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

    <!-- Register Card Modal -->
    <div v-if="showRegister" class="modal-overlay" @click.self="closeRegisterModal">
      <div class="modal-content register-modal">
        <div class="modal-header">
          <h2 class="modal-title">Register New Card</h2>
          <span class="close-icon" @click="closeRegisterModal">&times;</span>
        </div>

        <div class="modal-body">
          <p class="register-info">NFC ID: <strong>{{ pendingNfcId }}</strong></p>
          
          <form @submit.prevent="submitRegistration" class="register-form">
            <div class="input-group">
              <label>Full Name</label>
              <input 
                v-model="registerForm.full_name" 
                type="text" 
                placeholder="Enter full name"
                required
              />
            </div>

            <div class="input-group">
              <label>Email (Optional)</label>
              <input 
                v-model="registerForm.email" 
                type="email" 
                placeholder="Enter email address"
              />
            </div>

            <div class="input-group">
              <label>Phone (Optional)</label>
              <input 
                v-model="registerForm.phone" 
                type="tel" 
                placeholder="Enter phone number"
              />
            </div>

            <div v-if="registerError" class="error-message">
              {{ registerError }}
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeRegisterModal">
                Cancel
              </button>
              <button type="submit" class="submit-btn" :disabled="isRegistering">
                {{ isRegistering ? 'Registering...' : 'Register Card' }}
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

// Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Reactive State
const scanInput = ref(null);
const scannedValue = ref('');
const status = ref('idle');
const message = ref('Welcome! 👋');
const subMessage = ref('Please tap your NFC card to log attendance');
const currentUser = ref(null);
const pendingNfcId = ref('');

// Logs modal state
const showLogs = ref(false);
const logs = ref([]);

// Register modal state
const showRegister = ref(false);
const registerForm = ref({
  full_name: '',
  email: '',
  phone: ''
});
const registerError = ref('');
const isRegistering = ref(false);

// Keep input focused
const refocusInput = () => {
  setTimeout(() => {
    if (scanInput.value) {
      scanInput.value.focus();
    }
  }, 100);
};

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Format timestamp for display
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

// Format date for CSV filename
const formatDateForFilename = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Handle NFC Scan
const handleScan = async () => {
  if (!scannedValue.value.trim()) return;

  const nfcId = scannedValue.value.trim();
  scannedValue.value = '';
  
  // Reset focus to capture next scan
  refocusInput();

  try {
    // Check if user exists in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('nfc_id', nfcId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for unknown cards
      console.error('Error checking user:', userError);
      status.value = 'error';
      message.value = 'System Error';
      subMessage.value = 'Unable to verify card. Please try again.';
      resetStatus();
      return;
    }

    if (!userData) {
      // Unknown card - show register option
      pendingNfcId.value = nfcId;
      status.value = 'unknown';
      message.value = 'Unknown Card ⚠️';
      subMessage.value = 'This NFC card is not registered. Please register to continue.';
      return;
    }

    // User found - log attendance
    currentUser.value = userData;

    // Insert attendance log
    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        user_id: userData.id,
        nfc_id: nfcId,
        full_name: userData.full_name,
        tap_time: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging attendance:', logError);
      status.value = 'error';
      message.value = 'Error Logging Attendance';
      subMessage.value = 'Please try again.';
      resetStatus();
      return;
    }

    // Success!
    status.value = 'success';
    message.value = `${getGreeting()}, ${userData.full_name}! ✅`;
    subMessage.value = 'Your attendance has been logged successfully.';

    // Refresh logs if modal is open
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

// Reset status after delay
const resetStatus = () => {
  setTimeout(() => {
    status.value = 'idle';
    message.value = 'Welcome! 👋';
    subMessage.value = 'Please tap your NFC card to log attendance';
    currentUser.value = null;
  }, 3000);
};

// Open logs modal
const openLogs = async () => {
  showLogs.value = true;
  await fetchLogs();
};

// Close logs modal
const closeLogs = () => {
  showLogs.value = false;
};

// Fetch attendance logs from Supabase
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

// Export logs to CSV
const exportToCSV = () => {
  if (logs.value.length === 0) return;

  // CSV Headers
  const headers = ['Name', 'NFC ID', 'Time'];
  
  // CSV Rows
  const rows = logs.value.map(log => [
    log.full_name,
    log.nfc_id,
    new Date(log.tap_time).toLocaleString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create download link
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

// Open register modal
const openRegisterModal = () => {
  showRegister.value = true;
  registerForm.value = { full_name: '', email: '', phone: '' };
  registerError.value = '';
};

// Close register modal
const closeRegisterModal = () => {
  showRegister.value = false;
  pendingNfcId.value = '';
  registerForm.value = { full_name: '', email: '', phone: '' };
  registerError.value = '';
  
  // Reset dashboard status
  status.value = 'idle';
  message.value = 'Welcome! 👋';
  subMessage.value = 'Please tap your NFC card to log attendance';
};

// Submit registration
const submitRegistration = async () => {
  if (!registerForm.value.full_name.trim()) {
    registerError.value = 'Full name is required';
    return;
  }

  isRegistering.value = true;
  registerError.value = '';

  try {
    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        nfc_id: pendingNfcId.value,
        full_name: registerForm.value.full_name.trim(),
        email: registerForm.value.email.trim() || null,
        phone: registerForm.value.phone.trim() || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

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

    // Log attendance for the new user
    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        user_id: newUser.id,
        nfc_id: pendingNfcId.value,
        full_name: newUser.full_name,
        tap_time: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging first attendance:', logError);
    }

    // Close modal and show success
    closeRegisterModal();
    
    status.value = 'success';
    message.value = `Welcome, ${newUser.full_name}! ✅`;
    subMessage.value = 'Card registered and attendance logged successfully.';

    // Refresh logs if modal is open
    if (showLogs.value) {
      await fetchLogs();
    }

    resetStatus();

  } catch (error) {
    console.error('Registration error:', error);
    registerError.value = 'An unexpected error occurred. Please try again.';
  } finally {
    isRegistering.value = false;
  }
};

// Handle logout
const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

// Lifecycle hooks
onMounted(() => {
  // Ensure input is always focused for NFC scans
  refocusInput();
  
  // Add event listener to keep focus
  document.addEventListener('click', refocusInput);
  document.addEventListener('keydown', refocusInput);
});

onUnmounted(() => {
  document.removeEventListener('click', refocusInput);
  document.removeEventListener('keydown', refocusInput);
});
</script >

<style scoped src="../assets/main.css"> 
/* Status-specific styles */
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

.main-message {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.sub-message {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.register-btn {
  background: #F9707E;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.register-btn:hover {
  background: #ff4d6d;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 112, 126, 0.3);
}

/* Register Modal Styles */
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

/* Export Button */
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

/* Animation for status changes */
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

.dashboard-card {
  animation: slideIn 0.3s ease;
}

.register-link {
  text-decoration: none;
  font-weight: 600;
  color: #F9707E;
  font-size: 0.95rem;
}

.register-link:hover {
  opacity: 0.7;
}
</style>