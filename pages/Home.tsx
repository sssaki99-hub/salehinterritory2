
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AdminContext } from '../contexts/AdminContext';
import PageWrapper from '../components/PageWrapper';
import CVDownloadButton from '../components/CVDownloadButton';

const Home: React.FC = () => {
  const adminContext = useContext(AdminContext);
  if (!adminContext) return null;
  const { settings } = adminContext;
  const { heroSection, aboutMe } = settings;

  return (
    <PageWrapper>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-20">
          <motion.h1 
            className="font-serif text-5xl md:text-7xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {heroSection?.title}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-indigo-400"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {heroSection?.subtitle}
          </motion.p>
        </section>

        {/* About Me Section */}
        <section className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="md:w-1/3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={aboutMe?.photoUrl} 
              alt="S.M. Samius Salehin" 
              className="rounded-full shadow-lg shadow-primary-accent/20 w-64 h-64 md:w-80 md:h-80 mx-auto object-cover border-4 border-primary-accent/50"
            />
          </motion.div>
          <motion.div 
            className="md:w-2/3"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-4xl font-bold text-indigo-400 mb-4">About Me</h2>
            {aboutMe?.bio.split('\n\n').map((paragraph, index) => (
               <p key={index} className="text-gray-300 leading-relaxed mb-4">
                 {paragraph}
               </p>
            ))}
            <CVDownloadButton />
          </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default Home;
