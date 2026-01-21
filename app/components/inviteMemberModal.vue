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

const email = ref('')
const role = ref<'member' | 'admin'>('member')

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const inviteLink = ref<string | null>(null)

const close = () => {
  emit('update:modelValue', false)
  // optional reset
  email.value = ''
  role.value = 'member'
  loading.value = false
  errorMsg.value = null
  successMsg.value = null
  inviteLink.value = null
}

const onBackdrop = (e: MouseEvent) => {
  if ((e.target as HTMLElement).dataset.backdrop === '1') close()
}

const createInvite = async () => {
  errorMsg.value = null
  successMsg.value = null
  inviteLink.value = null

  const tid = props.tenantId
  if (!tid) {
    errorMsg.value = 'Kein Workspace ausgewählt.'
    return
  }

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
      body: {
        tenantId: tid,
        email: cleanedEmail,
        role: role.value,
      },
    })

    if (error) {
      console.error('invite error', error)
      errorMsg.value = error.message
      return
    }

    inviteLink.value = data.inviteLink
    successMsg.value = 'Einladung erstellt. Link kann kopiert werden.'
    emit('created')
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
          <div class="title">Mitglied einladen</div>
          <div class="subtitle" v-if="tenantStore.currentTenant">
            Workspace: <b>{{ tenantStore.currentTenant.tenant_name }}</b>
          </div>
        </div>

        <button class="icon-btn" @click="close" aria-label="Close">✕</button>
      </div>

      <div class="modal-body">
        <label class="label">E-Mail</label>
        <input v-model="email" class="input" placeholder="kollege@firma.de" />

        <label class="label" style="margin-top:12px;">Rolle</label>
        <select v-model="role" class="input">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>

        <div v-if="errorMsg" class="msg error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="msg success">{{ successMsg }}</div>

        <div v-if="inviteLink" class="invite-box">
          <div class="label">Invite-Link</div>
          <div class="link-row">
            <input class="input" :value="inviteLink" readonly />
            <button class="btn" @click="copyLink">Kopieren</button>
          </div>
          <div class="hint">
            (Später kannst du hier auch “E-Mail senden” integrieren.)
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">Schließen</button>
        <button class="btn" :disabled="loading" @click="createInvite">
          {{ loading ? 'Erstelle…' : 'Einladen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  width: min(560px, 100%);
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

.modal-body {
  padding: 16px;
}

.label { font-size: 12px; opacity: 0.75; display:block; margin-bottom: 6px; }

.input {
  width: 95%;
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  padding: 10px 12px;
}

.msg {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  font-size: 13px;
}
.error { color: #b00020; border-color: #ffcccc; }
.success { color: #137333; border-color: #ccebd5; }

.invite-box {
  margin-top: 14px;
  padding: 12px;
  border: 1px dashed #e7e7e7;
  border-radius: 14px;
}
.link-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.hint { font-size: 12px; opacity: 0.7; margin-top: 6px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #eee;
}

.btn {
  border: 1px solid #e7e7e7;
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { opacity: 0.85; }
</style>
