<template>
  <div class="login-container">
    <div class="card">
      <form @submit.prevent="handleLogin">
        <img src="/logo.png" class="logo">
        <h1>Admin Login</h1>
        <p class="dashboard-title">Usher’s Ministry – Attendance Dashboard</p>
        
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="input_field">
          <input type="email" v-model="email" placeholder="Email" required>
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

<style scoped src="../assets/main.css"></style>