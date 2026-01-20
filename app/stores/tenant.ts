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

      console.log()

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
  }
})
