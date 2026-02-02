
export interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export interface Lap {
  id: number;
  time: number;
  overall: number;
}

export interface Alarm {
  id: string;
  date: string;
  time: string;
  tone: string;
  message: string;
  isActive: boolean;
}

export interface PerformanceData {
  date: string;
  duration: number; // in minutes
  category: string;
}

export enum TimerMode {
  STOPWATCH = 'stopwatch',
  COUNTDOWN = 'countdown',
  LAP_TIMER = 'lap_timer',
  INTERVAL = 'interval',
  DIGITAL_CLOCK = 'digital_clock',
  ALARM_CLOCK = 'alarm_clock'
}
