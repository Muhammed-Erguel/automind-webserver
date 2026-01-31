import { defineStore } from 'pinia'

export type TenantRole = 'owner' | 'admin' | 'member'

export type TenantItem = {
  tenant_id: string
  tenant_name: string
  role: TenantRole
}

export const useTenantStore = defineStore('tenant', () => {
  const supabase = useSupabaseClient()

  const tenants = ref<TenantItem[]>([])
  const currentTenantId = ref<string | null>(null)

  const currentTenant = computed(() => {
    if (!currentTenantId.value) return null
    return tenants.value.find(t => t.tenant_id === currentTenantId.value) ?? null
  })

  const isLoaded = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setCurrentTenant(id: string) {
    currentTenantId.value = id
    if (process.client) localStorage.setItem('currentTenantId', id)
  }

  function restoreTenant() {
    if (!process.client) return
    const saved = localStorage.getItem('currentTenantId')
    if (saved) currentTenantId.value = saved
  }

  async function loadTenants() {
    loading.value = true
    error.value = null
    try {
      const { data, error } = await (supabase as any).rpc('get_my_tenants')

      if (error) throw error

      const mapped: TenantItem[] = (data ?? []).map((row: any) => ({
        tenant_id: row.tenant_id,
        role: row.role,
        tenant_name: row.tenant_name,
      }))

      tenants.value = mapped
      isLoaded.value = true

      restoreTenant()

      // Default tenant setzen
      if (!currentTenantId.value || !mapped.some(t => t.tenant_id === currentTenantId.value)) {
        if (mapped[0]) setCurrentTenant(mapped[0].tenant_id)
      }
    } catch (err: any) {
      error.value = err?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    tenants.value = []
    currentTenantId.value = null
    isLoaded.value = false
    loading.value = false
    error.value = null
    if (process.client) localStorage.removeItem('currentTenantId')
  }

  async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session?.access_token ?? null
}

  async function callEdgeFunction(name: string, payload: any) {
    const token = await getAccessToken()
    const config = useRuntimeConfig();
    console.log(config.url);

    if (!token) throw new Error('Nicht eingeloggt (keine Session).')

    const res = await fetch(
      `${config.url}/functions/v1/${name}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.error || data?.message || JSON.stringify(data))
    }
    return data
  }

  async function updateMemberRole(args: {
    tenantId: string | null
    userId: string
    role: 'member' | 'admin'
  }) {
    const { tenantId, userId, role } = args
    if (!tenantId || !userId) throw new Error('tenantId und userId sind erforderlich')
    return await callEdgeFunction('member-update-role', { tenantId, userId, role })
  }

  async function removeMember(args: { tenantId: string; userId: string }) {
    const { tenantId, userId } = args
    if (!tenantId || !userId) throw new Error('tenantId und userId sind erforderlich')
    return await callEdgeFunction('member-remove', { tenantId, userId })
  }


  return {
    tenants,
    currentTenantId,
    currentTenant,
    isLoaded,
    loading,
    error,
    loadTenants,
    setCurrentTenant,
    reset,
    updateMemberRole,
    removeMember
  }
})
