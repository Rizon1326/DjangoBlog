import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../services/authService';
import { formatDistanceToNow } from 'date-fns';

const Comments = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [commentMap, setCommentMap] = useState({});
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllComments();
  }, [blogId]);

  const fetchAllComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://blogsphere-back.onrender.com/blog/${blogId}/comments/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      
      organizeComments(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
      setLoading(false);
    }
  };

  const organizeComments = (commentsData) => {
    const map = {};
    commentsData.forEach(comment => {
      map[comment.id] = {
        ...comment,
        childComments: []
      };
    });
    
    const rootComments = [];
    commentsData.forEach(comment => {
      if (comment.parent_comment === null) {
        rootComments.push(map[comment.id]);
      } else {
        if (map[comment.parent_comment]) {
          map[comment.parent_comment].childComments.push(map[comment.id]);
        }
      }
    });
    
    setCommentMap(map);
    setComments(rootComments);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to comment');
      return;
    }
    
    try {
      const response = await fetch(`https://blogsphere-back.onrender.com/blog/${blogId}/comments/make/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      setNewComment('');
      setError('');
      
      fetchAllComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    }
  };

  const handleReplySubmit = async (commentId) => {
    const content = replyContent[commentId];
    
    if (!content || !content.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    
    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to reply');
      return;
    }
    
    try {
      const response = await fetch(`https://blogsphere-back.onrender.com/blog/${blogId}/comments/${commentId}/reply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        throw new Error('Failed to post reply');
      }
      
      setReplyContent(prev => ({...prev, [commentId]: ''}));
      setReplyingTo(null);
      setError('');
      
      fetchAllComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      setError('Failed to post reply');
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);
  };
  const handleReplyChange = (commentId, value) => {
    setReplyContent(prev => ({...prev, [commentId]: value}));
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const maxDepth = 5;
    const actualDepth = Math.min(depth, maxDepth);
    
    const borderColors = [
      'border-blue-500',
      'border-green-500',
      'border-purple-500', 
      'border-red-500',
      'border-amber-500'
    ];
    
    const bgColors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-amber-500'
    ];
    
    const getMarginClass = (depth) => {
      if (depth === 0) return '';
      const margins = ['ml-4', 'ml-8', 'ml-12', 'ml-16', 'ml-20'];
      return margins[Math.min(depth - 1, 4)]; // Max at ml-20
    };
    
    return (
      <div className={`mb-4 ${getMarginClass(depth)}`}>
        <div className={`border-l-4 ${borderColors[actualDepth % 5]} pl-4 py-2`}>
          <div className="bg-white p-4 rounded-md shadow-sm">
            {/* Comment header */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${bgColors[actualDepth % 5]} flex items-center justify-center mr-2`}>
                  <span className="text-sm font-bold text-white">
                    {comment.author?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <h4 className="font-semibold">{comment.author || 'Anonymous'}</h4>
              </div>
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </span>
            </div>
            
            {/* Comment content */}
            <p className="text-gray-800 mb-3">{comment.content}</p>
            
            {/* Comment actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleReplyClick(comment.id)} 
                className="text-blue-500 text-sm hover:text-blue-700"
              >
                {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
              </button>
            </div>
            
            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <textarea
                  value={replyContent[comment.id] || ''}
                  onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your reply..."
                  rows="3"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => handleReplySubmit(comment.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Display child comments/replies */}
        {comment.childComments && comment.childComments.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.childComments.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                depth={actualDepth + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {/* Comment form */}
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your comment..."
          rows="4"
        />
        <div className="flex justify-end mt-2">
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Post Comment
          </button>
        </div>
      </form>
      
      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default Comments;