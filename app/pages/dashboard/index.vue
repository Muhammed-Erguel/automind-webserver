<script setup lang="ts">
const showInviteModal = ref(false)

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const session = useSupabaseSession()

const authStore = useAuthStore()
const tenantStore = useTenantStore()
const subStore = useSubscriptionStore()
const autoStore = useAutomationsStore()

const canManageMembers = computed(() => {
  const role = tenantStore.currentTenant?.role
  return role === 'admin' || role === 'owner'
})

const ready = ref(false)

const logout = async () => {
  await supabase.auth.signOut()
  authStore.logged = false
  tenantStore.reset()
  subStore.reset()
  autoStore.reset()
  await navigateTo('/')
}

const refreshAll = async () => {
  await tenantStore.loadTenants()
  await subStore.loadSubscription()
  await autoStore.loadAutomations()
}

onMounted(async () => {
  await supabase.auth.getSession()

  if (!user.value) {
    await navigateTo('/')
    return
  }

  await refreshAll()
  ready.value = true
})
</script>

<template>
  <div v-if="ready" class="page">
    <!-- HEADER -->
    <header class="topbar">
      <div class="left">
        <div class="title">Dashboard</div>

        <div v-if="tenantStore.currentTenant" class="workspace">
          <div class="label">Workspace</div>
          <div class="row">
            <select
              class="select"
              :value="tenantStore.currentTenantId ?? ''"
              @change="tenantStore.setCurrentTenant(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="t in tenantStore.tenants" :key="t.tenant_id" :value="t.tenant_id">
                {{ t.tenant_name }}
              </option>
            </select>

            <span class="badge">{{ tenantStore.currentTenant.role }}</span>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="user">
          <div class="label">Eingeloggt als</div>
          <div class="email">{{ user?.email }}</div>
        </div>

        <button
          v-if="canManageMembers"
          class="btn"
          :disabled="!tenantStore.currentTenantId"
          @click="showInviteModal = true"
        >
            Mitglieder
        </button>

        <button class="btn btn-danger" @click="logout">Abmelden</button>

        <InviteMemberModal
          v-model="showInviteModal"
          :tenant-id="tenantStore.currentTenantId"
          @created="() => {}"
        />
      </div>
    </header>

    <!-- BODY -->
    <main class="main">
      <!-- Subscription Card -->
      <section class="card" v-if="canManageMembers">
        <div class="card-title">Abo</div>

        <div v-if="subStore.loading">Lade Abo…</div>

        <div v-else-if="!tenantStore.currentTenantId">
          Kein Workspace ausgewählt.
        </div>

        <div v-else-if="subStore.error" class="error">
          {{ subStore.error }}
        </div>

        <div v-else-if="!subStore.subscription">
          <div class="muted">Keine Subscription gefunden.</div>
        </div>

        <div v-else class="sub-grid">
          <div>
            <div class="label">Status</div>
            <div class="big">{{ subStore.subscription.status }}</div>
          </div>
          <div>
            <div class="label">Plan</div>
            <div class="big">{{ subStore.subscription.plan_name ?? subStore.subscription.plan_id }}</div>
          </div>
          <div v-if="subStore.subscription.current_period_end">
            <div class="label">Läuft bis</div>
            <div class="big">{{ subStore.subscription.current_period_end }}</div>
          </div>
        </div>

        <div v-if="subStore.subscription && !subStore.isActive" class="paywall">
          <div class="paywall-title">Zugriff eingeschränkt</div>
          <div class="muted">
            Dein Abo ist nicht aktiv. Bitte upgraden, um Automationen und Chatbot zu nutzen.
          </div>
          <button class="btn">Upgrade</button>
        </div>
      </section>

      <!-- Automations -->
      <section class="card">
        <div class="card-title">Automationen</div>

        <div v-if="autoStore.loading">Lade Automationen…</div>

        <div v-else-if="autoStore.error" class="error">
          {{ autoStore.error }}
        </div>

        <div v-else-if="autoStore.automations.length === 0" class="muted">
          Keine Automationen vorhanden.
        </div>

        <div v-else class="grid">
          <div v-for="a in autoStore.automations" :key="a.automation_id" class="automation">
            <div class="automation-top">
              <div class="automation-name">{{ a.name }}</div>

              <span
                class="status"
                :class="{
                  locked: !a.allowed_by_plan,
                  enabled: a.allowed_by_plan && a.is_enabled,
                  disabled: a.allowed_by_plan && !a.is_enabled
                }"
              >
                <template v-if="!a.allowed_by_plan">🔒 gesperrt</template>
                <template v-else-if="a.is_enabled">🟢 aktiv</template>
                <template v-else>⚪ inaktiv</template>
              </span>
            </div>

            <div class="automation-desc">{{ a.description }}</div>

            <div class="automation-actions">
              <NuxtLink
                class="btn btn-secondary"
                :to="`/dashboard/automation/${a.automation_id}`"
              >
                Öffnen
              </NuxtLink>

              <button
                class="btn"
                :disabled="!a.allowed_by_plan || !subStore.isActive"
                title="Aktivieren/Provisionieren kommt als nächstes (Edge Function → n8n)"
              >
                Aktivieren
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div v-else class="page">
    <div class="muted">Lade…</div>
  </div>
</template>

<style scoped>
.page {
  padding: 18px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #e7e7e7;
  border-radius: 14px;
  margin-bottom: 16px;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.left, .right {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.right {
  align-items: center;
}

.workspace .row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.select {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  min-width: 260px;
}

.badge {
  font-size: 12px;
  border: 1px solid #e7e7e7;
  padding: 6px 10px;
  border-radius: 999px;
}

.user .email {
  font-weight: 600;
}

.label {
  font-size: 12px;
  opacity: 0.7;
}

.main {
  display: grid;
  gap: 16px;
}

.card {
  border: 1px solid #e7e7e7;
  border-radius: 14px;
  padding: 16px;
}

.card-title {
  font-weight: 700;
  margin-bottom: 12px;
}

.sub-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.big {
  font-size: 16px;
  font-weight: 700;
}

.paywall {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  border: 1px dashed #e7e7e7;
}

.paywall-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.automation {
  border: 1px solid #e7e7e7;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.automation-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.automation-name {
  font-weight: 700;
}

.automation-desc {
  opacity: 0.8;
  font-size: 13px;
  line-height: 1.4;
}

.status {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e7e7e7;
  white-space: nowrap;
}

.status.enabled { }
.status.disabled { }
.status.locked { opacity: 0.8; }

.automation-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  background: white;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #fff;
  border-color: #ffb3b3;
}

.btn-secondary {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.error {
  color: #b00020;
}

.muted {
  opacity: 0.7;
}

@media (max-width: 900px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }
  .right {
    justify-content: space-between;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .sub-grid {
    grid-template-columns: 1fr;
  }
  .select {
    width: 100%;
    min-width: 0;
  }
}
</style>
