# 无人机低空指挥调度平台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 FDE 第二期工作坊需求和现有 5 个 Mock 接口，构建 Vue 3 大屏前端，实现登录、飞行总览、飞行案例 TOP10、飞行任务排行榜、飞行统计分析、中央地图底图切换及超宽屏自适应。

**Architecture:** 使用 Vue 3 + Vue CLI 5.x 构建 `/login` 与 `/dashboard`。业务组件统一通过 `dashboardApi` 获取数据，Mock adapter 保持与接口字段一致；地图通过 `MapAdapter` 隔离地图 SDK。页面采用响应式 Grid，中央地图承担主要视觉空间。

**Tech Stack:** Node.js 18+、npm、Vue 3、Vue CLI 5.x、TypeScript、Vue Router 4、Sass、ECharts、Axios、@amap/amap-jsapi-loader、Jest。

**Spec:** `docs/superpowers/specs/2026-09-03-shanghai-low-altitude-drone-dashboard-design.md`

## Global Constraints

- 系统名称固定为“无人机低空指挥调度平台”。
- 页面结构固定为顶部导航 + 左侧业务区 + 中央地图 + 右侧业务区。
- 左侧展示飞行总览、飞行案例 TOP10。
- 右侧展示飞行任务排行榜、飞行统计分析。
- 业务字段严格依据当前接口 DTO，不自行改变字段业务含义。
- 任务状态固定为“待派发 / 派发中 / 已接单 / 已结单”。
- `shelterName` 页面名称固定为“方舱”。
- 地图支持卫星图 / 电子地图 / 暗色主题，默认中心为上海。
- 累计统计起始时间固定为 `2024-01-01`。
- 支持 Chrome、Edge、Firefox、Safari、国产浏览器极速模式。
- 支持 16:9 / 21:9 / 32:9 / 48:9，1920×1080 至 7680×1440。
- 超宽屏新增宽度优先分配给中央地图，左右业务栏保持稳定阅读宽度。
- 测试只覆盖时间范围转换、飞行记录排序等关键纯逻辑，并执行最终构建和人工验收。

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
│   ├── router/index.ts
│   ├── views/
│   │   ├── LoginView.vue
│   │   └── DashboardView.vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.vue
│   │   │   └── DashboardPanel.vue
│   │   ├── overview/FlightOverview.vue
│   │   ├── records/FlightTop10.vue
│   │   ├── tasks/TaskRanking.vue
│   │   ├── statistics/FlightStatistics.vue
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
│   │   └── mock/fdeMockData.ts
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

---

### Task 1: 建立 Vue 3 工程与大屏基础布局

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
- Produces: `/login`、`/dashboard` 两个路由。
- Produces: 顶部、左侧、地图、右侧四个稳定布局区域。

- [ ] **Step 1: 配置依赖**

`package.json` 至少包含：

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

Expected: 生成 `package-lock.json`，依赖安装成功。

- [ ] **Step 2: 配置路由入口**

`src/router/index.ts`：

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

- [ ] **Step 3: 建立大屏 Grid**

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

左列顺序固定为 `FlightOverview`、`FlightTop10`；右列顺序固定为 `TaskRanking`、`FlightStatistics`。

- [ ] **Step 4: 建立视觉 Token**

深色背景、低干扰边框、清晰数字层级；字号使用 `clamp()`。地图区域必须明显大于任一侧栏。

- [ ] **Step 5: 验证并提交**

```bash
npm run build
git add package.json package-lock.json babel.config.js tsconfig.json vue.config.js public src
git commit -m "feat: scaffold drone command dashboard"
```

Expected: build exit 0。

---

### Task 2: 实现登录与顶部导航

**Files:**
- Create: `src/services/authService.ts`
- Create: `src/services/weatherService.ts`
- Create: `src/components/layout/TopNav.vue`
- Modify: `src/views/LoginView.vue`
- Modify: `src/views/DashboardView.vue`
- Modify: `src/router/index.ts`

**Interfaces:**
- Produces: `login(username, password, captcha): boolean`。
- Produces: `isAuthenticated(): boolean`、`logout(): void`。

- [ ] **Step 1: 实现本地登录态**

使用 `sessionStorage` 键 `fde-dashboard-auth`。用户名和密码不能为空，验证码必须与当前显示的四字符验证码一致。

- [ ] **Step 2: 完成登录页**

页面包含：用户名、密码、验证码、验证码刷新、登录按钮、表单错误提示。成功后进入 `/dashboard`。

- [ ] **Step 3: 加入路由保护**

未登录访问 `/dashboard` 时转到 `/login`；退出后清除登录态并返回 `/login`。

- [ ] **Step 4: 完成 TopNav**

左侧：实时时间、星期、日期、天气；中间：系统标题；右侧：用户名、首页、头像、退出。

时间每秒更新一次，组件卸载时清理 interval。

- [ ] **Step 5: 验证并提交**

```bash
npm run build
git add src/services/authService.ts src/services/weatherService.ts src/components/layout/TopNav.vue src/views src/router/index.ts
git commit -m "feat: add login and dashboard navigation"
```

---

### Task 3: 建立 FDE 接口 DTO、Mock 数据和数据服务

**Files:**
- Create: `src/services/types.ts`
- Create: `src/services/mock/fdeMockData.ts`
- Create: `src/services/dashboardApi.ts`
- Create: `src/utils/dateRange.ts`
- Create: `src/utils/dateRange.spec.ts`
- Create: `src/utils/flightRecords.ts`
- Create: `src/utils/flightRecords.spec.ts`

**Interfaces:**
- Produces: `getFlightOverview()`。
- Produces: `getFlyRecords(params)`。
- Produces: `getWorkOrderOverview(range)`。
- Produces: `getTaskOverview(range)`。
- Produces: `getFlightStatistics(range)`。
- Produces: `resolveDateRange(preset, now)`。
- Produces: `sortFlyRecordsNewestFirst(rows)`。

- [ ] **Step 1: 定义接口 DTO**

飞行总览：

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
```

飞行记录：

```ts
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
```

任务统计：

```ts
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
```

飞行统计：

```ts
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

工单 DTO 使用 `workOrderTotalNum`、`toReceiveNum`、`receivedNum`、`completedNum`、`workOrderOverviewRespVos`、`secondWordOderDetails`。

- [ ] **Step 2: 写入 Mock fixture**

飞行总览固定使用：

```ts
{
  shelterNum: 11,
  flyLineNum: 48,
  achieveNum: 156,
  flyerNum: 12,
  workOrderNum: 50,
  recordCount: 168,
  flyPlaneNum: 60,
  flightLength: '1392.47',
  durationHours: '35.1',
  routeId: null
}
```

飞行记录写入已提供的 `1001` 至 `1010` 十条记录；任务总量使用省公司 `120`，下级组织使用 `市公司A=50`、`市公司B=40`、`市公司C=30`；飞行统计总览使用 `168 / 1392.47km / 35.1h` 及已提供的三个组织明细。

- [ ] **Step 3: 实现 dashboardApi**

Vue 组件只能调用 `dashboardApi`，不得直接 import `fdeMockData.ts`。每次返回数据时复制 fixture，避免组件修改共享数据。

- [ ] **Step 4: 实现时间范围**

```ts
export type TimePreset = 'today' | 'week' | 'month' | 'year' | 'all'
```

所有结果输出 `YYYY-MM-DD`。`all` 起始时间固定为 `2024-01-01`。

- [ ] **Step 5: 编写最小关键测试**

`dateRange.spec.ts` 至少验证：

```ts
resolveDateRange('all', new Date('2026-09-03T10:00:00')).startTime === '2024-01-01'
resolveDateRange('month', new Date('2026-09-03T10:00:00')).startTime === '2026-09-01'
resolveDateRange('year', new Date('2026-09-03T10:00:00')).startTime === '2026-01-01'
```

`flightRecords.spec.ts` 验证按 `createTime` 降序排序。

- [ ] **Step 6: 验证并提交**

```bash
npm run test:unit
npm run build
git add src/services src/utils
git commit -m "feat: add FDE dashboard data services"
```

---

### Task 4: 实现飞行总览与飞行案例 TOP10

**Files:**
- Create: `src/components/overview/FlightOverview.vue`
- Create: `src/components/records/FlightTop10.vue`
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 实现飞行总览**

一级核心统计：飞行架次、飞行里程、飞行时长、飞行计划。

二级资源统计：方舱、飞手、航线、工单、成果。

里程显示 `km`，时长显示 `h`。

- [ ] **Step 2: 实现 TOP10**

调用参数：

```ts
{ pageNum: 1, pageSize: 10 }
```

排序后最多展示 10 条卡片。字段固定为：序号、飞行编号、飞行记录名称、飞行航线、执行时间、方舱、飞手。

- [ ] **Step 3: 控制左栏高度**

TOP10 使用面板内部滚动，页面本身保持 `100vh` 无全局纵向滚动。

- [ ] **Step 4: 验证并提交**

```bash
npm run build
git add src/components/overview src/components/records src/views/DashboardView.vue
git commit -m "feat: add flight overview and recent records"
```

---

### Task 5: 实现中央地图与底图切换

**Files:**
- Create: `.env.example`
- Create: `src/map/MapAdapter.ts`
- Create: `src/map/AMapAdapter.ts`
- Create: `src/components/map/BaseLayerSwitch.vue`
- Create: `src/components/map/MapView.vue`
- Modify: `src/views/DashboardView.vue`

**Interfaces:**

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

- [ ] **Step 1: 实现 AMapAdapter**

默认中心：

```ts
const SHANGHAI_CENTER: [number, number] = [121.4737, 31.2304]
```

电子地图使用标准矢量底图；暗色模式切换暗色地图样式；卫星模式使用 `AMap.TileLayer.Satellite`。

- [ ] **Step 2: 配置环境变量**

`.env.example`：

```text
VUE_APP_AMAP_KEY=
VUE_APP_AMAP_SECURITY_CODE=
```

地图服务未配置时，地图区域显示“地图服务未配置”，其他业务模块正常渲染。

- [ ] **Step 3: 完成底图切换控件**

按钮固定为：卫星、电子、暗色。切换只更新地图底图，不重建整页组件。

- [ ] **Step 4: 处理 resize 和销毁**

`MapView.vue` 创建单一 adapter 实例；容器变化时调用 `resize()`；组件卸载时调用 `destroy()`。

- [ ] **Step 5: 验证并提交**

```bash
npm run build
git add .env.example src/map src/components/map src/views/DashboardView.vue
git commit -m "feat: add dashboard map base layers"
```

---

### Task 6: 实现飞行任务排行榜

**Files:**
- Create: `src/components/tasks/TaskRanking.vue`
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 实现时间筛选**

按钮固定为：今日、本周、本月、本年、累计。切换后使用 `resolveDateRange` 重新调用 `getTaskOverview`。

- [ ] **Step 2: 实现四种任务状态**

映射固定为：

```text
待派发 -> dispatchedNum / dispatchedPercent
派发中 -> dispatchingNum / dispatchingPercent
已接单 -> receivedNum / receivedPercent
已结单 -> completedNum / completedPercent
```

- [ ] **Step 3: 实现组织排行**

根据当前状态从 `taskOverviewRespVoList` 提取各组织数量并降序排序。每行显示：排名、组织名、数量、占比、比例条。

- [ ] **Step 4: 实现空状态和错误状态**

空数据显示“当前周期暂无任务数据”；接口失败显示“任务统计加载失败”。

- [ ] **Step 5: 验证并提交**

```bash
npm run build
git add src/components/tasks src/views/DashboardView.vue
git commit -m "feat: add flight task ranking"
```

---

### Task 7: 实现飞行统计分析

**Files:**
- Create: `src/components/statistics/FlightStatistics.vue`
- Modify: `src/views/DashboardView.vue`

- [ ] **Step 1: 实现时间筛选**

使用同一组今日、本周、本月、本年、累计时间范围。

- [ ] **Step 2: 实现三个指标维度**

```text
飞行架次 -> recordCount
飞行里程 -> flightLength，单位 km
飞行时长 -> durationHours，单位 h
```

- [ ] **Step 3: 实现组织横向柱状图**

图表数据使用 `countViewRespVos`。横轴为当前指标值，纵轴为组织名称。tooltip 展示原始值和单位。

- [ ] **Step 4: 管理 ECharts 生命周期**

组件 mount 时创建一次 chart；数据切换使用 `setOption`；尺寸变化调用 `resize()`；卸载时 `dispose()`。

- [ ] **Step 5: 验证并提交**

```bash
npm run build
git add src/components/statistics src/views/DashboardView.vue
git commit -m "feat: add organization flight statistics"
```

---

### Task 8: 完成大屏整合与验收

**Files:**
- Modify: `src/views/DashboardView.vue`
- Modify: `src/styles/_tokens.scss`
- Modify: `src/styles/dashboard.scss`
- Modify: 各组件局部样式

- [ ] **Step 1: 完成信息层级**

最终首屏只包含：顶部导航、飞行总览、飞行案例 TOP10、中央地图、飞行任务排行榜、飞行统计分析。

- [ ] **Step 2: 验证 1920×1080**

要求：

```text
无 body 滚动条
标题完整
左右业务栏完整
地图为最大单一区域
TOP10 只在自身面板内部滚动
右侧筛选和图表不重叠
```

- [ ] **Step 3: 验证超宽屏**

浏览器分别检查：

```text
2560×1080
3840×1080
5760×1080
7680×1440
```

要求：左右栏保持 `clamp()` 宽度，中央地图吸收主要新增宽度，无整体拉伸和裁切。

- [ ] **Step 4: 执行功能验收**

```text
[ ] 登录页包含用户名、密码、验证码
[ ] 登录成功进入大屏，退出返回登录页
[ ] 飞行总览正确展示 9 项统计数据
[ ] 飞行案例 TOP10 按 createTime 倒序，使用卡片展示
[ ] 任务排行支持 今日/本周/本月/本年/累计
[ ] 任务状态支持 待派发/派发中/已接单/已结单
[ ] 组织任务数量和占比随状态切换
[ ] 飞行统计支持 架次/里程/时长
[ ] 地图支持 卫星/电子/暗色
[ ] 地图默认上海
[ ] 1920×1080 至 7680×1440 布局无全局裁切和拉伸
```

- [ ] **Step 5: 最终检查**

```bash
npm run test:unit
npm run build
```

Expected: all pass。

- [ ] **Step 6: Commit**

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
| 顶部 + 左/中/右三栏 | Task 1 |
| 飞行总览 9 项统计 | Task 3, Task 4 |
| 飞行案例 TOP10 | Task 3, Task 4 |
| TOP10 时间倒序 | Task 3, Task 4 |
| 任务四状态 | Task 3, Task 6 |
| 今日/本周/本月/本年/累计 | Task 3, Task 6, Task 7 |
| 各组织任务数量及占比 | Task 6 |
| 飞行架次/里程/时长分析 | Task 3, Task 7 |
| 卫星/电子/暗色底图 | Task 5 |
| 默认上海视口 | Task 5 |
| 16:9 / 21:9 / 32:9 / 48:9 | Task 1, Task 8 |
| 1920×1080 ~ 7680×1440 | Task 8 |
| 工单接口数据层 | Task 3 |

## Self-Review

- 所有首屏业务字段均映射到当前接口字段。
- 技术栈、目录、任务和命令保持一致。
- 计划中无 `TBD`、`TODO` 或未定义实现步骤。
- 测试范围限制在关键业务纯逻辑和最终构建验收。
