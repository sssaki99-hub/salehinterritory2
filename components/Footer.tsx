import React, { useContext } from 'react';
import { FaFacebook, FaLinkedin } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { AdminContext } from '../contexts/AdminContext';

const Footer: React.FC = () => {
  const adminContext = useContext(AdminContext);
  const footerContent = adminContext?.settings.footerContent;
  const contactDetails = adminContext?.settings.contactDetails;

  if (!footerContent || !contactDetails) return null;

  return (
    <footer className="bg-gray-900 border-t-2 border-primary-accent/20">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
        <div className="flex justify-center space-x-6 mb-4">
          <a href={`mailto:${contactDetails.email}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-accent transition-colors duration-300" aria-label="Email">
            <FiMail size={24} />
          </a>
          <a href={contactDetails.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-accent transition-colors duration-300" aria-label="Facebook">
            <FaFacebook size={24} />
          </a>
          <a href={contactDetails.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-accent transition-colors duration-300" aria-label="LinkedIn">
            <FaLinkedin size={24} />
          </a>
        </div>
        <p className="text-sm">{footerContent.copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;