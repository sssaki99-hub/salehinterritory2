import React, { useState, useContext } from 'react';
import { FaStar } from 'react-icons/fa';
import { AdminContext } from '../contexts/AdminContext';
import { Comment, Rating } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  ratings: Rating[];
  onCommentSubmit: (newComment: Omit<Comment, 'id' | 'timestamp'>) => Promise<void>;
  onRatingSubmit: (newRating: Rating) => Promise<void>;
}

const StarRating: React.FC<{ onRatingSubmit: (rating: Rating) => Promise<void> }> = ({ onRatingSubmit }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [hover, setHover] = useState<number | null>(null);

    return (
        <div className="flex items-center space-x-2">
            <span className="text-gray-300">Rate this:</span>
            <div className="flex">
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                        <label key={index}>
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={async () => {
                                    setRating(ratingValue);
                                    await onRatingSubmit({ value: ratingValue });
                                    alert(`Thank you for your ${ratingValue}-star rating!`);
                                }}
                                className="hidden"
                            />
                            <FaStar
                                className="cursor-pointer"
                                color={ratingValue <= (hover || rating || 0) ? '#ffc107' : '#e4e5e9'}
                                size={25}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(null)}
                            />
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, ratings, onCommentSubmit, onRatingSubmit }) => {
  const adminContext = useContext(AdminContext);
  const [newComment, setNewComment] = useState({ author: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!adminContext) return null;
  const { settings } = adminContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.author && newComment.text) {
      setIsSubmitting(true);
      try {
        await onCommentSubmit(newComment);
        setNewComment({ author: '', text: '' });
      } catch (error) {
        console.error("Failed to submit comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const averageRating = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1) : 'N/A';

  return (
    <div className="mt-16 pt-8 border-t-2 border-primary-accent/20">
      <h2 className="font-serif text-3xl font-bold text-indigo-400 mb-6">Feedback & Community</h2>
      
      {settings.ratingsEnabled && (
        <div className="bg-slate-800 p-6 rounded-lg mb-8 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <span className="text-xl font-bold text-white">Average Rating: {averageRating}</span>
                    <span className="text-gray-400"> ({ratings.length} reviews)</span>
                </div>
                <StarRating onRatingSubmit={onRatingSubmit} />
            </div>
        </div>
      )}

      {settings.commentsEnabled && (
        <>
          <h3 className="text-2xl font-bold text-white mb-4">Comments ({comments.length})</h3>
          <div className="space-y-6 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-slate-800 p-4 rounded-lg">
                <p className="text-gray-300">"{comment.text}"</p>
                <p className="text-right text-sm text-indigo-400 mt-2">- {comment.author}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>}
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Leave a Comment</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-primary-accent focus:border-primary-accent"
                required
              />
              <textarea
                placeholder="Your Comment"
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-primary-accent focus:border-primary-accent"
                rows={4}
                required
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary-accent text-white font-bold py-2 px-4 rounded hover:bg-opacity-80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CommentSection;