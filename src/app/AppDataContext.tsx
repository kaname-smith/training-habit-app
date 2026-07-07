import { useEffect, useState, type ReactNode } from 'react';
import { ensureSchemaVersion } from '../storage/migrations';
import {
  userProfileRepository,
  dailyPlansRepository,
  workoutLogsRepository,
  nutritionLogsRepository,
  fatigueCheckInsRepository,
  settingsRepository,
  resetAllData,
  type AppSettings,
} from '../storage/repositories';
import { generateJulyPlan } from '../data/julyPlan';
import type { UserProfile, FatigueCheckIn } from '../domain/habitTypes';
import type { DailyPlan, WorkoutLog } from '../domain/workoutTypes';
import type { NutritionLog } from '../domain/nutritionTypes';
import { AppDataContext, type AppDataContextValue } from './appDataContextDefinition';

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [fatigueCheckIns, setFatigueCheckIns] = useState<FatigueCheckIn[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: false,
    notificationTime: 'evening',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await ensureSchemaVersion();

      let plans = await dailyPlansRepository.get();
      if (plans.length === 0) {
        plans = generateJulyPlan();
        await dailyPlansRepository.set(plans);
      }

      const [loadedProfile, loadedLogs, loadedNutrition, loadedFatigue, loadedSettings] =
        await Promise.all([
          userProfileRepository.get(),
          workoutLogsRepository.get(),
          nutritionLogsRepository.get(),
          fatigueCheckInsRepository.get(),
          settingsRepository.get(),
        ]);

      if (cancelled) return;

      setProfile(loadedProfile);
      setDailyPlans(plans);
      setWorkoutLogs(loadedLogs);
      setNutritionLogs(loadedNutrition);
      setFatigueCheckIns(loadedFatigue);
      setSettings(loadedSettings);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(next: UserProfile) {
    setProfile(next);
    await userProfileRepository.set(next);
  }

  async function addWorkoutLog(log: WorkoutLog) {
    const next = [...workoutLogs, log];
    setWorkoutLogs(next);
    await workoutLogsRepository.set(next);
  }

  async function updateWorkoutLog(id: string, updater: (log: WorkoutLog) => WorkoutLog) {
    const next = workoutLogs.map((log) => (log.id === id ? updater(log) : log));
    setWorkoutLogs(next);
    await workoutLogsRepository.set(next);
  }

  async function upsertNutritionLog(log: NutritionLog) {
    const next = [...nutritionLogs.filter((entry) => entry.date !== log.date), log];
    setNutritionLogs(next);
    await nutritionLogsRepository.set(next);
  }

  async function upsertFatigueCheckIn(entry: FatigueCheckIn) {
    const next = [...fatigueCheckIns.filter((item) => item.date !== entry.date), entry];
    setFatigueCheckIns(next);
    await fatigueCheckInsRepository.set(next);
  }

  async function updateSettings(next: AppSettings) {
    setSettings(next);
    await settingsRepository.set(next);
  }

  async function resetAll() {
    await resetAllData();
    setProfile(null);
    setWorkoutLogs([]);
    setNutritionLogs([]);
    setFatigueCheckIns([]);
    setSettings({ notificationsEnabled: false, notificationTime: 'evening' });
  }

  const value: AppDataContextValue = {
    loading,
    profile,
    saveProfile,
    dailyPlans,
    workoutLogs,
    addWorkoutLog,
    updateWorkoutLog,
    nutritionLogs,
    upsertNutritionLog,
    fatigueCheckIns,
    upsertFatigueCheckIn,
    settings,
    updateSettings,
    resetAll,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
