<template>
  <div class="page">
    <div class="container">
      <div class="card">
        <h1>Paket auswählen</h1>
        <p class="sub">Wähle das passende Paket aus. Du kannst später jederzeit wechseln.</p>

        <div class="plans">
          <button
            v-for="p in stripeStore.plans"
            :key="p.id"
            class="plan"
            :class="{
              selected: selected === p.id,
              active: stripeStore.currentPlanId === p.id && stripeStore.isActive,
            }"
            type="button"
            @click="selected = p.id"
          >
            <div class="plan-top">
              <div>
                <div class="plan-name">{{ p.name }}</div>
                <div class="plan-desc">
                  <!-- Optional: du kannst später plan description aus DB holen -->
                  {{ planDesc(p.id) }}
                </div>
              </div>

              <div class="plan-price">
                €{{ (p.price_cents / 100).toFixed(0) }}<span>/Monat</span>
              </div>
            </div>

            <ul class="plan-list">
              <!-- Optional: später aus DB/Config -->
              <li v-for="(f, idx) in planFeatures(p.id)" :key="idx">✓ {{ f }}</li>
            </ul>
          </button>
        </div>

        <button
          class="btn"
          :disabled="!canCheckout"
          @click="goToCheckout"
        >
          {{ checkoutButtonLabel }}
        </button>

        <p v-if="stripeStore.error" class="error">{{ stripeStore.error }}</p>
        <p v-else-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

useHead({ title: "Paket auswählen" });

const user = useSupabaseUser();
const tenantStore = useTenantStore();
const stripeStore = useStripeStore();

const supabase = useSupabaseClient()

const selected = ref<string>(""); // wird nach Laden gesetzt
const error = ref("");

const currentTenantId = computed(() => tenantStore.currentTenantId);

const canCheckout = computed(() => {
  if (stripeStore.loading) return false;
  if (!selected.value) return false;
  if (!user.value) return true; // dann leiten wir zur Login Page um
  // wenn schon aktiv auf gleichem Plan -> kein Checkout nötig
  if (stripeStore.isActive && stripeStore.currentPlanId === selected.value) return false;
  if (!currentTenantId.value) return false;
  return true;
});

const checkoutButtonLabel = computed(() => {
  if (!user.value) return "Einloggen & abonnieren";
  if (stripeStore.loading) return "Bitte warten...";
  if (stripeStore.isActive && stripeStore.currentPlanId === selected.value) return "Aktives Paket";
  return "Jetzt abonnieren";
});

onMounted(async () => {
  await supabase.auth.getSession()

  if (!user.value) {
    await navigateTo("/login")
    return
  }

  if (!tenantStore.isLoaded || !tenantStore.currentTenantId) {
    await tenantStore.loadTenants()
  }

  await stripeStore.fetchPlans();

  await stripeStore.fetchSubscriptionForTenant(currentTenantId.value);

  if (!selected.value) {
    selected.value = stripeStore.currentPlanId || stripeStore.plans[0]?.id || "";
  }
});

async function goToCheckout() {
  error.value = "";

  if (!user.value) {
    await navigateTo("/login");
    return;
  }

  if (!selected.value) return;

  try {
    // Start hosted Stripe checkout via Edge Function
    await stripeStore.startCheckout(selected.value);
  } catch (e: any) {
    error.value = e?.message ?? "Checkout konnte nicht gestartet werden.";
  }
}

/**
 * OPTIONAL: Features/Descriptions lokal mappen (bis du es in DB speicherst)
 * Du kannst das später 1:1 durch DB Felder ersetzen.
 */
function planDesc(planId: string) {
  if (planId === "starter") return "Für den Einstieg";
  if (planId === "pro") return "Für Power-User";
  if (planId === "business") return "Für Teams";
  return "Paket";
}

function planFeatures(planId: string) {
  if (planId === "starter") return ["X Tokens / Monat", "KI-Listings & Texte", "Basis-Support"];
  if (planId === "pro") return ["Mehr Tokens / Monat", "Bulk-Lister", "Tracker & Monitoring", "Priorisierter Support"];
  if (planId === "business") return ["Maximale Tokens", "Team-Funktionen", "Onboarding"];
  return ["Features"];
}
</script>

<style scoped>
/* dein CSS bleibt exakt wie es ist */
.page {
  min-height: calc(100vh - 72px);
  display: flex;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(255, 106, 0, 0.09), transparent 55%),
    linear-gradient(180deg, #fff, #fff);
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  width: min(760px, 100%);
  padding: 28px 16px 64px;
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 10px 0 18px;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.step .label {
  font-weight: 800;
  color: rgba(0, 0, 0, 0.85);
  white-space: nowrap;
}

.dot {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  background: #ff6a00;
  color: white;
}

.line {
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  flex: 1;
  margin-left: 8px;
}

.done .dot {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.6);
}
.done .label {
  color: rgba(0, 0, 0, 0.55);
}

/* Card */
.card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 18px;
  padding: 22px 22px 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
}

h1 {
  margin: 6px 0 6px;
  text-align: center;
  font-size: 26px;
  color: rgba(0, 0, 0, 0.9);
}

.sub {
  text-align: center;
  margin: 0 0 18px;
  color: rgba(0, 0, 0, 0.6);
}

/* Plans */
.plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 14px 0 18px;
}

.plan {
  position: relative;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: white;
  padding: 14px 14px 12px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
}

.plan:hover {
  border-color: rgba(255, 106, 0, 0.35);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}

.plan.selected {
  border-color: rgba(255, 106, 0, 0.75);
  box-shadow: 0 0 0 4px rgba(255, 106, 0, 0.12), 0 12px 24px rgba(0,0,0,0.08);
}

.plan-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 10px;
}

.plan-name {
  font-weight: 900;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.9);
}

.plan-desc {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.plan-price {
  font-weight: 900;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.88);
  white-space: nowrap;
}
.plan-price span {
  font-weight: 700;
  font-size: 12px;
  color: rgba(0,0,0,0.55);
  margin-left: 3px;
}

.plan-list {
  margin: 0;
  padding-left: 18px;
  color: rgba(0,0,0,0.75);
  font-size: 13px;
  line-height: 1.6;
}

/* Button */
.btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: #ff6a00;
  color: white;
  font-weight: 900;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Links + feedback */
.link {
  color: #ff6a00;
  text-decoration: none;
  font-weight: 800;
}
.link:hover { text-decoration: underline; }

.error {
  margin: 10px 0 0;
  color: #c1121f;
  font-weight: 800;
  text-align: center;
}

.back {
  margin-top: 14px;
  text-align: center;
}

/* Responsive */
@media (max-width: 900px) {
  .plans {
    grid-template-columns: 1fr;
  }
  .container {
    width: min(520px, 100%);
  }
}

@media (max-width: 420px) {
  .card { padding: 18px 16px; }
  h1 { font-size: 22px; }
  .line { display: none; }
}
</style>
