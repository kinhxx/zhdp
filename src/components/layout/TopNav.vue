<template>
  <header class="top-nav">
    <div class="top-nav__left">
      <div class="top-nav__clock">
        <strong>{{ timeText }}</strong>
        <span>{{ dateText }} {{ weekdayText }}</span>
      </div>
      <div class="top-nav__weather" :title="weatherTitle">
        <strong>{{ weatherText }}</strong>
        <span>{{ weatherDetail }}</span>
      </div>
    </div>

    <h1 class="top-nav__title">无人机低空指挥调度平台</h1>

    <div class="top-nav__right">
      <button class="top-nav__home" type="button" @click="$router.push('/dashboard')">首页</button>
      <div class="top-nav__avatar">{{ username.slice(0, 1) }}</div>
      <span class="top-nav__user">{{ username }}</span>
      <button class="top-nav__logout" type="button" @click="handleLogout">退出</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUsername, logout } from '@/services/authService'
import { getShanghaiLiveWeather, type LiveWeather } from '@/services/weatherService'

const router = useRouter()
const username = getCurrentUsername()
const now = ref(new Date())
const weather = ref<LiveWeather | null>(null)
const weatherError = ref(false)
let clockTimer: number | undefined
let weatherTimer: number | undefined

const timeText = computed(() => now.value.toLocaleTimeString('zh-CN', { hour12: false }))
const dateText = computed(() => now.value.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }))
const weekdayText = computed(() => now.value.toLocaleDateString('zh-CN', { weekday: 'short' }))
const weatherText = computed(() => weather.value ? `${weather.value.temperature}°C ${weather.value.weather}` : (weatherError.value ? '天气暂不可用' : '天气加载中'))
const weatherDetail = computed(() => weather.value ? `${weather.value.windDirection}风 ${weather.value.windPower}级 · 湿度 ${weather.value.humidity}%` : '上海市')
const weatherTitle = computed(() => weather.value ? `数据时间：${weather.value.reportTime}` : '')

async function refreshWeather() {
  try {
    weather.value = await getShanghaiLiveWeather()
    weatherError.value = false
  } catch {
    weatherError.value = true
  }
}

function handleLogout() {
  logout()
  router.replace('/login')
}

onMounted(() => {
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
  refreshWeather()
  weatherTimer = window.setInterval(refreshWeather, 10 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (clockTimer) window.clearInterval(clockTimer)
  if (weatherTimer) window.clearInterval(weatherTimer)
})
</script>

<style scoped lang="scss">
.top-nav {
  position: relative;
  height: var(--top-nav-height);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 clamp(16px, 1.2vw, 32px);
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(5, 16, 27, .9);
}
.top-nav__left, .top-nav__right { display: flex; align-items: center; gap: clamp(12px, 1vw, 24px); }
.top-nav__right { justify-content: flex-end; }
.top-nav__title { margin: 0; font-size: clamp(24px, 1.55vw, 40px); font-weight: 650; letter-spacing: .1em; }
.top-nav__clock, .top-nav__weather { display: flex; flex-direction: column; gap: 2px; }
.top-nav__clock strong, .top-nav__weather strong { font-size: clamp(14px, .8vw, 20px); }
.top-nav__clock span, .top-nav__weather span, .top-nav__user { color: var(--text-secondary); font-size: clamp(11px, .65vw, 15px); }
.top-nav__avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent); }
.top-nav button { border: 0; color: var(--text-secondary); background: transparent; padding: 7px 10px; }
.top-nav button:hover { color: var(--text-primary); }
</style>
