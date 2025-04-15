import React, { useEffect, useState } from 'react';
import { getAuthToken, getUserDetails } from '../services/authService'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import { deleteBlog } from '../services/blogService';
import BlogDetail from '../components/Blog/BlogDetail';
import BlogForm from '../components/Blog/BlogForm'; // Import BlogForm component
import { formatDistanceToNow } from 'date-fns';

const MyBlog = () => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentUser, setCurrentUser] = useState({ id: userId, username: username });
  // Toast alert state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState(''); // 'success', 'error', 'warning'
  const [blogToDelete, setBlogToDelete] = useState(null);
   
  // Calculate pagination values
  const blogsPerPage = 6;
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
 
  useEffect(() => {
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

        const response = await fetch(`http://127.0.0.1:8000/blog/user/blogs/`, {
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
        setFilteredBlogs(data);
      } catch {
        setError('Error fetching blogs');
      }
    };

    fetchUserBlogs();
  }, [userId, username]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
    setCurrentPage(1);
  }, [searchTerm, blogs]);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReadMore = (blogId) => {
    const blog = blogs.find((b) => b.id === blogId);
    setFullBlog(blog);
  };

  const handleBack = () => {
    setFullBlog(null);
  };

  const handleEdit = (blog) => {
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
      const token = getAuthToken();
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/blog/${fullBlog.id}/edit/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editFormData.title,
          content: editFormData.content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update blog');
      }
      
      const updatedBlog = await response.json();
      
      const updatedBlogs = blogs.map(blog => {
        if (blog.id === fullBlog.id) {
          return updatedBlog;
        }
        return blog;
      });
      
      setBlogs(updatedBlogs);
      setFullBlog(updatedBlog);
      setIsEditing(false);
      setSuccess('Blog updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update blog');
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  // Show delete confirmation toast
  const handleDeleteConfirmation = (blog) => {
    setBlogToDelete(blog);
    setToastMessage('Are you sure you want to delete this blog?');
    setToastType('warning');
    setShowToast(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!blogToDelete) return;
    
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await deleteBlog(blogToDelete.id);
      setBlogs(blogs.filter(blog => blog.id !== blogToDelete.id));
      
      if (fullBlog && fullBlog.id === blogToDelete.id) {
        setFullBlog(null);
      }
      
      setShowToast(false);
      setBlogToDelete(null);
      
      // Show success toast
      setToastMessage('Blog deleted successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setError('Failed to delete blog');
      console.error(error);
      
      // Show error toast
      setToastMessage('Failed to delete blog');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setBlogToDelete(null);
    setShowToast(false);
  };

  const handleDraftClick = () => {
    navigate('/draft');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
      {/* Toast Alert */}
      {showToast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg flex items-center justify-between transition-all duration-300 ${
          toastType === 'success' ? 'bg-green-500 text-white' :
          toastType === 'error' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          <div className="flex items-center">
            {toastType === 'warning' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            {toastType === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toastType === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            <span>{toastMessage}</span>
          </div>
          
          {toastType === 'warning' && blogToDelete && (
            <div className="flex space-x-2 ml-4">
              <button 
                onClick={confirmDelete}
                className="bg-white text-blue-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-100"
              >
                Yes
              </button>
              <button 
                onClick={cancelDelete}
                className="bg-green-600 text- px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-700"
              >
                No
              </button>
            </div>
          )}
          
          {(toastType === 'success' || toastType === 'error') && (
            <button onClick={() => setShowToast(false)} className="ml-4 text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      
      <header className="text-center py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{currentUser.username}'s Blogs</h1>
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
          
          {/* Draft Blog Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleDraftClick}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Draft Blog
            </button>
          </div>
        </div>
      )}

      <div className="mt-2">
        {fullBlog ? (
          isEditing ? (
            <BlogForm
              blogData={editFormData}
              onChange={handleEditChange}
              onSubmit={handleEditSubmit}
              error={error}
              success={success}
              isEdit={true}
              onCancel={handleCancelEdit}
            />
          ) : (
            <BlogDetail 
              blog={fullBlog} 
              onBack={handleBack}
              currentUser={currentUser}
              showEditControls={true}
              onEdit={handleEdit}
              onDelete={(blogId) => {
                const blog = blogs.find(b => b.id === blogId);
                handleDeleteConfirmation(blog);
              }}
            />
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
                          onClick={() => handleDeleteConfirmation(blog)}
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

export default MyBlog;