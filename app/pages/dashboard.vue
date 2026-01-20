<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const authStore = useAuthStore()

const ready = ref(false)

const logout = async () => {
    await supabase.auth.signOut()
    authStore.logged = false
}

onMounted(async () => {
  await supabase.auth.getSession()
  ready.value = true

  if (!user.value) {
    await navigateTo('/')
  }
})
</script>

<template>
  <div v-if="ready" class="container">
    <h1>Dashboard: Eingeloggt als {{ user?.email }}</h1>
    <div class="button" @click="logout">abmelden</div>
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
  }

  .button {
    background-color: red;
    padding: 20px;
    border-radius: 999px;
    font-weight: 100;
  }
</style>
