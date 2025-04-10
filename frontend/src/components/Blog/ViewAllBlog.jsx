import React, { useEffect, useState } from 'react';
import { getBlogs } from '../../services/blogService'; 

const ViewAllBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fullBlog, setFullBlog] = useState(null);

  const blogsPerPage = 4;

  useEffect(() => {
   
    const fetchBlogs = async () => {
      try {
        const data = await getBlogs(); 
        setBlogs(data);
      } catch  {
        setError('Error fetching blogs');
      }
    };
    fetchBlogs();
  }, []);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const handleNext = () => {
    if (currentBlogs.length === blogsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Show the full blog content
  const handleReadMore = (blogId) => {
    const blog = blogs.find((b) => b.id === blogId);
    setFullBlog(blog);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-blue-600">All Blogs</h1>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </header>

      <div className="mt-6">
        {fullBlog ? (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">{fullBlog.title}</h2>
            <p className="text-gray-600">{fullBlog.content}</p>
            <button
              onClick={() => setFullBlog(null)}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Back to All Blogs
            </button>
          </div>
        ) : (
          <div>
            {currentBlogs.length === 0 ? (
              <p>No blogs available</p>
            ) : (
              <div className="space-y-4">
                {currentBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition duration-300"
                  >
                    <h2 className="text-xl font-semibold text-gray-800">{blog.title}</h2>
                    <p className="text-gray-600">{blog.content.slice(0, 100)}...</p>
                    <button
                      onClick={() => handleReadMore(blog.id)}
                      className="mt-4 text-blue-500 hover:text-blue-600"
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

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          disabled={currentBlogs.length < blogsPerPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ViewAllBlog;
