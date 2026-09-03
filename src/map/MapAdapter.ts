export type BaseLayerType = 'satellite' | 'vector' | 'dark'

export interface MapAdapter {
  mount(container: HTMLElement): Promise<void>
  setBaseLayer(type: BaseLayerType): void
  setCenter(lng: number, lat: number, zoom?: number): void
  resize(): void
  destroy(): void
}
