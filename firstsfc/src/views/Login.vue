<template>
  <div class="login-container">
    <div class="card">
      <form @submit.prevent="handleLogin">
        <img src="/logo.png" class="logo">
        <h1>Admin Login</h1>
        <p class="dashboard-title">Usher’s Ministry – Attendance Dashboard</p>
        
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="input_field">
          <input type="email" v-model="email" placeholder="Username" required>
        </div>
        
        <div class="input_field">
          <input type="password" v-model="password" placeholder="Password" required>
        </div>
        
        <button type="submit" class="btn">Access Dashboard</button>
      </form>
    </div>
    
    <footer class="login-footer">
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

.logo{
  display: center;
  justify-content:center;
  text-align:center;
  height:180px;
  width:180px;
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