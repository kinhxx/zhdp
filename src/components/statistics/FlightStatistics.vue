<template>
  <div class="flight-statistics">
    <div class="flight-statistics__toolbar">
      <div class="flight-statistics__periods">
        <button
          v-for="item in periodOptions"
          :key="item.value"
          type="button"
          :class="{ active: preset === item.value }"
          @click="preset = item.value"
        >{{ item.label }}</button>
      </div>
      <div class="flight-statistics__metrics">
        <button
          v-for="item in metricOptions"
          :key="item.value"
          type="button"
          :class="{ active: metric === item.value }"
          @click="metric = item.value"
        >{{ item.label }}</button>
      </div>
    </div>

    <div v-if="loading" class="flight-statistics__state">数据加载中</div>
    <div v-else-if="errorText" class="flight-statistics__state flight-statistics__state--error">{{ errorText }}</div>
    <template v-else-if="data">
      <div class="flight-statistics__summary">
        <span>{{ currentMetric.label }}</span>
        <strong>{{ summaryValue }}</strong>
        <em>{{ currentMetric.unit }}</em>
        <small>{{ rangeText }}</small>
      </div>
      <div ref="chartEl" class="flight-statistics__chart" />
    </template>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getFlightStatistics } from '@/services/dashboardApi'
import type { FlightCountDto } from '@/services/types'
import { resolveDateRange, type TimePreset } from '@/utils/dateRange'

type MetricKey = 'recordCount' | 'flightLength' | 'durationHours'

const periodOptions: { label: string; value: TimePreset }[] = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '累计', value: 'all' },
]

const metricOptions: { label: string; value: MetricKey; unit: string }[] = [
  { label: '飞行架次', value: 'recordCount', unit: '架次' },
  { label: '飞行里程', value: 'flightLength', unit: 'km' },
  { label: '飞行时长', value: 'durationHours', unit: 'h' },
]

const preset = ref<TimePreset>('all')
const metric = ref<MetricKey>('recordCount')
const data = ref<FlightCountDto | null>(null)
const loading = ref(true)
const errorText = ref('')
const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const currentMetric = computed(() => metricOptions.find((item) => item.value === metric.value) || metricOptions[0])
const rangeText = computed(() => {
  const range = resolveDateRange(preset.value)
  return `${range.startTime} ~ ${range.endTime}`
})
const summaryValue = computed(() => {
  if (!data.value) return '--'
  return String(data.value[metric.value])
})

function numericValue(item: FlightCountDto): number {
  return Number(item[metric.value]) || 0
}

function renderChart() {
  if (!data.value || !chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)

  const rows = [...data.value.countViewRespVos].sort((a, b) => numericValue(b) - numericValue(a))
  const values = rows.map(numericValue)
  const maxValue = Math.max(...values, 1)

  chart.setOption({
    animationDuration: 450,
    grid: { top: 12, right: 42, bottom: 16, left: 78, containLabel: false },
    xAxis: {
      type: 'value',
      max: Math.ceil(maxValue * 1.12),
      axisLabel: { color: '#728ba0', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(106,161,204,.08)' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rows.map((item) => item.deptName || '未命名组织'),
      axisLabel: { color: '#b8c9d7', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const point = Array.isArray(params) ? params[0] : params
        return `${point.name}<br/>${currentMetric.value.label}：${point.value} ${currentMetric.value.unit}`
      },
    },
    series: [{
      type: 'bar',
      barWidth: 9,
      data: values,
      itemStyle: {
        borderRadius: [0, 5, 5, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(73,183,232,.42)' },
          { offset: 1, color: '#49b7e8' },
        ]),
      },
      label: {
        show: true,
        position: 'right',
        color: '#b8c9d7',
        fontSize: 10,
        formatter: `{c} ${currentMetric.value.unit}`,
      },
    }],
  }, true)
}

async function loadData() {
  loading.value = true
  errorText.value = ''
  try {
    data.value = await getFlightStatistics(resolveDateRange(preset.value))
    await nextTick()
    renderChart()
  } catch {
    errorText.value = '飞行统计加载失败'
  } finally {
    loading.value = false
  }
}

function resizeChart() {
  chart?.resize()
}

watch(preset, loadData)
watch(metric, async () => { await nextTick(); renderChart() })

onMounted(() => {
  loadData()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
  chart = null
})
</script>

<style scoped lang="scss">
.flight-statistics { height: 100%; min-height: 0; display: flex; flex-direction: column; padding: 12px 14px 10px; }
.flight-statistics__toolbar { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.flight-statistics__periods, .flight-statistics__metrics { display: flex; gap: 4px; }
.flight-statistics button { border: 1px solid transparent; border-radius: 6px; padding: 5px 7px; background: transparent; color: var(--text-secondary); font-size: 10px; }
.flight-statistics button.active { color: var(--accent); border-color: rgba(73,183,232,.25); background: var(--accent-soft); }
.flight-statistics__summary { display: flex; align-items: baseline; gap: 6px; margin: 12px 0 2px; }
.flight-statistics__summary span { color: var(--text-secondary); font-size: 11px; }
.flight-statistics__summary strong { font-size: clamp(22px, 1.2vw, 30px); font-weight: 650; }
.flight-statistics__summary em { color: var(--text-secondary); font-size: 11px; font-style: normal; }
.flight-statistics__summary small { margin-left: auto; color: var(--text-secondary); }
.flight-statistics__chart { flex: 1 1 auto; min-height: 150px; }
.flight-statistics__state { flex: 1 1 auto; display: grid; place-items: center; color: var(--text-secondary); }
.flight-statistics__state--error { color: var(--danger); }
</style>
