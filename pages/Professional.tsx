import React, { useContext } from 'react';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';
import { Skill } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-12">
        <h2 className="font-serif text-3xl font-bold text-indigo-400 border-b-2 border-primary-accent/30 pb-2 mb-6">{title}</h2>
        {children}
    </section>
);


const Professional: React.FC = () => {
  const adminContext = useContext(AdminContext);
  if (!adminContext) return null;
  const { workExperience, education, certificates, skills, settings } = adminContext;
  const fullName = settings?.aboutMe?.name;

  const groupedSkills = skills.reduce((acc, skill) => {
    const { category } = skill;
    if (!acc[category]) {
        acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

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
        {workExperience.length > 0 && (
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
        )}
        
        {skills.length > 0 && (
          <Section title="Skills">
              <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([category, skillList]) => (
                      <div key={category}>
                          <h3 className="text-xl font-bold text-white mb-3">{category}</h3>
                          <div className="flex flex-wrap gap-2">
                              {skillList.map(skill => (
                                  <span key={skill.id} className="bg-slate-700 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">
                                      {skill.name}
                                  </span>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Educational Background">
              {education.map(edu => (
                  <div key={edu.id} className="mb-6 last:mb-0">
                      <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                      <p className="text-indigo-400 font-semibold">{edu.institution} | {edu.period}</p>
                      <p className="text-gray-300 mt-2">{edu.details}</p>
                  </div>
              ))}
          </Section>
        )}

        {certificates.length > 0 && (
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
        )}
      </div>
    </PageWrapper>
  );
};

export default Professional;