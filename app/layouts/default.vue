<template>
  <div class="layout">
    <!-- NAVBAR -->
    <header class="navbar">
      <nav class="nav-inner">
        <!-- Left: Brand (optional) -->
        <NuxtLink class="brand" to="/">Automind</NuxtLink>

        <!-- Desktop Center Links -->
        <div class="nav-center desktop-only">
          <NuxtLink class="nav-link" to="/preise">Preise</NuxtLink>
          <NuxtLink class="nav-link" to="/blog">Blog</NuxtLink>
          <NuxtLink class="nav-link" to="/partner">Partner werden</NuxtLink>
          <NuxtLink class="nav-link" to="/kontakt">Kontakt</NuxtLink>
        </div>

        <!-- Right -->
        <div class="nav-right">
          <!-- Desktop Auth -->
          <NuxtLink 
            v-if="!user" 
            class="nav-link desktop-only" 
            to="/login"
          >
            Anmelden
          </NuxtLink>

          <NuxtLink 
            v-else
            class="nav-link desktop-only"
            @click="logout"
          >
            Abmelden
          </NuxtLink>

          <NuxtLink 
            v-if="user"
            class="nav-link desktop-only"
            @click="showDashboard"
          >
            Dashboard
          </NuxtLink>

          <NuxtLink class="register-btn desktop-only" to="/register">
            Registrieren <span class="arrow">→</span>
          </NuxtLink>

          <!-- Mobile: Register stays + Burger -->
          <NuxtLink class="register-btn mobile-only" to="/register">
            Registrieren <span class="arrow">→</span>
          </NuxtLink>

          <button
            class="burger mobile-only"
            type="button"
            :aria-expanded="isMenuOpen ? 'true' : 'false'"
            aria-label="Menü öffnen"
            @click="toggleMenu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <!-- Mobile dropdown menu -->
      <div v-if="isMenuOpen" class="mobile-menu">
        <div class="mobile-menu-inner">
          <NuxtLink class="mobile-link" to="/preise" @click="closeMenu">Preise</NuxtLink>
          <NuxtLink class="mobile-link" to="/blog" @click="closeMenu">Blog</NuxtLink>
          <NuxtLink class="mobile-link" to="/partner" @click="closeMenu">Partner werden</NuxtLink>
          <NuxtLink class="mobile-link" to="/kontakt" @click="closeMenu">Kontakt</NuxtLink>

          <div class="mobile-sep"></div>

          <NuxtLink 
            v-if="!user" 
            class="mobile-link" 
            to="/login" 
            @click="closeMenu"
          >
            Anmelden
          </NuxtLink>

          <NuxtLink 
            v-else
            class="mobile-link"
            @click="logout"
          >
            Abmelden
          </NuxtLink>

          <NuxtLink class="mobile-link" to="/agb" @click="closeMenu">AGB</NuxtLink>
          <NuxtLink class="mobile-link" to="/datenschutz" @click="closeMenu">Datenschutz</NuxtLink>
          <NuxtLink class="mobile-link" to="/impressum" @click="closeMenu">Impressum</NuxtLink>
        </div>
      </div>
    </header>

    <!-- PAGE CONTENT -->
    <main class="content">
      <slot />
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div>
            <div class="footer-title">PRODUKT</div>
            <NuxtLink class="footer-link" to="/">Home</NuxtLink>
            <NuxtLink class="footer-link" to="/preise">Preise</NuxtLink>
            <NuxtLink class="footer-link" to="/partner">Affiliate</NuxtLink>
          </div>

          <div>
            <div class="footer-title">FEATURES</div>
            <NuxtLink class="footer-link" to="/angebotsanfrage">Angebotsanfrage</NuxtLink>
            <NuxtLink class="footer-link" to="/chatbot">Chatbot</NuxtLink>
          </div>

          <div>
            <div class="footer-title">RESSOURCEN</div>
            <NuxtLink class="footer-link" to="/faq">FAQ</NuxtLink>
            <NuxtLink class="footer-link" to="/kontakt">Kontakt</NuxtLink>
            <NuxtLink class="footer-link" to="/agb">AGB</NuxtLink>
            <NuxtLink class="footer-link" to="/datenschutz">Datenschutz</NuxtLink>
            <NuxtLink class="footer-link" to="/impressum">Impressum</NuxtLink>
          </div>
        </div>

        <div class="footer-sep"></div>

        <div class="footer-bottom">
          <span>© {{ new Date().getFullYear() }} Automind</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const logout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/')
}

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

async function showDashboard() {
  await navigateTo('/dashboard')
}

// Optional: ESC schließt Menü
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeMenu();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
/* Base */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
}

/* Navbar */
.navbar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky; /* bleibt oben */
  top: 0;
  z-index: 50;
}

.nav-inner {
  height: 72px;
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  text-decoration: none;
  color: rgba(0,0,0,0.9);
  font-weight: 800;
  letter-spacing: 0.2px;
}

.nav-center {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex: 1;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.72);
  font-weight: 500;
  white-space: nowrap;
}
.nav-link:hover { color: rgba(0, 0, 0, 0.9); }

.register-btn {
  background: #ff6a00;
  color: white;
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.register-btn:hover { filter: brightness(0.95); }
.arrow { font-weight: 900; }

/* Mobile burger */
.burger {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 12px;
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}
.burger span {
  width: 18px;
  height: 2px;
  background: rgba(0,0,0,0.75);
  display: block;
  border-radius: 2px;
}

/* Mobile menu dropdown */
.mobile-menu {
  border-top: 1px solid rgba(0,0,0,0.06);
  background: white;
}
.mobile-menu-inner {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 12px 24px 18px;
  display: grid;
  gap: 10px;
}
.mobile-link {
  text-decoration: none;
  color: rgba(0,0,0,0.8);
  font-weight: 600;
  padding: 10px 10px;
  border-radius: 10px;
}
.mobile-link:hover {
  background: rgba(0,0,0,0.04);
}
.mobile-sep {
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 6px 0;
}

/* Content */
.content {
  flex: 1;
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 32px 24px;
}

/* Footer */
.footer {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
}
.footer-inner {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 48px 24px 24px;
}
.footer-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 48px;
}
.footer-title {
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.footer-link {
  display: block;
  margin: 10px 0;
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
}
.footer-link:hover { color: rgba(0, 0, 0, 0.9); }

.footer-sep {
  margin-top: 36px;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}
.footer-bottom {
  padding-top: 18px;
  color: rgba(0, 0, 0, 0.6);
}

/* Responsive helpers */
.desktop-only { display: flex; }
.mobile-only { display: none; }

/* Breakpoints */
@media (max-width: 900px) {
  .nav-inner { padding: 0 1px; }
  .content { padding: 24px 16px; }
  .footer-inner { padding: 36px 16px 20px; }

  .footer-grid {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
    gap: 28px;
  }
}

@media (max-width: 680px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: inline-flex; }

  .nav-inner { gap: 12px; }
  .register-btn { padding: 10px 14px; }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}
</style>
