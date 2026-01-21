<script setup lang="ts">
const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))
const user = useSupabaseUser()
const session = useSupabaseSession()
const supabase = useSupabaseClient()
const auth = useAuthStore()

onMounted(async () => {
  if (!token.value) return navigateTo('/')

  if (!user.value) {
    // Token lokal speichern, damit du nach Login weiter machen kannst
    localStorage.setItem('pendingInviteToken', token.value)
    return navigateTo('/login')
  }

  const accessToken = session.value?.access_token
  const res = await fetch('https://hdzwuhjjdmosfpdvaaou.supabase.co/functions/v1/invite-accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token: token.value }),
  })

  const data = await res.json()
  if (!res.ok) {
    console.error(data)
    return
  }

  auth.logged = true;
})
</script>

<template>
  <div>Invite wird verarbeitet…</div>
</template>
