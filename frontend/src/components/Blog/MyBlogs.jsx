import React, { useEffect, useState } from 'react';
import { getAuthToken, getUserDetails } from '../../services/authService'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import { formatDistanceToNow } from 'date-fns';
import { deleteBlog, getComments, createComment, replyToComment } from '../../services/blogService';

const MyBlogs = () => {
  const location = useLocation(); 
  const navigate = useNavigate();
  const { userId, username } = location.state || {};
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fullBlog, setFullBlog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: ''
  });
  const [success, setSuccess] = useState('');
  
  // Search-related state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  
  // Comment-related state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyData, setReplyData] = useState({ parentId: null, content: '' });
  const [currentUser, setCurrentUser] = useState({ id: userId, username: username });
  const [commentError, setCommentError] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(null);
   
  // Calculate pagination values
  const blogsPerPage = 6;
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
 
  useEffect(() => {
    // If user details weren't passed via location state, fetch them
    const fetchUserDetails = async () => {
      if (!userId || !username) {
        try {
          const token = getAuthToken();
          if (token) {
            const userDetails = await getUserDetails(token);
            setCurrentUser(userDetails);
          }
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      }
    };
    
    fetchUserDetails();
  }, [userId, username]);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        const token = getAuthToken(); 
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await fetch(`http://localhost:8000/blog/user/blogs/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        setBlogs(data);
        setFilteredBlogs(data); // Initialize filtered blogs with all blogs
      } catch {
        setError('Error fetching blogs');
      }
    };

    fetchUserBlogs();
  }, [userId, username]);

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
          const token = getAuthToken(); 
          if (!token) {
            setCommentError('Authentication token not found');
            return;
          }

          const response = await getComments(fullBlog.id);
          
          // Transform flat comments into a nested structure
          const transformCommentsToTree = (comments) => {
            const commentMap = {};
            const rootComments = [];
            
            // First pass: Create a map of all comments
            comments.forEach(comment => {
              commentMap[comment.id] = {
                ...comment,
                replies: []
              };
            });
            
            // Second pass: Build the tree structure
            comments.forEach(comment => {
              if (comment.parent_id) {
                // This is a reply, add it to parent's replies
                if (commentMap[comment.parent_id]) {
                  commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
                }
              } else {
                // This is a root comment
                rootComments.push(commentMap[comment.id]);
              }
            });
            
            return rootComments;
          };
          
          const treeComments = transformCommentsToTree(response);
          setComments(treeComments);
        } catch (error) {
          setCommentError('Error fetching comments');
          console.error(error);
        }
      }
    };

    fetchComments();
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

  const handleReadMore = (blogId) => {
    const blog = blogs.find((b) => b.id === blogId);
    setFullBlog(blog);
  };

  const handleEdit = (blog) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    setEditFormData({
      title: blog.title,
      content: blog.content
    });
    setFullBlog(blog);
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      // const updatedBlog = await editBlog(fullBlog.id, editFormData);
      const updatedBlogs = blogs.map(blog => {
        if (blog.id === fullBlog.id) {
          return {
            ...blog,
            title: editFormData.title,
            content: editFormData.content,
            updated_at: new Date().toISOString()
          };
        }
        return blog;
      });
      
      setBlogs(updatedBlogs);
      
      // Update full blog view with edited content
      setFullBlog({
        ...fullBlog,
        title: editFormData.title,
        content: editFormData.content,
        updated_at: new Date().toISOString()
      });
      
      setIsEditing(false);
      setSuccess('Blog updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Failed to update blog');
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleDelete = async (blogId) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(blogId);
        setBlogs(blogs.filter(blog => blog.id !== blogId));
        if (fullBlog && fullBlog.id === blogId) {
          setFullBlog(null);
        }
      } catch (error) {
        setError('Failed to delete blog');
        console.error(error);
      }
    }
  };

  // Comment handling functions
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    try {
      const data = { 
        content: newComment,
        userId: currentUser.id,
        author: currentUser.username
      };
      await createComment(fullBlog.id, data);
      setNewComment('');
      setCommentError('');
      // Re-fetch comments after posting
      const response = await getComments(fullBlog.id);
      
      // Transform to tree structure
      const transformCommentsToTree = (comments) => {
        const commentMap = {};
        const rootComments = [];
        
        comments.forEach(comment => {
          commentMap[comment.id] = { ...comment, replies: [] };
        });
        
        comments.forEach(comment => {
          if (comment.parent_id) {
            if (commentMap[comment.parent_id]) {
              commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
            }
          } else {
            rootComments.push(commentMap[comment.id]);
          }
        });
        
        return rootComments;
      };
      
      const treeComments = transformCommentsToTree(response);
      setComments(treeComments);
    } catch (error) {
      setCommentError('Failed to post comment');
      console.error(error);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    if (!replyData.content.trim()) {
      setCommentError('Reply cannot be empty');
      return;
    }
    try {
      const data = { 
        content: replyData.content,
        userId: currentUser.id,
        author: currentUser.username,
        parent_id: commentId
      };
      await replyToComment(fullBlog.id, commentId, data);
      setReplyData({ parentId: null, content: '' });
      setShowReplyForm(null);
      
      // Re-fetch comments after replying
      const response = await getComments(fullBlog.id);
      
      // Transform to tree structure
      const transformCommentsToTree = (comments) => {
        const commentMap = {};
        const rootComments = [];
        
        comments.forEach(comment => {
          commentMap[comment.id] = { ...comment, replies: [] };
        });
        
        comments.forEach(comment => {
          if (comment.parent_id) {
            if (commentMap[comment.parent_id]) {
              commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
            }
          } else {
            rootComments.push(commentMap[comment.id]);
          }
        });
        
        return rootComments;
      };
      
      const treeComments = transformCommentsToTree(response);
      setComments(treeComments);
    } catch (error) {
      setCommentError('Failed to post reply');
      console.error(error);
    }
  };

  // Recursive component for rendering comments and their replies
  const CommentTree = ({ comment, depth = 0 }) => {
    return (
      <div className={`${depth > 0 ? 'ml-6 mt-3 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex justify-between">
            <h4 className="font-semibold text-gray-800">{comment.author}</h4>
            <span className="text-xs text-gray-500">
              {comment.created_at && formatDistanceToNow(new Date(comment.created_at))} ago
            </span>
          </div>
          <p className="text-gray-600 mt-1">{comment.content}</p>
          
          <button 
            onClick={() => {
              setShowReplyForm(showReplyForm === comment.id ? null : comment.id);
              setReplyData({ parentId: comment.id, content: '' });
            }}
            className="text-blue-500 hover:text-blue-700 text-sm mt-2"
          >
            {showReplyForm === comment.id ? 'Cancel' : 'Reply'}
          </button>
          
          {showReplyForm === comment.id && (
            <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-3">
              <textarea
                value={replyData.content}
                onChange={(e) => setReplyData({ ...replyData, content: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={`Reply to ${comment.author}`}
                disabled={!currentUser.id}
              ></textarea>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 mt-2 text-sm"
                disabled={!currentUser.id}
              >
                Submit Reply
              </button>
            </form>
          )}
        </div>
        
        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-2">
            {comment.replies.map(reply => (
              <CommentTree key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="text-center py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{username}'s Blogs</h1>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-500 mt-2">{success}</div>}
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
          {filteredBlogs.length === 0 && searchTerm && (
            <p className="text-gray-500 mt-2">No blogs found matching "{searchTerm}"</p>
          )}
        </div>
      )}

      <div className="mt-2">
        {fullBlog ? (
          isEditing ? (
            <div className="bg-white p-6 rounded-md shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Blog</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blog title"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={editFormData.content}
                    onChange={handleEditChange}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Blog content"
                  ></textarea>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Update Blog
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="min-h-screen bg-gray-100">
              <div className="bg-white p-6 rounded-md shadow-md w-4/5 mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">{fullBlog.title}</h2>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleEdit(fullBlog)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(fullBlog.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-2">{fullBlog.content}</p>
                
                <p className="text-gray-500 text-sm mt-4">
                  <strong>Created:</strong> {formatDistanceToNow(new Date(fullBlog.created_at))} ago
                </p>
                <p className="text-gray-500 text-sm">
                  <strong>Updated:</strong> {formatDistanceToNow(new Date(fullBlog.updated_at))} ago
                </p>
                
                <div className="flex justify-start items-center mt-6">
                  <button
                    onClick={() => setFullBlog(null)}
                    className="text-blue-500 hover:text-blue-600 text-sm sm:text-base"
                  >
                    Back to My Blogs
                  </button>
                </div>
                
                {/* Comments Section */}
                <div className="mt-10 border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>
                  {commentError && <div className="text-red-500 mb-4">{commentError}</div>}
                  
                  {currentUser.username ? (
                    <p className="text-gray-600 mb-2">Commenting as: {currentUser.username}</p>
                  ) : (
                    <p className="text-red-500 mb-2">Please log in to comment</p>
                  )}
                  
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a comment"
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
                        <CommentTree key={comment.id} comment={comment} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <div>
            {currentBlogs.length === 0 ? (
              searchTerm ? (
                <p className="text-center text-gray-500 text-lg">No blogs found matching "{searchTerm}"</p>
              ) : (
                <p className="text-center text-gray-500 text-lg">No blogs available</p>
              )
            ) : (
              <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white p-6 rounded-md shadow-md hover:shadow-lg transition duration-300"
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">{blog.title}</h2>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">{blog.content.slice(0, 100)}...</p>
                    <div className="text-sm text-gray-500 mt-2">
                      <p><strong>Created:</strong> {formatDistanceToNow(new Date(blog.created_at))} ago</p>
                      <p><strong>Updated:</strong> {formatDistanceToNow(new Date(blog.updated_at))} ago</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleReadMore(blog.id)}
                        className="text-blue-500 hover:text-blue-600 text-sm sm:text-base"
                      >
                        Read More
                      </button>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(blog)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
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

export default MyBlogs;