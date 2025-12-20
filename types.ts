
// Existing types updated and new types added for complete app functionality

export interface WorkExperience {
  id?: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string | string[];
}

export interface Education {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  highlight: string;
  details?: string;
  major?: string;
  board?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Rating {
  value: number;
}

export enum WritingCategory {
  Novel = "Novel",
  ShortStory = "Short Story",
  Poem = "Poem"
}

export enum WritingGenre {
  Horror = "Horror",
  Thriller = "Thriller",
  SciFi = "Science Fiction",
  Mystery = "Mystery"
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  content: string;
}

export interface Writing {
  id: string;
  title: string;
  category: WritingCategory;
  genre: WritingGenre;
  coverImageUrl: string;
  summary: string;
  content: string | Episode[];
  youtubeAudiobookUrl?: string;
  comments?: Comment[];
  ratings?: Rating[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  demoVideoUrl?: string;
  pdfUrl?: string;
  comments?: Comment[];
  ratings?: Rating[];
}

export interface ContactDetails {
  email: string;
  phone: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  location?: string;
}

export interface AdminSettings {
  commentsEnabled: boolean;
  ratingsEnabled: boolean;
  heroSection: {
    title: string;
    subtitle: string;
  };
  footerContent: {
    copyright: string;
  };
  aboutMe: {
    name: string;
    photoUrl: string;
    bio: string;
    professionalSummary: string;
  };
  contactDetails: ContactDetails;
  cvSettings: {
    showWorkExperience: boolean;
    showSkills: boolean;
    showProjects: boolean;
    showEducation: boolean;
    showCertificates: boolean;
  };
}

export interface ProfileData {
  name: string;
  photoUrl: string;
  title: string;
  bio: string[];
  employment: WorkExperience[];
  education: Education[];
  skills: string[];
  contact: ContactDetails;
}
