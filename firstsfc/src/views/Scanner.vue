<template>
  <div class="scanner-container">
    <!-- Hidden input to catch scanner -->
    <form @submit.prevent="handleScan" style="opacity:0; position:absolute;">
      <input
        ref="scannerInput"
        v-model="scanValue"
        autofocus
      />
    </form>

    <div class="card">
      <h2 v-if="status === 'idle'">READY TO TAP CARD</h2>

      <h2 v-if="status === 'success'" class="success">
        Attendance Logged ✅
      </h2>

      <h2 v-if="status === 'error'" class="error">
        Invalid Card ❌
      </h2>

      <h2 v-if="status === 'unknown'" class="warning">
        Unregistered Card ⚠️
      </h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const scanValue = ref('')
const status = ref('idle')
const scannerInput = ref(null)

onMounted(() => {
  scannerInput.value.focus()
})

const handleScan = async () => {
  if (!scanValue.value) return

  const scannedId = scanValue.value
  scanValue.value = ''

  try {
    // call your backend or Supabase
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: scannedId })
    })

    const data = await res.json()
    status.value = data.status   // success | error | unknown
  } catch (e) {
    status.value = 'error'
  }

  setTimeout(() => (status.value = 'idle'), 2500)
}
</script>
