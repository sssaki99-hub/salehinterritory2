
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
import { Project, Writing, WorkExperience, Education, Certificate, Message, AdminSettings } from './types';
import { getProjects, getWritings, getWorkExperience, getEducation, getCertificates, getMessages, getSettings, onAuthChange } from './supabaseClient';

const initialSettings: AdminSettings = {
  commentsEnabled: true,
  ratingsEnabled: true,
  heroSection: {
    title: "Welcome to Your Territory",
    subtitle: "Your portfolio is ready to be set up in the Admin Panel.",
  },
  footerContent: {
    copyright: `© ${new Date().getFullYear()}`,
  },
  aboutMe: {
    name: "Your Name",
    photoUrl: "",
    bio: "Update your bio in the admin panel.",
    professionalSummary: "Update your professional summary in the admin panel.",
  },
  contactDetails: {
    email: "",
    phone: "",
    facebook: "",
    linkedin: "",
    location: "",
  }
};

const App: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        projectsData, writingsData, workExperienceData, educationData,
        certificatesData, messagesData, settingsData
      ] = await Promise.all([
        getProjects(), getWritings(), getWorkExperience(), getEducation(),
        getCertificates(), getMessages(), getSettings()
      ]);
      
      setProjects(projectsData);
      setWritings(writingsData);
      setWorkExperience(workExperienceData);
      setEducation(educationData);
      setCertificates(certificatesData);
      setMessages(messagesData);
      if (settingsData) setSettings(settingsData);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Could not connect to the database. Please check your Supabase credentials in supabaseClient.ts and ensure the service is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const { subscription } = onAuthChange((session: Session | null) => {
      setIsAdmin(!!session);
    });
    return () => {
      subscription.unsubscribe();
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
    messages,
    refetchAllData: fetchAllData
  }), [isAdmin, settings, projects, writings, workExperience, education, certificates, messages, fetchAllData]);

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
