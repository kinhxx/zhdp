<template>
  <div class="flight-overview">
    <div v-if="loading" class="panel-state">数据加载中</div>
    <div v-else-if="errorText" class="panel-state panel-state--error">{{ errorText }}</div>
    <template v-else-if="data">
      <div class="flight-overview__primary">
        <article v-for="item in primaryStats" :key="item.label" class="overview-stat overview-stat--primary">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <em>{{ item.unit }}</em>
        </article>
      </div>
      <div class="flight-overview__secondary">
        <article v-for="item in secondaryStats" :key="item.label" class="overview-stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getFlightOverview } from '@/services/dashboardApi'
import type { FlightOverviewDto } from '@/services/types'

const data = ref<FlightOverviewDto | null>(null)
const loading = ref(true)
const errorText = ref('')

const primaryStats = computed(() => data.value ? [
  { label: '飞行架次', value: data.value.recordCount, unit: '架次' },
  { label: '飞行里程', value: data.value.flightLength, unit: 'km' },
  { label: '飞行时长', value: data.value.durationHours, unit: 'h' },
  { label: '飞行计划', value: data.value.flyPlaneNum, unit: '个' },
] : [])

const secondaryStats = computed(() => data.value ? [
  { label: '方舱', value: data.value.shelterNum },
  { label: '飞手', value: data.value.flyerNum },
  { label: '航线', value: data.value.flyLineNum },
  { label: '工单', value: data.value.workOrderNum },
  { label: '成果', value: data.value.achieveNum },
] : [])

onMounted(async () => {
  try {
    data.value = await getFlightOverview()
  } catch {
    errorText.value = '飞行总览加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.flight-overview { padding: 16px; }
.flight-overview__primary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.flight-overview__secondary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.overview-stat { min-width: 0; padding: 10px; border-radius: 8px; background: rgba(255,255,255,.025); border: 1px solid rgba(106,161,204,.1); }
.overview-stat span { display: block; color: var(--text-secondary); font-size: clamp(10px, .6vw, 13px); }
.overview-stat strong { display: inline-block; margin-top: 5px; font-size: clamp(17px, 1vw, 25px); font-weight: 650; }
.overview-stat em { margin-left: 4px; color: var(--text-secondary); font-size: 11px; font-style: normal; }
.overview-stat--primary { background: linear-gradient(135deg, rgba(73,183,232,.12), rgba(255,255,255,.018)); }
.overview-stat--primary strong { color: #f5fbff; font-size: clamp(22px, 1.35vw, 34px); }
.panel-state { min-height: 150px; display: grid; place-items: center; color: var(--text-secondary); }
.panel-state--error { color: var(--danger); }
@media (min-width: 3200px) { .flight-overview__secondary { grid-template-columns: repeat(5, 1fr); } }
</style>
