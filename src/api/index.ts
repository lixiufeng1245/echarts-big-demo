// 设备数据类型
export interface Device {
  id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  status: "online" | "offline" | "alarm";
  lastUpdate: string;
}

// 告警数据类型
export interface AlertItem {
  id: number;
  message: string;
  time: string;
  level: "critical" | "warning" | "info";
}

// KPI 数据类型
export interface KPIData {
  total: number;
  online: number;
  offline: number;
  alarm: number;
  frequency: string;
}

// 实时数据流类型
export interface StreamData {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
}

// API 响应基础类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 获取设备列表
export const fetchDevices = async (): Promise<Device[]> => {
  const res = await fetch("/api/devices");
  const json: ApiResponse<Device[]> = await res.json();
  return json.data;
};

// 获取告警列表
export const fetchAlerts = async (): Promise<AlertItem[]> => {
  const res = await fetch("/api/alerts");
  const json: ApiResponse<AlertItem[]> = await res.json();
  return json.data;
};

// 获取 KPI 数据
export const fetchKPI = async (): Promise<KPIData> => {
  const res = await fetch("/api/kpi");
  const json: ApiResponse<KPIData> = await res.json();
  return json.data;
};

// 获取实时数据流
export const fetchStreamData = async (): Promise<StreamData> => {
  const res = await fetch("/api/stream");
  const json: ApiResponse<StreamData> = await res.json();
  return json.data;
};
