export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Rating {
  value: number;
}

export interface Project {
  id: string;
  title: string;
  images: string[];
  description: string;
  demoVideoUrl?: string;
  pdfUrl?: string;
  comments: Comment[];
  ratings: Rating[];
}

export enum WritingGenre {
  SciFi = "Sci-Fi",
  Thriller = "Thriller",
  Mystery = "Mystery",
  Romantic = "Romantic",
  Poetry = "Poetry",
}

export enum WritingCategory {
    Novel = "Novel",
    ShortStory = "Short Story",
    Poem = "Poem",
}

export interface Writing {
  id: string;
  title: string;
  category: WritingCategory;
  coverImageUrl: string;
  summary: string;
  genre: WritingGenre;
  youtubeAudiobookUrl?: string;
  content: string | Episode[]; // string for poems/short stories, Episode[] for novels
  comments: Comment[];
  ratings: Rating[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  content: string;
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    period: string;
    details: string;
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
    timestamp: string;
    read: boolean;
}

export interface AboutMeSettings {
  name: string;
  photoUrl: string;
  bio: string;
  professionalSummary: string;
}

export interface HeroSectionSettings {
  title: string;
  subtitle: string;
}

export interface FooterContentSettings {
  copyright: string;
}

export interface ContactDetails {
    email: string;
    phone: string;
    facebook: string;
    linkedin: string;
    location: string;
}

export interface AdminSettings {
  commentsEnabled: boolean;
  ratingsEnabled: boolean;
  heroSection: HeroSectionSettings;
  footerContent: FooterContentSettings;
  aboutMe: AboutMeSettings;
  contactDetails: ContactDetails;
}