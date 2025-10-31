import React, { useContext, useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { AdminContext } from '../contexts/AdminContext';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiLinkedin } from 'react-icons/fi';
import { addMessage } from '../supabaseClient';

const Contact: React.FC = () => {
  const { settings, refetchAllData } = useContext(AdminContext)!;
  const contactDetails = settings.contactDetails;
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
        await addMessage(formData);
        await refetchAllData(); // Refetch messages for admin panel
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
        setError('Failed to send message. Please try again later.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const contactItems = [
    { icon: <FiMail />, text: contactDetails.email, href: `mailto:${contactDetails.email}` },
    { icon: <FiPhone />, text: contactDetails.phone, href: `tel:${contactDetails.phone}` },
    { icon: <FiMapPin />, text: contactDetails.location, href: '#' },
    { icon: <FiFacebook />, text: 'Facebook', href: contactDetails.facebook },
    { icon: <FiLinkedin />, text: 'LinkedIn', href: contactDetails.linkedin },
  ];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-indigo-400 text-center mb-12">Get In Touch</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold text-white">Contact Information</h2>
                <p className="text-gray-400">Feel free to reach out through any of the channels below or use the contact form. I'm always open to discussing new projects, creative ideas, or opportunities.</p>
                <div className="space-y-4">
                    {contactItems.map((item, index) => (
                        <a key={index} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 text-gray-300 hover:text-indigo-400 transition-colors">
                            <span className="text-primary-accent">{item.icon}</span>
                            <span>{item.text}</span>
                        </a>
                    ))}
                </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 card-glass p-8 rounded-lg shadow-lg shadow-primary-accent/10"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                  className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-accent focus:border-primary-accent sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email" name="email" id="email" value={formData.email} onChange={handleChange} required
                  className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-accent focus:border-primary-accent sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                <textarea
                  name="message" id="message" rows={4} value={formData.message} onChange={handleChange} required
                  className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-accent focus:border-primary-accent sm:text-sm"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-accent hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-accent transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {isSubmitted && <p className="text-green-400 text-center mt-4">Thank you for your message! I'll get back to you soon.</p>}
              {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </motion.form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;