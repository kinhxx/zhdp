<template>
  <div class="flight-top10">
    <div v-if="loading" class="record-state">数据加载中</div>
    <div v-else-if="errorText" class="record-state record-state--error">{{ errorText }}</div>
    <div v-else-if="!records.length" class="record-state">暂无飞行记录</div>
    <ol v-else class="record-list">
      <li v-for="(record, index) in records" :key="record.flyRecordId" class="record-card">
        <span class="record-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
        <div class="record-card__main">
          <div class="record-card__title-row">
            <strong>{{ record.flyRecordName }}</strong>
            <span class="record-card__type">{{ record.flyLineName }}</span>
          </div>
          <div class="record-card__meta">
            <span>#{{ record.flyRecordId }}</span>
            <span>{{ formatTime(record.createTime) }}</span>
            <span>{{ record.shelterName }}</span>
            <span>{{ record.flyerName }}</span>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getFlyRecords } from '@/services/dashboardApi'
import type { FlyRecordDto } from '@/services/types'
import { sortFlyRecordsNewestFirst } from '@/utils/flightRecords'

const records = ref<FlyRecordDto[]>([])
const loading = ref(true)
const errorText = ref('')

function formatTime(value: string): string {
  return value.slice(5, 16)
}

onMounted(async () => {
  try {
    const page = await getFlyRecords({ pageNum: 1, pageSize: 10 })
    records.value = sortFlyRecordsNewestFirst(page.rows).slice(0, 10)
  } catch {
    errorText.value = '飞行案例加载失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.flight-top10 { height: 100%; min-height: 0; }
.record-state { height: 100%; display: grid; place-items: center; color: var(--text-secondary); }
.record-state--error { color: var(--danger); }
.record-list { height: 100%; margin: 0; padding: 10px 12px 14px; overflow-y: auto; list-style: none; scrollbar-width: thin; scrollbar-color: rgba(73,183,232,.28) transparent; }
.record-card { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 10px; padding: 11px 8px; border-bottom: 1px solid rgba(106,161,204,.1); }
.record-card:last-child { border-bottom: 0; }
.record-card__index { color: var(--accent); font-variant-numeric: tabular-nums; font-size: 12px; padding-top: 2px; }
.record-card__title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.record-card__title-row strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: clamp(12px, .72vw, 16px); font-weight: 550; }
.record-card__type { flex: 0 0 auto; padding: 3px 7px; border-radius: 999px; color: var(--accent); background: var(--accent-soft); font-size: 10px; }
.record-card__meta { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 7px; color: var(--text-secondary); font-size: clamp(10px, .57vw, 12px); }
</style>
