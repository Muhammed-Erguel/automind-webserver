<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  tenantId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'created'): void
}>()

const session = useSupabaseSession()
const tenantStore = useTenantStore()
const supabase = useSupabaseClient()

type Tab = 'members' | 'invites'
const tab = ref<Tab>('members')

// Invite create form
const email = ref('')
const role = ref<'member' | 'admin'>('member')

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const inviteLink = ref<string | null>(null)

const canManageMembers = computed(() => {
  const r = tenantStore.currentTenant?.role
  return r === 'admin' || r === 'owner'
})

const formatDateDE = (iso: string) => {
  return new Date(iso).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const updateRole = async (userId: string, newRole: 'member' | 'admin') => {
  errorMsg.value = null
  successMsg.value = null
  const tid = props.tenantId

  loading.value = true
  try {
    await tenantStore.updateMemberRole({ tenantId: tid, userId, role: newRole })
    await loadMembers()
    successMsg.value = 'Rolle aktualisiert ✅'
  } finally {
    loading.value = false
  }
}

const removeMember = async (userId: string, email?: string) => {
  errorMsg.value = null
  successMsg.value = null
  const tid = props.tenantId

  if (!tid) return

  if (!confirm(`Mitglied entfernen: ${email ?? userId} ?`)) return

  loading.value = true
  try {
    await tenantStore.removeMember({ tenantId: tid, userId })
    successMsg.value = 'Mitglied entfernt ✅'
    await loadMembers()
  } finally {
    loading.value = false
  }
}
// Lists
const members = ref<Array<{ user_id: string; email: string; role: string; created_at?: string }>>([])
const invites = ref<Array<{ id: string; email: string; role: string; status: string; expires_at?: string; created_at?: string }>>([])

const close = () => {
  emit('update:modelValue', false)
  tab.value = 'members'
  email.value = ''
  role.value = 'member'
  loading.value = false
  errorMsg.value = null
  successMsg.value = null
  inviteLink.value = null
  members.value = []
  invites.value = []
}

const onBackdrop = (e: MouseEvent) => {
  if ((e.target as HTMLElement).dataset.backdrop === '1') close()
}

const tidOrError = () => {
  const tid = props.tenantId
  if (!tid) {
    errorMsg.value = 'Kein Workspace ausgewählt.'
    return null
  }
  return tid
}

const loadMembers = async () => {
  const tid = tidOrError()
  if (!tid) return

  loading.value = true
  errorMsg.value = null
  try {
    const { data, error } = await supabase
      .from('tenant_members')
      .select('user_id, email, role, created_at')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: true })

    if (error) throw error
    members.value = data ?? []
  } catch (e: any) {
    errorMsg.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

const loadInvites = async () => {
  const tid = tidOrError()
  if (!tid) return

  loading.value = true
  errorMsg.value = null
  try {
    const { data, error } = await supabase
      .from('tenant_invites')
      .select('id, email, role, status, expires_at, created_at')
      .eq('tenant_id', tid)
      .order('created_at', { ascending: false })

    if (error) throw error
    invites.value = data ?? []
  } catch (e: any) {
    errorMsg.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    // beim Öffnen default: members laden
    await loadMembers()
  }
)

watch(
  () => props.tenantId,
  async () => {
    if (!props.modelValue) return
    // workspace wechsel im offenen modal
    if (tab.value === 'members') await loadMembers()
    else await loadInvites()
  }
)

const switchTab = async (t: Tab) => {
  tab.value = t
  errorMsg.value = null
  successMsg.value = null
  inviteLink.value = null

  if (t === 'members') await loadMembers()
  else await loadInvites()
}

const createInvite = async () => {
  errorMsg.value = null
  successMsg.value = null
  inviteLink.value = null

  const tid = tidOrError()
  if (!tid) return

  const token = session.value?.access_token
  if (!token) {
    errorMsg.value = 'Nicht eingeloggt.'
    return
  }

  const cleanedEmail = email.value.trim().toLowerCase()
  if (!cleanedEmail || !cleanedEmail.includes('@')) {
    errorMsg.value = 'Bitte eine gültige E-Mail eingeben.'
    return
  }

  loading.value = true
  try {
    const { data, error } = await supabase.functions.invoke('invite-create', {
      body: { tenantId: tid, email: cleanedEmail, role: role.value },
    })

    if (error) {
      errorMsg.value = error.message
      return
    }

    inviteLink.value = data.inviteLink
    successMsg.value = 'Einladung erstellt.'
    emit('created')

    // invites liste neu laden
    await loadInvites()
  } catch (e: any) {
    errorMsg.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  if (!inviteLink.value) return
  await navigator.clipboard.writeText(inviteLink.value)
  successMsg.value = 'Link kopiert ✅'
}
</script>

<template>
  <div v-if="modelValue" class="modal-root" data-backdrop="1" @click="onBackdrop">
    <div class="modal">
      <div class="modal-header">
        <div>
          <div class="title">Workspace</div>
          <div class="subtitle" v-if="tenantStore.currentTenant">
            <b>{{ tenantStore.currentTenant.tenant_name }}</b>
          </div>
        </div>

        <button class="icon-btn" @click="close" aria-label="Close">✕</button>
      </div>

      <!-- ✅ Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'members' }" @click="switchTab('members')">
          Mitglieder
        </button>
        <button class="tab" :class="{ active: tab === 'invites' }" @click="switchTab('invites')">
          Einladungen
        </button>
      </div>

      <div class="modal-body">
        <div v-if="errorMsg" class="msg error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="msg success">{{ successMsg }}</div>

        <!-- MEMBERS -->
        <template v-if="tab === 'members'">
          <div v-if="loading" class="muted">Lade Mitglieder…</div>

          <div v-else-if="members.length === 0" class="muted">
            Keine Mitglieder gefunden.
          </div>

          <div v-else class="list">
            <div v-for="m in members" :key="m.user_id" class="row">
              <div class="main">
                <div class="primary">{{ m.email || m.user_id }}</div>
                <div class="secondary" v-if="m.created_at">seit {{ formatDateDE(m.created_at) }}</div>
              </div>

              <div class="actions">
                <span class="badge">{{ m.role }}</span>

                <template v-if="canManageMembers && m.role !== 'owner'">
                  <select
                    class="role-select"
                    :value="m.role"
                    @change="updateRole(m.user_id, ($event.target as HTMLSelectElement).value as any)"
                    :disabled="loading"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>

                  <button class="btn btn-danger" :disabled="loading" @click="removeMember(m.user_id, m.email)">
                    Entfernen
                  </button>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- INVITES -->
        <template v-else>
          <!-- Create invite -->
          <div class="section">
            <div class="section-title">Neue Einladung</div>

            <label class="label">E-Mail</label>
            <input v-model="email" class="input" placeholder="kollege@firma.de" />

            <label class="label" style="margin-top:12px;">Rolle</label>
            <select v-model="role" class="input">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <div style="margin-top: 12px; display:flex; gap:10px;">
              <button class="btn" :disabled="loading" @click="createInvite">
                {{ loading ? 'Erstelle…' : 'Einladung erstellen' }}
              </button>
            </div>

            <div v-if="inviteLink" class="invite-box">
              <div class="label">Invite-Link</div>
              <div class="link-row">
                <input class="input" :value="inviteLink" readonly />
                <button class="btn" @click="copyLink">Kopieren</button>
              </div>
            </div>
          </div>

          <!-- List invites -->
          <div class="section" style="margin-top: 14px;">
            <div class="section-title">Invites</div>

            <div v-if="loading" class="muted">Lade Invites…</div>

            <div v-else-if="invites.length === 0" class="muted">
              Keine Invites vorhanden.
            </div>

            <div v-else class="list">
              <div v-for="i in invites" :key="i.id" class="row">
                <div class="main">
                  <div class="primary">{{ i.email }}</div>
                  <div class="secondary">
                    Rolle: {{ i.role }} · Status: {{ i.status }}
                    <span v-if="i.expires_at">· bis {{ formatDateDE(i.expires_at) }}</span>
                  </div>
                </div>
                <span class="badge">{{ i.status }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">Schließen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.role-select {
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  padding: 8px 10px;
  background: #fff;
}

.btn-danger {
  border-color: #ffb3b3;
}

.modal-root {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: grid;
  place-items: center;
  z-index: 9999;
  padding: 16px;
}

.modal {
  width: min(680px, 100%);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e7e7e7;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}

.title { font-weight: 800; font-size: 16px; }
.subtitle { font-size: 12px; opacity: 0.75; margin-top: 2px; }

.icon-btn {
  border: 1px solid #e7e7e7;
  background: #fff;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
}

.tab {
  border: 1px solid #e7e7e7;
  background: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  opacity: 0.85;
}
.tab.active {
  opacity: 1;
  font-weight: 700;
}

.modal-body { padding: 16px; }

.section-title {
  font-weight: 800;
  margin-bottom: 10px;
}

.label { font-size: 12px; opacity: 0.75; display:block; margin-bottom: 6px; }

.input {
  width: 100%;
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  padding: 10px 12px;
}

.msg {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  font-size: 13px;
}
.error { color: #b00020; border-color: #ffcccc; }
.success { color: #137333; border-color: #ccebd5; }

.invite-box {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed #e7e7e7;
  border-radius: 14px;
}

.link-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  border: 1px solid #e7e7e7;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.main { display: flex; flex-direction: column; gap: 4px; }
.primary { font-weight: 700; }
.secondary { font-size: 12px; opacity: 0.75; }

.badge {
  font-size: 12px;
  border: 1px solid #e7e7e7;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.btn {
  border: 1px solid #e7e7e7;
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}
.btn-secondary { opacity: 0.85; }

.muted { opacity: 0.7; }
</style>
