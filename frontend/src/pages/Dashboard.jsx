import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../services/authService";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getBlogDetail
} from "../services/blogService";
import BlogDetail from "../components/Blog/BlogDetail";
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getUserDetails();
        setUsername(userData.username);
        setUserId(userData.id);
      } catch  {
        setError("Error fetching user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      setNotificationLoading(true);
      try {
        const notificationsData = await getNotifications();
        setNotifications(notificationsData);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setNotificationLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMyBlogs = () => {
    navigate("/my-blogs", { state: { username, userId } });
  };

  const handleCreateBlog = () => {
    navigate("/create-blog");
  };

  const handleAllBlogs = () => {
    navigate("/allblog");
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read first
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      }

      if (notification.blog) {
        try {
          const blog = await getBlogDetail(notification.blog);
          setSelectedBlog(blog);
        } catch (err) {
          console.error("Failed to fetch blog:", err);
          setError("Couldn't load the blog. Please try again.");
          setTimeout(() => navigate("/allblog"), 2000);
        }
      }
    } catch (err) {
      console.error("Error handling notification:", err);
      setError("Error processing notification");
    }
  };

  const handleBackFromBlog = () => {
    setSelectedBlog(null);
    setError("");
  };

  if (selectedBlog) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <BlogDetail 
          blog={selectedBlog} 
          onBack={handleBackFromBlog}
          currentUser={{ id: userId, username }}
          showEditControls={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-semibold">
              <span className="text-blue-600">Blog</span>
              <span className="text-gray-800">Sphere</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-gray-600">
              Welcome, {loading ? "..." : username || "User"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-6">
            <h2 className="text-2xl font-medium text-gray-800 mb-6">Dashboard</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                {error}
                <button 
                  onClick={() => setError("")}
                  className="float-right font-bold"
                >
                  ×
                </button>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Welcome back, {username || "User"}!
              </h1>
              <p className="text-gray-600 mt-2">
                What would you like to do today?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={handleMyBlogs}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600">📄</span>
                  </div>
                  <span className="font-medium">My Blogs</span>
                </div>
              </button>

              <button
                onClick={handleCreateBlog}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-600">✎</span>
                  </div>
                  <span className="font-medium">Create Blog</span>
                </div>
              </button>

              <button
                onClick={handleAllBlogs}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <span className="text-purple-600">🔍</span>
                  </div>
                  <span className="font-medium">All Blogs</span>
                </div>
              </button>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notificationLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No notifications to display
                </div>
              ) : (
                <ul className="space-y-2">
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        notification.is_read 
                          ? 'bg-gray-50' 
                          : 'bg-blue-50 border-l-4 border-blue-500'
                      } hover:bg-opacity-80`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{notification.message}</p>
                          {notification.blog && (
                            <p className="text-sm text-blue-600 mt-1">
                              Click to view blog
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at))} ago
                          </p>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="text-xs text-blue-600 mt-1 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;