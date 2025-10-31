import React, { useContext } from 'react';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-12">
        <h2 className="font-serif text-3xl font-bold text-indigo-400 border-b-2 border-primary-accent/30 pb-2 mb-6">{title}</h2>
        {children}
    </section>
);


const Professional: React.FC = () => {
  const { workExperience, education, certificates, settings } = useContext(AdminContext)!;
  const fullName = settings?.aboutMe?.name;

  return (
    <PageWrapper>
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Professional Details</h1>
        {fullName && (
          <h2 className="mt-2 font-serif text-2xl md:text-3xl text-indigo-400">
            {fullName}
          </h2>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Section title="Work Experience">
            <div className="space-y-8">
                {workExperience.map(exp => (
                    <div key={exp.id}>
                        <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                        <p className="text-indigo-400 font-semibold">{exp.company} | {exp.period}</p>
                        <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                            {exp.description.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </Section>

        <Section title="Educational Background">
             {education.map(edu => (
                <div key={edu.id}>
                    <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                    {/* FIX: Corrected a typo from `exp.period` to `edu.period`. `exp` was out of scope. */}
                    <p className="text-indigo-400 font-semibold">{edu.institution} | {edu.period}</p>
                    <p className="text-gray-300 mt-2">{edu.details}</p>
                </div>
            ))}
        </Section>

        <Section title="Certificates">
            <div className="space-y-4">
            {certificates.map(cert => (
                <div key={cert.id}>
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">{cert.name}</a>
                    <p className="text-gray-400">{cert.issuer} | {cert.date}</p>
                </div>
            ))}
            </div>
        </Section>
      </div>
    </PageWrapper>
  );
};

export default Professional;