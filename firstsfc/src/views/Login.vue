<template>
  <div class="card">
    <form @submit.prevent="handleLogin">
      <h1>Admin Login</h1>
      <p class="dashboard-title">Usher’s Ministry – Attendance Dashboard</p>
      
      <p v-if="errorMessage" style="color: #F9707E; font-size: 0.8rem; margin-bottom: 10px;">
        {{ errorMessage }}
      </p>

      <div class="input_field">
        <input type="email" v-model="email" placeholder="Admin Email" required>
      </div>
      
      <div class="input_field">
        <input type="password" v-model="password" placeholder="Password" required>
      </div>
      
      <button type="submit" class="btn">Access Dashboard</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();
const email = ref(''); // Changed from username to email for Supabase Auth
const password = ref('');
const errorMessage = ref('');

// Initialize Supabase (Use your actual project credentials)
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

const handleLogin = async () => {
  errorMessage.value = '';
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMessage.value = "Invalid login credentials.";
  } else {
    // Successful login redirects to Dashboard
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.card {
    width: 420px;
    padding: 40px;
    background: white;
    border-radius: 30px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    text-align: center;
}

.card h1 {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #000;
}

.dashboard-title {
    font-size: 0.9rem;
    margin-bottom: 2rem;
    color: #555;
}

.input_field {
    margin: 15px 0;
    width: 100%;
}

.input_field input {
    height: 50px;
    width: 100%;
    padding: 0 15px;
    font-size: 16px;
    background-color: #f8f9fa;
    border: 1px solid #f8f9fa;
    border-radius: 12px;
    outline: none;
    text-align: center;
}

.btn {
    width: 100%;
    height: 50px;
    background: #F9707E;
    border: none;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    border-radius: 15px;
    margin-top: 10px;
    cursor: pointer;
    box-shadow: 0 5px 10px rgba(249, 112, 126, 0.3);
}

.btn:hover {
    background: #ff4d6d;
}
</style>