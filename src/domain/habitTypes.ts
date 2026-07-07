export type ExperienceLevel = 'beginner' | 'returning' | 'active';

export type SleepLevel = 'enough' | 'low' | 'very_low';

export type FatigueLevel = 'light' | 'normal' | 'heavy';

export interface UserProfile {
  id: string;
  nickname?: string;
  bodyWeightKg: number;
  experienceLevel: ExperienceLevel;
  examMode: boolean;
  examEndDate: string;
  proteinPerShakeG: number;
  createdAt: string;
  updatedAt: string;
}

export interface FatigueCheckIn {
  date: string;
  sleepLevel: SleepLevel;
  fatigueLevel: FatigueLevel;
  examTomorrow: boolean;
  hasPainOrSickness: boolean;
}
