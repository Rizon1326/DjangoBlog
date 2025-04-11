import React, { useEffect, useState } from 'react';
import { getBlogs, getComments, createComment, replyToComment } from '../../services/blogService'; 
import { getAuthToken, getUserDetails } from '../../services/authService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ViewAllBlog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fullBlog, setFullBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  
  // Comment-related state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyData, setReplyData] = useState({ parentId: null, content: '' });
  const [currentUser, setCurrentUser] = useState({ id: null, username: null });
  const [commentError, setCommentError] = useState('');
  // Calculate pagination values
  const blogsPerPage = 6;
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);


  

  // Fetch user details if logged in
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const userDetails = await getUserDetails(token);
          setCurrentUser(userDetails);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs(); 
        setBlogs(data);
        setFilteredBlogs(data);
      } catch {
        setError('Error fetching blogs');
      }
    };
    fetchBlogs();
  }, []);

  // Filter blogs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
    // Reset to first page when search term changes
    setCurrentPage(1);
  }, [searchTerm, blogs]);

  // Fetch comments when a blog is selected for full view
  useEffect(() => {
    const fetchComments = async () => {
      if (fullBlog) {
        try {
          const response = await getComments(fullBlog.id);
          setComments(response);
        } catch (error) {
          setCommentError('Error fetching comments');
          console.error(error);
        }
      }
    };

    if (fullBlog) {
      fetchComments();
    }
  }, [fullBlog]);

  
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show the full blog content
  const handleReadMore = (blogId) => {
    const blog = blogs.find((b) => b.id === blogId);
    setFullBlog(blog);
  };

  // Comment handling functions
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = getAuthToken();
    if (!token) {
      // Redirect to login
      navigate('/login', { state: { redirectAfterLogin: `/blog/${fullBlog.id}` } });
      return;
    }
    
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    try {
      const data = { 
        content: newComment,
        userId: currentUser.id,  // Keep userId for backend processing
        author: currentUser.username  // Use username for display
      };
      await createComment(fullBlog.id, data);
      setNewComment('');
      setCommentError('');
      // Re-fetch comments after posting
      const response = await getComments(fullBlog.id);
      setComments(response);
    } catch (error) {
      setCommentError('Failed to post comment');
      console.error(error);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = getAuthToken();
    if (!token) {
      // Redirect to login
      navigate('/login', { state: { redirectAfterLogin: `/blog/${fullBlog.id}` } });
      return;
    }
    
    if (!replyData.content.trim()) {
      setCommentError('Reply cannot be empty');
      return;
    }
    
    try {
      const data = { 
        content: replyData.content,
        userId: currentUser.id,  // Keep userId for backend processing
        author: currentUser.username  // Use username for display
      };
      await replyToComment(fullBlog.id, commentId, data);
      setReplyData({ parentId: null, content: '' });
      // Re-fetch comments after replying
      const response = await getComments(fullBlog.id);
      setComments(response);
    } catch (error) {
      setCommentError('Failed to post reply');
      console.error(error);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { 
      state: { redirectAfterLogin: fullBlog ? `/blog/${fullBlog.id}` : '/blogs' } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600">All Blogs</h1>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </header>

      {!fullBlog && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs by title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setSearchTerm('')}
            >
              {searchTerm && 'X'}
            </button>
          </div>
          {filteredBlogs.length === 0 && (
            <p className="text-gray-500 mt-2">No blogs found matching "{searchTerm}"</p>
          )}
        </div>
      )}

      <div className="mt-6">
        {fullBlog ? (
          <div className="bg-white p-6 rounded-md shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">{fullBlog.title}</h2>
            <p className="text-gray-600 mt-4">{fullBlog.content}</p>
            <p className="text-gray-500 text-sm mt-4">
              <strong>Created:</strong> {formatDistanceToNow(new Date(fullBlog.created_at))} ago
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Updated:</strong> {formatDistanceToNow(new Date(fullBlog.updated_at))} ago
            </p>
            <button
              onClick={() => setFullBlog(null)}
              className="mt-4 text-blue-500 hover:text-blue-600 text-sm sm:text-base"
            >
              Back to All Blogs
            </button>
            
            {/* Comments Section */}
            <div className="mt-10 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>
              {commentError && <div className="text-red-500 mb-4">{commentError}</div>}
              
              {currentUser.username ? (
                <div className="mb-2">
                  <p className="text-gray-600">Commenting as: {currentUser.username}</p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-gray-700 mb-2">Please log in to comment</p>
                  <button 
                    onClick={handleLoginRedirect}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Log In
                  </button>
                </div>
              )}
              
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={currentUser.id ? "Add a comment" : "Log in to comment"}
                  disabled={!currentUser.id}
                ></textarea>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2"
                  disabled={!currentUser.id}
                >
                  Post Comment
                </button>
              </form>
              
              {comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h4 className="font-semibold text-gray-800">{comment.author}</h4>
                      <p className="text-gray-600 mt-1">{comment.content}</p>
                      
                      <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-3">
                        <textarea
                          value={replyData.parentId === comment.id ? replyData.content : ''}
                          onChange={(e) => setReplyData({ parentId: comment.id, content: e.target.value })}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder={currentUser.id ? "Reply to this comment" : "Log in to reply"}
                          disabled={!currentUser.id}
                        ></textarea>
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 mt-2 text-sm"
                          disabled={!currentUser.id}
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {currentBlogs.length === 0 ? (
              searchTerm ? (
                <p className="text-center text-gray-500 text-lg">No blogs found matching your search</p>
              ) : (
                <p className="text-center text-gray-500 text-lg">No blogs available</p>
              )
            ) : (
              <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">{blog.title}</h2>
                    <p className="text-gray-600 mt-2">{blog.content.slice(0, 100)}...</p>
                    <div className="text-sm text-gray-500 mt-2">
                      <p><strong>Created:</strong> {formatDistanceToNow(new Date(blog.created_at))} ago</p>
                      <p><strong>Updated:</strong> {formatDistanceToNow(new Date(blog.updated_at))} ago</p>
                    </div>
                    <button
                      onClick={() => handleReadMore(blog.id)}
                      className="mt-4 text-blue-500 hover:text-blue-600 text-sm sm:text-base"
                    >
                      Read More
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!fullBlog && filteredBlogs.length > 0 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            className={`px-4 py-2 rounded-md text-sm sm:text-base ${
              currentPage > 1 
                ? "bg-blue-500 text-white hover:bg-blue-600" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="self-center text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={handleNext}
            className={`px-4 py-2 rounded-md text-sm sm:text-base ${
              currentPage < totalPages 
                ? "bg-blue-500 text-white hover:bg-blue-600" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewAllBlog;