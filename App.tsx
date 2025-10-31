
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
import { initialProjects, initialWritings, initialWorkExperience, initialEducation, initialCertificates, initialSettings } from './sampleData';

const App: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Content states
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [writings, setWritings] = useState<Writing[]>(initialWritings);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(initialWorkExperience);
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);

  const adminContextValue = useMemo(() => ({
    isAdmin,
    setIsAdmin,
    settings,
    setSettings,
    projects,
    setProjects,
    writings,
    setWritings,
    workExperience,
    setWorkExperience,
    education,
    setEducation,
    certificates,
    setCertificates,
    messages,
    setMessages,
  }), [isAdmin, settings, projects, writings, workExperience, education, certificates, messages]);

  return (
    <AdminContext.Provider value={adminContextValue}>
      <div className="flex flex-col min-h-screen bg-dark-bg">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </main>
        <Footer />
      </div>
    </AdminContext.Provider>
  );
};

export default App;