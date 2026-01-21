<template>
  <div v-if="!authStore.logged">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <div v-else>
    <Dashboard/>
  </div>
</template>

<script setup lang="ts">
import Dashboard from "./pages/dashboard/index.vue"
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore()

</script>
