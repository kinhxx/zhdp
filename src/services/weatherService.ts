import { loadAMap } from '@/map/loadAMap'

export interface LiveWeather {
  city: string
  weather: string
  temperature: string
  windDirection: string
  windPower: string
  humidity: string
  reportTime: string
}

let lastSuccess: LiveWeather | null = null

export async function getShanghaiLiveWeather(): Promise<LiveWeather> {
  try {
    const AMap = await loadAMap(['AMap.Weather'])
    const weather = new AMap.Weather()
    const data = await new Promise<any>((resolve, reject) => {
      weather.getLive('上海市', (err: unknown, result: any) => {
        if (err || !result || result.info !== 'OK') {
          reject(err || new Error('WEATHER_UNAVAILABLE'))
          return
        }
        resolve(result)
      })
    })

    lastSuccess = {
      city: data.city || '上海市',
      weather: data.weather || '--',
      temperature: String(data.temperature ?? '--'),
      windDirection: data.windDirection || '--',
      windPower: data.windPower || '--',
      humidity: String(data.humidity ?? '--'),
      reportTime: data.reportTime || new Date().toLocaleString('zh-CN', { hour12: false }),
    }
    return lastSuccess
  } catch (error) {
    if (lastSuccess) return lastSuccess
    throw error
  }
}
