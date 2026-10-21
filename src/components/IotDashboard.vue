<template>
  <div class="dashboard-container">
    <!-- ==================== 顶部标题栏 ==================== -->
    <header class="top-header">
      <div class="header-left">
        <div class="logo-dot"></div>
        <span class="header-sub">IoT Platform</span>
      </div>
      <div class="header-center">
        <h1 class="header-title">
          <span class="title-decor left">◆</span>
          智慧管网物联网监控中心
          <span class="title-decor right">◆</span>
        </h1>
        <div class="header-line"></div>
      </div>
      <div class="header-right">
        <span class="header-time">{{ currentTime }}</span>
        <el-badge :value="kpi.alarm" :hidden="kpi.alarm === 0" type="danger">
          <el-icon :size="20" class="bell-icon"><Bell /></el-icon>
        </el-badge>
      </div>
    </header>

    <!-- ==================== 主体内容 ==================== -->
    <div class="main-body">
      <!-- ===== 左侧栏 ===== -->
      <aside class="side-panel left-panel">
        <!-- 设备分布饼图 -->
        <div class="panel-card">
          <div class="panel-title">
            <span class="dot green"></span>设备状态分布
          </div>
          <div ref="pieChartRef" class="panel-chart"></div>
        </div>
        <!-- 告警趋势柱状图 -->
        <div class="panel-card">
          <div class="panel-title">
            <span class="dot red"></span>近7日告警趋势
          </div>
          <div ref="barChartRef" class="panel-chart"></div>
        </div>
      </aside>

      <!-- ===== 中间主区域 ===== -->
      <section class="center-area">
        <!-- KPI 卡片 -->
        <div class="kpi-section">
          <div class="kpi-card" v-for="item in kpiList" :key="item.label">
            <div
              class="kpi-icon-wrap"
              :style="{ background: item.color + '15' }"
            >
              <div class="kpi-icon" :style="{ color: item.color }">
                <el-icon :size="26"><component :is="item.icon" /></el-icon>
              </div>
              <div
                class="kpi-glow"
                :style="{ boxShadow: `0 0 20px ${item.color}30` }"
              ></div>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">{{ item.label }}</div>
              <div class="kpi-value" :style="{ color: item.color }">
                <span class="kpi-number">{{ item.value }}</span>
                <span v-if="item.unit" class="kpi-unit">{{ item.unit }}</span>
              </div>
            </div>
            <div class="kpi-trend" :class="item.trend">
              <el-icon :size="14">
                <component :is="item.trend === 'up' ? 'Top' : 'Bottom'" />
              </el-icon>
              {{ item.trendValue }}
            </div>
          </div>
        </div>

        <!-- 图表区 -->
        <div class="chart-section">
          <div class="chart-card wide">
            <div class="chart-title">
              <span class="dot blue"></span>温湿度时序监测 (实时流)
              <el-tag
                size="small"
                type="success"
                effect="plain"
                class="live-tag"
              >
                <span class="live-dot"></span> LIVE
              </el-tag>
            </div>
            <div ref="lineChartRef" class="chart-content"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">
              <span class="dot orange"></span>管网压力仪表盘
            </div>
            <div ref="gaugeChartRef" class="chart-content"></div>
          </div>
        </div>

        <!-- 设备状态表格 -->
        <div class="table-section">
          <div class="chart-card table-card">
            <div class="chart-title">
              <span class="dot blue"></span>设备运行状态明细
              <div class="table-actions">
                <el-input
                  v-model="searchText"
                  placeholder="搜索设备编号..."
                  size="small"
                  :prefix-icon="Search"
                  clearable
                  class="search-input"
                />
                <el-button size="small" :icon="Refresh" @click="initTableData">
                  刷新
                </el-button>
              </div>
            </div>
            <el-table
              :data="filteredTableData"
              style="width: 100%"
              height="100%"
              :header-cell-style="{
                backgroundColor: '#1a1a2e',
                color: '#8892b0',
                borderColor: '#233554',
                fontSize: '13px',
              }"
              :cell-style="{
                backgroundColor: 'transparent',
                color: '#ccd6f6',
                borderColor: '#233554',
              }"
              :row-class-name="tableRowClassName"
            >
              <el-table-column prop="id" label="设备编号" width="140">
                <template #default="{ row }">
                  <span class="device-id">{{ row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="temperature" label="温度 (°C)" width="120">
                <template #default="{ row }">
                  <span :class="getTempClass(row.temperature)">{{
                    row.temperature
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="humidity" label="湿度 (%)" width="120" />
              <el-table-column prop="pressure" label="压力 (MPa)" width="120">
                <template #default="{ row }">
                  <span :class="getPressureClass(row.pressure)">{{
                    row.pressure
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="运行状态" width="120">
                <template #default="{ row }">
                  <span class="status-indicator" :class="row.status">
                    <span class="status-dot"></span>
                    {{
                      row.status === "online"
                        ? "在线"
                        : row.status === "alarm"
                          ? "告警"
                          : "离线"
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="lastUpdate" label="最近上报时间" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default>
                  <el-button type="primary" link size="small">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </section>

      <!-- ===== 右侧栏 ===== -->
      <aside class="side-panel right-panel">
        <!-- 实时告警滚动 -->
        <div class="panel-card alert-panel">
          <div class="panel-title">
            <span class="dot red"></span>实时告警
            <span class="alert-count">{{ alertList.length }}</span>
          </div>
          <div class="alert-list">
            <TransitionGroup name="alert">
              <div
                v-for="alert in alertList"
                :key="alert.id"
                class="alert-item"
                :class="alert.level"
              >
                <div class="alert-icon">
                  <el-icon :size="16"><Warning /></el-icon>
                </div>
                <div class="alert-content">
                  <div class="alert-msg">{{ alert.message }}</div>
                  <div class="alert-time">{{ alert.time }}</div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
        <!-- 环境指标雷达图 -->
        <div class="panel-card">
          <div class="panel-title">
            <span class="dot blue"></span>环境综合指标
          </div>
          <div ref="radarChartRef" class="panel-chart"></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  shallowRef,
  computed,
  nextTick,
} from "vue";
import * as echarts from "echarts";
import {
  Monitor,
  Cpu,
  Warning,
  Timer,
  Bell,
  Search,
  Refresh,
  Top,
  Bottom,
} from "@element-plus/icons-vue";

// ================= 类型定义 =================
interface Device {
  id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  status: "online" | "offline" | "alarm";
  lastUpdate: string;
}

interface AlertItem {
  id: number;
  message: string;
  time: string;
  level: "critical" | "warning" | "info";
}

// ================= 响应式数据 =================
const currentTime = ref("");
const searchText = ref("");
let alertIdCounter = 0;

const kpi = reactive({
  total: 128,
  online: 115,
  alarm: 3,
  frequency: "1s",
});

const kpiList = computed(() => [
  {
    label: "设备总数",
    value: kpi.total,
    icon: Cpu,
    color: "#00d4ff",
    unit: "台",
    trend: "up" as const,
    trendValue: "+2",
  },
  {
    label: "在线设备",
    value: kpi.online,
    icon: Monitor,
    color: "#00e396",
    unit: "台",
    trend: "up" as const,
    trendValue: "+5",
  },
  {
    label: "告警数量",
    value: kpi.alarm,
    icon: Warning,
    color: "#ff4560",
    unit: "条",
    trend: "down" as const,
    trendValue: "-1",
  },
  {
    label: "采集频率",
    value: kpi.frequency,
    icon: Timer,
    color: "#feb019",
    unit: "",
    trend: "up" as const,
    trendValue: "稳定",
  },
]);

const tableData = ref<Device[]>([]);
const alertList = ref<AlertItem[]>([]);
const timeData = ref<string[]>([]);
const tempData = ref<number[]>([]);
const humiData = ref<number[]>([]);

const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value;
  return tableData.value.filter((d) =>
    d.id.toLowerCase().includes(searchText.value.toLowerCase()),
  );
});

// ================= ECharts 实例 =================
const lineChartRef = ref<HTMLElement | null>(null);
const gaugeChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);
const radarChartRef = ref<HTMLElement | null>(null);

const lineChartInstance = shallowRef<echarts.ECharts | null>(null);
const gaugeChartInstance = shallowRef<echarts.ECharts | null>(null);
const pieChartInstance = shallowRef<echarts.ECharts | null>(null);
const barChartInstance = shallowRef<echarts.ECharts | null>(null);
const radarChartInstance = shallowRef<echarts.ECharts | null>(null);

let timerId: number | null = null;
let clockId: number | null = null;
const MAX_POINTS = 30;

// ================= 时钟 =================
const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ================= 初始化表格 =================
const initTableData = () => {
  const devices: Device[] = [];
  for (let i = 1; i <= 10; i++) {
    devices.push({
      id: `DEV-${String(i).padStart(4, "0")}`,
      temperature: +(20 + Math.random() * 10).toFixed(1),
      humidity: +(40 + Math.random() * 20).toFixed(1),
      pressure: +(50 + Math.random() * 45).toFixed(1),
      status: "online",
      lastUpdate: new Date().toLocaleTimeString(),
    });
  }
  tableData.value = devices;
};

// ================= 折线图 =================
const initLineChart = () => {
  if (!lineChartRef.value) return;
  lineChartInstance.value = echarts.init(lineChartRef.value);
  lineChartInstance.value.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10,15,30,0.9)",
      borderColor: "#233554",
      textStyle: { color: "#ccd6f6" },
    },
    legend: {
      data: ["温度 (°C)", "湿度 (%)"],
      textStyle: { color: "#8892b0" },
      top: 5,
      right: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "18%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: timeData.value,
      boundaryGap: false,
      axisLabel: { color: "#8892b0", fontSize: 11 },
      axisLine: { lineStyle: { color: "#233554" } },
    },
    yAxis: [
      {
        type: "value",
        name: "温度",
        nameTextStyle: { color: "#8892b0" },
        axisLabel: { color: "#8892b0" },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      },
      {
        type: "value",
        name: "湿度",
        nameTextStyle: { color: "#8892b0" },
        axisLabel: { color: "#8892b0" },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 20,
        bottom: 5,
        borderColor: "#233554",
        backgroundColor: "#0a0f1e",
        fillerColor: "rgba(0,212,255,0.15)",
        handleStyle: { color: "#00d4ff", borderColor: "#00d4ff" },
        textStyle: { color: "#8892b0" },
        dataBackground: {
          lineStyle: { color: "#233554" },
          areaStyle: { color: "rgba(0,212,255,0.05)" },
        },
      },
    ],
    series: [
      {
        name: "温度 (°C)",
        type: "line",
        data: tempData.value,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#ff4560" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255,69,96,0.25)" },
            { offset: 1, color: "rgba(255,69,96,0)" },
          ]),
        },
      },
      {
        name: "湿度 (%)",
        type: "line",
        yAxisIndex: 1,
        data: humiData.value,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#00d4ff" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0,212,255,0.25)" },
            { offset: 1, color: "rgba(0,212,255,0)" },
          ]),
        },
      },
    ],
  });
};

// ================= 仪表盘 =================
const initGaugeChart = () => {
  if (!gaugeChartRef.value) return;
  gaugeChartInstance.value = echarts.init(gaugeChartRef.value);
  gaugeChartInstance.value.setOption({
    backgroundColor: "transparent",
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: "85%",
        center: ["50%", "55%"],
        progress: { show: true, width: 18 },
        pointer: {
          show: true,
          length: "55%",
          width: 5,
          itemStyle: { color: "#auto" },
        },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.6, "#00e396"],
              [0.8, "#feb019"],
              [1, "#ff4560"],
            ],
          },
        },
        axisTick: {
          distance: -22,
          length: 6,
          lineStyle: { color: "#fff", width: 1.5 },
        },
        splitLine: {
          distance: -25,
          length: 15,
          lineStyle: { color: "#fff", width: 2 },
        },
        axisLabel: { color: "#8892b0", distance: 30, fontSize: 11 },
        detail: {
          valueAnimation: true,
          formatter: "{value} MPa",
          color: "#fff",
          fontSize: 18,
          offsetCenter: [0, "70%"],
        },
        title: { offsetCenter: [0, "90%"], fontSize: 13, color: "#8892b0" },
        data: [{ value: 0, name: "管网压力" }],
      },
    ],
  });
};

// ================= 饼图 =================
const initPieChart = () => {
  if (!pieChartRef.value) return;
  pieChartInstance.value = echarts.init(pieChartRef.value);
  pieChartInstance.value.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(10,15,30,0.9)",
      borderColor: "#233554",
      textStyle: { color: "#ccd6f6" },
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: { color: "#8892b0", fontSize: 12 },
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: "#0b0f19", borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
            color: "#fff",
          },
        },
        data: [
          { value: 115, name: "在线", itemStyle: { color: "#00e396" } },
          { value: 10, name: "离线", itemStyle: { color: "#5a6580" } },
          { value: 3, name: "告警", itemStyle: { color: "#ff4560" } },
        ],
      },
    ],
  });
};

// ================= 柱状图 =================
const initBarChart = () => {
  if (!barChartRef.value) return;
  barChartInstance.value = echarts.init(barChartRef.value);
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const alarmData = [12, 8, 15, 6, 20, 9, 3];
  barChartInstance.value.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10,15,30,0.9)",
      borderColor: "#233554",
      textStyle: { color: "#ccd6f6" },
    },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "10%" },
    xAxis: {
      type: "category",
      data: days,
      axisLabel: { color: "#8892b0", fontSize: 11 },
      axisLine: { lineStyle: { color: "#233554" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#8892b0" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      {
        type: "bar",
        data: alarmData,
        barWidth: "40%",
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#ff4560" },
            { offset: 1, color: "rgba(255,69,96,0.2)" },
          ]),
        },
      },
    ],
  });
};

// ================= 雷达图 =================
const initRadarChart = () => {
  if (!radarChartRef.value) return;
  radarChartInstance.value = echarts.init(radarChartRef.value);
  radarChartInstance.value.setOption({
    backgroundColor: "transparent",
    radar: {
      indicator: [
        { name: "温度", max: 50 },
        { name: "湿度", max: 100 },
        { name: "压力", max: 100 },
        { name: "振动", max: 100 },
        { name: "流量", max: 100 },
      ],
      shape: "polygon",
      splitNumber: 4,
      axisName: { color: "#8892b0", fontSize: 11 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      splitArea: {
        areaStyle: { color: ["rgba(0,212,255,0.02)", "rgba(0,212,255,0.04)"] },
      },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [28, 55, 65, 30, 72],
            name: "当前环境",
            areaStyle: { color: "rgba(0,212,255,0.15)" },
            lineStyle: { color: "#00d4ff", width: 2 },
            itemStyle: { color: "#00d4ff" },
          },
        ],
      },
    ],
  });
};

// ================= 数据流模拟 =================
const updateStreamData = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();

  const newTemp = +(20 + Math.random() * 10).toFixed(1);
  const newHumi = +(40 + Math.random() * 20).toFixed(1);
  const newPressure = +(50 + Math.random() * 45).toFixed(1);

  // 折线图
  timeData.value.push(timeStr);
  tempData.value.push(newTemp);
  humiData.value.push(newHumi);
  if (timeData.value.length > MAX_POINTS) {
    timeData.value.shift();
    tempData.value.shift();
    humiData.value.shift();
  }
  lineChartInstance.value?.setOption({
    xAxis: { data: timeData.value },
    series: [{ data: tempData.value }, { data: humiData.value }],
  });

  // 仪表盘
  gaugeChartInstance.value?.setOption({
    series: [{ data: [{ value: newPressure, name: "管网压力" }] }],
  });

  // 表格
  tableData.value.forEach((device) => {
    if (Math.random() > 0.6) {
      device.temperature = +(20 + Math.random() * 10).toFixed(1);
      device.humidity = +(40 + Math.random() * 20).toFixed(1);
      device.pressure = +(50 + Math.random() * 45).toFixed(1);
      device.lastUpdate = timeStr;
      if (device.pressure > 80) device.status = "alarm";
      else if (Math.random() > 0.95) device.status = "offline";
      else device.status = "online";
    }
  });

  // KPI
  kpi.online = tableData.value.filter((d) => d.status !== "offline").length;
  kpi.alarm = tableData.value.filter((d) => d.status === "alarm").length;

  // 饼图
  const onlineCount = tableData.value.filter(
    (d) => d.status === "online",
  ).length;
  const offlineCount = tableData.value.filter(
    (d) => d.status === "offline",
  ).length;
  const alarmCount = tableData.value.filter((d) => d.status === "alarm").length;
  pieChartInstance.value?.setOption({
    series: [
      {
        data: [
          { value: onlineCount, name: "在线", itemStyle: { color: "#00e396" } },
          {
            value: offlineCount,
            name: "离线",
            itemStyle: { color: "#5a6580" },
          },
          { value: alarmCount, name: "告警", itemStyle: { color: "#ff4560" } },
        ],
      },
    ],
  });

  // 雷达图
  radarChartInstance.value?.setOption({
    series: [
      {
        data: [
          {
            value: [
              newTemp,
              newHumi,
              newPressure,
              +(20 + Math.random() * 30).toFixed(0),
              +(50 + Math.random() * 40).toFixed(0),
            ],
            name: "当前环境",
            areaStyle: { color: "rgba(0,212,255,0.15)" },
            lineStyle: { color: "#00d4ff", width: 2 },
            itemStyle: { color: "#00d4ff" },
          },
        ],
      },
    ],
  });

  // 随机告警
  if (Math.random() > 0.7) {
    const messages = [
      "DEV-0003 管网压力超阈值 (85.2 MPa)",
      "DEV-0007 温度异常升高 (31.5°C)",
      "DEV-0001 设备离线，请检查网络",
      "DEV-0005 湿度传感器数据异常",
      "DEV-0009 振动频率超出正常范围",
    ];
    const levels: AlertItem["level"][] = ["critical", "warning", "info"];
    alertList.value.unshift({
      id: ++alertIdCounter,
      message: messages[Math.floor(Math.random() * messages.length)],
      time: timeStr,
      level: levels[Math.floor(Math.random() * levels.length)],
    });
    if (alertList.value.length > 8) alertList.value.pop();
  }
};

// ================= 辅助方法 =================
const tableRowClassName = ({ row }: { row: Device }) => {
  if (row.status === "alarm") return "alarm-row";
  if (row.status === "offline") return "offline-row";
  return "";
};

const getTempClass = (temp: number) => {
  if (temp > 28) return "text-danger";
  if (temp < 22) return "text-info";
  return "text-normal";
};

const getPressureClass = (pressure: number) => {
  if (pressure > 80) return "text-danger";
  if (pressure > 60) return "text-warning";
  return "text-normal";
};

const handleResize = () => {
  [
    lineChartInstance,
    gaugeChartInstance,
    pieChartInstance,
    barChartInstance,
    radarChartInstance,
  ].forEach((inst) => inst.value?.resize());
};

// ================= 生命周期 =================
onMounted(async () => {
  updateClock();
  clockId = window.setInterval(updateClock, 1000);

  initTableData();
  await nextTick();

  initLineChart();
  initGaugeChart();
  initPieChart();
  initBarChart();
  initRadarChart();
  timerId = window.setInterval(updateStreamData, 1000);

  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
  if (clockId) clearInterval(clockId);
  [
    lineChartInstance,
    gaugeChartInstance,
    pieChartInstance,
    barChartInstance,
    radarChartInstance,
  ].forEach((inst) => {
    inst.value?.dispose();
    inst.value = null;
  });
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: auto;
}
/* ==================== 全局容器 ==================== */
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 👈 保持固定高度 */
  background: #060a13;
  color: #ccd6f6;
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", sans-serif;
  overflow: hidden; /* 👈 改为 hidden，让内部元素处理滚动 */
}
/* ==================== 顶部标题栏 ==================== */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: linear-gradient(180deg, #0a1128 0%, #060a13 100%);
  border-bottom: 1px solid #1a2744;
  flex-shrink: 0;
  position: relative;
}

.top-header::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff40, transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00d4ff;
  box-shadow: 0 0 10px #00d4ff80;
  animation: breathe 2s ease-in-out infinite;
}

.header-sub {
  font-size: 13px;
  color: #8892b0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #e6f1ff;
  letter-spacing: 6px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-decor {
  color: #00d4ff;
  font-size: 12px;
  opacity: 0.6;
}

.header-line {
  height: 2px;
  margin-top: 4px;
  background: linear-gradient(90deg, transparent, #00d4ff60, transparent);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-time {
  font-size: 14px;
  color: #8892b0;
  font-family: "Roboto Mono", monospace;
}

.bell-icon {
  color: #8892b0;
  cursor: pointer;
  transition: color 0.3s;
}

.bell-icon:hover {
  color: #00d4ff;
}

/* ==================== 主体布局 ==================== */
.main-body {
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr 260px;
  gap: 12px;
  padding: 12px;
  min-height: 0;
  overflow: auto; /* 👈 改为 auto，允许滚动 */
}

/* ==================== 侧边面板 ==================== */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: auto; /* 👈 新增：允许侧边栏滚动 */
}

.panel-card {
  background: linear-gradient(135deg, #0d1321 0%, #111827 100%);
  border: 1px solid #1a2744;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto; /* 👈 改为不自动伸缩，保持内容高度 */
  min-height: 200px; /* 👈 设置最小高度 */
  overflow: visible; /* 👈 改为 visible*/
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: #8892b0;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.panel-chart {
  flex: 1;
  min-height: 150px;
}

/* ==================== 中间区域 ==================== */
.center-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: auto; /* 👈 改为 auto，允许中间区域滚动 */
  min-width: 0;
}
/* ==================== KPI 卡片 ==================== */
.kpi-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  flex-shrink: 0;
}

.kpi-card {
  background: linear-gradient(135deg, #0d1321 0%, #111827 100%);
  border: 1px solid #1a2744;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  transition:
    transform 0.3s,
    border-color 0.3s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: #233554;
}

.kpi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.kpi-glow {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  opacity: 0.5;
  animation: breathe 3s ease-in-out infinite;
}

.kpi-label {
  font-size: 12px;
  color: #8892b0;
  margin-bottom: 4px;
}

.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.kpi-number {
  font-size: 26px;
  font-weight: 700;
  font-family: "DIN Alternate", "Roboto Mono", monospace;
}

.kpi-unit {
  font-size: 12px;
  color: #8892b0;
  margin-left: 2px;
}

.kpi-trend {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 4px;
}

.kpi-trend.up {
  color: #00e396;
  background: rgba(0, 227, 150, 0.1);
}

.kpi-trend.down {
  color: #ff4560;
  background: rgba(255, 69, 96, 0.1);
}

/* ==================== 图表区域 ==================== */
.chart-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;
  min-height: 300px; /* 👈 设置固定最小高度 */
  flex: 0 0 auto; /* 👈 改为不自动伸缩 */
}

.chart-card {
  background: linear-gradient(135deg, #0d1321 0%, #111827 100%);
  border: 1px solid #1a2744;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #e6f1ff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.chart-content {
  flex: 1;
  min-height: 200px;
}

.live-tag {
  margin-left: auto;
  border: none !important;
  background: rgba(0, 227, 150, 0.1) !important;
  color: #00e396 !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00e396;
  animation: breathe 1.5s ease-in-out infinite;
}

/* ==================== 表格区域 ==================== */
.table-section {
  min-height: 200px;
  max-height: 400px;
  flex: 0 0 auto;
}
.table-card {
  height: 100%;
}

.table-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.search-input {
  width: 180px;
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #0d1321;
  --el-table-row-hover-bg-color: rgba(0, 212, 255, 0.05);
  --el-table-border-color: #1a2744;
  --el-table-text-color: #ccd6f6;
  --el-table-header-text-color: #8892b0;
}

:deep(.alarm-row) {
  background-color: rgba(255, 69, 96, 0.05) !important;
}

:deep(.offline-row) {
  opacity: 0.4;
}

.device-id {
  font-family: "Roboto Mono", monospace;
  color: #00d4ff;
  font-size: 13px;
}

.text-danger {
  color: #ff4560;
  font-weight: 600;
}
.text-warning {
  color: #feb019;
}
.text-info {
  color: #00d4ff;
}
.text-normal {
  color: #ccd6f6;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-indicator.online .status-dot {
  background: #00e396;
  box-shadow: 0 0 6px #00e39680;
}

.status-indicator.alarm .status-dot {
  background: #ff4560;
  box-shadow: 0 0 6px #ff456080;
  animation: breathe 1s ease-in-out infinite;
}

.status-indicator.offline .status-dot {
  background: #5a6580;
}

/* ==================== 告警面板 ==================== */
.alert-panel {
  flex: 1.2;
}

.alert-count {
  margin-left: auto;
  background: #ff4560;
  color: #fff;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 600;
}

.alert-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.alert-list::-webkit-scrollbar {
  width: 3px;
}

.alert-list::-webkit-scrollbar-thumb {
  background: #233554;
  border-radius: 3px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  border-left: 3px solid;
  background: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
}

.alert-item.critical {
  border-left-color: #ff4560;
  background: rgba(255, 69, 96, 0.05);
}

.alert-item.critical .alert-icon {
  color: #ff4560;
}

.alert-item.warning {
  border-left-color: #feb019;
  background: rgba(254, 176, 25, 0.05);
}

.alert-item.warning .alert-icon {
  color: #feb019;
}

.alert-item.info {
  border-left-color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}

.alert-item.info .alert-icon {
  color: #00d4ff;
}

.alert-msg {
  font-size: 12px;
  color: #ccd6f6;
  line-height: 1.4;
}

.alert-time {
  font-size: 11px;
  color: #5a6580;
  margin-top: 2px;
}

/* ==================== 装饰点 ==================== */
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.green {
  background: #00e396;
  box-shadow: 0 0 6px #00e39660;
}
.dot.red {
  background: #ff4560;
  box-shadow: 0 0 6px #ff456060;
}
.dot.blue {
  background: #00d4ff;
  box-shadow: 0 0 6px #00d4ff60;
}
.dot.orange {
  background: #feb019;
  box-shadow: 0 0 6px #feb01960;
}

/* ==================== 动画 ==================== */
@keyframes breathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.alert-enter-active {
  transition: all 0.4s ease;
}

.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 1400px) and (min-width: 1025px) {
  .main-body {
    grid-template-columns: 220px 1fr 220px; /* 缩小侧边栏宽度 */
  }
  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 2. 小屏幕：才切换为上下单列布局 */
@media (max-width: 1024px) {
  .main-body {
    grid-template-columns: 1fr;
  }
  .side-panel {
    /* 如果小屏幕下不想显示侧边栏，可以取消下面的注释 */
    /* display: none; */
  }
  .kpi-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .chart-section {
    grid-template-columns: 1fr;
  }
}
</style>
