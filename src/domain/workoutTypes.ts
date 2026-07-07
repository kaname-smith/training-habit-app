export type WorkoutType = 'intro' | 'A' | 'B' | 'short' | 'rest' | 'walk';

export type WorkoutStatus =
  | 'planned'
  | 'completed'
  | 'short_done'
  | 'rest'
  | 'skipped'
  | 'rescheduled';

export type PerceivedEffort = 'easy' | 'good' | 'hard' | 'too_hard';

export interface ExerciseDefinition {
  id: string;
  name: string;
  target: string[];
  defaultReps?: number;
  defaultSeconds?: number;
  defaultSets: number;
  formCue: string;
  quietApartmentSafe: boolean;
  alternatives?: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  seconds?: number;
  side?: 'left-right' | 'none';
  note?: string;
}

export interface WorkoutTemplate {
  id: string;
  type: WorkoutType;
  title: string;
  estimatedMinutes: number;
  description: string;
  exercises: WorkoutExercise[];
}

export interface DailyPlan {
  date: string;
  recommendedWorkoutType: WorkoutType;
  reason: string;
  status: WorkoutStatus;
}

export interface SetLog {
  setIndex: number;
  reps?: number;
  seconds?: number;
  completed: boolean;
  rir?: number;
}

export interface ExerciseLog {
  exerciseId: string;
  completedSets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutType: WorkoutType;
  startedAt?: string;
  completedAt?: string;
  effort?: PerceivedEffort;
  notes?: string;
  exerciseLogs: ExerciseLog[];
}
