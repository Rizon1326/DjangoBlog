import React, { useEffect, useState } from "react";
import { getAuthToken, getUserDetails } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { getBlogs, updateBlogStatus } from "../../services/blogService";
import { formatDistanceToNow } from "date-fns";

const DraftBlogs = () => {
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDraftBlogs = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const userDetails = getUserDetails(); // Get logged-in user details
        const userId = userDetails.id;

        const response = await getBlogs("draft", userId); // Pass userId to filter by user and draft status
        setDraftBlogs(response);
      } catch {
        setError("Error fetching drafts");
      }
    };

    fetchDraftBlogs();
  }, []);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = draftBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

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

  const handlePost = async (id) => {
    try {
      await updateBlogStatus(id, "post"); // Update the blog status to 'post'
      navigate("/my-blogs");
    } catch {
      setError("Error posting blog");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow-md">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-blue-600 mb-6">
          Draft Blogs
        </h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {currentBlogs.length === 0 ? (
          <p className="text-center text-gray-600">No drafts available</p>
        ) : (
          <div className="space-y-4">
            {currentBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white p-6 rounded-md shadow-md hover:shadow-lg transition duration-300"
              >
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
                  {blog.title}
                </h3>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {blog.content.slice(0, 100)}...
                </p>
                <div className="text-sm text-gray-500 mt-2">
                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDistanceToNow(new Date(blog.created_at))} ago
                  </p>
                  <p>
                    <strong>Updated:</strong>{" "}
                    {formatDistanceToNow(new Date(blog.updated_at))} ago
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handlePost(blog.id)}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 text-sm sm:text-base"
                  >
                    Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentBlogs.length > 0 && (
        <div className="flex justify-center mt-6 gap-6">
          <button
            onClick={handlePrev}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 text-sm sm:text-base"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 text-sm sm:text-base"
            disabled={currentBlogs.length < blogsPerPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DraftBlogs;
