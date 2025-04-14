import React, { useEffect, useState } from 'react';
import { getBlogs } from '../services/blogService'; 
import { getAuthToken, getUserDetails } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import BlogDetail from '../components/Blog/BlogDetail';
import { formatDistanceToNow } from 'date-fns';

const ViewAllBlog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fullBlog, setFullBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentUser, setCurrentUser] = useState({ id: null, username: null });
  
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
          <BlogDetail 
            blog={fullBlog} 
            onBack={handleBack}
            currentUser={currentUser}
          />
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