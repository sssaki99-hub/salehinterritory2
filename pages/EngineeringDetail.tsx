import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';
import CommentSection from '../components/CommentSection';
import { Comment, Rating } from '../types';

const EngineeringDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, setProjects } = useContext(AdminContext)!;

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
        <PageWrapper>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Project not found!</h1>
                <Link to="/engineering" className="text-indigo-400 hover:underline mt-4 inline-block">Back to Projects</Link>
            </div>
        </PageWrapper>
    );
  }

  const handleCommentSubmit = async (newComment: Omit<Comment, 'id' | 'timestamp'>) => {
    if (!project) return;
    const commentToAdd: Comment = {
        ...newComment,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    };
    setProjects(prevProjects => prevProjects.map(p => 
        p.id === project.id ? { ...p, comments: [...p.comments, commentToAdd] } : p
    ));
  };
  
  const handleRatingSubmit = async (newRating: Rating) => {
    if (!project) return;
    setProjects(prevProjects => prevProjects.map(p => 
        p.id === project.id ? { ...p, ratings: [...p.ratings, newRating] } : p
    ));
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-indigo-400 text-center mb-8">{project.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {project.images.map((img, index) => (
                <img key={index} src={img} alt={`${project.title} screenshot ${index+1}`} className="rounded-lg shadow-lg w-full object-cover" />
            ))}
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-6">
          {project.description.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>


        <div className="flex space-x-6">
            {project.demoVideoUrl && <a href={project.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold hover:underline">Watch Demo Video</a>}
            {project.pdfUrl && <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold hover:underline">View Detailed PDF</a>}
        </div>
        
        <CommentSection
            comments={project.comments || []}
            ratings={project.ratings || []}
            onCommentSubmit={handleCommentSubmit}
            onRatingSubmit={handleRatingSubmit}
        />
      </div>
    </PageWrapper>
  );
};

export default EngineeringDetail;