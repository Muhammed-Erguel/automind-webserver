<script setup lang="ts">
useHead({ title: "Zahlung erfolgreich" })

const route = useRoute()
const tenantStore = useTenantStore()
const subStore = useSubscriptionStore() // oder useStripeStore, je nachdem was du nutzt

const sessionId = computed(() => String(route.query.session_id ?? ""))

onMounted(async () => {
  // Tenant/Subscription neu laden (Webhook braucht evtl. 1–2 Sekunden)
  if (!tenantStore.isLoaded || !tenantStore.currentTenantId) {
    await tenantStore.loadTenants()
  }

  // kleine Verzögerung, weil Stripe Webhook async in DB schreibt
  await new Promise((r) => setTimeout(r, 1200))

  // Subscription refresh (passt zu deinem Dashboard Pattern)
  await subStore.loadSubscription()
})
</script>

<template>
  <div style="max-width: 720px; margin: 40px auto; padding: 16px; font-family: system-ui;">
    <h1>✅ Zahlung erfolgreich</h1>
    <p>Danke! Dein Abo wird jetzt aktiviert.</p>

    <p v-if="sessionId" style="opacity: 0.7; font-size: 12px;">
      Stripe Session: {{ sessionId }}
    </p>
  </div>
</template>
