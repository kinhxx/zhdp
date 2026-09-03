# 上海无人机低空智慧调度大屏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一套可落地的上海无人机低空智慧调度大屏前端，默认提供上海全市 3D 态势，并支持 2D 精细调度、无人机实时位置、航线、任务状态、重点区域下钻和告警联动。

**Architecture:** 使用 React + TypeScript 构建单页大屏。业务数据全部通过 service contracts 进入 Zustand 状态层；mock adapter 提供初始数据和模拟实时事件，未来真实接口只替换 adapter。地图层通过统一 `MapEngine` 接口隔离业务状态与具体 GIS SDK，2D 使用 MapLibre GL JS，3D 使用 CesiumJS；任务、告警、地图、无人机和航线围绕同一组实体 ID 完成交叉联动。

**Tech Stack:** Node.js 22+、npm、React、TypeScript、Vite、Zustand、MapLibre GL JS、CesiumJS、Apache ECharts、Vitest、React Testing Library。

**Spec:** `docs/superpowers/specs/2026-09-03-shanghai-low-altitude-drone-dashboard-design.md`

## Global Constraints

- 系统以领导查看为第一优先级，同时兼顾调度、值班和业务人员。
- 默认进入上海全市 3D 态势视图；必须支持 2D / 3D 和全市 / 重点区域切换。
- 2D / 3D 切换必须保持当前区域、选中无人机、选中任务、选中告警和筛选条件。
- 中央地图必须是页面最大视觉区域；左右侧栏不得把地图降为次要区域。
- 首期只实现查看、监控、定位和基础筛选，不实现任务创建、审批、复杂调度编排、完整告警处置闭环、设备后台或权限后台。
- 页面组件不得直接读取 mock 数据；所有业务数据必须通过 service 层。
- 地图 SDK 不得直接进入任务、告警、指标等业务组件；业务层只依赖 `MapEngine` 抽象。
- 告警必须与地图、无人机、航线、任务联动；严重告警只做短时强调，不做持续大面积闪烁。
- 实时数据中断时保留最后一次有效数据并显示连接异常；不得继续伪造实时位置。
- 地图加载失败时指标、任务和告警仍须可用；单个业务服务异常不得导致全屏不可用。
- 地图中的高频位置更新不得通过全页面重新渲染实现。
- 测试保持最小必要范围：重点验证实体状态、联动逻辑、模式切换上下文保持和降级行为，不为第三方 GIS SDK 编写重复性测试。

---

## File Structure

```text
.
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   ├── DashboardRuntime.tsx
│   │   └── DashboardScreen.tsx
│   ├── domain/
│   │   ├── types.ts
│   │   ├── events.ts
│   │   └── selectors.ts
│   ├── services/
│   │   ├── contracts.ts
│   │   ├── index.ts
│   │   └── mock/
│   │       ├── mockData.ts
│   │       ├── mockServices.ts
│   │       └── mockRealtime.ts
│   ├── store/
│   │   ├── dashboardStore.ts
│   │   └── dashboardStore.test.ts
│   ├── map/
│   │   ├── MapHost.tsx
│   │   ├── MapEngine.ts
│   │   ├── mapScene.ts
│   │   ├── mapScene.test.ts
│   │   ├── maplibre/MapLibreEngine.ts
│   │   └── cesium/CesiumEngine.ts
│   ├── features/
│   │   ├── metrics/TopMetrics.tsx
│   │   ├── missions/MissionOverview.tsx
│   │   ├── missions/MissionList.tsx
│   │   ├── alerts/AlertCenter.tsx
│   │   ├── routes/RouteMonitor.tsx
│   │   ├── aircraft/AircraftDetail.tsx
│   │   ├── regions/RegionControls.tsx
│   │   └── trends/BottomInsights.tsx
│   ├── components/
│   │   ├── Panel.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ConnectionState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── dashboard.css
│   └── test/
│       └── setup.ts
└── docs/superpowers/
    ├── specs/2026-09-03-shanghai-low-altitude-drone-dashboard-design.md
    └── plans/2026-09-03-shanghai-low-altitude-drone-dashboard.md
```

The structure is intentionally feature-focused. There is no generic `utils/` layer, no backend directory, and no component library abstraction beyond the handful of shared visual primitives used by the dashboard.

---

### Task 1: Scaffold the frontend and dashboard shell

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/app/DashboardScreen.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/dashboard.css`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: a runnable Vite/React shell at `/` with a fixed dashboard composition and no business data dependencies.
- Produces: CSS variables used by all later features: `--bg-app`, `--bg-panel`, `--text-primary`, `--text-secondary`, `--status-normal`, `--status-watch`, `--status-warning`, `--status-danger`, `--border-subtle`, `--panel-radius`.

- [ ] **Step 1: Scaffold React + TypeScript with Vite**

Run:

```bash
npm create vite@latest . -- --template react-ts
npm install
```

Expected: Vite project files exist and `npm run dev` can start the app.

- [ ] **Step 2: Install the production dependencies**

Run:

```bash
npm install zustand maplibre-gl cesium echarts
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: all packages resolve successfully and are recorded in `package.json` and `package-lock.json`.

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "build": "tsc -b && vite build"
}
```

- [ ] **Step 4: Replace the starter screen with the dashboard shell**

`src/app/DashboardScreen.tsx` must render this stable structure:

```tsx
export function DashboardScreen() {
  return (
    <main className="dashboard-screen">
      <header className="dashboard-header">上海低空智慧调度平台</header>
      <section className="dashboard-metrics" />
      <aside className="dashboard-left" />
      <section className="dashboard-map" />
      <aside className="dashboard-right" />
      <footer className="dashboard-bottom" />
    </main>
  )
}
```

`src/App.tsx`:

```tsx
import { DashboardScreen } from './app/DashboardScreen'

export default function App() {
  return <DashboardScreen />
}
```

- [ ] **Step 5: Implement the global visual tokens and layout**

Use CSS Grid with the map as the dominant area. Base composition at 1920×1080:

```css
.dashboard-screen {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: minmax(260px, 18vw) minmax(0, 1fr) minmax(280px, 20vw);
  grid-template-rows: 64px 104px minmax(0, 1fr) 220px;
  grid-template-areas:
    "header header header"
    "metrics metrics metrics"
    "left map right"
    "bottom bottom bottom";
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}
```

Use a restrained dark command-center palette. Do not use animated glowing borders or decorative scan lines.

- [ ] **Step 6: Verify the shell**

Run:

```bash
npm run build
npm test
```

Expected: both commands exit with code 0; the browser shows a full-screen five-zone dashboard shell with the map region visibly larger than either side panel.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html src

git commit -m "feat: scaffold low-altitude dashboard"
```

---

### Task 2: Define domain models and service contracts

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/events.ts`
- Create: `src/services/contracts.ts`
- Create: `src/services/index.ts`

**Interfaces:**
- Produces: stable business entities shared by store, services, features, and maps.
- Produces: `DashboardServices` so mock and future production adapters have the same shape.

- [ ] **Step 1: Define business entity types**

Create `src/domain/types.ts` with these exact public types:

```ts
export type MapMode = '2d' | '3d'
export type AircraftStatus = 'normal' | 'standby' | 'low-battery' | 'off-route' | 'offline' | 'abnormal'
export type MissionStatus = 'pending' | 'running' | 'completed' | 'abnormal'
export type RouteStatus = 'normal' | 'watch' | 'abnormal'
export type AlertSeverity = 'critical' | 'important' | 'general'
export type AlertType = 'off-route' | 'offline' | 'low-battery' | 'mission-timeout' | 'restricted-zone'

export interface Coordinate {
  lng: number
  lat: number
  altitudeM?: number
}

export interface Aircraft {
  id: string
  model: string
  missionId?: string
  routeId?: string
  regionId: string
  position: Coordinate
  speedKmh: number
  headingDeg: number
  batteryPct: number
  signalDbm: number
  status: AircraftStatus
  updatedAt: string
}

export interface Mission {
  id: string
  name: string
  type: string
  regionId: string
  aircraftId: string
  routeId: string
  originName: string
  destinationName: string
  startedAt?: string
  plannedEndAt: string
  progressPct: number
  status: MissionStatus
}

export interface RoutePoint extends Coordinate {
  id: string
}

export interface Route {
  id: string
  name: string
  aircraftId: string
  missionId: string
  status: RouteStatus
  points: RoutePoint[]
  completedPointIndex: number
  abnormalSegmentIndex?: number
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  aircraftId?: string
  missionId?: string
  routeId?: string
  regionId: string
  position?: Coordinate
  createdAt: string
  updatedAt: string
}

export interface Region {
  id: string
  name: string
  center: Coordinate
  zoom2d: number
  altitude3dM: number
  isPriority: boolean
}

export interface DashboardSnapshot {
  aircraft: Aircraft[]
  missions: Mission[]
  routes: Route[]
  alerts: Alert[]
  regions: Region[]
}
```

- [ ] **Step 2: Define real-time domain events**

Create `src/domain/events.ts`:

```ts
import type { Aircraft, Alert, Mission, Route } from './types'

export type DomainEvent =
  | { type: 'aircraft.position.updated'; payload: Pick<Aircraft, 'id' | 'position' | 'speedKmh' | 'headingDeg' | 'updatedAt'> }
  | { type: 'aircraft.status.changed'; payload: Pick<Aircraft, 'id' | 'status' | 'batteryPct' | 'signalDbm' | 'updatedAt'> }
  | { type: 'mission.status.changed'; payload: Pick<Mission, 'id' | 'status'> }
  | { type: 'mission.progress.updated'; payload: Pick<Mission, 'id' | 'progressPct'> }
  | { type: 'route.status.changed'; payload: Pick<Route, 'id' | 'status' | 'abnormalSegmentIndex'> }
  | { type: 'alert.created'; payload: Alert }
  | { type: 'alert.updated'; payload: Alert }

export type Unsubscribe = () => void
```

- [ ] **Step 3: Define service contracts**

Create `src/services/contracts.ts`:

```ts
import type { DashboardSnapshot } from '../domain/types'
import type { DomainEvent, Unsubscribe } from '../domain/events'

export interface SnapshotService {
  loadSnapshot(): Promise<DashboardSnapshot>
}

export interface RealtimeService {
  connect(listener: (event: DomainEvent) => void): Promise<Unsubscribe>
  disconnect(): void
}

export interface DashboardServices {
  snapshot: SnapshotService
  realtime: RealtimeService
}
```

`src/services/index.ts` must export only the contracts and the selected adapter factory; feature components must not import from `services/mock/*`.

- [ ] **Step 4: Type-check**

Run:

```bash
npm run build
```

Expected: TypeScript compiles with no `any` added to the public domain/service interfaces.

- [ ] **Step 5: Commit**

```bash
git add src/domain src/services

git commit -m "feat: define dashboard domain contracts"
```

---

### Task 3: Build the mock data adapter and real-time simulation

**Files:**
- Create: `src/services/mock/mockData.ts`
- Create: `src/services/mock/mockRealtime.ts`
- Create: `src/services/mock/mockServices.ts`
- Modify: `src/services/index.ts`

**Interfaces:**
- Consumes: `DashboardSnapshot`, `DomainEvent`, `DashboardServices`.
- Produces: `createDashboardServices(): DashboardServices`.
- Produces: one deterministic mock snapshot and a stoppable timer-based event stream.

- [ ] **Step 1: Create a coherent Shanghai mock snapshot**

`mockData.ts` must export `createMockSnapshot(): DashboardSnapshot` and contain at least:

- 12 aircraft distributed across Shanghai.
- 8 missions with a mix of `pending`, `running`, `completed`, `abnormal`.
- 8 linked routes with route points.
- 5 alerts covering the five first-phase alert types.
- Priority regions for `pudong`, `lingang`, and `hongqiao`, plus `shanghai` as the all-city region.

Every foreign key must resolve: an aircraft's `missionId`/`routeId`, a mission's `aircraftId`/`routeId`, and an alert's referenced IDs must all point to existing entities.

- [ ] **Step 2: Write the real-time stream implementation**

`mockRealtime.ts` must update only running aircraft. Use one interval between 1200 ms and 1800 ms. For each tick:

1. Move an aircraft a small distance toward its next route point.
2. Emit `aircraft.position.updated`.
3. Increment the linked running mission's `progressPct` and emit `mission.progress.updated`.
4. Occasionally emit a status/alert event from the predefined alert scenarios; do not randomly generate unbounded new alert types.

The stream must stop immediately when the returned unsubscribe function is called.

- [ ] **Step 3: Create the adapter factory**

`mockServices.ts`:

```ts
import type { DashboardServices } from '../contracts'
import { createMockSnapshot } from './mockData'
import { createMockRealtimeService } from './mockRealtime'

export function createDashboardServices(): DashboardServices {
  return {
    snapshot: {
      async loadSnapshot() {
        return structuredClone(createMockSnapshot())
      },
    },
    realtime: createMockRealtimeService(),
  }
}
```

`src/services/index.ts` must export `createDashboardServices` without exposing `mockData` to components.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: no feature component imports from mock files because feature components do not exist yet; adapter compiles as the only concrete data source.

- [ ] **Step 5: Commit**

```bash
git add src/services

git commit -m "feat: add mock dashboard data stream"
```

---

### Task 4: Implement the normalized dashboard store and cross-feature selection rules

**Files:**
- Create: `src/store/dashboardStore.ts`
- Create: `src/store/dashboardStore.test.ts`
- Create: `src/domain/selectors.ts`

**Interfaces:**
- Consumes: `DashboardSnapshot`, `DomainEvent`.
- Produces: `useDashboardStore`.
- Produces actions: `hydrate`, `applyEvent`, `setMapMode`, `selectRegion`, `selectAircraft`, `selectMission`, `selectAlert`, `clearSelection`, `setConnectionState`.
- Produces selectors used by UI: `selectTopMetrics`, `selectVisibleMissions`, `selectVisibleAlerts`, `selectSelectedAircraft`, `selectSelectedRoute`.

- [ ] **Step 1: Write the selection-linking tests first**

`src/store/dashboardStore.test.ts` must include these exact behaviors:

```ts
it('selecting a mission selects its aircraft and route context', () => {
  const snapshot = createMockSnapshot()
  const mission = snapshot.missions.find((item) => item.status === 'running')!
  const store = createDashboardStoreForTest(snapshot)

  store.getState().selectMission(mission.id)

  expect(store.getState().selectedMissionId).toBe(mission.id)
  expect(store.getState().selectedAircraftId).toBe(mission.aircraftId)
  expect(store.getState().selectedRouteId).toBe(mission.routeId)
  expect(store.getState().selectedRegionId).toBe(mission.regionId)
})

it('selecting an alert resolves all linked entities without clearing filters', () => {
  const snapshot = createMockSnapshot()
  const alert = snapshot.alerts.find((item) => item.aircraftId && item.missionId && item.routeId)!
  const store = createDashboardStoreForTest(snapshot)
  store.getState().setStatusFilter(['abnormal'])

  store.getState().selectAlert(alert.id)

  expect(store.getState().selectedAlertId).toBe(alert.id)
  expect(store.getState().selectedAircraftId).toBe(alert.aircraftId)
  expect(store.getState().selectedMissionId).toBe(alert.missionId)
  expect(store.getState().selectedRouteId).toBe(alert.routeId)
  expect(store.getState().statusFilter).toEqual(['abnormal'])
})

it('switching map mode preserves region and selection context', () => {
  const snapshot = createMockSnapshot()
  const aircraft = snapshot.aircraft[0]
  const store = createDashboardStoreForTest(snapshot)
  store.getState().selectAircraft(aircraft.id)

  store.getState().setMapMode('2d')

  expect(store.getState().mapMode).toBe('2d')
  expect(store.getState().selectedAircraftId).toBe(aircraft.id)
  expect(store.getState().selectedRegionId).toBe(aircraft.regionId)
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npm test -- src/store/dashboardStore.test.ts
```

Expected: FAIL because the store helpers do not exist yet.

- [ ] **Step 3: Implement the normalized store**

State shape:

```ts
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface DashboardState {
  aircraftById: Record<string, Aircraft>
  missionsById: Record<string, Mission>
  routesById: Record<string, Route>
  alertsById: Record<string, Alert>
  regionsById: Record<string, Region>
  mapMode: MapMode
  selectedRegionId: string
  selectedAircraftId?: string
  selectedMissionId?: string
  selectedRouteId?: string
  selectedAlertId?: string
  statusFilter: string[]
  connectionState: ConnectionState
  lastDataAt?: string
}
```

`applyEvent` must patch only the affected entity object and must not recreate every entity map on aircraft position updates.

- [ ] **Step 4: Implement selectors**

`selectTopMetrics` must return:

```ts
export interface TopMetrics {
  onlineAircraft: number
  runningMissions: number
  todayFlights: number
  completionRatePct: number
  activeAlerts: number
  priorityRegionState: 'normal' | 'attention' | 'alert'
}
```

For mock data, `todayFlights` may be derived from total missions plus a fixed snapshot-level mock count stored in selector configuration; do not put fake historical data into the domain entities merely to satisfy the card.

- [ ] **Step 5: Run tests**

```bash
npm test -- src/store/dashboardStore.test.ts
npm run build
```

Expected: all tests pass and TypeScript compiles.

- [ ] **Step 6: Commit**

```bash
git add src/store src/domain/selectors.ts

git commit -m "feat: add dashboard interaction state"
```

---

### Task 5: Wire runtime services and failure isolation

**Files:**
- Create: `src/app/DashboardRuntime.tsx`
- Create: `src/components/ErrorBoundary.tsx`
- Create: `src/components/ConnectionState.tsx`
- Modify: `src/App.tsx`
- Modify: `src/app/DashboardScreen.tsx`

**Interfaces:**
- Consumes: `createDashboardServices`, `useDashboardStore`.
- Produces: one runtime lifecycle that loads the snapshot once, subscribes to real-time events once, unsubscribes on unmount, and preserves the last valid state when the stream fails.

- [ ] **Step 1: Implement `DashboardRuntime`**

Lifecycle:

```ts
useEffect(() => {
  let unsubscribe: (() => void) | undefined
  let cancelled = false

  async function start() {
    setConnectionState('connecting')
    try {
      const snapshot = await services.snapshot.loadSnapshot()
      if (cancelled) return
      hydrate(snapshot)
      unsubscribe = await services.realtime.connect(applyEvent)
      if (!cancelled) setConnectionState('connected')
    } catch {
      if (!cancelled) setConnectionState('error')
    }
  }

  void start()
  return () => {
    cancelled = true
    unsubscribe?.()
    services.realtime.disconnect()
  }
}, [services])
```

Do not clear store entities when connection state changes to `error`.

- [ ] **Step 2: Add the visible connection state**

`ConnectionState.tsx` must display the last valid data time and only appear as a warning when state is `disconnected` or `error`.

- [ ] **Step 3: Add feature-level error boundaries**

Create a minimal `ErrorBoundary` class component that accepts `fallback: ReactNode`. Later the map, left panel, and right panel will each be wrapped independently.

- [ ] **Step 4: Verify**

Run:

```bash
npm run build
npm test
```

Expected: build passes; manually changing the mock service to throw during development leaves the shell visible rather than producing a blank page. Revert the deliberate throw before commit.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components src/App.tsx

git commit -m "feat: connect dashboard runtime services"
```

---

### Task 6: Implement the map abstraction and 2D/3D engines

**Files:**
- Create: `src/map/MapEngine.ts`
- Create: `src/map/mapScene.ts`
- Create: `src/map/mapScene.test.ts`
- Create: `src/map/MapHost.tsx`
- Create: `src/map/maplibre/MapLibreEngine.ts`
- Create: `src/map/cesium/CesiumEngine.ts`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: normalized dashboard state.
- Produces: map-independent `MapScene`.
- Produces: `MapEngine` contract implemented by both MapLibre and Cesium.

- [ ] **Step 1: Write the scene-projection test**

`mapScene.test.ts`:

```ts
it('marks the selected route and abnormal segment without mutating source entities', () => {
  const snapshot = createMockSnapshot()
  const route = snapshot.routes.find((item) => item.abnormalSegmentIndex !== undefined)!
  const scene = buildMapScene(snapshot, {
    selectedRouteId: route.id,
    selectedAircraftId: route.aircraftId,
    selectedRegionId: 'shanghai',
    statusFilter: [],
  })

  const projected = scene.routes.find((item) => item.id === route.id)!
  expect(projected.selected).toBe(true)
  expect(projected.abnormalSegmentIndex).toBe(route.abnormalSegmentIndex)
  expect(snapshot.routes.find((item) => item.id === route.id)?.status).toBe(route.status)
})
```

Run:

```bash
npm test -- src/map/mapScene.test.ts
```

Expected: FAIL because `buildMapScene` is missing.

- [ ] **Step 2: Define `MapEngine`**

`src/map/MapEngine.ts`:

```ts
export interface MapViewport {
  center: [number, number]
  zoom2d: number
  altitude3dM: number
}

export interface MapSelectionEvent {
  kind: 'aircraft' | 'route' | 'region' | 'alert'
  id: string
}

export interface MapEngine {
  mount(container: HTMLElement): Promise<void>
  destroy(): void
  setViewport(viewport: MapViewport): void
  renderScene(scene: MapScene): void
  focus(target: { lng: number; lat: number; altitudeM?: number }): void
  onSelect(listener: (event: MapSelectionEvent) => void): () => void
}
```

- [ ] **Step 3: Implement `buildMapScene`**

`MapScene` contains only render-ready business layer objects:

```ts
export interface MapScene {
  aircraft: Array<Aircraft & { selected: boolean }>
  routes: Array<Route & { selected: boolean }>
  alerts: Array<Alert & { selected: boolean }>
  regions: Region[]
}
```

Filtering and selected-state projection belong here, not inside MapLibre/Cesium implementations.

- [ ] **Step 4: Implement `MapLibreEngine`**

Requirements:

- Use one `GeoJSONSource` for aircraft and one for routes; update with `setData`, not by recreating the entire map.
- Use a neutral base style suitable for dark UI.
- Render selected aircraft and selected route as separate higher-priority layers.
- Render abnormal route segment in the warning/danger status token.
- Expose map click events as `MapSelectionEvent`.
- Do not import Zustand directly in the engine.

- [ ] **Step 5: Implement `CesiumEngine`**

Requirements:

- Create one `Viewer` per mounted engine and destroy it on unmount.
- Center the initial camera over Shanghai.
- Use OSM imagery or another no-secret baseline provider for the initial mock implementation; do not require a hard-coded access token.
- Represent aircraft as billboard/point entities with altitude.
- Represent routes as polylines using route-point altitude.
- Update existing Cesium entities by ID instead of rebuilding the viewer on each position event.
- Do not import Zustand directly in the engine.

- [ ] **Step 6: Implement `MapHost`**

`MapHost` is the only component that chooses engine implementation:

```ts
const engine = mapMode === '2d' ? new MapLibreEngine() : new CesiumEngine()
```

On mode switch:

1. Capture store context before replacing the engine.
2. Destroy old engine.
3. Mount new engine.
4. Re-render the same scene.
5. Restore selected region viewport and selected entity focus.

The store selection IDs must not change during this process.

- [ ] **Step 7: Configure Cesium assets in Vite**

Use Vite static copying/configuration supported by Cesium's current package structure. Keep the path configuration in `vite.config.ts`; do not scatter Cesium asset paths across components.

- [ ] **Step 8: Run tests and build**

```bash
npm test -- src/map/mapScene.test.ts src/store/dashboardStore.test.ts
npm run build
```

Expected: tests pass; the build contains no unresolved Cesium workers/assets.

- [ ] **Step 9: Commit**

```bash
git add src/map vite.config.ts

git commit -m "feat: add 2d and 3d map engines"
```

---

### Task 7: Render aircraft, routes, map controls, and region drill-down

**Files:**
- Create: `src/features/regions/RegionControls.tsx`
- Modify: `src/map/MapHost.tsx`
- Modify: `src/app/DashboardScreen.tsx`
- Modify: `src/styles/dashboard.css`

**Interfaces:**
- Consumes: `setMapMode`, `selectRegion`, `selectAircraft`, `selectMission`, map selection events.
- Produces: 2D/3D toggle, all-city/priority-region controls, map click selection, region drill-down and return-to-city behavior.

- [ ] **Step 1: Add map mode controls**

`RegionControls` exposes two independent controls:

```text
[3D] [2D]
[全市总览] [浦东新区] [临港新片区] [虹桥区域]
```

The active state must come from Zustand; buttons must not keep duplicate local selected state.

- [ ] **Step 2: Connect map selections back to the store**

Mapping:

- aircraft click → `selectAircraft(id)`
- route click → select its linked mission context through `selectMission(route.missionId)`
- region click → `selectRegion(id)`
- alert click → `selectAlert(id)`

- [ ] **Step 3: Implement region viewport changes**

`selectRegion('shanghai')` restores the all-city viewport. Priority region selection must increase detail density in `buildMapScene`; do not create a second page or route.

- [ ] **Step 4: Verify mode persistence manually**

Manual sequence:

```text
1. Select 浦东新区.
2. Select one aircraft.
3. Switch 3D → 2D.
4. Confirm the map remains in 浦东新区 and the same aircraft remains selected.
5. Switch 2D → 3D and confirm the same state again.
```

Expected: no selection/filter reset.

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: both engines compile and mode/region controls render inside the map zone.

- [ ] **Step 6: Commit**

```bash
git add src/features/regions src/map/MapHost.tsx src/app/DashboardScreen.tsx src/styles/dashboard.css

git commit -m "feat: add low-altitude map interactions"
```

---

### Task 8: Implement leader-first KPI, mission, alert, route, and aircraft panels

**Files:**
- Create: `src/components/Panel.tsx`
- Create: `src/components/StatusBadge.tsx`
- Create: `src/features/metrics/TopMetrics.tsx`
- Create: `src/features/missions/MissionOverview.tsx`
- Create: `src/features/missions/MissionList.tsx`
- Create: `src/features/alerts/AlertCenter.tsx`
- Create: `src/features/routes/RouteMonitor.tsx`
- Create: `src/features/aircraft/AircraftDetail.tsx`
- Modify: `src/app/DashboardScreen.tsx`
- Modify: `src/styles/dashboard.css`

**Interfaces:**
- Consumes: store selectors and selection actions only.
- Produces: six top metrics, mission status overview, prioritized mission list, alert list, route monitor, and selected aircraft detail.

- [ ] **Step 1: Implement the six fixed top metrics**

Order:

1. 在线无人机
2. 执行中任务
3. 今日飞行架次
4. 任务完成率
5. 当前告警
6. 重点区域运行状态

The current value is visually dominant. Secondary comparison text is optional and must not exceed one line.

- [ ] **Step 2: Implement mission overview and mission list**

`MissionOverview` shows four status counts: 待执行、执行中、已完成、异常.

`MissionList` sort order:

1. `abnormal`
2. `running`
3. `pending`
4. `completed`

Clicking a row calls `selectMission(id)` and must not navigate away from the dashboard.

- [ ] **Step 3: Implement alert center**

Sort by severity then time:

```text
critical → important → general
newest → oldest within same severity
```

Clicking alert calls `selectAlert(id)`. A newly created critical alert may animate a small border/background emphasis for at most 3 seconds; there must be no infinite pulsing of the entire panel.

- [ ] **Step 4: Implement route monitor**

Show route name, mission, status, progress derived from `completedPointIndex / points.length`, and abnormal label when applicable. Clicking a route selects its linked mission.

- [ ] **Step 5: Implement aircraft detail**

When an aircraft is selected, display:

- ID
- model
- current mission
- region
- longitude/latitude
- altitude
- speed
- heading
- battery
- signal
- flight status
- last data update

When no aircraft is selected, show a compact prompt rather than an empty large card.

- [ ] **Step 6: Compose the side panels**

Left:

```text
MissionOverview
MissionList
```

Right:

```text
AlertCenter
RouteMonitor
AircraftDetail
```

Wrap left and right panel groups in separate `ErrorBoundary` instances so a feature render error does not remove the map or top KPIs.

- [ ] **Step 7: Verify build and store tests**

```bash
npm test -- src/store/dashboardStore.test.ts
npm run build
```

Expected: no direct imports from `services/mock/*` in any `features/*` file.

- [ ] **Step 8: Commit**

```bash
git add src/components src/features src/app/DashboardScreen.tsx src/styles/dashboard.css

git commit -m "feat: add mission and alert command panels"
```

---

### Task 9: Add bottom trends and city event dynamics

**Files:**
- Create: `src/features/trends/BottomInsights.tsx`
- Modify: `src/app/DashboardScreen.tsx`
- Modify: `src/styles/dashboard.css`

**Interfaces:**
- Consumes: mission/aircraft/alert entities from the store.
- Produces: today flight trend, region activity summary, and city event feed without introducing another data service.

- [ ] **Step 1: Implement today flight trend with ECharts**

Use a small line/area chart with 24 hourly buckets. In mock mode, derive deterministic hourly values from the initial snapshot seed so the chart does not visibly reshuffle on each render.

- [ ] **Step 2: Implement region activity**

Display priority regions ordered by active aircraft count. Use bars or compact ranked rows; do not create another map.

- [ ] **Step 3: Implement city event feed**

Merge the latest mission status changes and alerts into a single chronological list. Every item must carry an event type and timestamp. The feed is read-only.

- [ ] **Step 4: Ensure the bottom band remains secondary**

At the 1920×1080 base size, the bottom band must remain smaller than the central map area and must not introduce primary controls.

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: ECharts bundles successfully and the dashboard still fits within one viewport without document scrolling.

- [ ] **Step 6: Commit**

```bash
git add src/features/trends src/app/DashboardScreen.tsx src/styles/dashboard.css

git commit -m "feat: add low-altitude operating trends"
```

---

### Task 10: Add degradation behavior and final integration verification

**Files:**
- Modify: `src/app/DashboardRuntime.tsx`
- Modify: `src/components/ConnectionState.tsx`
- Modify: `src/map/MapHost.tsx`
- Modify: `src/styles/dashboard.css`
- Modify: `src/store/dashboardStore.test.ts`

**Interfaces:**
- Produces: explicit real-time disconnection state, map-failure fallback, and final cross-feature acceptance behavior.

- [ ] **Step 1: Add a store test for last-valid-data retention**

```ts
it('keeps the last valid entities when realtime connection fails', () => {
  const snapshot = createMockSnapshot()
  const store = createDashboardStoreForTest(snapshot)
  const aircraftCount = Object.keys(store.getState().aircraftById).length

  store.getState().setConnectionState('error')

  expect(store.getState().connectionState).toBe('error')
  expect(Object.keys(store.getState().aircraftById)).toHaveLength(aircraftCount)
})
```

Run:

```bash
npm test -- src/store/dashboardStore.test.ts
```

Expected: PASS if Task 4 correctly separated entity state from connection state.

- [ ] **Step 2: Add map failure fallback**

If MapLibre or Cesium `mount()` rejects, `MapHost` must show:

```text
地图加载异常
业务数据仍在更新，可通过任务和告警列表继续查看运行状态。
```

Do not rethrow the map error to the root `App` boundary.

- [ ] **Step 3: Prevent stale position simulation after disconnect**

When real-time state changes to `error`/`disconnected`, ensure the mock interval is stopped and `lastDataAt` remains at the timestamp of the last received event.

- [ ] **Step 4: Run the complete automated verification**

```bash
npm test
npm run build
```

Expected: all tests pass and production build exits with code 0.

- [ ] **Step 5: Run the final manual acceptance sequence**

Start:

```bash
npm run dev
```

Verify all of the following in one session:

```text
1. Initial view opens in Shanghai all-city 3D mode.
2. Six top metrics are visible without scrolling.
3. Running and abnormal missions are visually prioritized.
4. Aircraft positions visibly update without the entire dashboard flashing/re-rendering.
5. Clicking an aircraft highlights its route and opens aircraft details.
6. Clicking a mission focuses the linked region, aircraft, and route.
7. Clicking an alert focuses the linked abnormal object and task context.
8. Switching 3D ↔ 2D preserves current region, selected object, mission, alert, and filters.
9. Selecting 浦东/临港/虹桥 changes viewport and raises local information density.
10. A severe alert receives short visual emphasis but no continuous full-panel flashing.
11. Simulated realtime disconnect keeps the last valid data and shows a connection warning.
12. Simulated map mount failure leaves KPIs, mission list, and alert center usable.
13. The entire screen remains within one viewport at 1920×1080.
```

- [ ] **Step 6: Check for scope residue**

Search:

```bash
grep -R "create mission\|approve mission\|user management\|role management\|device management" src || true
```

Expected: no implementation of excluded back-office workflows.

Search for direct mock coupling:

```bash
grep -R "services/mock" src/features src/components src/map || true
```

Expected: no output.

- [ ] **Step 7: Final commit**

```bash
git add src

git commit -m "feat: complete low-altitude dashboard prototype"
```

---

## Self-Review

### Spec coverage

- 上海全市总览与重点区域下钻: Tasks 6-7.
- 2D / 3D 双模式且上下文保持: Tasks 4, 6-7, 10.
- 无人机实时位置: Tasks 3-4, 6-7.
- 航线及异常航段: Tasks 2-4, 6, 8.
- 任务状态、任务进度及地图联动: Tasks 2-4, 8.
- 偏航、失联、低电量、超时、限制区告警: Tasks 2-4, 8.
- 告警与地图/航线/任务/无人机联动: Tasks 4, 6-8.
- 顶部综合指标: Task 8.
- 底部趋势、区域活跃度、事件动态: Task 9.
- service abstraction + mock adapter: Tasks 2-3.
- future realtime compatibility: Tasks 2-5.
- map SDK isolation: Task 6.
- data interruption and map/module degradation: Tasks 5 and 10.
- leader-first visual hierarchy and restrained alert emphasis: Tasks 1, 8-10.
- excluded admin/creation workflows remain excluded: Global Constraints and Task 10 residue check.

### Placeholder scan

The plan intentionally contains no `TBD`, `TODO`, `implement later`, or undefined future module. Production API endpoints and official Shanghai GIS datasets are outside the current mock-front-end scope, so no placeholder endpoint or fake URL is introduced.

### Type/interface consistency

- Business entities originate in `src/domain/types.ts` and are consumed by services, store, selectors, and map scene projection.
- `DomainEvent` is the only real-time update contract.
- `DashboardServices` is the only runtime data-source contract.
- `MapScene` is the only business-to-map render contract.
- `MapEngine` is the only GIS engine contract.
- Selection IDs remain in Zustand and are never owned by MapLibre/Cesium engines.
