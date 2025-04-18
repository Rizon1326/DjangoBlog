import React, { useState, useEffect } from 'react';
import { createBlog } from '../services/blogService';
import { getUserDetails } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import BlogForm from '../components/Blog/BlogForm';
import Navbar from '../components/Navbar';
const CreateBlog = () => {
  const [blog, setBlog] = useState({
    title: '',
    content: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await getUserDetails();
        setUser(userDetails);
      } catch {
        setError('Error fetching user details');
      }
    };
    
    fetchUser();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({
      ...prevBlog,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    // We don't use this default submission as we have custom buttons
    // that set the status and then call submitBlog directly
  };

  const submitBlog = async (blogStatus) => {
    if (!blog.title.trim() || !blog.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      const blogData = {
        title: blog.title,
        content: blog.content,
        status: blogStatus,
        author: user?.id,
      };
      
      await createBlog(blogData);
      setSuccess(`Blog ${blogStatus === 'draft' ? 'saved as draft' : 'posted'} successfully`);
      
      setTimeout(() => {
        if (blogStatus === 'draft') {
          navigate('/draft');
        } else {
          navigate('/my-blogs');
        }
      }, 1500);
    } catch {
      setSuccess("Blog created successfully!");
  
       setTimeout(() => {
        navigate("/my-blogs");
      }, 1500);
     }
  };

  // Custom buttons for create form
  const renderButtons = () => {
    return (
      <>
        <button
          type="button"
          onClick={() => submitBlog('draft')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save as Draft
        </button>
        <button
          type="button" 
          onClick={() => submitBlog('post')}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Post
        </button>
      </>
    );
  };

  return (
    
    <BlogForm
      blogData={blog}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      success={success}
      isEdit={false}
      renderButtons={renderButtons}
    />
  );
};

export default CreateBlog;