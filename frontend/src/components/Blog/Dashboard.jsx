import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../services/authService";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getUserDetails();
        setUsername(userData.username);
        setUserId(userData.id);
      } catch {
        setError("Error fetching user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleMyBlogs = () => {
    navigate("/my-blogs", { state: { username, userId } });
  };

  const handleCreateBlog = () => {
    navigate("/create-blog");
  };

  const handleAllBlogs = () => {
    navigate("/allblog");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
              <span className="text-blue-600">Blog</span>
              <span className="text-gray-800">Sphere</span>
              <span className="text-yellow-500 ml-1">✎ᝰ</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-gray-600">
              Welcome, {loading ? "..." : username || "User"}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-6">
              Dashboard
            </h2>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              <span className="text-gray-600 text-lg md:text-xl lg:text-2xl mb-4">
                Welcome to your
              </span>
              <span className="text-blue-600 text-2xl md:text-3xl lg:text-4xl"> Blog</span>
              <span className="text-gray-800 text-2xl md:text-3xl lg:text-4xl">Sphere</span>
              <span className="text-yellow-500 text-2xl ml-1">✎ᝰ </span>

              <span className="text-gray-600 text-xl md:text-2xl lg:text-3xl mt-4">
                dashboard. What would you like to do today?
              </span>
            </h1>

            <div className="space-y-4 mt-6">
              <button
                onClick={handleMyBlogs}
                className="w-full py-3 px-4 bg-white border border-gray-300 shadow-sm rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 text-lg md:text-xl lg:text-2xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📄</span>
                  </div>
                  <span className="ml-3 font-medium text-gray-800">My Blogs</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={handleCreateBlog}
                className="w-full py-3 px-4 bg-white border border-gray-300 shadow-sm rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 text-lg md:text-xl lg:text-2xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-lg">✎</span>
                  </div>
                  <span className="ml-3 font-medium text-gray-800">Create Blog</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={handleAllBlogs}
                className="w-full py-3 px-4 bg-white border border-gray-300 shadow-sm rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 text-lg md:text-xl lg:text-2xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🔍</span>
                  </div>
                  <span className="ml-3 font-medium text-gray-800">All Blogs</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
