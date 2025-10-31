import { createContext, Dispatch, SetStateAction } from 'react';
import { Project, Writing, WorkExperience, Education, Certificate, Message, AdminSettings } from '../types';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  settings: AdminSettings;
  setSettings: Dispatch<SetStateAction<AdminSettings>>;
  projects: Project[];
  writings: Writing[];
  workExperience: WorkExperience[];
  education: Education[];
  certificates: Certificate[];
  messages: Message[];
  refetchAllData: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | null>(null);
