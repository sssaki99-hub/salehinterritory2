
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Session } from '@supabase/supabase-js';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Engineering from './pages/Engineering';
import EngineeringDetail from './pages/EngineeringDetail';
import Literature from './pages/Literature';
import LiteratureDetail from './pages/LiteratureDetail';
import Professional from './pages/Professional';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { AdminContext } from './contexts/AdminContext';
import { Project, Writing, WorkExperience, Education, Certificate, Message, AdminSettings, Skill } from './types';
import { getProjects, getWritings, getWorkExperience, getEducation, getCertificates, getMessages, getSettings, onAuthChange, getSkills } from './supabaseClient';

const fallbackSettings: AdminSettings = {
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

// Helper function for deep merging, ensuring fallback structure is maintained
const mergeSettings = (dbSettings: Partial<AdminSettings> | null, fallback: AdminSettings): AdminSettings => {
    const merged = { ...fallback };
    if (!dbSettings) return merged;

    for (const key in fallback) {
        const k = key as keyof AdminSettings;
        if (dbSettings[k] !== null && dbSettings[k] !== undefined) {
            // If the property is a nested object, merge its properties instead of overwriting the whole object
            if (typeof fallback[k] === 'object' && !Array.isArray(fallback[k]) && fallback[k] !== null) {
                merged[k] = { ...(fallback[k] as object), ...(dbSettings[k] as object) } as any;
            } else {
                merged[k] = dbSettings[k] as any;
            }
        }
    }
    return merged;
};


const App: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        projectsData, writingsData, workExperienceData, educationData,
        certificatesData, messagesData, settingsData, skillsData
      ] = await Promise.all([
        getProjects(), getWritings(), getWorkExperience(), getEducation(),
        getCertificates(), getMessages(), getSettings(), getSkills()
      ]);
      
      setProjects(projectsData);
      setWritings(writingsData);
      setWorkExperience(workExperienceData);
      setEducation(educationData);
      setCertificates(certificatesData);
      setSkills(skillsData);
      setMessages(messagesData);
      
      setSettings(mergeSettings(settingsData, fallbackSettings));

    } catch (error: any) {
      // Improved error logging to be more descriptive than "[object Object]"
      let errorMessage = "An unknown error occurred.";
      if (typeof error === 'object' && error !== null) {
        // Use the error message if available, otherwise stringify the object
        errorMessage = error.message || JSON.stringify(error, null, 2);
      } else {
        errorMessage = String(error);
      }
      
      console.error("Failed to fetch data:", error); // Log the original error object
      alert(`Could not connect to the database. Please ensure your schema is up to date.\n\nError: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const authListener = onAuthChange((session: Session | null) => {
      setIsAdmin(!!session);
    });
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, [fetchAllData]);

  const adminContextValue = useMemo(() => ({
    isAdmin,
    setIsAdmin,
    settings,
    setSettings,
    projects,
    writings,
    workExperience,
    education,
    certificates,
    skills,
    messages,
    refetchAllData: fetchAllData
  }), [isAdmin, settings, projects, writings, workExperience, education, certificates, skills, messages, fetchAllData]);

  return (
    <AdminContext.Provider value={adminContextValue}>
      <div className="flex flex-col min-h-screen bg-dark-bg">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-accent"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/engineering" element={<Engineering />} />
                <Route path="/engineering/:id" element={<EngineeringDetail />} />
                <Route path="/literature" element={<Literature />} />
                <Route path="/literature/:id" element={<LiteratureDetail />} />
                <Route path="/professional" element={<Professional />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </AnimatePresence>
          )}
        </main>
        <Footer />
      </div>
    </AdminContext.Provider>
  );
};

export default App;
