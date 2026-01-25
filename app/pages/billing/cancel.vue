<script setup lang="ts">
useHead({ title: "Zahlung abgebrochen" })
</script>

<template>
  <div style="max-width: 720px; margin: 40px auto; padding: 16px; font-family: system-ui;">
    <h1>❌ Zahlung abgebrochen</h1>
    <p>Du hast den Checkout abgebrochen. Du kannst es jederzeit erneut versuchen.</p>

    <div style="margin-top: 18px;">
      <NuxtLink to="/preise" style="text-decoration: underline;">Zurück zur Paket-Auswahl</NuxtLink>
    </div>
  </div>
</template>
