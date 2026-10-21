<template>
  <!-- 添加 dark 类以激活 Element Plus 暗黑主题 -->
  <div class="dark app-wrapper">
    <IotDashboard />
    <!-- <HelloWorld /> -->
  </div>
</template>

<script setup lang="ts">
import IotDashboard from "./components/IotDashboard.vue";
// import HelloWorld from "./components/HelloWorld.vue";
</script>

<style>
/* 全局基础样式重置 */
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #0b0f19;
  overflow: hidden;
}
</style>
