import { create } from 'zustand';

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  requestAt: string;
  responseAt?: string;
  time?: number;
  status?: number | string;
  success: boolean;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
}

interface ApiLogStore {
  logs: ApiLogEntry[];
  maxLogs: number;
  isEnabled: boolean;
  addLog: (log: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  toggleLogging: () => void;
  getRecentLogs: (count?: number) => ApiLogEntry[];
  getErrorLogs: () => ApiLogEntry[];
}

export const useApiLogStore = create<ApiLogStore>((set, get) => ({
  logs: [],
  maxLogs: 100, // Keep only latest 100 logs
  isEnabled: true, // Always enable logging (we'll control visibility via modal debug status)

  addLog: (logData) => {
    const { isEnabled, logs, maxLogs } = get();
    if (!isEnabled) return;

    const newLog: ApiLogEntry = {
      ...logData,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    set({
      logs: [newLog, ...logs].slice(0, maxLogs) // Keep only recent logs
    });
  },

  clearLogs: () => set({ logs: [] }),

  toggleLogging: () => set((state) => ({ isEnabled: !state.isEnabled })),

  getRecentLogs: (count = 20) => {
    const { logs } = get();
    return logs.slice(0, count);
  },

  getErrorLogs: () => {
    const { logs } = get();
    return logs.filter(log => !log.success);
  },
}));
