<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const ready = ref(false)

onMounted(async () => {
  await supabase.auth.getSession()
  ready.value = true

  if (!user.value) {
    await navigateTo('/login')
  }
})
</script>

<template>
  <div v-if="ready">
    <h1>Dashboard: Eingeloggt als {{ user?.email }}</h1>
  </div>
</template>
