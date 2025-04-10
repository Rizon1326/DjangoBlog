import React, { useState, useEffect } from 'react';
import { createBlog } from '../../services/blogService'; 
import { getUserDetails } from '../../services/authService'; 
import { useNavigate } from 'react-router-dom';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await getUserDetails();
        setUser(userDetails);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Error fetching user details');
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e, status) => {
    e.preventDefault();

    try {
      const blogData = {
        title,
        content,
        status,
        author: user.id, // Use logged-in user id
      };
      await createBlog(blogData);
      if (status === 'draft') {
        navigate('/draft'); // Navigate to drafts if the blog is in draft state
      } else {
        navigate('/my-blogs'); // Navigate to posted blogs if the blog is posted
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Error creating blog');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow-md">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">Create New Blog</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={(e) => handleSubmit(e, status)}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter blog title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Write your blog content here..."
              required
            ></textarea>
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              onClick={() => setStatus('draft')}
            >
              Make as Draft
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => setStatus('post')}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
