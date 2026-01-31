import { defineStore } from "pinia";

export type Plan = {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
  stripe_price_id?: string | null;
  created_at?: string;
};

export type SubscriptionRow = {
  tenant_id: string;
  plan_id: string;
  status: string; // active | trialing | past_due | canceled | ...
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

function isSubActive(status?: string | null) {
  return status === "active" || status === "trialing";
}

export const useStripeStore = defineStore("stripe", () => {
  const supabase = useSupabaseClient();
  const tenantStore = useTenantStore(); // nutzt deinen bestehenden Store

  const plans = ref<Plan[]>([]);
  const subscription = ref<SubscriptionRow | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);
  const isLoaded = ref(false);

  const currentTenantId = computed(() => tenantStore.currentTenantId);

  const isActive = computed(() => isSubActive(subscription.value?.status));

  const currentPlanId = computed(() => subscription.value?.plan_id ?? null);

  const currentPeriodEnd = computed(() => subscription.value?.current_period_end ?? null);

  async function getAccessToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session?.access_token ?? null;
  }

  async function callEdgeFunction(name: string, payload: any) {
    const config = useRuntimeConfig();
    console.log(config.url);

    const token = await getAccessToken();
    if (!token) throw new Error("Nicht eingeloggt (keine Session).");

    const res = await fetch(
      `${config.url}/functions/v1/${name}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || data?.message || JSON.stringify(data));
    }
    return data;
  }

  async function fetchPlans() {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("plans")
        .select("id,name,price_cents,currency,created_at,stripe_price_id")
        .order("price_cents", { ascending: true });

      if (err) throw err;
      plans.value = (data ?? []) as Plan[];
    } catch (e: any) {
      error.value = e?.message ?? String(e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchSubscriptionForTenant(tenantId?: string | null) {
    const tid = tenantId ?? currentTenantId.value;
    if (!tid) {
      subscription.value = null;
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("subscriptions")
        .select(
          "tenant_id,plan_id,status,current_period_end,stripe_customer_id,stripe_subscription_id",
        )
        .eq("tenant_id", tid)
        .maybeSingle();

      if (err) throw err;
      subscription.value = (data ?? null) as SubscriptionRow | null;
      isLoaded.value = true;
    } catch (e: any) {
      error.value = e?.message ?? String(e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Startet Stripe Checkout (Hosted) für ein Abo.
   * Erwartet Edge Function: create-checkout-session
   * Rückgabe: { url: string }
   */
  async function startCheckout(planId: string | undefined) {
    if (planId === undefined) throw new Error("Kein planId ausgewählt"); 
    const tid = currentTenantId.value;
    if (!tid) throw new Error("Kein Tenant ausgewählt.");

    loading.value = true;
    error.value = null;

    try {
      const data = await callEdgeFunction("create-checkout-session", {
        tenant_id: tid,
        plan_id: planId,
      });

      if (!data?.url) throw new Error("create-checkout-session hat keine url zurückgegeben.");

      // Redirect zu Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      error.value = e?.message ?? String(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function startCancel(planId: string | undefined) {
    if (planId === undefined) throw new Error("Kein planId ausgewählt"); 
    const tid = currentTenantId.value;
    if (!tid) throw new Error("Kein Tenant ausgewählt.");

    loading.value = true;
    error.value = null;

    try {
      const data = await callEdgeFunction("cancel-subscription", {
        tenant_id: tid,
        plan_id: planId,
      });

      if (!data?.url) throw new Error("cancel-subscription hat keine url zurückgegeben.");

      // Redirect zu Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      error.value = e?.message ?? String(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Nach /billing/success aufrufen, um DB-Status neu zu holen.
   * (Webhook ist async -> kleine Verzögerung hilft)
   */
  async function refreshAfterCheckout() {
    const tid = currentTenantId.value;
    if (!tid) return;
    await new Promise((r) => setTimeout(r, 800));
    await fetchSubscriptionForTenant(tid);
  }

  function reset() {
    plans.value = [];
    subscription.value = null;
    loading.value = false;
    error.value = null;
    isLoaded.value = false;
  }

  // Optional: automatisch neu laden, wenn Tenant wechselt
  watch(
    () => tenantStore.currentTenantId,
    async (tid) => {
      if (!tid) {
        subscription.value = null;
        return;
      }
      await fetchSubscriptionForTenant(tid);
    },
    { immediate: true },
  );

  return {
    // state
    plans,
    subscription,
    loading,
    error,
    isLoaded,

    // derived
    currentTenantId,
    isActive,
    currentPlanId,
    currentPeriodEnd,

    // actions
    fetchPlans,
    fetchSubscriptionForTenant,
    startCheckout,
    refreshAfterCheckout,
    reset,
    startCancel
  };
});
