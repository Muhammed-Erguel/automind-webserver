<template>
  <div class="page">
    <div class="container">
      <!-- Stepper -->
      <div class="stepper">
        <div class="step done">
          <div class="dot done">✓</div>
          <div class="label done">Konto erstellen</div>
          <div class="line"></div>
        </div>

        <div class="step active">
          <div class="dot">2</div>
          <div class="label">Paket auswählen</div>
        </div>
      </div>

      <div class="card">
        <h1>Paket auswählen</h1>
        <p class="sub">Wähle das passende Paket aus. Du kannst später jederzeit wechseln.</p>

        <div class="plans">
          <button
            class="plan"
            :class="{ selected: selected === 'starter' }"
            type="button"
            @click="selected = 'starter'"
          >
            <div class="plan-top">
              <div>
                <div class="plan-name">Starter</div>
                <div class="plan-desc">Für den Einstieg</div>
              </div>
              <div class="plan-price">€19<span>/Monat</span></div>
            </div>

            <ul class="plan-list">
              <li>✓ X Tokens / Monat</li>
              <li>✓ KI-Listings & Texte</li>
              <li>✓ Basis-Support</li>
            </ul>
          </button>

          <button
            class="plan"
            :class="{ selected: selected === 'pro' }"
            type="button"
            @click="selected = 'pro'"
          >

            <div class="plan-top">
              <div>
                <div class="plan-name">Pro</div>
                <div class="plan-desc">Für Power-User</div>
              </div>
              <div class="plan-price">€49<span>/Monat</span></div>
            </div>

            <ul class="plan-list">
              <li>✓ Mehr Tokens / Monat</li>
              <li>✓ Bulk-Lister</li>
              <li>✓ Tracker & Monitoring</li>
              <li>✓ Priorisierter Support</li>
            </ul>
          </button>

          <button
            class="plan"
            :class="{ selected: selected === 'business' }"
            type="button"
            @click="selected = 'business'"
          >
            <div class="plan-top">
              <div>
                <div class="plan-name">Business</div>
                <div class="plan-desc">Für Teams</div>
              </div>
              <div class="plan-price">€99<span>/Monat</span></div>
            </div>

            <ul class="plan-list">
              <li>✓ Maximale Tokens</li>
              <li>✓ Team-Funktionen</li>
              <li>✓ Onboarding</li>
            </ul>
          </button>
        </div>

        <button class="btn" :disabled="!selected || isSubmitting" @click="goToCheckout">
          Weiter zur Zahlung
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <p class="back">
          <NuxtLink class="link" to="/register">← Zurück</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

useHead({ title: "Paket auswählen" });

const selected = ref<"starter" | "pro" | "business" | "">("pro");
const isSubmitting = ref(false);
const error = ref("");

async function goToCheckout() {
  error.value = "";
  if (!selected.value) return;

  isSubmitting.value = true;
  try {
    // TODO: z.B. Stripe Checkout Session erstellen
    // const { url } = await $fetch('/api/checkout', { method: 'POST', body: { plan: selected.value }})
    // await navigateTo(url, { external: true })

    await new Promise((r) => setTimeout(r, 300));
    alert(`Demo: Checkout für Paket "${selected.value}"`);
  } catch (e: any) {
    error.value = "Checkout konnte nicht gestartet werden.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
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
