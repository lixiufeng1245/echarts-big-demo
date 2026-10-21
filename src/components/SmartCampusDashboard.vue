<template>
  <div class="smart-campus">
    <!-- 顶部标题栏 -->
    <header class="top-header">
      <div class="header-left">
        <div class="logo-icon">
          <el-icon :size="24"><OfficeBuilding /></el-icon>
        </div>
        <div class="header-info">
          <div class="header-title">智慧园区综合管控平台</div>
          <div class="header-subtitle">Smart Campus Management Platform</div>
        </div>
      </div>
      <div class="header-center">
        <div class="weather-info">
          <el-icon :size="20"><Sunny /></el-icon>
          <span>晴 26°C</span>
          <span class="weather-detail">湿度 45% | 风速 3.2m/s</span>
        </div>
      </div>
      <div class="header-right">
        <div class="time-display">
          <div class="time-date">{{ currentDate }}</div>
          <div class="time-clock">{{ currentTime }}</div>
        </div>
        <div class="user-info">
          <el-avatar
            :size="32"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span>管理员</span>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <aside class="left-panel">
        <!-- 园区概览 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon">📊</span>
            <span class="panel-title">园区概览</span>
          </div>
          <div class="overview-stats">
            <div class="stat-item">
              <div class="stat-value">{{ campusData.totalArea }}</div>
              <div class="stat-label">总面积 (万㎡)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ campusData.buildingCount }}</div>
              <div class="stat-label">建筑数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ campusData.greenRate }}%</div>
              <div class="stat-label">绿化率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ campusData.parkingSpaces }}</div>
              <div class="stat-label">停车位</div>
            </div>
          </div>
        </div>

        <!-- 能耗监测 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon">⚡</span>
            <span class="panel-title">实时能耗监测</span>
            <el-tag size="small" type="success" effect="plain">实时</el-tag>
          </div>
          <div ref="energyChartRef" class="chart-container"></div>
        </div>

        <!-- 安防监控 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon">️</span>
            <span class="panel-title">安防告警</span>
            <el-badge :value="securityAlerts.length" type="danger" />
          </div>
          <div class="alert-list">
            <TransitionGroup name="slide">
              <div
                v-for="alert in securityAlerts"
                :key="alert.id"
                class="alert-item"
                :class="alert.level"
              >
                <div class="alert-time">{{ alert.time }}</div>
                <div class="alert-content">{{ alert.message }}</div>
                <div class="alert-location">{{ alert.location }}</div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </aside>

      <!-- 中间 3D 园区 -->
      <section class="center-3d">
        <div ref="threeContainer" class="three-container"></div>

        <!-- 3D 场景覆盖层 -->
        <div class="scene-overlay">
          <div class="overlay-top">
            <div class="scene-title">
              <span class="title-dot"></span>
              3D 园区全景
            </div>
            <div class="scene-controls">
              <el-button-group>
                <el-button
                  size="small"
                  :type="viewMode === 'day' ? 'primary' : ''"
                  @click="switchView('day')"
                >
                  日间
                </el-button>
                <el-button
                  size="small"
                  :type="viewMode === 'night' ? 'primary' : ''"
                  @click="switchView('night')"
                >
                  夜间
                </el-button>
              </el-button-group>
              <el-button size="small" :icon="Refresh" @click="resetCamera"
                >重置视角</el-button
              >
            </div>
          </div>

          <div class="overlay-bottom">
            <div class="quick-stats">
              <div class="quick-stat">
                <div class="stat-number">{{ onlineDevices }}</div>
                <div class="stat-desc">在线设备</div>
              </div>
              <div class="quick-stat">
                <div class="stat-number">{{ todayVisitors }}</div>
                <div class="stat-desc">今日访客</div>
              </div>
              <div class="quick-stat">
                <div class="stat-number">{{ parkingUsage }}%</div>
                <div class="stat-desc">车位使用率</div>
              </div>
              <div class="quick-stat">
                <div class="stat-number">{{ energyToday }}</div>
                <div class="stat-desc">今日能耗 (kWh)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 建筑信息弹窗 -->
        <div v-if="selectedBuilding" class="building-info-popup">
          <div class="popup-header">
            <h3>{{ selectedBuilding.name }}</h3>
            <el-button text @click="selectedBuilding = null">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="popup-content">
            <div class="info-row">
              <span class="info-label">楼层数：</span>
              <span>{{ selectedBuilding.floors }} 层</span>
            </div>
            <div class="info-row">
              <span class="info-label">建筑面积：</span>
              <span>{{ selectedBuilding.area }} ㎡</span>
            </div>
            <div class="info-row">
              <span class="info-label">当前人数：</span>
              <span>{{ selectedBuilding.currentPeople }} 人</span>
            </div>
            <div class="info-row">
              <span class="info-label">能耗状态：</span>
              <el-tag
                :type="
                  selectedBuilding.energyStatus === 'normal'
                    ? 'success'
                    : 'warning'
                "
                size="small"
              >
                {{
                  selectedBuilding.energyStatus === "normal" ? "正常" : "偏高"
                }}
              </el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧面板 -->
      <aside class="right-panel">
        <!-- 环境监测 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon">🌡️</span>
            <span class="panel-title">环境监测</span>
          </div>
          <div class="environment-grid">
            <div class="env-item">
              <div class="env-icon">🌡️</div>
              <div class="env-value">{{ environment.temperature }}°C</div>
              <div class="env-label">温度</div>
            </div>
            <div class="env-item">
              <div class="env-icon">💧</div>
              <div class="env-value">{{ environment.humidity }}%</div>
              <div class="env-label">湿度</div>
            </div>
            <div class="env-item">
              <div class="env-icon">💨</div>
              <div class="env-value">{{ environment.pm25 }}</div>
              <div class="env-label">PM2.5</div>
            </div>
            <div class="env-item">
              <div class="env-icon">🔊</div>
              <div class="env-value">{{ environment.noise }}dB</div>
              <div class="env-label">噪音</div>
            </div>
          </div>
          <div ref="envTrendRef" class="chart-container small"></div>
        </div>

        <!-- 交通流量 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon">🚗</span>
            <span class="panel-title">交通流量</span>
          </div>
          <div ref="trafficChartRef" class="chart-container"></div>
        </div>

        <!-- 人员分布 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon">👥</span>
            <span class="panel-title">人员分布</span>
          </div>
          <div ref="peopleChartRef" class="chart-container"></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, shallowRef } from "vue";
import * as echarts from "echarts";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OfficeBuilding, Sunny, Refresh, Close } from "@element-plus/icons-vue";

// ================= 类型定义 =================
interface Building {
  id: string;
  name: string;
  floors: number;
  area: number;
  currentPeople: number;
  energyStatus: "normal" | "high";
  position: { x: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
}

interface SecurityAlert {
  id: number;
  time: string;
  message: string;
  location: string;
  level: "critical" | "warning" | "info";
}

// ================= 响应式数据 =================
const currentDate = ref("");
const currentTime = ref("");
const viewMode = ref<"day" | "night">("day");
const selectedBuilding = ref<Building | null>(null);
const onlineDevices = ref(1247);
const todayVisitors = ref(3856);
const parkingUsage = ref(78);
const energyToday = ref(12450);

const campusData = reactive({
  totalArea: 15.8,
  buildingCount: 12,
  greenRate: 35,
  parkingSpaces: 800,
});

const environment = reactive({
  temperature: 26,
  humidity: 45,
  pm25: 35,
  noise: 52,
});

const securityAlerts = ref<SecurityAlert[]>([
  {
    id: 1,
    time: "14:32:15",
    message: "A栋3楼消防通道异常开启",
    location: "A栋3F",
    level: "warning",
  },
  {
    id: 2,
    time: "14:28:42",
    message: "停车场B区车辆违停检测",
    location: "停车场B区",
    level: "info",
  },
]);

// ================= ECharts 实例 =================
const energyChartRef = ref<HTMLElement | null>(null);
const envTrendRef = ref<HTMLElement | null>(null);
const trafficChartRef = ref<HTMLElement | null>(null);
const peopleChartRef = ref<HTMLElement | null>(null);

const energyChartInstance = shallowRef<echarts.ECharts | null>(null);
const envTrendInstance = shallowRef<echarts.ECharts | null>(null);
const trafficChartInstance = shallowRef<echarts.ECharts | null>(null);
const peopleChartInstance = shallowRef<echarts.ECharts | null>(null);

// ================= Three.js 相关 =================
const threeContainer = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let buildings: THREE.Mesh[] = [];
let animationId: number;

const buildingData: Building[] = [
  {
    id: "A",
    name: "A栋办公楼",
    floors: 18,
    area: 15000,
    currentPeople: 450,
    energyStatus: "normal",
    position: { x: -8, z: -5 },
    size: { width: 4, height: 6, depth: 3 },
    color: "#00d4ff",
  },
  {
    id: "B",
    name: "B栋研发中心",
    floors: 12,
    area: 10000,
    currentPeople: 320,
    energyStatus: "high",
    position: { x: 0, z: -5 },
    size: { width: 3.5, height: 4.5, depth: 3 },
    color: "#00e396",
  },
  {
    id: "C",
    name: "C栋会议中心",
    floors: 6,
    area: 5000,
    currentPeople: 180,
    energyStatus: "normal",
    position: { x: 8, z: -5 },
    size: { width: 3, height: 2.5, depth: 2.5 },
    color: "#feb019",
  },
  {
    id: "D",
    name: "D栋宿舍楼",
    floors: 15,
    area: 12000,
    currentPeople: 600,
    energyStatus: "normal",
    position: { x: -8, z: 5 },
    size: { width: 4, height: 5, depth: 3 },
    color: "#ff4560",
  },
  {
    id: "E",
    name: "E栋食堂",
    floors: 3,
    area: 3000,
    currentPeople: 250,
    energyStatus: "normal",
    position: { x: 0, z: 5 },
    size: { width: 3, height: 1.5, depth: 2.5 },
    color: "#a855f7",
  },
];

// ================= 时钟更新 =================
const updateClock = () => {
  const now = new Date();
  currentDate.value = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ================= Three.js 初始化 =================
const initThreeScene = () => {
  if (!threeContainer.value) return;

  // 场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);
  scene.fog = new THREE.Fog(0x0a0e27, 20, 50);

  // 相机
  camera = new THREE.PerspectiveCamera(
    60,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000,
  );
  camera.position.set(15, 12, 15);
  camera.lookAt(0, 0, 0);

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(
    threeContainer.value.clientWidth,
    threeContainer.value.clientHeight,
  );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.value.appendChild(renderer.domElement);

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 10;
  controls.maxDistance = 30;

  // 灯光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 地面
  const groundGeometry = new THREE.PlaneGeometry(40, 40);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1f3a,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 网格辅助线
  const gridHelper = new THREE.GridHelper(40, 40, 0x2a3050, 0x1a2040);
  scene.add(gridHelper);

  // 创建建筑
  buildingData.forEach((building) => {
    const geometry = new THREE.BoxGeometry(
      building.size.width,
      building.size.height,
      building.size.depth,
    );
    const material = new THREE.MeshStandardMaterial({
      color: building.color,
      roughness: 0.3,
      metalness: 0.7,
      emissive: building.color,
      emissiveIntensity: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      building.position.x,
      building.size.height / 2,
      building.position.z,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = building;
    scene.add(mesh);
    buildings.push(mesh);

    // 建筑顶部发光效果
    const topGeometry = new THREE.PlaneGeometry(
      building.size.width * 0.8,
      building.size.depth * 0.8,
    );
    const topMaterial = new THREE.MeshBasicMaterial({
      color: building.color,
      transparent: true,
      opacity: 0.6,
    });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.set(
      building.position.x,
      building.size.height + 0.1,
      building.position.z,
    );
    topMesh.rotation.x = -Math.PI / 2;
    scene.add(topMesh);
  });

  // 道路
  const roadGeometry = new THREE.PlaneGeometry(2, 40);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a3050,
    roughness: 0.9,
  });
  const road1 = new THREE.Mesh(roadGeometry, roadMaterial);
  road1.rotation.x = -Math.PI / 2;
  road1.position.y = 0.01;
  scene.add(road1);

  const road2 = new THREE.Mesh(roadGeometry, roadMaterial);
  road2.rotation.x = -Math.PI / 2;
  road2.rotation.z = Math.PI / 2;
  road2.position.y = 0.01;
  scene.add(road2);

  // 绿化区域
  const treePositions = [
    { x: -12, z: -12 },
    { x: 12, z: -12 },
    { x: -12, z: 12 },
    { x: 12, z: 12 },
    { x: -15, z: 0 },
    { x: 15, z: 0 },
  ];

  treePositions.forEach((pos) => {
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(pos.x, 0.5, pos.z);
    scene.add(trunk);

    const leavesGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(pos.x, 1.5, pos.z);
    scene.add(leaves);
  });

  // 点击事件
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(buildings);

    if (intersects.length > 0) {
      const building = intersects[0].object.userData as Building;
      selectedBuilding.value = building;
    }
  });

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
};

// ================= ECharts 初始化 =================
const initEnergyChart = () => {
  if (!energyChartRef.value) return;
  energyChartInstance.value = echarts.init(energyChartRef.value);
  energyChartInstance.value.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10,15,30,0.9)",
      borderColor: "#233554",
      textStyle: { color: "#ccd6f6" },
    },
    legend: {
      data: ["电力", "水", "燃气"],
      textStyle: { color: "#8892b0", fontSize: 11 },
      top: 0,
    },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "20%" },
    xAxis: {
      type: "category",
      data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
      axisLabel: { color: "#8892b0", fontSize: 10 },
      axisLine: { lineStyle: { color: "#233554" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#8892b0", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      {
        name: "电力",
        type: "line",
        data: [120, 80, 450, 680, 520, 380],
        smooth: true,
        lineStyle: { color: "#00d4ff", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0,212,255,0.3)" },
            { offset: 1, color: "rgba(0,212,255,0)" },
          ]),
        },
      },
      {
        name: "水",
        type: "line",
        data: [80, 60, 280, 420, 350, 240],
        smooth: true,
        lineStyle: { color: "#00e396", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0,227,150,0.3)" },
            { offset: 1, color: "rgba(0,227,150,0)" },
          ]),
        },
      },
      {
        name: "燃气",
        type: "line",
        data: [40, 30, 180, 280, 220, 160],
        smooth: true,
        lineStyle: { color: "#feb019", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(254,176,25,0.3)" },
            { offset: 1, color: "rgba(254,176,25,0)" },
          ]),
        },
      },
    ],
  });
};

const initEnvTrendChart = () => {
  if (!envTrendRef.value) return;
  envTrendInstance.value = echarts.init(envTrendRef.value);
  envTrendInstance.value.setOption({
    backgroundColor: "transparent",
    grid: { left: "10%", right: "5%", bottom: "15%", top: "10%" },
    xAxis: {
      type: "category",
      data: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
      axisLabel: { color: "#8892b0", fontSize: 9 },
      axisLine: { lineStyle: { color: "#233554" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#8892b0", fontSize: 9 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      {
        type: "line",
        data: [24, 25, 26, 27, 26, 26],
        smooth: true,
        lineStyle: { color: "#ff4560", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(255,69,96,0.3)" },
            { offset: 1, color: "rgba(255,69,96,0)" },
          ]),
        },
      },
    ],
  });
};

const initTrafficChart = () => {
  if (!trafficChartRef.value) return;
  trafficChartInstance.value = echarts.init(trafficChartRef.value);
  trafficChartInstance.value.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(10,15,30,0.9)",
      borderColor: "#233554",
      textStyle: { color: "#ccd6f6" },
    },
    grid: { left: "10%", right: "5%", bottom: "10%", top: "15%" },
    xAxis: {
      type: "category",
      data: ["入口", "出口", "地下", "地面"],
      axisLabel: { color: "#8892b0", fontSize: 11 },
      axisLine: { lineStyle: { color: "#233554" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#8892b0", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    },
    series: [
      {
        type: "bar",
        data: [
          { value: 450, itemStyle: { color: "#00d4ff" } },
          { value: 380, itemStyle: { color: "#00e396" } },
          { value: 280, itemStyle: { color: "#feb019" } },
          { value: 180, itemStyle: { color: "#ff4560" } },
        ],
        barWidth: "50%",
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  });
};

const initPeopleChart = () => {
  if (!peopleChartRef.value) return;
  peopleChartInstance.value = echarts.init(peopleChartRef.value);
  peopleChartInstance.value.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(10,15,30,0.9)",
      borderColor: "#233554",
      textStyle: { color: "#ccd6f6" },
    },
    legend: {
      orient: "vertical",
      right: 5,
      top: "center",
      textStyle: { color: "#8892b0", fontSize: 11 },
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 5, borderColor: "#0a0e27", borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 450, name: "办公人员", itemStyle: { color: "#00d4ff" } },
          { value: 320, name: "研发人员", itemStyle: { color: "#00e396" } },
          { value: 180, name: "访客", itemStyle: { color: "#feb019" } },
          { value: 250, name: "后勤人员", itemStyle: { color: "#ff4560" } },
        ],
      },
    ],
  });
};

// ================= 视图切换 =================
const switchView = (mode: "day" | "night") => {
  viewMode.value = mode;
  if (mode === "night") {
    scene.background = new THREE.Color(0x050810);
    scene.fog = new THREE.Fog(0x050810, 20, 50);
  } else {
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 20, 50);
  }
};

const resetCamera = () => {
  camera.position.set(15, 12, 15);
  camera.lookAt(0, 0, 0);
  controls.reset();
};

// ================= 数据更新 =================
const updateData = () => {
  // 环境数据
  environment.temperature = +(24 + Math.random() * 4).toFixed(1);
  environment.humidity = +(40 + Math.random() * 10).toFixed(0);
  environment.pm25 = +(30 + Math.random() * 20).toFixed(0);
  environment.noise = +(48 + Math.random() * 10).toFixed(0);

  // 统计数据
  onlineDevices.value = 1200 + Math.floor(Math.random() * 100);
  todayVisitors.value = 3800 + Math.floor(Math.random() * 200);
  parkingUsage.value = 75 + Math.floor(Math.random() * 10);
  energyToday.value = 12000 + Math.floor(Math.random() * 1000);

  // 随机告警
  if (Math.random() > 0.8) {
    const messages = [
      "A栋电梯运行异常",
      "停车场A区车辆违停",
      "B栋消防通道阻塞",
      "园区 perimeter 入侵检测",
    ];
    const locations = ["A栋", "B栋", "停车场", "园区 perimeter"];
    const levels: SecurityAlert["level"][] = ["critical", "warning", "info"];
    securityAlerts.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      message: messages[Math.floor(Math.random() * messages.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
    });
    if (securityAlerts.value.length > 5) securityAlerts.value.pop();
  }
};

// ================= 窗口调整 =================
const handleResize = () => {
  if (threeContainer.value && camera && renderer) {
    camera.aspect =
      threeContainer.value.clientWidth / threeContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      threeContainer.value.clientWidth,
      threeContainer.value.clientHeight,
    );
  }
  [
    energyChartInstance,
    envTrendInstance,
    trafficChartInstance,
    peopleChartInstance,
  ].forEach((inst) => inst.value?.resize());
};

// ================= 生命周期 =================
onMounted(() => {
  updateClock();
  setInterval(updateClock, 1000);

  initThreeScene();
  initEnergyChart();
  initEnvTrendChart();
  initTrafficChart();
  initPeopleChart();

  setInterval(updateData, 3000);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  [
    energyChartInstance,
    envTrendInstance,
    trafficChartInstance,
    peopleChartInstance,
  ].forEach((inst) => {
    inst.value?.dispose();
    inst.value = null;
  });
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.smart-campus {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #060a13;
  color: #ccd6f6;
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", sans-serif;
  overflow: hidden;
}

/* 顶部标题栏 */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 24px;
  background: linear-gradient(180deg, #0a1128 0%, #060a13 100%);
  border-bottom: 1px solid #1a2744;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00d4ff 0%, #00e396 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #e6f1ff;
  letter-spacing: 2px;
}

.header-subtitle {
  font-size: 11px;
  color: #8892b0;
  letter-spacing: 1px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8892b0;
  font-size: 14px;
}

.weather-detail {
  font-size: 12px;
  color: #5a6580;
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time-display {
  text-align: right;
}

.time-date {
  font-size: 12px;
  color: #8892b0;
}

.time-clock {
  font-size: 18px;
  font-weight: 600;
  color: #00d4ff;
  font-family: "Roboto Mono", monospace;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccd6f6;
  font-size: 14px;
}

/* 主体内容 */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 12px;
  padding: 12px;
  min-height: 0;
  overflow: hidden;
}

/* 侧边面板 */
.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;
}

.panel-card {
  background: linear-gradient(135deg, #0d1321 0%, #111827 100%);
  border: 1px solid #1a2744;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #e6f1ff;
}

.panel-icon {
  font-size: 16px;
}

/* 园区概览 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
  font-family: "Roboto Mono", monospace;
}

.stat-label {
  font-size: 11px;
  color: #8892b0;
  margin-top: 4px;
}

/* 图表容器 */
.chart-container {
  height: 180px;
  flex-shrink: 0;
}

.chart-container.small {
  height: 120px;
}

/* 告警列表 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.alert-list::-webkit-scrollbar {
  width: 3px;
}

.alert-list::-webkit-scrollbar-thumb {
  background: #233554;
  border-radius: 3px;
}

.alert-item {
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid;
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
}

.alert-item.critical {
  border-left-color: #ff4560;
  background: rgba(255, 69, 96, 0.05);
}

.alert-item.warning {
  border-left-color: #feb019;
  background: rgba(254, 176, 25, 0.05);
}

.alert-item.info {
  border-left-color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}

.alert-time {
  color: #5a6580;
  font-size: 11px;
  margin-bottom: 4px;
}

.alert-content {
  color: #ccd6f6;
  margin-bottom: 4px;
}

.alert-location {
  color: #8892b0;
  font-size: 11px;
}

/* 中间 3D 区域 */
.center-3d {
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.scene-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

.overlay-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: auto;
}

.scene-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #e6f1ff;
  background: rgba(10, 15, 30, 0.8);
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #1a2744;
}

.title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d4ff;
  box-shadow: 0 0 8px #00d4ff;
  animation: breathe 2s ease-in-out infinite;
}

.scene-controls {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.overlay-bottom {
  pointer-events: auto;
}

.quick-stats {
  display: flex;
  gap: 16px;
  background: rgba(10, 15, 30, 0.9);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #1a2744;
}

.quick-stat {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #00d4ff;
  font-family: "Roboto Mono", monospace;
}

.stat-desc {
  font-size: 11px;
  color: #8892b0;
  margin-top: 2px;
}

/* 建筑信息弹窗 */
.building-info-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 15, 30, 0.95);
  border: 1px solid #1a2744;
  border-radius: 8px;
  padding: 20px;
  min-width: 280px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1a2744;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  color: #e6f1ff;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-label {
  color: #8892b0;
}

/* 环境监测网格 */
.environment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.env-item {
  text-align: center;
  padding: 10px;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.env-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.env-value {
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  font-family: "Roboto Mono", monospace;
}

.env-label {
  font-size: 11px;
  color: #8892b0;
  margin-top: 2px;
}

/* 动画 */
@keyframes breathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 响应式 */
@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  .left-panel,
  .right-panel {
    display: none;
  }
}
</style>
