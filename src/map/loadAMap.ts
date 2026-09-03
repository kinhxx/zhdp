import AMapLoader from '@amap/amap-jsapi-loader'

let amapPromise: Promise<any> | null = null

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode?: string
      serviceHost?: string
    }
  }
}

export function loadAMap(plugins: string[] = []): Promise<any> {
  const key = process.env.VUE_APP_AMAP_KEY
  if (!key) {
    return Promise.reject(new Error('AMAP_KEY_MISSING'))
  }

  const serviceHost = process.env.VUE_APP_AMAP_SERVICE_HOST
  const securityJsCode = process.env.VUE_APP_AMAP_SECURITY_CODE
  if (serviceHost) {
    window._AMapSecurityConfig = { serviceHost }
  } else if (securityJsCode) {
    window._AMapSecurityConfig = { securityJsCode }
  }

  if (!amapPromise) {
    amapPromise = AMapLoader.load({
      key,
      version: '2.0',
      plugins: Array.from(new Set(['AMap.Weather', ...plugins])),
    })
  }

  return amapPromise
}
