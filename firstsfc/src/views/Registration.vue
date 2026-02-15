<template>
  <div class="register-page-wrapper">
    <nav class="navbar">
      <div class="nav-logo">Usher's Ministry – New Registration</div>
      <ul class="nav-links">
        <li><router-link to="/dashboard" class="back-link">← Back to Dashboard</router-link></li>
        <li><a href="#" @click.prevent="handleLogout" class="logout">Logout</a></li>
      </ul>
    </nav>

    <main class="main-content">
      <div class="register-card">
        <div class="register-header">
          <div class="icon-circle">
            <span>📝</span>
          </div>
          <h1>Register New Usher</h1>
          <p class="subtitle">Enter usher details and tap NFC card to register</p>
        </div>

        <!-- Step 1: Enter Details -->
        <div v-if="step === 1" class="form-section">
          <form @submit.prevent="goToStep2" class="register-form">
            <div class="input-group">
              <label>Full Name <span class="required">*</span></label>
              <input 
                v-model="form.full_name" 
                type="text" 
                placeholder="Enter full name"
                required
                ref="nameInput"
              />
            </div>

            <div class="input-group">
              <label>Nickname <span class="required">*</span></label>
              <input 
                v-model="form.nickname" 
                type="text" 
                placeholder="e.g., Bro. Jan, Sis. Marie"
                required
              />
              <small class="hint">How they want to be greeted</small>
            </div>

            <button type="submit" class="btn-primary" :disabled="!form.full_name.trim() || !form.nickname.trim()">
              Continue to Card Scan
            </button>
          </form>
        </div>

        <!-- Step 2: Scan NFC Card -->
        <div v-if="step === 2" class="scan-section">
          <div class="scan-status" :class="scanStatus">
            <div class="scan-icon">
              <span v-if="scanStatus === 'waiting'">📡</span>
              <span v-if="scanStatus === 'success'">✅</span>
              <span v-if="scanStatus === 'error'">❌</span>
            </div>
            
            <h2>{{ scanMessage }}</h2>
            <p class="scan-submessage">{{ scanSubMessage }}</p>

            <form @submit.prevent="handleCardScan" style="opacity:0; position:absolute;">
              <input
                ref="cardInput"
                v-model="scannedCardId"
                autofocus
                @blur="refocusCardInput"
              />
            </form>
          </div>

          <div class="preview-box" v-if="form.full_name">
            <h3>Registration Preview</h3>
            <div class="preview-item">
              <span class="label">Full Name:</span>
              <span class="value">{{ form.full_name }}</span>
            </div>
            <div class="preview-item">
              <span class="label">Nickname:</span>
              <span class="value">{{ form.nickname }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="goBack" class="btn-secondary">← Back</button>
            <button 
              v-if="scanStatus === 'success'" 
              @click="submitRegistration" 
              class="btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Registering...' : 'Complete Registration' }}
            </button>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-if="step === 3" class="success-section">
          <div class="success-icon">🎉</div>
          <h2>Registration Successful!</h2>
          <p>{{ form.full_name }} ({{ form.nickname }}) has been registered.</p>
          <p class="card-id">Card ID: {{ registeredCardId }}</p>
          
          <div class="action-buttons">
            <button @click="registerAnother" class="btn-primary">Register Another Usher</button>
            <router-link to="/dashboard" class="btn-secondary">Go to Dashboard</router-link>
          </div>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>
      </div>
    </main>

    <footer class="page-footer">
      <p>&copy; 2026 Usher's Ministry. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const step = ref(1);
const form = ref({
  full_name: '',
  nickname: ''
});

const scannedCardId = ref('');
const scanStatus = ref('waiting');
const scanMessage = ref('Ready to Scan');
const scanSubMessage = ref('Please tap the NFC card on the reader');
const cardInput = ref(null);
const registeredCardId = ref('');

const isSubmitting = ref(false);
const errorMessage = ref('');
const nameInput = ref(null);

const refocusCardInput = () => {
  setTimeout(() => {
    if (cardInput.value && step.value === 2) {
      cardInput.value.focus();
    }
  }, 100);
};

const goToStep2 = () => {
  if (!form.value.full_name.trim() || !form.value.nickname.trim()) return;
  step.value = 2;
  scanStatus.value = 'waiting';
  scanMessage.value = 'Ready to Scan';
  scanSubMessage.value = 'Please tap the NFC card on the reader';
  scannedCardId.value = '';
  
  nextTick(() => {
    refocusCardInput();
  });
};

const goBack = () => {
  step.value = 1;
  scanStatus.value = 'waiting';
  scannedCardId.value = '';
  errorMessage.value = '';
};

const handleCardScan = async () => {
  if (!scannedCardId.value.trim()) return;

  const cardId = scannedCardId.value.trim();
  scannedCardId.value = '';
  
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('authorized_users')
      .select('*')
      .eq('nfc_id', cardId);

    if (checkError) {
      scanStatus.value = 'error';
      scanMessage.value = 'Database Error';
      scanSubMessage.value = checkError.message;
      return;
    }

    if (existingUser && existingUser.length > 0) {
      scanStatus.value = 'error';
      scanMessage.value = 'Card Already Registered';
      scanSubMessage.value = `This card belongs to ${existingUser[0].full_name}`;
      return;
    }

    registeredCardId.value = cardId;
    scanStatus.value = 'success';
    scanMessage.value = 'Card Ready!';
    scanSubMessage.value = 'Click "Complete Registration" to finish';

  } catch (error) {
    scanStatus.value = 'error';
    scanMessage.value = 'Error Processing Card';
    scanSubMessage.value = 'Please try again';
  }
};

const submitRegistration = async () => {
  if (!registeredCardId.value || !form.value.full_name) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // Only insert fields that exist in your database
    const { error: insertError } = await supabase
      .from('authorized_users')
      .insert({
        nfc_id: registeredCardId.value,
        full_name: form.value.full_name.trim(),
        nickname: form.value.nickname.trim(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      if (insertError.code === '23505') {
        errorMessage.value = 'This card is already registered.';
      } else {
        errorMessage.value = `Failed to register: ${insertError.message}`;
      }
      isSubmitting.value = false;
      return;
    }

    step.value = 3;

  } catch (error) {
    errorMessage.value = 'An unexpected error occurred.';
  } finally {
    isSubmitting.value = false;
  }
};

const registerAnother = () => {
  form.value = {
    full_name: '',
    nickname: ''
  };
  scannedCardId.value = '';
  registeredCardId.value = '';
  scanStatus.value = 'waiting';
  scanMessage.value = 'Ready to Scan';
  scanSubMessage.value = 'Please tap the NFC card on the reader';
  errorMessage.value = '';
  step.value = 1;
  
  nextTick(() => {
    if (nameInput.value) {
      nameInput.value.focus();
    }
  });
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

onMounted(() => {
  if (nameInput.value) {
    nameInput.value.focus();
  }
});
</script>

<style scoped>
.register-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffe2ec;
}

.navbar {
  background: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-logo {
  font-weight: 700;
  color: #F9707E;
  font-size: 1.2rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.back-link, .logout {
  text-decoration: none;
  font-weight: 600;
  color: #F9707E;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.3s;
}

.back-link:hover, .logout:hover {
  opacity: 0.7;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 20px 40px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: #ffe2ec;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  font-size: 2rem;
}

.register-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.9rem;
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
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.input-group input:focus {
  border-color: #F9707E;
  box-shadow: 0 0 0 3px rgba(249, 112, 126, 0.1);
}

.btn-primary {
  background: #F9707E;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  background: #ff4d6d;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(249, 112, 126, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scan-section {
  text-align: center;
}

.scan-status {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 25px;
  transition: all 0.3s;
}

.scan-status.waiting {
  background: #f0f9ff;
  border: 2px dashed #bae6fd;
}

.scan-status.success {
  background: #dcfce7;
  border: 2px solid #86efac;
}

.scan-status.error {
  background: #fee2e2;
  border: 2px solid #fca5a5;
}

.scan-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.scan-status h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.scan-submessage {
  color: #64748b;
  font-size: 0.95rem;
}

.preview-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  text-align: left;
}

.preview-box h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .label {
  color: #64748b;
  font-size: 0.9rem;
}

.preview-item .value {
  font-weight: 600;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.success-section {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-section h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #16a34a;
  margin-bottom: 10px;
}

.success-section p {
  color: #64748b;
  margin-bottom: 8px;
}

.card-id {
  font-family: monospace;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  display: inline-block;
  margin: 15px 0;
  font-size: 0.9rem;
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 0.9rem;
  text-align: center;
}

.page-footer {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .register-card {
    padding: 25px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
