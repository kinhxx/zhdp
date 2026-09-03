<template>
  <section class="dashboard-panel" :class="{ 'dashboard-panel--grow': grow }">
    <header class="dashboard-panel__header">
      <h2>{{ title }}</h2>
    </header>
    <div class="dashboard-panel__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string; grow?: boolean }>(), { grow: false })
</script>
