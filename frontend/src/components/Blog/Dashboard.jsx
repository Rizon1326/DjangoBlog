import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getUserDetails } from '../../services/authService'; 

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

 
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = await getUserDetails(); 
        setUsername(userData.username); 
        setUserId(userData.id); 
    
      } catch  {
        setError('Error fetching user details');
      }
    };

    fetchUserDetails();
  }, []);

 
  // const handleNotifications = () => {
  //   navigate('/notifications');
  // };

  const handleMyBlogs = () => {
    navigate('/my-blogs', { state: { username, userId } }); 
  };

  const handleCreateBlog = () => {
    navigate('/create-blog');
  };

  const handleAllBlogs = () => {
    navigate('/allblog');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl mb-4">
          Thank you, {username ? username : 'User'}!
        </h1>
        {error && <div className="text-red-500">{error}</div>}

        <p className="text-gray-700 mb-4">You have successfully logged in. Choose an option below:</p>

        <div className="space-y-4">
          {/* <button
            onClick={handleNotifications}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Notifications
          </button> */}

          <button
            onClick={handleMyBlogs}
            className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600"
          >
            My Blogs
          </button>

          <button
            onClick={handleCreateBlog}
            className="w-full bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
          >
            Create Blog
          </button>

          <button
            onClick={handleAllBlogs}
            className="w-full bg-purple-500 text-white p-3 rounded hover:bg-purple-600"
          >
            All Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
