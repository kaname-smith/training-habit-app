import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './AppDataContext';
import { useAppData } from './hooks';
import { BottomTabNav } from '../components/layout/BottomTabNav';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { TodayPage } from '../features/today/TodayPage';
import { BodyHubPage } from '../features/body/BodyHubPage';
import { WorkoutPage } from '../features/workout/WorkoutPage';
import { RecordsPage } from '../features/records/RecordsPage';
import { NutritionPage } from '../features/nutrition/NutritionPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { StudyDataProvider } from '../features/study/context/StudyDataContext';
import { StudyOverviewPage } from '../features/study/StudyOverviewPage';
import { CoursesPage } from '../features/study/CoursesPage';
import { ExamsPage } from '../features/study/ExamsPage';
import { MaterialsPage } from '../features/study/MaterialsPage';

function AppShell() {
  const { loading, profile } = useAppData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 dark:text-neutral-400">
        読み込み中...
      </div>
    );
  }

  if (!profile) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/onboarding" element={<Navigate to="/" replace />} />
        <Route path="/body" element={<BodyHubPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/workout/:workoutType" element={<WorkoutPage />} />
        <Route
          path="/study/*"
          element={
            <StudyDataProvider>
              <Routes>
                <Route path="/" element={<StudyOverviewPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="exams" element={<ExamsPage />} />
                <Route path="materials" element={<MaterialsPage />} />
              </Routes>
            </StudyDataProvider>
          }
        />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomTabNav />
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppDataProvider>
        <AppShell />
      </AppDataProvider>
    </HashRouter>
  );
}
