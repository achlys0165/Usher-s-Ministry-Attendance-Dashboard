<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />

  <footer>
    <p>&copy; 2026 Usher's Ministry. All rights reserved. </p>
  </footer>
</template>

<style>
/* Global styles from your main.css */
@import './assets/main.css';

footer {
    width: 100%;
    padding: 40px 0;
    text-align: center;
}

footer p {
    font-family: 'Poppins', sans-serif;
    font-size: 0.9rem;
    color: #94a3b8;
    letter-spacing: 0.5px;
}
</style>