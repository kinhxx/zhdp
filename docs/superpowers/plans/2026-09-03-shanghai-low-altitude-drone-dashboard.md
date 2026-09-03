# 无人机低空指挥调度平台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 FDE 第二期工作坊需求和现有 5 个 Mock 接口，构建一套 Vue 3 大屏前端，实现登录、飞行总览、飞行案例 TOP10、飞行任务排行榜、飞行统计分析、中央地图三种底图切换及超宽屏自适应。

**Architecture:** 使用 Vue 3 + Vue CLI 5.x 构建 `/login` 与 `/dashboard` 两个页面。所有业务组件只依赖 `dashboardApi` 返回的接口 DTO/视图模型，不直接读取 Mock 常量；当前由 Mock adapter 提供与现有接口同形的数据，未来接真实接口时保持组件层不变。中央地图通过 `MapAdapter` 隔离地图 SDK，首期只实现卫星图、电子地图、暗色底图和上海默认视口。

**Tech Stack:** Node.js 18+、npm、Vue 3、Vue CLI 5.x、TypeScript、Vue Router 4、Sass、ECharts、Axios、@amap/amap-jsapi-loader、Jest。

**Spec:** `docs/superpowers/specs/2026-09-03-shanghai-low-altitude-drone-dashboard-design.md`

## Global Constraints

- 页面名称固定为“无人机低空指挥调度平台”。
- 页面结构固定为顶部导航 + 左侧业务区 + 中央地图 + 右侧业务区。
- 左侧展示飞行总览和飞行案例 TOP10；右侧展示飞行任务排行榜和飞行统计分析。
- 首期业务数据严格使用当前接口字段，不虚构设备名称、经纬度、实时遥测、航迹点、告警或三维高度数据。
- 任务状态严格使用“待派发 / 派发中 / 已接单 / 已结单”。
- 飞行案例中的 `shelterName` 显示为“方舱”，不得改写成接口不存在的“执行设备”。
- 地图正式验收范围只包含卫星图 / 电子地图 / 暗色主题切换和默认上海视口。
- 3D、实时无人机位置、动态航线、异常告警不进入首期实现。
- 累计统计起始时间固定为 `2024-01-01`。
- 支持 Chrome、Edge、Firefox、Safari 和国产浏览器极速模式。
- 支持 16:9 / 21:9 / 32:9 / 48:9，分辨率 1920×1080 至 7680×1440；不得通过整页固定比例拉伸实现超宽屏适配。
- 中央地图始终为最大视觉区域；超宽屏新增宽度优先分配给地图。
- 测试保持最小必要范围，只覆盖时间范围转换、接口数据排序/映射等容易产生业务错误的纯逻辑；不为 ECharts 或地图 SDK 编写重复性单元测试。

---

## File Structure

```text
.
├── package.json
├── package-lock.json
├── babel.config.js
├── tsconfig.json
├── vue.config.js
├── .env.example
├── public/
│   └── index.html
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts
│   ├── views/
│   │   ├── LoginView.vue
│   │   └── DashboardView.vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.vue
│   │   │   └── DashboardPanel.vue
│   │   ├── overview/
│   │   │   └── FlightOverview.vue
│   │   ├── records/
│   │   │   └── FlightTop10.vue
│   │   ├── tasks/
│   │   │   └── TaskRanking.vue
│   │   ├── statistics/
│   │   │   └── FlightStatistics.vue
│   │   └── map/
│   │       ├── MapView.vue
│   │       └── BaseLayerSwitch.vue
│   ├── map/
│   │   ├── MapAdapter.ts
│   │   └── AMapAdapter.ts
│   ├── services/
│   │   ├── types.ts
│   │   ├── dashboardApi.ts
│   │   ├── authService.ts
│   │   ├── weatherService.ts
│   │   └── mock/
│   │       └── fdeMockData.ts
│   ├── utils/
│   │   ├── dateRange.ts
│   │   ├── dateRange.spec.ts
│   │   ├── flightRecords.ts
│   │   └── flightRecords.spec.ts
│   └── styles/
│       ├── _tokens.scss
│       ├── global.scss
│       └── dashboard.scss
└── docs/superpowers/
    ├── specs/2026-09-03-shanghai-low-altitude-drone-dashboard-design.md
    └── plans/2026-09-03-shanghai-low-altitude-drone-dashboard.md
```

文件按业务职责拆分，不建立通用 `utils` 大杂烩、全局状态库或后台管理模块。当前页面之间只有登录态需要共享，本期不引入 Pinia。

---

### Task 1: Scaffold Vue 3 project and responsive dashboard shell

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `babel.config.js`
- Create: `tsconfig.json`
- Create: `vue.config.js`
- Create: `public/index.html`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/router/index.ts`
- Create: `src/views/LoginView.vue`
- Create: `src/views/DashboardView.vue`
- Create: `src/components/layout/DashboardPanel.vue`
- Create: `src/styles/_tokens.scss`
- Create: `src/styles/global.scss`
- Create: `src/styles/dashboard.scss`

**Interfaces:**
- Produces: `/login` and `/dashboard` routes.
- Produces: a fixed four-zone dashboard layout with top navigation, left column, map center, right column.
- Produces: shared CSS variables/Sass tokens used by all subsequent panels.

- [ ] **Step 1: Create the Vue 3 / Vue CLI 5 project dependencies**

Use a manually controlled `package.json` rather than an interactive scaffold. Required runtime packages:

```json
{
  "dependencies": {
    "@amap/amap-jsapi-loader": "^1.0.1",
    "axios": "^1.7.0",
    "core-js": "^3.37.0",
    "echarts": "^5.5.0",
    "vue": "^3.4.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@vue/cli-plugin-babel": "~5.0.8",
    "@vue/cli-plugin-typescript": "~5.0.8",
    "@vue/cli-plugin-unit-jest": "~5.0.8",
    "@vue/cli-service": "~5.0.8",
    "@vue/compiler-sfc": "^3.4.0",
    "sass": "^1.77.0",
    "sass-loader": "^13.3.0",
    "typescript": "~5.4.0"
  },
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "test:unit": "vue-cli-service test:unit"
  }
}
```

Run:

```bash
npm install
```

Expected: `package-lock.json` generated with no unresolved dependency errors.

- [ ] **Step 2: Configure application entry and routes**

`src/router/index.ts` defines exactly two application routes:

```ts
import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  ],
})
```

`src/main.ts` mounts `App.vue`, installs router, and imports `styles/global.scss`.

- [ ] **Step 3: Establish the dashboard grid**

`DashboardView.vue` initially renders semantic slots/components for:

```text
TopNav
LeftColumn
  FlightOverview
  FlightTop10
MapView
RightColumn
  TaskRanking
  FlightStatistics
```

Use CSS Grid. Base rules:

```scss
.dashboard-grid {
  height: calc(100vh - var(--top-nav-height));
  display: grid;
  grid-template-columns:
    clamp(340px, 20vw, 560px)
    minmax(720px, 1fr)
    clamp(360px, 21vw, 600px);
  gap: clamp(10px, 0.7vw, 20px);
  padding: clamp(10px, 0.7vw, 20px);
  overflow: hidden;
}
```

Do not use `transform: scale()` on the entire dashboard.

- [ ] **Step 4: Add responsive typography and panel tokens**

Define restrained dark command-center tokens in `_tokens.scss`; use `clamp()` for title, KPI and list text. Panels must use low-contrast borders and no continuous glow/scan-line animation.

- [ ] **Step 5: Verify the shell**

Run:

```bash
npm run build
```

Expected: build exits 0; `/dashboard` compiles with the center column visibly wider than either side column.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json babel.config.js tsconfig.json vue.config.js public src/main.ts src/App.vue src/router src/views src/components/layout src/styles
git commit -m "feat: scaffold drone command dashboard"
```

---

### Task 2: Implement mock authentication and top navigation

**Files:**
- Create: `src/services/authService.ts`
- Create: `src/services/weatherService.ts`
- Create: `src/components/layout/TopNav.vue`
- Modify: `src/views/LoginView.vue`
- Modify: `src/views/DashboardView.vue`
- Modify: `src/router/index.ts`

**Interfaces:**
- Produces: `authService.login(username, password, captcha): boolean`.
- Produces: `authService.isAuthenticated(): boolean`, `authService.logout(): void`.
- Produces: `weatherService.getCurrent(): WeatherViewModel` using isolated Mock data.

- [ ] **Step 1: Implement local mock auth**

Use `sessionStorage` key `fde-dashboard-auth`. Login succeeds only when username/password are non-empty and captcha matches the currently generated four-character captcha. Do not hard-code a fake backend token.

- [ ] **Step 2: Build login UI**

`LoginView.vue` must display:

- title “无人机低空指挥调度平台”
- username input
- password input
- captcha input
- visible captcha value with refresh action
- login button
- inline validation error

Successful login calls `router.replace('/dashboard')`.

- [ ] **Step 3: Add route guard**

`/dashboard` redirects to `/login` when `authService.isAuthenticated()` is false. `/login` redirects to `/dashboard` when already logged in.

- [ ] **Step 4: Implement TopNav**

Left: current time, weekday, date, Mock weather. Center: fixed platform title. Right: username, home button, avatar placeholder, logout.

Clock updates once per second with one interval created on mount and cleared on unmount.

Logout clears session state and navigates to `/login`.

- [ ] **Step 5: Build check**

Run:

```bash
npm run build
```

Expected: build exits 0 and no browser-global access occurs before component mount.

- [ ] **Step 6: Commit**

```bash
git add src/services/authService.ts src/services/weatherService.ts src/components/layout/TopNav.vue src/views/LoginView.vue src/views/DashboardView.vue src/router/index.ts
git commit -m "feat: add login and dashboard navigation"
```

---

### Task 3: Define FDE API types, Mock adapter, and time-range logic

**Files:**
- Create: `src/services/types.ts`
- Create: `src/services/mock/fdeMockData.ts`
- Create: `src/services/dashboardApi.ts`
- Create: `src/utils/dateRange.ts`
- Create: `src/utils/dateRange.spec.ts`
- Create: `src/utils/flightRecords.ts`
- Create: `src/utils/flightRecords.spec.ts`

**Interfaces:**
- Produces: DTOs matching `openTotalDataByDept`, `openAssociatedFlyRecord`, `openWorkOrderOverview`, `openTaskOverview`, `openNewTotalDataByDay`.
- Produces: `dashboardApi.getFlightOverview()`.
- Produces: `dashboardApi.getFlyRecords(params)`.
- Produces: `dashboardApi.getWorkOrderOverview(range)` for data-layer completeness only.
- Produces: `dashboardApi.getTaskOverview(range)`.
- Produces: `dashboardApi.getFlightStatistics(range)`.
- Produces: `resolveDateRange(preset, now)`.
- Produces: `sortFlyRecordsNewestFirst(rows)`.

- [ ] **Step 1: Define DTOs with current interface field names**

Key types must include:

```ts
export interface FlightOverviewDto {
  shelterNum: number
  flyLineNum: number
  achieveNum: number
  flyerNum: number
  workOrderNum: number
  recordCount: number
  flyPlaneNum: number
  flightLength: string
  durationHours: string
  routeId: number | null
}

export interface FlyRecordDto {
  flyRecordId: number
  flyRecordName: string
  flyLineId: number
  flyLineName: string
  flyerId: number
  flyerName: string
  createTime: string
  shelterId: number
  shelterName: string
}

export interface TaskOverviewDto {
  deptId: number
  deptName: string
  taskTotalNum: number
  dispatchedNum: number
  dispatchingNum: number
  receivedNum: number
  completedNum: number
  dispatchedPercent: number
  dispatchingPercent: number
  receivedPercent: number
  completedPercent: number
  taskOverviewRespVoList: TaskOverviewDto[]
}

export interface FlightCountDto {
  deptId: number | null
  deptName: string | null
  recordCount: number
  flightLength: string
  durationHours: string
  displayDate: string | null
  countViewRespVos: FlightCountDto[]
  secondCountViewRespList: FlightCountDto[]
}
```

Also define the work-order DTO using `workOrderTotalNum`, `toReceiveNum`, `receivedNum`, `completedNum`, `workOrderOverviewRespVos`, `secondWordOderDetails`.

- [ ] **Step 2: Create concrete Mock data matching the supplied examples**

Use the provided values as fixtures, including:

```ts
export const flightOverviewMock: FlightOverviewDto = {
  shelterNum: 11,
  flyLineNum: 48,
  achieveNum: 156,
  flyerNum: 12,
  workOrderNum: 50,
  recordCount: 168,
  flyPlaneNum: 60,
  flightLength: '1392.47',
  durationHours: '35.1',
  routeId: null,
}
```

Fly records include the ten supplied records `1001` through `1010`; task overview uses province total `120` and child organizations `市公司A=50`, `市公司B=40`, `市公司C=30`; flight statistics use province `recordCount=168`, `flightLength='1392.47'`, `durationHours='35.1'` and the three supplied organization aggregates.

- [ ] **Step 3: Implement `dashboardApi` as the only business-data entry point**

Every method returns `Promise` and deep-clones Mock data before returning it, so components cannot mutate the shared fixture.

Do not import `fdeMockData.ts` from any Vue component.

- [ ] **Step 4: Implement deterministic time presets**

```ts
export type TimePreset = 'today' | 'week' | 'month' | 'year' | 'all'

export interface DateRange {
  startTime: string
  endTime: string
}
```

`resolveDateRange(preset, now)` returns `YYYY-MM-DD` strings. `all` always starts at `2024-01-01`; all other presets end on `now`.

- [ ] **Step 5: Write the two high-value unit tests**

`dateRange.spec.ts` verifies at least:

```ts
resolveDateRange('all', new Date('2026-09-03T10:00:00')).startTime === '2024-01-01'
resolveDateRange('month', new Date('2026-09-03T10:00:00')).startTime === '2026-09-01'
resolveDateRange('year', new Date('2026-09-03T10:00:00')).startTime === '2026-01-01'
```

`flightRecords.spec.ts` verifies unordered records are sorted descending by `createTime` and truncated to 10 only by the calling component/service, not by mutating source data.

- [ ] **Step 6: Run tests and build**

```bash
npm run test:unit
npm run build
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/services src/utils
git commit -m "feat: add FDE dashboard data services"
```

---

### Task 4: Build flight overview and flight-case TOP10 panels

**Files:**
- Create: `src/components/overview/FlightOverview.vue`
- Create: `src/components/records/FlightTop10.vue`
- Modify: `src/views/DashboardView.vue`

**Interfaces:**
- Consumes: `dashboardApi.getFlightOverview()`.
- Consumes: `dashboardApi.getFlyRecords({ pageNum: 1, pageSize: 10 })`.

- [ ] **Step 1: Implement FlightOverview data loading**

On mount, load one snapshot. Render two information levels:

Primary:
- 飞行架次 `recordCount`
- 飞行里程 `flightLength km`
- 飞行时长 `durationHours h`
- 飞行计划 `flyPlaneNum`

Secondary:
- 方舱 `shelterNum`
- 飞手 `flyerNum`
- 航线 `flyLineNum`
- 工单 `workOrderNum`
- 成果 `achieveNum`

Do not create nine equal-sized KPI cards.

- [ ] **Step 2: Implement loading/error states locally**

The panel shows a compact loading skeleton while waiting. API failure replaces only this panel body with “飞行总览加载失败”; it must not block the dashboard.

- [ ] **Step 3: Implement TOP10**

Load `pageNum=1`, `pageSize=10`, apply `sortFlyRecordsNewestFirst`, and display max 10 vertical cards.

Each card displays exactly:

- generated index 1–10
- 飞行编号: `flyRecordId`
- 飞行记录名称: `flyRecordName`
- 飞行航线: `flyLineName`
- 执行时间: formatted `createTime`
- 方舱: `shelterName`
- 飞手: `flyerName`

Do not render an “执行设备” field.

- [ ] **Step 4: Fit the left column without page scrolling**

`FlightOverview` uses the upper portion; `FlightTop10` fills remaining height with internal overflow when necessary. The overall dashboard remains `100vh` with no body scrollbar.

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: exit 0; no component imports `services/mock/fdeMockData`.

- [ ] **Step 6: Commit**

```bash
git add src/components/overview src/components/records src/views/DashboardView.vue
git commit -m "feat: add flight overview and recent records"
```

---

### Task 5: Implement central map and three base-layer modes

**Files:**
- Create: `.env.example`
- Create: `src/map/MapAdapter.ts`
- Create: `src/map/AMapAdapter.ts`
- Create: `src/components/map/BaseLayerSwitch.vue`
- Create: `src/components/map/MapView.vue`
- Modify: `src/views/DashboardView.vue`

**Interfaces:**
- Produces: `MapAdapter.mount`, `setBaseLayer`, `setCenter`, `resize`, `destroy`.
- Consumes: `VUE_APP_AMAP_KEY` and optional `VUE_APP_AMAP_SECURITY_CODE`.

- [ ] **Step 1: Define the provider-neutral interface**

```ts
export type BaseLayerType = 'satellite' | 'vector' | 'dark'

export interface MapAdapter {
  mount(container: HTMLElement): Promise<void>
  setBaseLayer(type: BaseLayerType): void
  setCenter(lng: number, lat: number, zoom?: number): void
  resize(): void
  destroy(): void
}
```

- [ ] **Step 2: Implement AMap adapter**

Use `@amap/amap-jsapi-loader`. Default Shanghai center:

```ts
const SHANGHAI_CENTER: [number, number] = [121.4737, 31.2304]
```

Mapping rules:

- `vector`: standard vector base map.
- `dark`: vector map with dark map style.
- `satellite`: enable `AMap.TileLayer.Satellite`, disable the vector base display where necessary.

Keep SDK-specific code entirely inside `AMapAdapter.ts`.

- [ ] **Step 3: Document environment variables**

`.env.example`:

```text
VUE_APP_AMAP_KEY=
VUE_APP_AMAP_SECURITY_CODE=
```

If no key exists at runtime, `MapView` shows “地图服务未配置” inside the map area while the left/right business panels remain functional.

- [ ] **Step 4: Build map controls**

`BaseLayerSwitch.vue` contains only three compact buttons: 卫星、电子、暗色. Active state is clear but restrained.

`MapView.vue` owns one adapter instance, calls `destroy()` on unmount, and uses `ResizeObserver` to call `resize()` after container changes.

- [ ] **Step 5: Do not implement unsupported map overlays**

No drone marker, dynamic route, alert layer, restricted-zone layer or 3D switch is created in this task.

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: exit 0; map-related imports outside `src/map` are limited to the `MapAdapter` type/adapter factory used by `MapView`.

- [ ] **Step 7: Commit**

```bash
git add .env.example src/map src/components/map src/views/DashboardView.vue
git commit -m "feat: add dashboard map base layers"
```

---

### Task 6: Build the flight task ranking with time and status switching

**Files:**
- Create: `src/components/tasks/TaskRanking.vue`
- Modify: `src/views/DashboardView.vue`

**Interfaces:**
- Consumes: `dashboardApi.getTaskOverview(resolveDateRange(preset, now))`.
- Consumes: `TimePreset`.
- Internal selected task metric: `'dispatched' | 'dispatching' | 'received' | 'completed'`.

- [ ] **Step 1: Add the five time presets**

Render: 今日、本周、本月、本年、累计. Default to `month` unless the design implementation context specifies another initial period.

Changing the preset recalculates `startTime/endTime` and reloads task data.

- [ ] **Step 2: Render the four actual task states**

Top state selectors:

- 待派发 → `dispatchedNum` / `dispatchedPercent`
- 派发中 → `dispatchingNum` / `dispatchingPercent`
- 已接单 → `receivedNum` / `receivedPercent`
- 已结单 → `completedNum` / `completedPercent`

Do not rename these states.

- [ ] **Step 3: Build organization ranking**

For the currently selected state, derive each child organization value from `taskOverviewRespVoList`, sort descending, and display:

- rank
- organization name
- selected-state count
- selected-state percentage
- horizontal proportion bar

The percentage denominator is that organization’s `taskTotalNum`; where API already provides the matching percent field, display that supplied value.

- [ ] **Step 4: Handle empty and error state**

No organizations → “当前周期暂无任务数据”. Request failure → “任务统计加载失败”. Do not fall back to invented values.

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: exit 0 and no unsupported task status string appears in `TaskRanking.vue`.

- [ ] **Step 6: Commit**

```bash
git add src/components/tasks src/views/DashboardView.vue
git commit -m "feat: add flight task ranking"
```

---

### Task 7: Build organization flight statistics with ECharts

**Files:**
- Create: `src/components/statistics/FlightStatistics.vue`
- Modify: `src/views/DashboardView.vue`

**Interfaces:**
- Consumes: `dashboardApi.getFlightStatistics(range)`.
- Displays organization-level `countViewRespVos`.
- Metric selector: `'recordCount' | 'flightLength' | 'durationHours'`.

- [ ] **Step 1: Reuse the same five time presets**

Flight statistics support 今日、本周、本月、本年、累计 using `resolveDateRange`. Accumulated period starts `2024-01-01`.

- [ ] **Step 2: Add three metric modes**

- 飞行架次: numeric `recordCount`
- 飞行里程: parse `flightLength` for charting, display unit `km`
- 飞行时长: parse `durationHours` for charting, display unit `h`

Do not modify DTO string values in the service layer.

- [ ] **Step 3: Render organization comparison chart**

Use a horizontal bar chart so organization names remain readable on side panels. Data source is `data.countViewRespVos`, not `secondCountViewRespList`.

The chart title/subtitle indicates the selected metric and period. Tooltip shows original formatted value and unit.

- [ ] **Step 4: Resize correctly**

Create one ECharts instance on mount, call `resize()` through `ResizeObserver`, dispose on unmount, and update series/options without recreating the chart instance for every selector change.

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: exit 0; ECharts is instantiated only inside `FlightStatistics.vue`.

- [ ] **Step 6: Commit**

```bash
git add src/components/statistics src/views/DashboardView.vue
git commit -m "feat: add organization flight statistics"
```

---

### Task 8: Final visual integration, wide-screen adaptation, and acceptance verification

**Files:**
- Modify: `src/views/DashboardView.vue`
- Modify: `src/styles/_tokens.scss`
- Modify: `src/styles/dashboard.scss`
- Modify: component-local styles only where required

**Interfaces:**
- Produces: final full-screen dashboard meeting all seven FDE acceptance points.

- [ ] **Step 1: Tune information hierarchy for leadership viewing**

Verify the page reads in this order:

1. platform identity and system time
2. flight scale in left overview
3. center map
4. task distribution and organization ranking
5. organization flight comparison
6. recent flight records

Do not add unrelated bottom trend panels, alert centers, aircraft detail cards or extra navigation.

- [ ] **Step 2: Validate 16:9 baseline at 1920×1080**

Required conditions:

- no body scrollbars
- title/header not clipped
- both side columns fully visible
- map is the largest single region
- TOP10 panel may internally scroll but does not push layout below viewport
- right-side charts do not overlap selectors

- [ ] **Step 3: Validate 21:9, 32:9 and 48:9 layouts**

Use browser responsive mode at representative viewports:

```text
2560×1080   21:9
3840×1080   32:9 class
5760×1080   48:9 class
7680×1440   maximum target
```

Expected: side panels stay within configured `clamp()` widths and extra width expands the central map. No component is stretched horizontally just to fill space.

- [ ] **Step 4: Verify browser-safe APIs**

Core application logic must not depend on Chromium-only experimental APIs. `ResizeObserver` usage must have a safe fallback that triggers map/chart resize on `window.resize` when unavailable.

- [ ] **Step 5: Execute functional acceptance checklist**

Verify manually:

```text
[ ] Login page contains username/password/captcha and enters dashboard after valid mock login
[ ] Logout returns to login page
[ ] Flight overview displays all 9 supplied statistics with correct units
[ ] Flight TOP10 is sorted descending by createTime and uses card layout
[ ] Task ranking switches today/week/month/year/all
[ ] Task ranking switches among 待派发/派发中/已接单/已结单
[ ] Organization task count and percentage change with selected state
[ ] Flight statistics switches among 架次/里程/时长
[ ] Map switches among 卫星/电子/暗色
[ ] Map defaults to Shanghai when no device coordinate exists
[ ] 1920×1080 through 7680×1440 layouts show no global clipping or stretching
```

- [ ] **Step 6: Run final automated checks**

```bash
npm run test:unit
npm run build
```

Expected: both exit 0.

- [ ] **Step 7: Confirm scope residue is absent**

Search source code for unsupported first-phase concepts:

```bash
grep -RniE "Cesium|MapLibre|Zustand|aircraft.position|low-battery|off-route|restricted-zone|2d.*3d|告警中心|异常航段" src || true
```

Expected: no implementation residue from unsupported real-time/3D/alert features.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: complete drone command dashboard"
```

---

## Spec Coverage Check

| Design requirement | Implementation task |
|---|---|
| 登录、退出、验证码 | Task 2 |
| 顶部时间/日期/天气/用户区域 | Task 2 |
| 左中右三栏 + 顶部导航 | Task 1 |
| 飞行总览 9 项接口指标 | Task 3, Task 4 |
| 飞行案例 TOP10 | Task 3, Task 4 |
| TOP10 按时间倒序 | Task 3, Task 4 |
| 飞行任务四状态 | Task 3, Task 6 |
| 今日/本周/本月/本年/累计 | Task 3, Task 6, Task 7 |
| 各组织任务数量及占比 | Task 6 |
| 飞行架次/里程/时长统计 | Task 3, Task 7 |
| 卫星/电子/暗色底图 | Task 5 |
| 无坐标时默认上海 | Task 5 |
| 16:9 / 21:9 / 32:9 / 48:9 | Task 1, Task 8 |
| 1920×1080 ~ 7680×1440 | Task 8 |
| 工单接口保留但不占首屏 | Task 3 |
| 不虚构实时遥测、航迹、告警数据 | Global Constraints, Task 5, Task 8 |

## Self-Review

- No `TBD` / `TODO` / “implement later” placeholders remain.
- Vue 3 / Vue CLI 5.x is used consistently throughout the plan.
- Every rendered business field maps to a documented interface field or an explicitly identified front-end-only value such as generated sequence number/captcha/weather Mock.
- `openWorkOrderOverview` exists in the data service but is not promoted into an unrequested dashboard panel.
- No React, Vite, Zustand, Cesium or 2D/3D dual-engine implementation remains in the planned file structure or tasks.
- Tests are limited to date-range and record-sorting logic plus final build/acceptance checks.
