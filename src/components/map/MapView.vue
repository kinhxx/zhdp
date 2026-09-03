<template>
  <div class="map-view">
    <div ref="container" class="map-view__canvas" />
    <div class="map-view__toolbar">
      <BaseLayerSwitch v-model="baseLayer" />
    </div>
    <div class="map-view__label">
      <span>上海市低空运行态势</span>
      <small>真实在线底图</small>
    </div>
    <div v-if="errorText" class="map-view__error">
      <strong>地图暂不可用</strong>
      <span>{{ errorText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseLayerSwitch from './BaseLayerSwitch.vue'
import { AMapAdapter, SHANGHAI_CENTER } from '@/map/AMapAdapter'
import type { BaseLayerType, MapAdapter } from '@/map/MapAdapter'

const container = ref<HTMLElement | null>(null)
const baseLayer = ref<BaseLayerType>('dark')
const errorText = ref('')
let adapter: MapAdapter | null = null

function resizeMap() {
  adapter?.resize()
}

watch(baseLayer, (value) => adapter?.setBaseLayer(value))

onMounted(async () => {
  if (!container.value) return
  adapter = new AMapAdapter()
  try {
    await adapter.mount(container.value)
    adapter.setBaseLayer(baseLayer.value)
    adapter.setCenter(SHANGHAI_CENTER[0], SHANGHAI_CENTER[1], 10.5)
    window.addEventListener('resize', resizeMap)
  } catch (error) {
    errorText.value = error instanceof Error && error.message === 'AMAP_KEY_MISSING'
      ? '请配置 VUE_APP_AMAP_KEY'
      : '高德地图服务加载失败'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeMap)
  adapter?.destroy()
  adapter = null
})
</script>

<style scoped lang="scss">
.map-view { position: relative; width: 100%; height: 100%; min-height: 0; overflow: hidden; background: #081725; }
.map-view__canvas { width: 100%; height: 100%; }
.map-view__toolbar { position: absolute; z-index: 3; top: 14px; right: 14px; }
.map-view__label { position: absolute; z-index: 3; top: 14px; left: 14px; display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border-radius: 8px; background: rgba(6,18,30,.78); border: 1px solid var(--border-subtle); pointer-events: none; }
.map-view__label span { font-size: 14px; font-weight: 550; }
.map-view__label small { color: var(--text-secondary); }
.map-view__error { position: absolute; inset: 0; display: grid; place-content: center; gap: 6px; text-align: center; background: linear-gradient(145deg,#0b1b2a,#07111d); }
.map-view__error span { color: var(--text-secondary); font-size: 13px; }
</style>
