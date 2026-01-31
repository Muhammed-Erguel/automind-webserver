import { defineStore } from "pinia";
import { useTenantStore } from "./tenant";

export type SubscriptionData = {
  status: string;
  plan_id: string;
  plan_name?: string;
  current_period_end?: string | null;
  price_cents?: number | null;

  // ✅ neu (für Kündigung)
  cancel_at?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
};

export const useSubscriptionStore = defineStore("subscription", () => {
  const supabase = useSupabaseClient();
  const tenantStore = useTenantStore();

  const subscription = ref<SubscriptionData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ✅ Active: Stripe-status active/trialing => aktiv nutzbar
  const isActive = computed(() => {
    const s = subscription.value?.status;
    return s === "active" || s === "trialing";
  });

  // ✅ Für UI: "läuft noch bis" (nimmt cancel_at, sonst current_period_end)
  const endsAt = computed(() => {
    const sub = subscription.value;
    return sub?.cancel_at ?? sub?.current_period_end ?? null;
  });

  // ✅ Für UI: gekündigt aber läuft noch
  const isCanceling = computed(() => {
    const sub = subscription.value;
    return !!sub?.cancel_at_period_end;
  });

  async function loadSubscription() {
    const tenantId = tenantStore.currentTenantId;
    if (!tenantId) return;

    loading.value = true;
    error.value = null;

    try {
      const { data, error: e } = await supabase
        .from("subscriptions")
        .select(
          `
          status,
          plan_id,
          current_period_end,
          cancel_at,
          cancel_at_period_end,
          canceled_at,
          plans(name, price_cents)
        `
        )
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (e) throw e;

      const row = data as any;

      if (!row) {
        subscription.value = null;
        return;
      }

      subscription.value = {
        status: row.status,
        plan_id: row.plan_id,
        current_period_end: row.current_period_end ?? null,

        // ✅ neu
        cancel_at: row.cancel_at ?? null,
        cancel_at_period_end: row.cancel_at_period_end ?? false,
        canceled_at: row.canceled_at ?? null,

        plan_name: row.plans?.name,
        price_cents: row.plans?.price_cents ?? null,
      };
    } catch (err: any) {
      error.value = err?.message ?? String(err);
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    subscription.value = null;
    loading.value = false;
    error.value = null;
  }

  // automatisch neu laden, wenn Tenant wechselt
  watch(
    () => tenantStore.currentTenantId,
    async () => {
      subscription.value = null;
      await loadSubscription();
    }
  );

  return {
    subscription,
    isActive,
    isCanceling,
    endsAt,
    loading,
    error,
    loadSubscription,
    reset,
  };
});
