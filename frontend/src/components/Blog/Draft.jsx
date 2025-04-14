import React, { useEffect, useState } from "react";
import { getAuthToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { getUserDraftBlogs, updateBlogStatus } from "../../services/blogService";
import { formatDistanceToNow } from "date-fns";

const Draft = () => {
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDraftBlogs = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
          return;
        }

        // Use the new function to get draft blogs
        const response = await getUserDraftBlogs();
        setDraftBlogs(response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching drafts:", err);
        setError("Error fetching drafts. Please try again.");
        setLoading(false);
      }
    };

    fetchDraftBlogs();
  }, []);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = draftBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(draftBlogs.length / blogsPerPage);

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

  const handlePost = async (id) => {
    try {
      await updateBlogStatus(id, "post"); 
      setDraftBlogs(draftBlogs.filter(blog => blog.id !== id));
      alert("Blog published successfully!");
    } catch (err) {
      console.error("Error posting blog:", err);
      setError("Error publishing blog. Please try again.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-blog/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    );
  }

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
                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={() => handleEdit(blog.id)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePost(blog.id)}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 text-sm sm:text-base"
                  >
                    Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {draftBlogs.length > 0 && (
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
    </div>
  );
};

export default Draft;