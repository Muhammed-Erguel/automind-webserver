<template>
  <div class="layout">
    <!-- NAVBAR -->
    <header class="navbar">
      <nav class="nav-inner">
        <div class="nav-center">
          <NuxtLink class="nav-link" to="/preise">Preise</NuxtLink>
          <NuxtLink class="nav-link" to="/blog">Blog</NuxtLink>
          <NuxtLink class="nav-link" to="/partner">Partner werden</NuxtLink>
          <NuxtLink class="nav-link" to="/kontakt">Kontakt</NuxtLink>
        </div>

        <div class="nav-right">

          <NuxtLink class="nav-link" to="/login">Anmelden</NuxtLink>

          <NuxtLink class="register-btn" to="/register">
            Registrieren <span class="arrow">→</span>
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- PAGE CONTENT (das ist dein router-view) -->
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
            <NuxtLink class="footer-link" to="/affiliate">Affiliate</NuxtLink>
          </div>

          <div>
            <div class="footer-title">FEATURES</div>
            <NuxtLink class="footer-link" to="/bulk-lister">Bulk-Lister</NuxtLink>
            <NuxtLink class="footer-link" to="/sniping">Sniping Methode</NuxtLink>
            <NuxtLink class="footer-link" to="/tracker">Tracker</NuxtLink>
            <NuxtLink class="footer-link" to="/wettbewerb">Wettbewerbs-Recherche</NuxtLink>
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

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  height: 72px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  background: white;
}
.nav-inner {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
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
  color: rgba(0,0,0,0.72);
  font-weight: 500;
}
.nav-link:hover { color: rgba(0,0,0,0.9); }

.icon-btn, .lang-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
}

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
}
.register-btn:hover { filter: brightness(0.95); }
.arrow { font-weight: 900; }

/* Content (zwischen Navbar und Footer) */
.content {
  flex: 1;
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 32px 24px;
}

/* Footer */
.footer {
  border-top: 1px solid rgba(0,0,0,0.06);
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
  color: rgba(0,0,0,0.7);
  text-decoration: none;
}
.footer-link:hover { color: rgba(0,0,0,0.9); }

.footer-sep {
  margin-top: 36px;
  height: 1px;
  background: rgba(0,0,0,0.08);
}
.footer-bottom {
  padding-top: 18px;
  color: rgba(0,0,0,0.6);
}
</style>
