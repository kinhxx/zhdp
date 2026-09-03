<template>
  <div class="base-layer-switch" aria-label="地图底图切换">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ active: modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { BaseLayerType } from '@/map/MapAdapter'

defineProps<{ modelValue: BaseLayerType }>()
defineEmits<{ (event: 'update:modelValue', value: BaseLayerType): void }>()

const options: { label: string; value: BaseLayerType }[] = [
  { label: '卫星', value: 'satellite' },
  { label: '电子', value: 'vector' },
  { label: '暗色', value: 'dark' },
]
</script>

<style scoped lang="scss">
.base-layer-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--border-subtle);
  border-radius: 9px;
  background: rgba(6, 18, 30, .88);
  backdrop-filter: blur(8px);
}
.base-layer-switch button {
  border: 0;
  border-radius: 6px;
  padding: 7px 12px;
  color: var(--text-secondary);
  background: transparent;
  font-size: 12px;
}
.base-layer-switch button.active { color: white; background: rgba(73,183,232,.24); }
</style>
