<template>
  <div class="task-ranking">
    <div class="task-ranking__periods">
      <button
        v-for="item in periodOptions"
        :key="item.value"
        type="button"
        :class="{ active: preset === item.value }"
        @click="preset = item.value"
      >{{ item.label }}</button>
    </div>

    <div v-if="loading" class="task-ranking__state">数据加载中</div>
    <div v-else-if="errorText" class="task-ranking__state task-ranking__state--error">{{ errorText }}</div>
    <template v-else-if="data">
      <div class="task-ranking__status-tabs">
        <button
          v-for="item in statusOptions"
          :key="item.value"
          type="button"
          :class="{ active: status === item.value }"
          @click="status = item.value"
        >
          <span>{{ item.label }}</span>
          <strong>{{ statusValue(data, item.value) }}</strong>
        </button>
      </div>

      <div class="task-ranking__summary">
        <span>任务总量</span>
        <strong>{{ data.taskTotalNum }}</strong>
        <em>{{ rangeText }}</em>
      </div>

      <div v-if="!ranking.length" class="task-ranking__state">当前周期暂无任务数据</div>
      <ol v-else class="task-ranking__list">
        <li v-for="(item, index) in ranking" :key="item.deptId">
          <span class="rank-index">{{ index + 1 }}</span>
          <div class="rank-main">
            <div class="rank-row">
              <strong>{{ item.deptName }}</strong>
              <span>{{ item.value }} 个 · {{ item.percent.toFixed(1) }}%</span>
            </div>
            <div class="rank-track"><i :style="{ width: `${Math.min(100, item.percent)}%` }" /></div>
          </div>
        </li>
      </ol>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getTaskOverview } from '@/services/dashboardApi'
import type { TaskOverviewDto } from '@/services/types'
import { resolveDateRange, type TimePreset } from '@/utils/dateRange'

type TaskStatusKey = 'dispatched' | 'dispatching' | 'received' | 'completed'

const periodOptions: { label: string; value: TimePreset }[] = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '累计', value: 'all' },
]
const statusOptions: { label: string; value: TaskStatusKey }[] = [
  { label: '待派发', value: 'dispatched' },
  { label: '派发中', value: 'dispatching' },
  { label: '已接单', value: 'received' },
  { label: '已结单', value: 'completed' },
]

const preset = ref<TimePreset>('month')
const status = ref<TaskStatusKey>('dispatching')
const data = ref<TaskOverviewDto | null>(null)
const loading = ref(true)
const errorText = ref('')

const range = computed(() => resolveDateRange(preset.value))
const rangeText = computed(() => `${range.value.startTime} ~ ${range.value.endTime}`)

function statusValue(item: TaskOverviewDto, key: TaskStatusKey): number {
  return item[`${key}Num` as keyof TaskOverviewDto] as number
}
function statusPercent(item: TaskOverviewDto, key: TaskStatusKey): number {
  return item[`${key}Percent` as keyof TaskOverviewDto] as number
}

const ranking = computed(() => {
  if (!data.value) return []
  return data.value.taskOverviewRespVoList
    .map((item) => ({ deptId: item.deptId, deptName: item.deptName, value: statusValue(item, status.value), percent: statusPercent(item, status.value) }))
    .sort((a, b) => b.value - a.value)
})

async function loadData() {
  loading.value = true
  errorText.value = ''
  try {
    data.value = await getTaskOverview(resolveDateRange(preset.value))
  } catch {
    errorText.value = '任务统计加载失败'
  } finally {
    loading.value = false
  }
}

watch(preset, loadData)
onMounted(loadData)
</script>

<style scoped lang="scss">
.task-ranking { padding: 12px 14px 14px; }
.task-ranking__periods { display: flex; gap: 5px; margin-bottom: 10px; }
.task-ranking__periods button, .task-ranking__status-tabs button { border: 1px solid transparent; color: var(--text-secondary); background: transparent; border-radius: 6px; }
.task-ranking__periods button { padding: 5px 8px; font-size: 11px; }
.task-ranking__periods button.active { color: var(--accent); border-color: rgba(73,183,232,.25); background: var(--accent-soft); }
.task-ranking__status-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.task-ranking__status-tabs button { padding: 8px 5px; text-align: left; background: rgba(255,255,255,.025); }
.task-ranking__status-tabs button.active { background: rgba(73,183,232,.12); border-color: rgba(73,183,232,.28); }
.task-ranking__status-tabs span { display: block; font-size: 10px; }
.task-ranking__status-tabs strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: clamp(16px, .9vw, 22px); }
.task-ranking__summary { display: flex; align-items: baseline; gap: 8px; margin: 11px 0 8px; color: var(--text-secondary); font-size: 11px; }
.task-ranking__summary strong { color: var(--text-primary); font-size: 20px; }
.task-ranking__summary em { margin-left: auto; font-style: normal; }
.task-ranking__state { min-height: 140px; display: grid; place-items: center; color: var(--text-secondary); }
.task-ranking__state--error { color: var(--danger); }
.task-ranking__list { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.task-ranking__list li { display: grid; grid-template-columns: 24px 1fr; align-items: center; gap: 8px; }
.rank-index { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 6px; background: rgba(73,183,232,.09); color: var(--accent); font-size: 11px; }
.rank-row { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; color: var(--text-secondary); }
.rank-row strong { color: var(--text-primary); font-weight: 500; }
.rank-track { height: 4px; margin-top: 5px; border-radius: 2px; overflow: hidden; background: rgba(255,255,255,.06); }
.rank-track i { display: block; height: 100%; border-radius: inherit; background: var(--accent); }
</style>
