
export interface Business {
  id: string;
  name: string;
  address: string;
  schedule: string;
  closingType: 'midday' | 'final' | 'continuous';
  rawLine: string;
  foundTimes: { start: string; end:string }[];
}

export interface Alarm {
  id: string;
  businessName: string;
  address: string;
  alarmTime: Date;
  closingTime: string;
  type: 'midday' | 'final';
  isMiddayClosing: boolean;
  active: boolean;
}

export interface AppConfig {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  volume: number;
  middayMinutes: number;
  finalMinutes: number;
  middayAlarmEnabled: boolean;
  finalAlarmEnabled: boolean;
}
