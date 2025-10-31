import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';

const Engineering: React.FC = () => {
  const { projects } = useContext(AdminContext)!;

  return (
    <PageWrapper>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-indigo-400 text-center mb-12">Engineering Projects</h1>
      {projects.length === 0 ? (
        <p className="text-center text-gray-400">No projects have been added yet. Please add projects via the admin panel.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
              <Link to={`/engineering/${project.id}`} key={project.id} className="block card-glass rounded-lg overflow-hidden shadow-lg shadow-primary-accent/10 glow-on-hover">
                  <img src={project.images[0]} alt={project.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                      <h3 className="font-serif text-2xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                      <span className="text-indigo-400 font-bold">View Details &rarr;</span>
                  </div>
              </Link>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Engineering;