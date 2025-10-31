import { Project, Writing, WorkExperience, Education, Certificate, AdminSettings, WritingCategory, WritingGenre } from './types';

export const initialProjects: Project[] = [];
export const initialWritings: Writing[] = [];
export const initialWorkExperience: WorkExperience[] = [];
export const initialEducation: Education[] = [];
export const initialCertificates: Certificate[] = [];

export const initialSettings: AdminSettings = {
  commentsEnabled: true,
  ratingsEnabled: true,
  heroSection: {
    title: "Welcome to Your Territory",
    subtitle: "Your portfolio is ready to be set up in the Admin Panel.",
  },
  footerContent: {
    copyright: `© ${new Date().getFullYear()} Salehin's Territory. All Rights Reserved.`,
  },
  aboutMe: {
    name: "S.M. Samius Salehin",
    photoUrl: "https://via.placeholder.com/400",
    bio: "Update your bio in the admin panel.",
    professionalSummary: "Update your professional summary in the admin panel.",
  },
  contactDetails: {
    email: "your-email@example.com",
    phone: "+1 (000) 000-0000",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com/in/",
    location: "Your City, Country",
  }
};
