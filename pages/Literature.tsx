import React, { useContext } from 'react';
import PageWrapper from '../components/PageWrapper';
import { Link } from 'react-router-dom';
import { AdminContext } from '../contexts/AdminContext';

const Literature: React.FC = () => {
  const adminContext = useContext(AdminContext);
  if (!adminContext) return null;
  const { writings } = adminContext;

  return (
    <PageWrapper>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-indigo-400 text-center mb-12">Literary Works</h1>
      {writings.length === 0 ? (
          <p className="text-center text-gray-400">No literary works have been added yet. Please add stories, novels, or poems via the admin panel.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {writings.map(writing => (
              <div key={writing.id} className="card-glass rounded-lg overflow-hidden shadow-lg shadow-primary-accent/10 group glow-on-hover">
                  <div className="relative">
                      <img src={writing.coverImageUrl} alt={writing.title} className="w-full h-96 object-cover" />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 flex flex-col justify-end p-6">
                          <div className="flex gap-2 mb-2">
                            <span className="inline-block bg-primary-accent/80 text-white text-xs font-bold px-2 py-1 rounded">{writing.category}</span>
                            <span className="inline-block bg-gray-500/80 text-white text-xs font-bold px-2 py-1 rounded">{writing.genre}</span>
                          </div>
                          <h3 className="font-serif text-3xl font-bold text-white mb-2">{writing.title}</h3>
                          <p className="text-gray-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto line-clamp-3">{writing.summary}</p>
                          <Link to={`/literature/${writing.id}`} className="text-indigo-400 font-bold self-start hover:underline">Read More &rarr;</Link>
                      </div>
                  </div>
              </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Literature;