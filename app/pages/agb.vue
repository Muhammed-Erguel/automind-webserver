<template>
  <div class="agb">
    <section>
      <h2>test</h2>
      <p>
        test
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'AGB / Nutzungsbedingungen',
  meta: [{ name: 'robots', content: 'index,follow' }],
})
</script>

<style scoped>
.agb {
  font-family: Arial, Helvetica, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 0;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.85);
}

.subtitle {
  margin-top: -8px;
  margin-bottom: 28px;
  color: rgba(0, 0, 0, 0.6);
}

h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

h2 {
  font-size: 18px;
  margin-top: 26px;
  margin-bottom: 10px;
}

p {
  margin: 10px 0;
}

a {
  color: rgba(0, 0, 0, 0.85);
  text-decoration: underline;
}

.divider {
  margin: 32px 0;
  border: none;
  border-top: 1px solid rgba(0,0,0,0.12);
}
</style>
