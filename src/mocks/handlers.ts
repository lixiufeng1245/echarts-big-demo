import { http, HttpResponse } from "msw";

// 设备数据类型
interface Device {
  id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  status: "online" | "offline" | "alarm";
  lastUpdate: string;
}

// 告警数据类型
interface AlertItem {
  id: number;
  message: string;
  time: string;
  level: "critical" | "warning" | "info";
}

// 生成随机设备数据
const generateDevices = (count: number = 10): Device[] => {
  const statuses: Device["status"][] = [
    "online", "online", "online", "online", "online",
    "online", "online", "offline", "alarm", "online"
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `DEV-${String(i + 1).padStart(4, "0")}`,
    temperature: +(22 + Math.random() * 6).toFixed(1),
    humidity: +(45 + Math.random() * 15).toFixed(1),
    pressure: +(55 + Math.random() * 20).toFixed(1),
    status: statuses[i] || "online",
    lastUpdate: new Date().toLocaleTimeString(),
  }));
};

// 生成随机告警数据
const generateAlerts = (): AlertItem[] => {
  const alertMessages = [
    { msg: "DEV-0003 管网压力超阈值 (85.2 MPa)", level: "critical" as const },
    { msg: "DEV-0007 温度异常升高 (31.5°C)", level: "warning" as const },
    { msg: "DEV-0001 设备离线，请检查网络", level: "critical" as const },
    { msg: "DEV-0005 湿度传感器数据波动", level: "info" as const },
    { msg: "DEV-0009 振动频率超出正常范围", level: "warning" as const },
  ];
  
  return alertMessages.map((alert, i) => ({
    id: i + 1,
    message: alert.msg,
    time: new Date().toLocaleTimeString(),
    level: alert.level,
  }));
};

// MSW 处理器定义
export const handlers = [
  // 获取设备列表
  http.get("/api/devices", () => {
    return HttpResponse.json({
      code: 200,
      message: "success",
      data: generateDevices(10),
    });
  }),

  // 获取告警列表
  http.get("/api/alerts", () => {
    return HttpResponse.json({
      code: 200,
      message: "success",
      data: generateAlerts(),
    });
  }),

  // 获取 KPI 数据
  http.get("/api/kpi", () => {
    const devices = generateDevices(128);
    const onlineCount = devices.filter(d => d.status === "online").length;
    const offlineCount = devices.filter(d => d.status === "offline").length;
    const alarmCount = devices.filter(d => d.status === "alarm").length;
    
    return HttpResponse.json({
      code: 200,
      message: "success",
      data: {
        total: 128,
        online: onlineCount,
        offline: offlineCount,
        alarm: alarmCount,
        frequency: "1s",
      },
    });
  }),

  // 获取实时数据流
  http.get("/api/stream", () => {
    const now = new Date();
    return HttpResponse.json({
      code: 200,
      message: "success",
      data: {
        time: now.toLocaleTimeString(),
        temperature: +(22 + Math.random() * 6).toFixed(1),
        humidity: +(45 + Math.random() * 15).toFixed(1),
        pressure: +(55 + Math.random() * 20).toFixed(1),
      },
    });
  }),
];
