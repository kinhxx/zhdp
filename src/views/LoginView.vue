<template>
  <main class="login-view">
    <section class="login-card">
      <p class="login-card__eyebrow">LOW-ALTITUDE OPERATIONS</p>
      <h1>无人机低空指挥调度平台</h1>
      <p class="login-card__subtitle">低空巡航数据可视化与运行分析</p>

      <form class="login-form" @submit.prevent="submit">
        <label>
          <span>用户名</span>
          <input v-model.trim="username" autocomplete="username" placeholder="请输入用户名" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码" />
        </label>
        <label>
          <span>验证码</span>
          <div class="captcha-row">
            <input v-model.trim="captchaInput" maxlength="4" placeholder="验证码" />
            <button class="captcha-code" type="button" @click="refreshCaptcha">{{ captchaCode }}</button>
          </div>
        </label>
        <p v-if="errorText" class="login-error">{{ errorText }}</p>
        <button class="login-submit" type="submit">进入平台</button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, setExpectedCaptcha } from '@/services/authService'

const router = useRouter()
const username = ref('')
const password = ref('')
const captchaInput = ref('')
const captchaCode = ref('')
const errorText = ref('')

function createCaptcha(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

function refreshCaptcha() {
  captchaCode.value = createCaptcha()
  setExpectedCaptcha(captchaCode.value)
  captchaInput.value = ''
}

function submit() {
  errorText.value = ''
  if (!login(username.value, password.value, captchaInput.value)) {
    errorText.value = '请输入有效的用户名、密码和验证码'
    refreshCaptcha()
    return
  }
  router.replace('/dashboard')
}

refreshCaptcha()
</script>

<style scoped lang="scss">
.login-card {
  width: min(430px, calc(100vw - 40px));
  padding: 42px;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  background: rgba(8, 24, 39, .88);
  box-shadow: 0 24px 80px rgba(0, 0, 0, .26);
}
.login-card__eyebrow { margin: 0 0 10px; color: var(--accent); font-size: 12px; letter-spacing: .18em; }
.login-card h1 { margin: 0; font-size: 28px; }
.login-card__subtitle { color: var(--text-secondary); margin: 10px 0 30px; }
.login-form { display: grid; gap: 18px; }
.login-form label { display: grid; gap: 8px; color: var(--text-secondary); font-size: 13px; }
.login-form input { width: 100%; padding: 12px 14px; color: var(--text-primary); background: #0b1b2a; border: 1px solid var(--border-subtle); border-radius: 8px; outline: none; }
.login-form input:focus { border-color: rgba(73, 183, 232, .7); }
.captcha-row { display: grid; grid-template-columns: 1fr 110px; gap: 10px; }
.captcha-code { border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--accent-soft); color: var(--accent); letter-spacing: .16em; }
.login-submit { height: 44px; border: 0; border-radius: 8px; background: #2d94c1; color: white; font-weight: 600; }
.login-error { margin: -6px 0 0; color: var(--danger); font-size: 13px; }
</style>
