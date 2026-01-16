<template>
  <div class="page">
    <div class="container">
      <!-- Stepper -->
      <div class="stepper">
        <div class="step active">
          <div class="dot">1</div>
          <div class="label">Konto erstellen</div>
          <div class="line"></div>
        </div>

        <div class="step">
          <div class="dot muted">2</div>
          <div class="label muted">Paket auswählen</div>
        </div>
      </div>

      <!-- Card -->
      <div class="card">
        <h1>Konto erstellen</h1>

        <p class="sub">
          Bereits registriert?
          <NuxtLink class="link" to="/login">Anmelden</NuxtLink>
        </p>

        <form class="form" @submit.prevent="onSubmit">
          <div class="field">
            <label for="email">E-Mail <span class="req">*</span></label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              placeholder="E-Mail-Adresse eingeben"
              autocomplete="email"
              required
            />
          </div>

          <div class="field">
            <label for="password">Passwort <span class="req">*</span></label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Passwort eingeben"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="field">
            <label for="password2">Passwort bestätigen <span class="req">*</span></label>
            <input
              id="password2"
              v-model="form.password2"
              type="password"
              placeholder="Passwort wiederholen"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="checks">
            <label class="check">
              <input v-model="form.acceptTerms" type="checkbox" required />
              <span>
                Ich akzeptiere die
                <NuxtLink class="link" to="/agb">Allgemeinen Geschäftsbedingungen</NuxtLink>
                und die
                <NuxtLink class="link" to="/datenschutz">Datenschutzerklärung</NuxtLink><span class="req">*</span>
              </span>
            </label>
          </div>

          <button class="btn" type="submit" :disabled="isSubmitting">
            Konto erstellen
          </button>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

useHead({ title: "Registrieren" });

const isSubmitting = ref(false);
const error = ref("");
const success = ref("");

const form = ref({
  email: "",
  password: "",
  password2: "",
  code: "",
  acceptTerms: false,
  newsletter: false,
});

const passwordsMatch = computed(() => form.value.password === form.value.password2);

async function onSubmit() {
  error.value = "";
  success.value = "";

  if (!passwordsMatch.value) {
    error.value = "Die Passwörter stimmen nicht überein.";
    return;
  }

  isSubmitting.value = true;
  try {
    // TODO: API Call
    // await $fetch('/api/register', { method: 'POST', body: form.value })

    await new Promise((r) => setTimeout(r, 300));
    success.value = "Registrierung erfolgreich (Demo). Weiterleitung…";

    await navigateTo("/register/paket");
  } catch (e: any) {
    error.value = "Registrierung fehlgeschlagen. Bitte versuche es erneut.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 72px); /* falls deine Navbar 72px ist */
  display: flex;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(255, 106, 0, 0.09), transparent 55%),
    linear-gradient(180deg, #fff, #fff);
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  width: min(550px, 100%);
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
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  white-space: nowrap;
}

.step .label.muted {
  font-weight: 700;
  color: rgba(0, 0, 0, 0.45);
}

.dot {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  background: #ff6a00;
  color: white;
}

.dot.muted {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.55);
}

.line {
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  flex: 1;
  margin-left: 8px;
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

.link {
  color: #ff6a00;
  text-decoration: none;
  font-weight: 800;
}
.link:hover {
  text-decoration: underline;
}

/* Form */
.form {
  display: grid;
  gap: 14px;
}

.field label {
  display: block;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.8);
}

.req {
  color: #ff3b3b;
  font-weight: 900;
}

.field input {
  width: 95%;
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  outline: none;
  font-size: 14px;
  background: white;
}

.field input:focus {
  border-color: rgba(255, 106, 0, 0.6);
  box-shadow: 0 0 0 4px rgba(255, 106, 0, 0.12);
}

/* Checks */
.checks {
  display: grid;
  gap: 14px;
  margin-top: 6px;
}

.check {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 10px;
  align-items: start;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.75);
}

.check input {
  margin-top: 3px;
}

/* Button */
.btn {
  margin-top: 6px;
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

/* Feedback */
.error {
  margin: 6px 0 0;
  color: #c1121f;
  font-weight: 700;
  text-align: center;
}

.success {
  margin: 6px 0 0;
  color: #1a7f37;
  font-weight: 700;
  text-align: center;
}

/* Responsive */
@media (max-width: 420px) {
  .card { padding: 18px 16px; }
  h1 { font-size: 22px; }
  .step .label { font-size: 13px; }
  .line { display: none; } /* auf sehr kleinen Screens optional ausblenden */
}
</style>
