# Mock 数据使用指南

## 项目结构

```
src/
├── mocks/              # MSW mock 数据配置
│   ├── handlers.ts     # API 端点和数据生成逻辑
│   ├── browser.ts      # MSW 浏览器 worker
│   └── index.ts        # 统一入口
├── api/                # API 服务层
│   └── index.ts        # API 调用方法
└── main.ts             # 应用入口（已集成 MSW）
```

## 启动项目

```bash
cd my-vue-app
npm run dev
```

启动后，打开浏览器控制台，你会看到 MSW 的日志：
```
[MSW] Mocking enabled.
```

## 已配置的 API 端点

### 物联网大屏 (IotDashboard)

| API 端点 | 说明 | 返回数据 |
|---------|------|---------|
| `GET /api/devices` | 获取设备列表 | 10 个设备的数组 |
| `GET /api/alerts` | 获取告警列表 | 5 条告警数据 |
| `GET /api/kpi` | 获取 KPI 数据 | 设备统计信息 |
| `GET /api/stream` | 获取实时数据流 | 温湿度、压力数据 |

### 智慧园区 (SmartCampusDashboard)

| API 端点 | 说明 | 返回数据 |
|---------|------|---------|
| `GET /api/campus/overview` | 园区概览 | 面积、建筑数、绿化率、停车位 |
| `GET /api/campus/environment` | 环境监测 | 温度、湿度、PM2.5、噪音 |
| `GET /api/campus/security-alerts` | 安防告警 | 5 条安防告警数据 |
| `GET /api/campus/quick-stats` | 快速统计 | 在线设备、访客、车位使用率、今日能耗 |
| `GET /api/campus/energy` | 能耗数据 | 电力、水、燃气的时序数据 |
| `GET /api/campus/traffic` | 交通流量 | 入口、出口、地下、地面车流量 |
| `GET /api/campus/people-distribution` | 人员分布 | 办公人员、研发人员、访客、后勤人员 |

## 在组件中使用

### 示例：在 SmartCampusDashboard.vue 中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { 
  fetchCampusOverview, 
  fetchEnvironment, 
  fetchSecurityAlerts,
  fetchQuickStats 
} from "@/api";

// 园区数据
const campusData = ref({
  totalArea: 0,
  buildingCount: 0,
  greenRate: 0,
  parkingSpaces: 0,
});

// 环境数据
const environment = ref({
  temperature: 0,
  humidity: 0,
  pm25: 0,
  noise: 0,
});

// 安防告警
const securityAlerts = ref([]);

// 快速统计
const quickStats = ref({
  onlineDevices: 0,
  todayVisitors: 0,
  parkingUsage: 0,
  energyToday: 0,
});

// 加载数据
onMounted(async () => {
  // 获取园区概览
  campusData.value = await fetchCampusOverview();
  
  // 获取环境数据
  environment.value = await fetchEnvironment();
  
  // 获取安防告警
  securityAlerts.value = await fetchSecurityAlerts();
  
  // 获取快速统计
  quickStats.value = await fetchQuickStats();
});
</script>
```

## 切换真实 API

当后端 API 准备好后，只需修改 `main.ts`：

```typescript
// 注释掉 mock 初始化
// async function enableMocking() { ... }

// 直接启动应用
const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
```

或者设置环境变量来控制是否启用 mock：

```typescript
// .env.development
VITE_ENABLE_MOCK=true

// .env.production
VITE_ENABLE_MOCK=false
```

## MSW 的优势

1. **零代码切换**：组件代码与真实 API 调用完全一致
2. **浏览器控制台可见**：可以在 Network 面板看到 mock 请求
3. **TypeScript 友好**：完整的类型提示
4. **数据动态生成**：每次请求返回不同的随机数据

## 调试技巧

1. 打开浏览器开发者工具 → Network 面板
2. 筛选 `/api/` 开头的请求
3. 查看请求的 Response，可以看到 mock 数据

## 添加新的 API 端点

1. 在 `src/mocks/handlers.ts` 中添加新的处理器：

```typescript
http.get("/api/your-new-endpoint", () => {
  return HttpResponse.json({
    code: 200,
    message: "success",
    data: { /* your data */ },
  });
}),
```

2. 在 `src/api/index.ts` 中添加对应的调用方法：

```typescript
export const fetchYourData = async () => {
  const res = await fetch("/api/your-new-endpoint");
  const json: ApiResponse<YourType> = await res.json();
  return json.data;
};
```

3. 在组件中调用即可。
