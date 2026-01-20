import { defineStore } from 'pinia'
import { useTenantStore } from './tenant'

export type AutomationRow = {
  automation_id: string
  code: string
  name: string
  description: string | null
  is_enabled: boolean | null
  allowed_by_plan: boolean
}

export const useAutomationsStore = defineStore('automations', () => {
  const supabase = useSupabaseClient()
  const tenantStore = useTenantStore()

  const automations = ref<AutomationRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadAutomations() {
    const tenantId = tenantStore.currentTenantId
    if (!tenantId) return

    loading.value = true
    error.value = null

    try {
      // Hinweis: das ist die “Dashboard Query” aus deinem Schema
      // Wenn du sie als View in SQL anlegst, wird’s noch cleaner.
      const { data, error: e } = await (supabase as any).rpc('dashboard_automations_for_tenant', {
        tid: tenantId,
      })

      // Falls du (noch) kein RPC/View hast: sag Bescheid, dann ersetze ich dir das durch .from().select() Version.
      if (e) throw e

      automations.value = (data ?? []) as AutomationRow[]
    } catch (err: any) {
      error.value = err?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    automations.value = []
    loading.value = false
    error.value = null
  }

  watch(
    () => tenantStore.currentTenantId,
    async () => {
      automations.value = []
      await loadAutomations()
    }
  )

  return { automations, loading, error, loadAutomations, reset }
})
