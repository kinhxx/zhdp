import { loadAMap } from './loadAMap'
import type { BaseLayerType, MapAdapter } from './MapAdapter'

export const SHANGHAI_CENTER: [number, number] = [121.4737, 31.2304]

export class AMapAdapter implements MapAdapter {
  private AMap: any = null
  private map: any = null

  async mount(container: HTMLElement): Promise<void> {
    this.AMap = await loadAMap()
    this.map = new this.AMap.Map(container, {
      zoom: 10.5,
      center: SHANGHAI_CENTER,
      viewMode: '2D',
      mapStyle: 'amap://styles/darkblue',
      showLabel: true,
      resizeEnable: true,
    })
  }

  setBaseLayer(type: BaseLayerType): void {
    if (!this.map || !this.AMap) return

    if (type === 'satellite') {
      const satellite = new this.AMap.TileLayer.Satellite()
      const roadNet = new this.AMap.TileLayer.RoadNet()
      this.map.setMapStyle('amap://styles/normal')
      this.map.setLayers([satellite, roadNet])
      return
    }

    this.map.setLayers([new this.AMap.TileLayer()])
    this.map.setMapStyle(type === 'dark' ? 'amap://styles/darkblue' : 'amap://styles/normal')
  }

  setCenter(lng: number, lat: number, zoom = 10.5): void {
    if (!this.map) return
    this.map.setZoomAndCenter(zoom, [lng, lat], false, 300)
  }

  resize(): void {
    this.map?.resize?.()
  }

  destroy(): void {
    this.map?.destroy?.()
    this.map = null
    this.AMap = null
  }
}
