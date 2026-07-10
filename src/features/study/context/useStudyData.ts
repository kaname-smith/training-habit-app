import { useContext } from 'react';
import { StudyDataContext, type StudyDataContextValue } from './studyDataContextDefinition';

export function useStudyData(): StudyDataContextValue {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}
