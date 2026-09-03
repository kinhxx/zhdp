<template>
  <main class="dashboard-view">
    <TopNav />
    <section class="dashboard-grid">
      <aside class="dashboard-column dashboard-column--left">
        <DashboardPanel title="飞行总览">
          <FlightOverview />
        </DashboardPanel>
        <DashboardPanel title="飞行案例 TOP10" grow>
          <FlightTop10 />
        </DashboardPanel>
      </aside>
      <section class="dashboard-map-shell">
        <MapView />
      </section>
      <aside class="dashboard-column dashboard-column--right">
        <DashboardPanel title="飞行任务排行榜" />
        <DashboardPanel title="飞行统计分析" grow />
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import DashboardPanel from '@/components/layout/DashboardPanel.vue'
import TopNav from '@/components/layout/TopNav.vue'
import FlightOverview from '@/components/overview/FlightOverview.vue'
import FlightTop10 from '@/components/records/FlightTop10.vue'
import MapView from '@/components/map/MapView.vue'
</script>
