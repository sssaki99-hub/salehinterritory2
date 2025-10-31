import { createContext, Dispatch, SetStateAction } from 'react';
import { Project, Writing, WorkExperience, Education, Certificate, Message, AdminSettings } from '../types';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  settings: AdminSettings;
  setSettings: Dispatch<SetStateAction<AdminSettings>>;
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  writings: Writing[];
  setWritings: Dispatch<SetStateAction<Writing[]>>;
  workExperience: WorkExperience[];
  setWorkExperience: Dispatch<SetStateAction<WorkExperience[]>>;
  education: Education[];
  setEducation: Dispatch<SetStateAction<Education[]>>;
  certificates: Certificate[];
  setCertificates: Dispatch<SetStateAction<Certificate[]>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
}

export const AdminContext = createContext<AdminContextType | null>(null);