<template>
  <div class="card"> [cite: 5]
    <form @submit.prevent="handleLogin"> [cite: 41]
      <h1>Admin Login</h1> 
      <p class="dashboard-title">Usher’s Ministry – Attendance Dashboard</p> 
      
      <div class="input_field"> [cite: 8]
        <input type="text" v-model="username" placeholder="Username" required> [cite: 10, 40]
      </div>
      
      <div class="input_field"> [cite: 8]
        <input type="password" v-model="password" placeholder="Password" required> [cite: 10]
      </div>
      
      <button type="submit" class="btn">Access Dashboard</button> [cite: 13]
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');

const handleLogin = () => {
  // Logic to authenticate goes here
  router.push('/dashboard');
};
</script>

<style scoped>
.card { width: 420px; padding: 40px; background: white; border-radius: 30px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); } 
.btn { width: 100%; height: 50px; background: #F9707E; border: none; border-radius: 15px; color: #fff; font-weight: 600; cursor: pointer; } 
.btn:hover { background: #ff4d6d; transform: translateY(-1px); }
</style>