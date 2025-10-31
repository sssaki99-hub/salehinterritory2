import React, { useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';
import CommentSection from '../components/CommentSection';
import { Comment, Rating, WritingCategory, Episode } from '../types';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { addComment, addRating } from '../supabaseClient';

type FontSize = 'text-base' | 'text-lg' | 'text-xl';

const LiteratureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const adminContext = useContext(AdminContext);
  
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>('text-lg');

  if (!adminContext) return null;
  const { writings, refetchAllData } = adminContext;
  
  const story = writings.find(w => w.id === id);

  if (!story) {
    return (
        <PageWrapper>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Story not found!</h1>
                <Link to="/literature" className="text-indigo-400 hover:underline mt-4 inline-block">Back to Literature</Link>
            </div>
        </PageWrapper>
    );
  }

  const isNovel = story.category === WritingCategory.Novel && Array.isArray(story.content);
  const episodes = isNovel ? (story.content as Episode[]) : [];

  const handleCommentSubmit = async (newComment: Omit<Comment, 'id' | 'timestamp'>) => {
    try {
        await addComment(newComment, story.id, 'writing');
        await refetchAllData();
    } catch (error) { console.error("Failed to submit comment:", error); alert("Error posting comment."); }
  };
  
  const handleRatingSubmit = async (newRating: Rating) => {
    try {
        await addRating(newRating, story.id, 'writing');
        await refetchAllData();
    } catch (error) { console.error("Failed to submit rating:", error); alert("Error submitting rating."); }
  };
  
  const fontSizes: FontSize[] = ['text-base', 'text-lg', 'text-xl'];
  const changeFontSize = (direction: 'increase' | 'decrease') => {
      const currentIndex = fontSizes.indexOf(fontSize);
      if (direction === 'increase' && currentIndex < fontSizes.length - 1) {
          setFontSize(fontSizes[currentIndex + 1]);
      }
      if (direction === 'decrease' && currentIndex > 0) {
          setFontSize(fontSizes[currentIndex - 1]);
      }
  }

  return (
    <PageWrapper>
      <article className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-indigo-400 text-center mb-4">{story.title}</h1>
        {isNovel && episodes.length > 0 && <h2 className="text-center text-2xl text-white font-serif mb-8">{episodes[currentEpisodeIndex]?.title}</h2>}
        
        <div className="bg-slate-800/50 p-4 rounded-lg mb-4 flex justify-center items-center gap-4">
            <span className="text-gray-300">Font Size:</span>
            <button onClick={() => changeFontSize('decrease')} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50" disabled={fontSize === 'text-base'}><FiZoomOut/></button>
            <span className="w-12 text-center">
                {fontSize === 'text-base' ? 'S' : fontSize === 'text-lg' ? 'M' : 'L'}
            </span>
            <button onClick={() => changeFontSize('increase')} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50" disabled={fontSize === 'text-xl'}><FiZoomIn/></button>
        </div>

        <div className={`prose prose-invert max-w-none text-gray-300 leading-relaxed select-none ${fontSize} transition-all duration-300`}>
          {isNovel && episodes.length > 0 ? (
              episodes[currentEpisodeIndex]?.content?.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
              ))
          ) : (
              (story.content as string || '').split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
          )}
        </div>
        
        {isNovel && episodes.length > 1 && (
            <div className="flex justify-between items-center mt-8">
                <button 
                    onClick={() => setCurrentEpisodeIndex(prev => prev - 1)} 
                    disabled={currentEpisodeIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-md disabled:opacity-50 hover:bg-slate-600"
                >
                    <FiChevronLeft /> Previous
                </button>
                <span>Episode {currentEpisodeIndex + 1} / {episodes.length}</span>
                <button 
                    onClick={() => setCurrentEpisodeIndex(prev => prev + 1)} 
                    disabled={currentEpisodeIndex === episodes.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-md disabled:opacity-50 hover:bg-slate-600"
                >
                    Next <FiChevronRight />
                </button>
            </div>
        )}

        {story.youtubeAudiobookUrl && (
            <div className="mt-12 text-center">
                <a href={story.youtubeAudiobookUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all">
                    Listen to the Audiobook on YouTube
                </a>
            </div>
        )}

        <CommentSection 
            comments={story.comments || []}
            ratings={story.ratings || []}
            onCommentSubmit={handleCommentSubmit}
            onRatingSubmit={handleRatingSubmit}
        />
      </article>
    </PageWrapper>
  );
};

export default LiteratureDetail;