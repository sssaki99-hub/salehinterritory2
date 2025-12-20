
import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiCpu, FiBookOpen, FiBriefcase, FiMail, 
  FiLinkedin, FiYoutube, FiFacebook, FiChevronRight,
  FiExternalLink, FiMapPin, FiPhone
} from 'react-icons/fi';

// --- Static Content ---
const PROFILE_DATA = {
  name: "S.M. Samius Salehin",
  photoUrl: "https://i.imgur.com/8YlQp6A.jpeg", // Direct link representation
  title: "Assistant Engineer | IC Mask Designer",
  bio: [
    "Hi, I’m S.M. Samius Salehin — an Electrical and Electronic Engineering (EEE) graduate from Ahsanullah University of Science and Technology and currently working as an IC Mask Designer at ULKASEMI Pvt. Ltd., the leading semiconductor design company in Bangladesh.",
    "Engineering has always been my passion. I love turning ideas into real, working designs — from tiny circuits to complex chip layouts.",
    "At the same time, I’m also a writer who enjoys creating horror, thriller, and science fiction stories. Writing gives me the space to explore imagination, mystery, and emotion — the other side of logic.",
    "Salehin’s Territory is where I’ve tied both worlds together — my engineering projects and my stories — all in one place. It’s my little corner of creativity, logic, and curiosity."
  ],
  employment: [
    {
      role: "Assistant Engineer, IC Mask Design",
      company: "ULKASEMI Pvt LTD",
      location: "Dhaka, Bangladesh",
      period: "April 2024 - Present",
      description: "Working at the leading semiconductor design company in Bangladesh."
    }
  ],
  education: [
    {
      degree: "B.Sc. in EEE",
      institution: "Ahsanullah University of Science and Technology",
      period: "Passing Year: 2024",
      highlight: "CGPA: 3.741 / 4.00",
      major: "Major: Electronics"
    },
    {
      degree: "HSC",
      institution: "Dhaka Residential Model College",
      period: "Passing Year: 2019",
      highlight: "GPA: 4.67 / 5.00",
      board: "Board: Dhaka"
    },
    {
      degree: "SSC",
      institution: "Monipur High School And College",
      period: "Passing Year: 2017",
      highlight: "GPA: 5.00 / 5.00",
      board: "Board: Dhaka"
    }
  ],
  skills: [
    "Cadence (Virtuoso, Innovas, Genus)", "MATLAB", "Pspice", "LTspice", 
    "CodeBlocks", "AutoCAD", "Arduino IDE", "Proteus", "MS Office", 
    "Photo & Video Editing"
  ],
  contact: {
    email: "samius.salehin19@gmail.com",
    phone: "+8801779991857",
    linkedin: "https://www.linkedin.com/in/samius-salehin/",
    youtube: "https://www.youtube.com/@Salehinsterritory",
    facebook: "https://www.facebook.com/smsalehin19"
  }
};

// FIX: Added optional children to PageTransition props to resolve "children is missing" errors.
const PageTransition = ({ children }: { children?: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

// FIX: Added optional children to SectionHeader to handle both wrapping and self-closing usages.
const SectionHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="mb-8 border-b border-indigo-500/30 pb-4">
    <h2 className="font-serif text-3xl font-bold text-indigo-400 italic">{title}</h2>
    {subtitle && <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
    {children}
  </div>
);

const Home = () => (
  <PageTransition>
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="relative group">
        <div className="absolute -inset-2 bg-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <img 
          src="https://prnt.sc/K3gSS_RuDRID" 
          alt={PROFILE_DATA.name}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800?text=S.M.+Samius+Salehin' }}
          className="relative rounded-lg border-2 border-indigo-500/30 shadow-2xl object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
      </div>
      <div className="space-y-6">
        <h1 className="font-serif text-5xl font-bold text-white leading-tight">
          {PROFILE_DATA.name}
        </h1>
        <p className="text-xl text-indigo-400 font-semibold tracking-wide border-l-4 border-indigo-500 pl-4">
          {PROFILE_DATA.title}
        </p>
        <div className="space-y-4 text-slate-300 leading-relaxed font-light">
          {PROFILE_DATA.bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  </PageTransition>
);

const Professional = () => (
  <PageTransition>
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-12">
        <section>
          <SectionHeader title="Experience" subtitle="The Professional Ledger" />
          {PROFILE_DATA.employment.map((job, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-indigo-500/30 py-2">
              <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-indigo-500"></div>
              <h3 className="text-xl font-bold text-white">{job.role}</h3>
              <p className="text-indigo-400 font-medium">{job.company}</p>
              <p className="text-sm text-slate-500 italic mb-2">{job.period} | {job.location}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{job.description}</p>
            </div>
          ))}
        </section>

        <section>
          <SectionHeader title="Technical Arsenal" subtitle="Skills & Tools" />
          <div className="flex flex-wrap gap-2">
            {PROFILE_DATA.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-md hover:bg-indigo-500 hover:text-white transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-12">
        <section>
          <SectionHeader title="Academia" subtitle="Educational Background" />
          <div className="space-y-8">
            {PROFILE_DATA.education.map((edu, i) => (
              <div key={i} className="group">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{edu.degree}</h3>
                <p className="text-slate-400 text-sm">{edu.institution}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-slate-500 uppercase tracking-tighter">{edu.period}</span>
                  <span className="text-indigo-400 font-bold text-sm">{edu.highlight}</span>
                </div>
                {edu.major && <p className="text-xs text-indigo-500/70 mt-1">{edu.major}</p>}
                {edu.board && <p className="text-xs text-indigo-500/70 mt-1">{edu.board}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  </PageTransition>
);

const PlaceholderGrid = ({ type }: { type: 'Engineering' | 'Literature' }) => (
  <PageTransition>
    <div className="text-center py-20">
      <SectionHeader title={type} subtitle={`The ${type} Collection`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {[1, 2, 3].map(n => (
          <div key={n} className="aspect-[3/4] bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center group cursor-pointer hover:border-indigo-500 transition-all">
            <div className="text-slate-600 group-hover:text-indigo-400 transition-all text-center">
              <FiBriefcase size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-serif italic">Pending Publication</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-12 text-slate-500 italic max-w-xl mx-auto">
        "Content is currently being curated for the territory. Check back soon for detailed project schematics and thriller novel excerpts."
      </p>
    </div>
  </PageTransition>
);

const Contact = () => (
  <PageTransition>
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-slate-800/40 p-10 rounded-xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <FiMail size={120} />
        </div>
        
        <SectionHeader title="Contact Info" subtitle="Reach the Territory" />
        
        <div className="space-y-8 relative z-10">
          <div className="grid sm:grid-cols-2 gap-6">
            <a href={`mailto:${PROFILE_DATA.contact.email}`} className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-indigo-500 transition-all group">
              <div className="bg-indigo-500/20 p-3 rounded-full text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <FiMail size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                <p className="text-sm text-slate-200 truncate">{PROFILE_DATA.contact.email}</p>
              </div>
            </a>
            
            <a href={`tel:${PROFILE_DATA.contact.phone}`} className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-indigo-500 transition-all group">
              <div className="bg-green-500/20 p-3 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all">
                <FiPhone size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Phone</p>
                <p className="text-sm text-slate-200">{PROFILE_DATA.contact.phone}</p>
              </div>
            </a>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold border-b border-slate-700 pb-2">Social Connections</p>
            <div className="flex gap-4">
              <a href={PROFILE_DATA.contact.linkedin} target="_blank" className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                <FiLinkedin size={24} />
              </a>
              <a href={PROFILE_DATA.contact.youtube} target="_blank" className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-all">
                <FiYoutube size={24} />
              </a>
              <a href={PROFILE_DATA.contact.facebook} target="_blank" className="p-4 bg-indigo-600/10 border border-indigo-600/30 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
                <FiFacebook size={24} />
              </a>
            </div>
          </div>

          <div className="pt-6">
            <p className="text-xs text-slate-500 italic">"Based in Dhaka, Bangladesh. Open to global collaborations in IC design and storytelling."</p>
          </div>
        </div>
      </div>
    </div>
  </PageTransition>
);

const App = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Front Cover', path: '/', icon: <FiHome /> },
    { label: 'Engineering', path: '/engineering', icon: <FiCpu /> },
    { label: 'Literature', path: '/literature', icon: <FiBookOpen /> },
    { label: 'Professional', path: '/professional', icon: <FiBriefcase /> },
    { label: 'Contact', path: '/contact', icon: <FiMail /> },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-10 selection:bg-indigo-500 selection:text-white">
      {/* eBook Container */}
      <div className="w-full max-w-7xl ebook-container relative bg-page-bg rounded-xl page-shadow min-h-[85vh] flex flex-col md:flex-row overflow-hidden border-4 border-slate-800">
        
        {/* Navigation / Left Sidebar (Mobile Top) */}
        <nav className="w-full md:w-72 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700 p-8 flex flex-col justify-between z-20">
          <div>
            <div className="mb-12">
              <h2 className="font-serif text-2xl font-bold text-white italic">Salehin's</h2>
              <h2 className="font-serif text-3xl font-bold text-indigo-500 -mt-2">Territory</h2>
            </div>
            
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-indigo-400'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm tracking-wide">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-800 hidden md:block">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">Copyright © 2024</p>
            <p className="text-[10px] text-slate-600 italic">"Engineering Logic. Literary Imagination."</p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-page-bg">
          {/* Subtle Page Spine Highlight */}
          <div className="absolute inset-y-0 left-0 w-20 spine-gradient z-10 pointer-events-none opacity-50"></div>
          
          <div className="relative z-0 h-full overflow-y-auto p-8 md:p-16">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/engineering" element={<PlaceholderGrid type="Engineering" />} />
                <Route path="/literature" element={<PlaceholderGrid type="Literature" />} />
                <Route path="/professional" element={<Professional />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      {/* Background Decorative Element */}
      <div className="fixed bottom-0 right-0 -z-10 p-10 opacity-5 select-none pointer-events-none">
        <h1 className="text-[20rem] font-serif font-black italic text-indigo-500 leading-none">Territory</h1>
      </div>
    </div>
  );
};

export default App;
