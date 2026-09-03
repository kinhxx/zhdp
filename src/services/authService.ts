const AUTH_KEY = 'fde-dashboard-auth'
const CAPTCHA_KEY = 'fde-dashboard-captcha'

export function setExpectedCaptcha(value: string): void {
  sessionStorage.setItem(CAPTCHA_KEY, value.toUpperCase())
}

export function login(username: string, password: string, captcha: string): boolean {
  const expected = sessionStorage.getItem(CAPTCHA_KEY)
  const valid = Boolean(username.trim() && password && expected && captcha.toUpperCase() === expected)
  if (valid) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ username: username.trim() }))
  }
  return valid
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) !== null
}

export function getCurrentUsername(): string {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_KEY) || '{}').username || '用户'
  } catch {
    return '用户'
  }
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(CAPTCHA_KEY)
}
